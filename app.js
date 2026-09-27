"use strict";

/* ── 안내 메뉴 내용 ──────────────────────────────────────────
 * body는 HTML 문자열. 폴라리스 공지
 * "2026학년도 콕(KKOK) 마일리지 제도 안내" 원문 기준으로 채울 것.
 */
const SRC_DETAIL = '<p class="src">출처: 2026학년도 콕(KKOK) 마일리지 항목별 세부사항 안내서 (성과관리센터)</p>';
const SRC_BOARD = '<p class="src">출처: 폴라리스 게시글 「콕(KKOK) 마일리지는?」</p>';
const NOSHOW_URL =
  "https://polaris.ks.ac.kr/site/program/board/basicboard/view?menuid=001005001&amp;pagesize=10&amp;boardtypeid=20&amp;boardid=19805";

/* 항목별 배점표 — [항목, 점수, 필수여부] */
const SCORES = [
  ["전공실무", [
    ["국가기술/전문 자격증", "30"], ["(국가공인)민간·기타 자격증", "20"],
    ["핵심역량진단검사", "10", 1], ["직업기초역량진단검사", "5", 1],
    ["교내 대회 수상", "5·10·20"], ["교외 대회 수상 (시도·지역)", "70"], ["교외 대회 수상 (국제·전국)", "80"],
  ]],
  ["진로·상담", [
    ["맞춤형 진로상담", "5", 1], ["진로 집단상담", "25"], ["진로교육 (특강·워크숍)", "5~35"],
    ["진로활동 (캠프·동아리 등)", "20"], ["접수면접", "5"], ["심리검사 (해석·상담)", "5"],
    ["집단상담", "25"], ["폭력예방교육", "5"],
  ]],
  ["취·창업", [
    ["취업역량진단검사", "5", 1], ["맞춤형 취업상담", "5", 1], ["취업특강", "5~35"], ["취업교육", "5~35"],
    ["취업동아리", "20"], ["취업캠프", "5~20"], ["외부기관 협업 프로그램", "10"], ["취업대비 경진대회", "20·50"],
    ["취업역량강화교육 (자격증)", "5~35"], ["채용설명회·박람회", "5·10"],
    ["학생창업", "30"], ["창업 동아리", "20·40"], ["창업 프로그램", "10·50"],
  ]],
  ["글로벌", [
    ["영어 어학성적", "10~50"], ["제2외국어·기타 어학성적", "20~50"], ["버디 프로그램", "20"],
    ["BUDDY+", "20·40"], ["Korean Language Buddy", "25·50"], ["Mentoring Buddy", "20·40"],
  ]],
  ["학습", [
    ["학습역량진단검사", "5", 1], ["도서관 이용교육·문화행사", "5"], ["책장 속 극장", "5"],
    ["B.E.F. 클럽 (독서회)", "5"], ["도전 북 챌린지", "5"], ["동영상 강좌", "5~20"],
    ["KS-철인 기초·인성·읽기·듣기·말하기·쓰기", "각 15"], ["별별청춘 백일장", "20"],
    ["KS-철인 말하기 대회", "최대 50"], ["영어 말하기 대회", "최대 50"],
    ["학습법 특강", "5"], ["KS학습코칭", "5"], ["CTL공모전", "20·50"], ["학습공동체 COMPASS", "20"],
    ["K-CESA", "30"], ["수업시연 경연대회", "50"], ["교육학특강", "35"], ["현직교사 초청 특강", "10"],
    ["학교현장실습 수기 공모전", "20"], ["학생 소통 강화 프로그램", "5"], ["학과 멘토링", "20"],
    ["기타 비교과 프로그램", "5"],
  ]],
  ["봉사·리더십·기타", [
    ["사회봉사 100시간 이상", "100"], ["80시간 이상", "80"], ["50시간 이상", "50"], ["40시간 이상", "40"],
    ["30시간 이상", "30"], ["20시간 이상", "25"], ["11~19시간", "20"], ["6~10시간", "10"], ["2~5시간", "5"],
    ["리더십 프로그램", "20"], ["설문조사 등 (사전 공지된 것만)", "2"],
  ]],
];

const SCORE_TABLE = SCORES.map(([group, rows], i) => `
<details${i === 0 ? " open" : ""}>
  <summary>${group}</summary>
  <table class="score">
    ${rows.map(([name, pt, req]) =>
      `<tr><td>${name}${req ? ' <span class="req">필수</span>' : ""}</td><td>${pt}점</td></tr>`).join("")}
  </table>
</details>`).join("");

