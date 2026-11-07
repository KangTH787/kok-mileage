// 저장된 테마를 화면을 그리기 전에 적용한다 (흰 화면 깜빡임 방지).
// CSP가 인라인 스크립트를 막으므로 별도 파일로 <head>에서 동기 로드한다.
(function () {
  var root = document.documentElement;
  try {
    var t = localStorage.getItem("theme");
    if (t === "light" || t === "dark") root.setAttribute("data-theme", t);
  } catch (e) { /* 저장소를 쓸 수 없으면 기기 설정을 따른다 */ }
  var dark = root.getAttribute("data-theme")
    ? root.getAttribute("data-theme") === "dark"
    : window.matchMedia("(prefers-color-scheme: dark)").matches;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", dark ? "#000000" : "#f2f2f7");
})();
