class SlideshowScrollbar extends HTMLElement {
  #resizeObserver;
  #rafId = null;
  #slideshow;
  #scroller;

  connectedCallback() {
    this.#slideshow = this.closest('slideshow-component');
    this.#scroller = this.#slideshow?.querySelector('slideshow-slides[ref="scroller"]');

    if (!this.#scroller) return;

    this.#scroller.addEventListener('scroll', this.#requestUpdate, { passive: true });
    this.#slideshow?.addEventListener('slideshow:select', this.#requestUpdate);

    this.#resizeObserver = new ResizeObserver(this.#requestUpdate);
    this.#resizeObserver.observe(this.#scroller);

    this.#requestUpdate();
  }

  disconnectedCallback() {
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }

    this.#scroller?.removeEventListener('scroll', this.#requestUpdate);
    this.#slideshow?.removeEventListener('slideshow:select', this.#requestUpdate);
    this.#resizeObserver?.disconnect();
  }

  #requestUpdate = () => {
    if (this.#rafId !== null) return;

    this.#rafId = requestAnimationFrame(() => {
      this.#rafId = null;
      this.#update();
    });
  };

  #update() {
    if (!this.#scroller) return;

    const scrollableWidth = this.#scroller.scrollWidth - this.#scroller.clientWidth;
    const trackRatio = this.#scroller.scrollWidth > 0 ? this.#scroller.clientWidth / this.#scroller.scrollWidth : 1;
    const thumbWidth = Math.max(Math.min(trackRatio, 1), 0);
    const progress = scrollableWidth > 0 ? this.#scroller.scrollLeft / scrollableWidth : 0;
    const thumbOffset = (1 - thumbWidth) * Math.max(Math.min(progress, 1), 0);

    this.style.setProperty('--slideshow-scrollbar-thumb-width', `${thumbWidth * 100}%`);
    this.style.setProperty('--slideshow-scrollbar-thumb-offset', `${thumbOffset * 100}%`);
    this.toggleAttribute('hidden', scrollableWidth <= 1);
  }
}

if (!customElements.get('slideshow-scrollbar')) {
  customElements.define('slideshow-scrollbar', SlideshowScrollbar);
}
