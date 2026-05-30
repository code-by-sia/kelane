import {
  BookOpenIcon,
  BotIcon,
  CalendarIcon,
  ChromeIcon,
  ContainerIcon,
  CookingPotIcon,
  DatabaseIcon,
  ExternalLinkIcon,
  FlameIcon,
  GlobeIcon,
  RefrigeratorIcon,
  ServerIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  TerminalIcon,
} from "lucide-react";
import SidebarPage from "@/pages/sidebar-page";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* ── Primitives ──────────────────────────────────────────────────────────── */

function Section({ id, icon: Icon, title, children }) {
  return (
    <section id={id} className="flex flex-col gap-4 scroll-mt-20">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-primary shrink-0" />
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Card({ icon: Icon, title, description }) {
  return (
    <div className="flex gap-3 p-4 rounded-xl border bg-card">
      <div className="shrink-0 mt-0.5 size-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon size={16} className="text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function Code({ children, block = false }) {
  if (block) {
    return (
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto leading-relaxed border">
        {children}
      </pre>
    );
  }
  return (
    <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
      {children}
    </code>
  );
}

function Step({ n, title, children }) {
  return (
    <div className="flex gap-3">
      <span className="shrink-0 size-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mt-0.5">
        {n}
      </span>
      <div className="flex-1 flex flex-col gap-1">
        <p className="text-sm font-semibold">{title}</p>
        {children}
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function DocsPage() {
  return (
    <SidebarPage title="Docs">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-10">

        {/* Hero */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <FlameIcon size={22} className="text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Kelane</h1>
            <Badge variant="secondary" className="text-xs">v0.0.0</Badge>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            A private, offline-first recipe manager and kitchen organiser that
            runs entirely in your browser. No account, no server, no data
            leaving your device.
          </p>
          <a
            href="https://chef.samalstudios.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline w-fit font-medium"
          >
            chef.samalstudios.com
            <ExternalLinkIcon size={13} />
          </a>
        </div>

        <Separator />

        {/* Features */}
        <Section id="features" icon={BookOpenIcon} title="Features">
          <div className="grid sm:grid-cols-2 gap-3">
            <Card
              icon={CookingPotIcon}
              title="Recipe Library"
              description="Browse and manage recipes by category. Add custom recipes with ingredients, steps, timers, nutritional info and photo."
            />
            <Card
              icon={RefrigeratorIcon}
              title="Fridge & Grocery"
              description="Track what's in your fridge with expiry dates. Build a smart shopping list and move items between fridge and buy list."
            />
            <Card
              icon={ShoppingCartIcon}
              title="Cook from Recipe"
              description="Pick any recipe and automatically generate a shopping list of only the ingredients you're missing."
            />
            <Card
              icon={CalendarIcon}
              title="Meal Calendar"
              description="Plan meals across the week. Drag recipes onto days and see your upcoming menu at a glance."
            />
            <Card
              icon={GlobeIcon}
              title="Recipe Browser"
              description="Browse any recipe site directly in the app via the built-in proxy. Import recipes with one tap."
            />
            <Card
              icon={BotIcon}
              title="AI Chef Assistant"
              description="A local on-device language model that can answer cooking questions, suggest recipes and help with substitutions — no API key needed."
            />
          </div>
        </Section>

        {/* Getting Started */}
        <Section id="getting-started" icon={FlameIcon} title="Getting Started">
          <div className="flex flex-col gap-5">
            <Step n="1" title="Browse recipes">
              <p className="text-sm text-muted-foreground">
                Open the <strong>Categories</strong> section in the sidebar.
                Each category lists its recipes as cards. Click a card to read
                the full recipe with ingredients, step-by-step instructions and
                a built-in timer.
              </p>
            </Step>
            <Step n="2" title="Add your own recipes">
              <p className="text-sm text-muted-foreground">
                Click <strong>+</strong> inside any category or use the{" "}
                <strong>My Recipes</strong> section. Fill in the name,
                ingredients, steps and optional variants (e.g. Vegetarian,
                Vegan). The recipe is saved locally — no sign-in required.
              </p>
            </Step>
            <Step n="3" title="Stock your fridge">
              <p className="text-sm text-muted-foreground">
                Go to <strong>Groceries → Fridge</strong>. Add items manually
                or import them by moving entries from the buy list. Set expiry
                dates so you get warned before things go off.
              </p>
            </Step>
            <Step n="4" title="Plan your week">
              <p className="text-sm text-muted-foreground">
                Open <strong>Calendar</strong> and drag recipes onto day slots.
                The grocery list integrates automatically so you always know
                what to buy.
              </p>
            </Step>
            <Step n="5" title="Cook mode">
              <p className="text-sm text-muted-foreground">
                Hit <strong>Start Cooking</strong> on any recipe. Each step is
                highlighted one at a time with a full-screen timer when the
                step has a duration. The display stays on while you cook.
              </p>
            </Step>
          </div>
        </Section>

        {/* Data & Privacy */}
        <Section id="data" icon={ShieldCheckIcon} title="Data &amp; Privacy">
          <p className="text-sm text-muted-foreground leading-relaxed">
            All your data — recipes, fridge contents, meal plans, preferences —
            is stored in your browser's <Code>localStorage</Code>. Nothing is
            ever sent to a remote server. Clearing browser data will erase
            everything, so export a backup from <strong>Preferences</strong>{" "}
            occasionally.
          </p>
          <div className="flex gap-3 p-4 rounded-xl border bg-card">
            <DatabaseIcon size={16} className="text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              The AI assistant downloads a small language model to your device
              the first time you open it (~400 MB). The model runs locally in a
              Web Worker — no data ever leaves your machine.
            </p>
          </div>
        </Section>

        <Separator />

        {/* Chrome Extension */}
        <Section id="extension" icon={ChromeIcon} title="Chrome Extension">
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Kelane browser extension lets you import recipes from any cooking
            website with one click. It scans for structured{" "}
            <Code>schema.org/Recipe</Code> data and opens a confirmation page in
            Kelane where you can review and save the recipe.
          </p>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <TerminalIcon size={14} className="text-muted-foreground" />
              <p className="text-sm font-semibold">Install</p>
            </div>
            <Code block>{`# 1. Generate the PNG icons (one-time, uses the project's sharp)
node extension/icons/generate.mjs

# 2. In Chrome: open chrome://extensions
#    Enable "Developer mode" → Load unpacked → select the extension/ folder`}</Code>
          </div>

          <div className="flex flex-col gap-2 p-4 rounded-xl border bg-card text-sm">
            <p className="font-semibold">How it works</p>
            <ol className="flex flex-col gap-1.5 text-muted-foreground list-decimal list-inside">
              <li>Navigate to any recipe page (AllRecipes, BBC Good Food, NYT Cooking, …)</li>
              <li>Click the Kelane toolbar icon — the popup shows a recipe preview</li>
              <li>Click <strong className="text-foreground">Import to Kelane</strong></li>
              <li>Review the recipe, pick categories, click Save</li>
            </ol>
          </div>

          <p className="text-xs text-muted-foreground">
            The extension defaults to{" "}
            <Code>https://chef.samalstudios.com</Code>. To use a local or
            self-hosted instance, click the ⚙ gear in the popup and enter your
            URL.
          </p>
        </Section>

        <Separator />

        {/* Self-hosting */}
        <Section id="self-hosting" icon={ServerIcon} title="Self-Hosting">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Kelane is a static single-page application. Self-hosting means
            building it once and serving the output folder with any web server.
            The optional proxy sidecar is only needed for the{" "}
            <strong>Recipe Browser</strong> feature.
          </p>

          {/* Docker Compose */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <ContainerIcon size={14} className="text-muted-foreground" />
              <p className="text-sm font-semibold">Quick start with Docker Compose</p>
            </div>
            <Code block>{`# 1. Clone the repository
git clone https://github.com/your-org/kelane.git
cd kelane

# 2. Start everything (builds the image on first run)
docker compose up -d

# App →  http://localhost:80
# Proxy → http://localhost:3001   (Recipe Browser only)`}</Code>
            <p className="text-xs text-muted-foreground">
              The compose file contains two services:{" "}
              <Code>app</Code> (nginx serving the production build) and{" "}
              <Code>proxy</Code> (the CORS proxy for external recipe sites).
            </p>
          </div>

          {/* Manual build */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <TerminalIcon size={14} className="text-muted-foreground" />
              <p className="text-sm font-semibold">Manual build (Node ≥ 20)</p>
            </div>
            <Code block>{`# Install dependencies
npm install

# Production build → dist/
npm run build

# Serve with any static file server, e.g.:
npx serve dist            # ad-hoc preview
# — or — copy dist/ to your own nginx / Caddy / S3 bucket`}</Code>
          </div>

          {/* Proxy */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <GlobeIcon size={14} className="text-muted-foreground" />
              <p className="text-sm font-semibold">CORS Proxy (optional)</p>
            </div>
            <Code block>{`# Run the proxy alongside the app:
node proxy-server.mjs         # default port 3001
PORT=8080 node proxy-server.mjs

# Or use the npm script:
npm run proxy`}</Code>
            <p className="text-xs text-muted-foreground">
              The proxy strips <Code>X-Frame-Options</Code> and CSP headers so
              external recipe sites can be loaded in the in-app browser. It is a
              simple HTTP pass-through — no data is stored or logged.
            </p>
          </div>

          {/* Env vars */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <DatabaseIcon size={14} className="text-muted-foreground" />
              <p className="text-sm font-semibold">Environment variables</p>
            </div>
            <div className="rounded-xl border overflow-hidden text-xs font-mono">
              <div className="grid grid-cols-[auto_1fr] divide-y">
                {[
                  ["PORT", "3001", "Port for the CORS proxy server"],
                  ["VITE_PROXY_URL", "http://localhost:3001", "Override the proxy URL baked into the build"],
                ].map(([k, def, desc]) => (
                  <div key={k} className="contents">
                    <div className="bg-muted px-3 py-2 font-bold border-r">{k}</div>
                    <div className="px-3 py-2 flex flex-col gap-0.5">
                      <span>default: <span className="text-primary">{def}</span></span>
                      <span className="text-muted-foreground font-sans text-[11px]">{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Separator />

        {/* Tech stack */}
        <Section id="stack" icon={FlameIcon} title="Tech Stack">
          <div className="flex flex-wrap gap-2">
            {[
              "React 19", "Vite 7", "Tailwind CSS v4", "Radix UI",
              "Zustand", "React Router v7", "date-fns", "Recharts",
              "WebLLM", "PWA (Workbox)", "Node.js proxy",
            ].map((t) => (
              <Badge key={t} variant="secondary" className="font-mono text-xs">{t}</Badge>
            ))}
          </div>
        </Section>

      </div>
    </SidebarPage>
  );
}
