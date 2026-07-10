const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: 'PropertyFinder',
    },
    contactEmail: {
      type: String,
      default: 'support@propertyfinder.com',
    },
    contactPhone: {
      type: String,
      default: '+92 300 1234567',
    },
    address: {
      type: String,
      default: 'Office 402, Al-Hafeez Heights, Gulberg III, Lahore, Pakistan',
    },
    aboutUs: {
      type: String,
      default: 'We are the leading real estate platform offering buy, rent, and sell services across multiple cities.',
    },
    privacyPolicy: {
      type: String,
      default: 'Your privacy is our priority. We collect only necessary details to link customers and owners.',
    },
    termsOfService: {
      type: String,
      default: 'All listings must represent real, verifiable properties. Spamming is strictly prohibited.',
    },
    faqs: [
      {
        question: String,
        answer: String,
      }
    ],
    cities: {
      type: [String],
      default: ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Multan', 'Faisalabad'],
    },
    propertyTypes: {
      type: [String],
      default: ['House', 'Apartment', 'Villa', 'Flat', 'Commercial Building', 'Office', 'Shop', 'Plot', 'Farm House'],
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
