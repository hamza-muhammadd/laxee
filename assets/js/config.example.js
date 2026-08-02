/* ==========================================================================
   LAXEE — Configuration TEMPLATE

   config.js is not committed. Copy this file:

       cp assets/js/config.example.js assets/js/config.js

   then fill in the two Supabase values and edit the brand block.
   ========================================================================== */

export const CONFIG = {

  // Supabase -> Project Settings -> API
  supabaseUrl: "",
  supabaseAnonKey: "",          // the "anon public" key, never service_role

  brand: {
    name:     "LAXEE",
    tagline:  "Crafting Elegance",
    email:    "hello@laxee.com",
    phone:    "+880 1XXX-XXXXXX",
    currency: "BDT",
    symbol:   "\u09F3",
  },

  freeDeliveryAbove: 5000,

  social: {
    facebook:  "",
    instagram: "",
    whatsapp:  "",
  },
};

export const isConfigured = () =>
  Boolean(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey);
