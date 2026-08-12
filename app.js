import {
  TARGET_DATE,
  TARGET_TIME,
  challengeIndexForAttempt,
  formatKoreanDate,
  formatKoreanTime,
  noButtonLabel,
  normalizeCustomMenu,
  pickFarPosition,
  shouldExplodeAfterAttempt,
  validateSchedule,
} from "./logic.mjs";

const state = {
  dateAttempts: 0,
  noEscapes: 0,
  selectedMenu: "",
};

const MATH_CHALLENGES = [
  {
    name: "Riemann hypothesis",
    expression: "ζ(s) = 0, &nbsp;0 &lt; Re(s) &lt; 1<br><strong>⟹ &nbsp;Re(s) = ½</strong>",
    prompt: "제타 함수의 비자명한 모든 영점에 대해 증명하시오.",
    rejection: "심사 결과: 아직 인류가 못 푼 문제래. 사랑의 용기는 인정 ♥",
  },
  {
    name: "Navier–Stokes existence & smoothness",
    expression: "∂u/∂t + (u·∇)u<br><strong>= −∇p + νΔu</strong><br>∇·u = 0",
    prompt: "3차원에서 해가 항상 존재하며 매끄러움을 증명하시오.",
    rejection: "유체가 너무 난리 났대. 수학계도 아직 답을 못 냈어 🥲",
  },
  {
    name: "Yang–Mills mass gap",
    expression: "D<sub>μ</sub>F<sup>μν</sup> = 0<br><strong>Δ = E₁ − E₀ &gt; 0</strong>",
    prompt: "양–밀스 이론의 존재성과 양의 질량 간극을 증명하시오.",
    rejection: "세 번째 난제도 미해결. 이제 달력이 직접 정하겠대 ㅋㅋ",
  },
];

const screens = [...document.querySelectorAll(".screen")];
const stepCount = document.querySelector("#step-count");
const noButton = document.querySelector("#no-button");
const dateInput = document.querySelector("#date-input");
const scheduleForm = document.querySelector("#schedule-form");
const scheduleButton = document.querySelector("#schedule-button");
const dateStatus = document.querySelector("#date-status");
const dateLock = document.querySelector("#date-lock");
const mathChallenge = document.querySelector("#math-challenge");
const proofInput = document.querySelector("#proof-input");
const proofStatus = document.querySelector("#proof-status");
const giveUpMathButton = document.querySelector("#give-up-math-button");
const problemCard = document.querySelector("#problem-card");
const problemName = document.querySelector("#problem-name");
const problemExpression = document.querySelector("#problem-expression");
const problemPrompt = document.querySelector("#problem-prompt");
const calendarExplosion = document.querySelector("#calendar-explosion");
const calendarDays = document.querySelector("#calendar-days");
const calendarExplosionCaption = document.querySelector("#calendar-explosion-caption");
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
  stepCount.textContent = `${active.dataset.step} / 4`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function moveEscapingControl(element, event) {
  if (event?.cancelable) event.preventDefault();
  const rect = element.getBoundingClientRect();
  const pointerX = Number.isFinite(event?.clientX) ? event.clientX : rect.left + rect.width / 2;
  const pointerY = Number.isFinite(event?.clientY) ? event.clientY : rect.top + rect.height / 2;
  const position = pickFarPosition({
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    elementWidth: rect.width || 118,
    elementHeight: rect.height || 54,
    pointerX,
    pointerY,
    padding: 14,
  });
  element.classList.add("is-escaping");
  element.style.left = `${position.x}px`;
  element.style.top = `${position.y}px`;
}

function moveNoButton(event) {
  if (event?.type === "click" && event.detail !== 0) return;
  state.noEscapes += 1;
  noButton.textContent = noButtonLabel(state.noEscapes);
  moveEscapingControl(noButton, event);
}

noButton.addEventListener("pointerenter", (event) => {
  if (event.pointerType !== "touch") moveNoButton(event);
});
noButton.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "touch") moveNoButton(event);
});
noButton.addEventListener("click", moveNoButton);

document.querySelector("#yes-button").addEventListener("click", () => {
  noButton.classList.remove("is-escaping");
  noButton.removeAttribute("style");
  showScreen("screen-confirm");
  burstConfetti(28);
});

document.querySelector("#confirm-button").addEventListener("click", () => showScreen("screen-schedule"));

