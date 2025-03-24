# 💼 Freelance Job Board API

A full-stack backend application for managing freelance job postings, applications, messaging, and reviews — built with **Hono.js**, **Effect**, **Prisma**, and **Bun**.

---

## 🚀 Tech Stack

| Layer    | Technology                                                       |
| -------- | ---------------------------------------------------------------- |
| Backend  | [Hono.js](https://hono.dev/) + [Effect](https://effect.website/) |
| ORM      | [Prisma](https://www.prisma.io/)                                 |
| Database | PostgreSQL (via Docker)                                          |
| Auth     | JWT + Role-based (Client / Freelancer)                           |
| Runtime  | [Bun](https://bun.sh/)                                           |

---

App runs on: `http://localhost:3000`

---

## 📁 Project Structure

```
src/
├── domain/           # Schema definitions (Effect Schema)
├── services/         # Business logic (Effect-based)
├── routes/           # Hono route handlers
├── middlewares/      # JWT & Role-based middlewares
├── infrastructure/   # Prisma, DB connections
└── main.ts           # App entry point
```

---

## 🧠 Design Principles

- Functional Programming via Effect
- Clean Architecture (domain → service → route)
- Schema-driven validation (with `@effect/schema`)
- Separation of concerns

---

## 🛠️ Future Ideas

- WebSocket for real-time messaging
- Admin dashboard
- Job pricing calculator
- Email notifications
