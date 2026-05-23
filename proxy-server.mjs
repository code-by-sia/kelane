/**
 * Kelane CORS Proxy — proxy-server.mjs
 *
 * Strips X-Frame-Options / CSP headers and injects a <base> tag so any site
 * can be loaded inside an iframe without embedding restrictions.
 *
 * Usage:
 *   node proxy-server.mjs          # starts on port 3001
 *   PORT=8080 node proxy-server.mjs
 *
 * Then load any page:
 *   http://localhost:3001/?url=https://www.bbcgoodfood.com/recipes/butter-chicken
 */

import http from "http";
import https from "https";
import { URL } from "url";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

// Headers to strip from the upstream response
const STRIP_HEADERS = new Set([
  "x-frame-options",
  "content-security-policy",
  "content-security-policy-report-only",
  "x-content-type-options",
  "strict-transport-security",
]);

const server = http.createServer((req, res) => {
  // Always allow the dev app to call us
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── Parse target URL ───────────────────────────────────────────────────
  let reqUrl;
  try {
    reqUrl = new URL(req.url, `http://localhost:${PORT}`);
  } catch {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Bad request URL");
    return;
  }

  const targetRaw = reqUrl.searchParams.get("url");
  if (!targetRaw) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end(
      `Missing ?url= parameter.\nUsage: http://localhost:${PORT}/?url=https://example.com`,
    );
    return;
  }

  let target;
  try {
    target = new URL(targetRaw);
  } catch {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end(`Invalid target URL: ${targetRaw}`);
    return;
  }

  const isHttps = target.protocol === "https:";
  const transport = isHttps ? https : http;

  const options = {
    hostname: target.hostname,
    port: target.port || (isHttps ? 443 : 80),
    path: target.pathname + target.search,
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "identity", // disable gzip so we can string-replace HTML
      Referer: target.origin + "/",
    },
  };

  console.log(`→ ${target.href}`);

  const proxyReq = transport.request(options, (proxyRes) => {
    // ── Build clean response headers ───────────────────────────────────
    const outHeaders = {};
    for (const [k, v] of Object.entries(proxyRes.headers)) {
      if (!STRIP_HEADERS.has(k.toLowerCase())) {
        outHeaders[k] = v;
      }
    }
    outHeaders["access-control-allow-origin"] = "*";
    // Let the browser cache the proxied page briefly
    outHeaders["cache-control"] = "public, max-age=60";

    const contentType = (outHeaders["content-type"] ?? "").toLowerCase();
    const isHtml = contentType.includes("text/html");

    // Follow redirects (3xx)
    if (
      proxyRes.statusCode >= 300 &&
      proxyRes.statusCode < 400 &&
      proxyRes.headers.location
    ) {
      let location = proxyRes.headers.location;
      // Make absolute if relative
      if (location.startsWith("/")) {
        location = target.origin + location;
      }
      res.writeHead(302, {
        Location: `/?url=${encodeURIComponent(location)}`,
        "Access-Control-Allow-Origin": "*",
      });
      res.end();
      proxyRes.resume();
      return;
    }

    if (isHtml) {
      // Collect full body so we can inject the <base> tag
      const chunks = [];
      proxyRes.on("data", (c) => chunks.push(c));
      proxyRes.on("end", () => {
        let body = Buffer.concat(chunks).toString("utf8");

        // Inject <base href="…"> right after <head> so relative assets resolve
        const base = `<base href="${target.origin}${target.pathname}">`;
        if (/<head(\s[^>]*)?>/i.test(body)) {
          body = body.replace(/(<head(\s[^>]*)?>)/i, `$1${base}`);
        } else {
          body = base + body;
        }

        // Remove inline CSP meta tags
        body = body.replace(
          /<meta[^>]+http-equiv=["']?content-security-policy["']?[^>]*>/gi,
          "",
        );

        delete outHeaders["content-length"]; // length changed after injection
        res.writeHead(proxyRes.statusCode, outHeaders);
        res.end(body, "utf8");
      });
    } else {
      // Binary / CSS / JS — stream directly
      res.writeHead(proxyRes.statusCode, outHeaders);
      proxyRes.pipe(res);
    }
  });

  proxyReq.on("error", (err) => {
    console.error(`  ✗ ${err.message}`);
    res.writeHead(502, { "Content-Type": "text/plain" });
    res.end(`Proxy error: ${err.message}`);
  });

  proxyReq.setTimeout(15_000, () => {
    proxyReq.destroy();
    res.writeHead(504, { "Content-Type": "text/plain" });
    res.end("Gateway timeout");
  });

  proxyReq.end();
});

server.listen(PORT, () => {
  console.log(`\n🔀  Kelane proxy  →  http://localhost:${PORT}`);
  console.log(
    `    Usage: http://localhost:${PORT}/?url=https://bbcgoodfood.com/…\n`,
  );
});
