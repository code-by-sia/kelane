import { lazy } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { BrowserRouter, Route, Routes } from "react-router";
import { ThemeProvider } from "./components/theme-provider";
import "./index.css";

// ── Page chunks — each lazy import becomes its own JS chunk ──────────────────

// Pages that live inside the persistent sidebar shell (AppLayout)
const HomePage            = lazy(() => import("./pages/welcome"));
const CategoriesPage      = lazy(() => import("./pages/categories/categories-page"));
const RecipiesPage        = lazy(() => import("./pages/categories/recipies-page"));
const MostRecentPage      = lazy(() => import("./pages/categories/most-recent").then(m => ({ default: m.MostRecentPage })));
const WantToCookPage      = lazy(() => import("./pages/categories/want-to-cook").then(m => ({ default: m.WantToCookPage })));
const FavoritesPage       = lazy(() => import("./pages/categories/favorites").then(m => ({ default: m.FavoritesPage })));
const UncategorizedPage   = lazy(() => import("./pages/categories/uncategorized").then(m => ({ default: m.UncategorizedPage })));
const MyRecipesPage       = lazy(() => import("./pages/categories/my-recipes").then(m => ({ default: m.MyRecipesPage })));
const CalendarPage        = lazy(() => import("./pages/calendar"));
const GrocoriesPage       = lazy(() => import("./pages/grocories/grocories-page"));
const HistoryPage         = lazy(() => import("./pages/history"));
const FeedsPage           = lazy(() => import("./pages/feeds"));
const BrowserPage         = lazy(() => import("./pages/browser"));
const AssistantPage       = lazy(() => import("./pages/assistant"));
const PreferencesPage     = lazy(() => import("./pages/preferences"));
const ProfilePage         = lazy(() => import("./pages/profile"));
const DocsPage            = lazy(() => import("./pages/docs"));
const ImportPage          = lazy(() => import("./pages/import"));

// Pages without the sidebar shell (standalone layouts)
const SetupPage           = lazy(() => import("./setup/index"));
const CookPage            = lazy(() => import("./pages/kitchen/cook"));
const PrintPage           = lazy(() => import("./pages/kitchen/print"));
const RecipeEditorPage    = lazy(() => import("./pages/recipe-editor"));

// Layout — owns the SidebarProvider + AppSidebar + content Suspense boundary.
// React Router 7 handles the lazy() suspension for route elements internally,
// so no extra Suspense wrapper is needed here.
const AppLayout           = lazy(() => import("./pages/app-layout"));

// ── App ──────────────────────────────────────────────────────────────────────
createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Routes>
        {/* ── Sidebar shell — sidebar stays alive across navigations ── */}
        <Route element={<AppLayout />}>
          <Route path="/"                         element={<HomePage />} />
          <Route path="/categories"               element={<CategoriesPage />} />
          <Route path="/categories/:id"           element={<RecipiesPage />} />
          <Route path="/categories/:id/:recipeId" element={<RecipiesPage />} />
          <Route path="/most-recent"              element={<MostRecentPage />} />
          <Route path="/want-to-cook"             element={<WantToCookPage />} />
          <Route path="/favorites"                element={<FavoritesPage />} />
          <Route path="/uncategorized"            element={<UncategorizedPage />} />
          <Route path="/my-recipes"               element={<MyRecipesPage />} />
          <Route path="/my-recipes/:recipeId"     element={<MyRecipesPage />} />
          <Route path="/calendar"                 element={<CalendarPage />} />
          <Route path="/groceries"                element={<GrocoriesPage />} />
          <Route path="/history"                  element={<HistoryPage />} />
          <Route path="/feeds"                    element={<FeedsPage />} />
          <Route path="/feeds/:feedId"            element={<FeedsPage />} />
          <Route path="/browser"                  element={<BrowserPage />} />
          <Route path="/assistant"                element={<AssistantPage />} />
          <Route path="/preferences"              element={<PreferencesPage />} />
          <Route path="/profile"                  element={<ProfilePage />} />
          <Route path="/docs"                     element={<DocsPage />} />
          <Route path="/import"                   element={<ImportPage />} />
        </Route>

        {/* ── Standalone pages — no sidebar ── */}
        <Route path="/setup"                      element={<SetupPage />} />
        <Route path="/cook/:recipeId"             element={<CookPage />} />
        <Route path="/cook/:recipeId/print"       element={<PrintPage />} />
        <Route path="/recipe/new"                 element={<RecipeEditorPage />} />
        <Route path="/recipe/:code/edit"          element={<RecipeEditorPage />} />
      </Routes>
    </BrowserRouter>
  </ThemeProvider>,
);
