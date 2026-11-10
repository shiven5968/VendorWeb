/**
 * MessMates — Verified Campus Partner Deals Catalog
 * Default verified inventory for campus cafes, dining spots, fitness centers, and stationery.
 */

export const DEFAULT_PARTNER_DEALS = [
  {
    id: 'deal_cafe_blend',
    title: '15% Off Any Cold Coffee or Shake',
    vendorName: 'Campus Blend Cafe',
    category: 'Cafes',
    pointsRequired: 40,
    totalVouchers: 50,
    claimedCount: 14,
    expiryDate: '2026-12-31',
    description: 'Enjoy 15% discount on all artisan cold brews, thick shakes, and iced teas at the Central Campus Cafe booth.',
    terms: 'Valid once per student bill. Show voucher code before billing.'
  },
  {
    id: 'deal_healthy_bites',
    title: 'Free Boiled Egg / Fruit Add-on',
    vendorName: 'Healthy Campus Canteen',
    category: 'Food & Beverages',
    pointsRequired: 25,
    totalVouchers: 100,
    claimedCount: 42,
    expiryDate: '2026-12-31',
    description: 'Get 2 free boiled eggs or 1 fresh seasonal banana with any meal ordered at the hostel evening snack counter.',
    terms: 'Valid during evening snack hours (5:00 PM - 7:00 PM).'
  },
  {
    id: 'deal_fit_gym',
    title: '₹200 Off Semester Gym Membership',
    vendorName: 'Campus Iron Fitness Center',
    category: 'Fitness & Wellness',
    pointsRequired: 80,
    totalVouchers: 30,
    claimedCount: 11,
    expiryDate: '2026-12-31',
    description: 'Flat ₹200 discount on your 3-month or 6-month campus fitness pass. Includes trainer access.',
    terms: 'Applicable on new registrations or renewals at the main reception.'
  },
  {
    id: 'deal_print_hub',
    title: '10 Free Printout Pages',
    vendorName: 'Stationery & Xerox Hub',
    category: 'Student Essentials',
    pointsRequired: 20,
    totalVouchers: 75,
    claimedCount: 39,
    expiryDate: '2026-12-31',
    description: '10 black & white printout pages for your assignment or lab reports at Gate 2 Stationery.',
    terms: 'Single print session up to 10 A4 pages.'
  },
  {
    id: 'deal_protein_scoop',
    title: '20% Off Nutrabay / MuscleBlaze Whey',
    vendorName: 'Campus Nutrition Store',
    category: 'Fitness & Wellness',
    pointsRequired: 60,
    totalVouchers: 40,
    claimedCount: 18,
    expiryDate: '2026-12-31',
    description: 'Get an exclusive 20% discount on authentic sealed 1kg Whey Protein jars.',
    terms: 'Genuine batch verified. Show claim code at the counter.'
  },
  {
    id: 'deal_amul_parlor',
    title: 'Free Extra Amul Curd Cup',
    vendorName: 'Amul Campus Parlor',
    category: 'Special Campus Offers',
    pointsRequired: 15,
    totalVouchers: 100,
    claimedCount: 56,
    expiryDate: '2026-12-31',
    description: 'Complimentary 200g Amul Masti Curd cup with any lunch or dinner combo purchase.',
    terms: 'Valid at the Block D Amul Booth daily.'
  }
];
