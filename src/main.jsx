import { createRoot } from "react-dom/client";

import { BrowserRouter, Route, Routes } from "react-router";
import HomePage from "./pages/welcome";

import CalendarPage from "./pages/calendar";
import { SelectedCategoryPage } from "./pages/categories/selected-category";
import { MostRecentPage } from "./pages/categories/most-recent";
import { WantToCookPage } from "./pages/categories/want-to-cook";
import { FavoritesPage } from "./pages/categories/favorites";
import { UncategorizedPage } from "./pages/categories/uncategorized";
import GrocoriesPage from "./pages/grocories/grocories-page";
import CookPage from "./pages/kitchen/cook";

import "./index.css";
import CategoriesPage from "./pages/categories/categories-page";
import RecipiesPage from "./pages/categories/recipies-page";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/cook/:recipeId" element={<CookPage />} />
      <Route path="/categories/" element={<CategoriesPage />} />
      <Route path="/categories/:id" element={<RecipiesPage />} />
      <Route path="/categories/:id/:recipeId" element={<RecipiesPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/most-recent" element={<MostRecentPage />} />
      <Route path="/want-to-cook" element={<WantToCookPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/uncategorized" element={<UncategorizedPage />} />
      <Route path="/feeds/:feedUrl" element={<GrocoriesPage />} />
      <Route path="/browser" element={<GrocoriesPage />} />
      <Route path="/groceries" element={<GrocoriesPage />} />
    </Routes>
  </BrowserRouter>,
);
