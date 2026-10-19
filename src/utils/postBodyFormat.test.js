import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parsePostBody,
  truncatePostBody,
  getActiveComposeToken,
  replaceComposeToken,
  replaceActiveMentionToken,
  extractHashtags,
  rankMentionUsers,
  bodyToMentionEditorHtml,
  mentionEditorHtmlToBody,
  formatLabeledMention,
  toComposerDisplay,
  fromComposerDisplay,
  extractMentionedUserIds,
} from "./postBodyFormat.js";

describe("parsePostBody", () => {
  it("parses bold, italic, hashtags, and @handles", () => {
    const tokens = parsePostBody(
      "Hello *everyone*, I am _new_. Find #jobs with @ada",
    );
    const byType = Object.fromEntries(
      tokens.filter((t) => t.type !== "text").map((t) => [t.type, t]),
    );
    assert.equal(byType.bold.children[0].content, "everyone");
    assert.equal(byType.italic.children[0].content, "new");
    assert.equal(byType.hashtag.content, "jobs");
    assert.equal(byType.mention.content, "ada");
  });

  it("does not treat emails as mentions", () => {
    const tokens = parsePostBody("email me at ada@bejite.com");
    assert.equal(tokens.some((t) => t.type === "mention"), false);
  });

  it("parses labeled mentions with user ids", () => {
    const tokens = parsePostBody(
      "Hi @[Ada Okafor](11111111-1111-4111-8111-111111111111)",
    );
    assert.equal(tokens[1].type, "mention");
    assert.equal(tokens[1].label, "Ada Okafor");
    assert.equal(tokens[1].userId, "11111111-1111-4111-8111-111111111111");
  });

  it("still parses legacy **bold** and __italic__", () => {
    const tokens = parsePostBody("Keep **everyone** and __new__ working");
    const byType = Object.fromEntries(
      tokens.filter((t) => t.type !== "text").map((t) => [t.type, t]),
    );
    assert.equal(byType.bold.children[0].content, "everyone");
    assert.equal(byType.italic.children[0].content, "new");
  });

  it("parses apostrophes in @handles", () => {
    const tokens = parsePostBody("Hello @O'Brien");
    const mention = tokens.find((t) => t.type === "mention");
    assert.equal(mention?.content, "O'Brien");
  });

  it("does not italicize snake_case words", () => {
    const tokens = parsePostBody("use snake_case_word here");
    assert.equal(tokens.some((t) => t.type === "italic"), false);
  });
});

describe("truncatePostBody", () => {
  it("does not split bold markers", () => {
    const { tokens, truncated } = truncatePostBody(
      "Hello *everyone* and more text here",
      12,
    );
    assert.equal(truncated, true);
    assert.equal(
      tokens.some((t) => t.type === "bold"),
      false,
    );
    assert.equal(tokens[0].type, "text");
    assert.ok(!String(tokens[0].content).includes("*"));
  });

  it("keeps short bodies untruncated", () => {
    const { truncated } = truncatePostBody("Hi *Ada*", 200);
    assert.equal(truncated, false);
  });
});

describe("compose tokens", () => {
  it("detects a lone @ at the start of the field", () => {
    const token = getActiveComposeToken("@", 1);
    assert.equal(token.type, "mention");
    assert.equal(token.query, "");
    assert.equal(token.start, 0);
  });

  it("detects @ even when a trailing newline is present", () => {
    const token = getActiveComposeToken("@\n", 2);
    assert.equal(token.type, "mention");
    assert.equal(token.query, "");
    assert.equal(token.start, 0);
  });

  it("detects an @ query at the caret", () => {
    const token = getActiveComposeToken("Hello @ad", 9);
    assert.equal(token.type, "mention");
    assert.equal(token.query, "ad");
  });

  it("keeps the mention query open after @ with no letters yet", () => {
    const token = getActiveComposeToken("Hello @", 7);
    assert.equal(token.type, "mention");
    assert.equal(token.query, "");
  });

  it("keeps first-and-last-name typing inside the @ query", () => {
    const token = getActiveComposeToken("Hi @Ada Ok", 10);
    assert.equal(token.type, "mention");
    assert.equal(token.query, "Ada Ok");
  });

  it("keeps three-part names inside the @ query", () => {
    const text = "Hi @Ada Okeke Junior";
    const token = getActiveComposeToken(text, text.length);
    assert.equal(token.type, "mention");
    assert.equal(token.query, "Ada Okeke Junior");
  });

  it("replaces the active @ token with a handle", () => {
    const { next } = replaceComposeToken("Hello @ad", 9, 6, "@ada ");
    assert.equal(next, "Hello @ada ");
  });

  it("replaces @query before the caret instead of appending", () => {
    const { next } = replaceActiveMentionToken(
      "Hello @ar and more",
      9,
      "ar",
      "@[Arinze Macanthony](abc) ",
    );
    assert.equal(next, "Hello @[Arinze Macanthony](abc)  and more");
  });

  it("replaces @query in the middle of a longer post", () => {
    const body = "Intro\n\n@ar\n\n#WebDevelopment";
    const caret = body.indexOf("@ar") + 3;
    const { next } = replaceActiveMentionToken(
      body,
      caret,
      "ar",
      "@[Arinze Macanthony](abc) ",
    );
    assert.equal(next.includes("@ar"), false);
    assert.equal(next.includes("@[Arinze Macanthony](abc)"), true);
    assert.equal(next.includes("#WebDevelopment"), true);
  });
});

