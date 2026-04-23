/**
 * ---------------------------------------------------------------------------
 *  SUGGESTED PRODUCTS TEMPLATE
 * ---------------------------------------------------------------------------
 *
 *  This file is the single source of truth for every product that can appear
 *  in the "You May Also Like" section AND how it behaves once added to cart.
 *
 *  HOW TO ADD A NEW PRODUCT
 *  1. Copy one of the existing entries below.
 *  2. Give it a unique `id` (lowercase, no spaces).
 *  3. Fill in every field -- see the field guide below.
 *  4. Save. The product will automatically enter the suggestion pool.
 *
 *  HOW TO REMOVE A PRODUCT
 *  Delete (or comment out) its entry. The pool adjusts automatically.
 *
 *  =========================================================================
 *  FIELD GUIDE
 *  =========================================================================
 *
 *  REQUIRED FIELDS (every product)
 *  ┌──────────────────┬────────────────────────────────────────────────────┐
 *  | Field            | Description                                        |
 *  |------------------|----------------------------------------------------|
 *  | id               | Unique key -- used internally (not shown to user)  |
 *  | name             | Product name shown on the card                     |
 *  | subtitle         | Italic line below the name (e.g. "Options          |
 *  |                  | Available", "Dietary Supplement")                   |
 *  | memberPrice      | BASE VIP / member price (number, no $).            |
 *  |                  | If optionsPrice is true, this is the starting       |
 *  |                  | price BEFORE any option contributions are added.    |
 *  |                  | Set to 0 for purely option-driven pricing.          |
 *  | pv               | BASE Point Value. Same additive logic as price      |
 *  |                  | when optionsPrice is true.                          |
 *  | image            | Product image URL                                  |
 *  | showProp65       | true/false -- shows the CA Prop 65 warning banner  |
 *  | optionStyle      | 'none' | 'single' | 'multiple' -- see below        |
 *  | optionsPrice     | true/false -- enables option-dependent pricing.     |
 *  |                  | When false, the product always uses memberPrice/pv  |
 *  |                  | regardless of dropdown selection. See section below.|
 *  └──────────────────┴────────────────────────────────────────────────────┘
 *
 *  -------------------------------------------------------------------------
 *  OPTION-DEPENDENT PRICING  (optionsPrice: true)
 *  -------------------------------------------------------------------------
 *
 *  When `optionsPrice` is true, the effective price and PV are calculated
 *  ADDITIVELY:
 *
 *    effectivePrice = memberPrice + SUM(each selected option's price)
 *    effectivePV    = pv          + SUM(each selected option's pv)
 *
 *  The 1.25x retail multiplier applies to the EFFECTIVE price (not base).
 *
 *  `optionPriceTotal` is a flat map from option-string → { price, pv }.
 *  Every option from every dropdown that affects the price must have an
 *  entry. Options NOT listed in the map contribute $0 / 0 PV.
 *
 *  ┌────────────────────┬──────────────────────────────────────────────────┐
 *  | Field              | Description                                      |
 *  |--------------------|--------------------------------------------------|
 *  | optionPriceTotal   | Record<string, { price: number; pv: number }>    |
 *  |                    |                                                  |
 *  |                    | Keys = exact option strings from the `dropdowns`  |
 *  |                    | arrays. Values = the member-price and PV that     |
 *  |                    | selecting that option ADDS to the base price/pv.  |
 *  └────────────────────┴──────────────────────────────────────────────────┘
 *
 *  EXAMPLES
 *
 *  Example A — Single dropdown controls price (base = 0):
 *    memberPrice: 0,
 *    pv: 0,
 *    optionsPrice: true,
 *    dropdownCount: 1,
 *    dropdowns: [
 *      { options: ['Bio Cleanse - 120 Capsules', 'Bio Cleanse - 180 Capsules'] },
 *    ],
 *    optionPriceTotal: {
 *      'Bio Cleanse - 120 Capsules': { price: 31, pv: 25 },
 *      'Bio Cleanse - 180 Capsules': { price: 42, pv: 35 },
 *    },
 *    // Selecting "120 Capsules" → effective price = 0 + 31 = $31, PV = 0 + 25 = 25
 *    // Selecting "180 Capsules" → effective price = 0 + 42 = $42, PV = 0 + 35 = 35
 *
 *  Example B — Multiple dropdowns, all contribute to price (base = 10):
 *    memberPrice: 10,
 *    pv: 5,
 *    optionsPrice: true,
 *    dropdownCount: 2,
 *    dropdowns: [
 *      { options: ['Small', 'Large'] },
 *      { options: ['Basic', 'Premium'] },
 *    ],
 *    optionPriceTotal: {
 *      'Small':   { price: 5,  pv: 3  },
 *      'Large':   { price: 15, pv: 10 },
 *      'Basic':   { price: 0,  pv: 0  },
 *      'Premium': { price: 10, pv: 5  },
 *    },
 *    // "Large" + "Premium" → 10 + 15 + 10 = $35, PV = 5 + 10 + 5 = 20
 *    // "Small" + "Basic"   → 10 + 5 + 0  = $15, PV = 5 + 3 + 0  = 8
 *
 *  Example C — Multiple dropdowns, only one affects price:
 *    memberPrice: 0,
 *    pv: 0,
 *    optionsPrice: true,
 *    dropdownCount: 2,
 *    dropdowns: [
 *      { options: ['120 Count', '180 Count'] },           // controls price
 *      { options: ['Unflavored', 'Berry', 'Citrus'] },    // flavor only, no price
 *    ],
 *    optionPriceTotal: {
 *      '120 Count': { price: 31, pv: 25 },
 *      '180 Count': { price: 42, pv: 35 },
 *      // Unflavored/Berry/Citrus not listed → contribute $0 / 0 PV
 *    },
 *
 *  -------------------------------------------------------------------------
 *
 *  OPTION STYLE = 'none'
 *  No additional fields needed. The product shows no options UI in the cart.
 *
 *  OPTION STYLE = 'single'  (Flavor swatch picker)
 *  ┌──────────────────┬────────────────────────────────────────────────────┐
 *  | Field            | Description                                        |
 *  |------------------|----------------------------------------------------|
 *  | defaultFlavor    | Name of the initially-selected flavor (must match  |
 *  |                  | a `name` in one of the flavorGroups entries below)  |
 *  | flavorGroups     | Array of flavor groups. Each group has:             |
 *  |                  |   label:   Group heading (e.g. "Classic")           |
 *  |                  |   flavors: Array of { name, color }                |
 *  |                  |     name:  Display name (e.g. "Sweet Tea")          |
 *  |                  |     color: Hex color for the swatch circle          |
 *  └──────────────────┴────────────────────────────────────────────────────┘
 *
 *  Example:
 *    optionStyle: 'single',
 *    optionsPrice: false,
 *    defaultFlavor: 'Sweet Tea',
 *    flavorGroups: [
 *      {
 *        label: 'Classic',
 *        flavors: [
 *          { name: 'Sweet Tea',  color: '#e8a0b0' },
 *          { name: 'Lemonade',   color: '#f5e89a' },
 *          { name: 'Watermelon', color: '#C3383F' },
 *        ],
 *      },
 *      {
 *        label: 'Limited Edition',
 *        flavors: [
 *          { name: 'Acai Berry', color: '#c060b0' },
 *        ],
 *      },
 *    ],
 *
 *  OPTION STYLE = 'multiple'  (Dropdown selections)
 *  ┌──────────────────┬────────────────────────────────────────────────────┐
 *  | Field            | Description                                        |
 *  |------------------|----------------------------------------------------|
 *  | dropdownCount    | Explicit number of dropdown menus to display.      |
 *  |                  | Must match the length of the `dropdowns` array.    |
 *  | dropdowns        | Array of dropdown configs. Each entry has:          |
 *  |                  |   options: string[] -- the selectable options       |
 *  |                  |                                                    |
 *  |                  | Each dropdown is rendered on its own row.           |
 *  |                  | The first option in each dropdown is the default.   |
 *  |                  |                                                    |
 *  |                  | TO ADD AN OPTION: add a string to the `options`    |
 *  |                  | array of the specific dropdown.                     |
 *  |                  |                                                    |
 *  |                  | TO REMOVE AN OPTION: delete the string from the    |
 *  |                  | `options` array. Each dropdown is independent.      |
 *  |                  |                                                    |
 *  |                  | TO ADD A DROPDOWN: increase `dropdownCount` by 1   |
 *  |                  | and add a new { options: [...] } entry to the      |
 *  |                  | `dropdowns` array.                                 |
 *  |                  |                                                    |
 *  |                  | TO REMOVE A DROPDOWN: decrease `dropdownCount` by  |
 *  |                  | 1 and remove the entry from the `dropdowns` array. |
 *  └──────────────────┴────────────────────────────────────────────────────┘
 *
 *  CARD DISPLAY LOGIC (no action needed -- just for reference)
 *  - Retail price is automatically derived as effectivePrice x 1.25
 *  - When optionsPrice is true, price updates live as the user changes
 *    dropdown selections in the cart.
 *  - Member view:     effectivePrice  |  PV  |  retailPrice struck-through
 *  - Non-member view: retailPrice     |  "effectivePrice VIP Customers"
 *
 *  The cart always shows up to 3 suggestion cards. When a product is added
 *  to the cart its card disappears and the next product in this list fills
 *  the slot. When every product has been added, a congratulations message
 *  is displayed instead.
 * ---------------------------------------------------------------------------
 */