const GUIDE = [
  {
    id: "about",
    title: "콕 마일리지란?",
    children: [
      {
        id: "overview",
        title: "개요",
        body: `
<p>교내 <b>콕(비교과) 프로그램을 수료</b>하거나 <b>개인활동을 인증</b>받으면 쌓이는 마일리지예요.</p>
<ul>
  <li>개인활동: 자격증, 공모전 수상, 어학성적, 봉사, 리더십 활동 등</li>
  <li>그해 1월 1일 ~ 12월 31일에 한 활동만 인정돼요.</li>
  <li>학부(과)에서 운영하는 비교과는 콕 마일리지가 지급되지 않아요.</li>
</ul>
<h3>마일리지로 뭘 받나요?</h3>
<p><b>장학금 조건 5가지</b>를 모두 채운 학생 중 <b>학년별 우수자</b>를 뽑아 콕 마일리지 장학금을 줘요.</p>
<ul>
  <li>학점은 보지 않아요. 동점일 때만 학점으로 순위를 정해요.</li>
  <li>등록금 차감이 아니라 <b>개인 계좌로 입금</b>돼요.</li>
  <li>성적우수 마일리지 장학금을 받았어도 함께 받을 수 있어요.</li>
</ul>
<p class="lead">올해 장학금액은 폴라리스 [공지사항 → 학년도별 공지]에서 확인하세요.</p>
${SRC_BOARD}`,
      },
      {
        id: "minimum",
        title: "장학금 조건",
        body: `
<p class="lead">5가지를 <b>모두</b> 채워야 하고, 매년 새로 채워야 해요.</p>
<ol class="checks">
  <li><b>4대 역량진단검사 완료</b><br>핵심역량 · 직업기초역량 · 취업역량 · 학습역량<br><span>1학년은 4개 모두, 2학년 이상은 3개 이상</span></li>
  <li><b>맞춤형 진로상담 또는 맞춤형 취업상담 1회 이상</b></li>
  <li><b>6개 분야 중 3개 분야 이상에서 각 5점 이상</b><br><span>전공실무 · 진로및상담 · 취창업 · 글로벌 · 학습 · 봉사</span></li>
  <li><b>총 50점 이상</b></li>
  <li><b>2학기 정규학기 재학생</b><br><span>2학기 학적 변동자, 휴학생, 외국인, 정규학기 유예·초과자는 제외</span></li>
</ol>
<p>1·2번은 검사나 상담을 했더라도 <b>마일리지가 실제로 적립돼야</b> 충족으로 인정돼요.</p>
${SRC_BOARD}`,
      },
      {
        id: "earn",
        title: "쌓는 방법",
        body: `
<h3>1. 콕 프로그램 참여</h3>
<p>이 사이트 목록에 있는 프로그램이에요. 폴라리스에서 신청하고 참여를 마치면 주관 부서가 명단을 처리한 뒤 적립돼요.</p>
<ul>
  <li>대부분 <b>수료 기준</b>이 있어요 (출석 80% 이상, 만족도 조사 참여 등).</li>
  <li>도서관 행사는 10분 이상 지각하거나 중간에 나가면 점수가 없어요.</li>
</ul>
<h3>2. 역량진단검사</h3>
<p>폴라리스 HOME 화면 중하단에서 바로 할 수 있고, 각각 1회만 인정돼요.</p>
<ul>
  <li>핵심역량 10점 · 직업기초역량 5점 · 취업역량 5점 · 학습역량 5점</li>
  <li>장학금 조건 1번이기도 해요.</li>
</ul>
<h3>3. 개인활동 (자격증·수상·어학·리더십)</h3>
<ul>
  <li>마이페이지 → 역량개발 → 역량개발 활동 → 개인활동에서 증빙 업로드 → 관리자 승인</li>
  <li>올리기 전에 [홈 → 역량개발 → 개인활동 가이드]를 확인하세요. 증빙이 부족하면 반려돼요.</li>
  <li>리더십 활동은 대외 서포터즈·기자단 같은 활동이에요. 봉사·헌혈과는 달라요.</li>
  <li>메뉴 열림: 3월 첫 평일 ~ 12월 마지막 평일 13시</li>
</ul>
<h3>4. 사회봉사 (2단계)</h3>
<ol>
  <li><b>사회봉사활동 인증</b>: 1365·VMS에서 받은 증빙을 올려 봉사시간 승인받기<br><span>3월 첫 평일 ~ 3월 마지막 평일 17시 / 9월 첫 평일 ~ 12월 마지막 평일 13시</span></li>
  <li><b>사회봉사 마일리지</b>: 올해 승인받은 시간을 모아 마일리지로 신청<br><span>11월 첫 평일 ~ 12월 마지막 평일 13시</span></li>
</ol>
<p><b>2단계를 따로 신청하지 않으면 마일리지가 들어오지 않아요.</b></p>
<h3>유의사항</h3>
<ul>
  <li>개인활동·사회봉사 신청은 <b>2026. 12. 31.(목) 13시</b>까지예요. 반려될 수 있으니 여유 있게 올리세요.</li>
  <li>프로그램에서 장학금이나 상품을 받으면 그 프로그램의 마일리지는 지급되지 않을 수 있어요.</li>
  <li>백일장·말하기 대회는 <b>입상자에게 마일리지를 주지 않아요.</b></li>
</ul>
${SRC_BOARD}${SRC_DETAIL}`,
      },
      {
        id: "scores",
        title: "항목별 배점",
        body: `<p class="lead"><span class="req">필수</span>는 장학금 조건 1·2번에 해당하는 항목이에요.</p>${SCORE_TABLE}${SRC_DETAIL}`,
      },
      {
        id: "calc",
        title: "선발·지급 방식",
        body: `
<ol>
  <li>1월 1일 ~ 12월 31일에 적립된 마일리지를 합산해요.</li>
  <li>장학금 조건 5가지를 모두 채운 학생만 대상이에요.</li>
  <li>학년별로 총점 순위를 매겨 우수자를 뽑아요. 동점이면 학점으로 정해요.</li>
  <li>장학금은 개인 계좌로 입금돼요.</li>
</ol>
<ul>
  <li>선발 인원과 금액은 [공지사항 → 학년도별 공지]에서 확인하세요.</li>
  <li>조건은 해마다 새로 채워야 해요. 올해 받았어도 내년에 다시 충족해야 해요.</li>
</ul>
${SRC_BOARD}`,
      },
    ],
  },
  {
    id: "noshow",
    title: "노쇼 제도",
    body: `
<p>콕 프로그램을 신청한 뒤 <b>취소하지 않고 불참하면 '노쇼'로 처리</b>돼요.</p>
<h3>노쇼하면</h3>
<ul>
  <li>노쇼 기록이 남고, 폴라리스 마이페이지에서 본인 노쇼 현황을 확인할 수 있어요.</li>
  <li>학교는 노쇼 현황을 바탕으로 추가 제도 도입을 검토 중이라고 공지했어요.</li>
</ul>
<h3>꼭 알아둘 것</h3>
<ul>
  <li>별도 안내가 없으면 <b>신청 기간 = 취소 기간</b>이에요. 신청 기간이 끝나면 목록에서 사라져서 직접 취소할 수 없어요.</li>
  <li>신청 기간과 실제 진행일 사이에 간격이 있는 경우가 많으니, 신청할 때 진행일 일정을 먼저 확인하세요.</li>
</ul>
<a class="linkbtn" href="${NOSHOW_URL}" target="_blank" rel="noopener noreferrer">신청 취소 방법 자세히 보기 ↗</a>`,
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
  const groups = GUIDE.map((g) => !g.children
    ? `<li><button type="button" data-guide="${g.id}">${esc(g.title)}<span class="caret">›</span></button></li>`
    : `
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
  const m = location.hash.match(/^#guide\/([\w-]+)(?:\/([\w-]+))?$/);
  const g = m && GUIDE.find((x) => x.id === m[1]);
  // 하위 항목이 있는 그룹은 #guide/그룹/항목, 단독 항목은 #guide/항목
  const c = !g ? null
    : g.children ? (m[2] && g.children.find((x) => x.id === m[2]))
    : (!m[2] && g);
  if (!c) {
    $("guideView").hidden = true;
    document.body.style.overflow = "";
    return;
  }
  const others = g.children ? g.children.filter((x) => x !== c) : [];
  $("guideCrumb").textContent = g.children ? g.title : "안내";
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
