import {
  TARGET_DATE,
  TARGET_TIME,
  datePrankForAttempt,
  formatKoreanDate,
  formatKoreanTime,
  noButtonLabel,
  normalizeCustomMenu,
  validateSchedule,
} from "./logic.mjs";

const state = {
  dateAttempts: 0,
  noEscapes: 0,
  selectedMenu: "",
};

const screens = [...document.querySelectorAll(".screen")];
const stepCount = document.querySelector("#step-count");
const noButton = document.querySelector("#no-button");
const dateInput = document.querySelector("#date-input");
const scheduleForm = document.querySelector("#schedule-form");
const scheduleButton = document.querySelector("#schedule-button");
const dateStatus = document.querySelector("#date-status");
const dateLock = document.querySelector("#date-lock");
const menuButton = document.querySelector("#menu-button");
const menuStatus = document.querySelector("#menu-status");
const customMenuWrap = document.querySelector("#custom-menu-wrap");
const customMenuInput = document.querySelector("#custom-menu-input");
const toast = document.querySelector("#toast");
const koreanDate = formatKoreanDate(TARGET_DATE);
const koreanTime = formatKoreanTime(TARGET_TIME);
let promiseCardBlob;

document.querySelector("#header-schedule").textContent = `${TARGET_DATE.replaceAll("-", ".")} · ${TARGET_TIME}`;
document.querySelector("#fixed-time").textContent = koreanTime;
document.querySelector("#result-date").textContent = koreanDate;
document.querySelector("#result-time").textContent = koreanTime;

function showScreen(id) {
  screens.forEach((screen) => {
    const active = screen.id === id;
    screen.hidden = !active;
  });
  const active = document.querySelector(`#${id}`);
  stepCount.textContent = `${String(active.dataset.step).padStart(2, "0")} / 04`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function moveNoButton(event) {
  if (event?.cancelable) event.preventDefault();
  state.noEscapes += 1;
  noButton.textContent = noButtonLabel(state.noEscapes);
  noButton.classList.add("is-escaping");

  const padding = 14;
  const width = noButton.offsetWidth || 118;
  const height = noButton.offsetHeight || 54;
  const maxX = Math.max(padding, window.innerWidth - width - padding);
  const maxY = Math.max(padding, window.innerHeight - height - padding);
  const x = Math.min(maxX, Math.max(padding, Math.random() * maxX));
  const y = Math.min(maxY, Math.max(padding, Math.random() * maxY));
  noButton.style.left = `${x}px`;
  noButton.style.top = `${y}px`;
}

noButton.addEventListener("pointerenter", moveNoButton);
noButton.addEventListener("touchstart", moveNoButton, { passive: false });
noButton.addEventListener("click", moveNoButton);

document.querySelector("#yes-button").addEventListener("click", () => {
  noButton.classList.remove("is-escaping");
  noButton.removeAttribute("style");
  showScreen("screen-confirm");
  burstConfetti(28);
});

document.querySelector("#confirm-button").addEventListener("click", () => showScreen("screen-schedule"));

function setScheduleToTarget() {
  dateInput.value = TARGET_DATE;
  dateStatus.textContent = "그래, 역시 8월 16일이 제일 좋지.";
  scheduleButton.disabled = false;
}

document.querySelector("#accept-date-button").addEventListener("click", setScheduleToTarget);

scheduleButton.addEventListener("pointerenter", () => {
  if (state.dateAttempts === 2 && dateInput.value !== TARGET_DATE) {
    const x = (Math.random() - .5) * Math.min(240, window.innerWidth * .45);
    const y = (Math.random() - .5) * 100;
    scheduleButton.style.transform = `translate(${x}px, ${y}px)`;
    scheduleButton.textContent = "못 누르지롱";
  }
});

dateInput.addEventListener("change", () => {
  scheduleButton.removeAttribute("style");
  scheduleButton.textContent = "이 날 좋아";
  dateStatus.textContent = "";
});

scheduleButton.addEventListener("click", () => {
  scheduleButton.removeAttribute("style");
  scheduleButton.textContent = "이 날 좋아";
  const result = validateSchedule(dateInput.value, TARGET_TIME);

  if (result.ok) {
    showScreen("screen-menu");
    return;
  }

  state.dateAttempts += 1;
  const prank = datePrankForAttempt(state.dateAttempts);
  dateStatus.textContent = prank.message;

  if (prank.mode === "reset") {
    dateInput.value = "";
    dateInput.focus();
  } else if (prank.mode === "dodge") {
    scheduleForm.classList.remove("is-dodging");
    void scheduleForm.offsetWidth;
    scheduleForm.classList.add("is-dodging");
    setTimeout(() => {
      dateInput.value = "";
      scheduleForm.classList.remove("is-dodging");
    }, 650);
  } else {
    scheduleForm.classList.add("is-gone");
    dateLock.hidden = false;
    scheduleButton.disabled = true;
  }
});

document.querySelectorAll(".menu-card").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".menu-card").forEach((card) => card.classList.remove("is-selected"));
    button.classList.add("is-selected");
    const menu = button.dataset.menu;
    state.selectedMenu = menu === "기타" ? "" : menu;
    customMenuWrap.hidden = menu !== "기타";
    menuStatus.textContent = "";
    menuButton.disabled = menu === "기타";
    if (menu === "기타") {
      customMenuInput.focus();
    }
  });
});

customMenuInput.addEventListener("input", () => {
  state.selectedMenu = normalizeCustomMenu(customMenuInput.value);
  menuButton.disabled = !state.selectedMenu;
});