/* ── Type definitions ────────────────────────────────────────────────────── */

export interface FlavorEntry {
  name: string;
  color: string;
}

export interface FlavorGroup {
  label: string;
  flavors: FlavorEntry[];
}

export interface DropdownConfig {
  options: string[];
}

export interface OptionPriceEntry {
  price: number;
  pv: number;
}

export interface SuggestedProductEntry {
  id: string;
  name: string;
  subtitle: string;
  memberPrice: number;
  pv: number;
  image: string;
  showProp65: boolean;
  optionStyle: 'none' | 'single' | 'multiple';
  optionsPrice: boolean;
  // 'single' fields
  defaultFlavor?: string;
  flavorGroups?: FlavorGroup[];
  // 'multiple' fields
  dropdownCount?: number;
  dropdowns?: DropdownConfig[];
  // option-dependent pricing
  optionPriceTotal?: Record<string, OptionPriceEntry>;
}

/* ── Utility: resolve effective price/PV for a cart item ─────────────────── */

/**
 * Given a cart item's base price/pv, its optionConfig, and its current
 * selections array, compute the effective member price and PV.
 *
 * Returns { price, pv } — the fully-resolved member-level values.
 * Apply priceMultiplier (1 or 1.25) AFTER calling this function.
 */
export function resolveItemPricePV(
  basePrice: number,
  basePV: number,
  optionsPrice: boolean | undefined,
  optionPriceTotal: Record<string, OptionPriceEntry> | undefined,
  selections: string[] | undefined,
): { price: number; pv: number } {
  if (!optionsPrice || !optionPriceTotal || !selections) {
    return { price: basePrice, pv: basePV };
  }
  let totalPrice = basePrice;
  let totalPV = basePV;
  for (const sel of selections) {
    const entry = optionPriceTotal[sel];
    if (entry) {
      totalPrice += entry.price;
      totalPV += entry.pv;
    }
  }
  return { price: totalPrice, pv: totalPV };
}

