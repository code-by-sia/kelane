# Project Overview: Kelane - Recipe & Meal Planner

# Project Overview: Kelane - Recipe & Meal Planner
This repository is the source code for a comprehensive **Recipe Management and Meal Planning web application**. It utilizes React and Vite to build a feature-rich Single Page Application (SPA). The core functionality revolves around helping users manage their diet, plan meals, and track household inventory.

## 🎯 Core Application Functionality
The primary purpose of the application is to be a holistic kitchen assistant, providing the following features:
## 🎯 Core Application Functionality
The primary purpose of the application is to be a holistic kitchen assistant, providing the following features:
*   **Recipe Discovery & Planning:** Allows users to search for recipes and intelligently adjust them based on specific dietary needs or ingredient availability.
*   **Inventory Management:** Features a dynamic "Fridge" system to track perishable items and automatically update a "To-Buy Checklist."
*   **Nutritional Analysis:** Provides detailed nutritional facts, including calories and breakdown per recipe, aiding in healthy meal planning.
*   **Customization:** Enables users to easily add and manage their own custom recipes within the application.

## 📁 Project Structure Insights
The standard Vite/React structure supports the complexity of the application.

*   `src/`: Contains the core source code for the application components and logic.
*   `public/`: Holds static assets (e.g., `index.html`, images) that are served directly.
*   `node_modules/`: Contains all project dependencies managed by npm.
*   `dist/`: Will contain the optimized, production-ready build output.
*   `data/`: Potentially used for static data sets or mock API responses.
*   `mock/`: Likely holds mock data or mock services for isolated testing.

## 📜 Key Configuration Files
The configuration files reveal how the project is built and linted:

*   `package.json`: Defines project metadata, scripts (e.g., `dev`, `build`), and dependencies.
*   `vite.config.js`: Configures the Vite build process, defining plugins and build behavior.
*   `eslint.config.js`: Configures the ESLint linter to enforce code quality and style rules.
*   `index.html`: The primary entry point HTML file that Vite serves.

## 📚 Development Notes (From README)
1.  **Fast Refresh:** The template leverages React/Vite plugins (like `@vitejs/plugin-react`) to ensure a fast development experience with Hot Module Replacement (HMR).
2.  **TypeScript Integration:** For production applications, the recommendation is to integrate TypeScript and use type-aware linting rules (`typescript-eslint`).
3.  **React Compiler:** The template notes that the React Compiler is currently disabled due to its potential impact on development and build performance.

### 🧑‍💻 Development & Coding Guidelines
When implementing new features or debugging:
1.  **Language:** Always use React with JavaScript (JS).
2.  **Build Tool:** The project utilizes Vite for fast bundling and HMR.
3.  **Styling/UI:** Use `shadcn/ui` components styled with `TailwindCSS`.
4.  **Component Design:** Adhere strictly to component best practices: keep components small, highly focused, and reusable.