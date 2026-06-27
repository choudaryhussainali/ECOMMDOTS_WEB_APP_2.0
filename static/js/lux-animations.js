/* ══════════════════════════════════════════════════════════════════════
   LUXURY MOTION ENGINE — Additive scroll-reveal & micro-interaction system
   Self-contained IIFE. Does not redeclare or touch any existing variable,
   function, or observer from the main index.js file.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
    "use strict";

    var reduceMotion = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ─── 1. WORD-SPLIT HEADLINES ───────────────────────────────────────
       Wrap each word of [data-lux-words] headings in a masked span so the
       CSS word-reveal animation can stagger them. Preserves <br> and any
       other child elements/line breaks already in the markup — only text
       nodes are split into words. Runs once on init. */
    function wrapWordsInTextNode(text, counterRef) {
        var words = text.split(/(\s+)/); // keep whitespace tokens too
        var frag = document.createDocumentFragment();
        words.forEach(function (chunk) {
            if (chunk === "") return;
            if (/^\s+$/.test(chunk)) {
                frag.appendChild(document.createTextNode(chunk));
                return;
            }
            var span = document.createElement("span");
            span.className = "lux-word-reveal";
            span.style.setProperty("--lux-i", counterRef.i++);
            var inner = document.createElement("span");
            inner.className = "lux-word-inner";
            inner.textContent = chunk;
            span.appendChild(inner);
            frag.appendChild(span);
        });
        return frag;
    }

    function splitWords() {
        var nodes = document.querySelectorAll("[data-lux-words]");
        nodes.forEach(function (el) {
            if (el.dataset.luxSplitDone) return;
            var counterRef = { i: 0 };
            // Walk existing child nodes; only split plain text nodes into
            // words, leave <br> and other elements (e.g. colored spans) intact.
            var children = Array.prototype.slice.call(el.childNodes);
            children.forEach(function (node) {
                if (node.nodeType === Node.TEXT_NODE) {
                    var frag = wrapWordsInTextNode(node.textContent, counterRef);
                    node.parentNode.replaceChild(frag, node);
                }
                // Element nodes (br, span, etc.) are left as-is.
            });
            el.dataset.luxSplitDone = "true";
        });
    }

    /* ─── 2. STAGGER INDEX ASSIGNMENT ───────────────────────────────────
       For any [data-lux-stagger] container, assign --lux-i to each direct
       child so the .lux-stagger CSS rule can delay them in sequence. */
    function assignStaggerIndices() {
        var groups = document.querySelectorAll("[data-lux-stagger]");
        groups.forEach(function (group) {
            var children = Array.prototype.slice.call(group.children);
            children.forEach(function (child, i) {
                child.style.setProperty("--lux-i", i);
            });
        });
    }

    /* ─── 3. PER-ELEMENT DELAY (data-lux-delay="0.2") ───────────────── */
    function applyDelays() {
        var delayed = document.querySelectorAll("[data-lux-delay]");
        delayed.forEach(function (el) {
            el.style.setProperty("--lux-delay", el.getAttribute("data-lux-delay") + "s");
        });
    }

    /* ─── 4. THE REVEAL OBSERVER ─────────────────────────────────────── */
    function initRevealObserver() {
        var targets = document.querySelectorAll(
            ".lux-reveal, .lux-reveal-up, .lux-reveal-left, .lux-reveal-right, " +
            ".lux-blur-reveal, .lux-scale-reveal, .lux-mask-reveal, .lux-stagger, " +
            ".lux-word-reveal, .lux-num-pop, .lux-img-reveal, .lux-shimmer-sweep"
        );

        if (!("IntersectionObserver" in window) || reduceMotion) {
            // Graceful fallback: reveal everything immediately, no animation.
            targets.forEach(function (el) {
                el.classList.add("lux-in");
            });
            return;
        }

        var io = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("lux-in");
                    } else {
                        entry.target.classList.remove("lux-in");
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
        );

        targets.forEach(function (el) {
            io.observe(el);
        });
    }

    /* ─── 5. MAGNETIC BUTTON HOVER ──────────────────────────────────────
       Subtle pull toward the cursor on [data-lux-magnetic] elements.
       Disabled on touch devices and reduced-motion. */
    function initMagneticButtons() {
        if (reduceMotion) return;
        var isTouch = window.matchMedia("(pointer: coarse)").matches;
        if (isTouch) return;

        var buttons = document.querySelectorAll("[data-lux-magnetic]");
        buttons.forEach(function (btn) {
            var strength = parseFloat(btn.getAttribute("data-lux-magnetic")) || 0.25;

            btn.addEventListener("mousemove", function (e) {
                var rect = btn.getBoundingClientRect();
                var relX = e.clientX - rect.left - rect.width / 2;
                var relY = e.clientY - rect.top - rect.height / 2;
                btn.style.transform =
                    "translate(" + relX * strength + "px, " + relY * strength + "px)";
            });

            btn.addEventListener("mouseleave", function () {
                btn.style.transform = "translate(0, 0)";
            });
        });
    }

    /* ─── 6. SOFT 3D TILT ────────────────────────────────────────────────
       Gentle pointer-driven tilt on [data-lux-tilt] cards. Desktop only. */
    function initTilt() {
        if (reduceMotion) return;
        var isTouch = window.matchMedia("(pointer: coarse)").matches;
        if (isTouch) return;

        var cards = document.querySelectorAll("[data-lux-tilt]");
        cards.forEach(function (card) {
            var maxTilt = parseFloat(card.getAttribute("data-lux-tilt")) || 4;

            card.addEventListener("mousemove", function (e) {
                var rect = card.getBoundingClientRect();
                var px = (e.clientX - rect.left) / rect.width - 0.5;
                var py = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform =
                    "perspective(900px) rotateY(" + (px * maxTilt) + "deg) rotateX(" +
                    (-py * maxTilt) + "deg)";
            });

            card.addEventListener("mouseleave", function () {
                card.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg)";
            });
        });
    }

    /* ─── INIT ───────────────────────────────────────────────────────── */
    function init() {
        splitWords();
        assignStaggerIndices();
        applyDelays();
        initRevealObserver();
        initMagneticButtons();
        initTilt();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();