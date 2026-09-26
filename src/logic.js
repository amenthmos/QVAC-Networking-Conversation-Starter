// QVAC Networking Conversation Starter — core logic.
// Turns an event type + role/field into 5 professional networking
// conversation-starter lines fitted to that specific context.

import { completion } from "@qvac/sdk";

function looksUnusable(text) {
  if (!text || text.trim().length < 10) return true;
  const bad = ["i cannot", "i can't", "as an ai", "i'm not able", "not enough information"];
  const lower = text.toLowerCase();
  return bad.some((phrase) => lower.includes(phrase));
}

function stripPreamble(text) {
  return text
    .trim()
    .replace(/^here'?s[^:\n]*:\s*/i, "")
    .replace(/^sure[,!]?\s*/i, "")
    .trim();
}

function parseLines(text, max) {
  return text
    .split("\n")
    .map((l) => l.trim().replace(/^[-*•\d.)\s]+/, "").trim())
    .filter((l) => l.length > 5 && !/^(conversation|question|starter)s?:?$/i.test(l))
    .slice(0, max);
}

function fallbackStarters(eventType, roleField) {
  return [
    `What brought you to ${eventType.trim()} this time around?`,
    `I work in ${roleField.trim()} — what's been keeping you busy in your corner of the field lately?`,
    `Is there a session or conversation here so far that's stuck with you?`,
    `What's a project you're excited about right now?`,
    `What's the biggest change you've seen in ${roleField.trim()} recently?`,
  ];
}

export async function generate(modelId, { eventType, roleField }) {
  const event = (eventType || "").trim();
  const role = (roleField || "").trim();
  if (!event || !role) {
    return { error: "Please enter both the event type and your role or field." };
  }

  const run = completion({
    modelId,
    history: [
      {
        role: "system",
        content:
          "You write professional networking conversation-starter lines — for approaching strangers at industry " +
          "events, not casual icebreakers for friends. Given an event type and the user's role/field, write exactly " +
          "5 conversation-starter lines fitted to that specific context, one per line, no numbering needed beyond a dash. " +
          "Reply with ONLY the 5 lines, no preamble.",
      },
      {
        role: "user",
        content: "Event type: tech startup conference\nRole/field: product manager at a fintech startup",
      },
      {
        role: "assistant",
        content:
          "- What's the most interesting fintech problem you've heard pitched here so far?\n" +
          "- I'm a PM in fintech — are you here more for the funding side or the product side?\n" +
          "- Which talk on the agenda are you most looking forward to?\n" +
          "- What's your team currently building that you're excited about?\n" +
          "- How's your company thinking about the recent shifts in fintech regulation?",
      },
      { role: "user", content: `Event type: ${event}\nRole/field: ${role}` },
    ],
    stream: true,
    completionOpts: { temperature: 0.8, maxTokens: 300 },
  });

  let text = "";
  for await (const token of run.tokenStream) text += token;
  text = stripPreamble(text);

  let starters;
  if (looksUnusable(text)) {
    starters = fallbackStarters(event, role);
  } else {
    starters = parseLines(text, 5);
    if (starters.length < 3) starters = fallbackStarters(event, role);
  }

  return { starters };
}
