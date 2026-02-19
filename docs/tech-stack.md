# Technology Stack & Hosting Strategy

## 🌍 Hosting & Domains

### ✅ Custom Domain Strategy (`huji_run.galcesana.com`)
-   **Frontend (The Site)**: Hosted on **Vercel**.
    -   **Custom Domains**: **Supported on Free Tier**.
    -   You **CAN** map `huji-run.galcesana.com` to your Vercel project.
    -   Users will see `huji-run.galcesana.com` in their browser.

### ❓ Supabase "No Custom Domain" Limitation
-   **What it means**: On the free tier, your database/API is reached at `abtonoreltpblqnezeog.supabase.co` instead of `api.galcesana.com`.
-   **Does it matter?**: **NO**.
    -   The user never sees this URL.
    -   Your Next.js app talks to Supabase in the background.
    -   **Auth**: You just need to add `https://huji-run.galcesana.com` to the "Redirect URLs" in Supabase settings (which is allowed).

## 🛠 Core Technologies

### Frontend
-   **Framework**: Next.js 14 (App Router)
-   **Language**: TypeScript
-   **Styling**: CSS Modules (Vanilla CSS) + Variables
-   **Animations**: Framer Motion (for "Premium" feel)

### Backend
-   **Runtime**: Next.js API Routes (Node.js/Edge)
-   **Database**: PostgreSQL (via Supabase)
-   **Auth**: Supabase Auth
