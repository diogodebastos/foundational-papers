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

  /* Turn each frame into a flip card: clicking the front flips it to a back
     face that embeds the paper's PDF (served same-origin from /paper/NN.pdf).
     The source chips stay independently clickable and open in a new tab.
     Only one frame stays flipped at a time. Built in JS, so without it the
     cards simply stay flat and the chips work as plain links. */
  function flipBuilder(cell) {
    var frame = cell.getAttribute("data-frame");
    var chips = cell.querySelectorAll(".cell__links a");
    if (!chips.length) return;
    chips.forEach(function (a) { a.target = "_blank"; a.rel = "noopener"; });

    var titleEl = cell.querySelector(".cell__title");
    var titleText = titleEl ? titleEl.textContent.trim() : "Frame " + frame;
    var isBook = frame === "04";

    var pdfChip = null;
    for (var i = 0; i < chips.length; i++) {
      if (/^pdf\b/i.test(chips[i].textContent.trim())) { pdfChip = chips[i]; break; }
    }
    var openHref = (pdfChip || chips[0]).href;   // book → publisher page

    // front face holds the existing card content
    var front = document.createElement("div");
    front.className = "cell__face cell__face--front";
    while (cell.firstChild) front.appendChild(cell.firstChild);

    var flip = document.createElement("button");
    flip.type = "button";
    flip.className = "cell__flip";
    flip.setAttribute("aria-expanded", "false");
    flip.setAttribute("aria-label", (isBook ? "About " : "Preview the PDF for ") + titleText);
    front.appendChild(flip);

    // back face: status bar + the PDF (or a book panel)
    var back = document.createElement("div");
    back.className = "cell__face cell__face--back";

    var bar = document.createElement("div");
    bar.className = "cell__bar";
    var label = document.createElement("span");
    label.className = "cell__bar-label";
    label.textContent = "FRAME " + frame + (isBook ? " · BOOK" : " · PDF");
    bar.appendChild(label);

    var open = document.createElement("a");
    open.className = "cell__bar-open";
    open.href = openHref;
    open.target = "_blank";
    open.rel = "noopener";
    open.textContent = "Open ↗";
    bar.appendChild(open);

    var close = document.createElement("button");
    close.type = "button";
    close.className = "cell__back";
    close.textContent = "Close ✕";
    bar.appendChild(close);
    back.appendChild(bar);

    var viewer;
    if (isBook) {
      viewer = document.createElement("div");
      viewer.className = "cell__book";
      var msg = document.createElement("p");
      msg.innerHTML = "<strong>Perceptrons</strong> is a book — there is no open PDF to preview. Read it via the publisher or a scanned copy:";
      viewer.appendChild(msg);
      var links = document.createElement("div");
      links.className = "cell__book-links";
      chips.forEach(function (a) { links.appendChild(a.cloneNode(true)); });
      viewer.appendChild(links);
    } else {
      viewer = document.createElement("iframe");
      viewer.className = "cell__pdf";
      viewer.title = titleText + " (PDF preview)";
      viewer.setAttribute("loading", "lazy");
      viewer.dataset.src = "/paper/" + frame + ".pdf";
    }
    back.appendChild(viewer);

    var inner = document.createElement("div");
    inner.className = "cell__inner";
    inner.appendChild(front);
    inner.appendChild(back);
    cell.appendChild(inner);

    function openFlip() {
      cells.forEach(function (c) {
        if (c !== cell) closeCell(c);
      });
      if (viewer.tagName === "IFRAME" && !viewer.src) viewer.src = viewer.dataset.src;
      cell.classList.add("is-flipped");
      flip.setAttribute("aria-expanded", "true");
      close.focus();
    }
    function closeFlip() {
      cell.classList.remove("is-flipped");
      flip.setAttribute("aria-expanded", "false");
      flip.focus();
    }

    flip.addEventListener("click", openFlip);
    close.addEventListener("click", closeFlip);
    cell.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && cell.classList.contains("is-flipped")) closeFlip();
    });
  }

  function closeCell(c) {
    if (!c.classList.contains("is-flipped")) return;
    c.classList.remove("is-flipped");
    var f = c.querySelector(".cell__flip");
    if (f) f.setAttribute("aria-expanded", "false");
  }

  cells.forEach(flipBuilder);

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
