# PRD — Manicure Gardening Services Website

## Original Problem Statement
Build a website for "Manicure Gardening Services" (owner: Sergio), a licensed/bonded/insured
landscaping, gardening, lawn care and sprinkler company in San Jose, CA 95111, serving since 2003.
Phone (669) 303-9648, alt (408) 603-6978. Include services, reviews, gallery, working hours, and
a free-estimate contact path. Award-worthy (Awwwards-level) design with kinetic hero, framer-motion
scroll reveals, lenis smooth scroll, editorial marquee, numbered manifesto.

## Architecture
- Frontend: React (CRA + craco, `@/` alias), Tailwind, framer-motion, lenis, react-fast-marquee, shadcn/ui, sonner.
- Backend: FastAPI + Motor (MongoDB async). All routes under `/api`.
- DB: MongoDB collections `reviews`, `estimates`.

## User Personas
- Homeowner in San Jose needing lawn/garden/sprinkler help.
- Local business/property manager seeking commercial landscape maintenance.

## Core Requirements (static)
- Single-page marketing site, dark "Soil & Stone" theme, lime (#BAFF29) accent.
- Sections: Header (glass nav), Kinetic Hero, Marquee, Services bento, Numbered Manifesto,
  Gallery, Testimonials (with visitor submission), Free Estimate form, Footer (hours + contacts).

## Implemented (2026-08-20)
- Kinetic hero with masked line-by-line reveal + parallax background.
- Services bento grid (6 services), numbered manifesto, gallery grid with hover treatment.
- Testimonials: 4 seeded reviews + working "Leave a Review" dialog (saved to DB).
- Free Estimate form saving to DB with success state; native validation.
- Footer with full working hours, both phone numbers, trust badges, payment note.
- Backend endpoints: reviews GET/POST, estimates GET/POST; startup seeding.
- Testing: iteration_1 — backend 100% (5 pytest), frontend 100% (Playwright e2e).

## Backlog / Remaining
- P1: Admin view to browse submitted estimates & moderate reviews.
- P1: Email notification on new estimate (Resend integration).
- P2: Rate-limiting / spam & profanity guard on public POST endpoints.
- P2: Google Maps embed + directions in contact section.
- P2: Before/after slider in gallery.

## Next Tasks
- Await user feedback; prioritize admin dashboard or email notifications.
