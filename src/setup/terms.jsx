import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const EFFECTIVE_DATE = "31 May 2026";

export default function Welcome({ onNext }) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="flex flex-col justify-center min-h-full max-w-2xl mx-auto gap-6">
      <div>
        <h1 className="text-2xl font-light mb-1">Welcome to Kelane</h1>
        <p className="text-muted-foreground text-sm">
          Your personal recipe manager and meal planner. Please read the terms
          and disclaimers below before getting started.
        </p>
      </div>

      <div className="bg-card border rounded-xl px-6 py-5 h-80 overflow-y-auto text-sm space-y-5 text-muted-foreground leading-relaxed">

        <p className="text-[11px] text-muted-foreground/60 uppercase tracking-wide font-medium">
          Effective {EFFECTIVE_DATE}
        </p>

        {/* 1 ── About Kelane */}
        <section className="space-y-1.5">
          <h2 className="text-foreground font-semibold text-sm">1. About Kelane</h2>
          <p>
            Kelane is a private, client-side recipe management and meal-planning
            application. It runs entirely in your browser. No account, no
            subscription, and no internet connection is required for core
            functionality.
          </p>
        </section>

        {/* 2 ── Your Data & Privacy */}
        <section className="space-y-1.5">
          <h2 className="text-foreground font-semibold text-sm">2. Your Data &amp; Privacy</h2>
          <p>
            All data you enter — recipes, grocery lists, meal plans, preferences,
            and cook history — is stored{" "}
            <strong className="text-foreground">exclusively in your browser</strong>{" "}
            (localStorage / IndexedDB). Nothing is transmitted to any external
            server, and no analytics or tracking of any kind is performed.
          </p>
          <p>
            Because your data lives only in your browser, it may be lost if you
            clear your browser storage, use private/incognito mode, or switch
            devices. You are solely responsible for exporting and backing up your
            data using the Export function in Preferences → Data.
          </p>
        </section>

        {/* 3 ── AI Features */}
        <section className="space-y-1.5">
          <h2 className="text-foreground font-semibold text-sm">3. AI Features &amp; Disclaimers</h2>
          <p>
            Kelane includes an on-device AI assistant ("Kejal") and an AI-powered
            recipe scanner, both powered by{" "}
            <strong className="text-foreground">WebLLM</strong> — an open-source
            framework that runs large language models directly in your browser
            using WebGPU.{" "}
            <strong className="text-foreground">No prompts, messages,
            or recipe data are ever sent to any external server or AI provider.</strong>
          </p>
          <p>
            <strong className="text-foreground">AI accuracy disclaimer:</strong>{" "}
            AI-generated responses — including recipe suggestions, ingredient
            substitutions, cooking tips, nutritional estimates, and meal plans —
            are provided for general informational and convenience purposes only.
            They may be incomplete, inaccurate, or unsuitable for your specific
            situation. Always apply your own judgement before following any
            AI-generated advice.
          </p>
          <p>
            <strong className="text-foreground">Not professional advice:</strong>{" "}
            Nothing Kejal says constitutes medical, nutritional, dietary, or
            allergy advice. If you have food allergies, intolerances, or a medical
            condition that requires dietary management, consult a qualified
            healthcare professional. Do not rely on AI outputs for
            allergy-critical decisions.
          </p>
          <p>
            <strong className="text-foreground">Model download:</strong>{" "}
            On first use, AI features require downloading a language model
            (roughly 0.9–3.7 GB depending on your selection in Preferences).
            The model is cached locally in your browser. WebGPU-capable hardware
            and a compatible browser (Chrome 113+ or Edge 113+) are required.
          </p>
        </section>

        {/* 4 ── Chrome Extension */}
        <section className="space-y-1.5">
          <h2 className="text-foreground font-semibold text-sm">4. Chrome Extension</h2>
          <p>
            The optional Kelane Chrome extension can detect and import recipes
            from websites you visit. To do so it requires the{" "}
            <strong className="text-foreground">activeTab</strong> and{" "}
            <strong className="text-foreground">scripting</strong> browser
            permissions, which allow it to read the content of the current tab
            when you click the extension icon.
          </p>
          <p>
            The extension does not run in the background, does not track your
            browsing history, and does not transmit any data to external servers.
            Recipe data extracted from a page is sent directly from your browser
            to your local Kelane instance only.
          </p>
        </section>

        {/* 5 ── Recipe Content */}
        <section className="space-y-1.5">
          <h2 className="text-foreground font-semibold text-sm">5. Recipe Content</h2>
          <p>
            Recipes included with Kelane as sample data are provided for personal
            use only. When you scan or import recipes from external URLs, you are
            responsible for ensuring you have the right to store and use that
            content. Kelane does not host, transmit, or claim ownership of any
            third-party recipe content.
          </p>
          <p>
            <strong className="text-foreground">Nutritional information</strong>{" "}
            displayed in the app (calories, macros) is estimated and may not be
            accurate. It should not be used as the basis for medical or clinical
            dietary decisions.
          </p>
        </section>

        {/* 6 ── License & Intellectual Property */}
        <section className="space-y-1.5">
          <h2 className="text-foreground font-semibold text-sm">6. License &amp; Intellectual Property</h2>
          <p>
            Kelane is released under the{" "}
            <strong className="text-foreground">
              Creative Commons Attribution-NonCommercial 4.0 International
            </strong>{" "}
            (CC BY-NC 4.0) license. You are free to use, share, and adapt
            Kelane for personal and non-commercial purposes, provided you give
            appropriate credit and indicate any changes made.
          </p>
          <p>
            <strong className="text-foreground">Commercial use is not permitted</strong>{" "}
            without explicit written permission from the author. This includes,
            but is not limited to, selling the application, offering it as a
            paid service, or incorporating it into a commercial product.
          </p>
        </section>

        {/* 7 ── Limitation of Liability */}
        <section className="space-y-1.5">
          <h2 className="text-foreground font-semibold text-sm">7. Limitation of Liability</h2>
          <p>
            Kelane is provided{" "}
            <strong className="text-foreground">"as is"</strong>, without
            warranties of any kind. To the maximum extent permitted by applicable
            law, the developers of Kelane shall not be liable for any loss of
            data, indirect, incidental, or consequential damages arising from
            your use of the application or reliance on AI-generated content.
          </p>
        </section>

        {/* 8 ── Changes */}
        <section className="space-y-1.5">
          <h2 className="text-foreground font-semibold text-sm">8. Changes to These Terms</h2>
          <p>
            These terms may be updated from time to time. Continued use of the
            application after an update constitutes acceptance of the revised
            terms.
          </p>
        </section>

      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <Checkbox
            id="terms"
            checked={accepted}
            onCheckedChange={setAccepted}
          />
          <span className="text-sm">
            I have read and agree to these terms
          </span>
        </label>
        <Button disabled={!accepted} onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}
