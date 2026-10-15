/* =========================================================
   main_sections2 — 01 V REPORT. (vr01) · 02 V WRITE. (vr02)
   · gsap.md : 기본 power4.out / 1s · position '< N%' · yPercent ≤ 30 · paused + onEnter(revealAt)
   · 핀 없음 (스크롤 연동 없이 진입 시 1회 재생) — PC/모바일은 matchMedia 로 분기
   · 02 의 목업 시연은 ScrollTrigger 진입 시 1회 자동 재생 + 아래 3개 버튼으로 다시 보기
   ========================================================= */
gsap.registerPlugin(ScrollTrigger);

window.addEventListener("load", function () {
  const PC = "(min-width: 600px)";
  const MO = "(max-width: 599px)";
  const REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mm = gsap.matchMedia();
  const $ = function (s, r) { return (r || document).querySelector(s); };
  const $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  // html { scroll-behavior: smooth } 가 refresh 좌표를 틀어지게 하지 않도록 (핀.md §8-9)
  const docEl = document.documentElement;
  ScrollTrigger.addEventListener("refreshInit", function () { docEl.style.setProperty("scroll-behavior", "auto", "important"); });
  ScrollTrigger.addEventListener("refresh", function () { docEl.style.removeProperty("scroll-behavior"); });

  /* =========================================================
     헬퍼
     ========================================================= */
  // 트리거가 트윈을 소유하지 않는 등장 (gsap.md §7-9) — refresh 때 op0 으로 되감기지 않음
  function revealAt(trigger, build, start) {
    if (REDUCE) return null;
    const t = gsap.timeline({ paused: true, defaults: { duration: 1, ease: "power4.out" } });
    build(t);
    ScrollTrigger.create({ trigger: trigger, start: start || "top 80%", once: true, onEnter: function () { t.play(); } });
    return t;
  }
  // 모바일 — 항목마다 자기 트리거 (gsap.md §6-0)
  function revealEach(sel, vars, start) {
    gsap.utils.toArray(sel).forEach(function (el) {
      revealAt(el, function (t) { t.from(el, Object.assign({ duration: 0.95 }, vars), "< 0%"); }, start || "top 88%");
    });
  }

  // <br> 기준 줄 래핑 — br 은 그대로 두고 그 사이만 inline-block span 으로 (gsap.md §3-17)
  function splitLines(sel) {
    const out = [];
    $$(sel).forEach(function (el) {
      if (!el.dataset.lines) {
        const frag = document.createDocumentFragment();
        const made = [];
        let g = null;
        [].slice.call(el.childNodes).forEach(function (n) {
          if (n.nodeName === "BR") { g = null; frag.appendChild(n); return; }
          if (!g) { g = document.createElement("span"); g.className = "ln"; frag.appendChild(g); made.push(g); }
          g.appendChild(n);
        });
        made.forEach(function (s) {           // 줄 끝 공백은 span 밖으로
          const last = s.lastChild;
          if (!last || last.nodeType !== 3) return;
          const m = last.nodeValue.match(/\s+$/);
          if (!m || m[0].length === last.nodeValue.length) return;
          last.nodeValue = last.nodeValue.slice(0, -m[0].length);
          s.parentNode.insertBefore(document.createTextNode(m[0]), s.nextSibling);
        });
        el.appendChild(frag);
        el.dataset.lines = "1";
      }
      [].push.apply(out, el.querySelectorAll(".ln"));
    });
    return out.filter(function (s) { return s.textContent.trim(); });
  }

  // 카운트업 — 자릿수에 맞춰 스냅 (gsap.md §2-1 (4))
  function countStep(t) {
    t = Math.abs(t);
    if (t >= 1e7) return 10000;
    if (t >= 1e6) return 1000;
    if (t >= 1e5) return 500;
    if (t >= 1e4) return 100;
    if (t >= 1e3) return 10;
    if (t >= 200) return 5;
    return 1;
  }
  function countUp(t, el, pos) {
    const to = +el.dataset.to;
    const step = countStep(to);
    const o = { v: 0 };
    el.textContent = "0";
    t.to(o, {
      v: to, duration: 1.4, ease: "expo.inOut",
      onUpdate: function () { el.textContent = (Math.round(o.v / step) * step).toLocaleString(); },
      onComplete: function () { el.textContent = to.toLocaleString(); },
    }, pos);
  }

  // 섹션 헤드 공통 (영문 타이틀 → 국문 타이틀 줄 스플릿 → 설명)
  function headReveal(sec) {
    const lines = splitLines(sec + " .sec_tit");
    revealAt(sec + " .sec_head", function (t) {
      t.from(sec + " .sec_en", { opacity: 0, yPercent: 30 }, "< 0%")
        .from(lines, { opacity: 0, yPercent: 30, stagger: 0.15 }, "< 30%")
        .from(sec + " .sec_desc", { opacity: 0, yPercent: 30 }, "< 40%");
    });
  }

  /* =========================================================
     01 V REPORT. — AI 가시성 리포트
     ========================================================= */
  function vr01() {
    if (!$(".vr01")) return;
    headReveal(".vr01");

    mm.add(PC, function () {
      revealAt(".vr01_flow", function (t) {
        t.from(".vr01_flow > li:not(.vr01_arw)", { opacity: 0, yPercent: 30, stagger: 0.12 }, "< 0%")
          .from(".vr01_arw", { opacity: 0, xPercent: -30, stagger: 0.12, duration: 0.8 }, "< 20%");
      }, "top 85%");

      // 리포트 4쪽: 무대(페이지) → 숫자 카운트 → 장식(막대 · 체크)
      revealAt(".vr01_pages", function (t) {
        t.from(".vr01_pg", { opacity: 0, yPercent: 30, stagger: 0.1 }, "< 0%");
        $$(".vr01_pg [data-to]").forEach(function (el, i) { countUp(t, el, i ? "< 0%" : "< 40%"); });
        t.from(".vr01_pg .pg_bar", { scaleX: 0, duration: 0.8, stagger: 0.08 }, "< 0%")
          .from(".vr01_pg4 .pg_eff li i", { scale: 0.4, opacity: 0, duration: 0.7, ease: "back.out(2)", stagger: 0.12 }, "< 0%");
      }, "top 80%");

      revealAt(".vr01_meta", function (t) {
        t.from(".vr01_meta li", { opacity: 0, yPercent: 30, stagger: 0.08 }, "< 0%");
      }, "top 90%");

      revealAt(".vr01_cards_tt", function (t) { t.from(".vr01_cards_tt", { opacity: 0, yPercent: 30 }, "< 0%"); }, "top 88%");
      revealAt(".vr01_cards", function (t) {
        t.from(".vr01_card", { opacity: 0, yPercent: 30, stagger: 0.12 }, "< 0%");
      }, "top 86%");

      revealAt(".vr01_end", function (t) {
        t.from(".vr01_end_a", { opacity: 0, yPercent: 30 }, "< 0%")
          .from(".vr01_end_b", { opacity: 0, yPercent: 30 }, "< 30%")
          .from(".vr01_note", { opacity: 0, yPercent: 30 }, "< 40%");
      }, "top 85%");
    });

    mm.add(MO, function () {
      // 모바일은 카운트업 생략 (옆으로 넘겨야 보이는 쪽이라 화면 밖에서 끝나 버림)
      $$(".vr01 [data-to]").forEach(function (el) { el.textContent = (+el.dataset.to).toLocaleString(); });

      revealEach(".vr01_flow > li:not(.vr01_arw)", { opacity: 0, yPercent: 30 }, "top 90%");
      revealEach(".vr01_arw", { opacity: 0 }, "top 94%");
      revealAt(".vr01_pages", function (t) {
        t.from(".vr01_pgw", { opacity: 0, yPercent: 30, stagger: 0.1 }, "< 0%");
      }, "top 85%");
      revealAt(".vr01_meta", function (t) {
        t.from(".vr01_meta li", { opacity: 0, yPercent: 30, stagger: 0.08 }, "< 0%");
      }, "top 92%");
      revealAt(".vr01_cards_tt", function (t) { t.from(".vr01_cards_tt", { opacity: 0, yPercent: 30 }, "< 0%"); }, "top 90%");
      revealEach(".vr01_card", { opacity: 0, yPercent: 30 }, "top 90%");
      revealAt(".vr01_end", function (t) {
        t.from(".vr01_end_a", { opacity: 0, yPercent: 30 }, "< 0%")
          .from(".vr01_end_b", { opacity: 0, yPercent: 30 }, "< 30%");
      }, "top 85%");
      revealAt(".vr01_note", function (t) { t.from(".vr01_note", { opacity: 0 }, "< 0%"); }, "top 95%");

      // 페이지 넘김 점
      const strip = $(".vr01_pages");
      const dots = $$(".vr01_dots li");
      function sync() {
        const pg = $(".vr01_pgw", strip);
        const gap = parseFloat(getComputedStyle(strip).columnGap) || 0;
        const i = Math.round(strip.scrollLeft / (pg.offsetWidth + gap));
        dots.forEach(function (d, k) { d.classList.toggle("on", k === Math.min(i, dots.length - 1)); });
      }
      strip.addEventListener("scroll", sync, { passive: true });
      sync();
      return function () { strip.removeEventListener("scroll", sync); };
    });
  }

  /* =========================================================
     02 V WRITE. — AI 문구 추천 시연
     (실제 수정모드 툴바와 같은 흐름: 드래그 → 툴바 AI → 3가지 메뉴 → 추천 3개 → 적용 → 저장)
     ========================================================= */
  function vr02() {
    const root = $(".vr02");
    if (!root) return;
    headReveal(".vr02");

    const win = $(".vr02_win", root);
    const page = $(".vr02_page", win);
    const selWrap = $(".vr02_sel", win);
    const tb = $(".vr02_tb", win), aiBtn = $(".vr02_ai", win), pop = $(".vr02_pop", win);
    const menu = $(".vr02_menu", win), ld = $(".vr02_ld", win), res = $(".vr02_res", win);
    const opts = $$(".vr02_opt", win), items = $$(".vr02_it", win);
    const cur = $(".vr02_cur", win), rip = $(".vr02_rip", win), save = $(".vr02_save", win);
    const chips = $$(".vr02_mode", root);

    const SEL = "rgba(50, 53, 205, 0.28)";
    const SEL0 = "rgba(50, 53, 205, 0)";
    const ORIG = selWrap.textContent.trim();
    // 예시 문구 — 원문에 있는 사실(직접 로스팅 · 원두 · 매일 아침)만 다시 표현한다
    const MODES = [
      { name: "더 짧게", pick: 1, items: ["직접 볶은 원두로 내린 커피", "매일 아침 직접 볶은 커피", "직접 볶은 원두 커피"] },
      { name: "검색 잘 되게", pick: 0, items: ["매일 아침 직접 로스팅한 원두 커피", "직접 로스팅한 원두 커피를 매일 아침 내립니다", "매일 아침 내리는 직접 로스팅 원두 커피"] },
      { name: "다른 추천 문구", pick: 2, items: ["아침마다 직접 볶은 원두로 내리는 커피", "원두부터 직접 볶아 매일 아침 내리는 커피", "직접 볶은 원두로 매일 아침 내리는 한 잔"] },
    ];

    let tl = null, applyTl = null, words = [], autoStart = null;

    // 데모 페이지 기준 좌표 (커서 · 물결 · 저장 칩이 이 안에 있다)
    function P(el, fx, fy) {
      const w = page.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return { x: r.left - w.left + r.width * fx, y: r.top - w.top + r.height * fy };
    }

    // 문구를 단어 단위 span 으로 — 드래그 선택이 줄바꿈을 넘어도 이어서 칠해진다
    function setWords(text, selected) {
      selWrap.textContent = "";
      const parts = text.split(" ");
      words = parts.map(function (tx, i) {
        const s = document.createElement("span");
        s.className = "w";
        s.textContent = tx + (i < parts.length - 1 ? " " : "");
        selWrap.appendChild(s);
        return s;
      });
      gsap.set(words, { backgroundColor: selected ? SEL : SEL0 });
    }

    function fillRes(mi) {
      const m = MODES[mi];
      $(".vr02_ldt", win).textContent = m.name;
      $(".vr02_rst", win).textContent = m.name;
      items.forEach(function (it, i) { $(".t", it).textContent = m.items[i]; });
    }

    function markChip(mi) {
      chips.forEach(function (b, i) { b.classList.toggle("on", i === mi); b.setAttribute("aria-pressed", i === mi ? "true" : "false"); });
    }

    function showState(name) {   // menu | ld | res
      menu.style.display = name === "menu" ? "block" : "none";
      ld.style.display = name === "ld" ? "block" : "none";
      res.style.display = name === "res" ? "block" : "none";
      pop.className = "vr02_pop " + (name === "res" || name === "ld" ? "m-res" : "m-menu");
    }

    function reset() {
      if (tl) { tl.kill(); tl = null; }
      if (applyTl) { applyTl.kill(); applyTl = null; }
      setWords(ORIG, false);
      gsap.set([tb, pop, cur, rip, save], { autoAlpha: 0, yPercent: 0, scale: 1 });
      gsap.set(items, { autoAlpha: 1, yPercent: 0 });
      showState("menu");
      aiBtn.classList.remove("is-open");
      opts.concat(items).forEach(function (o) { o.classList.remove("hv"); });
    }

    // 정적 최종 상태 (모션 줄이기)
    function showFinal(mi) {
      reset();
      fillRes(mi);
      markChip(mi);
      setWords(ORIG, true);
      showState("res");
      aiBtn.classList.add("is-open");
      gsap.set([tb, pop], { autoAlpha: 1 });
    }

    function applyText(txt) {
      setWords(txt, true);
      applyTl = gsap.timeline({ defaults: { ease: "power1.out" } });
      applyTl.from(words, { opacity: 0, duration: 0.35, stagger: 0.05 }, "< 0%")
        .to(words, { backgroundColor: SEL0, duration: 0.6 }, "< 100%");
    }

    function run(mi, intro) {
      reset();
      fillRes(mi);
      markChip(mi);
      const m = MODES[mi];
      const t = (tl = gsap.timeline({ defaults: { duration: 1, ease: "power4.out" } }));
      const wait = function (d) { return t.to({}, { duration: d }, "< 100%"); };
      const aim = function (el, fx, fy, d, pos, ease) {
        return t.to(cur, { x: function () { return P(el, fx, fy).x; }, y: function () { return P(el, fx, fy).y; }, duration: d, ease: ease || "power2.inOut" }, pos);
      };
      const click = function (pos) {
        t.to(cur, { scale: 0.82, duration: 0.12, ease: "power1.out", yoyo: true, repeat: 1 }, pos);
        t.fromTo(rip, { scale: 0.2, autoAlpha: 0.7 }, {
          scale: 1.5, autoAlpha: 0, duration: 0.55, ease: "power2.out",
          onStart: function () { gsap.set(rip, { x: gsap.getProperty(cur, "x"), y: gsap.getProperty(cur, "y") }); },
        }, "< 0%");
      };
      const first = words[0], last = words[words.length - 1];

      if (intro) {
        // ① 커서가 문구 앞으로 → 끝까지 드래그(선택) → 툴바가 올라온다
        gsap.set(cur, { x: page.clientWidth * 0.78, y: page.clientHeight * 0.9 });
        t.to(cur, { autoAlpha: 1, duration: 0.4, ease: "power1.out" }, "< 0%");
        aim(first, 0, 0.5, 0.9, "< 0%");
        wait(0.25);
        aim(last, 1, 0.5, 0.85, "< 100%", "none");
        t.to(words, { backgroundColor: SEL, duration: 0.1, ease: "none", stagger: 0.85 / words.length }, "< 0%");
        t.fromTo(tb, { autoAlpha: 0, yPercent: 30 }, { autoAlpha: 1, yPercent: 0, duration: 0.5 }, "< 100%");
      } else {
        // 다시 보기: 이미 선택된 상태에서 툴바부터
        setWords(ORIG, true);
        gsap.set(cur, { x: P(selWrap, 1, 0.5).x, y: P(selWrap, 1, 0.5).y });
        t.to(cur, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, "< 0%");
        t.fromTo(tb, { autoAlpha: 0, yPercent: 30 }, { autoAlpha: 1, yPercent: 0, duration: 0.5 }, "< 0%");
      }

      // ② AI 버튼 클릭
      aim(aiBtn, 0.5, 0.5, 0.8, "< 100%");
      click("< 100%");
      t.add(function () { aiBtn.classList.add("is-open"); }, "< 0%");

      if (intro) {
        // ③ 위로 열리는 3가지 메뉴 → 선택
        t.add(function () { showState("menu"); }, "< 0%");
        t.fromTo(pop, { autoAlpha: 0, yPercent: 30 }, { autoAlpha: 1, yPercent: 0, duration: 0.45 }, "< 0%");
        wait(0.7);
        aim(opts[mi], 0.5, 0.5, 0.7, "< 100%");
        t.add(function () { opts[mi].classList.add("hv"); }, "< 70%");
        click("< 100%");
        t.add(function () { showState("ld"); }, "< 0%");
      } else {
        t.add(function () { showState("ld"); }, "< 0%");
        t.fromTo(pop, { autoAlpha: 0, yPercent: 30 }, { autoAlpha: 1, yPercent: 0, duration: 0.45 }, "< 0%");
      }

      // ④ AI 가 문구를 만드는 중 → 추천 3개
      wait(1.2);
      t.add(function () { showState("res"); }, "< 100%");
      t.fromTo(items, { autoAlpha: 0, yPercent: 30 }, { autoAlpha: 1, yPercent: 0, duration: 0.5, stagger: 0.1 }, "< 0%");

      // ⑤ 하나를 골라 «적용» → 글자만 바뀌고 저장 (1)
      wait(1.1);
      aim(items[m.pick], 0.9, 0.5, 0.75, "< 100%");
      t.add(function () { items[m.pick].classList.add("hv"); }, "< 75%");
      click("< 100%");
      t.add(function () { applyText(m.items[m.pick]); }, "< 0%");
      t.to([pop, tb], { autoAlpha: 0, duration: 0.3, ease: "power2.out" }, "< 20%");
      t.to(cur, { autoAlpha: 0, duration: 0.4, ease: "power1.out" }, "< 60%");
      t.fromTo(save, { autoAlpha: 0, yPercent: 30 }, { autoAlpha: 1, yPercent: 0, duration: 0.6 }, "< 40%");
    }

    // 3가지 기능 버튼 — 눌러서 다시 보기
    chips.forEach(function (b, i) {
      b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      b.addEventListener("click", function () {
        if (autoStart) { autoStart.kill(); autoStart = null; }
        if (REDUCE) showFinal(i); else run(i, false);
      });
    });

    if (REDUCE) {
      showFinal(0);
    } else {
      reset();
      fillRes(0);
      autoStart = ScrollTrigger.create({ trigger: $(".vr02_demo", root), start: "top 62%", once: true, onEnter: function () { autoStart = null; run(0, true); } });
    }

    // ---- 나머지 블록 등장 ----
    mm.add(PC, function () {
      revealAt(".vr02_demo", function (t) { t.from(".vr02_win", { opacity: 0, yPercent: 12, duration: 1.2 }, "< 0%"); }, "top 88%");
      revealAt(".vr02_modes_tt", function (t) { t.from(".vr02_modes_tt", { opacity: 0, yPercent: 30 }, "< 0%"); }, "top 92%");
      revealAt(".vr02_modes", function (t) { t.from(".vr02_mode", { opacity: 0, yPercent: 30, stagger: 0.1 }, "< 0%"); }, "top 92%");
      revealAt(".vr02_pts", function (t) { t.from(".vr02_pts li", { opacity: 0, yPercent: 30, stagger: 0.1 }, "< 0%"); }, "top 92%");
      revealAt(".vr02_tier", function (t) {
        t.from(".vr02_tier_tt", { opacity: 0, yPercent: 30 }, "< 0%")
          .from(".vr02_tier_sub", { opacity: 0, yPercent: 30 }, "< 30%");
      }, "top 85%");
      // 계단: 왼쪽(낮은 단계)부터 차례로 올라온다
      revealAt(".vr02_steps", function (t) {
        t.from(".vr02_step", { opacity: 0, yPercent: 30, stagger: 0.15 }, "< 0%");
      }, "top 85%");
      revealAt(".vr02_note", function (t) { t.from(".vr02_note", { opacity: 0, yPercent: 30 }, "< 0%"); }, "top 92%");
      revealAt(".vr02_end", function (t) {
        t.from(".vr02_end_a", { opacity: 0, yPercent: 30 }, "< 0%")
          .from(".vr02_end_b", { opacity: 0, yPercent: 30 }, "< 30%");
      }, "top 85%");
    });

    mm.add(MO, function () {
      revealAt(".vr02_demo", function (t) { t.from(".vr02_win", { opacity: 0, yPercent: 12, duration: 1.1 }, "< 0%"); }, "top 90%");
      revealAt(".vr02_modes_tt", function (t) { t.from(".vr02_modes_tt", { opacity: 0, yPercent: 30 }, "< 0%"); }, "top 92%");
      revealEach(".vr02_mode", { opacity: 0, yPercent: 30 }, "top 92%");
      revealEach(".vr02_pts li", { opacity: 0, yPercent: 30 }, "top 92%");
      revealAt(".vr02_tier", function (t) {
        t.from(".vr02_tier_tt", { opacity: 0, yPercent: 30 }, "< 0%")
          .from(".vr02_tier_sub", { opacity: 0, yPercent: 30 }, "< 30%");
      }, "top 88%");
      revealEach(".vr02_step", { opacity: 0, yPercent: 30 }, "top 90%");
      revealAt(".vr02_note", function (t) { t.from(".vr02_note", { opacity: 0, yPercent: 30 }, "< 0%"); }, "top 94%");
      revealAt(".vr02_end", function (t) {
        t.from(".vr02_end_a", { opacity: 0, yPercent: 30 }, "< 0%")
          .from(".vr02_end_b", { opacity: 0, yPercent: 30 }, "< 30%");
      }, "top 85%");
    });
  }

  /* =========================================================
     01 — 리포트 미리보기 (PDF 를 내려받지 않고 화면에서 열람)
     · PDF.js 를 처음 열 때만 불러와서 쪽마다 canvas 로 그린다 (모바일 · 안드로이드 크롬 포함 어디서나 동일)
     · 안 열리면 «새 탭에서 열기» (브라우저 PDF 뷰어) 로 열 수 있다
     ========================================================= */
  function vr01Preview() {
    const btn = $(".vr01_prev");
    const modal = $("#vr01Modal");
    if (!btn || !modal) return;
    const pagesEl = $(".vr01_modal_pages", modal);
    const loadEl = $(".vr01_modal_load", modal);
    const body = $(".vr01_modal_body", modal);
    const closeBtn = $(".vr01_modal_x", modal);
    const PDF_URL = btn.dataset.pdf;
    const LIB = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js";
    const WORKER = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
    let rendered = false, rendering = false, lastFocus = null, closeTimer = null;

    function loadScript(src) {
      return new Promise(function (ok, fail) {
        const s = document.createElement("script");
        s.src = src; s.onload = ok; s.onerror = fail;
        document.head.appendChild(s);
      });
    }

    async function renderPdf() {
      if (rendered || rendering) return;
      rendering = true;
      loadEl.textContent = "리포트를 불러오는 중입니다…";
      loadEl.classList.remove("is-done");
      try {
        if (!window.pdfjsLib) await loadScript(LIB);
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER;
        const pdf = await window.pdfjsLib.getDocument({ url: PDF_URL }).promise;
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const base = page.getViewport({ scale: 1 });
          const width = pagesEl.clientWidth || body.clientWidth;
          const vp = page.getViewport({ scale: (width / base.width) * dpr });
          const wrap = document.createElement("div");
          wrap.className = "vr01_modal_pg";
          const cv = document.createElement("canvas");
          cv.width = Math.floor(vp.width); cv.height = Math.floor(vp.height);
          cv.setAttribute("role", "img");
          cv.setAttribute("aria-label", "AI 가시성 리포트 " + i + "쪽");
          wrap.appendChild(cv);
          pagesEl.appendChild(wrap);
          await page.render({ canvasContext: cv.getContext("2d", { willReadFrequently: true }), viewport: vp }).promise;
          if (i === 1) loadEl.classList.add("is-done");
        }
        rendered = true;
      } catch (e) {
        pagesEl.textContent = "";
        loadEl.classList.remove("is-done");
        loadEl.textContent = "미리보기를 불러오지 못했습니다. 위의 ‘새 탭에서 열기’로 확인해 주세요.";
      }
      rendering = false;
    }

    function open() {
      clearTimeout(closeTimer);
      lastFocus = document.activeElement;
      modal.hidden = false;
      docEl.classList.add("vr01-lock");
      body.scrollTop = 0;
      requestAnimationFrame(function () { modal.classList.add("is-open"); });
      closeBtn.focus({ preventScroll: true });
      renderPdf();
    }
    function close() {
      modal.classList.remove("is-open");
      docEl.classList.remove("vr01-lock");
      closeTimer = setTimeout(function () { modal.hidden = true; }, REDUCE ? 0 : 320);
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }

    btn.addEventListener("click", open);
    modal.addEventListener("click", function (e) { if (e.target.closest("[data-close]")) close(); });
    document.addEventListener("keydown", function (e) {
      if (modal.hidden) return;
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key === "Tab") {                               // 모달 안에서만 포커스 이동
        const f = $$("a[href], button", modal);
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  vr01();
  vr01Preview();
  vr02();

  /* 데모 상단바 — 현재 섹션 */
  $$(".dh_nav a").forEach(function (a) {
    const sec = $(a.getAttribute("href"));
    if (sec) ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%", toggleClass: { targets: a, className: "on" } });
  });

  ScrollTrigger.refresh();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
});
