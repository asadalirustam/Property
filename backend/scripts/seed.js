require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Property = require('../models/Property');
const Blog = require('../models/Blog');
const SystemSettings = require('../models/SystemSettings');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://asadalirustam9_db_user:asadali456@cluster0.7ktiiem.mongodb.net/Property?retryWrites=true&w=majority&appName=Cluster0';
    console.log(`Connecting to database for seeding...`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Property.deleteMany({});
    await Blog.deleteMany({});
    await SystemSettings.deleteMany({});

    console.log('Seeding default CMS system settings...');
    const settings = await SystemSettings.create({
      siteName: 'PropertyFinder',
      contactEmail: 'support@propertyfinder.com',
      contactPhone: '+92 300 1234567',
      address: 'Office 402, Al-Hafeez Heights, Gulberg III, Lahore, Pakistan',
      aboutUs: 'We are the leading real estate platform offering buy, rent, and sell services across multiple cities.',
      privacyPolicy: 'Your privacy is our priority. We collect only necessary details to link customers and owners.',
      termsOfService: 'All listings must represent real, verifiable properties. Spamming is strictly prohibited.',
      faqs: [
        { question: 'How do I schedule a site visit?', answer: 'Navigate to any property listing page, choose a date and slot in the sidebar scheduler, and click "Book Site Visit".' },
        { question: 'What does "Verified" badge mean?', answer: 'It indicates that our admin team inspected the coordinates index and title deeds of the listing.' },
        { question: 'Can I list a property for free?', answer: 'Yes! Register an Agent account to upload unlimited properties for rent or sale. Real estate listings will display upon admin approval.' }
      ]
    });

    console.log('Seeding users...');
    // Hashing is handled by User.js pre-save hooks
    const admin = await User.create({
      name: 'Site Administrator',
      email: 'admin@property.com',
      password: 'admin123',
      role: 'admin',
      phone: '+923000000000',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    });

    const agent = await User.create({
      name: 'Ali Real Estate Agency',
      email: 'agent@property.com',
      password: 'agent123',
      role: 'agent',
      phone: '+923007654321',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    });

    const customer = await User.create({
      name: 'Farhan Chaudhry',
      email: 'customer@property.com',
      password: 'customer123',
      role: 'customer',
      phone: '+923211234567',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    });

    console.log('Seeding property listings...');
    const properties = [
      {
        owner: agent._id,
        title: 'Modern 5 Marla Executive Villa',
        description: 'Exquisite 5 Marla luxury villa in DHA Phase 6, Lahore. Features Italian tile flooring, drawing and dining room, custom media wall, and two spacious terraces facing a park view.',
        purpose: 'sale',
        propertyType: 'Villa',
        price: 18500000,
        city: 'Lahore',
        area: 'DHA Phase 6',
        address: 'Sector C, House 145, DHA Phase 6',
        location: {
          type: 'Point',
          coordinates: [74.4412, 31.4722], // DHA Phase 6 coords
        },
        bedrooms: 3,
        bathrooms: 4,
        kitchens: 2,
        garage: 1,
        areaSize: '5 Marla',
        yearBuilt: 2025,
        amenities: {
          parking: true,
          swimmingPool: false,
          garden: true,
          gym: false,
          electricityBackup: true,
          waterSupply: true,
          gas: true,
          internet: true,
          security: true,
        },
        images: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
        ],
        isFeatured: true,
        isVerified: true,
        approvalStatus: 'approved',
      },
      {
        owner: agent._id,
        title: 'Luxury 3 Bed Apartment in Centaurus',
        description: 'Elegantly furnished 3 bedroom luxury apartment in Centaurus Residencia, Sector F-8, Islamabad. Includes panoramic view of Margalla Hills, underground parking, and access to premium health club.',
        purpose: 'rent',
        propertyType: 'Apartment',
        price: 150000,
        city: 'Islamabad',
        area: 'Sector F-8',
        address: 'Tower B, Apartment 802, Centaurus Mall, Sector F-8',
        location: {
          type: 'Point',
          coordinates: [73.0505, 33.7077], // Centaurus coords
        },
        bedrooms: 3,
        bathrooms: 3,
        kitchens: 1,
        garage: 2,
        areaSize: '1800 Sq. Ft.',
        yearBuilt: 2024,
        amenities: {
          parking: true,
          swimmingPool: true,
          garden: false,
          gym: true,
          electricityBackup: true,
          waterSupply: true,
          gas: true,
          internet: true,
          security: true,
        },
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
        ],
        isFeatured: true,
        isVerified: true,
        approvalStatus: 'approved',
      },
      {
        owner: agent._id,
        title: 'Clifton Beachview Apartment',
        description: 'Spectacular sea-facing 2 bedroom apartment on Beach Avenue, Clifton Block 2, Karachi. Features marble counter kitchen, high speed elevators, backup generator, and round-the-clock armed security.',
        purpose: 'sale',
        propertyType: 'Apartment',
        price: 26000000,
        city: 'Karachi',
        area: 'Clifton',
        address: 'Seaside heights, Block 2, Clifton',
        location: {
          type: 'Point',
          coordinates: [67.0315, 24.8138], // Clifton coords
        },
        bedrooms: 2,
        bathrooms: 2,
        kitchens: 1,
        garage: 1,
        areaSize: '1250 Sq. Ft.',
        yearBuilt: 2023,
        amenities: {
          parking: true,
          swimmingPool: false,
          garden: false,
          gym: false,
          electricityBackup: true,
          waterSupply: true,
          gas: true,
          internet: true,
          security: true,
        },
        images: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
        ],
        isFeatured: false,
        isVerified: true,
        approvalStatus: 'approved',
      }
    ];

    await Property.create(properties);

    console.log('Seeding blog articles...');
    const blogs = [
      {
        title: 'Understanding Property Taxes in Pakistan: 2026 Guide',
        content: 'Navigating property tax laws can be complex. In 2026, FBR has implemented updated capital gains tax rates depending on the holding period of plots and houses. This guide breaks down withholding taxes, active tax payers status list, and municipal property tax files.',
        category: 'Legal & Taxes',
        tags: ['tax', 'fbr', 'legal', 'realestate'],
        author: admin._id,
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'Top 5 Areas to Invest in Islamabad Right Now',
        content: 'Islamabad is seeing rapid expansion towards Zone II and Zone V. We inspect top locations including Gulberg Residencia, Park View City, DHA Phase 2, Sector B-17, and Sector G-13 based on development pace, electricity grid completion, and capital growth projections.',
        category: 'Market Trends',
        tags: ['investing', 'islamabad', 'dha', 'plots'],
        author: admin._id,
        image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80',
      }
    ];

    await Blog.create(blogs);

    console.log('\nDatabase seeding finished successfully!');
    console.log('\n=======================================');
    console.log('  TESTING USERS (Password is same for all: user123 suffix)');
    console.log('  Admin:      admin@property.com    / admin123');
    console.log('  Agent:      agent@property.com    / agent123');
    console.log('  Customer:   customer@property.com / customer123');
    console.log('=======================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding database error:', error.message);
    process.exit(1);
  }
};

seedData();
