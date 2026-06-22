/* =============================================================================
   AI Art Masters - shared site chrome (navbar + footer).
   Single source of truth for the top nav and the footer so they stop drifting
   across pages. Every page sets `window.AAM_CHROME` then includes this script
   near the top of <body>:

     <script>window.AAM_CHROME={mode:'marketing', base:'', missionsHref:'#briefs'};</script>
     <script src="assets/chrome.js"></script>

   and drops a footer slot where the footer should render:
     <div id="aam-footer"></div>

   Config:
     mode         'marketing' (signed-out pages) | 'app' (signed-in profile)
     base         '' for the landing itself, else 'index.html'
                  (used so cross-page links from sub-pages reach the landing)
     missionsHref marketing only: the in-page missions section ('#briefs' on the
                  landing, '#missions' on the selfie pages)

   The nav is injected synchronously at the top of <body> so later inline scripts
   (e.g. the user-score updater that targets #navScore) always find their nodes.
   The footer fills #aam-footer on DOMContentLoaded.
   ============================================================================= */
(function () {
  "use strict";
  var cfg = window.AAM_CHROME || { mode: "marketing", base: "", missionsHref: "#briefs" };
  var LANDING = "index.html";
  var base = cfg.base || "";                 // '' on the landing, landing filename on sub-pages
  var land = function (hash) { return (base || "") + (hash || ""); };  // link into the landing

  var CAMERA =
    '<svg viewBox="0 0 24 20" style="width:26px;height:22px" aria-hidden="true"><path d="M14.9297 0C15.5984 1.83494e-05 16.2228 0.334243 16.5938 0.890625L17.4062 2.10938C17.7772 2.66576 18.4016 2.99998 19.0703 3H20C22.2091 3 24 4.79086 24 7V16C24 18.2091 22.2091 20 20 20H4C1.79086 20 8.05333e-09 18.2091 0 16V7C0 4.79086 1.79086 3 4 3H4.92969C5.59837 2.99998 6.22283 2.66576 6.59375 2.10938L7.40625 0.890625C7.77717 0.334243 8.40163 1.83494e-05 9.07031 0H14.9297ZM12 5C12 8.3135 9.3135 11 6 11C9.3135 11 12 13.6865 12 17C12 13.6865 14.6865 11 18 11C14.6865 11 12 8.3135 12 5Z" fill="#4F5BFF"/></svg>';
  var TOGGLE =
    '<button class="nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false" aria-controls="navMobile"><span></span><span></span><span></span></button>';
  var STAR =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>';
  var COIN =
    '<svg class="coin" width="18" height="18" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9.2" fill="#E0951A"/><circle cx="10" cy="10" r="8.3" fill="#FFC22E"/><circle cx="10" cy="10" r="6.3" fill="#FFD84D"/><ellipse cx="7.9" cy="9" rx=".75" ry="1" fill="#D98A0A"/><ellipse cx="12.1" cy="9" rx=".75" ry="1" fill="#D98A0A"/><path d="M7.8 11.4 Q10 13.2 12.2 11.4" fill="none" stroke="#D98A0A" stroke-width="1.2" stroke-linecap="round"/></svg>';

  /* Wallet chip (app nav). Demo balance - swap COINS for the real wallet value.
     A pink dot + tooltip signal cash-out readiness once the balance clears the 50-coin floor. */
  var COINS = 1240;        // current coin balance
  var COIN_MIN = 50;       // minimum coins needed to cash out
  function fmtCoins(n) { return n.toLocaleString("en-US"); }
  function coinChip() {
    var ready = COINS >= COIN_MIN;
    var tip = ready
      ? "You can cash out. Exchange coins for gift cards - and the more coins you save, the more each one is worth."
      : "Reach <b>" + COIN_MIN + " coins</b> to cash out. Exchange them for gift cards - and the more you save, the better the rate.";
    return '<a class="coinchip" href="cash-out.html" aria-label="Your coins - cash out">' + COIN +
      fmtCoins(COINS) +
      (ready ? '<span class="coindot" aria-hidden="true"></span>' : '') +
      '<span class="cointip" role="tooltip">' + tip + '</span>' +
      '</a>';
  }

  function navMarketing() {
    var m = cfg.missionsHref || "#briefs";
    return '<nav class="nav" id="nav"><div class="nav-in">' +
      '<a class="brand" href="' + (base || "#") + '">' + CAMERA + '<span class="wm">AI Art Masters</span></a>' +
      '<div class="nav-links"><a href="#how">How it works</a><a href="' + m + '">Missions</a><a href="#faq">FAQ</a></div>' +
      '<div class="nav-right"><a class="signin" href="home.html">Sign in</a><a class="btn btn-p" href="welcome-quiz.html">Start earning</a></div>' +
      TOGGLE +
      '</div>' +
      '<div class="nav-mobile" id="navMobile">' +
      '<a href="#how">How it works</a><a href="' + m + '">Missions</a><a href="#faq">FAQ</a>' +
      '<a class="m-signin" href="home.html">Sign in</a>' +
      '<a class="btn btn-p btn-lg" href="welcome-quiz.html">Start earning</a>' +
      '</div></nav>';
  }

  function navApp() {
    return '<nav class="nav" id="nav"><div class="nav-in">' +
      '<a class="brand" href="home.html">' + CAMERA + '<span class="wm">AI Art Masters</span></a>' +
      '<div class="nav-right">' +
        '<span class="scorechip" tabindex="0" aria-label="Your score">' + STAR +
          '<span id="navScore">73</span>' +
          '<span class="scoretip" role="tooltip">Your score reflects how well you follow mission instructions and the quality of your submissions. The closer you follow the guidance, the more likely you are to be approved, and the higher your score climbs. A higher score unlocks advanced, higher-value missions, so doing great work directly leads to earning more.</span>' +
        '</span>' +
        coinChip() +
        '<a class="signin" href="' + LANDING + '">Sign out</a>' +
        '<span style="width:34px;height:34px;border-radius:50%;background:var(--primary);color:#fff;font-family:var(--fd);font-weight:800;font-size:15px;display:flex;align-items:center;justify-content:center">R</span>' +
      '</div>' +
      TOGGLE +
      '</div>' +
      '<div class="nav-mobile" id="navMobile">' +
      '<a class="m-signin" href="' + LANDING + '">Sign out</a>' +
      '</div></nav>';
  }

  function col(title, links) {
    var a = links.map(function (l) { return '<a href="' + l[1] + '">' + l[0] + '</a>'; }).join("");
    return '<div class="fcol"><h5>' + title + '</h5>' + a + "</div>";
  }

  function footer() {
    var cols;
    if (cfg.mode === "app") {
      cols =
        col("Earn", [["Available missions", "#openMissions"], ["Your missions", "#missions"], ["Rewards", LANDING + "#payout"]]) +
        col("Account", [["Wallet", "#balance"], ["Complete profile", "welcome-quiz.html"], ["Sign out", LANDING]]) +
        col("Company", [["About", LANDING], ["FAQ", LANDING + "#faq"], ["Contact", LANDING]]);
    } else {
      var m = cfg.missionsHref || "#briefs";
      cols =
        col("Earn", [["Available missions", m], ["How it works", "#how"], ["Rewards", land("#payout")]]) +
        col("Account", [["Get started", "welcome-quiz.html"], ["Sign in", "home.html"]]) +
        col("Company", [["About", base || "#"], ["FAQ", "#faq"], ["Contact", base || "#"]]);
    }
    return '<footer class="wrap">' +
      '<div class="foot-in">' +
        '<div class="foot-brand"><span class="wm">AI Art Masters</span>' +
        '<p>Turn what\'s on your phone into real income. Open worldwide, any phone.</p></div>' +
        cols +
      '</div>' +
      '<div class="foot-bot"><span>© 2026 AI Art Masters</span><span>Privacy · Terms</span></div>' +
      '</footer>';
  }

  /* ---- inject nav synchronously so later scripts can find its nodes ---- */
  var navHTML = cfg.mode === "app" ? navApp() : navMarketing();
  if (document.body) document.body.insertAdjacentHTML("afterbegin", navHTML);

  function wireNav() {
    var nav = document.getElementById("nav");
    var tog = document.getElementById("navToggle");
    var menu = document.getElementById("navMobile");
    if (tog && menu) {
      var close = function () { menu.classList.remove("open"); tog.setAttribute("aria-expanded", "false"); };
      tog.addEventListener("click", function () {
        var open = menu.classList.toggle("open");
        tog.setAttribute("aria-expanded", open ? "true" : "false");
      });
      menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", close); });
    }
    // same behavior on every page: nav starts transparent (no border) and fades the
    // background + bottom border in once the page is scrolled
    if (nav) {
      var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 20); };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
  }
  wireNav();

  /* ---- coins + amount molecule: inject the brand coin glyph into any
          <span class="coin-amt">+50</span> so amounts read consistently everywhere
          (progression bar, mission cards, ...) without copy-pasting the SVG. ---- */
  function hydrateCoins(root) {
    (root || document).querySelectorAll(".coin-amt").forEach(function (el) {
      if (el.querySelector(".coin")) return;             // already has its coin
      el.insertAdjacentHTML("afterbegin", COIN);         // coin leads the figure
    });
  }
  window.AAM = window.AAM || {};
  window.AAM.coin = COIN;
  window.AAM.hydrateCoins = hydrateCoins;

  /* ---- subtle reveal-on-scroll for any page. Elements with .reveal / .stagger fade up as they
          enter view. Idempotent: skips anything already revealed by a page's own observer, so it
          safely covers pages that don't ship their own (e.g. cash-out). ---- */
  function initReveal() {
    if (window.__aamRevealOwned) return;                                   // page runs its own reveal observer
    if (!document.documentElement.classList.contains("anim")) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
    }, { threshold: 0.16, rootMargin: "0px 0px -10% 0px" });
    var ci = 0;
    [].forEach.call(document.querySelectorAll(".reveal,.stagger"), function (el) {
      if (el.classList.contains("in")) return;                              // a page observer already handled it
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {     // in view on load -> gentle cascade
        setTimeout(function () { el.classList.add("in"); }, ci * 90); ci++;
      } else { io.observe(el); }                                            // below the fold -> reveal on scroll
    });
  }

  /* ---- footer fills its slot, coins hydrate, and reveals arm once the page is parsed ---- */
  function onReady() {
    var slot = document.getElementById("aam-footer");
    if (slot) { slot.outerHTML = footer(); }
    else { document.body.insertAdjacentHTML("beforeend", footer()); }
    hydrateCoins(document);
    initReveal();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", onReady);
  else onReady();
})();
