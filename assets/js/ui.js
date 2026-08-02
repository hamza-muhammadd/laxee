/* ==========================================================================
   LAXEE — UI helpers
   Formatting, toasts, scroll reveals, and the small pieces of markup that
   more than one page needs.
   ========================================================================== */

import { CONFIG } from "./config.js";

/* ---- Selection ------------------------------------------------------------ */

export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html != null) node.innerHTML = html;
  return node;
}

/* ---- Escaping -------------------------------------------------------------
   Product names and gift messages come from the database and from customers.
   Everything interpolated into HTML goes through this.                      */

export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

/* ---- Money ----------------------------------------------------------------
   BDT settles in whole taka across bKash, Nagad and the card gateways, so
   nothing is ever shown with paisa.                                         */

export function taka(amount) {
  const n = Number(amount ?? 0);
  return CONFIG.brand.symbol + n.toLocaleString("en-BD", { maximumFractionDigits: 0 });
}

export function plural(n, one, many) {
  return `${n} ${n === 1 ? one : many}`;
}

/* ---- Dates ----------------------------------------------------------------- */

export function shortDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-GB",
    { day: "numeric", month: "short", year: "numeric" });
}

/* ---- Toast ------------------------------------------------------------------ */

let toastNode, toastTimer;

export function toast(message, kind = "info") {
  if (!toastNode) {
    toastNode = el("div", "toast");
    toastNode.setAttribute("role", "status");
    toastNode.setAttribute("aria-live", "polite");
    document.body.appendChild(toastNode);
  }
  toastNode.textContent = message;
  toastNode.className = `toast is-shown${kind === "error" ? " toast--error" : ""}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastNode.className = `toast${kind === "error" ? " toast--error" : ""}`;
  }, 3600);
}

/* ---- Scroll reveal -----------------------------------------------------------
   Content is in the DOM and visible without JavaScript. This only adds the
   entrance, and only when the visitor has not asked for reduced motion.    */

export function revealOnScroll(root = document) {
  const targets = $$(".reveal", root);
  if (!targets.length) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !("IntersectionObserver" in window)) {
    targets.forEach((t) => t.classList.add("is-in"));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      // A short stagger reads as one considered movement rather than several.
      setTimeout(() => entry.target.classList.add("is-in"), i * 70);
      io.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  targets.forEach((t) => io.observe(t));
}

/* ---- Skeletons ---------------------------------------------------------------- */

export function productSkeletons(count = 8) {
  const grid = el("div", "grid-products");
  for (let i = 0; i < count; i++) {
    grid.appendChild(el("div", "product", `
      <div class="product__frame skeleton"></div>
      <div class="skeleton" style="height:14px;width:84%"></div>
      <div class="skeleton" style="height:14px;width:46%;margin-top:8px"></div>
    `));
  }
  return grid;
}

/* ---- Empty state --------------------------------------------------------------
   An empty screen is an invitation to act, so it always offers the next step. */

export function emptyState({ title, body, actionLabel, actionHref }) {
  return `
    <div class="empty">
      <span class="ribbon" style="max-width:120px">
        <i class="ribbon__knot"></i>
      </span>
      <h3>${esc(title)}</h3>
      <p class="muted">${esc(body)}</p>
      ${actionHref ? `<a class="btn btn--primary" href="${esc(actionHref)}">${esc(actionLabel)}</a>` : ""}
    </div>`;
}

/* ---- Product card ------------------------------------------------------------- */

export function productCard(p) {
  const sale     = p.compare_at_price && p.compare_at_price > p.price;
  const soldOut  = p.in_stock === false || p.available === 0;
  const href     = `product.html?item=${encodeURIComponent(p.slug)}`;

  const media = p.image
    ? `<img class="product__img" src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">`
    : `<div class="product__empty">
         <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
           <path d="M20 12v9H4v-9M2 7h20v5H2zM12 21V7"/>
         </svg>
       </div>`;

  let flag = "";
  if (soldOut)          flag = `<span class="product__flag product__flag--sold">Sold out</span>`;
  else if (sale)        flag = `<span class="product__flag">Reduced</span>`;
  else if (p.same_day)  flag = `<span class="product__flag product__flag--gold">Same day</span>`;

  return `
    <a class="product" href="${href}">
      <div class="product__frame">${media}${flag}</div>
      <span class="product__name">${esc(p.name)}</span>
      ${p.why ? `<span class="product__why">${esc(p.why)}</span>` : ""}
      <span class="product__foot">
        <span class="price">${taka(p.price)}</span>
        ${sale ? `<span class="price price--was">${taka(p.compare_at_price)}</span>` : ""}
      </span>
    </a>`;
}

/* ---- Cart badge ---------------------------------------------------------------- */

export function setCartCount(n) {
  $$("[data-cart-count]").forEach((node) => {
    node.textContent = n;
    node.hidden = !n;
  });
}

/* ---- Query string --------------------------------------------------------------- */

export const params = () => new URLSearchParams(location.search);

export function param(name, fallback = null) {
  return params().get(name) ?? fallback;
}
