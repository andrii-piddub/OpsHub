<div align="center">

# OpsHub · Frontend

**A modern workspace for managing work items, built with React and TypeScript.**

A responsive single-page interface for organizing work, tracking progress, and interacting securely with the OpsHub API.

[![React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![React Router](https://img.shields.io/badge/React_Router-8-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)](https://reactrouter.com/)

<sub>Part of <a href="https://github.com/andrii-piddub/OpsHub">OpsHub</a>, a full-stack learning and portfolio project.</sub>

</div>

---

## ✨ Features

| Area | What you can do |
| --- | --- |
| **Authentication** | Register, sign in, sign out, and restore an existing session after a page refresh. |
| **Route protection** | Keep work-item pages available only to signed-in users; redirect signed-in users away from guest pages. |
| **Work-item management** | Create, view, edit, and delete work items. |
| **Progress tracking** | Update each work item's status: **Open**, **In Progress**, or **Done**. |
| **Prioritization** | Set priorities: **Low**, **Medium**, or **High**. |
| **Finding work** | Search by title, filter by status, and sort by creation date. |
| **Pagination** | Browse paginated results served by the backend. |
| **Request feedback** | See loading states, error messages, and disabled controls during active requests. |
| **Session handling** | Detect authorization failures, recheck the session, and show a session-expired dialog when appropriate. |
| **API health** | Check the availability of the backend service. |

## 🧰 Tech stack

| Technology | Purpose |
| --- | --- |
| [React 19](https://react.dev/) | Component-based user interface and hooks |
| [TypeScript 6](https://www.typescriptlang.org/) | Static typing for components and API contracts |
| [Vite 8](https://vite.dev/) | Development server and production builds |
| [React Router 8](https://reactrouter.com/) | Client-side routing and route guards |
| [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) | Communication with the Django REST API |
| CSS | Application styling |
| ESLint | Static code checks |

The frontend consumes the **Django REST Framework** API provided by the [OpsHub backend](../backend).

## 🚀 Getting started

### Prerequisites

- A compatible recent version of **Node.js** and **npm**.
- The **OpsHub Django backend**, configured with PostgreSQL and running locally.

### 1. Install dependencies

From the repository root:

```bash
cd frontend
npm ci
```

### 2. Start the backend

Run the Django development server from the `backend` directory, using the project's configured Python environment and database:

```bash
python manage.py runserver
```

By default, Django serves the API at **http://127.0.0.1:8000**.

### 3. Start the frontend

In a separate terminal, from `frontend`:

```bash
npm run dev
```

Open the local URL shown by Vite (usually **http://localhost:5173**).

> [!NOTE]
> During local development, Vite proxies requests starting with `/api` to `http://127.0.0.1:8000`. This is configured in [`vite.config.ts`](./vite.config.ts). Start the Django backend before testing authentication or work-item operations.

## 🧭 Application routes

| Path | Access | Behavior |
| --- | --- | --- |
| `/login` | Guests | Sign in to OpsHub. |
| `/register` | Guests | Create an account. |
| `/workitem` | Authenticated users | Main work-item workspace. |
| `/` | Authenticated users | Redirects to `/workitem`. |
| Unmatched paths | Authenticated users | Redirect to `/workitem`; guests are redirected to `/login`. |

`RequireAuth` protects the workspace; `GuestRoute` keeps authentication pages for signed-out users. **The Django backend remains responsible for enforcing API authorization.**

## 🏗️ How it works

```text
Browser
   │
   ▼
React + TypeScript
   │
   ├── React Router
   │     ├── GuestRoute ──► Login / Register
   │     └── RequireAuth ──► WorkItemPage
   │                              │
   │                              ▼
   │                        useWorkItems
   │                              │
   └──────────────────────────────┤
                                  ▼
                            Fetch API layer
                                  │
                             /api/v1/*
                                  │
                    Vite development proxy
                                  │
                                  ▼
                       Django REST Framework
                                  │
                                  ▼
                             PostgreSQL
```

Authentication uses **Django sessions and CSRF protection**. The browser sends requests to same-origin `/api/v1/*` endpoints, with Vite handling the proxy in development.

## 📁 Project structure

```text
frontend/
├── src/
│   ├── api/
│   │   ├── ApiError.ts          # Typed HTTP errors
│   │   ├── auth.ts              # Session, login, registration, logout
│   │   ├── health.ts            # API health check
│   │   └── workitems.ts         # Work-item requests and types
│   ├── components/
│   │   ├── GuestRoute.tsx       # Guest-only route guard
│   │   ├── RequireAuth.tsx      # Protected route guard
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── WorkItemForm.tsx
│   │   └── WorkItemsTable.tsx
│   ├── hooks/
│   │   └── useWorkItems.ts      # Work-item state and operations
│   ├── pages/
│   │   └── WorkItemPage.tsx     # Authenticated workspace
│   ├── App.tsx                  # Auth state and application routes
│   ├── main.tsx                 # React entry point
│   └── index.css               # App styles
├── vite.config.ts              # Vite and backend proxy
├── package.json
└── README.md
```

## 🔌 Backend API

The frontend currently uses the following endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/health/` | Backend health check |
| `GET` | `/api/v1/auth/csrf/` | Initialize CSRF cookie |
| `POST` | `/api/v1/auth/register/` | Register a user |
| `POST` | `/api/v1/auth/login/` | Log in |
| `POST` | `/api/v1/auth/logout/` | Log out |
| `GET` | `/api/v1/auth/me/` | Check the current session |
| `GET` | `/api/v1/workitem/` | List, search, filter, and paginate work items |
| `POST` | `/api/v1/workitem/` | Create a work item |
| `PATCH` | `/api/v1/workitem/:id/` | Update a work item |
| `DELETE` | `/api/v1/workitem/:id/` | Delete a work item |

## 🛠️ Available commands

Run these from the `frontend` directory:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Run TypeScript checks and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

The production build is written to `dist/`.

## 🗺️ Roadmap

OpsHub is under active development. Planned improvements include:

- [ ] Consolidate repeated API error and session-handling logic.
- [ ] Improve frontend tests and edge-case handling.
- [ ] Refine component and hook boundaries.
- [ ] Prepare deployment and containerization.
- [ ] Explore a read-only integration with Acumatica Support Cases.

The items above are **plans**, not released features.

---

<div align="center">

**Built to learn full-stack engineering, one feature at a time.**

[Back to the OpsHub repository](https://github.com/andrii-piddub/OpsHub)

</div>
