/* ==========================================================================
   LAXEE — Site chrome

   The header and footer are built here rather than pasted into every page.
   Change the navigation once and every page follows.

   They are rendered from JavaScript, not fetched as HTML fragments, so the
   site still works when opened directly from a folder as well as when served
   from a host. Fragment fetching would fail on file:// and cost a round trip
   on every page load.
   ========================================================================== */

import { CONFIG } from "./config.js";
import { $, $$, el, esc, setCartCount } from "./ui.js";
import { cart, account } from "./api.js";

const NAV = [
  { label: "Collections",   href: "collections.html" },
  { label: "Occasions",     href: "occasions.html" },
  { label: "Bespoke Gifts", href: "bespoke.html" },
  { label: "Our Story",     href: "story.html" },
  { label: "Journal",       href: "journal.html" },
];

const ICON = {
  search: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>`,
  user:   `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  heart:  `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21.2l7.7-7.8 1.1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`,
  bag:    `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/></svg>`,
  menu:   `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h18M3 12h18M3 18h18"/></svg>`,
  close:  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
  fb:     `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1z"/></svg>`,
  ig:     `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17.2" cy="6.8" r="1"/></svg>`,
  wa:     `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1a12 12 0 0 1-5.7-5c-.4-.7-.9-1.6-.9-2.4 0-.9.5-1.3.7-1.5.2-.2.4-.3.6-.3h.4c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.5l-.3.4c-.1.1-.2.3-.1.5.3.6 1.2 1.9 2.5 2.5.2.1.4.1.5-.1l.5-.6c.1-.2.3-.2.5-.1l1.6.8c.2.1.3.2.3.3.1.2.1.6-.2 1.2z"/></svg>`,
};

/* ---- Header --------------------------------------------------------------- */

function headerMarkup(current) {
  const links = NAV.map((n) => `
    <a class="nav__link" href="${n.href}"
       ${current === n.href ? 'aria-current="page"' : ""}>${n.label}</a>`).join("");

  return `
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="masthead">
    <div class="shell masthead__inner">

      <a class="brand" href="index.html" aria-label="${esc(CONFIG.brand.name)} home">
        <span class="wordmark foil brand__name">${esc(CONFIG.brand.name)}</span>
        <span class="brand__tag">${esc(CONFIG.brand.tagline)}</span>
      </a>

      <nav class="nav" aria-label="Primary">${links}</nav>

      <form class="search" role="search" data-search>
        <span class="search__icon">${ICON.search}</span>
        <input class="search__input" type="search" name="q"
               placeholder="Search gifts" aria-label="Search gifts"
               enterkeyhint="search">
      </form>

      <div class="actions">
        <a class="icon-btn" href="account.html" aria-label="Account">${ICON.user}</a>
        <a class="icon-btn" href="wishlist.html" aria-label="Wishlist">${ICON.heart}</a>
        <a class="icon-btn" href="cart.html" aria-label="Shopping bag">
          ${ICON.bag}<span class="icon-btn__count" data-cart-count hidden>0</span>
        </a>
        <button class="icon-btn icon-btn--menu" type="button"
                data-drawer-open aria-label="Open menu" aria-expanded="false">
          ${ICON.menu}
        </button>
      </div>

    </div>
  </header>

  <div class="scrim" data-scrim hidden></div>

  <aside class="drawer" data-drawer aria-label="Menu" aria-hidden="true">
    <div style="display:flex;align-items:center;justify-content:space-between">
      <span class="wordmark foil" style="font-size:18px">${esc(CONFIG.brand.name)}</span>
      <button class="icon-btn" type="button" data-drawer-close aria-label="Close menu">
        ${ICON.close}
      </button>
    </div>
    <nav aria-label="Mobile" style="display:grid">
      ${NAV.map((n) => `<a class="drawer__link" href="${n.href}">${n.label}</a>`).join("")}
      <a class="drawer__link" href="account.html">Account</a>
    </nav>
    <a class="btn btn--gold btn--block" href="gift-finder.html">Find a gift</a>
  </aside>`;
}

