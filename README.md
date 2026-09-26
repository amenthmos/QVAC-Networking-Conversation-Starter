# QVAC-Networking-Conversation-Starter

Enter an event type and your role or field, get professional networking conversation-starter lines fitted to that context. On-device AI, no cloud call, no API key.

## Run

```bash
npm install
npm start
```

Then open http://localhost:30108

## QVAC SDK version

`@qvac/sdk` ^0.19.0 (see `package.json`).

## How it works

Built on [Tether's QVAC SDK](https://www.npmjs.com/package/@qvac/sdk) — all inference runs on-device, no cloud call, no API key. The app loads `LLAMA_3_2_1B_INST_Q4_0` locally with `loadModel()`, generates with `completion()` (streamed via `tokenStream`), and releases the model with `unloadModel()` on shutdown. The GUI (`src/gui.js`) is a small HTTP server: the page POSTs the form fields to `/api/starters`, which calls `generate(modelId, { eventType, roleField })` in `src/logic.js`.

## Example

**Input:** Event type: `tech startup conference` — Role/field: `product manager at a fintech startup`

**Output:**

```
- What's the most interesting fintech problem you've heard pitched here so far?
- I'm a PM in fintech — are you here more for the funding side or the product side?
- Which talk on the agenda are you most looking forward to?
- What's your team currently building that you're excited about?
- How's your company thinking about the recent shifts in fintech regulation?
```

## Grounding & fallback

`parseLines()` strips bullet markers and filters out short or header-only lines, keeping up to 5 usable conversation starters. If the model's output looks unusable or yields fewer than 3 usable lines, `fallbackStarters()` returns 5 deterministic starters built directly from the event type and role/field you typed.

## License

MIT
