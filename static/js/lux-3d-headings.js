/* ══════════════════════════════════════════════════════════════════════
   LUX 3D SIGNATURE HEADINGS ENGINE
   Self-contained IIFE. Builds on the existing lux-animations.js
   IntersectionObserver pattern but runs independently — does not
   redeclare any shared variable or function name.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
    "use strict";

    var reduceMotion = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ─── EFFECT 1 SETUP — split [data-lux-3d-letters] into per-letter
       spans, preserving <br> and any existing colored child <span>s,
       exactly like the word-splitter but at character granularity. ─── */
    /* Splits a text string into individually-animated letter spans,
       grouping each word's letters inside a "lux-3d-word" wrapper with
       white-space:nowrap and display:inline-block. This is essential:
       without a word-level grouping, the browser treats every letter
       as its own independent inline-block box and can break a line
       between any two letters of the same word. */
    function buildLetterFragment(text, counterRef) {
        var frag = document.createDocumentFragment();
        var words = text.split(/(\s+)/);
        words.forEach(function (chunk) {
            if (chunk === "") return;
            if (/^\s+$/.test(chunk)) {
                frag.appendChild(document.createTextNode(chunk));
                return;
            }
            var wordSpan = document.createElement("span");
            wordSpan.className = "lux-3d-word";
            var chars = chunk.split("");
            chars.forEach(function (ch) {
                var letterSpan = document.createElement("span");
                letterSpan.className = "lux-3d-letter";
                letterSpan.style.setProperty("--lux-i", counterRef.i++);
                letterSpan.textContent = ch;
                wordSpan.appendChild(letterSpan);
            });
            frag.appendChild(wordSpan);
        });
        return frag;
    }

    function splitLetters() {
        var nodes = document.querySelectorAll("[data-lux-3d-letters]");
        nodes.forEach(function (el) {
            if (el.dataset.luxLettersDone) return;
            var counterRef = { i: 0 };
            var children = Array.prototype.slice.call(el.childNodes);

            children.forEach(function (node) {
                if (node.nodeType === Node.TEXT_NODE) {
                    if (/^\s*$/.test(node.textContent)) {
                        return; // skip whitespace-only nodes (HTML indentation)
                    }
                    var frag = buildLetterFragment(node.textContent, counterRef);
                    node.parentNode.replaceChild(frag, node);
                } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== "BR") {
                    // Recurse one level into element children (e.g. <span class="text-red">)
                    // so colored sub-spans still get individually animated letters.
                    var innerChildren = Array.prototype.slice.call(node.childNodes);
                    innerChildren.forEach(function (innerNode) {
                        if (innerNode.nodeType === Node.TEXT_NODE) {
                            if (/^\s*$/.test(innerNode.textContent)) {
                                return;
                            }
                            var innerFrag = buildLetterFragment(innerNode.textContent, counterRef);
                            innerNode.parentNode.replaceChild(innerFrag, innerNode);
                        }
                    });
                }
            });

            el.dataset.luxLettersDone = "true";
        });
    }

    /* ─── EFFECT 3 SETUP — assign distinct depth/offset custom
       properties to each [data-lux-3d-focus-line] so the three lines
       of the contact heading converge from genuinely different
       directions rather than repeating one motion. ─── */
    function setupFocusLines() {
        var wraps = document.querySelectorAll(".lux-3d-focus-wrap");
        wraps.forEach(function (wrap) {
            var lines = wrap.querySelectorAll(".lux-3d-focus-line");
            // Each line gets a unique depth (z) and horizontal drift (x),
            // hand-picked so the convergence feels directional, not random.
            var presets = [
                { lz: "-220px", lx: "-60px" },
                { lz: "-340px", lx: "70px" },
                { lz: "-160px", lx: "-30px" },
            ];
            lines.forEach(function (line, i) {
                var preset = presets[i % presets.length];
                line.style.setProperty("--lz", preset.lz);
                line.style.setProperty("--lx", preset.lx);
                line.style.setProperty("--lux-i", i);
            });
        });
    }

    /* ─── REVEAL OBSERVER for the three wrapper classes ─── */
    function initObserver() {
        var targets = document.querySelectorAll(
            ".lux-3d-assembly, .lux-3d-slab-wrap, .lux-3d-focus-wrap"
        );

        if (!("IntersectionObserver" in window) || reduceMotion) {
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
            { threshold: 0.25, rootMargin: "0px 0px -10% 0px" }
        );

        targets.forEach(function (el) {
            io.observe(el);
        });
    }

    function init() {
        splitLetters();
        setupFocusLines();
        initObserver();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();