const SHOWCASE_INTERVAL_MS = 3600;

const slides = Array.from(document.querySelectorAll("[data-slide]"));
const captions = Array.from(document.querySelectorAll("[data-caption]"));
const dots = Array.from(document.querySelectorAll("[data-dot]"));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (slides.length && slides.length === captions.length && slides.length === dots.length) {
  let activeIndex = 0;
  let intervalId = null;

  const setActive = (nextIndex) => {
    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === nextIndex);
    });

    captions.forEach((caption, index) => {
      caption.classList.toggle("is-active", index === nextIndex);
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === nextIndex);
    });

    activeIndex = nextIndex;
  };

  const startRotation = () => {
    if (prefersReducedMotion.matches || intervalId !== null) {
      return;
    }

    intervalId = window.setInterval(() => {
      const nextIndex = (activeIndex + 1) % slides.length;
      setActive(nextIndex);
    }, SHOWCASE_INTERVAL_MS);
  };

  const stopRotation = () => {
    if (intervalId === null) {
      return;
    }

    window.clearInterval(intervalId);
    intervalId = null;
  };

  setActive(0);
  startRotation();

  prefersReducedMotion.addEventListener("change", () => {
    stopRotation();
    startRotation();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopRotation();
      return;
    }

    startRotation();
  });
}
