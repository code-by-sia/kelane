import { ChefHatIcon } from "lucide-react";
import Steps from "@/components/step";
import Welcome from "./terms";
import AppearanceSetup from "./appearance";
import Preferences from "./preferences";
import DataStorage from "./storage";
import UserSetup from "./user-setup";
import FeedsSetup from "./feeds";
import useSetupStore from "@/store/setup";
import { SetupComplete } from "./setup-complete";

const SETUP_STEPS = [
  { title: "Welcome",    subtitle: "Terms of service",      icon: 1 },
  { title: "Appearance", subtitle: "Choose your theme",     icon: 2 },
  { title: "Dietary",    subtitle: "Your food preferences", icon: 3 },
  { title: "Storage",    subtitle: "Where your data lives", icon: 4 },
  { title: "About you",  subtitle: "Your name and email",   icon: 5 },
  { title: "Feeds",      subtitle: "Follow recipe blogs",   icon: 6 },
  { title: "All Set",    subtitle: "Start cooking",         icon: 7 },
];

export default function SetupPage() {
  const step = useSetupStore((s) => s.step);
  const setStep = useSetupStore((s) => s.setStep);

  return (
    <div className="flex flex-col h-screen bg-background">

      {/* ── App header ── */}
      <header className="shrink-0 flex items-center gap-2 px-4 sm:px-6 lg:px-12 py-4 bg-card border-b">
        <ChefHatIcon size={18} className="text-primary" />
        <span className="text-base font-semibold">Kelane</span>
      </header>

      <main className="flex-1 flex overflow-hidden">

        {/* ── Step content ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Mobile-only progress strip */}
          <div className="md:hidden shrink-0 bg-card border-b px-4 py-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{SETUP_STEPS[step]?.title}</span>
              <span className="text-xs text-muted-foreground">
                {step + 1} of {SETUP_STEPS.length}
              </span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${Math.round(((step + 1) / SETUP_STEPS.length) * 100)}%` }}
              />
            </div>
          </div>

          {/* Scrollable step */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-12 lg:py-8">
            {step === 0 && <Welcome        onNext={() => setStep(1)} />}
            {step === 1 && <AppearanceSetup onNext={() => setStep(2)} />}
            {step === 2 && <Preferences    onNext={() => setStep(3)} />}
            {step === 3 && <DataStorage    onNext={() => setStep(4)} />}
            {step === 4 && <UserSetup      onNext={() => setStep(5)} />}
            {step === 5 && <FeedsSetup     onNext={() => setStep(6)} />}
            {step === 6 && <SetupComplete />}
          </div>
        </div>

        {/* ── Desktop step rail ── */}
        <aside className="hidden md:flex flex-col justify-between shrink-0 w-72 p-10 pb-4 bg-card border-l">
          <Steps
            steps={SETUP_STEPS}
            value={step}
            onChange={(index) => setStep(index)}
          />
          <footer className="p-3 text-foreground/30 text-xs text-center font-mono">
            &copy; {new Date().getFullYear()} Kelane
          </footer>
        </aside>

      </main>
    </div>
  );
}
