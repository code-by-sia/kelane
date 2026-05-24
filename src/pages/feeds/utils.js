// ── RSS / Atom parser ──────────────────────────────────────────────────────

export function parseXML(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "text/xml");
  const isAtom = !!doc.querySelector("feed");

  const get = (el, sel) => el.querySelector(sel)?.textContent?.trim() ?? "";
  const getAttr = (el, sel, attr) =>
    el.querySelector(sel)?.getAttribute(attr) ?? null;

  const itemSel = isAtom ? "entry" : "item";
  const items = [...doc.querySelectorAll(itemSel)].map((el) => {
    const link = isAtom
      ? getAttr(el, "link[rel=alternate]", "href") ||
        getAttr(el, "link", "href") ||
        get(el, "link")
      : get(el, "link");

    const image =
      getAttr(el, "media\\:content[medium=image]", "url") ||
      getAttr(el, "media\\:content", "url") ||
      getAttr(el, "media\\:thumbnail", "url") ||
      getAttr(el, "enclosure[type^=image]", "url") ||
      null;

    return {
      title: get(el, "title"),
      description: get(el, isAtom ? "summary" : "description"),
      link,
      pubDate: get(el, isAtom ? "published" : "pubDate"),
      image,
    };
  });

  const channelTitle =
    doc
      .querySelector(isAtom ? "feed > title" : "channel > title")
      ?.textContent?.trim() ?? "";

  return { items, channelTitle };
}

export async function fetchDirect(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return { ...parseXML(text), viaCorsProxy: false };
}

export async function fetchViaProxy(url, proxyPrefix) {
  const proxied = `${proxyPrefix}${encodeURIComponent(url)}`;
  const res = await fetch(proxied, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`Proxy returned HTTP ${res.status}`);
  const text = await res.text();
  return { ...parseXML(text), viaCorsProxy: true };
}
