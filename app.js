"use strict";

/* ── 안내 메뉴 내용 ──────────────────────────────────────────
 * body는 HTML 문자열. 폴라리스 공지
 * "2026학년도 콕(KKOK) 마일리지 제도 안내" 원문 기준으로 채울 것.
 */
const TODO = '<p class="todo">학교 공지 원문을 확인한 뒤 채울 예정이에요.</p>';
const GUIDE = [
  {
    id: "about",
    title: "콕 마일리지란?",
    children: [
      { id: "overview", title: "개요", body: TODO },
      { id: "minimum", title: "최소 조건", body: TODO },
      { id: "earn", title: "쌓는 방법", body: TODO },
      { id: "calc", title: "산출 방법", body: TODO },
    ],
  },
];
const LINKS = [
  { title: "폴라리스 바로가기", href: "https://polaris.ks.ac.kr/" },
];

const POLARIS = "https://polaris.ks.ac.kr/";
const SORTS = ["deadline", "mileage", "popular", "latest"];
const TAG_CLASS = { 자기관리역량: "t1", 디지털기술역량: "t2", 공감소통역량: "t3", 창의융합역량: "t4" };
const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

const $ = (id) => document.getElementById(id);
const state = { items: [], sort: "deadline", openOnly: true };

/* ── 유틸 ── */
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function safeUrl(u) {
  return typeof u === "string" && u.startsWith(POLARIS) ? u : POLARIS;
}
function todayKST() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" }); // YYYY-MM-DD
}
function toDay(ymd) {
  if (!ymd) return NaN;
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86400000;
}
function fmt(ymd, withWeek = false) {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-").map(Number);
  const w = WEEK[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${m}.${d}${withWeek ? `(${w})` : ""}`;
}
function range(a, b) {
  if (!a) return "";
  return a === b || !b ? fmt(a, true) : `${fmt(a)} ~ ${fmt(b)}`;
}
function load(key, fallback) {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(key, val); } catch { /* 저장 불가 환경 무시 */ }
}

/* ── 데이터 가공 ── */
function enrich(p, today) {
  const dday = toDay(p.apply_end) - today;
  const sinceStart = Math.max(1, today - toDay(p.apply_start) + 1);
  const closed = /마감/.test(p.status || "") || !(dday >= 0);
  return {
    ...p,
    dday,
    closed,
    // 조회수 누적 편향 보정: 신청 시작 후 경과일로 나눈 일평균 조회수
    viewsPerDay: (p.views || 0) / sinceStart,
  };
}

const byDeadline = (a, b) => (a.closed - b.closed) || (a.dday - b.dday);
const COMPARE = {
  deadline: byDeadline,
  mileage: (a, b) => (a.closed - b.closed) || ((b.mileage || 0) - (a.mileage || 0)) || byDeadline(a, b),
  popular: (a, b) => (a.closed - b.closed) || (b.viewsPerDay - a.viewsPerDay),
  latest: (a, b) => (toDay(b.apply_start) - toDay(a.apply_start)) || byDeadline(a, b),
};

/* ── 렌더링 ── */
function ddayBadge(p) {
  if (p.closed) return '<span class="badge off">마감</span>';
  const label = p.dday === 0 ? "D-DAY" : `D-${p.dday}`;
  return `<span class="badge${p.dday <= 2 ? " urgent" : ""}">${label}</span>`;
}

function card(p) {
  const tags = (p.competencies || [])
    .map((c) => `<span class="tag ${TAG_CLASS[c] || "t0"}">${esc(c.replace(/역량$/, ""))}</span>`)
    .join("");
  const extra = state.sort === "popular"
    ? `<span>하루 ${Math.round(p.viewsPerDay)}회 조회</span>`
    : `<span>조회 ${esc((p.views ?? 0).toLocaleString())}</span>`;
  return `
<li class="card${p.closed ? " closed" : ""}">
  <a href="${esc(safeUrl(p.url))}" target="_blank" rel="noopener noreferrer">
    <div class="card-top">
      ${ddayBadge(p)}
      <span class="status">${esc(p.status)}</span>
      <span class="mileage"><b>${esc(p.mileage ?? "-")}</b>점</span>
    </div>
    <h2 class="title">${esc(p.title)}</h2>
    ${p.benefit ? `<p class="benefit">🎁 ${esc(p.benefit)}</p>` : ""}
    <div class="meta">
      <span>신청 ~${esc(fmt(p.apply_end, true))}</span>
      <span>진행 ${esc(range(p.course_start, p.course_end))}</span>
      ${extra}
    </div>
    ${tags ? `<div class="tags">${tags}</div>` : ""}
  </a>
</li>`;
}

function render() {
  const rows = state.items
    .filter((p) => !state.openOnly || !p.closed)
    .sort(COMPARE[state.sort]);
  $("list").innerHTML = rows.map(card).join("");
  $("empty").hidden = rows.length > 0;
  $("count").textContent = `${rows.length}개`;
  document.querySelectorAll("#sortChips .chip").forEach((b) =>
    b.setAttribute("aria-checked", String(b.dataset.sort === state.sort)));
}

/* ── 드로어 ── */
function buildMenu() {
  const groups = GUIDE.map((g) => `
<li class="group" data-group="${g.id}">
  <button type="button" aria-expanded="false">${esc(g.title)}<span class="caret">›</span></button>
  <ul class="sub">
    ${g.children.map((c) => `<li><button type="button" data-guide="${g.id}/${c.id}">${esc(c.title)}</button></li>`).join("")}
  </ul>
</li>`).join("");
  const links = LINKS.map((l) =>
    `<li><a href="${esc(l.href)}" target="_blank" rel="noopener noreferrer">${esc(l.title)}<span class="ext">↗</span></a></li>`).join("");
  $("menu").innerHTML = groups + "<li><hr></li>" + links;

  $("menu").addEventListener("click", (e) => {
    const g = e.target.closest(".group > button");
    if (g) {
      const li = g.parentElement;
      li.classList.toggle("open");
      g.setAttribute("aria-expanded", String(li.classList.contains("open")));
      return;
    }
    const s = e.target.closest("[data-guide]");
    if (s) {
      closeDrawer();
      location.hash = `#guide/${s.dataset.guide}`;
    }
  });
}

