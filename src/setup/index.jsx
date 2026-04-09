import { useState, useEffect } from "react";
import Steps from "@/components/step";
import { IconMoneybagHeart } from "@tabler/icons-react";
import Welcome from "./terms";
import ChartOfAccounts from "./coa-selection";
import DataStorage from "./storage";

export function Side({ step, setStep }) {
  return (
    <aside className="flex flex-col justify-between p-12 pb-4 bg-white border-s h-full">
      <Steps
        steps={[
          {
            title: "Welcome",
            subtitle: "Accept terms of service and privacy policy",
            icon: 1,
          },
          {
            title: "Chart Of Accounts",
            subtitle: "Select the account heirarchy",
            icon: 2,
          },
          {
            title: "Data Storage",
            subtitle: "Select the data storage provider",
            icon: 3,
            description: "Description 3",
          },
          {
            title: "User Setup",
            subtitle: "Create your account",
            icon: 4,
          },
          {
            title: "Setup Complete",
            subtitle: "Finish setup",
            icon: 5,
          },
        ]}
        value={step}
        onChange={(index) => setStep(index)}
      />
      <footer className="p-3 text-foreground/30 text-xs text-center font-mono">
        &copy; {new Date().getFullYear()} Samalstudios.com
      </footer>
    </aside>
  );
}

export function UserSetup({ onNext }) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <IconMoneybagHeart className="size-10" />
      <h1 className="text-2xl font-bold">User Setup</h1>
      <p className="text-base font-normal">Set up your user account</p>
      <button className="btn btn-primary mt-4" onClick={() => onNext(4)}>
        Next
      </button>
    </div>
  );
}

export function SetupComplete({ onNext }) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <IconMoneybagHeart className="size-10" />
      <h1 className="text-2xl font-bold">Setup Complete</h1>
      <p className="text-base font-normal">Your setup is complete!</p>
      <button className="btn btn-primary mt-4" onClick={() => onNext(5)}>
        Restart
      </button>
    </div>
  );
}

export default function SetupPage() {
  const [step, setStep] = useState(localStorage.getItem("setup.step") * 1 || 0);

  useEffect(() => {
    localStorage.setItem("setup.step", step);
  }, [step]);

  return (
    <div className="flex flex-col flex-1 justify-center h-screen bg-neutral-50">
      <header className="p-4 bg-white border-b px-12">
        <div className="flex items-center gap-2">
          <IconMoneybagHeart className="size-5" />
          <span className="text-base font-semibold">Jimêryar</span>
        </div>
      </header>
      <main className="flex-1 flex">
        <div className="flex-1 m-6 mx-12">
          {step === 0 && <Welcome onNext={setStep} />}
          {step === 1 && <ChartOfAccounts onNext={setStep} />}
          {step === 2 && <DataStorage onNext={setStep} />}
          {step === 3 && <UserSetup onNext={setStep} />}
          {step === 4 && <SetupComplete onNext={setStep} />}
        </div>
        <Side step={step} setStep={setStep} />
      </main>
    </div>
  );
}
