# Vercel Deployment Guide

## 1. Project Setup in Vercel
1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import from your Git Provider (GitHub/GitLab/Bitbucket) repository `huji-run`.
4.  **Framework Preset**: Next.js (Default).
5.  **Root Directory**: `./` (Default).

## 2. Environment Variables (CRITICAL)
In the "Environment Variables" section of the deployment screen, you **MUST** add the secrets from your `.env.local` file:

| Key | Value Source |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key |
| `STRAVA_CLIENT_ID` | From Strava Settings |
| `STRAVA_CLIENT_SECRET` | From Strava Settings |

*Note: You do NOT need to add the Supabase DB Password here if using the URL/Anon Key for client-side connection, or if utilizing the standard connection string in a future server-side config.*

## 3. Custom Domain Setup
1.  Once deployed, go to **Settings** -> **Domains**.
2.  Enter: `huji-run.galcesana.com`.
3.  Vercel will give you a **CNAME Record** (likely `cname.vercel-dns.com`).
4.  Go to your DNS Provider (Cloudflare/GoDaddy/Namecheap).
5.  Add the Record:
    -   **Type**: `CNAME`
    -   **Name**: `huji-run`
    -   **Target**: `cname.vercel-dns.com`
    -   **Proxy Status (Cloudflare)**: Proxied (Orange Cloud) is supported by Vercel but "DNS Only" (Grey Cloud) is easier for SSL debugging initially. **Recommended: DNS Only (Grey) first.**

## 4. Supabase Redirect URL
**After** you have the custom domain:
1.  Go to Supabase Dashboard -> Authentication -> URL Configuration.
2.  Add `https://huji-run.galcesana.com/auth/callback` to **Redirect URLs**.

## 5. Code Configuration (Crucial for Vercel)
When we create the app, we must configure `next.config.js` to allow Strava images (profil pictures/maps) to load. Vercel blocks external images by default for performance security.

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dgalywir8tz8i.cloudfront.net', // Strava CDN
      },
      {
        protocol: 'https',
        hostname: '*.strava.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com', // Google Auth images
      }
    ],
  },
};
module.exports = nextConfig;
```