/* ---- Footer ---------------------------------------------------------------- */

function footerMarkup() {
  const col = (head, items) => `
    <div>
      <h4 class="colophon__head">${head}</h4>
      <ul class="colophon__list">
        ${items.map(([label, href]) =>
          `<li><a class="colophon__link" href="${href}">${label}</a></li>`).join("")}
      </ul>
    </div>`;

  const social = [
    [CONFIG.social.facebook,  ICON.fb, "Facebook"],
    [CONFIG.social.instagram, ICON.ig, "Instagram"],
    [CONFIG.social.whatsapp,  ICON.wa, "WhatsApp"],
  ].filter(([href]) => href)
   .map(([href, icon, name]) =>
     `<a class="social__link" href="${esc(href)}" aria-label="${name}"
         target="_blank" rel="noopener">${icon}</a>`).join("");

  return `
  <footer class="colophon">
    <div class="shell">
      <div class="colophon__grid">

        <div>
          <span class="wordmark foil" style="font-size:20px;display:block">${esc(CONFIG.brand.name)}</span>
          <span class="brand__tag" style="display:block;margin-top:5px">${esc(CONFIG.brand.tagline)}</span>
          <p class="meta" style="margin-top:var(--s-4);max-width:34ch">
            Considered gifts for the moments that deserve them, delivered across Bangladesh.
          </p>
        </div>

        ${col("Shop", [
          ["Collections", "collections.html"],
          ["Occasions", "occasions.html"],
          ["Bespoke gifts", "bespoke.html"],
          ["Gift finder", "gift-finder.html"],
        ])}

        ${col("Service", [
          ["Delivery", "delivery.html"],
          ["Returns", "returns.html"],
          ["Track an order", "account.html"],
          ["Contact", "contact.html"],
        ])}

        ${col("House", [
          ["Our story", "story.html"],
          ["Journal", "journal.html"],
          ["Privacy", "privacy.html"],
          ["Terms", "terms.html"],
        ])}

      </div>

      <div class="colophon__base">
        <span class="meta">
          &copy; ${new Date().getFullYear()} ${esc(CONFIG.brand.name)}. Made in Bangladesh.
        </span>
        <div class="social">${social}</div>
      </div>
    </div>
  </footer>`;
}

/* ---- Behaviour --------------------------------------------------------------- */

function wireDrawer() {
  const drawer  = $("[data-drawer]");
  const scrim   = $("[data-scrim]");
  const opener  = $("[data-drawer-open]");
  if (!drawer || !scrim || !opener) return;

  let lastFocus = null;

  const open = () => {
    lastFocus = document.activeElement;
    scrim.hidden = false;
    requestAnimationFrame(() => {
      drawer.classList.add("is-open");
      scrim.classList.add("is-open");
    });
    drawer.setAttribute("aria-hidden", "false");
    opener.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    $("[data-drawer-close]", drawer)?.focus();
  };

  const close = () => {
    drawer.classList.remove("is-open");
    scrim.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    opener.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    setTimeout(() => { scrim.hidden = true; }, 300);
    lastFocus?.focus();
  };

  opener.addEventListener("click", open);
  scrim.addEventListener("click", close);
  $("[data-drawer-close]")?.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) close();
  });
}

function wireSearch() {
  $("[data-search]")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = new FormData(e.target).get("q")?.toString().trim();
    location.href = q
      ? `collections.html?q=${encodeURIComponent(q)}`
      : "collections.html";
  });
}

async function refreshCart() {
  const result = await cart.view();
  setCartCount(result?.cart?.item_count ?? 0);
}

/* ---- Mount ---------------------------------------------------------------------
   Called once by every page. `current` marks the active nav item.             */

export function mountChrome(current = "") {
  const head = document.getElementById("site-header");
  const foot = document.getElementById("site-footer");

  if (head) head.innerHTML = headerMarkup(current);
  if (foot) foot.innerHTML = footerMarkup();

  wireDrawer();
  wireSearch();
  refreshCart();
}

export { refreshCart };
