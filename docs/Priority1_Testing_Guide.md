# Priority 1 Features — Testing Guide

This guide walks you through testing all three new Priority 1 features step by step.

**Prerequisites:**
- The app is deployed and running (Netlify or local)
- You have run the new SQL tables in the Supabase SQL Editor (see bottom of this doc)
- You are logged in (default: `admin@admin.com` / `password123`)

---

## 1. Co-op Groups

### 1.1 Create a Group
1. Click **Co-op Groups** in the sidebar
2. Click the **Create Group** button (top right)
3. Fill in:
   - **Group name:** `Test Homeschool Co-op`
   - **Description:** `A group for testing co-op features`
4. Click **Create**
5. **Expected:** The group appears in the list with "1 member" and your name as the creator

### 1.2 View Group Members
1. Click on the group name/card you just created
2. **Expected:** A members panel expands showing you as the only member with an **ADMIN** badge

### 1.3 Invite a Member
1. Click the **Invite** button on your group
2. Enter an email address (use a real email of a second test account, or any email like `testuser@example.com`)
3. Click **Send**
4. **Expected:** A confirmation message "Invitation sent!" appears

### 1.4 Accept an Invitation (requires a second account)
1. Log out and sign in with the invited email account
2. Go to **Co-op Groups**
3. **Expected:** A "Pending Invitations" section appears at the top
4. Click **Accept** on the invitation
5. **Expected:** The invitation disappears and the group now shows in your groups list

### 1.5 Verify Member Count
1. Log back into the original admin account
2. Go to **Co-op Groups** and click the group
3. **Expected:** The member count shows "2 members" and both users appear in the members list

---

## 2. Activity Feed

> **Note:** You must have at least one group before using the Activity Feed.

### 2.1 View the Feed
1. Click **Activity Feed** in the sidebar
2. **Expected:** If you have groups, you see group filter buttons at the top. If no posts exist yet, you see "No activity yet"

### 2.2 Post an Update
1. Click **New Post** (top right)
2. Select **Update** as the post type
3. Choose your group from the dropdown
4. Fill in:
   - **Title:** `Welcome to our co-op!`
   - **Content:** `Excited to get started with our homeschool group.`
5. Click **Post**
6. **Expected:** The post appears in the feed with a blue "Update" badge, your name, and today's date

### 2.3 Post an Announcement
1. Click **New Post** again
2. Select **Announcement**
3. Choose your group
4. Fill in:
   - **Title:** `Important: New curriculum materials available`
   - **Content:** `Check the resources page for new math worksheets.`
5. Click **Post**
6. **Expected:** The post appears with a red "Announcement" badge

### 2.4 Post an Event with RSVP
1. Click **New Post** again
2. Select **Event**
3. Choose your group
4. Fill in:
   - **Title:** `Park Day Meetup`
   - **Content:** `Let's meet at the park for a group activity day!`
   - **Date/Time:** Pick a future date and time
5. Click **Post**
6. **Expected:** The event appears with a green "Event" badge, the date/time displayed, and three RSVP buttons: **Going**, **Maybe**, **Can't Go**

### 2.5 RSVP to an Event
1. On the event you just created, click **Going**
2. **Expected:** The "Going" button updates to show "(1)"
3. Click **Maybe** instead
4. **Expected:** The count shifts — "Maybe (1)" and "Going (0)"

### 2.6 Filter by Group
1. If you have multiple groups, click a specific group name in the filter bar
2. **Expected:** Only posts from that group are shown
3. Click **All Groups**
4. **Expected:** Posts from all your groups appear again

---

## 3. Field Trip Finder

### 3.1 View Field Trips
1. Click **Field Trips** in the sidebar
2. **Expected:** You see the Field Trip Finder page. If no trips exist, you see "No field trips found"

### 3.2 Add a Field Trip
1. Click **Add Trip** (top right)
2. Fill in:
   - **Trip name:** `Natural History Museum`
   - **Description:** `Great exhibits on dinosaurs and geology`
   - **Street address:** `200 Central Park West`
   - **City:** `New York`
   - **State:** `NY`
   - **Category:** `Museum`
   - **Age range:** `5-18`
   - **Cost:** `Free for kids`
   - **Website:** `https://www.amnh.org`
3. Click **Add Trip** (the button may briefly show "Adding..." while it geocodes the address)
4. **Expected:** The trip appears in the listings with the address displayed, and a map marker appears on the map

### 3.3 Add a Second Trip (to test map and distance)
1. Click **Add Trip** again
2. Fill in:
   - **Trip name:** `Liberty Science Center`
   - **Street address:** `222 Jersey City Blvd`
   - **City:** `Jersey City`
   - **State:** `NJ`
   - **Category:** `Science`
   - **Age range:** `3-15`
   - **Cost:** `$22/person`
