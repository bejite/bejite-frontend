import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  chatDayKey,
  formatChatDayLabel,
  formatChatMessageTime,
  groupMessagesByDay,
} from "./chatTimeUtils.js";

const now = new Date(2026, 7, 31, 15, 30, 0); // Monday 31 Aug 2026 local

describe("chatDayKey", () => {
  it("returns a local YYYY-MM-DD key", () => {
    assert.equal(chatDayKey(new Date(2026, 7, 31, 9, 5).toISOString()), "2026-08-31");
  });

  it("returns empty for missing or invalid dates", () => {
    assert.equal(chatDayKey(""), "");
    assert.equal(chatDayKey("not-a-date"), "");
  });
});

describe("formatChatDayLabel", () => {
  it("labels today and yesterday", () => {
    assert.equal(formatChatDayLabel(new Date(2026, 7, 31, 8, 0), now), "Today");
    assert.equal(formatChatDayLabel(new Date(2026, 7, 30, 22, 0), now), "Yesterday");
  });

  it("uses the weekday for other days in the last week", () => {
    assert.equal(formatChatDayLabel(new Date(2026, 7, 29, 12, 0), now), "Saturday");
    assert.equal(formatChatDayLabel(new Date(2026, 7, 25, 12, 0), now), "Tuesday");
  });

  it("uses day and month for older dates in the same year", () => {
    assert.equal(formatChatDayLabel(new Date(2026, 7, 20, 12, 0), now), "20 August");
  });

  it("includes the year when the message is from another year", () => {
    assert.equal(
      formatChatDayLabel(new Date(2025, 11, 25, 12, 0), now),
      "25 December 2025",
    );
  });
});

describe("groupMessagesByDay", () => {
  it("keeps consecutive same-day messages in one group", () => {
    const groups = groupMessagesByDay([
      { id: 1, created_at: new Date(2026, 7, 30, 10, 0).toISOString() },
      { id: 2, created_at: new Date(2026, 7, 30, 18, 0).toISOString() },
      { id: 3, created_at: new Date(2026, 7, 31, 9, 0).toISOString() },
    ]);
    assert.equal(groups.length, 2);
    assert.deepEqual(
      groups.map((g) => g.messages.map((m) => m.id)),
      [
        [1, 2],
        [3],
      ],
    );
  });
});

describe("formatChatMessageTime", () => {
  it("returns clock time only", () => {
    const label = formatChatMessageTime(new Date(2026, 7, 31, 15, 28).toString());
    assert.match(label, /3:28/);
    assert.match(label, /PM/i);
    assert.equal(/mon/i.test(label), false);
  });
});
