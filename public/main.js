/* The read/write head: tracks the paper nearest the center of the
   viewport and marks it as the cell currently being "read".
   Pure progressive enhancement — the page is complete without it. */
(function () {
  "use strict";

  var head = document.querySelector(".head");
  var cells = Array.prototype.slice.call(document.querySelectorAll(".cell"));
  if (!head || !cells.length) return;

  var current = null;
  var ticking = false;

  function place() {
    ticking = false;

    var mid = window.innerHeight / 2;
    var best = null;
    var bestDist = Infinity;

    for (var i = 0; i < cells.length; i++) {
      var rect = cells[i].getBoundingClientRect();
      var center = rect.top + rect.height / 2;
      var dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = cells[i];
      }
    }
    if (!best) return;

    if (best !== current) {
      if (current) current.classList.remove("is-read");
      best.classList.add("is-read");
      current = best;
    }

    // position relative to <body> (the head's offset parent)
    var target = best.offsetTop + best.offsetHeight / 2;
    head.style.transform = "translateY(" + target + "px) translateY(-50%)";
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(place);
    }
  }

  head.classList.add("head--on");
  place();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(place); // re-measure once webfonts settle
  }
})();
