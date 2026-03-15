# HomeSchoolApp (Craft.do Reference Document)

## 📌 Purpose
HomeSchoolApp is a Progressive Web App (PWA) designed to support homeschool communities by providing a lightweight, mobile-first, and offline-capable hub for:

- Managing student profiles and attendance
- Scheduling lessons and shared activities
- Coordinating with other families or tutors
- Sharing resources, announcements, and community events

The app is built using Next.js and Supabase, focusing on privacy, ease of use, and modern PWA capabilities (offline caching, installability, push notifications).

## 🎯 Target Audience
- Homeschooling parents/guardians
- Tutors and co-op coordinators
- Students (as a read-only or collaborative participant)

## 🚀 Key Concepts
- **User accounts** with authentication (NextAuth + Supabase)
- **Children profiles** to manage multiple learners per account
- **Schedules** for lesson plans, meetings, and community events
- **Community forum / resources** for sharing ideas and content

## 🧩 Core Architecture
- **Frontend:** Next.js (app router), React, Tailwind CSS
- **Backend:** Supabase (Postgres + Auth + Storage)
- **Deployment:** Netlify / Vercel (PWA hosting)

---

> Note: This document is meant to be stored in Craft.do as a high-level overview/reference for stakeholders.
