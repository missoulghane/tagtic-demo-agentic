# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # dev server at http://localhost:4200 (hot reload)
npm run build      # production build → dist/
npm run watch      # dev build with watch mode
npm test           # run unit tests with Vitest
ng generate component <name>   # scaffold a component
```

To run a single test file: `npx vitest run src/app/app.spec.ts`

## Stack

- **Angular 21** (standalone components, no NgModules) with the `@angular/build:application` builder (Vite-based)
- **TailAdmin Angular** free template — admin dashboard UI with 100+ components, ecommerce dashboard, charts, forms, tables, and dark mode
- **Tailwind CSS v4** — imported via `@import "tailwindcss"` in [src/styles.css](src/styles.css), configured through PostCSS ([`.postcssrc.json`](.postcssrc.json))
- **ApexCharts** (`ng-apexcharts`) + **amCharts 5** for data visualisation; ApexCharts is also loaded as a global script in `angular.json`
- **FullCalendar** (`@fullcalendar/angular`) for the calendar page
- **flatpickr** for date/time pickers; **Swiper** for carousels; **PrismJS** for code highlighting
- **Vitest** as the test runner (not Karma/Jest)
- **TypeScript ~5.9** with strict mode via [tsconfig.app.json](tsconfig.app.json)
- Package manager: `npm` (v11.13.0 pinned in `package.json`)

## Architecture

The app uses Angular's modern standalone component model — every component declares its own `imports` array instead of relying on shared NgModules.

Entry point flow: [src/main.ts](src/main.ts) → bootstraps `App` with `appConfig` from [src/app/app.config.ts](src/app/app.config.ts) → router outlet in [src/app/app.component.html](src/app/app.component.html) renders route components.

Routes are defined in [src/app/app.routes.ts](src/app/app.routes.ts). The layout wraps authenticated pages via `AppLayoutComponent` ([src/app/shared/layout/app-layout/](src/app/shared/layout/app-layout/)); auth pages use `AuthPageLayoutComponent`.

**Component organisation:**
- `src/app/pages/` — routed page components (dashboard, charts, forms, tables, auth, profile…)
- `src/app/shared/components/` — reusable UI components grouped by domain (cards, charts, ecommerce, form, tables, ui…)
- `src/app/shared/layout/` — layout shells (app-layout, app-header, app-sidebar, auth-page-layout, generator-layout)
- `src/app/shared/services/` — `SidebarService`, `ThemeService`, `ModalService`

Theme (dark/light) is managed by `ThemeService`. Sidebar open/close state is managed by `SidebarService`.

## Code style

Prettier is configured in `package.json`: `printWidth: 100`, `singleQuote: true`, Angular HTML parser for `.html` files.
