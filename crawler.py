"""폴라리스 콕 프로그램 목록 크롤러 → data/programs.json"""
import json
import os
import re
import sys
from datetime import datetime, timedelta, timezone
from getpass import getpass
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from bs4 import BeautifulSoup

BASE = "https://polaris.ks.ac.kr"
LOGIN_URL = f"{BASE}/login.jsp"
LIST_URL = (
    f"{BASE}/site/reservation/lecture/lectureList"
    "?reservegroupid=1&menuid=001002002002&submode=lecture"
    "&reserveprogramid=L&viewtype=L&pagesize={size}&currentpage={page}"
)
DETAIL_URL = (
    f"{BASE}/site/reservation/lecture/lectureDetail"
    "?reservegroupid=1&menuid=001002002002&submode=lecture"
    "&reserveprogramid=L&viewtype=L&lecturegroupid={gid}"
)
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
)
OUT = Path("data/programs.json")
PAGE_SIZE = 50
MAX_PAGES = 10
KST = timezone(timedelta(hours=9))
DATE_RE = re.compile(r"\d{4}-\d{2}-\d{2}")


def get_credentials():
    uid, pw = os.environ.get("POLARIS_ID"), os.environ.get("POLARIS_PW")
    if uid and pw:
        return uid, pw
    if not sys.stdin.isatty():
        sys.exit("POLARIS_ID / POLARIS_PW 환경변수 없음")
    return input("아이디: ").strip(), getpass("비밀번호: ")


def split_period(td):
    dates = DATE_RE.findall(td.get_text(" ", strip=True))
    return (dates + [None, None])[:2]


def to_int(text):
    m = re.search(r"\d+", text.replace(",", ""))
    return int(m.group()) if m else None


def parse_rows(html):
    soup = BeautifulSoup(html, "html.parser")
    programs = []
    for tr in soup.select("div.table_style1 table tbody tr"):
        tds = tr.find_all("td", recursive=False)
        if len(tds) < 8:
            continue
        a = tds[1].select_one("a.line")
        if not a:
            continue
        gid = parse_qs(urlparse(a.get("href", "")).query).get("lecturegroupid", [""])[0]
        benefit = tds[1].select_one("p.benefit")
        apply_start, apply_end = split_period(tds[2])
        course_start, course_end = split_period(tds[3])
        programs.append({
            "id": gid,
            "title": a.get_text(" ", strip=True),
            "benefit": benefit.get_text(" ", strip=True).lstrip("- ").strip() if benefit else None,
            "apply_start": apply_start,
            "apply_end": apply_end,
            "course_start": course_start,
            "course_end": course_end,
            "competencies": [img["alt"] for img in tds[4].select("img[alt]")],
            "mileage": to_int(tds[5].get_text()),
            "status": tds[6].get_text(" ", strip=True),
            "views": to_int(tds[7].get_text()),
            "url": DETAIL_URL.format(gid=gid) if gid else None,
        })
    return programs


def total_pages(html):
    node = BeautifulSoup(html, "html.parser").select_one("p.page_all")
    m = re.search(r"/\s*(\d+)", node.get_text(" ", strip=True)) if node else None
    return int(m.group(1)) if m else 1


def crawl():
    from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

    uid, pw = get_credentials()
    headless = os.environ.get("HEADLESS", "1") != "0"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)
        page = browser.new_page(user_agent=UA)
        page.set_default_timeout(60000)

        page.goto(LOGIN_URL, wait_until="domcontentloaded")
        page.locator('input[type="text"]:visible').first.fill(uid)
        page.locator('input[type="password"]:visible').first.fill(pw)
        btn = page.get_by_role("button", name="로그인")
        (btn.first if btn.count() else page.get_by_text("로그인", exact=True).last).click()

        try:
            page.get_by_text("LOGOUT", exact=True).first.wait_for(timeout=20000)
        except PWTimeout:
            # 계정 잠금 방지: 재시도 없이 종료 (로그인 전 화면이라 개인정보 없음)
            Path("debug").mkdir(exist_ok=True)
            page.screenshot(path="debug/login_fail.png", full_page=True)
            browser.close()
            sys.exit("로그인 실패")

        page.wait_for_timeout(3000)  # 로그인 리다이렉트 마무리

        programs, seen, pages = [], set(), 1
        current = 1
        while current <= min(pages, MAX_PAGES):
            page.goto(LIST_URL.format(size=PAGE_SIZE, page=current), wait_until="commit")
            page.locator("div.table_style1 table").first.wait_for()
            html = page.content()
            if current == 1:
                pages = total_pages(html)
            for item in parse_rows(html):
                if item["id"] not in seen:
                    seen.add(item["id"])
                    programs.append(item)
            current += 1

        browser.close()
    return programs


def main():
    programs = crawl()
    if not programs:
        # 파싱 실패 시 기존 JSON을 빈 목록으로 덮어쓰지 않음
        sys.exit("수집 0건 - 기존 데이터 유지")

    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(json.dumps({
        "updated_at": datetime.now(KST).isoformat(timespec="minutes"),
        "count": len(programs),
        "programs": programs,
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{len(programs)}건 저장: {OUT}")


if __name__ == "__main__":
    main()
