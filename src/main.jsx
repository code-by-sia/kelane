import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { BrowserRouter, Route, Routes } from "react-router";
import { ThemeProvider } from "./components/theme-provider";
import { Loading } from "./components/loading";
import { ChefAssistant } from "./components/chef-assistant";
import "./index.css";

// ── Page chunks — each lazy import becomes its own JS chunk ──────────────────
const HomePage            = lazy(() => import("./pages/welcome"));
const SetupPage           = lazy(() => import("./setup/index"));
const CookPage            = lazy(() => import("./pages/kitchen/cook"));
const PrintPage           = lazy(() => import("./pages/kitchen/print"));
const CategoriesPage      = lazy(() => import("./pages/categories/categories-page"));
const RecipiesPage        = lazy(() => import("./pages/categories/recipies-page"));
const SelectedCategoryPage= lazy(() => import("./pages/categories/selected-category").then(m => ({ default: m.SelectedCategoryPage })));
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
const PreferencesPage     = lazy(() => import("./pages/preferences"));
const ProfilePage         = lazy(() => import("./pages/profile"));

// ── App ──────────────────────────────────────────────────────────────────────
createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <ChefAssistant />
      <Suspense fallback={<Loading isLoading loadingText="Loading…" />}>
        <Routes>
          <Route path="/"                           element={<HomePage />} />
          <Route path="/setup"                      element={<SetupPage />} />
          <Route path="/cook/:recipeId"             element={<CookPage />} />
          <Route path="/cook/:recipeId/print"       element={<PrintPage />} />
          <Route path="/categories"                 element={<CategoriesPage />} />
          <Route path="/categories/:id"             element={<RecipiesPage />} />
          <Route path="/categories/:id/:recipeId"   element={<RecipiesPage />} />
          <Route path="/most-recent"                element={<MostRecentPage />} />
          <Route path="/want-to-cook"               element={<WantToCookPage />} />
          <Route path="/favorites"                  element={<FavoritesPage />} />
          <Route path="/uncategorized"              element={<UncategorizedPage />} />
          <Route path="/my-recipes"                 element={<MyRecipesPage />} />
          <Route path="/my-recipes/:recipeId"       element={<MyRecipesPage />} />
          <Route path="/calendar"                   element={<CalendarPage />} />
          <Route path="/groceries"                  element={<GrocoriesPage />} />
          <Route path="/history"                    element={<HistoryPage />} />
          <Route path="/feeds"                      element={<FeedsPage />} />
          <Route path="/feeds/:feedId"              element={<FeedsPage />} />
          <Route path="/browser"                    element={<BrowserPage />} />
          <Route path="/preferences"                element={<PreferencesPage />} />
          <Route path="/profile"                    element={<ProfilePage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </ThemeProvider>,
);
