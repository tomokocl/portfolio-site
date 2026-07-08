(() => {
  const recipient = "y.n.b12201220@gmail.com";
  const forms = document.querySelectorAll("[data-inquiry-form]");

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const data = new FormData(form);
      const topic = data.get("topic") || "お問い合わせ";
      const name = data.get("name") || "未入力";
      const email = data.get("email") || "未入力";
      const timing = data.get("timing") || "未入力";
      const message = data.get("message") || "";
      const subject = `サイトからのお問い合わせ: ${topic}`;
      const body = [
        "サイトからのお問い合わせです。",
        "",
        `用件: ${topic}`,
        `お名前: ${name}`,
        `メールアドレス: ${email}`,
        `希望時期: ${timing}`,
        "",
        "内容:",
        message,
      ].join("\n");

      window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  });
})();
