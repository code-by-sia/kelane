import { CookingIcon } from "./cooking-icon";

export function Loading({ loadingText = "Loading...", isLoading, children }) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 justify-center w-full h-screen">
        <CookingIcon size={32} />
        <span className="font-mono animate-pulse font-semibold mt-2.5">{loadingText}</span>
      </div>
    );
  }
  return <>{children}</>;
}
