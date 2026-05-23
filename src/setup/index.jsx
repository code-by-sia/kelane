import { useNavigate } from "react-router";
import { ChefHatIcon } from "lucide-react";
import Steps from "@/components/step";
import Welcome from "./terms";
import AppearanceSetup from "./appearance";
import Preferences from "./preferences";
import DataStorage from "./storage";
import UserSetup from "./user-setup";
import useSetupStore from "@/store/setup";
import { Button } from "@/components/ui/button";

const SETUP_STEPS = [
  { title: "Welcome",    subtitle: "Terms of service",      icon: 1 },
  { title: "Appearance", subtitle: "Choose your theme",     icon: 2 },
  { title: "Dietary",    subtitle: "Your food preferences", icon: 3 },
  { title: "Storage",    subtitle: "Where your data lives", icon: 4 },
  { title: "About you",  subtitle: "Your name and email",   icon: 5 },
  { title: "All Set",    subtitle: "Start cooking",         icon: 6 },
];

function Side({ step, setStep }) {
  return (
    <aside className="flex flex-col justify-between p-12 pb-4 bg-white border-s h-full">
      <Steps
        steps={SETUP_STEPS}
        value={step}
        onChange={(index) => setStep(index)}
      />
      <footer className="p-3 text-foreground/30 text-xs text-center font-mono">
        &copy; {new Date().getFullYear()} Kelane
      </footer>
    </aside>
  );
}

function SetupComplete() {
  const navigate = useNavigate();
  const completeSetup = useSetupStore((s) => s.completeSetup);

  const finish = () => {
    completeSetup();
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <ChefHatIcon size={64} strokeWidth={0.8} className="text-primary" />
      <div className="text-center">
        <h1 className="text-3xl font-light mb-2">You're all set!</h1>
        <p className="text-muted-foreground">
          Kelane is ready. Start exploring recipes and planning your meals.
        </p>
      </div>
      <Button size="lg" onClick={finish}>
        Start cooking
      </Button>
    </div>
  );
}

export default function SetupPage() {
  const step = useSetupStore((s) => s.step);
  const setStep = useSetupStore((s) => s.setStep);

  return (
    <div className="flex flex-col flex-1 justify-center h-screen bg-neutral-50">
      <header className="p-4 bg-white border-b px-12">
        <div className="flex items-center gap-2">
          <ChefHatIcon size={18} className="text-primary" />
          <span className="text-base font-semibold">Kelane</span>
        </div>
      </header>
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 m-6 mx-12 overflow-y-auto">
          {step === 0 && <Welcome        onNext={() => setStep(1)} />}
          {step === 1 && <AppearanceSetup onNext={() => setStep(2)} />}
          {step === 2 && <Preferences    onNext={() => setStep(3)} />}
          {step === 3 && <DataStorage    onNext={() => setStep(4)} />}
          {step === 4 && <UserSetup      onNext={() => setStep(5)} />}
          {step === 5 && <SetupComplete />}
        </div>
        <Side step={step} setStep={setStep} />
      </main>
    </div>
  );
}
