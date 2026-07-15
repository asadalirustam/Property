import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// High-fidelity fallback mock properties for local demos
export const mockPropertiesFallback = [
  {
    _id: "mock_lh_1",
    title: "Modern 5 Marla Executive Villa in DHA",
    description: "Exquisite 5 Marla custom-built villa located in Sector C, DHA Phase 6, Lahore. Features Italian tile floors, double-height drawing and dining halls, modular kitchen with luxury fixtures, and a spacious terrace overlooking the park.",
    purpose: "sale",
    propertyType: "Villa",
    price: 18500000,
    city: "Lahore",
    area: "DHA Phase 6",
    address: "Sector C, House 145, DHA Phase 6",
    location: { type: "Point", coordinates: [74.4412, 31.4722] },
    bedrooms: 3, bathrooms: 4, kitchens: 2, garage: 1, areaSize: "5 Marla", yearBuilt: 2025,
    amenities: { parking: true, swimmingPool: false, garden: true, gym: false, electricityBackup: true, waterSupply: true, gas: true, internet: true, security: true },
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"],
    isFeatured: true, isVerified: true, approvalStatus: 'approved', views: 120,
    owner: { _id: "agent_demo_id", name: "Ali Real Estate Agency", email: "agent@property.com", phone: "+923007654321", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80" }
  },
  {
    _id: "mock_lh_4",
    title: "3 Bedroom House in Gulberg III",
    description: "Beautiful family house located in the prime area of Gulberg III, Lahore. Modern construction with high-end finishes, a private garden, and 24/7 security. Close to restaurants, schools and hospitals.",
    purpose: "sale",
    propertyType: "House",
    price: 22000000,
    city: "Lahore",
    area: "Gulberg",
    address: "Block E, Gulberg III, Lahore",
    location: { type: "Point", coordinates: [74.3506, 31.5218] },
    bedrooms: 3, bathrooms: 3, kitchens: 1, garage: 1, areaSize: "7 Marla", yearBuilt: 2022,
    amenities: { parking: true, swimmingPool: false, garden: true, gym: false, electricityBackup: true, waterSupply: true, gas: true, internet: true, security: true },
    images: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80"],
    isFeatured: true, isVerified: true, approvalStatus: 'approved', views: 87,
    owner: { _id: "agent_demo_id", name: "Ali Real Estate Agency", email: "agent@property.com", phone: "+923007654321", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80" }
  },
  {
    _id: "mock_lh_5",
    title: "Luxury Flat in Bahria Town Lahore",
    description: "Tastefully furnished 2-bedroom luxury flat in Bahria Town, Lahore. Features high-speed internet, generator backup, swimming pool access, gym, and 24/7 security. Ready to move.",
    purpose: "rent",
    propertyType: "Flat",
    price: 80000,
    city: "Lahore",
    area: "Bahria Town",
    address: "Bahria Town Phase 4, Lahore",
    location: { type: "Point", coordinates: [74.1908, 31.3657] },
    bedrooms: 2, bathrooms: 2, kitchens: 1, garage: 1, areaSize: "1100 Sq. Ft.", yearBuilt: 2023,
    amenities: { parking: true, swimmingPool: true, garden: false, gym: true, electricityBackup: true, waterSupply: true, gas: true, internet: true, security: true },
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"],
    isFeatured: false, isVerified: true, approvalStatus: 'approved', views: 54,
    owner: { _id: "agent_demo_id", name: "Ali Real Estate Agency", email: "agent@property.com", phone: "+923007654321", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80" }
  },
  {
    _id: "mock_isb_2",
    title: "Luxury 3 Bed Apartment in Centaurus",
    description: "Breathtaking 3-bedroom luxury apartment on the 8th floor of Tower B, Centaurus Mall, Sector F-8, Islamabad. Includes panoramic floor-to-ceiling views of the Margalla Hills, underground parking slots, central air conditioning, and premium membership to the residencies health club.",
    purpose: "rent",
    propertyType: "Apartment",
    price: 150000,
    city: "Islamabad",
    area: "Sector F-8",
    address: "Tower B, Apartment 802, Centaurus Mall, Sector F-8",
    location: { type: "Point", coordinates: [73.0505, 33.7077] },
    bedrooms: 3, bathrooms: 3, kitchens: 1, garage: 2, areaSize: "1800 Sq. Ft.", yearBuilt: 2024,
    amenities: { parking: true, swimmingPool: true, garden: false, gym: true, electricityBackup: true, waterSupply: true, gas: true, internet: true, security: true },
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"],
    isFeatured: true, isVerified: true, approvalStatus: 'approved', views: 245,
    owner: { _id: "agent_demo_id", name: "Ali Real Estate Agency", email: "agent@property.com", phone: "+923007654321", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80" }
  },
  {
    _id: "mock_isb_6",
    title: "4 Marla Commercial Office in Blue Area",
    description: "Prime commercial office space in the heart of Blue Area, Islamabad. Ground floor unit, fully air-conditioned with separate server room, reception area, 3 cabins and 1 meeting room. Ideal for IT, law or consultancy firms.",
    purpose: "rent",
    propertyType: "Office",
    price: 120000,
    city: "Islamabad",
    area: "Blue Area",
    address: "Jinnah Avenue, Blue Area, Islamabad",
    location: { type: "Point", coordinates: [73.0851, 33.7215] },
    bedrooms: 0, bathrooms: 2, kitchens: 1, garage: 2, areaSize: "4 Marla", yearBuilt: 2020,
    amenities: { parking: true, swimmingPool: false, garden: false, gym: false, electricityBackup: true, waterSupply: true, gas: false, internet: true, security: true },
    images: ["https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80"],
    isFeatured: false, isVerified: true, approvalStatus: 'approved', views: 38,
    owner: { _id: "agent_demo_id", name: "Ali Real Estate Agency", email: "agent@property.com", phone: "+923007654321", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80" }
  },
  {
    _id: "mock_khi_3",
    title: "Beach Avenue Seaside Clifton Apartment",
    description: "Spectacular ocean-facing 2 bedroom apartment on Beach Avenue, Clifton Block 2, Karachi. Modern modular kitchen, marble flooring, private balcony overlooking the Arabian Sea, continuous water supply, and top-tier gated community security details.",
    purpose: "sale",
    propertyType: "Apartment",
    price: 26000000,
    city: "Karachi",
    _id: "mock_khi_7",
    title: "5 Bedroom Bungalow in DHA Karachi",
    description: "Elegant and spacious 5 bedroom bungalow in the prestigious DHA Phase VI, Karachi. Features a beautiful lawn, swimming pool, servant quarters, and a modular chef's kitchen.",
    purpose: "sale",
    propertyType: "House",
    price: 75000000,
    city: "Karachi",
    area: "DHA Phase 6",
    address: "Phase VI, Khayaban-e-Ittehad, DHA, Karachi",
    location: { type: "Point", coordinates: [67.0751, 24.8198] },
    bedrooms: 5, bathrooms: 5, kitchens: 2, garage: 2, areaSize: "500 Sq. Yd.", yearBuilt: 2021,
    amenities: { parking: true, swimmingPool: true, garden: true, gym: false, electricityBackup: true, waterSupply: true, gas: true, internet: true, security: true },
    images: ["https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80"],
    isFeatured: true, isVerified: true, approvalStatus: 'approved', views: 178,
    owner: { _id: "agent_demo_id", name: "Ali Real Estate Agency", email: "agent@property.com", phone: "+923007654321", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80" }
  },
  {
    _id: "mock_rwp_8",
    title: "3 Marla House in Rawalpindi Saddar",
    description: "Affordable and centrally located 3 Marla single-story house in Saddar, Rawalpindi. Close to public transport, commercial markets, schools and hospitals.",
    purpose: "sale",
    propertyType: "House",
    price: 6500000,
    city: "Rawalpindi",
    area: "Saddar",
    address: "Adamjee Road, Saddar, Rawalpindi",
    location: { type: "Point", coordinates: [73.0551, 33.5978] },
    bedrooms: 3, bathrooms: 2, kitchens: 1, garage: 0, areaSize: "3 Marla", yearBuilt: 2015,
    amenities: { parking: false, swimmingPool: false, garden: false, gym: false, electricityBackup: false, waterSupply: true, gas: true, internet: true, security: false },
    images: ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80"],
    isFeatured: false, isVerified: true, approvalStatus: 'approved', views: 32,
    owner: { _id: "agent_demo_id", name: "Ali Real Estate Agency", email: "agent@property.com", phone: "+923007654321", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80" }
  },
  {
    _id: "mock_isb_2",
    title: "Luxury 3 Bed Apartment in Centaurus",
    description: "Breathtaking 3-bedroom luxury apartment on the 8th floor of Tower B, Centaurus Mall, Sector F-8, Islamabad. Includes panoramic floor-to-ceiling views of the Margalla Hills, underground parking slots, and premium health club.",
    purpose: "rent",
    propertyType: "Apartment",
    price: 150000,
    city: "Islamabad",
    area: "Sector F-8",
    address: "Tower B, Apartment 802, Centaurus Mall, Sector F-8",
    location: { type: "Point", coordinates: [73.0505, 33.7077] },
    bedrooms: 3, bathrooms: 3, kitchens: 1, garage: 2, areaSize: "1800 Sq. Ft.", yearBuilt: 2024,
    amenities: { parking: true, swimmingPool: true, garden: false, gym: true, electricityBackup: true, waterSupply: true, gas: true, internet: true, security: true },
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"],
    isFeatured: true, isVerified: true, approvalStatus: 'approved', views: 245,
    owner: { _id: "agent_demo_id", name: "Ali Real Estate Agency", email: "agent@property.com", phone: "+923007654321", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80" }
  },
  {
    _id: "mock_khi_3",
    title: "Beach Avenue Seaside Clifton Apartment",
    description: "Spectacular ocean-facing 2 bedroom apartment on Beach Avenue, Clifton Block 2, Karachi. Modern modular kitchen, marble flooring, private balcony overlooking the Arabian Sea.",
    purpose: "sale",
    propertyType: "Apartment",
    price: 26000000,
    city: "Karachi",
    area: "Clifton",
    address: "Seaside Heights, Block 2, Clifton",
    location: { type: "Point", coordinates: [67.0315, 24.8138] },
    bedrooms: 2, bathrooms: 2, kitchens: 1, garage: 1, areaSize: "1250 Sq. Ft.", yearBuilt: 2023,
    amenities: { parking: true, swimmingPool: false, garden: false, gym: false, electricityBackup: true, waterSupply: true, gas: true, internet: true, security: true },
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"],
    isFeatured: false, isVerified: true, approvalStatus: 'approved', views: 89,
    owner: { _id: "agent_demo_id", name: "Ali Real Estate Agency", email: "agent@property.com", phone: "+923007654321", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80" }
  },
  {
    _id: "mock_apt_lh",
    title: "1 Bed Studio Apartment in Johar Town",
    description: "Cozy and affordable studio apartment in Johar Town, Lahore. Ideal for young professionals or students. Features modular kitchen, 24/7 security, and backup power.",
    purpose: "rent",
    propertyType: "Apartment",
    price: 35000,
    city: "Lahore",
    area: "Johar Town",
    address: "Block G, Johar Town, Lahore",
    location: { type: "Point", coordinates: [74.2980, 31.4697] },
    bedrooms: 1, bathrooms: 1, kitchens: 1, garage: 0, areaSize: "550 Sq. Ft.", yearBuilt: 2021,
    amenities: { parking: false, swimmingPool: false, garden: false, gym: false, electricityBackup: true, waterSupply: true, gas: true, internet: true, security: true },
    images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80"],
    isFeatured: false, isVerified: true, approvalStatus: 'approved', views: 66,
    owner: { _id: "agent_demo_id", name: "Ali Real Estate Agency", email: "agent@property.com", phone: "+923007654321", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80" }
  },
  {
    _id: "mock_lh_5",
    title: "Luxury Flat in Bahria Town Lahore",
    description: "Tastefully furnished 2-bedroom luxury flat in Bahria Town, Lahore. Features high-speed internet, generator backup, swimming pool access, gym, and 24/7 security. Ready to move.",
    purpose: "rent",
    propertyType: "Flat",
    price: 80000,
    city: "Lahore",
    area: "Bahria Town",
    address: "Bahria Town Phase 4, Lahore",
    location: { type: "Point", coordinates: [74.1908, 31.3657] },
    bedrooms: 2, bathrooms: 2, kitchens: 1, garage: 1, areaSize: "1100 Sq. Ft.", yearBuilt: 2023,
    amenities: { parking: true, swimmingPool: true, garden: false, gym: true, electricityBackup: true, waterSupply: true, gas: true, internet: true, security: true },
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"],
    isFeatured: false, isVerified: true, approvalStatus: 'approved', views: 54,
    owner: { _id: "agent_demo_id", name: "Ali Real Estate Agency", email: "agent@property.com", phone: "+923007654321", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80" }
  },
  {
    _id: "mock_flat_isb",
    title: "2 Bed Flat in G-11 Islamabad",
    description: "Well-maintained 2-bedroom flat in the peaceful and developed sector G-11 of Islamabad. Bright rooms, tiled kitchen, and close to Islamabad Expressway and Murree Road.",
    purpose: "sale",
    propertyType: "Flat",
    price: 12500000,
    city: "Islamabad",
    area: "G-11",
    address: "G-11/2, Islamabad",
    location: { type: "Point", coordinates: [73.0200, 33.6950] },
    bedrooms: 2, bathrooms: 2, kitchens: 1, garage: 0, areaSize: "950 Sq. Ft.", yearBuilt: 2019,
    amenities: { parking: true, swimmingPool: false, garden: false, gym: false, electricityBackup: false, waterSupply: true, gas: true, internet: true, security: true },
    images: ["https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80"],
    isFeatured: false, isVerified: true, approvalStatus: 'approved', views: 41,
    owner: { _id: "agent_demo_id", name: "Ali Real Estate Agency", email: "agent@property.com", phone: "+923007654321", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80" }
  },
  {
    _id: "mock_isb_6",
    title: "4 Marla Commercial Office in Blue Area",
    description: "Prime commercial office space in the heart of Blue Area, Islamabad. Fully air-conditioned with separate server room, reception area, 3 cabins and 1 meeting room. Ideal for IT, law or consultancy firms.",
    purpose: "rent",
    propertyType: "Office",
    price: 120000,
    city: "Islamabad",
    area: "Blue Area",
    address: "Jinnah Avenue, Blue Area, Islamabad",
    location: { type: "Point", coordinates: [73.0851, 33.7215] },
    bedrooms: 0, bathrooms: 2, kitchens: 1, garage: 2, areaSize: "4 Marla", yearBuilt: 2020,
    amenities: { parking: true, swimmingPool: false, garden: false, gym: false, electricityBackup: true, waterSupply: true, gas: false, internet: true, security: true },
    images: ["https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80"],
    isFeatured: false, isVerified: true, approvalStatus: 'approved', views: 38,
    owner: { _id: "agent_demo_id", name: "Ali Real Estate Agency", email: "agent@property.com", phone: "+923007654321", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80" }
  },
  {
    _id: "mock_office_lh",
    title: "Corporate Office Space in MM Alam Road",
    description: "Prestigious corporate office on 2nd floor, MM Alam Road, Gulberg, Lahore. Open floor plan for 30 employees, glass-walled conference room, dedicated parking, and 24/7 building security.",
    purpose: "rent",
    propertyType: "Office",
    price: 250000,
    city: "Lahore",
    area: "Gulberg",
    address: "MM Alam Road, Gulberg II, Lahore",
    location: { type: "Point", coordinates: [74.3460, 31.5120] },
    bedrooms: 0, bathrooms: 3, kitchens: 1, garage: 5, areaSize: "8 Marla", yearBuilt: 2022,
    amenities: { parking: true, swimmingPool: false, garden: false, gym: false, electricityBackup: true, waterSupply: true, gas: false, internet: true, security: true },
    images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"],
    isFeatured: true, isVerified: true, approvalStatus: 'approved', views: 95,
    owner: { _id: "agent_demo_id", name: "Ali Real Estate Agency", email: "agent@property.com", phone: "+923007654321", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80" }
  },
  {
    _id: "mock_shop_lh",
    title: "Commercial Shop in Liberty Market",
    description: "Prime ground-floor commercial shop in the heart of Liberty Market, Lahore. Excellent footfall and visibility. Suitable for retail, pharmacy, electronics, or fashion brand.",
    purpose: "rent",
    propertyType: "Shop",
    price: 95000,
    city: "Lahore",
    area: "Gulberg",
    address: "Liberty Market, Gulberg III, Lahore",
    location: { type: "Point", coordinates: [74.3381, 31.5127] },
    bedrooms: 0, bathrooms: 1, kitchens: 0, garage: 0, areaSize: "400 Sq. Ft.", yearBuilt: 2010,
    amenities: { parking: false, swimmingPool: false, garden: false, gym: false, electricityBackup: true, waterSupply: true, gas: false, internet: true, security: true },
    images: ["https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80"],
    isFeatured: false, isVerified: true, approvalStatus: 'approved', views: 73,
    owner: { _id: "agent_demo_id", name: "Ali Real Estate Agency", email: "agent@property.com", phone: "+923007654321", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80" }
  },
  {
    _id: "mock_shop_khi",
    title: "Double Storey Shop in Tariq Road Karachi",
    description: "Well-located double storey shop on the main Tariq Road, Karachi. Ground floor for display and first floor for storage or office. High footfall area, ideal for clothing or household goods retail.",
    purpose: "sale",
    propertyType: "Shop",
    price: 18000000,
    city: "Karachi",
    area: "Tariq Road",
    address: "Main Tariq Road, PECHS Block 2, Karachi",
    location: { type: "Point", coordinates: [67.0630, 24.8720] },
    bedrooms: 0, bathrooms: 2, kitchens: 0, garage: 0, areaSize: "700 Sq. Ft.", yearBuilt: 2008,
    amenities: { parking: false, swimmingPool: false, garden: false, gym: false, electricityBackup: true, waterSupply: true, gas: false, internet: true, security: true },
    images: ["https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=800&q=80"],
    isFeatured: false, isVerified: true, approvalStatus: 'approved', views: 52,
    owner: { _id: "agent_demo_id", name: "Ali Real Estate Agency", email: "agent@property.com", phone: "+923007654321", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80" }
  },
  {
    _id: "mock_farm_lh",
    title: "Luxury Farm House in Bedian Road",
    description: "Breathtaking 4-kanal farm house on Bedian Road, Lahore. Features lush green lawns, a private swimming pool, outdoor BBQ area, and modern guest quarters. Perfect for weekend retreats.",
    purpose: "rent",
    propertyType: "Farm House",
    price: 500000,
    city: "Lahore",
    area: "Bedian Road",
    address: "Bedian Road, Lahore",
    location: { type: "Point", coordinates: [74.5200, 31.4000] },
    bedrooms: 6, bathrooms: 6, kitchens: 2, garage: 4, areaSize: "4 Kanal", yearBuilt: 2020,
    amenities: { parking: true, swimmingPool: true, garden: true, gym: true, electricityBackup: true, waterSupply: true, gas: true, internet: true, security: true },
    images: ["https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=800&q=80"],
    isFeatured: true, isVerified: true, approvalStatus: 'approved', views: 310,
    owner: { _id: "agent_demo_id", name: "Ali Real Estate Agency", email: "agent@property.com", phone: "+923007654321", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80" }
  },
  {
    _id: "mock_plot_isb",
    title: "5 Marla Residential Plot in DHA Phase 2",
    description: "Ready-to-build 5 Marla residential plot in DHA Phase 2, Islamabad. All utilities available including electricity, gas, and water. Easy access to main Islamabad Expressway.",
    purpose: "sale",
    propertyType: "Plot",
    price: 9500000,
    city: "Islamabad",
    area: "DHA Phase 2",
    address: "Sector A, DHA Phase 2, Islamabad",
    location: { type: "Point", coordinates: [73.1400, 33.5700] },
    bedrooms: 0, bathrooms: 0, kitchens: 0, garage: 0, areaSize: "5 Marla", yearBuilt: null,
    amenities: { parking: false, swimmingPool: false, garden: false, gym: false, electricityBackup: false, waterSupply: true, gas: true, internet: false, security: true },
    images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"],
    isFeatured: false, isVerified: true, approvalStatus: 'approved', views: 48,
    owner: { _id: "agent_demo_id", name: "Ali Real Estate Agency", email: "agent@property.com", phone: "+923007654321", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80" }
  }
];

// Helper: filter mock properties based on query parameters (client-side)
const filterMockProperties = (queryParams) => {
  let results = [...mockPropertiesFallback];
  const q = queryParams || {};
  if (q.purpose) results = results.filter(p => p.purpose === q.purpose);
  if (q.city) results = results.filter(p => p.city?.toLowerCase().includes(q.city.toLowerCase()));
  if (q.propertyType) results = results.filter(p => p.propertyType === q.propertyType);
  if (q.minPrice) results = results.filter(p => p.price >= Number(q.minPrice));
  if (q.maxPrice) results = results.filter(p => p.price <= Number(q.maxPrice));
  if (q.bedrooms) results = results.filter(p => p.bedrooms >= Number(q.bedrooms));
  if (q.bathrooms) results = results.filter(p => p.bathrooms >= Number(q.bathrooms));
  if (q.sort === 'lowestPrice') results.sort((a, b) => a.price - b.price);
  else if (q.sort === 'highestPrice') results.sort((a, b) => b.price - a.price);
  else if (q.sort === 'mostViewed') results.sort((a, b) => (b.views || 0) - (a.views || 0));
  return results;
};


// Async Thunks
export const fetchProperties = createAsyncThunk(
  'properties/fetchAll',
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          params.append(key, val);
        }
      });
      const response = await api.get(`/properties?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch properties');
    }
  }
);

export const fetchPropertyById = createAsyncThunk(
  'properties/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/properties/${id}`);
      return response.data;
    } catch (error) {
      // Fall back to mock data for demo IDs
      const mockMatch = mockPropertiesFallback.find(p => p._id === id);
      if (mockMatch) return { property: mockMatch };
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch property details');
    }
  }
);


export const fetchMyProperties = createAsyncThunk(
  'properties/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/properties/my-listings');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch your properties');
    }
  }
);

export const createNewProperty = createAsyncThunk(
  'properties/create',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/properties', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to list property');
    }
  }
);

export const updateProperty = createAsyncThunk(
  'properties/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/properties/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update property');
    }
  }
);

export const deleteProperty = createAsyncThunk(
  'properties/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/properties/${id}`);
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete property');
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'properties/toggleFavorite',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post(`/properties/${id}/favorite`);
      return response.data; // contains list of favorite ids
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle favorite');
    }
  }
);

const initialState = {
  properties: [],
  myProperties: [],
  currentProperty: null,
  compareList: [],
  loading: false,
  error: null,
};

const propertySlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    clearCurrentProperty: (state) => {
      state.currentProperty = null;
    },
    addToCompare: (state, action) => {
      const exists = state.compareList.find((p) => p._id === action.payload._id);
      if (exists) return;
      if (state.compareList.length >= 3) {
        state.compareList.shift();
      }
      state.compareList.push(action.payload);
    },
    removeFromCompare: (state, action) => {
      state.compareList = state.compareList.filter((p) => p._id !== action.payload);
    },
    clearCompareList: (state) => {
      state.compareList = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        // Fall back to filtered mock properties if backend returned empty array
        if (action.payload.properties.length > 0) {
          state.properties = action.payload.properties;
        } else {
          state.properties = filterMockProperties(action.meta.arg);
        }
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        // Fallback on network/API failure — filter mock data by query params
        state.properties = filterMockProperties(action.meta.arg);
      })
      // Fetch by ID
      .addCase(fetchPropertyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProperty = action.payload.property;
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.loading = false;
        // Fallback to match mock by ID if backend details load fails
        const mockMatch = mockPropertiesFallback.find((p) => p._id === action.meta.arg);
        if (mockMatch) {
          state.currentProperty = mockMatch;
        } else {
          state.error = action.payload;
        }
      })
      // Fetch My List
      .addCase(fetchMyProperties.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.myProperties = action.payload.properties;
      })
      .addCase(fetchMyProperties.rejected, (state, action) => {
        state.loading = false;
        state.myProperties = mockPropertiesFallback;
      })
      // Delete
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.myProperties = state.myProperties.filter((p) => p._id !== action.payload.id);
        state.properties = state.properties.filter((p) => p._id !== action.payload.id);
      });
  },
});

export const {
  clearCurrentProperty,
  addToCompare,
  removeFromCompare,
  clearCompareList,
} = propertySlice.actions;

export default propertySlice.reducer;