function setScheduleToTarget() {
  scheduleForm.hidden = false;
  scheduleForm.classList.remove("is-gone");
  mathChallenge.hidden = true;
  calendarExplosion.hidden = true;
  dateLock.hidden = true;
  scheduleButton.hidden = false;
  dateInput.value = TARGET_DATE;
  scheduleButton.removeAttribute("style");
  scheduleButton.textContent = "이 날로 할래";
  dateStatus.textContent = "그래, 우리 8월 16일에 만나자 ♥";
  scheduleButton.disabled = false;
}

document.querySelector("#accept-date-button").addEventListener("click", setScheduleToTarget);

function showMathChallenge(attempt) {
  const problem = MATH_CHALLENGES[challengeIndexForAttempt(attempt, MATH_CHALLENGES.length)];
  problemName.textContent = problem.name;
  problemExpression.innerHTML = problem.expression;
  problemPrompt.textContent = problem.prompt;
  problemCard.setAttribute("aria-label", `${problem.name}. ${problem.prompt}`);
  scheduleForm.hidden = true;
  scheduleButton.hidden = true;
  dateLock.hidden = true;
  calendarExplosion.hidden = true;
  mathChallenge.hidden = false;
  dateStatus.textContent = "";
  proofInput.value = "";
  proofStatus.textContent = "";
  giveUpMathButton.hidden = true;
  proofInput.focus();
}

document.querySelector("#proof-button").addEventListener("click", () => {
  if (!proofInput.value.trim()) {
    proofStatus.textContent = "증명 과정을 한 줄이라도 써줘야 심사하지 🤓";
    proofInput.focus();
    return;
  }

  proofStatus.textContent = MATH_CHALLENGES[challengeIndexForAttempt(state.dateAttempts, MATH_CHALLENGES.length)].rejection;
  giveUpMathButton.textContent = !shouldExplodeAfterAttempt(state.dateAttempts, MATH_CHALLENGES.length)
    ? `다른 날짜로 다시 도전 (${state.dateAttempts + 1}/3)`
    : "달력의 운명 보기";
  giveUpMathButton.hidden = false;
});

giveUpMathButton.addEventListener("click", () => {
  if (shouldExplodeAfterAttempt(state.dateAttempts, MATH_CHALLENGES.length)) {
    explodeCalendar();
    return;
  }

  mathChallenge.hidden = true;
  scheduleForm.hidden = false;
  scheduleButton.hidden = false;
  dateInput.value = "";
  dateStatus.textContent = `다음 기회 ${state.dateAttempts + 1}/3. 이번엔 다른 날을 골라봐.`;
  dateInput.focus();
});

function buildCalendar() {
  const firstDay = new Date(2026, 7, 1).getDay();
  for (let i = 0; i < firstDay; i += 1) {
    const blank = document.createElement("span");
    blank.className = "calendar-blank";
    calendarDays.append(blank);
  }

  for (let day = 1; day <= 31; day += 1) {
    const cell = document.createElement("span");
    cell.className = `calendar-day${day === 16 ? " is-target" : ""}`;
    cell.textContent = day;
    cell.setAttribute("aria-label", `8월 ${day}일${day === 16 ? ", 남은 날짜" : ""}`);
    const angle = (day * 47) * Math.PI / 180;
    const distance = 75 + (day % 5) * 17;
    cell.style.setProperty("--blast-x", `${Math.cos(angle) * distance}px`);
    cell.style.setProperty("--blast-y", `${Math.sin(angle) * distance}px`);
    cell.style.setProperty("--blast-r", `${day % 2 ? 260 : -240}deg`);
    cell.style.setProperty("--delay", `${(day % 8) * .045}s`);
    calendarDays.append(cell);
  }
}

function explodeCalendar() {
  mathChallenge.hidden = true;
  scheduleForm.hidden = true;
  scheduleButton.hidden = true;
  dateLock.hidden = true;
  calendarExplosion.hidden = false;
  calendarDays.classList.remove("is-exploding", "is-settled");
  void calendarDays.offsetWidth;
  calendarDays.classList.add("is-exploding");
  calendarExplosionCaption.textContent = "펑! 16일 빼고 전부 사라지는 중...";
  burstConfetti(34);

  window.setTimeout(() => {
    calendarDays.classList.remove("is-exploding");
    calendarDays.classList.add("is-settled");
    dateInput.min = TARGET_DATE;
    dateInput.max = TARGET_DATE;
    dateInput.value = TARGET_DATE;
    calendarExplosionCaption.textContent = "진짜 16일 하나만 남았네 ♥";
    dateLock.querySelector("p").textContent = "이쯤이면 8월 16일이 운명 맞지? 💌";
    document.querySelector("#accept-date-button").textContent = "남은 16일로 약속하기";
    dateLock.hidden = false;
  }, 1450);
}

