import test from "node:test";
import assert from "node:assert/strict";

import {
  TARGET_DATE,
  TARGET_TIME,
  challengeIndexForAttempt,
  formatKoreanDate,
  formatKoreanTime,
  pickFarPosition,
  shouldExplodeAfterAttempt,
  noButtonLabel,
  normalizeCustomMenu,
  validateSchedule,
} from "../logic.mjs";

test("the invitation accepts only August 16, 2026 at 4 PM", () => {
  assert.deepEqual(validateSchedule(TARGET_DATE, TARGET_TIME), { ok: true });
  assert.equal(validateSchedule("2026-08-15", TARGET_TIME).reason, "date");
  assert.equal(validateSchedule(TARGET_DATE, "17:00").reason, "time");
});

test("three wrong-date challenges end with the calendar explosion", () => {
  assert.equal(challengeIndexForAttempt(1), 0);
  assert.equal(challengeIndexForAttempt(2), 1);
  assert.equal(challengeIndexForAttempt(3), 2);
  assert.equal(challengeIndexForAttempt(8), 2);
  assert.equal(shouldExplodeAfterAttempt(2), false);
  assert.equal(shouldExplodeAfterAttempt(3), true);
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

test("escaping controls choose a far, visible viewport position", () => {
  const position = pickFarPosition({
    viewportWidth: 390,
    viewportHeight: 844,
    elementWidth: 120,
    elementHeight: 54,
    pointerX: 330,
    pointerY: 720,
    random: () => 0.5,
  });

  assert.ok(position.x >= 12 && position.x <= 258);
  assert.ok(position.y >= 12 && position.y <= 778);
  assert.ok(Math.hypot(position.x - 330, position.y - 720) > 500);
});
