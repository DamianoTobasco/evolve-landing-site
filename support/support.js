const supportForm = document.querySelector("[data-support-form]");

if (supportForm) {
  supportForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(supportForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const issue = String(formData.get("issue") || "General support").trim();
    const message = String(formData.get("message") || "").trim();

    const subject = `Evolve Support - ${issue}`;
    const lines = [
      name ? `Name: ${name}` : null,
      email ? `Email: ${email}` : null,
      `Issue: ${issue}`,
      "",
      message || "Please describe your issue."
    ].filter(Boolean);

    const body = lines.join("\n");
    const mailtoUrl = `mailto:evolve@theevolve.app?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;
  });
}
