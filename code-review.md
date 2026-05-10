# Code Review — AWS AIF-C01 Study Platform

**Date:** 2026-05-09  
**Reviewer:** GitHub Copilot  
**Scope:** `server/src/index.js`, `client/src/App.jsx`, `server/package.json`, `client/package.json`

---

## Bugs Fixed (Critical)

### 1. Broken `pdf-parse` import — server crash on startup

**File:** `server/src/index.js`  
**Severity:** Critical (server would not start)

`pdf-parse` does not expose a named `PDFParse` export, and the call pattern `new PDFParse({ data: buf }).getText()` is not part of its API.

```js
// Before — broken
const { PDFParse } = require("pdf-parse");
const parser = new PDFParse({ data: pdfBuffer });
const pdfResult = await parser.getText();

// After — correct
const pdfParse = require("pdf-parse");
const pdfResult = await pdfParse(pdfBuffer);
```

### 2. SHA-1 used in `hashId`

**File:** `server/src/index.js`  
**Severity:** Critical (violates crypto security policy)

SHA-1 is explicitly banned — it is deprecated, collision-vulnerable, and disallowed by the project's cryptographic guidelines.

```js
// Before
return crypto.createHash("sha1").update(value).digest("hex").slice(0, 12);

// After
return crypto.createHash("sha256").update(value).digest("hex").slice(0, 12);
```

---

## Security Issues Fixed

### 3. Open CORS (`*`) and unbounded request body

**File:** `server/src/index.js`

`app.use(cors())` allowed any origin to call the API. This widens the attack surface unnecessarily, even for a local tool. Also, `express.json()` had no body size limit.

```js
// Before
app.use(cors());
app.use(express.json());

// After
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
];
app.use(cors({ origin: (origin, cb) => {
  if (!origin || ALLOWED_ORIGINS.includes(origin)) cb(null, true);
  else cb(new Error("CORS: origin not allowed"));
}}));
app.use(express.json({ limit: "64kb" }));
```

### 4. `choiceIndex` not bounds-checked

**File:** `server/src/index.js` — `POST /api/study/answer`

A negative or non-integer `choiceIndex` was accepted, which could cause `card.choices[-1]` to return `undefined` and corrupt progress state.

```js
// Before
if (!cardId || typeof choiceIndex !== "number") { ... }

// After
if (!cardId || typeof choiceIndex !== "number"
    || !Number.isInteger(choiceIndex) || choiceIndex < 0) { ... }
```

### 5. No maximum length on note text

**File:** `server/src/index.js` — `POST /api/study/note`

Accepting arbitrarily long strings allows a client to write unbounded data to `progress-memory.json` on disk.

```js
// Added after the existing type check
if (text.length > 2000) {
  return res.status(400).json({ error: "Note text must be 2000 characters or fewer." });
}
```

### 6. User history array grows without bound

**File:** `server/src/index.js` — `POST /api/study/answer`

Every answer appended to `userState.history` with no trim, causing `progress-memory.json` to grow indefinitely.

```js
// Added after each history.push()
if (userState.history.length > 500) {
  userState.history = userState.history.slice(-500);
}
```

### 7. `Math.random()` used to generate user ID

**File:** `client/src/App.jsx`

`Math.random()` is not a CSPRNG — it provides only ~30 bits of entropy, making generated IDs predictable.

```js
// Before
const generated = `learner-${Math.random().toString(36).slice(2, 10)}`;

// After
const generated = `learner-${crypto.randomUUID()}`;
```

`crypto.randomUUID()` is available in all modern browsers and provides 128-bit cryptographically secure randomness.

---

## Remaining Observations (Out of Scope / By Design)

| # | Area | Note |
|---|------|------|
| 1 | `/api/tutor` rate limiting | No rate limit — repeated calls can exhaust OpenAI quota. Add `express-rate-limit` if the server is ever exposed beyond localhost. |
| 2 | `x-user-id` header trust | Used as a map key without validation. Acceptable for a local tool; requires authentication before any multi-user deployment. |
| 3 | No endpoint authentication | All endpoints are unauthenticated by design for local use. Safe while CORS is restricted to localhost. |
| 4 | `pdf-parse` version | v2.4.5 is a recent major release; test with actual PDF files to confirm parsing output is usable. |

---

## Validation

After all fixes, the server starts cleanly and returns 20 cards:

```
GET /api/study/session?subject=all  →  OK - cards: 20
```
