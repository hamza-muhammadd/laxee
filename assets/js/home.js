/* ==========================================================================
   LAXEE — Home page
   ========================================================================== */

import { CONFIG, isConfigured } from "./config.js";
import { mountChrome } from "./chrome.js";
import { catalogue } from "./api.js";
import { $, esc, taka, productCard, productSkeletons, emptyState,
         revealOnScroll, toast } from "./ui.js";

/* ---- Editorial content ------------------------------------------------------
   Copy lives here rather than in the markup so it can be revised without
   touching layout. These are the three ways people actually shop for a gift:
   by the person, by the room, by the occasion.                              */

const COLLECTIONS = [
  { label: "For the Connoisseur", sub: "Barware, leather, pens", href: "collections.html?c=connoisseur", tone: 1 },
  { label: "For the Home",        sub: "Ceramics, textiles, scent", href: "collections.html?c=home",     tone: 2 },
  { label: "Timeless Elegance",   sub: "Jewellery and keepsakes",  href: "collections.html?c=timeless",  tone: 3 },
];

const PRAISE = [
  { quote: "The box arrived before I did, and my mother opened it in front of everyone. She still keeps the wrapping.",
    who: "Nusrat H.", where: "Dhanmondi" },
  { quote: "I ordered from Dubai for a wedding in Sylhet. It reached the venue on the morning, wrapped exactly as shown.",
    who: "Raihan A.", where: "Dubai" },
  { quote: "The note card was handwritten. I did not expect that at this price, and it made the whole gift.",
    who: "Farzana K.", where: "Chattogram" },
];

const JOURNAL = [
  { title: "What to bring when you are invited to Iftar",
    note: "Six gifts that are welcome without being ostentatious.", href: "journal.html#iftar" },
  { title: "The etiquette of gifting to elders in Bengali families",
    note: "On timing, presentation, and what never to give.", href: "journal.html#elders" },
];

/* ---- Placeholder art --------------------------------------------------------
   No photography yet. Rather than leave broken frames or drop in stock images
   that fight the brand, each tile gets a graded panel drawn from the palette.
   Replace the `img` in the markup when the real photographs are shot; the
   layout does not change.                                                    */

const TONES = {
  1: "linear-gradient(155deg,#2B2520 0%,#3D342A 55%,#1E1A16 100%)",
  2: "linear-gradient(155deg,#413A31 0%,#574C3E 55%,#2B2520 100%)",
  3: "linear-gradient(155deg,#241F1A 0%,#4A3D2C 60%,#1E1A16 100%)",
};

function collectionTile(c) {
  return `
    <a class="tile reveal" href="${c.href}" style="background:${TONES[c.tone]}">
      <span class="tile__label foil--on-dark">
        ${esc(c.label)}
        <span class="tile__sub">${esc(c.sub)}</span>
      </span>
    </a>`;
}

/* ---- Sections ---------------------------------------------------------------- */

async function loadOccasions() {
  const rail = $("#occasion-rail");
  if (!rail) return;

  const data = await catalogue.occasions(75);
  const list = data?.occasions ?? [];

  if (!list.length) {
    rail.innerHTML = `<p class="meta">No occasions in the next few weeks.</p>`;
    return;
  }

  rail.innerHTML = list.slice(0, 10).map((o) => `
    <a class="occasion" href="gift-finder.html?occasion=${encodeURIComponent(o.id)}">
      <span class="occasion__count">${o.days_away === 0 ? "Today" : o.days_away}</span>
      ${o.days_away === 0 ? "" : `<span class="occasion__unit">days away</span>`}
      <span class="occasion__name">${esc(o.name)}</span>
      ${o.name_bn ? `<span class="meta bn">${esc(o.name_bn)}</span>` : ""}
    </a>`).join("");
}

async function loadFeatured() {
  const holder = $("#featured");
  if (!holder) return;

  holder.replaceChildren(productSkeletons(4));

  const data = await catalogue.search({ sort: "popular", limit: 8 });
  const items = data?.results ?? [];

  if (!items.length) {
    holder.innerHTML = emptyState({
      title: "The collection opens soon",
      body: "Pieces are being photographed and catalogued. Check back shortly.",
      actionLabel: "Read our story",
      actionHref: "story.html",
    });
    return;
  }

  holder.innerHTML = `<div class="grid-products">${items.map(productCard).join("")}</div>`;
  revealOnScroll(holder);
}

function renderStatic() {
  const tiles = $("#collections");
  if (tiles) tiles.innerHTML = COLLECTIONS.map(collectionTile).join("");

  const praise = $("#praise");
  if (praise) {
    praise.innerHTML = PRAISE.map((p) => `
      <figure class="praise__card reveal">
        <blockquote class="praise__quote">${esc(p.quote)}</blockquote>
        <figcaption class="praise__who">
          <span class="praise__initial">${esc(p.who.charAt(0))}</span>
          <span>${esc(p.who)} &middot; ${esc(p.where)}</span>
        </figcaption>
      </figure>`).join("");
  }

  const journal = $("#journal");
  if (journal) {
    journal.innerHTML = JOURNAL.map((j) => `
      <a class="journal__item reveal" href="${j.href}">
        <div class="journal__frame" style="background:${TONES[2]}"></div>
        <div>
          <h3>${esc(j.title)}</h3>
          <p class="meta" style="margin-top:6px">${esc(j.note)}</p>
        </div>
      </a>`).join("");
  }
}

/* ---- Boot ---------------------------------------------------------------------- */

async function init() {
  mountChrome("index.html");
  renderStatic();

  if (!isConfigured()) {
    $("#featured").innerHTML = emptyState({
      title: "Not connected yet",
      body: "Add your Supabase URL and anon key to assets/js/config.js, then reload.",
      actionLabel: "Read the handoff notes",
      actionHref: "#",
    });
    $("#occasion-rail").innerHTML = "";
    revealOnScroll();
    return;
  }

  await Promise.all([loadOccasions(), loadFeatured()]);
  revealOnScroll();
}

document.addEventListener("DOMContentLoaded", init);
