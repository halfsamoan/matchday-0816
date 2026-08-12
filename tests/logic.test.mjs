import test from "node:test";
import assert from "node:assert/strict";

import {
  TARGET_DATE,
  TARGET_TIME,
  datePrankForAttempt,
  formatKoreanDate,
  formatKoreanTime,
  noButtonLabel,
  normalizeCustomMenu,
  validateSchedule,
} from "../logic.mjs";

test("the invitation accepts only August 16, 2026 at 4 PM", () => {
  assert.deepEqual(validateSchedule(TARGET_DATE, TARGET_TIME), { ok: true });
  assert.equal(validateSchedule("2026-08-15", TARGET_TIME).reason, "date");
  assert.equal(validateSchedule(TARGET_DATE, "17:00").reason, "time");
});

test("wrong-date pranks escalate across three attempts", () => {
  assert.equal(datePrankForAttempt(1).mode, "reset");
  assert.equal(datePrankForAttempt(2).mode, "dodge");
  assert.equal(datePrankForAttempt(3).mode, "lock");
  assert.equal(datePrankForAttempt(8).mode, "lock");
});

test("the no button gets cheekier after its second escape", () => {
  assert.equal(noButtonLabel(1), "싫어");
  assert.equal(noButtonLabel(2), "못 누르지롱");
  assert.equal(noButtonLabel(7), "못 누르지롱");
});

test("custom food is trimmed and limited to a card-friendly length", () => {
  assert.equal(normalizeCustomMenu("  닭갈비  "), "닭갈비");
  assert.equal(normalizeCustomMenu("가".repeat(30)).length, 18);
  assert.equal(normalizeCustomMenu("    "), "");
});

test("the fixed date is rendered naturally in Korean", () => {
  assert.equal(formatKoreanDate(TARGET_DATE), "2026년 8월 16일");
  assert.equal(formatKoreanTime(TARGET_TIME), "오후 4:00");
});
