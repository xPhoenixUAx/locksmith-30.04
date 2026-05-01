(function () {
  "use strict";

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  document.addEventListener("DOMContentLoaded", () => {
    if (window.lucide) {
      window.lucide.createIcons();
    }

    initHeader();
    initMobileMenu();
    initMobileDropdowns();
    initFloatingCta();
    initFaq();
    initForms();
    initGallery();
    initReveals();
    initHeroParallax();
    initCardTilt();
    initActiveNavigation();
    initImageFallbacks();
    initCookieBanner();
  });

  function initHeader() {
    const header = qs(".site-header");
    if (!header) return;
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initMobileMenu() {
    const panel = qs("#mobile-panel");
    const openBtn = qs("[data-menu-open]");
    const closeBtn = qs("[data-menu-close]");
    const backdrop = qs("[data-menu-backdrop]");
    if (!panel || !openBtn || !closeBtn || !backdrop) return;

    const focusableSelector = "a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex='-1'])";
    let lastFocus = null;

    const open = () => {
      lastFocus = document.activeElement;
      document.body.classList.add("menu-open");
      panel.classList.add("is-open");
      backdrop.classList.add("is-open");
      openBtn.setAttribute("aria-expanded", "true");
      const focusable = qsa(focusableSelector, panel);
      if (focusable[0]) focusable[0].focus();
    };

    const close = () => {
      document.body.classList.remove("menu-open");
      panel.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      openBtn.setAttribute("aria-expanded", "false");
      if (lastFocus) lastFocus.focus();
    };

    openBtn.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", close);
    qsa("a", panel).forEach((link) => link.addEventListener("click", close));

    document.addEventListener("keydown", (event) => {
      if (!panel.classList.contains("is-open")) return;
      if (event.key === "Escape") close();
      if (event.key !== "Tab") return;
      const focusable = qsa(focusableSelector, panel);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  function initMobileDropdowns() {
    qsa("[data-mobile-dropdown]").forEach((button) => {
      const dropdown = button.closest(".mobile-dropdown");
      if (!dropdown) return;
      button.addEventListener("click", () => {
        const isOpen = dropdown.classList.toggle("is-open");
        button.setAttribute("aria-expanded", String(isOpen));
      });
    });
  }

  function initFloatingCta() {
    const cta = qs(".floating-cta");
    if (!cta) return;
    const onScroll = () => cta.classList.toggle("is-visible", window.scrollY > 240);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initFaq() {
    qsa(".faq-item").forEach((item) => {
      const button = qs(".faq-question", item);
      const answer = qs(".faq-answer", item);
      if (!button || !answer) return;
      const id = answer.id || `faq-${Math.random().toString(36).slice(2)}`;
      answer.id = id;
      button.setAttribute("aria-controls", id);
      button.setAttribute("aria-expanded", "false");
      button.addEventListener("click", () => {
        const open = item.classList.toggle("is-open");
        button.setAttribute("aria-expanded", String(open));
      });
    });
  }

  function initForms() {
    qsa("form[data-validate]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const valid = validateForm(form);
        const success = qs(".form-success", form);
        if (!valid) {
          const firstInvalid = qs("[aria-invalid='true']", form);
          if (firstInvalid) firstInvalid.focus();
          if (success) success.classList.remove("is-visible");
          return;
        }
        form.reset();
        qsa("[aria-invalid]", form).forEach((field) => field.removeAttribute("aria-invalid"));
        qsa(".field-error", form).forEach((error) => (error.textContent = ""));
        if (success) success.classList.add("is-visible");
      });
    });
  }

  function validateForm(form) {
    let isValid = true;
    qsa("[data-required]", form).forEach((field) => {
      const value = field.value.trim();
      let message = "";
      if (!value) message = "This field is required.";
      if (!message && field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        message = "Enter a valid email address.";
      }
      if (!message && field.dataset.validate === "phone" && !/^[0-9+().\-\s]{7,20}$/.test(value)) {
        message = "Enter a valid phone number.";
      }
      if (!message && field.dataset.validate === "zip" && !/^\d{5}(-\d{4})?$/.test(value)) {
        message = "Enter a valid ZIP code.";
      }
      setFieldError(field, message);
      if (message) isValid = false;
    });
    return isValid;
  }

  function setFieldError(field, message) {
    const error = qs(`#${field.getAttribute("aria-describedby")}`);
    field.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) error.textContent = message;
  }

  function initGallery() {
    const lightbox = qs("[data-lightbox]");
    const lightboxImg = qs("[data-lightbox-img]");
    const lightboxClose = qs("[data-lightbox-close]");
    if (!lightbox || !lightboxImg || !lightboxClose) return;

    qsa("[data-gallery-item]").forEach((item) => {
      item.addEventListener("click", () => {
        const img = qs("img", item);
        if (!img) return;
        lightboxImg.src = img.currentSrc || img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add("is-open");
        lightboxClose.focus();
      });
    });

    const close = () => {
      lightbox.classList.remove("is-open");
      lightboxImg.removeAttribute("src");
    };

    lightboxClose.addEventListener("click", close);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && lightbox.classList.contains("is-open")) close();
    });
  }

  function initReveals() {
    const items = qsa(".reveal, .reveal-group, .reveal-item");
    if (!items.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );
    items.forEach((item) => observer.observe(item));
  }

  function initHeroParallax() {
    const hero = qs(".ref-hero");
    const photo = qs(".ref-hero-photo");
    if (!hero || !photo || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      photo.style.setProperty("--hero-parallax-x", `${x * 14}px`);
      photo.style.setProperty("--hero-parallax-y", `${y * 10}px`);
    });

    hero.addEventListener("pointerleave", () => {
      photo.style.setProperty("--hero-parallax-x", "0px");
      photo.style.setProperty("--hero-parallax-y", "0px");
    });
  }

  function initCardTilt() {
    const cards = qsa(".ref-service-card");
    if (!cards.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    cards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty("--tilt-x", `${x * 4}deg`);
        card.style.setProperty("--tilt-y", `${y * -4}deg`);
      });

      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      });
    });
  }

  function initActiveNavigation() {
    const current = window.location.pathname.split("/").pop() || "index.html";
    qsa(".desktop-nav a, .mobile-nav a").forEach((link) => {
      const href = link.getAttribute("href");
      if (href === current) link.setAttribute("aria-current", "page");
    });
  }

  function initImageFallbacks() {
    qsa("img[data-fallback]").forEach((img) => {
      img.addEventListener(
        "error",
        () => {
          if (img.dataset.fallbackApplied) return;
          img.dataset.fallbackApplied = "true";
          img.src = img.dataset.fallback;
        },
        { once: true }
      );
    });
  }

  function initCookieBanner() {
    const storageKey = "lockbridge-cookie-consent";
    if (localStorage.getItem(storageKey)) return;

    const banner = document.createElement("section");
    banner.className = "cookie-banner";
    banner.setAttribute("aria-label", "Cookie consent");
    banner.innerHTML = `
      <div class="cookie-copy">
        <span class="cookie-label">Cookie preferences</span>
        <h2>We use cookies to improve this site.</h2>
        <p>LockBridge Connect uses essential cookies and may use analytics or marketing cookies to understand site usage and improve request flow. You can accept, reject, or manage non-essential cookies.</p>
        <a href="cookie.html">Read Cookie Policy</a>
      </div>
      <div class="cookie-preferences" hidden>
        <label><input type="checkbox" checked disabled> Essential cookies</label>
        <label><input type="checkbox" data-cookie-option="analytics"> Analytics cookies</label>
        <label><input type="checkbox" data-cookie-option="marketing"> Marketing cookies</label>
      </div>
      <div class="cookie-actions">
        <button class="btn btn-primary" type="button" data-cookie-accept>Accept</button>
        <button class="btn btn-outline" type="button" data-cookie-reject>Reject</button>
        <button class="btn btn-ghost" type="button" data-cookie-manage aria-expanded="false">Manage</button>
      </div>
    `;

    document.body.appendChild(banner);

    const preferences = qs(".cookie-preferences", banner);
    const manage = qs("[data-cookie-manage]", banner);
    const accept = qs("[data-cookie-accept]", banner);
    const reject = qs("[data-cookie-reject]", banner);

    const save = (value) => {
      localStorage.setItem(storageKey, JSON.stringify({ ...value, savedAt: new Date().toISOString() }));
      banner.classList.add("is-hiding");
      window.setTimeout(() => banner.remove(), 220);
    };

    manage.addEventListener("click", () => {
      const isHidden = preferences.hasAttribute("hidden");
      preferences.toggleAttribute("hidden", !isHidden);
      manage.setAttribute("aria-expanded", String(isHidden));
    });

    accept.addEventListener("click", () => save({ essential: true, analytics: true, marketing: true }));
    reject.addEventListener("click", () => save({ essential: true, analytics: false, marketing: false }));
  }
})();
