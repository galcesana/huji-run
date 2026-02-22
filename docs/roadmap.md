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

## Phase 3: Coach Management Hub & Team Feed 🚧
**Goal:** Empower coaches with structural tools and centralized broadcast capabilities.
- [ ] **Coach-Only Feed:** Coaches broadcast updates, images, and training plans. Athletes can only read, like, and comment.
- [ ] **Weekly Training Plans:** Coaches publish structured workouts with detailed interval blocks (`jsonb`).
- [ ] **Engagement Tracking:** Athletes mark "Today's Workout" as done.

## Phase 4: Team Calendar & Meetups 📅
**Goal:** High-value coordination for practices and events.
- [ ] **Event System:** Coaches schedule local/UTC-aware events with recurrence rules.
- [ ] **Athlete RSVPs:** Strict Going/Not Going tracking.
- [ ] **Attendance Verification:** Coaches mark true attendance vs RSVPs.
