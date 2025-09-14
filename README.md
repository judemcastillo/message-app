# Message App

A full-stack, real-time-feeling messaging app where **only friends can chat**. Built with **Next.js 15 (App Router)**, **Prisma + PostgreSQL (Neon in production)**, **Supabase Storage** for image uploads, **Tailwind CSS + shadcn/ui**, and **pure JavaScript** (no TypeScript).

🔗 **Live Demo:** https://message-app-delta-sable.vercel.app/

---

## ✨ Highlights

- **Custom authentication** (email + password)  
  - Hashed passwords with `bcrypt`  
  - Signed **HTTP-only cookie** sessions with `jose`  
  - Middleware-protected routes & server-side guards
- **Friends system**  
  - Send request → accept/decline → only friends can start 1:1 chats
- **Direct messages & Group chats**  
  - Create conversations, rename groups, add/remove members, view participants
- **Presence / Online indicator** (no third-party)  
  - Lightweight heartbeat + “last seen” → green/gray dot
- **Image sharing**  
  - Client uploads → Supabase Storage → image preview in chat
- **Modern Next.js 15 patterns**  
  - App Router, **Server Actions** for mutations, RSC/Client split  
  - API routes + SWR polling where it makes sense
- **Clean UI**  
  - Inbox layout (sidebar + thread) similar to Messenger  
  - shadcn/ui components + Tailwind

---

## 🖼 Screenshots

> _Add your own images in `/public` or `/docs` and reference them here._

- Inbox + threads  
- Discover users + add friend  
- Group chat rename / member management  
- Image upload

---

## 🧰 Tech Stack

**Frontend:** Next.js 15 (App Router), React, SWR, Tailwind CSS, shadcn/ui  
**Backend:** Prisma ORM, PostgreSQL (Neon), Supabase **Storage**, `bcrypt`, `jose`  
**Infra/Deploy:** Vercel (app), Neon (DB), Supabase (images)

---

## 🧠 Skills Demonstrated

- Secure auth without NextAuth (hashing, cookie sessions, route/middleware guards)  
- DB design for messaging (users, profiles, friendships, conversations, participants, messages)  
- Server Actions vs API routes trade-offs (mutations server-side; polling with SWR)  
- File uploads + public CDN delivery (Supabase)  
- Presence without sockets (heartbeat + last-seen)  
- Real-world App Router architecture: nested layouts, RSC/Client components  
- Design system with shadcn/ui + Tailwind

---



