# LAXEE

**Crafting Elegance** — curated premium gifts, Bangladesh.

Static storefront on top of a Supabase backend. No build step, no framework,
no dependencies to install. The files you edit are the files that ship.

---

## Run it locally

ES modules will not load over `file://`, so a plain double-click on
`index.html` shows a blank page. Serve the folder instead:

```bash
python3 -m http.server 5173
# then open http://localhost:5173
```

Any static server works — `npx serve`, VS Code Live Server, whatever you have.

## Connect it

```bash
cp assets/js/config.example.js assets/js/config.js
```

Then fill in `supabaseUrl` and `supabaseAnonKey` from
**Supabase → Project Settings → API**.

The anon key is public by design; Row Level Security protects the data.
Never put the `service_role` key in this repository.

## Check before you ship

```bash
python3 check.py
```

Verifies module imports resolve, every `#id` the JavaScript reaches for exists
in the markup, every CSS custom property is declared, tags are balanced.

## Deploy

Upload the contents of this folder to `public_html`. Include `.htaccess` —
File Manager hides it unless you turn on "show hidden files".

Then set **Supabase → Authentication → URL Configuration → Site URL** to your
domain, or sign-in will fail after deployment.

---

## Structure

```
index.html              home
.htaccess               Apache: pretty URLs, HTTPS, caching, headers
check.py                integrity checker
assets/
  css/
    tokens.css          every colour, size, duration — start here
    base.css            reset, typography, the gold foil effect
    layout.css          shell, header, footer, section rhythm
    components.css      buttons, cards, forms, toast
  js/
    config.js           your keys and brand (not committed)
    api.js              Supabase client, every database call
    ui.js               formatting, toasts, reveals, product card
    chrome.js           shared header and footer
    home.js             home page
  img/
```

### Where to change what

| To change | Edit |
|---|---|
| Colours, spacing, type scale | `assets/css/tokens.css` |
| Navigation, footer links | `assets/js/chrome.js` |
| Home page copy | `assets/js/home.js` |
| Brand name, contact, social | `assets/js/config.js` |

`tokens.css` is the lever with the longest arm. Change `--gold` once and the
wordmark, buttons, ribbon and every accent follow.

---

## Backend

The database is a separate project: 113 tables, 256 RLS policies, covering
catalogue, cart, checkout, inventory, orders, loyalty and referrals. This
repository holds only the storefront.

---

## Status

| Handoff | Scope | State |
|---|---|---|
| 01 | Design system, chrome, home | done |
| 02 | Collections, product detail | next |
| 03 | Gift finder, cart | |
| 04 | Checkout, order confirmation | |
| 05 | Account, sign in | |
| 06 | Story, journal, contact | |