3. Click **Add Trip**
4. **Expected:** Two markers appear on the map, and the map auto-zooms to fit both

### 3.4 Test the Map
1. Click on a map marker
2. **Expected:** A popup shows the trip name, address, and category
3. Zoom in/out and pan the map
4. **Expected:** The map is interactive and responsive

### 3.5 Search Trips
1. Type `Museum` in the search bar
2. **Expected:** Only the Natural History Museum shows in the list and on the map
3. Clear the search
4. **Expected:** All trips appear again

### 3.6 Filter by Category
1. Click the **Filters** button
2. Select **Museum** from the Category dropdown
3. **Expected:** Only museum trips are shown
4. Change back to **All Categories**
5. **Expected:** All trips appear

### 3.7 Search Near a City
1. In the Filters panel, find the **Search near city** section
2. Enter **City:** `Philadelphia` and **State:** `PA`
3. Set the radius slider to a value (e.g., 150 km)
4. Click **Go**
5. **Expected:** Only trips within that radius of Philadelphia are shown. The distance in km appears on each trip card

### 3.8 Use My Location
1. Click **Use My Location** in the filters
2. If your browser prompts for location permission, click **Allow**
3. **Expected:** Trips are sorted/filtered by distance from your current location, with distance shown on each card

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Sidebar doesn't show new items | Hard refresh the page (Ctrl+Shift+R) |
| "No groups yet" but you created one | Check that the SQL tables were created in Supabase |
| Field trip map doesn't appear | Make sure the trip was geocoded (the "Adding..." state should resolve). Check browser console for errors |
| RSVP buttons don't update | Verify the `EventRsvp` table exists in Supabase |
| Invitation not showing for second user | Make sure you're logged in with the exact email that was invited |
| Map shows no markers | The geocoding may have failed for that address. Try a well-known address |

---

## SQL Setup (if not done yet)

Run this in **Supabase Dashboard > SQL Editor** before testing:

```sql
-- Co-op Groups
CREATE TABLE "CoopGroup" (
    "id" text PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "name" text NOT NULL,
    "description" text,
    "createdById" text REFERENCES "User"("id") ON DELETE SET NULL,
    "createdAt" timestamp DEFAULT NOW()
);

CREATE TABLE "CoopGroupMember" (
    "id" text PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "groupId" text REFERENCES "CoopGroup"("id") ON DELETE CASCADE,
    "userId" text REFERENCES "User"("id") ON DELETE CASCADE,
    "role" text DEFAULT 'MEMBER',
    "joinedAt" timestamp DEFAULT NOW(),
    UNIQUE("groupId", "userId")
);

CREATE TABLE "CoopGroupInvitation" (
    "id" text PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "groupId" text REFERENCES "CoopGroup"("id") ON DELETE CASCADE,
    "invitedEmail" text NOT NULL,
    "invitedById" text REFERENCES "User"("id") ON DELETE SET NULL,
    "status" text DEFAULT 'PENDING',
    "createdAt" timestamp DEFAULT NOW()
);

-- Activity Feed
CREATE TABLE "ActivityFeedItem" (
    "id" text PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "type" text NOT NULL,
    "title" text NOT NULL,
    "content" text,
    "authorId" text REFERENCES "User"("id") ON DELETE CASCADE,
    "groupId" text REFERENCES "CoopGroup"("id") ON DELETE CASCADE,
    "eventDate" timestamp,
    "createdAt" timestamp DEFAULT NOW()
);

CREATE TABLE "EventRsvp" (
    "id" text PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "feedItemId" text REFERENCES "ActivityFeedItem"("id") ON DELETE CASCADE,
    "userId" text REFERENCES "User"("id") ON DELETE CASCADE,
    "status" text DEFAULT 'GOING',
    "createdAt" timestamp DEFAULT NOW(),
    UNIQUE("feedItemId", "userId")
);

-- Field Trips
DROP TABLE IF EXISTS "FieldTrip";
CREATE TABLE "FieldTrip" (
    "id" text PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "title" text NOT NULL,
    "description" text,
    "address" text NOT NULL,
    "city" text NOT NULL,
    "state" text NOT NULL,
    "latitude" double precision,
    "longitude" double precision,
    "category" text NOT NULL,
    "ageRange" text,
    "cost" text,
    "website" text,
    "createdById" text REFERENCES "User"("id") ON DELETE SET NULL,
    "createdAt" timestamp DEFAULT NOW()
);
```
