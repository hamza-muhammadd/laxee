/* ==========================================================================
   LAXEE — Supabase client and API surface

   Every database call in the site goes through this file. One place decides
   how errors are shaped, how the guest cart is identified, and what the rest
   of the code is allowed to ask for.
   ========================================================================== */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CONFIG, isConfigured } from "./config.js";

/* ---- Storage that never throws -------------------------------------------
   A guest cart token wants to survive a reload. Some browsers and previews
   block localStorage entirely, so feature-detect once and fall back to memory.
   The shop works either way; only the persistence differs.                  */

const store = (() => {
  try {
    const probe = "__laxee";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    const mem = new Map();
    return {
      getItem:    (k) => mem.get(k) ?? null,
      setItem:    (k, v) => mem.set(k, String(v)),
      removeItem: (k) => mem.delete(k),
    };
  }
})();

export { store };

/* ---- Client --------------------------------------------------------------- */

export const sb = isConfigured()
  ? createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/* ---- Guest cart identity ---------------------------------------------------
   A shopper often arrives from a shared link, adds something, and only then
   decides whether to make an account. The cart is keyed on this token from
   the first tap; signing in folds it into their account.                    */

export function sessionToken() {
  let t = store.getItem("laxee_cart_token");
  if (!t) {
    t = Array.from(crypto.getRandomValues(new Uint8Array(20)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    store.setItem("laxee_cart_token", t);
  }
  return t;
}

export function clearCartToken() {
  store.removeItem("laxee_cart_token");
}

/* ---- Error messages the customer can act on --------------------------------
   Postgres and PostgREST speak to developers. This translates.              */

function readable(error) {
  const m = String(error?.message ?? "");
  if (m.includes("Could not find the function"))
    return "This part of the shop is not published yet.";
  if (m.includes("Failed to fetch") || m.includes("NetworkError"))
    return "No connection. Check your network and try again.";
  if (m.includes("JWT") || m.includes("expired"))
    return "Your session ended. Please sign in again.";
  if (m.includes("Invalid login credentials"))
    return "That email and password do not match.";
  if (m.includes("Email not confirmed"))
    return "Confirm your email address first, then sign in.";
  if (m.includes("User already registered"))
    return "An account already exists for that email. Sign in instead.";
  if (m.includes("rate limit") || m.includes("Too many"))
    return "Too many attempts. Wait a moment and try again.";
  return "Something went wrong. Please try again.";
}

/* ---- RPC ------------------------------------------------------------------
   Database functions already return { ok, error, message, field }. This adds
   the cart token where it belongs and normalises transport failures into the
   same shape, so callers only ever handle one kind of result.               */

const CART_SCOPED = new Set([
  "cart_view", "cart_add_item", "cart_set_quantity", "cart_remove_item",
  "cart_apply_coupon", "cart_clear_coupon", "checkout", "claim_guest_cart",
]);

export async function rpc(fn, args = {}) {
  if (!sb) return { ok: false, error: "not_configured",
                    message: "Add your Supabase keys to assets/js/config.js." };

  const payload = { ...args };
  if (CART_SCOPED.has(fn) && payload.p_session_token === undefined) {
    payload.p_session_token = sessionToken();
  }
  for (const k of Object.keys(payload)) {
    if (payload[k] === undefined) delete payload[k];
  }

  const { data, error } = await sb.rpc(fn, payload);

  if (error) {
    console.error(`rpc:${fn}`, error);
    return { ok: false, error: "request_failed", message: readable(error) };
  }
  if (data && typeof data === "object" && data.ok === false) return data;
  return data;
}

/* ---- Catalogue ------------------------------------------------------------- */

export const catalogue = {
  search: (opts = {}) => rpc("search_products", {
    p_query:        opts.query        ?? null,
    p_category_id:  opts.categoryId   ?? null,
    p_brand_id:     opts.brandId      ?? null,
    p_occasion_id:  opts.occasionId   ?? null,
    p_price_min:    opts.priceMin     ?? null,
    p_price_max:    opts.priceMax     ?? null,
    p_price_band:   opts.priceBand    ?? null,
    p_gift_tags:    opts.giftTags     ?? null,
    p_in_stock_only: opts.inStockOnly ?? true,
    p_sort:         opts.sort         ?? "relevance",
    p_limit:        opts.limit        ?? 24,
    p_offset:       opts.offset       ?? 0,
  }),

  facets: (query = null, occasionId = null) =>
    rpc("search_facets", { p_query: query, p_occasion_id: occasionId }),

  product: (slug) => rpc("product_detail", { p_slug: slug }),

  occasions: (days = 60) => rpc("upcoming_occasions", { p_days: days }),

  giftFinder: (c = {}) => rpc("gift_finder", {
    p_occasion_id:      c.occasionId ?? null,
    p_budget_min:       c.budgetMin  ?? null,
    p_budget_max:       c.budgetMax  ?? null,
    p_recipient_gender: c.gender     ?? null,
    p_recipient_age:    c.age        ?? null,
    p_relationship:     c.relationship ?? null,
    p_interests:        c.interests  ?? null,
    p_same_day:         c.sameDay    ?? false,
    p_limit:            c.limit      ?? 12,
  }),

  shipping: (district, subtotal = 0, weight = 500, cod = false) =>
    rpc("shipping_quote", {
      p_district: district, p_subtotal: subtotal,
      p_weight_grams: weight, p_cod: cod,
    }),
};

/* ---- Cart -------------------------------------------------------------------- */

export const cart = {
  view: () => rpc("cart_view"),

  add: (variantId, qty = 1, gift = {}) => rpc("cart_add_item", {
    p_variant_id:   variantId,
    p_quantity:     qty,
    p_is_gift:      gift.isGift ?? false,
    p_gift_wrap_id: gift.wrapId ?? null,
    p_gift_message: gift.message ?? null,
    p_gift_from_name: gift.from ?? null,
    p_occasion_id:  gift.occasionId ?? null,
    p_added_from:   gift.source ?? "catalogue",
  }),

  setQuantity: (itemId, qty) =>
    rpc("cart_set_quantity", { p_item_id: itemId, p_quantity: qty }),

  remove: (itemId) => rpc("cart_remove_item", { p_item_id: itemId }),

  applyCoupon: (code) => rpc("cart_apply_coupon", { p_code: code }),

  clearCoupon: () => rpc("cart_clear_coupon"),
};

/* ---- Account ------------------------------------------------------------------ */

export const account = {
  me: () => rpc("me"),

  async signIn(email, password) {
    if (!sb) return { ok: false, message: "Not connected." };
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, message: readable(error) };
    await rpc("claim_guest_cart");
    return { ok: true, session: data.session };
  },

  async signUp(email, password, meta = {}) {
    if (!sb) return { ok: false, message: "Not connected." };
    const { data, error } = await sb.auth.signUp({
      email, password,
      options: { data: { locale: "bn-BD", source: "laxee_web", ...meta } },
    });
    if (error) return { ok: false, message: readable(error) };
    if (!data.session) {
      return { ok: true, needsConfirmation: true,
               message: "Check your email to confirm your account." };
    }
    await rpc("claim_guest_cart");
    return { ok: true, session: data.session };
  },

  async signOut() {
    if (sb) await sb.auth.signOut();
  },

  async session() {
    if (!sb) return null;
    const { data } = await sb.auth.getSession();
    return data.session ?? null;
  },

  orders: async (limit = 10) => {
    if (!sb) return [];
    const { data } = await sb
      .from("orders")
      .select("order_number,status,payment_status,grand_total,placed_at")
      .order("placed_at", { ascending: false })
      .limit(limit);
    return data ?? [];
  },

  order: (orderNumber) => rpc("order_view", { p_order_number: orderNumber }),
};
