/* Support page: the email form and the help search. */

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
    const mailtoUrl = `mailto:contact@theevolve.app?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;
  });
}

/* Help search: hides questions that don't match every typed word and opens the ones that do. */
const search = document.getElementById("helpSearch");
const empty = document.getElementById("helpEmpty");
const groups = Array.from(document.querySelectorAll(".faq-group"));
const topics = document.querySelector(".topics");

if (search) {
  const items = groups.flatMap((group) =>
    Array.from(group.querySelectorAll("details")).map((el) => ({ el, group, text: el.textContent.toLowerCase() }))
  );

  const run = () => {
    const words = search.value.toLowerCase().split(/\s+/).filter(Boolean);
    const searching = words.length > 0;
    let shown = 0;
    items.forEach((item) => {
      const hit = !searching || words.every((w) => item.text.includes(w));
      item.el.hidden = !hit;
      item.el.open = searching && hit && words.join("").length >= 3;
      if (hit) shown += 1;
    });
    groups.forEach((group) => {
      group.hidden = !group.querySelector("details:not([hidden])");
    });
    if (topics) topics.hidden = searching;
    empty.hidden = !searching || shown > 0;
  };

  search.addEventListener("input", run);
  search.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const first = document.querySelector(".faq-group:not([hidden]) details:not([hidden])");
      if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}
