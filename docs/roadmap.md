# HUJI Run - Implementation Phases & Roadmap

This document outlines the phased implementation plan for the HUJI Run PWA.
Based on the "Definition of Useful": *Coach can approve members, members connect Strava, Coach sees training consistency, Team uses meetups.*

## Phase 1: Foundations (Weeks 1-2)
**Goal:** A working PWA where users can sign up, request to join the team, and coaches can approve them.
- [ ] **Project Setup:** Next.js repo, Database (Supabase) connection, Basic UI Layout.
- [ ] **Authentication:** Login with Email/Password (and Google) via Supabase Auth.
- [ ] **User Roles:** Implement `Coach`, `Member`, `Pending` roles.
- [ ] **Onboarding Flow:** 
    - User sign up -> "Pending" state.
    - User enters "Team Code".
- [ ] **Coach Admin:** Dashboard to view and Approve/Reject join requests.

## Phase 2: Strava Integration (Week 3)
**Goal:** Data flowing from Strava to the Database.
- [ ] **OAuth Connect:** "Connect with Strava" button and flow.
- [ ] **Token Management:** Securely store and refresh Strava tokens.
- [ ] **Activity Import:**
    - Import last 30 days of activities upon connection.
    - **Webhooks:** Listen for real-time activity updates from Strava.
- [ ] **Data Normalization:** Store activities in a standardized format in the DB.

## Phase 3: Social Feed (Week 4)
**Goal:** The "Team" feeling. Users see what others are doing.
- [ ] **Feed Generation:** Automatically create Feed Posts from normalized Activities.
- [ ] **Feed UI:** Cards showing runner, distance, pace, time.
- [ ] **Interactions:** Kudos (Likes) and Comments on posts.
- [ ] **Privacy:** "Team Only" visibility enforcement.

## Phase 4: Coach Insights & Stats (Week 5)
**Goal:** Value for the Coach.
- [ ] **Member Stats:** Weekly distance, 4-week trend.
- [ ] **Coach Dashboard:**
    - Team weekly volume.
    - "Who ran this week?" list.
    - Consistency leaderboard.

## Phase 5: Meetups (Week 6)
**Goal:** Offline coordination.
- [ ] **Create Meetup:** Coach can post a run (Time, Location, Route).
- [ ] **RSVP:** Members can say Going / Maybe / No.
- [ ] **Meetup Details:** Map link, notes.
- [ ] **Reminders:** Push notifications (if PWA installed) or email.

## Future / V2
- Map and Location privacy controls.
- Push Notifications implementation details.

***
**Update (Webhooks):**
Strava Webhooks are now the primary sync method for V1. This simplifies the backend using Supabase Edge Functions / Next.js API routes to receive events in real-time.
