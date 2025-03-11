import mongoose from 'mongoose';
import User from './User';
const GuideSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    en: {
      type: String,
      required: [true, 'Please provide a name in English'],
      trim: true,
    },
    ar: {
      type: String,
      required: [true, 'Please provide a name in Arabic'],
      trim: true,
    },
  },
  active: {
    type: Boolean,
    default: false, // Guides start as inactive until approved by admin
  },
  nickname: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Please provide an address'],
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
  },
  languages: [{
    language: {
      type: String,
      required: [true, 'Please provide a language'],
    },
    proficiency: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please provide a proficiency level'],
    },
  }],
  expertise: [{
    area: {
      type: String,
      required: [true, 'Please provide an expertise area'],
    },
    years: {
      type: Number,
      required: [true, 'Please provide years of experience'],
    },
  }],
  about: {
    en: {
      type: String,
      required: [true, 'Please provide an about section in English'],
    },
    ar: {
      type: String,
      required: [true, 'Please provide an about section in Arabic'],
    },
  },
  profileImage: {
    url: {
      type: String,
      required: [true, 'Please provide a profile image'],
    },
    publicId: {
      type: String,
    },
  },
  driverLicense: {
    date: {
      type: Date,
    },
    number: {
      type: String,
    },
    image: {
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
    },
  },
  vehicle: {
    type: {
      type: String,
    },
    model: {
      type: String,
    },
    year: {
      type: Number,
    },
    capacity: {
      type: Number,
    },
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual populate reviews
GuideSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'guide',
  justOne: false,
});

// Virtual populate tours
GuideSchema.virtual('tours', {
  ref: 'Tour',
  localField: '_id',
  foreignField: 'guide',
  justOne: false,
});

export default mongoose.models.Guide || mongoose.model('Guide', GuideSchema); 