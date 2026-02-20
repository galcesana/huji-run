# HUJI Run - Implementation Phases & Roadmap

This document outlines the phased implementation plan for the HUJI Run PWA.
Based on the "Definition of Useful": *Coach can approve members, members connect Strava, Coach sees training consistency, Team uses meetups.*

## Phase 1: Foundations & Auth ✅
**Goal:** A working platform where users can safely join and coaches can manage the squad.
- [x] **Project Setup:** Next.js 15, Supabase, Tailwind v4.
- [x] **Authentication:** Secure Email/Password & Google OAuth.
- [x] **Verified Onboarding:** 
    - Auto-Redirection logic (Onboarding -> Pending -> Dashboard).
    - Team Code validation (Current: `HUJI2026`).
- [x] **Coach Panel:** Real-time athlete review (Approve/Reject).

## Phase 2: System Robustness & Deletion ✅
**Goal:** High-end security and data integrity.
- [x] **Cascading Deletion:** Secure account removal (User & Admin led).
- [x] **Clean Rejection:** Automatic user purging on request rejection.
- [x] **RLS Hardening:** Admin-client overrides for critical onboarding paths.

## Phase 3: Strava & Social Feed 🚧
**Goal:** Activity data and team spirit.
- [x] **Strava Webhooks:** Live activity listener implemented.
- [x] **Data Normalization:** Runs stored in `activities` table.
- [ ] **Feed Socials:** Kudos and Comments interactions.
- [ ] **Activity Maps:** Dynamic polyline rendering on feed cards.

## Phase 4: Coach Insights & Meetups 📅
**Goal:** High-value coordination.
- [ ] **Consistency Stats:** Weekly volume & leaderboards.
- [ ] **Event System:** Create meetups with RSVP and route links.
- [ ] **Team Milestones:** Automatic "Member Joined" and "PB" cards.
