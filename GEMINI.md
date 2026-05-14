# NairaLens — AI Real Estate Sales Engine

NairaLens is an autonomous AI sales engine designed to qualify leads, handle objections, and close Nigerian real estate deals on WhatsApp 24/7.

## Primary Tech Stack

- **Frontend Framework:** [TanStack Start](https://tanstack.com/start) (React 19 + TanStack Router)
- **State & Data Fetching:** [TanStack Query](https://tanstack.com/query) (React Query)
- **Backend & Auth:** [Supabase](https://supabase.com/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) (via Shadcn UI)
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Integrations:** Twilio (WhatsApp API)
- **Infrastructure:** Cloudflare / Vercel

## Coding Standards & Conventions

### 1. General Principles

- **TypeScript First:** All code must be strictly typed. Avoid `any` at all costs.
- **Functional Components:** Use functional components with hooks.
- **Declarative Code:** Favor declarative patterns over imperative ones.
- **Surgical Edits:** When modifying existing code, keep changes focused and minimal while maintaining consistency with surrounding patterns.

### 2. Architecture & Directory Structure

- `src/routes/`: File-based routing using TanStack Router.
- `src/components/ui/`: Reusable, atomic UI components (Shadcn/Radix).
- `src/components/`: Feature-specific or shared complex components.
- `src/hooks/`: Custom React hooks for shared logic.
- `src/integrations/`: Third-party service clients (e.g., Supabase, Twilio).
- `src/lib/`: Utility functions and shared constants.
- `supabase/`: Database migrations and configuration.

### 3. State Management

- Use **TanStack Query** for all server-state (fetching, caching, mutations).
- Use **React Hooks** (useState, useReducer, useContext) for local or global UI state.
- Keep state as close to where it's used as possible.

### 4. Forms & Validation

- Use **React Hook Form** for managing form state.
- Use **Zod** for schema validation (both frontend and API).
- Always provide clear error messages and visual feedback (e.g., using `sonner` for toasts).

### 5. Styling & UI

- Use **Tailwind CSS** classes for styling.
- Follow the established design system (Gold/Noir theme, glassmorphism).
- Ensure components are accessible and responsive (Mobile-first).

### 6. Error Handling

- Use TanStack Router's `ErrorComponent` and `NotFoundComponent`.
- Implement graceful fallbacks and user-friendly error messages.
- Log errors to the console in development; use a dedicated service if available in production.

### 7. Environment Variables

- Client-side variables must be prefixed with `VITE_`.
- Sensitive keys should only be used server-side (Edge Functions or API routes).

### 8. Authentication

- Use the `AuthProvider` and `useAuth` hook for managing user sessions.
- Middleware in `src/integrations/supabase/auth-middleware.ts` handles route-level protection.
- Ensure `auth-attacher.ts` is used where necessary to synchronize session state.

### 9. API & Server Functions

- Prefer **TanStack Start Server Functions** for backend logic that interacts directly with the frontend.
- Public webhooks (e.g., Twilio/WhatsApp) should be placed in `src/routes/api/public/` or `api/public/`.
- Use Zod schemas to validate all incoming request bodies and query parameters.

## Workflows

- **Routing:** Add new routes as files in `src/routes/`. TanStack Router will automatically generate types.
- **Database:** Handle schema changes via Supabase migrations in the `supabase/migrations/` directory.
- **API:** Use TanStack Start's server functions or Supabase Edge Functions for backend logic.