/* ── Product entries ─────────────────────────────────────────────────────── */

const SUGGESTED_PRODUCTS_TEMPLATE: SuggestedProductEntry[] = [
  // ── Product 1 ──────────────────────────────────────────────────
  {
    id: 'probio5',
    name: 'Plexus ProBio 5',
    subtitle: 'Dietary Supplement',
    memberPrice: 38,
    pv: 31,
    image: 'https://images.ctfassets.net/bzyfwm1ddxnx/287mdhdE8VYDUlu3VRnRtE/02f544eb22451cfb0b5abe9c6673e277/us-silo-probio5.png',
    showProp65: false,
    optionStyle: 'none',
    optionsPrice: false,
  },

  // ── Product 2 ──────────────────────────────────────────────────
  {
    id: 'bioCleanse',
    name: 'Plexus Bio Cleanse',
    subtitle: 'Options Available',
    memberPrice: 31,
    pv: 25,
    image: 'https://images.ctfassets.net/bzyfwm1ddxnx/7t74v6NKtwGdVzEpBsZnwi/44dd629624707b60d8d2cf538e21a705/us-silo-biocleanse-120.png',
    showProp65: false,
    optionStyle: 'multiple',
    optionsPrice: false,
    dropdownCount: 1,
    dropdowns: [
      { options: ['Bio Cleanse - 120 Capsules', 'Bio Cleanse - 180 Capsules'] },
    ],
  },

  // ── Product 3 ──────────────────────────────────────────────────
  {
    id: 'xfactor',
    name: 'Plexus XFactor Plus',
    subtitle: 'Dietary Supplement',
    memberPrice: 38,
    pv: 31,
    image: 'https://images.ctfassets.net/bzyfwm1ddxnx/4NDVOcBh7X3jKj1jOm0Duh/0fea12ae073ec723b74b667ca8616b91/us-silo-xfactorplus.png',
    showProp65: false,
    optionStyle: 'none',
    optionsPrice: false,
  },

  // ── Product 4 ──────────────────────────────────────────────────
  {
    id: 'xfactor ++',
    name: 'Plexus XFactor Plus+',
    subtitle: 'Dietary Supplement',
    memberPrice: 68,
    pv: 45,
    image: 'https://images.ctfassets.net/bzyfwm1ddxnx/4NDVOcBh7X3jKj1jOm0Duh/0fea12ae073ec723b74b667ca8616b91/us-silo-xfactorplus.png',
    showProp65: false,
    optionStyle: 'none',
    optionsPrice: false,
  },

  // ── Slim & Trim Combo (Special Offer) ─────────────────────────
  {
    id: 'slimTrim',
    name: 'Slim & Trim Combo',
    subtitle: '30 Packets',
    memberPrice: 79,
    pv: 72,
    image: 'https://images.ctfassets.net/bzyfwm1ddxnx/1AMbPy8TVaygEzEvjioIdW/5cb1ee489849de6f2ee42be5585909b1/us-silo-slim-hc-boll-bag.png',
    showProp65: false,
    optionStyle: 'none',
    optionsPrice: false,
  },

  // ── Add more products below ────────────────────────────────────
  // Copy an entry above, change the id, and fill in all fields.
  // The product will automatically appear in the suggestion pool.
];

export default SUGGESTED_PRODUCTS_TEMPLATE;