function openDrawer() {
  $("drawer").classList.add("open");
  $("drawer").inert = false;
  $("scrim").hidden = false;
  $("menuBtn").setAttribute("aria-expanded", "true");
  $("closeBtn").focus();
}
function closeDrawer() {
  $("drawer").classList.remove("open");
  $("drawer").inert = true;
  $("scrim").hidden = true;
  $("menuBtn").setAttribute("aria-expanded", "false");
}

/* ── 안내 화면 (해시 라우팅: 휴대폰 뒤로가기 지원) ── */
function route() {
  const m = location.hash.match(/^#guide\/([\w-]+)\/([\w-]+)$/);
  const g = m && GUIDE.find((x) => x.id === m[1]);
  const idx = g ? g.children.findIndex((x) => x.id === m[2]) : -1;
  if (idx < 0) {
    $("guideView").hidden = true;
    document.body.style.overflow = "";
    return;
  }
  const c = g.children[idx];
  const others = g.children.filter((x) => x !== c);
  $("guideCrumb").textContent = g.title;
  $("guideBody").innerHTML = `
    <h2>${esc(c.title)}</h2>
    ${c.body}
    <div class="next">
      ${others.map((o) => `<button type="button" data-guide="${g.id}/${o.id}">${esc(o.title)} →</button>`).join("")}
    </div>`;
  $("guideView").hidden = false;
  $("guideView").scrollTop = 0;
  document.body.style.overflow = "hidden";
}

/* ── 초기화 ── */
async function init() {
  state.sort = SORTS.includes(load("sort")) ? load("sort") : "deadline";
  state.openOnly = load("openOnly", "1") === "1";
  $("openOnly").checked = state.openOnly;

  buildMenu();
  $("menuBtn").addEventListener("click", openDrawer);
  $("closeBtn").addEventListener("click", closeDrawer);
  $("scrim").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });
  $("backBtn").addEventListener("click", () => {
    history.length > 1 ? history.back() : (location.hash = "");
  });
  $("guideBody").addEventListener("click", (e) => {
    const b = e.target.closest("[data-guide]");
    if (b) location.hash = `#guide/${b.dataset.guide}`;
  });
  window.addEventListener("hashchange", route);
  route();

  $("sortChips").addEventListener("click", (e) => {
    const b = e.target.closest("[data-sort]");
    if (!b) return;
    state.sort = b.dataset.sort;
    save("sort", state.sort);
    render();
    window.scrollTo({ top: 0 });
  });
  $("openOnly").addEventListener("change", (e) => {
    state.openOnly = e.target.checked;
    save("openOnly", state.openOnly ? "1" : "0");
    render();
  });

  try {
    const res = await fetch("data/programs.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    const today = toDay(todayKST());
    state.items = (data.programs || []).map((p) => enrich(p, today));
    const t = new Date(data.updated_at);
    $("updated").textContent = isNaN(t)
      ? ""
      : `${t.toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })} 업데이트`;
    render();
  } catch (err) {
    $("updated").textContent = "데이터를 불러오지 못했어요";
    $("empty").textContent = "잠시 후 다시 시도해 주세요.";
    $("empty").hidden = false;
  }
}

init();
