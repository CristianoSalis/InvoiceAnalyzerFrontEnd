# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

## InvoiceAnalyzerFrontEnd — Frontend for InvoiceAnalyzerBackend

Overview

This folder contains the frontend (demo) for InvoiceAnalyzer — an app for uploading, analyzing and managing invoices. The frontend is built with React + TypeScript and communicates with the `InvoiceAnalyzerBackend` via REST APIs to:

- upload invoices (PDF / images),
- display processing job status,
- list and view processed invoices.

Key features

- Multipart/form-data upload with progress bar.
- Job polling to follow background processing and display results.
- Invoice list with basic paging/filtering and detail view.
- Mock OCR pipeline (offline-first) with extracted-data preview.
- Responsive UI built with Material UI (MUI) and custom styling.

Tech stack

- Frontend: React + TypeScript (Vite)
- UI: Material UI (MUI)
- HTTP client: axios
- Backend: ASP.NET Core Web API (.NET 9)
- Persistence: EF Core + SQLite (local DB: `Data/invoices.db`)
- Dev tooling: Vite, npm

Requirements

- .NET 9 SDK
- Node.js (>= 18) and npm

Quick start (local)

1. Start the backend (from `InvoiceAnalyzerBackend/InvoiceAnalyzerBackend`):
