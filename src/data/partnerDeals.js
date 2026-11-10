/**
 * MessMates — Verified Campus Partner Restaurant Deals
 * Real popular restaurants, cafes, and eateries near ABES Engineering College
 * and Crossings Republik (Ghaziabad).
 * 
 * Offers are dine-in bill discount vouchers (e.g. 10% to 15% off total bill).
 * Example: If your restaurant bill is ₹1,200, a 10% voucher lets you pay ₹1,080 (saving ₹120 instantly)!
 */

export const DEFAULT_PARTNER_DEALS = [
  {
    id: 'deal_tandoori_night',
    title: 'Flat 10% OFF on Total Dining Bill',
    vendorName: 'The Tandoori Night',
    location: 'Panchsheel Square, Crossings Republik (Near ABES)',
    discountPercent: 10,
    exampleSavings: 'Bill of ₹1,200? Pay only ₹1,080 — save ₹120 instantly!',
    pointsRequired: 30,
    totalVouchers: 100,
    claimedCount: 28,
    expiryDate: '2026-12-31',
    description: 'Flat 10% instant discount on your total food & beverage bill for dine-in or takeaway. Perfect for dinner outings with friends.',
    terms: 'Valid on dine-in bill. Show voucher to the waiter/manager before billing.'
  },
  {
    id: 'deal_rolls_king',
    title: 'Flat 10% OFF on Entire Bill',
    vendorName: 'Rolls King',
    location: 'Crossings Republik Market (5 mins from ABES)',
    discountPercent: 10,
    exampleSavings: 'Bill of ₹500? Pay only ₹450 — save ₹50 on rolls & snacks!',
    pointsRequired: 20,
    totalVouchers: 80,
    claimedCount: 35,
    expiryDate: '2026-12-31',
    description: 'Get 10% off on all Kathi rolls, paneer rolls, chaap, and beverages. Quick, tasty campus favorite.',
    terms: 'Valid once per student bill. Show claim code at billing counter.'
  },
  {
    id: 'deal_chai_sutta_bar',
    title: 'Flat 15% OFF on Total Cafe Bill',
    vendorName: 'Chai Sutta Bar (CSB)',
    location: 'Opposite ABES Main Gate / Crossings Republik',
    discountPercent: 15,
    exampleSavings: 'Bill of ₹300? Pay only ₹255 — save ₹45 on chai & bites!',
    pointsRequired: 25,
    totalVouchers: 120,
    claimedCount: 64,
    expiryDate: '2026-12-31',
    description: 'Flat 15% discount on all kulhad chais, cold coffees, sandwiches, maggi, and fries right opposite college gate.',
    terms: 'Present code at billing. Valid throughout all opening hours.'
  },
  {
    id: 'deal_belgian_waffle',
    title: 'Flat 15% OFF on Waffles & Shakes',
    vendorName: 'The Belgian Waffle Co.',
    location: 'Crossings Republik Roundabout',
    discountPercent: 15,
    exampleSavings: 'Bill of ₹600? Pay only ₹510 — save ₹90 on waffles!',
    pointsRequired: 35,
    totalVouchers: 60,
    claimedCount: 19,
    expiryDate: '2026-12-31',
    description: 'Enjoy 15% discount on warm Belgian waff-wiches, stroopwafels, and thick shakes.',
    terms: 'Valid on all dine-in and takeaway orders.'
  },
  {
    id: 'deal_pind_balluchi',
    title: 'Flat 12% OFF on Family & Group Dining',
    vendorName: 'Pind Balluchi',
    location: 'NH-24 / Crossings Republik Bypass',
    discountPercent: 12,
    exampleSavings: 'Bill of ₹2,000? Pay only ₹1,760 — save ₹240 on group party!',
    pointsRequired: 45,
    totalVouchers: 50,
    claimedCount: 16,
    expiryDate: '2026-12-31',
    description: 'Get 12% off your total dine-in dinner bill. Great for birthday celebrations and hostel friend group treats.',
    terms: 'Valid on food bill above ₹1,000. Show voucher before bill generation.'
  },
  {
    id: 'deal_burger_king',
    title: 'Flat 10% OFF on Dine-In Orders',
    vendorName: 'Burger King',
    location: 'Gaur City Mall / Crossings Republik',
    discountPercent: 10,
    exampleSavings: 'Bill of ₹800? Pay only ₹720 — save ₹80 on Whopper combos!',
    pointsRequired: 30,
    totalVouchers: 75,
    claimedCount: 31,
    expiryDate: '2026-12-31',
    description: 'Flat 10% discount on whoppers, crispy burgers, fries, and beverage combos.',
    terms: 'Show voucher code at billing counter before payment.'
  },
  {
    id: 'deal_ccd',
    title: 'Flat 15% OFF on Cold Brews & Snacks',
    vendorName: 'Cafe Coffee Day',
    location: 'Crossings Republik Commercial Complex',
    discountPercent: 15,
    exampleSavings: 'Bill of ₹700? Pay only ₹595 — save ₹105 on coffees & meals!',
    pointsRequired: 35,
    totalVouchers: 50,
    claimedCount: 12,
    expiryDate: '2026-12-31',
    description: 'Enjoy 15% off handcrafted coffees, frappes, and cafe sandwiches. Great study spot near campus.',
    terms: 'Valid on dine-in. Show voucher code before billing.'
  },
  {
    id: 'deal_bakingo',
    title: 'Flat 10% OFF on Cakes & Desserts',
    vendorName: 'Bakingo Desserts',
    location: 'Crossings Republik Hub',
    discountPercent: 10,
    exampleSavings: 'Bill of ₹500? Pay only ₹450 — save ₹50 on birthday pastries!',
    pointsRequired: 20,
    totalVouchers: 70,
    claimedCount: 22,
    expiryDate: '2026-12-31',
    description: 'Flat 10% off on pastries, brownies, jar cakes, and celebration cakes for hostel room parties.',
    terms: 'Valid on takeout or store pickup. Present claim code.'
  }
];
