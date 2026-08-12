export const TARGET_DATE = "2026-08-16";
export const TARGET_TIME = "16:00";

export function validateSchedule(date, time) {
  if (date !== TARGET_DATE) return { ok: false, reason: "date" };
  if (time !== TARGET_TIME) return { ok: false, reason: "time" };
  return { ok: true };
}

export function challengeIndexForAttempt(attempt, totalChallenges = 3) {
  return Math.min(Math.max(attempt, 1), totalChallenges) - 1;
}

export function shouldExplodeAfterAttempt(attempt, totalChallenges = 3) {
  return attempt >= totalChallenges;
}

export function noButtonLabel(escapeCount) {
  return escapeCount >= 2 ? "못 누르지롱" : "싫어";
}

export function normalizeCustomMenu(value) {
  return value.trim().slice(0, 18);
}

export function formatKoreanDate(date) {
  const [year, month, day] = date.split("-").map(Number);
  return `${year}년 ${month}월 ${day}일`;
}

export function formatKoreanTime(time) {
  const [hour, minute] = time.split(":").map(Number);
  const period = hour < 12 ? "오전" : "오후";
  const displayHour = hour % 12 || 12;
  return `${period} ${displayHour}:${String(minute).padStart(2, "0")}`;
}

export function pickFarPosition({
  viewportWidth,
  viewportHeight,
  elementWidth,
  elementHeight,
  pointerX,
  pointerY,
  padding = 12,
  random = Math.random,
}) {
  const maxX = Math.max(padding, viewportWidth - elementWidth - padding);
  const maxY = Math.max(padding, viewportHeight - elementHeight - padding);
  const jitterX = Math.max(0, (maxX - padding) * 0.18);
  const jitterY = Math.max(0, (maxY - padding) * 0.14);
  const candidates = [
    { x: padding + random() * jitterX, y: padding + random() * jitterY },
    { x: maxX - random() * jitterX, y: padding + random() * jitterY },
    { x: padding + random() * jitterX, y: maxY - random() * jitterY },
    { x: maxX - random() * jitterX, y: maxY - random() * jitterY },
  ];

  return candidates.reduce((farthest, candidate) => {
    const candidateDistance = Math.hypot(candidate.x - pointerX, candidate.y - pointerY);
    const farthestDistance = Math.hypot(farthest.x - pointerX, farthest.y - pointerY);
    return candidateDistance > farthestDistance ? candidate : farthest;
  });
}
