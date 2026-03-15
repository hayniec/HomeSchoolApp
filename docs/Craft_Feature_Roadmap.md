# HomeSchoolApp Feature Roadmap (Craft.do)

## ✅ Implemented Features (Current State)
These are the features already implemented in the current codebase (as of the latest commit):

### Authentication & Account Management
- ✅ User registration + sign-in via email/password (NextAuth + Supabase)
- ✅ Auth-protected pages and API routes

### Student Management
- ✅ Create and store multiple children profiles per account
- ✅ Basic child dashboard (profile views, list display)

### Scheduling & Planning
- ✅ Create schedules (with name, dates, and details)
- ✅ View list of schedules

### Community / Resources
- ✅ Basic forum page placeholder (content page exists)
- ✅ Resources page placeholder (content page exists)

### PWA & UI Layer
- ✅ Responsive UI (mobile-first, Tailwind CSS)
- ✅ Layout with sidebar and theme toggle

---

## 🌱 Prioritized Roadmap (Next Work)
These are the prioritized features and the next work items to make the app more useful for homeschool communities.

### 🔥 Priority 1 — Core Community & Collaboration
These are the most impactful features to build next:
- **Co-op groups**: invite other users; share schedules/resources in a group
- **Activity feed**: announcements, shared updates, event RSVPs
- **Field trip finder**: search for local field trips/activities within a radius of a chosen area (map + distance filtering)

### ⚙️ Priority 2 — Resource & Curriculum Foundations
Once core collaboration is stable, add stronger content/resource tools:
- **Resource library** with tags, categories, and file attachments
- **Lesson templates** & shareable lesson plans
- **Curriculum mapping** (track subject standards, learning goals)

### 🧩 Priority 3 — PWA Experience & Accessibility
Improve reliability, discoverability, and accessibility for all users:
- **Offline first**: full app operation offline (local cache + sync)
- **Install prompt**: guide users to install app on mobile/home screen
- **Accessibility audit**: ensure keyboard navigation + screen reader support

### 🔒 Priority 4 — Privacy & Security Enhancements
Add controls and export capabilities as the user base grows:
- **Role-based access** (parent vs student vs guest)
- **Data export** (CSV/JSON download of student data)
- **Account recovery options** (email reset, factors)

---

### ✅ Next Steps (Action Plan)
1. **Define data model** for co-op groups, shared resources, and field trip listings.
2. **Build API endpoints** for group membership, feed posts, and field trip searching.
3. **Create UI flows** for group creation, activity posting, and map-based field trip discovery.
4. **Add offline sync** for feed and schedule data (local storage + background sync).
5. **Run an accessibility review** and address high-priority issues (keyboard + screen reader).

---

> 💡 Tip: For Craft.do, you can link these sections to in-app pages or embed screenshots of the app UI to make the roadmap more actionable and easy to share with collaborators.
