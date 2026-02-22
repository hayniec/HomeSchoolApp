# User Account Creation and Subscription Verification Procedure

This document outlines the current workflow for user registration and sign-in, along with the planned architecture for integrating a payment processor (e.g., Stripe) to ensure active subscriptions.

## Phase 1: Current Implementation (Authentication Only)

### 1. User Account Creation (Sign Up)
1. **User Action:** The user navigates to the landing page and selects the "Need an account? Sign up" option on the authentication form.
2. **Data Entry:** The user provides their `Name`, `Email`, and `Password`.
3. **Submission:** The user clicks "Sign Up".
4. **Backend Processing (`/api/register`):**
   - The system checks if a user with the provided email already exists in the Supabase `User` table.
   - If no duplicate exists, it securely hashes the password using `bcryptjs`.
   - A new user record is created in the Supabase `User` table.
5. **Auto-Login:** Immediately after successful registration, the NextAuth `signIn` method is called behind the scenes to authenticate the user automatically so they don't have to log in manually.

### 2. User Sign-In (Login)
1. **User Action:** The user navigates to the landing page. If they already have an account, they use the default "Welcome Back" form.
2. **Data Entry:** The user inputs their registered `Email` and `Password`.
3. **Submission:** The user clicks "Sign In".
4. **Backend Processing (NextAuth Credentials Provider):**
   - The NextAuth configuration queries Supabase to find a matching user by email.
   - It compares the submitted password against the hashed password stored in Supabase.
   - Upon successful verification, a JWT session token is created containing the user's `id`, `name`, and `email`.
5. **Access Granted:** The user is redirected to the Dashboard and granted access to authenticated features (Forum, Schedule, Resources, Profile).

---

## Phase 2: Future Implementation (Payment Processor Integration)

To ensure users have an active, paid subscription before accessing the Homeschool Hub, the following procedure will be implemented using a payment processor like **Stripe**.

### Step-by-Step Goal Architecture

#### 1. Registration via Checkout Flow
- **New Approach:** Instead of a free registration form on the homepage, the "Sign Up" button will redirect users to a **Pricing Page** or directly to a **Stripe Checkout Session**.
- **Payment Collection:** The user selects a subscription tier, enters their payment details, and pays for the membership via Stripe.
- **Account Provisioning:** 
  - Upon successful payment, Stripe will trigger a secure **Webhook** to our Next.js backend (e.g., `/api/webhooks/stripe`).
  - The webhook handler will extract the user's email from the checkout session and programmatically create their `User` account in Supabase.
  - An email can be sent to the user with a temporary password or a magic link to complete their profile setup.
  - *Alternative Setup:* The user creates a free "Pending" account first, but the dashboard is locked out until they complete the Stripe Checkout session. 

#### 2. Subscription Status Tracking
- **Database Update:** A new column will be added to the Supabase `User` table (e.g., `subscriptionStatus`, `stripeCustomerId`, `subscriptionCurrentPeriodEnd`).
- Whenever a user's subscription renews, cancels, or fails, Stripe webhooks will notify our server.
- The server will update the `subscriptionStatus` column accordingly (e.g., `active`, `past_due`, `canceled`).

#### 3. Sign-In and Access Verification
- **Login Process:** The user logs in via the standard NextAuth flow described in Phase 1.
- **Middleware Check:** During login (or inside a Next.js Middleware/Layout file), the system checks the user's `subscriptionStatus` from Supabase.
- **Routing Logic:**
  - If `subscriptionStatus === 'active'`: The user is granted full access to the app (Dashboard, Forum, Resources).
  - If `subscriptionStatus !== 'active'`: The user is intercepted and redirected to a "Billing/Subscription Required" page containing a Stripe Customer Portal link to update their payment method or renew their subscription.

### Recommended Technology Stack for Phase 2:
- **Payment Gateway:** Stripe
- **Integration Tool:** Stripe Checkout (for pre-built, secure checkout pages) + Stripe Customer Portal (for users to manage billing independently).
- **Webhooks:** Next.js Route Handlers (`/api/webhooks`) specifically configured to listen to Stripe events securely.
- **Database:** Supabase (expanding the `User` table to hold Stripe mapping data).
