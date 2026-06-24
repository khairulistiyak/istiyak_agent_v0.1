# ISTIYAK AI COMPANION 

## Context Handoff & Technical Blueprint (MVP Edition)

### Part 5 (Sections 13-14)

------------------------------------------------------------------------

# Section 13. Phase 6 - Web Landing Page & Admin Panel

## Goals
Set up the external business infrastructure for marketing, onboarding, and administrative control.

## Web Landing Page
- **Tech Stack:** Next.js, Tailwind CSS.
- **Purpose:** Showcase the "ISTIYAK AI Companion" features, pricing plans, and provide direct download links for Mac (`.dmg`), Windows (`.exe`), and Linux (`.AppImage`).
- **Billing:** Stripe integration for processing Pro/Premium subscriptions.

## Central Admin Panel
- **Database:** MongoDB.
- **Purpose:** A secure dashboard for the platform owner to monitor overall system health, revenue, and active users.

------------------------------------------------------------------------

# Section 14. Security & Anti-Abuse Mechanisms

## User Control & Banning
- **Status Flags:** Users have `isActive` and `isBlocked` statuses in the database.
- **Instant Revocation:** The admin panel can instantly block a user. The backend API Gateway will immediately reject any requests from blocked accounts, stopping the Tauri app from functioning for that user.

## Free-Tier Abuse Prevention
- **IP Fingerprinting:** The Gateway Service logs the IP address of new signups. 
- **Restriction Logic:** Strict rule enforcing "One Free Account per IP/Device". If a user tries to create multiple free accounts to exploit API limits, the system automatically blocks the IP.
- **Dynamic Routing:** Free users are forcefully routed to cost-effective models (e.g., Gemini 3.5 Flash or Llama 3), while Pro users get access to premium models.