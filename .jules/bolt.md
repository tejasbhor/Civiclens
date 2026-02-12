## 2024-05-23 - Monolithic Bundle due to Sync Imports
**Learning:** The application was bundling all routes into a single JavaScript file because all page components were imported synchronously in `App.tsx`. This significantly increases TTI (Time to Interactive) for the initial load.
**Action:** Always check `App.tsx` or route configuration files for synchronous imports in React applications. Converting to `React.lazy` and `Suspense` is a high-impact, low-risk optimization for this architecture.
