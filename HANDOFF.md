# LAXEE — Handoff 01: Foundation and Home

**Delivered:** design system, site chrome, home page
**Files:** 1 page, 4 stylesheets, 5 modules
**Status:** ready to host. Connect it, upload it, it works.

---

## 1. What is in this delivery

```
laxee/
├── index.html                 the home page
├── .htaccess                  Hostinger config: pretty URLs, HTTPS, caching
├── check.py                   integrity checker — run before every upload
└── assets/
    ├── css/
    │   ├── tokens.css         every colour, size and duration
    │   ├── base.css           reset, typography, the foil effect
    │   ├── layout.css         shell, header, footer, sections
    │   └── components.css     buttons, cards, forms, toast
    ├── js/
    │   ├── config.js          ← THE ONLY FILE YOU EDIT
    │   ├── api.js             Supabase client and every database call
    │   ├── ui.js              formatting, toasts, reveals, product card
    │   ├── chrome.js          shared header and footer
    │   └── home.js            home page logic
    └── img/
        └── favicon.svg
```

Nothing is bundled or minified. Open any file, read it, change it. There is no
build step to run and nothing to install.

---

## 2. Design decisions, and why

### The palette comes from your card

| Token | Value | Where it came from |
|---|---|---|
| `--gold` | `#A8874A` | the foil on the card — brass, not amber |
| `--ink` | `#1E1A16` | the near-black of a letterpress bite |
| `--linen` | `#F1ECE3` | uncoated cream stock |
| `--porcelain` | `#FFFFFF` | the page itself |

The gold is deliberately deeper than the orange-gold most sites reach for. On a
screen a bright gold reads as yellow plastic; a brass tone reads as metal.

### One typeface, two extremes

**Jost** does all the display work, but at opposite settings:

- The wordmark is **weight 200 with 0.42em tracking** — airy, spaced, calm
- The headlines are **weight 600, tight tracking, uppercase** — dense and firm

That contrast is the typographic idea. **Karla** carries body copy because it has
warmth in its letterforms that a neutral grotesque does not. **Hind Siliguri**
handles Bangla, so Bengali text never falls back to a Latin face and breaks.

### Signature: the foil

Your brand exists first as gold stamped into paper. Flat gold text on screen
loses that entirely. The `.foil` class clips a five-stop gradient to the glyphs,
so each stroke catches light on one edge and falls into shadow on the other —
the way a real stamp does when you tilt the card.

It is used on **the wordmark and the collection labels only**. One bold move,
repeated in two places, and everything else stays quiet. That restraint is what
separates a luxury interface from a decorated one.

### Second device: the ribbon

A gift is defined by what ties it. Section breaks use a hairline rule with a
small diamond knot at centre — a ribbon seen edge-on. It replaces the plain
border most sites use, and it is the only ornament on the page.

### Squared corners

Border radius is effectively zero throughout. Luxury print has square corners,
sharp trims, precise margins. Rounded corners read as software; square corners
read as stationery.

---

## 3. Connect it — two values, one file

Open `assets/js/config.js`:

```js
export const CONFIG = {
  supabaseUrl: "https://xxxxx.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIs...",
  ...
};
```

Both come from **Supabase → Project Settings → API**.

The anon key belongs in a browser. It is public by design; Row Level Security is
what protects your data, and you have 256 policies enforcing it. The
`service_role` key must never appear in any file here.

While you are in that file, also set `brand.email`, `brand.phone` and the three
`social` links. Empty social links are simply not rendered, so the footer stays
clean until you have accounts.

---

## 4. Upload to Hostinger

1. hPanel → **File Manager**
2. Open `public_html`
3. Upload **everything**, keeping the folder structure:
   - `index.html`
   - `.htaccess`  *(File Manager hides dotfiles — enable "show hidden files")*
   - the whole `assets/` folder
4. Visit your domain

`check.py` is a development tool. It does no harm on the server, but there is no
reason to upload it.

### Then tell Supabase where the site lives

**Authentication → URL Configuration**

- **Site URL:** `https://yourdomain.com`
- **Redirect URLs:** `https://yourdomain.com/**`

**Sign-in will not work until this is set.** It is the single most common cause
of a login that silently fails after deployment.

---

## 5. Photography — the one thing that matters most

The layout is built and waiting. Every image slot currently holds a graded panel
drawn from the palette, so nothing looks broken while you shoot.

| Slot | File to add | Aspect | Notes |
|---|---|---|---|
| Hero | `assets/img/hero-signature-box.jpg` | 4:3 or wider | An open box, ribbon visible, one light source |
| Collection tiles | via database | 3:4 portrait | Dark, moody — the foil label sits on top |
| Products | Supabase Storage | 1:1 square | Same background and light for every piece |

**This is where a premium gift shop is won or lost in Bangladesh.** Most
competitors use whatever the supplier sent them: mixed backgrounds, mixed
lighting, phone flash. Shooting every piece on the same surface, in the same
light, at the same angle costs you a weekend and separates you permanently.

To replace the hero, delete the inline `style` on `.hero__figure` and uncomment
the `<img>` beneath it. Nothing else changes.

---

## 6. Before every upload

```bash
python3 check.py
```

It verifies that every module import resolves, every `#id` the JavaScript looks
for exists in the markup, every CSS custom property is declared before use,
every HTML tag is balanced, and no emoji crept in. It caught two real errors
while this page was being built.

---

## 7. Still to come

| Handoff | Pages | Depends on |
|---|---|---|
| **02** | Collections, product detail | this |
| **03** | Gift finder, cart | 02 |
| **04** | Checkout, order confirmation | 03 |
| **05** | Account, sign in, order history | 04 |
| **06** | Story, journal, delivery, contact | — |

Each arrives as its own set of files. Nothing in this handoff needs to change
when they land — the chrome, tokens and helpers are already shared.

---

## 8. Known limits

1. **The collection tiles link to filters that do not exist yet.** They point at
   `collections.html?c=connoisseur`; that page arrives in handoff 02.
2. **Wishlist is in the header but has no page.** The database supports it; the
   screen is scheduled with the account pages.
3. **Testimonials are written, not real.** Replace them in `home.js` with actual
   customer words as soon as you have them. Invented praise on a live shop is
   both a legal risk and, more practically, obvious to readers.
4. **No service worker yet.** The site is fast but not installable or offline.
   Worth adding once the pages settle.
