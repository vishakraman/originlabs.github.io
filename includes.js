/**
 * includes.js — OriginLabs shared partial loader
 *
 * Usage in any HTML page:
 *   <div data-include="includes/header.html"></div>
 *   <div data-include="includes/cta.html"></div>    <!-- optional -->
 *   <div data-include="includes/footer.html"></div>
 *   <script src="includes.js"></script>
 *
 * The script resolves each data-include, fetches the partial,
 * injects it into the placeholder, then runs shared site scripts
 * (theme toggle, mobile menu, nav hover pill, custom cursor).
 *
 * Active nav link is set automatically based on the current filename.
 */

(function () {
    'use strict';

    /* ─── Active page detection ────────────────────────────────── */
    var path = window.location.pathname;
    var file = path.split('/').pop() || 'index.html';
    // map filenames → data-page keys used in partials
    var PAGE_MAP = {
        'index.html': '',          // home — no nav item highlighted
        'services.html': 'services',
        'builder.html': 'builder',
        'about.html': 'about',
        'blog.html': 'blog',
        'blog-detail.html': 'blog',
        'contact.html': 'contact',
    };
    var activePage = PAGE_MAP[file] || '';

    /* ─── Fetch a partial and inject ───────────────────────────── */
    function loadPartial(el) {
        var src = el.getAttribute('data-include');
        if (!src) return Promise.resolve();
        return fetch(src)
            .then(function (res) { return res.text(); })
            .then(function (html) {
                // Strip out any <meta> tags injected by servers (e.g. GitHub Pages CSP)
                var cleanHtml = html.replace(/<meta\b[^>]*>/gi, '');
                el.outerHTML = cleanHtml;   // replace placeholder with actual HTML
            })
            .catch(function (err) {
                console.warn('[includes.js] Could not load partial:', src, err);
            });
    }

    /* ─── Theme ─────────────────────────────────────────────────── */
    function isDark() {
        return document.documentElement.classList.contains('dark');
    }

    function applyTheme(dark) {
        var html = document.documentElement;
        html.classList.remove('dark', 'light');
        html.classList.add(dark ? 'dark' : 'light');
        localStorage.setItem('ol-theme', dark ? 'dark' : 'light');
        document.body.style.backgroundColor = dark ? '#0C1220' : '#ffffff';
        document.body.style.color = dark ? '#ffffff' : '#0f172a';

        var icon = document.getElementById('toggle-icon');
        var iconM = document.getElementById('toggle-icon-mobile');
        var lblM = document.getElementById('toggle-label-mobile');
        if (icon) icon.textContent = dark ? 'dark_mode' : 'light_mode';
        if (iconM) iconM.textContent = dark ? 'dark_mode' : 'light_mode';
        if (lblM) lblM.textContent = dark ? 'Light mode' : 'Dark mode';

        document.querySelectorAll('.dark-only').forEach(function (el) {
            el.style.display = dark ? '' : 'none';
        });
        document.querySelectorAll('.light-only').forEach(function (el) {
            el.style.display = dark ? 'none' : '';
        });
    }

    /* ─── Mobile menu ───────────────────────────────────────────── */
    function initMobileMenu() {
        var menuToggle = document.getElementById('menu-toggle');
        var mMenu = document.getElementById('mobile-menu');
        var iOpen = document.getElementById('icon-open');
        var iClose = document.getElementById('icon-close');
        if (!menuToggle || !mMenu) return;

        menuToggle.addEventListener('click', function () {
            var open = mMenu.classList.toggle('open');
            if (iOpen) iOpen.classList.toggle('hidden', open);
            if (iClose) iClose.classList.toggle('hidden', !open);
        });

        mMenu.querySelectorAll('a, button').forEach(function (el) {
            el.addEventListener('click', function () {
                mMenu.classList.remove('open');
                if (iOpen) iOpen.classList.remove('hidden');
                if (iClose) iClose.classList.add('hidden');
            });
        });
    }

    /* ─── Desktop nav hover pill ────────────────────────────────── */
    function initNavHover() {
        var navLinks = document.querySelectorAll('[data-nav]');
        var hoverBg = document.getElementById('nav-hover-bg');
        if (!hoverBg) return;

        navLinks.forEach(function (link) {
            link.addEventListener('mouseenter', function () {
                var r = link.getBoundingClientRect();
                var pr = link.parentElement.getBoundingClientRect();
                hoverBg.style.left = (r.left - pr.left) + 'px';
                hoverBg.style.width = r.width + 'px';
                hoverBg.style.opacity = '1';
            });
            link.addEventListener('mouseleave', function () {
                hoverBg.style.opacity = '0';
            });
        });
    }

    /* ─── Active nav link ───────────────────────────────────────── */
    function setActiveLink() {
        if (!activePage) return;

        // Desktop
        document.querySelectorAll('[data-nav][data-page]').forEach(function (a) {
            if (a.getAttribute('data-page') === activePage) {
                a.classList.add('active');
            }
        });

        // Mobile
        document.querySelectorAll('.mob-nav-link[data-page]').forEach(function (a) {
            if (a.getAttribute('data-page') === activePage) {
                a.classList.remove(
                    'dark:text-slate-300', 'text-slate-600',
                    'dark:hover:text-white', 'hover:text-slate-900',
                    'dark:hover:bg-[#1A2437]', 'hover:bg-slate-100'
                );
                a.classList.add('text-primary', 'dark:bg-[#1A2437]', 'bg-slate-100');
            }
        });

        // Footer nav highlight
        document.querySelectorAll('.footer-nav-link').forEach(function (a) {
            var href = a.getAttribute('href') || '';
            if (href.indexOf(activePage) !== -1 && activePage !== '') {
                a.classList.remove('dark:text-slate-400', 'text-slate-600');
                a.classList.add('text-primary');
            }
        });
    }

    /* ─── Custom cursor (pointer devices only) ──────────────────── */
    function initCursor() {
        if (!window.matchMedia('(pointer: fine)').matches) return;
        if (!document.getElementById('custom-cursor')) {
            var cursorHTML = '<div id="custom-cursor" style="position:fixed;pointer-events:none;z-index:999999;top:0;left:0;">' +
                '<div id="cursor-ring" style="width:36px;height:36px;border:1.5px solid rgba(37,99,235,0.8);border-radius:50%;position:absolute;transform:translate(-50%,-50%);transition:width 0.2s,height 0.2s,background 0.2s;"></div>' +
                '<div id="cursor-dot" style="width:4px;height:4px;background:#2563EB;border-radius:50%;position:absolute;transform:translate(-50%,-50%);"></div>' +
                '<div id="cursor-crosshair-h" style="width:12px;height:1px;background:rgba(37,99,235,0.5);position:absolute;transform:translate(-50%,-50%);"></div>' +
                '<div id="cursor-crosshair-v" style="width:1px;height:12px;background:rgba(37,99,235,0.5);position:absolute;transform:translate(-50%,-50%);"></div>' +
                '</div>';
            document.body.insertAdjacentHTML('beforeend', cursorHTML);
        }

        var dot = document.getElementById('cursor-dot');
        var ring = document.getElementById('cursor-ring');
        var crossH = document.getElementById('cursor-crosshair-h');
        var crossV = document.getElementById('cursor-crosshair-v');
        if (!dot || !ring) return;

        var mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
        var ringX = mouseX, ringY = mouseY;

        document.addEventListener('mousemove', function (e) {
            mouseX = e.clientX; mouseY = e.clientY;
            dot.style.left = mouseX + 'px'; dot.style.top = mouseY + 'px';
            if (crossH) { crossH.style.left = mouseX + 'px'; crossH.style.top = mouseY + 'px'; }
            if (crossV) { crossV.style.left = mouseX + 'px'; crossV.style.top = mouseY + 'px'; }
        });

        (function animateRing() {
            ringX += (mouseX - ringX) * 0.25;
            ringY += (mouseY - ringY) * 0.25;
            ring.style.left = ringX + 'px';
            ring.style.top = ringY + 'px';
            requestAnimationFrame(animateRing);
        })();

        document.querySelectorAll('a, button').forEach(function (el) {
            el.addEventListener('mouseenter', function () { document.body.classList.add('cursor-hover'); });
            el.addEventListener('mouseleave', function () { document.body.classList.remove('cursor-hover'); });
        });
    }

    /* ─── Dark-only / light-only ambient glows ──────────────────── */
    function initGlows() {
        var dark = isDark();
        document.querySelectorAll('.dark-only').forEach(function (el) {
            el.style.display = dark ? '' : 'none';
        });
        document.querySelectorAll('.light-only').forEach(function (el) {
            el.style.display = dark ? 'none' : '';
        });
    }

    /* ─── Boot sequence ─────────────────────────────────────────── */
    function boot() {
        // Load all partials
        var placeholders = Array.from(document.querySelectorAll('[data-include]'));
        var promises = placeholders.map(loadPartial);

        Promise.all(promises).then(function () {
            // All partials are now in the DOM
            applyTheme(isDark());
            initGlows();
            initMobileMenu();
            initNavHover();
            setActiveLink();
            initCursor();

            // Wire up theme toggles
            var tt = document.getElementById('theme-toggle');
            var ttm = document.getElementById('theme-toggle-mobile');
            if (tt) tt.addEventListener('click', function () { applyTheme(!isDark()); });
            if (ttm) ttm.addEventListener('click', function () { applyTheme(!isDark()); });
        });
    }

    // Run after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
