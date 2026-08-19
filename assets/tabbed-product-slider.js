import { Component } from '@theme/component';

/**
 * @typedef {Object} TabbedProductSliderRefs
 * @property {HTMLButtonElement[]} tabs
 * @property {HTMLElement[]} panels
 * @property {HTMLAnchorElement} shopAll
 */

/** @extends {Component<TabbedProductSliderRefs>} */
class TabbedProductSlider extends Component {
  requiredRefs = ['tabs', 'panels', 'shopAll'];

  /** @type {AbortController | null} */
  #abortController = null;

  connectedCallback() {
    super.connectedCallback();
    this.#setup();
  }

  updatedCallback() {
    super.updatedCallback();
    this.#setup();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#abortController?.abort();
  }

  #setup() {
    this.#abortController?.abort();
    this.#abortController = new AbortController();

    const options = { signal: this.#abortController.signal };

    this.refs.tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => this.select(index), options);
    });

    this.addEventListener('keydown', this.#handleKeydown, options);

    const selectedIndex = this.refs.tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true');
    this.select(selectedIndex >= 0 ? selectedIndex : 0);
  }

  /**
   * @param {number} index
   * @param {{ focus?: boolean }} [options]
   */
  select(index, options = {}) {
    const { tabs, panels, shopAll } = this.refs;
    if (!tabs.length || !panels.length) return;

    const selectedIndex = Math.min(Math.max(index, 0), tabs.length - 1);

    tabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === selectedIndex;
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel, panelIndex) => {
      const isActive = panelIndex === selectedIndex;
      panel.hidden = !isActive;
      panel.toggleAttribute('inert', !isActive);
    });

    const selectedTab = tabs[selectedIndex];
    const collectionUrl = selectedTab?.dataset.collectionUrl;
    const collectionTitle = selectedTab?.dataset.collectionTitle;
    const label = shopAll.dataset.label || shopAll.textContent?.trim() || 'Shop all';

    if (collectionUrl) shopAll.href = collectionUrl;
    if (collectionTitle) shopAll.setAttribute('aria-label', `${label} — ${collectionTitle}`);
    if (options.focus) selectedTab?.focus();
  }

  /** @param {KeyboardEvent} event */
  #handleKeydown = (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement) || target.getAttribute('role') !== 'tab') return;

    const { tabs } = this.refs;
    const currentIndex = tabs.indexOf(target);
    if (currentIndex < 0) return;

    let nextIndex;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (currentIndex + 1) % tabs.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    this.select(nextIndex, { focus: true });
  };
}

if (!customElements.get('tabbed-product-slider-component')) {
  customElements.define('tabbed-product-slider-component', TabbedProductSlider);
}
