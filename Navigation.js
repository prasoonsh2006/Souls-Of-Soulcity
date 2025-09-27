document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");
    const DESKTOP_BP = 768; // adjust breakpoint as needed

    // If required elements are missing, bail out to avoid runtime errors
    if (!hamburger || !navMenu) return;

    // Ensure navMenu has transition & initial "closed" visual state
    navMenu.style.transition = "transform 240ms cubic-bezier(.2,.8,.2,1), opacity 180ms ease";
    navMenu.style.transformOrigin = "center top";
    navMenu.style.transform = "scale(.85) translateY(-8px)";
    navMenu.style.opacity = "0";
    navMenu.style.pointerEvents = "none";
    navMenu.style.willChange = "transform, opacity";

    // Handle brand link (always go "home")
    const navBrand = document.querySelector(".navbrand-link");
    if (navBrand) {
        navBrand.addEventListener("click", (e) => {
            e.preventDefault();
            if (window.innerWidth < DESKTOP_BP) {
                closeMenu().then(() => showPage("home"));
            } else {
                showPage("home");
            }
        });
    }


    function setMenuOriginFromHamburger() {
        // Compute hamburger center relative to the navMenu box so the menu appears to pop out from the hamburger.
        const hamRect = hamburger.getBoundingClientRect();
        const menuRect = navMenu.getBoundingClientRect();

        const hamCenterX = hamRect.left + hamRect.width / 2;
        const hamCenterY = hamRect.top + hamRect.height / 2;

        const relX = Math.max(0, Math.min(menuRect.width, hamCenterX - menuRect.left));
        const relY = Math.max(0, Math.min(menuRect.height, hamCenterY - menuRect.top));

        navMenu.style.transformOrigin = `${relX}px ${relY}px`;
    }

    function showIcons(showHamburger) {
        const hamburgerIcon = hamburger.querySelector(".hamburger-icon");
        const closeIcon = hamburger.querySelector(".close-icon");

        [hamburgerIcon, closeIcon].forEach(icon => {
            if (!icon) return;
            icon.style.width = "100%";
            icon.style.height = "100%";
            icon.style.display = "flex";
            icon.style.alignItems = "center";
            icon.style.justifyContent = "center";
        });

        if (showHamburger) {
            hamburgerIcon && (hamburgerIcon.style.display = "flex");
            closeIcon && (closeIcon.style.display = "none");
        } else {
            hamburgerIcon && (hamburgerIcon.style.display = "none");
            closeIcon && (closeIcon.style.display = "flex");
        }
    }

    let isAnimating = false;
    let closeMenuTimer = null;

    // Return a Promise so callers can wait for open to finish if needed
    function openMenu() {
        if (isAnimating || navMenu.classList.contains("active")) return Promise.resolve();
        isAnimating = true;

        setMenuOriginFromHamburger();
        hamburger.classList.add("active");
        navMenu.classList.add("active");

        // Show close icon immediately, enable interaction before animation starts
        showIcons(false);
        navMenu.style.pointerEvents = "auto";

        // Force a repaint and start open animation
        requestAnimationFrame(() => {
            navMenu.style.transform = "scale(1) translateY(0)";
            navMenu.style.opacity = "1";
        });

        // Wait for transition end to clear animating flag and resolve
        return new Promise(resolve => {
            const onEnd = (e) => {
                if (e.propertyName === "opacity" || e.propertyName === "transform") {
                    isAnimating = false;
                    resolve();
                }
            };
            navMenu.addEventListener("transitionend", onEnd, { once: true });
        });
    }

    // Return a Promise so callers can wait for close to finish before navigation
    function closeMenu() {
        // If already animating, wait until animation completes
        if (isAnimating) {
            return new Promise(resolve => {
                const waitForIdle = () => {
                    if (!isAnimating) return resolve();
                    setTimeout(waitForIdle, 20);
                };
                waitForIdle();
            });
        }

        if (!navMenu.classList.contains("active")) return Promise.resolve();

        isAnimating = true;

        // start close animation
        navMenu.style.transform = "scale(.85) translateY(-8px)";
        navMenu.style.opacity = "0";

        // When animation finishes, hide menu, swap icons, and clear active classes
        return new Promise(resolve => {
            const onEnd = (e) => {
                if (e.propertyName !== "opacity" && e.propertyName !== "transform") return;

                navMenu.style.pointerEvents = "none";
                hamburger.classList.remove("active");
                navMenu.classList.remove("active");

                showIcons(true);

                isAnimating = false;
                resolve();
            };

            navMenu.addEventListener("transitionend", onEnd, { once: true });
        });
    }

    // Responsive behavior: keep menu visible on desktop and hide hamburger
    function updateResponsiveMenu() {
        const isDesktop = window.innerWidth >= DESKTOP_BP;

        if (isDesktop) {
            // Show full nav for desktop: disable pop animation, ensure visible
            navMenu.style.transition = ""; // optional: let CSS handle desktop styling if preferred
            navMenu.style.transform = "none";
            navMenu.style.opacity = "1";
            navMenu.style.pointerEvents = "auto";
            navMenu.classList.add("active");

            // hide hamburger completely on desktop
            hamburger.style.display = "none";
        } else {
            // Restore animated mobile state
            navMenu.style.transition = "transform 240ms cubic-bezier(.2,.8,.2,1), opacity 180ms ease";
            navMenu.style.transformOrigin = "center top";
            // Close menu by default on mobile
            navMenu.style.transform = "scale(.85) translateY(-8px)";
            navMenu.style.opacity = "0";
            navMenu.style.pointerEvents = "none";
            navMenu.classList.remove("active");

            hamburger.style.display = ""; // allow CSS to show it (inline/flex depending on your markup)
            showIcons(true);
        }
    }

    // Hamburger toggle with icon switch and pop animation
    hamburger.addEventListener("click", () => {
        // ignore clicks in desktop mode (hamburger hidden anyway)
        if (window.innerWidth >= DESKTOP_BP) return;

        if (navMenu.classList.contains("active")) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close menu when a nav link is clicked and navigate (wait for close on mobile)
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            const page = link.getAttribute("data-page");
            if (!page) {
                // no SPA data attribute: allow normal navigation
                return;
            }
            e.preventDefault();

            if (window.innerWidth < DESKTOP_BP) {
                closeMenu().then(() => showPage(page));
            } else {
                showPage(page);
            }
        });
    });

    // Open the current hash page on load
    const hash = window.location.hash.slice(1) || "home";
    showPage(hash);

    // Click outside to close (only on mobile)
    document.addEventListener("click", (e) => {
        if (window.innerWidth >= DESKTOP_BP) return;
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target) && navMenu.classList.contains("active")) {
            closeMenu();
        }
    });

    // --- Close on mouse leave logic ---
    const startCloseTimer = () => {
        clearTimeout(closeMenuTimer);
        if (window.innerWidth < DESKTOP_BP) { // Only on mobile
            closeMenuTimer = setTimeout(() => closeMenu().catch(()=>{}), 300); // Delay to allow moving between elements
        }
    };

    const clearCloseTimer = () => {
        clearTimeout(closeMenuTimer);
    };

    // When mouse leaves either hamburger or menu, start a timer to close the menu
    hamburger.addEventListener("mouseleave", startCloseTimer);
    navMenu.addEventListener("mouseleave", startCloseTimer);

    // If mouse enters either element, cancel the timer
    hamburger.addEventListener("mouseenter", clearCloseTimer);
    navMenu.addEventListener("mouseenter", clearCloseTimer);
    // --- End close on mouse leave logic ---

    // Recompute origin if window resizes (keeps pop point aligned) and update responsive state
    window.addEventListener("resize", () => {
        updateResponsiveMenu();
        if (navMenu.classList.contains("active") && window.innerWidth < DESKTOP_BP) setMenuOriginFromHamburger();
    });

    // Initialize responsive state on load
    updateResponsiveMenu();
});