menuButton.addEventListener("click", () => {
  if (!state.selectedMenu) {
    menuStatus.textContent = "먹고 싶은 메뉴를 하나 적어줘.";
    return;
  }
  document.querySelector("#result-menu").textContent = state.selectedMenu;
  showScreen("screen-result");
  burstConfetti(40);
});

function drawPromiseCard() {
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = 720 * scale;
  canvas.height = 900 * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  ctx.fillStyle = "#090909";
  ctx.fillRect(0, 0, 720, 900);
  ctx.fillStyle = "#e31b23";
  ctx.fillRect(0, 0, 720, 22);
  ctx.fillRect(44, 95, 80, 10);

  ctx.fillStyle = "#77716d";
  ctx.font = "700 18px monospace";
  ctx.fillText("DATE MATCH · 2026", 44, 70);

  ctx.fillStyle = "#f7f5f2";
  ctx.font = "900 64px Arial, sans-serif";
  ctx.fillText("우리 둘,", 44, 180);
  ctx.fillText("출전 확정.", 44, 250);

  ctx.fillStyle = "#141414";
  ctx.fillRect(44, 320, 632, 380);
  ctx.strokeStyle = "#e31b23";
  ctx.lineWidth = 3;
  ctx.strokeRect(44, 320, 632, 380);

  ctx.fillStyle = "#e31b23";
  ctx.fillRect(44, 320, 632, 64);
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 20px monospace";
  ctx.fillText("BFC 1995 · DATE PROMISE", 70, 360);

  const rows = [
    ["날짜", koreanDate],
    ["시간", koreanTime],
    ["메뉴", state.selectedMenu],
  ];
  rows.forEach(([label, value], index) => {
    const y = 450 + index * 82;
    ctx.fillStyle = "#8d8782";
    ctx.font = "700 21px Arial, sans-serif";
    ctx.fillText(label, 72, y);
    ctx.fillStyle = "#f7f5f2";
    ctx.font = "900 27px Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(value, 646, y);
    ctx.textAlign = "left";
    if (index < 2) {
      ctx.strokeStyle = "#302d2b";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(70, y + 31); ctx.lineTo(650, y + 31); ctx.stroke();
    }
  });

  ctx.fillStyle = "#c8c2bd";
  ctx.font = "700 25px Arial, sans-serif";
  const [, month, day] = TARGET_DATE.split("-").map(Number);
  ctx.fillText(`성희야, ${month}월 ${day}일에 보자.`, 44, 780);
  ctx.fillStyle = "#e31b23";
  ctx.font = "900 22px monospace";
  ctx.fillText("SEONGHEE × ME", 44, 830);
  return canvas;
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

function getPromiseCardBlob() {
  promiseCardBlob ??= canvasToBlob(drawPromiseCard());
  return promiseCardBlob;
}

document.querySelector("#save-button").addEventListener("click", async () => {
  const blob = await getPromiseCardBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "우리의-8월16일-약속.png";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast("약속 카드를 저장했어");
});

document.querySelector("#share-button").addEventListener("click", async () => {
  const shareText = `성희야, 우리 ${koreanDate} ${koreanTime}에 ${state.selectedMenu} 먹으러 가자!`;
  try {
    const data = { title: "우리의 데이트 약속", text: shareText, url: location.href };

    if (navigator.share) {
      const blob = await getPromiseCardBlob();
      const file = new File([blob], "우리의-8월16일-약속.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) data.files = [file];
      await navigator.share(data);
      document.querySelector("#share-status").textContent = "공유 창에서 카카오톡을 골라줘.";
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${location.href}`);
      document.querySelector("#share-status").textContent = "내용을 복사했어. 카톡에 붙여넣으면 돼.";
    }
  } catch (error) {
    if (error.name !== "AbortError") {
      document.querySelector("#share-status").textContent = "공유가 안 되면 이미지 저장 버튼을 이용해줘.";
    }
  }
});

document.querySelector("#restart-button").addEventListener("click", () => location.reload());

function burstConfetti(amount) {
  const box = document.querySelector("#confetti");
  const colors = ["#e31b23", "#f7f5f2", "#2dff72"];
  for (let i = 0; i < amount; i += 1) {
    const piece = document.createElement("i");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * .45}s`;
    piece.style.setProperty("--drift", `${(Math.random() - .5) * 180}px`);
    box.append(piece);
    setTimeout(() => piece.remove(), 2800);
  }
}

const codeLines = [
  "const target = '성희';",
  "scan(schedule);",
  `date.lock('${TARGET_DATE.slice(5)}');`,
  `time.set('${TARGET_TIME}');`,
  "if (answer === '싫어') flee();",
  "choice.freedom = false;",
  "menu.awaitInput();",
  "heart.rate += 16;",
  "deploy(datePromise);",
  "console.log('성공?');",
  "retry(untilYes);",
  "status = '두근두근';",
];
let codeIndex = 0;
let codeTimer;
const codeLinesElement = document.querySelector("#code-lines");
function appendCodeLine() {
  const line = document.createElement("span");
  line.className = "code-line";
  line.dataset.n = String(codeIndex + 1).padStart(2, "0");
  line.textContent = codeLines[codeIndex % codeLines.length];
  codeLinesElement.append(line);
  while (codeLinesElement.children.length > 7) codeLinesElement.firstElementChild.remove();
  codeIndex += 1;
}
for (let i = 0; i < 6; i += 1) appendCodeLine();
function updateCodeFeed() {
  clearInterval(codeTimer);
  if (!document.hidden) codeTimer = setInterval(appendCodeLine, 720);
}
document.addEventListener("visibilitychange", updateCodeFeed);
updateCodeFeed();