buildCalendar();

dateInput.addEventListener("change", () => {
  scheduleButton.removeAttribute("style");
  scheduleButton.textContent = "이 날로 할래";
  dateStatus.textContent = "";
});

scheduleButton.addEventListener("click", () => {
  if (!dateInput.value) {
    dateStatus.textContent = "날짜를 먼저 골라줘.";
    dateInput.focus();
    return;
  }
  const result = validateSchedule(dateInput.value, TARGET_TIME);

  if (result.ok) {
    showScreen("screen-menu");
    return;
  }

  state.dateAttempts += 1;
  showMathChallenge(state.dateAttempts);
});

document.querySelectorAll(".menu-card").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".menu-card").forEach((card) => card.classList.remove("is-selected"));
    button.classList.add("is-selected");
    const menu = button.dataset.menu;
    state.selectedMenu = menu === "기타" ? normalizeCustomMenu(customMenuInput.value) : menu;
    customMenuWrap.hidden = menu !== "기타";
    menuStatus.textContent = "";
    menuButton.disabled = !state.selectedMenu;
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
  promiseCardBlob = getPromiseCardBlob();
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

  const gradient = ctx.createLinearGradient(0, 0, 720, 900);
  gradient.addColorStop(0, "#fff9fb");
  gradient.addColorStop(1, "#ffe8ef");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 720, 900);

  ctx.fillStyle = "#ffd2df";
  ctx.beginPath(); ctx.arc(650, 92, 112, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(54, 820, 88, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#c9213a";
  ctx.font = "700 38px 'Segoe UI Symbol', sans-serif";
  ctx.fillText("♥", 610, 104);
  ctx.fillText("♥", 60, 806);

  ctx.fillStyle = "#b66a7c";
  ctx.font = "600 19px 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
  ctx.fillText("성희에게 보내는 작은 약속", 52, 74);

  ctx.fillStyle = "#57343d";
  ctx.font = "800 49px 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
  ctx.fillText("우리 약속 생겼다 ♥", 52, 154);
  ctx.fillStyle = "#946a75";
  ctx.font = "500 24px 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
  ctx.fillText("8월 16일이 조금 더 기다려질 것 같아.", 52, 202);

  roundedRect(ctx, 42, 266, 636, 396, 30);
  ctx.fillStyle = "rgba(255,255,255,.92)";
  ctx.fill();
  ctx.strokeStyle = "#f1a9ba";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#c9213a";
  ctx.font = "700 22px 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
  ctx.fillText("우리의 데이트 약속", 72, 318);

  const rows = [
    ["날짜", koreanDate],
    ["시간", koreanTime],
    ["메뉴", state.selectedMenu],
  ];
  rows.forEach(([label, value], index) => {
    const y = 402 + index * 88;
    ctx.fillStyle = "#aa7c88";
    ctx.font = "600 21px 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
    ctx.fillText(label, 72, y);
    ctx.fillStyle = "#57343d";
    ctx.font = "700 28px 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(value, 646, y);
    ctx.textAlign = "left";
    if (index < 2) {
      ctx.strokeStyle = "#f2d9df";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(70, y + 31); ctx.lineTo(650, y + 31); ctx.stroke();
    }
  });

  ctx.fillStyle = "#57343d";
  ctx.font = "600 27px 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
  const [, month, day] = TARGET_DATE.split("-").map(Number);
  ctx.fillText(`성희야, ${month}월 ${day}일 오후 네 시에 보자 :)`, 52, 752);
  ctx.fillStyle = "#c9213a";
  ctx.font = "700 23px 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
  ctx.fillText("성희랑 나, 둘이서 ♥", 52, 804);
  return canvas;
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
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
  const shareText = `성희야, 우리 ${koreanDate} ${koreanTime}에 ${state.selectedMenu} 먹으러 가자 ♥`;
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
  const colors = ["#c9213a", "#ffd2df", "#ffffff", "#f3a3b8"];
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
