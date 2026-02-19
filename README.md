# HUJI Run PWA

Welcome to the HUJI Run PWA project! This is a private application designed for the HUJI Run team to manage members, coordinate runs, and track progress using Strava data.

## 🚀 Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- PostgreSQL Database
- Strava API Credentials

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd huji-run
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```

3.  **Set up environment variables:**
    Copy `.env.example` to `.env.local` and fill in the required values:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/huji_run"
    NEXTAUTH_SECRET="your-secret-key"
    STRAVA_CLIENT_ID="your-strava-client-id"
    STRAVA_CLIENT_SECRET="your-strava-client-secret"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📚 Documentation

Detailed documentation can be found in the `docs/` directory:

-   [**Roadmap & Phases**](docs/roadmap.md): The implementation plan and milestones.
-   [**Product Spec**](docs/spec.md): Full product requirements and design.
-   [**Tech Stack**](docs/tech-stack.md): Architectural decisions and technologies.

## 🛠 Features

-   **Team Management**: Coach/Member roles, approval workflow.
-   **Strava Integration**: OAuth connection, activity import.
-   **Social Feed**: Team-only activity feed with kudos/comments.
-   **Meetups**: Event creation and RSVP.
-   **Insights**: Team and member statistics.

## 🤝 Contributing

This is a private repository for the HUJI Run team.

## License

Private.
