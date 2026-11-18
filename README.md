# VibeCode: In-Browser AI Code Editor & Playground

VibeCode is a full-stack, browser-based development environment that lets developers scaffold, edit, run, and preview modern web applications directly inside the browser—without spinning up external cloud VMs or container servers.

Built on Next.js, WebAssembly-based WebContainers, Monaco Editor, and Auth.js, the platform offers an instant-boot IDE experience complete with multi-framework starters, an interactive terminal, live previews, and an integrated AI coding assistant.

---

## Technical Highlights

- **Zero-Infrastructure Execution (WebContainers):** Runs a full Node.js runtime entirely client-side using WebAssembly. Dependencies are installed and dev servers are booted locally inside browser sandboxes without incurring backend compute costs.
- **Monaco Code Editor Integration:** Multi-file workspace powered by Monaco with custom theme configurations, syntax highlighting, and TypeScript/JSX support.
- **Virtual File System Synchronization:** Manages file trees in-memory using Zustand and serializes hierarchical project data to MongoDB via Prisma. File updates synchronize bi-directionally between Monaco, the UI file explorer, and WebContainer virtual disks.
- **Integrated Terminal (Xterm.js):** PTY-compatible terminal streaming stdout/stderr directly from WebContainer processes with support for custom command execution and search addons.
- **Secure Authentication & Session Management:** NextAuth v5 (Auth.js) implementation using JWT strategy and Prisma adapter, supporting GitHub and Google OAuth flows with protected server-side layout guards.
- **Cross-Origin Isolation:** Configured with required `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers to unlock `SharedArrayBuffer` primitives needed for browser threads.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Framework & Core** | Next.js 16 (App Router, Server Actions, Turbopack), React 19, TypeScript |
| **Styling & UI** | Tailwind CSS v4, Radix UI primitives, Lucide Icons, Next Themes |
| **In-Browser Runtime** | StackBlitz WebContainer API (`@webcontainer/api`), `@xterm/xterm` |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) |
| **Database & ORM** | MongoDB Atlas, Prisma ORM 6 |
| **Auth** | Auth.js / NextAuth v5 (GitHub & Google OAuth) |
| **State & Parsing** | Zustand, React Markdown, KaTeX, Sonner |

---

## Architecture Overview

```text
               ┌────────────────────────────────────────────────────────┐
               │                     User Browser                       │
               │                                                        │
               │   ┌─────────────────────┐   ┌──────────────────────┐   │
               │   │    Monaco Editor    │   │  Xterm.js Terminal   │   │
               │   └──────────┬──────────┘   └──────────┬───────────┘   │
               │              │                         │               │
               │              ▼                         ▼               │
               │   ┌────────────────────────────────────────────────┐   │
               │   │      WebContainer API (Node.js in Wasm)        │   │
               │   │   - Virtual FS  - npm install  - next dev      │   │
               │   └────────────────────────┬───────────────────────┘   │
               │                            │                           │
               │                            ▼                           │
               │                  Live Preview (iframe)                 │
               └────────────────────────────┼───────────────────────────┘
                                            │
                               REST / Server Actions
                                            │
                                            ▼
               ┌────────────────────────────────────────────────────────┐
               │                   Next.js Backend                      │
               │                                                        │
               │   - NextAuth v5 (OAuth Callbacks & JWT validation)     │
               │   - Template Serialization & Static File Bundling      │
               │   - Dashboard Actions & Starmark Toggles               │
               └────────────────────────────┬───────────────────────────┘
                                            │
                                       Prisma Client
                                            │
                                            ▼
               ┌────────────────────────────────────────────────────────┐
               │                     MongoDB Atlas                      │
               │        (Users, Accounts, Playgrounds, StarMarks)       │
               └────────────────────────────────────────────────────────┘
```

---

## Supported Starter Templates

The editor bundles ready-to-run boilerplate projects located under `vibecode-starters/`:
- **React (Vite + TypeScript)**: Fast client-side SPA with HMR.
- **Next.js (App Router)**: Full-stack React framework with file routing.
- **Vue.js**: Single File Component (SFC) setup.
- **Express / Node.js**: Lightweight REST API backend.
- **Hono**: Edge-ready API starter.
- **Angular**: Client-side application setup.

---

## Directory Layout

```text
├── modules/
│   ├── ai-chat/          # AI chat sidebar, prompt generation & message streaming
│   ├── auth/             # Auth buttons, hooks, user session management
│   ├── dashboard/        # Dashboard views, playground management, templates modal
│   ├── home/             # Landing page components, marketing layout, header/footer
│   ├── playground/       # Code editor, file explorer tree, editor configuration
│   └── webcontainers/    # WebContainer boot loader, filesystem transformer, terminal
├── prisma/
│   └── schema.prisma     # MongoDB models (User, Account, Playground, Starmark)
├── public/               # Static assets & icons
├── src/
│   ├── app/              # Next.js App Router (RSC layouts, auth routes, dashboard)
│   └── lib/              # Shared Prisma client, template path maps, utilities
├── vibecode-starters/    # Template repositories mounted into browser containers
├── auth.ts               # NextAuth v5 configuration & callbacks
├── next.config.ts        # Next.js configuration & COOP/COEP headers
└── package.json
```

---

## Getting Started Locally

### Prerequisites
- **Node.js**: v18.18.0 or later
- **npm** or **pnpm**
- **MongoDB**: A free MongoDB Atlas cluster (or local replica set)

### 1. Clone the repository
```bash
git clone https://github.com/sujalsao/Ai-powered-code-editor.git
cd Ai-powered-code-editor
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ai-code-editor?retryWrites=true&w=majority"

# NextAuth / Auth.js
AUTH_SECRET="your-generated-auth-secret"
AUTH_TRUST_HOST=true

# GitHub OAuth
AUTH_GITHUB_ID="your_github_client_id"
AUTH_GITHUB_SECRET="your_github_client_secret"

# Google OAuth
AUTH_GOOGLE_ID="your_google_client_id"
AUTH_GOOGLE_SECRET="your_google_client_secret"
```

> **Note on OAuth Callbacks:**
> - GitHub Callback: `http://localhost:3000/api/auth/callback/github`
> - Google Redirect URI: `http://localhost:3000/api/auth/callback/google`

### 4. Push database schema
```bash
npx prisma db push
```

### 5. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment (Vercel)

1. Import the repository into [Vercel](https://vercel.com).
2. Set the build command to:
   ```bash
   prisma generate && next build
   ```
3. Add the environment variables defined above in the Vercel project settings.
4. Add the production domain callback URLs to your GitHub and Google OAuth applications.

---

## License

This project is licensed under the [MIT License](LICENSE).