function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const activeNavLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
    if (activeNavLink) activeNavLink.classList.add('active');

    // Show the target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add("active");

        // Wait for the browser to render the section, then scroll to top
        requestAnimationFrame(() => {
            targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        // window.location.hash = pageId;
        if (pageId === "home") {
            // remove hash without reloading or adding a history entry
            history.replaceState(null, "", window.location.pathname + window.location.search);
        } else {
            // show hash for non-home pages
            history.replaceState(null, "", "#" + pageId);
        }

    }
}


(function() {
    const footer = document.querySelector('footer');
    if (!footer) return;

    // Ensure footer is a positioned container so absolute child stays inside it
    const footerStyle = window.getComputedStyle(footer);
    if (footerStyle.position === 'static' || !footerStyle.position) {
        footer.style.position = 'relative';
    }

    // Remove existing marquee if present (avoid duplicates)
    const existing = document.getElementById('footer-marquee');
    if (existing) existing.parentNode.removeChild(existing);

    const container = document.createElement('div');
    container.id = 'footer-marquee';
    Object.assign(container.style, {
        position: 'absolute',
        left: '0',
        right: '0',
        bottom: '0px',
        width: '100%',
        overflow: 'hidden',
        height: '42px',
        lineHeight: '34px',
        display: 'block',
        background: 'transparent',
        pointerEvents: 'none',
        zIndex: '9999',
        whiteSpace: 'nowrap'
    });
    container.setAttribute('aria-hidden', 'true');

    // Single moving item
    const item = document.createElement('div');
    item.id = 'footer-marquee-item';
    Object.assign(item.style, {
        position: 'absolute',
        top: '50%',
        left: '0',
        bottom: '0',
        transform: 'translateY(-50%) translateX(0)',
        willChange: 'transform',
        whiteSpace: 'nowrap',
        fontSize: '20px',

        paddingRight: '0.25em'
    });
    const MESSAGE = '🏎️';
    item.textContent = MESSAGE;

    container.appendChild(item);
    footer.appendChild(container);

    // Animation state
    const PIXELS_PER_SEC = 120; // speed of the car
    let containerWidth = 0;
    let itemWidth = 0;
    let x = 0; // current x position (px) relative to container left
    let rafId = null;
    let lastTs = null;
    let running = false;

    function measure() {
        // Force layout reads
        containerWidth = Math.max(0, container.clientWidth);
        // Temporarily set transform to measure natural width
        const prev = item.style.transform;
        item.style.transform = 'translateY(-50%) translateX(0)';
        itemWidth = Math.max(0, item.offsetWidth);
        item.style.transform = prev;
    }

    function resetPosition() {
        // Start off-screen right so it enters from right
        x = containerWidth;
        updateTransform();
    }

    function updateTransform() {
        item.style.transform = `translateY(-50%) translateX(${Math.round(x)}px)`;
    }

    function tick(ts) {
        if (!lastTs) lastTs = ts;
        const dt = Math.min(50, ts - lastTs) / 1000; // seconds, clamp for tab throttling
        lastTs = ts;

        // Move right-to-left: decrease x
        x -= PIXELS_PER_SEC * dt;

        // When item has fully moved past the left edge, reset to right off-screen
        if (x < -itemWidth) {
            x = containerWidth;
        }

        updateTransform();
        if (running) rafId = requestAnimationFrame(tick);
    }

    function start() {
        if (running) return;
        running = true;
        lastTs = null;
        rafId = requestAnimationFrame(tick);
    }

    function stop() {
        running = false;
        lastTs = null;
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    function rebuild() {
        stop();
        measure();
        // If item or container widths are zero (e.g., not visible), place item at 0 and don't run
        if (containerWidth === 0 || itemWidth === 0) {
            x = 0;
            updateTransform();
            return;
        }
        resetPosition();
        start();
    }

    // Initial setup and event listeners
    rebuild();
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(rebuild, 120);
    });

    // If fonts are loading, recalc when ready so emoji/text size is correct
    if (document.fonts && document.fonts.status !== 'loaded') {
        document.fonts.ready.then(rebuild).catch(() => {});
    }

    // Pause when tab is hidden to save resources
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else start();
    });

    // Clean up if footer is removed from DOM (rare)
    const observer = new MutationObserver(() => {
        if (!document.body.contains(footer)) {
            stop();
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();


document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("header, .navbar, nav"); // Locate a header, .navbar, or nav element
    if (!header) return;

    let lastScrollTop = 0;
    const delta = 5; // Scroll threshold to prevent flickering
    const navbarHeight = header.offsetHeight;

    // Only transition background-color now (remove translate/hide behavior)
    header.style.transition = "background-color 0.3s ease";
    header.style.willChange = "background-color";
    header.style.backgroundColor = ""; // keep CSS default until changed on scroll

    window.addEventListener("scroll", () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Make sure they scroll more than delta
        if (Math.abs(lastScrollTop - scrollTop) <= delta) {
            return;
        }

        // When scrolled past navbar height (or just scrolled down), apply semi-transparent bg
        if (scrollTop > navbarHeight) {
            header.style.backgroundColor = "#ffffff50";
            // semi-transparent white
        } else {
            // At top or not past threshold: restore original background
            header.style.backgroundColor = ""; // revert to original CSS background
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
    }, false);
});






