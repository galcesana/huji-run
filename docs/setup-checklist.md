# HUJI Run — Setup Checklist

To start development, we need credentials from **Supabase** and **Strava**.
Please follow these steps one by one.

## 1. Supabase (Database & Auth)
*Supabase provides the Database (Postgres) and User Management (Auth).*

1.  Go to [supabase.com](https://supabase.com/) and Sign Up / Log In.
2.  Click **"New Project"**.
3.  **Organization**: Create one if needed (free).
4.  **Name**: `huji-run`.
5.  **Database Password**: `si%ap@G*dTvkz3m` (Saved).
6.  **Region**: Choose `eu-central-1` (Frankfurt) or similar close to Israel/You.
7.  Click **"Create new project"**.
8.  Wait for it to setup (takes ~1 min).
9.  Go to **Project Settings** (cog icon at bottom left) -> **API**.
10. **Copy** these values:
    -   `Project URL`
    -   `anon` / `public` Key

## 2. Strava (The Data Source)
*Strava API allows us to fetch runs.*

1.  Go to [strava.com/settings/api](https://www.strava.com/settings/api).
2.  If asked, upload an icon (any image will do).
3.  **Application Name**: `HUJI Run Dev`.
4.  **Category**: `Social` or `Analysis`.
5.  **Club**: Leave blank or select HUJI Run.
6.  **Website**: `http://localhost:3000` (Local development URL).
7.  **Authorization Callback Domain**: `localhost` (CRITICAL for testing).
8.  Click **Create**.
9.  **Copy** these values:
    -   `Client ID` (Format: `123456`)
    -   `Client Secret` (Format: `a1b2c3...`)

## 3. Share the Keys
Once you have them, please reply with them in this format (or just paste them):

```text
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...
```