describe("rankMentionUsers", () => {
  it("keeps prefix matches ahead of contains matches", () => {
    const ranked = rankMentionUsers(
      [
        { id: 1, firstName: "Michael", lastName: "Richardson", username: "mike" },
        { id: 2, firstName: "Chioma", lastName: "Okeke", username: "chioma" },
      ],
      "ch",
    );
    assert.equal(ranked[0].id, 2);
  });

  it("keeps connected people ahead of better name matches", () => {
    const ranked = rankMentionUsers(
      [
        { id: 1, firstName: "Chioma", username: "chioma", connected: false },
        { id: 2, firstName: "Charles", username: "charles", connected: true },
      ],
      "ch",
    );
    assert.equal(ranked[0].id, 2);
  });
});

describe("extractHashtags", () => {
  it("returns unique lowercase tags", () => {
    assert.deepEqual(extractHashtags("#Jobs and #jobs"), ["jobs"]);
  });
});

describe("labeled mention chips", () => {
  it("formats a labeled mention for storage", () => {
    assert.equal(
      formatLabeledMention("Arinze Macanthony", "7838a698-f0d1-4a16-a618-0654fd5daac7"),
      "@[Arinze Macanthony](7838a698-f0d1-4a16-a618-0654fd5daac7)",
    );
  });

  it("renders a chip without showing the user id", () => {
    const html = bodyToMentionEditorHtml(
      "Hi @[Arinze Macanthony](7838a698-f0d1-4a16-a618-0654fd5daac7)",
    );
    assert.match(html, />@Arinze Macanthony<\/span>/);
    assert.match(html, /data-user-id="7838a698-f0d1-4a16-a618-0654fd5daac7"/);
    assert.equal(html.includes("@["), false);
  });

  it("round-trips labeled mentions through editor html", () => {
    const body = "Hi @[Ada Okafor](11111111-1111-4111-8111-111111111111) and @bola";
    assert.equal(mentionEditorHtmlToBody(bodyToMentionEditorHtml(body)), body);
  });

  it("hides ids in the composer and restores them after a pick", () => {
    const id = "7838a698-f0d1-4a16-a618-0654fd5daac7";
    const stored = `Hi @[Arinze Macanthony](${id})`;
    const display = toComposerDisplay(stored);
    assert.equal(display, "Hi @Arinze Macanthony");
    assert.equal(display.includes(id), false);
    assert.equal(
      fromComposerDisplay("Hi @Arinze Macanthony ", stored),
      `Hi @[Arinze Macanthony](${id}) `,
    );
  });

  it("keeps a typed @query until a person is picked", () => {
    assert.equal(fromComposerDisplay("Hello @ar", "", []), "Hello @ar");
  });

  it("keeps labeled ids when converting a picked mention", () => {
    const id = "7838a698-f0d1-4a16-a618-0654fd5daac7";
    const picked = `Hello @[Arinze Macanthony](${id}) `;
    assert.equal(fromComposerDisplay(picked, "Hello @ar", []), picked);
    assert.deepEqual(extractMentionedUserIds(picked), [id]);
  });

  it("keeps ids for every picked person", () => {
    const ada = "11111111-1111-4111-8111-111111111111";
    const bola = "22222222-2222-4222-8222-222222222222";
    const stored = `Hi @[Ada](${ada}) @[Bola](${bola})`;
    const display = toComposerDisplay(stored);
    assert.equal(display, "Hi @Ada @Bola");
    assert.deepEqual(extractMentionedUserIds(fromComposerDisplay(display, stored)), [
      ada,
      bola,
    ]);
    const afterSecondPick = fromComposerDisplay(
      `Hi @Ada @[Bola](${bola}) `,
      `Hi @[Ada](${ada}) @bo`,
      [{ label: "Bola", id: bola }],
    );
    assert.deepEqual(extractMentionedUserIds(afterSecondPick).sort(), [ada, bola].sort());
  });
});
