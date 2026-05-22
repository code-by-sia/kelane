import { useEffect } from "react";
import { useNavigate } from "react-router";
import SidebarPage from "@/pages/sidebar-page";
import useSetupStore from "@/store/setup";

export default function HomePage() {
  const navigate = useNavigate();
  const completed = useSetupStore((s) => s.completed);

  useEffect(() => {
    if (!completed) navigate("/setup");
  }, [completed, navigate]);

  return (
    <SidebarPage title="Welcome">
      <div className="p-6 text-muted-foreground">
        Welcome back to Kelane. Use the sidebar to browse recipes, plan meals,
        and manage your groceries.
      </div>
    </SidebarPage>
  );
}
