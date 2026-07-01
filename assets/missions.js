/* =============================================================================
   AI Art Masters - shared "Available missions" gallery.
   Single source of truth for the mission cards so the landing and the profile
   render the exact same component and content (no hand-copied markup).

   Usage: drop the container where the gallery should go, then include this file
   right after it:
     <div class="briefs" id="aam-missions"></div>
     <script src="assets/missions.js"></script>

   The cards fill the container synchronously, so any reveal observer that runs
   later (in the page's own script) still sees them.
   ============================================================================= */
(function () {
  "use strict";

  // icon = the inner SVG of the 24x24 mission glyph. These match the design-system icons used
  // on the profile mission cards (lucide-style), so the same subject reads identically everywhere.
  var IC = {
    video: '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    dog: '<path d="M11.25 16.25h1.5L12 17z"/><path d="M16 14v.5"/><path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309"/><path d="M8 14v.5"/><path d="M8.5 8.5c-.384 1.05-1.083 2.028-2.344 2.5-1.931.722-3.576-.297-3.656-1-.113-.994 1.177-6.53 4-7 1.923-.321 3.651.845 3.651 2.235A7.497 7.497 0 0 1 14 5.277c0-1.39 1.844-2.598 3.767-2.277 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"/>',
    cat: '<path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z"/><path d="M8 14v.5"/><path d="M16 14v.5"/><path d="M11.25 16.25h1.5L12 17l-.75-.75Z"/>',
    mail: '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>',
    barcode: '<rect x="3" y="5" width="1.3" height="14" fill="currentColor" stroke="none"/><rect x="5.5" y="5" width="2.4" height="14" fill="currentColor" stroke="none"/><rect x="9" y="5" width="1.3" height="14" fill="currentColor" stroke="none"/><rect x="11.4" y="5" width="3" height="14" fill="currentColor" stroke="none"/><rect x="15.6" y="5" width="1.3" height="14" fill="currentColor" stroke="none"/><rect x="18" y="5" width="2.4" height="14" fill="currentColor" stroke="none"/><rect x="21.4" y="5" width="1.3" height="14" fill="currentColor" stroke="none"/>',
    shirt: '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>',
    photo: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>'
  };

  var SITE = "https://www.ai-art-masters.com";
  var EXTGRAD = "linear-gradient(135deg,#4F5BFF,#8B5CF6)";  // shared photo-card background

  // brand coin glyph (matches chrome.js / .coin). Mission payouts show in coins, not $.
  var COIN = '<svg class="coin" width="1em" height="1em" viewBox="0 0 20 20" aria-hidden="true" style="vertical-align:-0.18em;margin-right:3px"><circle cx="10" cy="10" r="9.2" fill="#E0951A"/><circle cx="10" cy="10" r="8.3" fill="#FFC22E"/><circle cx="10" cy="10" r="6.3" fill="#FFD84D"/><ellipse cx="7.9" cy="9" rx=".75" ry="1" fill="#D98A0A"/><ellipse cx="12.1" cy="9" rx=".75" ry="1" fill="#D98A0A"/><path d="M7.8 11.4 Q10 13.2 12.2 11.4" fill="none" stroke="#D98A0A" stroke-width="1.2" stroke-linecap="round"/></svg>';
  // coins are 1:1 with the old $ figure (50 coins = $50). Render coin-first, no "+",
  // matching the rest of the site (.coin-amt molecule). e.g. "<coin>4 / photo".
  function payHTML(p) {
    var s = String(p == null ? "" : p).replace(/^\$/, "");      // "8 / video clip"
    var m = s.match(/^(\d[\d,]*)\s*(.*)$/);
    if (!m) return COIN + esc(s);
    return COIN + m[1] + (m[2] ? " " + esc(m[2]) : "");          // "<coin>8 / video clip"
  }

  // Order: the two quick self-serve selfie missions lead; subject missions next; the original Selfie Videos sits last.
  var MISSIONS = [
    { name: "Selfie Photo", href: "selfie-photo.html", external: false, img: "design/selfie-image-thumb.png", grad: "linear-gradient(135deg,#FF7B7B,#E0357D)", icon: IC.photo, iconColor: "#FFD166", req: "A few clear selfies from your phone. Take them at home or outdoors, no filters.", pay: "$5 / photo" },
    { name: "Selfie Video", href: "selfie-video.html", external: false, img: "design/selfie-video-thumb.png", grad: EXTGRAD, icon: IC.video, iconColor: "#FF4D94", req: "One short selfie video, 10-60 seconds, recorded at home. Speak in any language.", pay: "$8 / clip" },
    { name: "Dogs", href: SITE + "/Pets-Landing", external: true, img: SITE + "/assets/selector-dogs-B6dPZelV.jpg", icon: IC.dog, iconColor: "#3B82F6", req: "70+ clear photos of your dog, taken over 12+ months in different places. Natural, no studio.", pay: "$4 / photo" },
    { name: "Cats", href: SITE + "/Cats-Landing", external: true, img: SITE + "/assets/selector-cats-A4a5-G7o.jpg", icon: IC.cat, iconColor: "#F59E0B", req: "70+ clear photos of your cat, taken over 12+ months in varied settings. Natural and unedited.", pay: "$5 / photo" },
    { name: "Emails", href: SITE + "/EmailsHunter-Landing", external: true, img: SITE + "/assets/emailshunter-hero-CJdpmLfI.jpg", icon: IC.mail, iconColor: "#10B981", req: "Real business emails - we keep only the subject and sender. Originals, recent, in your language.", pay: "$2 / email" },
    { name: "Best Email Collector", href: SITE + "/BestEmailCollector-Landing", external: true, img: SITE + "/assets/best-email-collector-hero-C5f2SyST.jpg", icon: IC.mail, iconColor: "#06B6D4", req: "Share a few business emails - we keep only the subject and sender, fully anonymized.", pay: "$2 / email" },
    { name: "Barcodes", href: SITE + "/Barcode-Collector", external: true, img: SITE + "/assets/selector-barcodes-9BbnRcBm.jpg", icon: IC.barcode, iconColor: "#8B5CF6", req: "A clear photo of one full barcode you own - used or expired cards, tickets, coupons.", pay: "$3 / barcode" },
    { name: "Virtual Try On", href: SITE + "/VirtualTryOn-Landing", external: true, img: SITE + "/assets/selector-virtual-tryon-CLUfoxf-.png", icon: IC.shirt, iconColor: "#EC4899", req: "5 real full-outfit photos of yourself from your camera roll - no filters, no studio shots.", pay: "$6 / photo" },
    { name: "Selfie Videos (Arabic)", href: SITE + "/SelfieVideos-Landing", external: true, img: SITE + "/assets/selector-selfie-videos-C1RBq8Ui.png", icon: IC.video, iconColor: "#FF5A5F", req: "One 10-60 sec selfie video, recorded at home, spoken in any Arabic dialect.", pay: "$8 / video clip" }
  ];

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function card(m) {
    var bg = m.grad || EXTGRAD;                 // themed gradient shows behind the photo (and on load/transparency)
    var open = m.external ? ' target="_blank" rel="noopener"' : "";
    var img = m.img ? '<img class="bphoto" onerror="this.style.display=\'none\'" src="' + esc(m.img) + '" alt="' + esc(m.name) + '" loading="lazy">' : "";
    var tag = m.tag ? '<span class="ptag">' + esc(m.tag) + "</span>" : "";
    var icon = '<svg class="micon" style="color:' + esc(m.iconColor) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + m.icon + "</svg>";
    return '<a class="brief" style="background:' + bg + '" href="' + esc(m.href) + '"' + open + ">" +
      img + tag + '<span class="ov"></span>' +
      "<h4>" + icon + esc(m.name) + "</h4>" +
      '<p class="breq">' + esc(m.req) + "</p>" +
      '<div class="prow"><span class="ppay">' + payHTML(m.pay) + "</span></div></a>";
  }

  function render() { return MISSIONS.map(card).join(""); }

  /* Scroll-scrub reveal - part of the component so the gallery animates identically
     on every page. Each card scales 62%->100% + fades in tied to scroll position,
     cascading first->last, then latches (plays once per load). Honors reduced motion. */
  function setupScrub(grid) {
    if (!grid) return;
    var anim = document.documentElement.classList.contains("anim");
    var mm = window.matchMedia ? window.matchMedia.bind(window) : null;
    var cards = [].slice.call(grid.querySelectorAll(".brief"));
    if (!cards.length) return;
    if (!anim) return;                              // reduced motion: cards stay fully visible
    grid.classList.add("aam-scrub");
    var spread = 0.5, N = cards.length, tick = false, latched = false;
    function revealAll() { latched = true; grid.classList.add("in"); cards.forEach(function (c) { c.style.opacity = ""; c.style.transform = ""; }); }
    function setGP() {
      tick = false;
      if (latched) return;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      if (mm && mm("(max-width:759px)").matches) {
        var allIn = true;
        for (var j = 0; j < N; j++) {
          var rc = cards[j].getBoundingClientRect(), cyc = rc.top + rc.height / 2;
          var pc = (vh - cyc) / (vh * 0.28); pc = pc < 0 ? 0 : pc > 1 ? 1 : pc;
          if (pc < (cards[j]._mx || 0)) pc = cards[j]._mx;     // monotonic: never scrub back on scroll-up
          cards[j]._mx = pc;
          cards[j].style.opacity = pc.toFixed(3);
          cards[j].style.transform = "scale(" + (0.62 + 0.38 * pc).toFixed(3) + ")";
          if (pc < 1) allIn = false;
        }
        if (allIn) revealAll();
        return;
      }
      var r = grid.getBoundingClientRect(), center = r.top + r.height / 2;
      var startY = vh * 1.15, endY = vh * 0.5;       // begins as the grid enters from below, ends when centred
      var p = (startY - center) / (startY - endY); p = p < 0 ? 0 : p > 1 ? 1 : p;
      if (p >= 1) { revealAll(); return; }
      for (var i = 0; i < N; i++) {
        var off = (N > 1 ? i / (N - 1) : 0) * spread;
        var lp = (p - off) / (1 - spread); lp = lp < 0 ? 0 : lp > 1 ? 1 : lp;
        cards[i].style.opacity = lp.toFixed(3);
        cards[i].style.transform = "scale(" + (0.62 + 0.38 * lp).toFixed(3) + ")";
      }
    }
    function onScroll() { if (!tick) { tick = true; requestAnimationFrame(setGP); } }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // a link straight to the gallery (or its section) reveals the full grid, never a half-scrub
    function targetsGrid() { var t = location.hash && document.querySelector(location.hash); return t && (t === grid || t.contains(grid) || grid.contains(t)); }
    function jump() { if (targetsGrid()) revealAll(); }
    window.addEventListener("hashchange", jump);
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
      var t = document.querySelector(a.getAttribute("href"));
      if (t && (t === grid || t.contains(grid) || grid.contains(t))) setTimeout(revealAll, 0);
    });
    jump();
    setGP();
  }

  function mount() {
    var box = document.getElementById("aam-missions");
    if (!box) return;
    box.innerHTML = render();
    setupScrub(box);
  }

  // expose for reuse/testing
  window.AAMMissions = { list: MISSIONS, render: render, mount: mount, setupScrub: setupScrub };

  // fill synchronously if the container is already parsed (script placed right after it),
  // otherwise wait for the DOM
  if (document.getElementById("aam-missions")) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
