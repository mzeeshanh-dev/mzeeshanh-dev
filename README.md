## Hi, I'm Muhammad Zeeshan Haider

**Backend-focused full-stack engineer** building APIs, real-time products and practical retrieval systems with TypeScript, Node.js and Next.js.

I work as a Full-Stack Software Engineer at [Earth Scan Systems](https://escan-systems.com) in Islamabad, building web platforms for agriculture, GIS and remote-sensing data. Outside work I build complete products end to end — data model, API, authentication, UI and deployment — and document the trade-offs I make along the way.

---

### Featured projects

#### TaaSGrid · [live](https://taasgrid.com) · *source private*

A talent platform that combines hiring, student projects, CV tools, AI-assisted job matching and learning in one product.

- **Express 5 + MongoDB API** organised into eight modules: hiring pipeline with Zoom / Google Meet / Teams interview scheduling, project marketplace, CV builder, AI CV parsing and matching (Groq + Gemini), and two learning modules.
- **JWT auth in httpOnly cookies** with refresh-and-retry, five roles across three collections, and separate guards for any user, admins (re-checked against the database) and company accounts.
- **Multi-tenant isolation:** company-private courses are scoped by `companyId`, and another tenant's IDs return 404 so they can't be enumerated.
- **63 integration tests** (Vitest + mongodb-memory-server) driving real HTTP with real JWTs across learning flows, tenant isolation and the role-permission matrix.
- Next.js 16 frontend with role-based dashboards and TanStack Query.

`Node.js` `Express` `MongoDB` `JWT` `Next.js` `Vitest` `Cloudinary` `Firestore`

#### [Pixel Toolbox](https://github.com/mzeeshanh-dev/pixel-toolbox) · [live demo](https://pixel-toolbox-eta.vercel.app)

QR code generator, video-to-GIF converter and image converter/compressor in one Next.js app, designed to keep media processing in the browser where possible.

- Video-to-GIF with **FFmpeg WebAssembly in a Web Worker**: two-pass palette encoding, cancellation, and a bounded search toward a target file size.
- Two explicit image paths — Canvas in the browser, and a **Sharp API route** with Zod validation, size caps and a consistent error contract for formats the browser can't encode.
- Local QR library in **IndexedDB (Dexie)** with nested folders, non-destructive version history and transactional JSON backup/restore.
- 122 Vitest tests plus Playwright end-to-end specs.

`Next.js 16` `TypeScript` `FFmpeg.wasm` `Sharp` `Dexie` `Zod` `Vitest` `Playwright`

#### [Chatly](https://github.com/mzeeshanh-dev/Chatly) · [live demo](https://chatly-khaki.vercel.app) · [Android client](https://github.com/mzeeshanh-dev/chatly-android-app)

Real-time direct and group messaging with a web client, an Android client and one shared Firebase backend.

- Firestore real-time listeners for messages, typing state, presence and read receipts, shared by both clients.
- Authorization in **Firestore security rules**: per-user "delete for me", sender-only "delete for everyone", and a 3-minute sender-only edit window.
- Next.js API routes verify **Firebase ID tokens** before privileged work (push notifications, media upload); admin portal gated by custom claims.
- Connection-request flow, group roles, message tagging (question/task/decision), FCM push and email OTP sign-up.

`Next.js` `TypeScript` `Firebase Auth` `Firestore` `FCM` `React Native` `Cloudinary`

#### [Laptop Finder](https://github.com/mzeeshanh-dev/laptop-finder-rag)

Conversational search over 1,275 laptops that answers multi-turn questions without an LLM, so every answer is deterministic and traceable to the data.

- Rule-based query parser for prices, specs, brands (with negation) and use cases, feeding hard filters.
- **Hybrid retrieval**: BGE-M3 dense embeddings + BM25, then deterministic ranking and template-based answers.
- Rule-based dialogue state for follow-ups such as "show cheaper ones" and "compare the first two"; FastAPI backend and Docker setup.

`Python` `FastAPI` `BGE-M3` `BM25` `pandas` `Docker`

#### [Portfolio CLI](https://github.com/mzeeshanh-dev/portfolio-node-cli) · [npm](https://www.npmjs.com/package/@zeeshan-dev/software-engineer)

An interactive terminal app published to npm (`npx @zeeshan-dev/software-engineer`) that loads portfolio and GitHub data with caching and an offline fallback.

`TypeScript` `Node.js` `Commander` `Vitest` `tsup`

---

### Skills

- **Languages:** TypeScript, JavaScript, Python
- **Backend:** Node.js, Express, Next.js route handlers, FastAPI, REST API design, JWT and Firebase authentication, Zod validation
- **Data:** MongoDB (Mongoose), Firestore, IndexedDB, BM25 and embedding-based retrieval
- **Frontend:** React, Next.js (App Router), Tailwind CSS, TanStack Query
- **Tooling and delivery:** Git, Docker, Vercel, Render, Vitest, Playwright
- **Domain:** GIS and remote-sensing data, agriculture software

---

### Contact

Open to backend and full-stack engineering roles.

[Portfolio](https://m-zeeshan-haider.vercel.app) · [LinkedIn](https://www.linkedin.com/in/m-zeeshan-haider-606bb3284/) · [Email](mailto:mzeeshanh.dev@gmail.com)
