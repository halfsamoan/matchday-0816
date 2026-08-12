export const TARGET_DATE = "2026-08-16";
export const TARGET_TIME = "16:00";

export function validateSchedule(date, time) {
  if (date !== TARGET_DATE) return { ok: false, reason: "date" };
  if (time !== TARGET_TIME) return { ok: false, reason: "time" };
  return { ok: true };
}

export function datePrankForAttempt(attempt) {
  if (attempt <= 1) {
    return {
      mode: "reset",
      message: "어라? 그날은 나 안 되는데 🙄",
    };
  }

  if (attempt === 2) {
    return {
      mode: "dodge",
      message: "아직도 다른 날을 누르네? 못 누르지롱.",
    };
  }

  return {
    mode: "lock",
    message: "선택권이 갑자기 사라졌습니다.",
  };
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
