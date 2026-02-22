-- Paste this entire file into the Supabase SQL Editor and click 'Run'
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE "User" (
    "id" text PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "name" text,
    "email" text UNIQUE,
    "emailVerified" timestamp,
    "password" text,
    "image" text,
    "role" text DEFAULT 'STUDENT',
    "bio" text,
    "gradeLevel" text
);
CREATE TABLE "Account" (
    "id" text PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "userId" text REFERENCES "User"("id") ON DELETE CASCADE,
    "type" text,
    "provider" text,
    "providerAccountId" text,
    "refresh_token" text,
    "access_token" text,
    "expires_at" integer,
    "token_type" text,
    "scope" text,
    "id_token" text,
    "session_state" text,
    UNIQUE("provider", "providerAccountId")
);
CREATE TABLE "Session" (
    "id" text PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "sessionToken" text UNIQUE,
    "userId" text REFERENCES "User"("id") ON DELETE CASCADE,
    "expires" timestamp
);
CREATE TABLE "VerificationToken" (
    "identifier" text,
    "token" text UNIQUE,
    "expires" timestamp,
    UNIQUE("identifier", "token")
);
CREATE TABLE "ForumPost" (
    "id" text PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "title" text NOT NULL,
    "content" text NOT NULL,
    "authorId" text REFERENCES "User"("id") ON DELETE CASCADE,
    "createdAt" timestamp DEFAULT NOW()
);
CREATE TABLE "ForumComment" (
    "id" text PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "content" text NOT NULL,
    "postId" text REFERENCES "ForumPost"("id") ON DELETE CASCADE,
    "authorId" text REFERENCES "User"("id") ON DELETE CASCADE,
    "createdAt" timestamp DEFAULT NOW()
);
CREATE TABLE "ScheduleEvent" (
    "id" text PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "title" text NOT NULL,
    "description" text,
    "startTime" timestamp NOT NULL,
    "endTime" timestamp NOT NULL,
    "userId" text REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE TABLE "Resource" (
    "id" text PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "title" text NOT NULL,
    "description" text,
    "url" text NOT NULL,
    "category" text NOT NULL,
    "createdAt" timestamp DEFAULT NOW(),
    "uploadedById" text REFERENCES "User"("id") ON DELETE CASCADE
);