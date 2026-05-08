// All product image files should be stored in:
// /public/images/products/
// This uses automatic src mapping for consistency.

const getProductImage = (id) => `/images/products/${id}.png`;

const PRODUCT_IMAGE = "/images/products/products.svg";

export const products = [
  // Prescription Medicines (8)
  {
    id: "rx-amoxicillin-500",
    name: "Amoxicillin 500mg Capsules (21s)",
    price: 349,
    category: "Prescription",
    description: "Broad-spectrum antibiotic. Prescription required.",
    image: "/images/products/Amoxicillin.png"
  },
  {
    id: "rx-azithromycin-500",
    name: "Azithromycin 500mg Tablets (3s)",
    price: 399,
    category: "Prescription",
    description: "Macrolide antibiotic for bacterial infections.",
    image: "/images/products/Azithromycin.png",
  },
  {
    id: "rx-losartan-50",
    name: "Losartan 50mg Tablets (30s)",
    price: 420,
    category: "Prescription",
    description: "Blood pressure management medicine.",
    image: "/images/products/Losartan.png",
  },
  {
    id: "rx-amlodipine-5",
    name: "Amlodipine 5mg Tablets (30s)",
    price: 285,
    category: "Prescription",
    description: "Calcium-channel blocker for hypertension.",
    image:"/images/products/Amlodipine.png",
  },
  {
    id: "rx-metformin-500",
    name: "Metformin 500mg Tablets (30s)",
    price: 299,
    category: "Prescription",
    description: "First-line oral medicine for type 2 diabetes.",
    image: "/images/products/Metformin.png",
  },
  {
    id: "rx-atorvastatin-20",
    name: "Atorvastatin 20mg Tablets (30s)",
    price: 520,
    category: "Prescription",
    description: "Cholesterol-lowering statin medicine.",
    image: "/images/products/Atorvastatin.png",
  },
  {
    id: "rx-omeprazole-20",
    name: "Omeprazole 20mg Capsules (14s)",
    price: 289,
    category: "Prescription",
    description: "Acid reflux and ulcer symptom control.",
    image: "/images/products/Omeprazole.png",
  },
  {
    id: "rx-cephalexin-500",
    name: "Cephalexin 500mg Capsules (21s)",
    price: 365,
    category: "Prescription",
    description: "Cephalosporin antibiotic for infection treatment.",
    image: "/images/products/Cephalexin.png",
  },

  // OTC (8)
  {
    id: "otc-paracetamol-500",
    name: "Paracetamol 500mg Tablets (10s)",
    price: 99,
    category: "OTC",
    description: "Pain and fever relief for everyday use.",
    image: "/images/products/Paracetamol.png",
  },
  {
    id: "otc-ibuprofen-200",
    name: "Ibuprofen 200mg Tablets (10s)",
    price: 119,
    category: "OTC",
    description: "Anti-inflammatory pain and body ache relief.",
    image: "/images/products/Ibuprofen.png",
  },
  {
    id: "otc-cetirizine-10",
    name: "Cetirizine 10mg Tablets (10s)",
    price: 129,
    category: "OTC",
    description: "Allergy symptom relief for sneezing and itch.",
    image: "/images/products/Cetirizine.png",
  },
  {
    id: "otc-loratadine-10",
    name: "Loratadine 10mg Tablets (10s)",
    price: 135,
    category: "OTC",
    description: "Non-drowsy antihistamine for allergies.",
    image: "/images/products/Loratadine.png",
  },
  {
    id: "otc-cough-syrup",
    name: "Cough Syrup (120mL)",
    price: 165,
    category: "OTC",
    description: "Soothing syrup for dry and itchy throat.",
    image: "/images/products/Cough.png",
  },
  {
    id: "otc-throat-lozenges",
    name: "Menthol Throat Lozenges (20s)",
    price: 89,
    category: "OTC",
    description: "Cooling throat comfort and freshness.",
    image: "/images/products/Menthol.png",
  },
  {
    id: "otc-antacid-chew",
    name: "Chewable Antacid Tablets (12s)",
    price: 149,
    category: "OTC",
    description: "Relief for heartburn and acidic discomfort.",
    image: "/images/products/Chewy.png",
  },
  {
    id: "otc-oral-rehydration",
    name: "Oral Rehydration Salts (10 sachets)",
    price: 110,
    category: "OTC",
    description: "Electrolyte replacement for hydration support.",
    image: "/images/products/Oral.png",
  },
{
  id: "well-vitamin-c-1000",
  name: "Vitamin C 1000mg (30s)",
  price: 219,
  category: "Wellness",
  description: "Daily immune support supplement.",
  image:  "/images/products/Vitamins.png",
},
{
  id: "well-zinc-50",
  name: "Zinc 50mg Tablets (30s)",
  price: 179,
  category: "Wellness",
  description: "Mineral support for wellness routine.",
  image: "/images/products/Z-win.png",
},
{
  id: "well-multivitamins",
  name: "Daily Multivitamins (60s)",
  price: 399,
  category: "Wellness",
  description: "Broad-spectrum vitamins for daily nutrition.",
  image: "/images/products/Multivitamins.png",
},
{
  id: "well-vitamin-d3",
  name: "Vitamin D3 1000 IU (100s)",
  price: 459,
  category: "Wellness",
  description: "Bone and immunity support supplement.",
  image: "/images/products/D3.png",
},
{
  id: "well-omega-3",
  name: "Omega-3 Fish Oil (60 softgels)",
  price: 499,
  category: "Wellness",
  description: "Heart and brain health support.",
  image: "/images/products/Oil.png",
},
{
  id: "well-probiotics",
  name: "Probiotics (30 capsules)",
  price: 529,
  category: "Wellness",
  description: "Gut and digestive balance support.",
  image: "/images/products/Probiotic.png",
},
{
  id: "well-turmeric",
  name: "Turmeric Capsules (60s)",
  price: 420,
  category: "Wellness",
  description: "Herbal wellness support supplement.",
  image: "/images/products/Himalaya.png",
},
{
  id: "well-ginger-tea",
  name: "Ginger Herbal Tea (20 bags)",
  price: 189,
  category: "Wellness",
  description: "Soothing daily herbal tea blend.",
  image: "/images/products/Ginger.png",
},

{
  id: "fa-adhesive-bandages",
  name: "Adhesive Bandages Assorted (50s)",
  price: 149,
  category: "First Aid",
  description: "Everyday wound coverage and protection.",
  image: "/images/products/BandAid.png",
},
{
  id: "fa-antiseptic-solution",
  name: "Antiseptic Solution (60mL)",
  price: 139,
  category: "First Aid",
  description: "For minor wound cleaning and hygiene.",
  image: "/images/products/Antiseptic.png"
},
{
  id: "fa-antibiotic-ointment",
  name: "Antibiotic Ointment (10g)",
  price: 175,
  category: "First Aid",
  description: "Topical support for minor cuts and scrapes.",
  image: "/images/products/Antibiotic.png"
},
{
  id: "fa-gauze-pads",
  name: "Sterile Gauze Pads (20s)",
  price: 129,
  category: "First Aid",
  description: "Absorbent pads for wound dressing.",
  image: "/images/products/Sterlie.png"
},
{
  id: "fa-medical-tape",
  name: "Medical Tape (1 roll)",
  price: 89,
  category: "First Aid",
  description: "Secure dressing tape with skin-friendly adhesive.",
  image: "/images/products/MedicalTape.png"
},
{
  id: "fa-elastic-bandage",
  name: "Elastic Bandage Wrap (1 pc)",
  price: 119,
  category: "First Aid",
  description: "Support wrap for mild sprains and strain.",
  image: "/images/products/Elastic.png"
},
{
  id: "fa-burn-gel",
  name: "Burn Relief Gel (30g)",
  price: 159,
  category: "First Aid",
  description: "Cooling gel for minor burn discomfort.",
  image: "/images/products/Burn.png"
},
{
  id: "fa-wound-care-kit",
  name: "Basic Wound Care Kit",
  price: 299,
  category: "First Aid",
  description: "Compact kit for home and travel first aid.",
  image: "/images/products/Basic.png"
},

// Baby Care (8)
{
  id: "baby-diapers-s20",
  name: "Baby Diapers Size S (20 pcs)",
  price: 299,
  category: "Baby Care",
  description: "Soft absorbent diapers for daily comfort.",
  image: "/images/products/Baby.png"
},
{
  id: "baby-diapers-m20",
  name: "Baby Diapers Size M (20 pcs)",
  price: 329,
  category: "Baby Care",
  description: "Reliable daytime and overnight absorbency.",
  image: "/images/products/Baby.png"
},
{
  id: "baby-wipes-80",
  name: "Sensitive Baby Wipes (80s)",
  price: 159,
  category: "Baby Care",
  description: "Gentle, alcohol-free baby cleansing wipes.",
  image: "/images/products/Wipes.png"
},
{
  id: "baby-shampoo-200",
  name: "Baby Shampoo (200mL)",
  price: 189,
  category: "Baby Care",
  description: "Mild tear-free formula for scalp care.",
  image: "/images/products/Shampoo.png"
},
{
  id: "baby-lotion-200",
  name: "Baby Lotion (200mL)",
  price: 219,
  category: "Baby Care",
  description: "Moisturizing lotion for delicate skin.",
  image: "/images/products/Lotion.png"
},
{
  id: "baby-powder-100",
  name: "Baby Powder (100g)",
  price: 149,
  category: "Baby Care",
  description: "Helps keep baby skin dry and fresh.",
  image: "/images/products/Powder.png"
},
{
  id: "baby-rash-cream-50",
  name: "Diaper Rash Cream (50g)",
  price: 199,
  category: "Baby Care",
  description: "Protective barrier cream for diaper area.",
  image: "/images/products/Rash.png"
},
{
  id: "baby-bath-wash-250",
  name: "Baby Bath Wash (250mL)",
  price: 209,
  category: "Baby Care",
  description: "Gentle full-body wash for daily bath time.",
  image: "/images/products/Bath.png"
},

// Personal Care (8)
{
  id: "pc-hand-soap-250",
  name: "Gentle Hand Soap (250mL)",
  price: 129,
  category: "Personal Care",
  description: "Everyday hand cleansing with mild formula.",
  image: "/images/products/HandWash.png"
},
{
  id: "pc-body-wash-400",
  name: "Moisturizing Body Wash (400mL)",
  price: 249,
  category: "Personal Care",
  description: "Hydrating body cleanser for daily use.",
  image: "/images/products/BodyWash.png"
},
{
  id: "pc-face-cleanser-150",
  name: "Face Cleanser (150mL)",
  price: 279,
  category: "Personal Care",
  description: "Gentle facial cleanser for daily routine.",
  image: "/images/products/Face.png"
},
{
  id: "pc-face-moisturizer-50",
  name: "Face Moisturizer (50mL)",
  price: 349,
  category: "Personal Care",
  description: "Daily hydration for soft and smooth skin.",
  image: "/images/products/Face2.png"
},
{
  id: "pc-sunscreen-spf50",
  name: "Sunscreen SPF50 (50mL)",
  price: 399,
  category: "Personal Care",
  description: "Broad-spectrum UV protection for daily wear.",
  image: "/images/products/Sunscreen.png"
},
{
  id: "pc-toothpaste-120",
  name: "Fluoride Toothpaste (120g)",
  price: 139,
  category: "Personal Care",
  description: "Cavity protection and fresh breath support.",
  image: "/images/products/Toothpaste.png"
},
{
  id: "pc-deodorant-rollon-50",
  name: "Deodorant Roll-On (50mL)",
  price: 179,
  category: "Personal Care",
  description: "Daily odor protection and freshness.",
  image: "/images/products/Deodorant.png"
},
{
  id: "pc-hand-sanitizer-100",
  name: "Hand Sanitizer (100mL)",
  price: 99,
  category: "Personal Care",
  description: "On-the-go hygiene when washing is unavailable.",
  image: "/images/products/HandSanitizer.png"
}
];