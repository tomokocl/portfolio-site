(() => {
  document.documentElement.classList.add("js");

  const header = document.querySelector("[data-header]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  const focusableSelector = "a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])";
  let previousFocus = null;

  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 80);
  };

  const closeNav = () => {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
    if (previousFocus) previousFocus.focus();
  };

  const openNav = () => {
    if (!nav || !navToggle) return;
    previousFocus = document.activeElement;
    nav.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-open");
    const firstFocusable = nav.querySelector(focusableSelector);
    firstFocusable?.focus();
  };

  navToggle?.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    if (isOpen) closeNav();
    else openNav();
  });

  nav?.addEventListener("click", (event) => {
    if (event.target.closest("a") && window.innerWidth <= 900) closeNav();
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
    if (window.innerWidth > 900 && nav?.classList.contains("is-open")) closeNav();
  });
  updateHeader();

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    }, { threshold: 0.12, rootMargin: "0px 0px -40px" });
    revealItems.forEach((item) => observer.observe(item));
  }

  document.querySelectorAll("[data-faq-button]").forEach((button) => {
    const answerId = button.getAttribute("aria-controls");
    const answer = document.getElementById(answerId);
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

  const inquiryForm = document.querySelector("[data-inquiry-form]");
  const formStatus = document.querySelector("[data-form-status]");
  inquiryForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!inquiryForm.reportValidity()) return;
    const recipient = inquiryForm.dataset.recipient;
    if (!recipient) {
      if (formStatus) formStatus.textContent = "送信先の設定が未完了です。SubstackまたはXからご連絡ください。";
      return;
    }
    const data = new FormData(inquiryForm);
    const topic = data.get("topic") || "その他";
    const subject = `サイトからのご相談：${topic}`;
    const body = [
      "椎葉ともこ様",
      "",
      "サイトからのご相談です。",
      "",
      `用件：${topic}`,
      `お名前・会社名：${data.get("name") || "未入力"}`,
      `メールアドレス：${data.get("email") || "未入力"}`,
      `希望時期：${data.get("timing") || "未定"}`,
      "",
      "相談内容：",
      data.get("message") || "",
    ].join("\n");
    if (formStatus) formStatus.textContent = "メールアプリを開きます。内容を確認して送信してください。";
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
