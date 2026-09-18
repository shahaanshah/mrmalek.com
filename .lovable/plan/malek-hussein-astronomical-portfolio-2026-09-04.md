# Malek Hussein — Astronomical Portfolio

I found your full site inside the archive: all sections, the copy and data file, the cosmic canvas, the five portraits and the ten company logos. So this is a transform of the real thing, not a rebuild from scratch.

## Step 0 — bring the site in

Your site is built with Next.js; this project runs a different (equivalent) modern React setup that Lovable manages and can preview and publish for you. Everything you asked for looks and behaves identically — only the underlying file layout differs. I'll move your existing pages, styles, data, and images across as the starting point, keep your dark cosmic stylesheet as-is, and delete the legacy sections you listed. Your photos and logos come over at their real paths, so nothing needs re-uploading.

## What gets built on top

**Hero** — `malek-glasses.png` as a clean floating cutout with mouse-driven tilt and parallax over the star field.

**Trusted By Enterprises, Authorities & Scale-Ups** — replaces the static banner and the duplicate logo cards with one section: an infinite, smooth logo marquee (Qawafel, Dopravo, MISA, AEC, Trustangle, Fortune Realty), an executive endorsement strip using `malek-executive.png` with a leadership summary tag, and a "Portfolio Ecosystem Overview" card showing Total GMV Handled, Enterprise Systems Shipped, and Cross-Border Teams Led. Clicking any logo jumps to and highlights that company's case study.

**Career Matrix** — filter tabs (All, FinTech, B2B Marketplaces, Enterprise Platforms, GovTech), impact numbers that count up when scrolled into view ($50M+ GMV, +140% order velocity, 99.98% uptime), an "Inspect Case Study" slide-over drawer with Problem Statement, Technical Architecture, Key Decisions and Outcomes, plus an expandable timeline for Qawafel, Dopravo, Pass On and Lendo.

**Delivery Process** — the four static cards become a clickable pipeline: 01 Product Discovery & User Research, 02 Architecture & Technical Specs, 03 Cross-Functional Agile Execution, 04 Launch, Data Analytics & Scale. Each step reveals its toolchain (Jira, Linear, Figma, AWS, CI/CD) and the artifacts it produces.

**Venture Ecosystem** — Malekting gets an acquisition funnel metrics preview; Malektness gets a discipline/habit checklist toggle featuring `malek-casual.png`; AI Voice Assistance gets a simulated "Play Sample Lead Qualification Call" player.

**Contact / Advisory** — `malek-smiling.png` beside the booking scheduler with a pulsing green "Available in Ottawa / Remote" badge.

**Cosmic canvas** — stars drift continuously and gently repel from the cursor.

**Everywhere** — 3D tilt on interactive cards, and layouts checked at 375px, 768px and 1440px+.

## Copy and numbers

I keep your existing first-person copy and metrics verbatim. Where a new panel needs text you haven't written (case-study architecture notes, step artifacts, funnel figures), I'll draft it in your voice from what's already in your data file and list those additions at the end so you can correct anything.

## Technical notes

- Canvas starfield on `requestAnimationFrame`, DPR-aware resize, pointer-tracked repulsion field, paused off-screen and under `prefers-reduced-motion`.
- Count-ups and reveals reuse your existing `useScrollReveal` observer hook; no animation library added.
- Tilt via a small `useTilt` hook writing `perspective(1000px) rotateX/rotateY` through CSS variables, disabled on touch.
- Marquee is a duplicated track with a CSS keyframe translate, pausing on hover.
- Logo → case study jump uses shared state plus `scrollIntoView` and a temporary highlight ring.
- Drawer: focus trap, Escape to close, scroll lock, `aria-modal`.
- Only `lucide-react` is added; no three.js, no framer-motion.
- Legacy sections removed: AboutJourney, BookShowcase, AspectRatioGuide, EducationCredentials, ExperienceResume, LeadershipGallery, PersonalStatement, ProjectsPortfolio, StudioShowcase.
- Page title, description and social preview carried over from your existing metadata; build must pass clean before handoff.
