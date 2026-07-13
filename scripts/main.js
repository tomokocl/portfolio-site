(() => {
  document.documentElement.classList.add("js");

  const config = window.SITE_CONFIG || {};
  const header = document.querySelector("[data-header]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  const focusableSelector = "a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])";
  let previousFocus = null;

  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 56);

  const closeNav = () => {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "メニューを開く");
    document.body.classList.remove("nav-open");
    previousFocus?.focus();
  };

  const openNav = () => {
    if (!nav || !navToggle) return;
    previousFocus = document.activeElement;
    nav.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "メニューを閉じる");
    document.body.classList.add("nav-open");
    nav.querySelector(focusableSelector)?.focus();
  };

  navToggle?.addEventListener("click", () => {
    if (navToggle.getAttribute("aria-expanded") === "true") closeNav();
    else openNav();
  });

  nav?.addEventListener("click", (event) => {
    if (event.target.closest("a") && window.innerWidth <= 980) closeNav();
  });

  document.addEventListener("keydown", (event) => {
    if (!nav?.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      closeNav();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...nav.querySelectorAll(focusableSelector)];
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

  window.addEventListener("scroll", updateHeader, { passive: true });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 980 && nav?.classList.contains("is-open")) closeNav();
  });
  updateHeader();

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  document.querySelectorAll("[data-mond-link]").forEach((link) => {
    if (config.mondUrl) link.href = config.mondUrl;
  });
  document.querySelectorAll("[data-mond-price]").forEach((node) => {
    if (config.mondMinimumPrice) node.textContent = config.mondMinimumPrice;
  });

  const moshReady = Boolean(config.moshEnabled && config.moshUrl);
  document.querySelectorAll("[data-mosh-section]").forEach((section) => {
    section.hidden = !moshReady;
    if (moshReady) section.querySelectorAll("[data-mosh-link]").forEach((link) => { link.href = config.moshUrl; });
  });

  const corporateSubject = "法人・プロジェクトのご相談";
  const corporateBody = [
    "椎葉ともこ様",
    "",
    "法人・プロジェクトについて相談します。",
    "",
    "会社・組織名：",
    "担当者名：",
    "メールアドレス：",
    "相談種別：",
    "対象者・人数：",
    "希望時期：",
    "予算帯：",
    "相談内容："
  ].join("\n");

  document.querySelectorAll("[data-corporate-mail]").forEach((link) => {
    if (!config.corporateEmail) {
      link.hidden = true;
      return;
    }
    link.href = `mailto:${config.corporateEmail}?subject=${encodeURIComponent(corporateSubject)}&body=${encodeURIComponent(corporateBody)}`;
  });

  document.querySelectorAll("[data-corporate-form]").forEach((form) => {
    const fallback = form.closest("[data-form-shell]")?.querySelector("[data-form-fallback]");
    if (!config.corporateFormUrl) {
      form.hidden = true;
      if (fallback) fallback.hidden = false;
      return;
    }
    form.action = config.corporateFormUrl;
    form.hidden = false;
    if (fallback) fallback.hidden = true;
  });

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reducedMotion = reducedMotionQuery.matches;
  const revealItems = document.querySelectorAll(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        instance.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -36px" });
    revealItems.forEach((item) => observer.observe(item));
  }

  document.querySelectorAll("[data-faq-button]").forEach((button) => {
    const answer = document.getElementById(button.getAttribute("aria-controls"));
    if (!answer) return;
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      answer.hidden = expanded;
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });

  const hero = document.querySelector("[data-hero]");
  const portrait = document.querySelector("[data-hero-portrait]");
  if (hero && portrait && !reducedMotion && window.matchMedia("(pointer: fine)").matches) {
    let pointerFrame = 0;
    let scrollFrame = 0;
    hero.addEventListener("pointermove", (event) => {
      if (window.innerWidth <= 900) return;
      cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 16;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 16;
        portrait.style.setProperty("--hero-x", `${x.toFixed(2)}px`);
        portrait.style.setProperty("--hero-y", `${y.toFixed(2)}px`);
      });
    });
    hero.addEventListener("pointerleave", () => {
      portrait.style.setProperty("--hero-x", "0px");
      portrait.style.setProperty("--hero-y", "0px");
    });
    window.addEventListener("scroll", () => {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = requestAnimationFrame(() => {
        const progress = Math.min(Math.max(window.scrollY / Math.max(hero.offsetHeight, 1), 0), 1);
        portrait.style.setProperty("--hero-scale", (1 + progress * 0.04).toFixed(3));
      });
    }, { passive: true });
  }

  document.addEventListener("visibilitychange", () => {
    document.documentElement.classList.toggle("is-page-hidden", document.hidden);
  });
})();
