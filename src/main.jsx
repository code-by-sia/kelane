import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";

import { BrowserRouter, Route, Routes } from "react-router";
import HomePage from "./pages/welcome";

import CalendarPage from "./pages/calendar";
import { SelectedCategoryPage } from "./pages/categories/selected-category";
import { MostRecentPage } from "./pages/categories/most-recent";
import { WantToCookPage } from "./pages/categories/want-to-cook";
import { FavoritesPage } from "./pages/categories/favorites";
import { UncategorizedPage } from "./pages/categories/uncategorized";
import { MyRecipesPage } from "./pages/categories/my-recipes";
import GrocoriesPage from "./pages/grocories/grocories-page";
import CookPage from "./pages/kitchen/cook";
import HistoryPage from "./pages/history";
import BrowserPage from "./pages/browser";
import FeedsPage from "./pages/feeds";
import SetupPage from "./setup/index";

import "./index.css";
import CategoriesPage from "./pages/categories/categories-page";
import RecipiesPage from "./pages/categories/recipies-page";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Toaster richColors position="top-right" />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/setup" element={<SetupPage />} />
      <Route path="/cook/:recipeId" element={<CookPage />} />
      <Route path="/categories/" element={<CategoriesPage />} />
      <Route path="/categories/:id" element={<RecipiesPage />} />
      <Route path="/categories/:id/:recipeId" element={<RecipiesPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/most-recent" element={<MostRecentPage />} />
      <Route path="/want-to-cook" element={<WantToCookPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/uncategorized" element={<UncategorizedPage />} />
      <Route path="/my-recipes" element={<MyRecipesPage />} />
      <Route path="/my-recipes/:recipeId" element={<MyRecipesPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/feeds" element={<FeedsPage />} />
      <Route path="/feeds/:feedId" element={<FeedsPage />} />
      <Route path="/browser" element={<BrowserPage />} />
      <Route path="/groceries" element={<GrocoriesPage />} />
    </Routes>
  </BrowserRouter>,
);
