/* The read/write head is fixed at center; the tape slides under it.
   This marks the frame beneath the head and updates the counter, and
   maps vertical wheel input onto horizontal travel so a mouse can read
   the tape. Pure progressive enhancement — native horizontal scroll,
   touch swipe, and keyboard arrows all work without it. */
(function () {
  "use strict";

  var tape = document.getElementById("tape");
  var frame = document.getElementById("frame");
  var cells = Array.prototype.slice.call(document.querySelectorAll(".cell"));
  if (!tape || !cells.length) return;

  var current = null;
  var ticking = false;

  function update() {
    ticking = false;

    var box = tape.getBoundingClientRect();
    var mid = box.left + tape.clientWidth / 2;   // horizontal center of the tape
    var best = null;
    var bestDist = Infinity;

    for (var i = 0; i < cells.length; i++) {
      var rect = cells[i].getBoundingClientRect();
      var center = rect.left + rect.width / 2;
      var dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = cells[i];
      }
    }
    if (!best || best === current) return;

    if (current) current.classList.remove("is-read");
    best.classList.add("is-read");
    current = best;
    if (frame) frame.textContent = best.getAttribute("data-frame") || "";
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  // Translate vertical wheel into horizontal travel (leave real
  // horizontal trackpad gestures to the browser).
  tape.addEventListener("wheel", function (e) {
    if (e.deltaY === 0) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    tape.scrollLeft += e.deltaY;
  }, { passive: false });

  tape.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  update();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(update); // re-measure once webfonts settle
  }
})();
