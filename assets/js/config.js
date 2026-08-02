/* ==========================================================================
   LAXEE — Configuration
   ==========================================================================

   THIS IS THE ONLY FILE YOU EDIT TO CONNECT THE SITE.

   Both values come from:
     Supabase dashboard -> Project Settings -> API

   The anon key is designed to be public. It is safe in a browser, safe in
   your git repository, and safe on a shared host. Row Level Security is what
   protects your data, not the secrecy of this key.

   NEVER put the service_role key here. That one bypasses every security rule.
   ========================================================================== */

export const CONFIG = {

  // e.g. "https://abcdefghijklm.supabase.co"   — no trailing slash
  supabaseUrl: "",

  // The key labelled "anon public" (newer projects call it "publishable")
  supabaseAnonKey: "",

  // ---- Brand ------------------------------------------------------------
  brand: {
    name:     "LAXEE",
    tagline:  "Crafting Elegance",
    email:    "hello@laxee.com",
    phone:    "+880 1XXX-XXXXXX",
    currency: "BDT",
    symbol:   "\u09F3",          // ৳
  },

  // ---- Delivery ---------------------------------------------------------
  // Shown before a district is chosen, so the customer is never surprised.
  freeDeliveryAbove: 5000,

  // ---- Social -----------------------------------------------------------
  social: {
    facebook:  "",
    instagram: "",
    whatsapp:  "",
  },
};

/** True once both values above are filled in. */
export const isConfigured = () =>
  Boolean(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey);
