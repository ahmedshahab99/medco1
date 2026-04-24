# agents.md - AI Coding Assistant Guidelines

## 🎯 Project Overview
- **Name**: Arabic Language Clinic Management System
- **Purpose**: End-to-end clinic operations (patients, appointments, doctors, billing, medical records, dashboard)
- **Audience**: Admins, Doctors, Receptionists, Patients
- **Language**: Arabic-first (RTL)
- **Design Goal**: Clean, accessible, mobile-first, clinically professional UI

## 🛠 Tech Stack & Versions
- **Framework**: Next.js 
- **Language**: TypeScript (`strict: true`)
- **Styling**: Tailwind 
- **State**: Server Components for data, Zustand/Context for UI state, React Hook Form + Zod for forms
- **Data Fetching**: Native `fetch` with Next.js caching/revalidation, or TanStack Query if client-heavy
- **Validation**: Zod
- **Icons**: `lucide-react`
- **Lint/Format**: ESLint + Prettier (project defaults)
- **Database/ORM**: Prisma
- **Auth**: Subabase


## 📝 Coding Standards & Conventions
- ✅ **TypeScript only**: No `any`, explicit return types, strict null checks
- ✅ **Server-first**: Default to Server Components. Use `"use client"` only for interactivity, hooks, or third-party UI libs
- ✅ **Single Responsibility**: Components < 250 LOC. Extract logic to hooks, utils, or server actions
- ✅ **Naming**: 
  - Files: `kebab-case.tsx` or `kebab-case.ts`
  - Components: `PascalCase.tsx`
  - Functions/Variables: `camelCase`
  - Types: `PascalCase` or `I` prefix optional (prefer descriptive names)
- ✅ **Props**: Always define interfaces. Use `React.ComponentProps<"button">` for HTML element forwarding
- ✅ **Styling**: Tailwind only. No inline `style={}`. Use CSS variables for theme tokens
- ✅ **Error/Loading States**: Every data-fetching route/component must include `loading.tsx`, `error.tsx`, and skeleton UI
- ✅ **Env Validation**: Validate `env` at startup using `zod` or `@t3-oss/env-nextjs`

## 🌐 Arabic & RTL Guidelines
- ✅ Set `<html lang="ar" dir="rtl">` in root layout
- ✅ Use **logical Tailwind properties** for spacing/borders:
  - `ps-4` / `pe-4` (not `pl-4` / `pr-4`)
  - `ms-2` / `me-2` (not `ml-2` / `mr-2`)
  - `rounded-s-md` / `rounded-e-md` (not `rounded-l/r`)
- ✅ **Font**: Load an optimized Arabic web font (e.g., `Tajawal`, `Cairo`, or `IBM Plex Sans Arabic`) via `next/font`
- ✅ **Formatting**: Use `Intl.NumberFormat` & `Intl.DateTimeFormat` with `ar-SA` or `ar-EG` locale
- ✅ **Validation**: Arabic regex for names/addresses where applicable. Support Arabic numerals & Eastern Arabic numerals (`٠١٢٣`)
- ✅ **i18n Ready**: Structure strings in `lib/i18n/` or use `next-intl`. Never hardcode Arabic text in components.

## 🔄 State & Data Flow
- 🌐 Server Components fetch & render data by default
- 🔄 Client state: Zustand for UI (modals, sidebar, theme)
- 📝 Forms: `react-hook-form` + `zod` resolver. Keep validation schemas in `types/` or `lib/utils/`
- ♻️ Cache/Revalidation: Use Next.js `revalidatePath` / `revalidateTag` or TanStack Query `invalidateQueries`
- 🔒 Security: Sanitize inputs, validate server-side, use parameterized queries, enforce RLS if using Supabase/Postgres

## 🤖 AI Agent Rules & Constraints
1. **Ask before adding dependencies**. Prefer native APIs or existing project libs.
2. **Keep it modular**: One file = one responsibility. Extract repeated UI to `components/ui/` or `components/features/`
3. **No silent failures**: All async operations must handle loading, success, and error states
4. **Accessibility first**: Semantic HTML, `aria-*` labels, keyboard navigation, contrast ≥ 4.5:1, focus states
5. **Comments**: JSDoc for complex functions. Explain *why*, not *what*.
6. **Responsive**: Mobile-first Tailwind (`sm:`, `md:`, `lg:`). Test layouts at 320px, 768px, 1024px, 1440px
7. **Never bypass TypeScript**. If stuck, create a `TODO` comment and ask for clarification.
8. **Follow Conventional Commits** if generating commit messages.

## ✅ Quality & Review Checklist (Agent Self-Check)
- [ ] All components typed & no `any`
- [ ] RTL-safe spacing & alignment
- [ ] Loading & error states implemented
- [ ] Forms validated with Zod
- [ ] Accessible (labels, roles, focus, contrast)
- [ ] Tailwind classes follow project order (`clsx`/`cva` for variants)
- [ ] Server/Client boundary respected
- [ ] Environment variables validated
- [ ] Commit message follows `feat(scope): description`

---
💡 **Usage Tip**: When prompting the AI, reference this file explicitly:  
`"Follow agents.md strictly. Implement X using modular components, RTL-safe Tailwind, and TypeScript. Ask if unsure."`