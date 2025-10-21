import mongoose from 'mongoose';
import Guide from './Guide';
import Review from './Review';
import User from './User';
const TourSchema = new mongoose.Schema({
  title: {
    en: {
      type: String,
      required: [true, 'Please provide a title in English'],
      trim: true,
    },
    ar: {
      type: String,
      required: [true, 'Please provide a title in Arabic'],
      trim: true,
    },
  },
  description: {
    en: {
      type: String,
      required: [true, 'Please provide a description in English'],
    },
    ar: {
      type: String,
      required: [true, 'Please provide a description in Arabic'],
    },
  },
  tourPlan: [
    {
      day: {
        type: Number,
        required: [true, 'Day number is required'],
      },
      title: {
        en: {
          type: String,
          trim: true,
        },
        ar: {
          type: String,
          trim: true,
        },
      },
      content: {
        en: {
          type: String,
          required: [true, 'Day content in English is required'],
        },
        ar: {
          type: String,
          required: [true, 'Day content in Arabic is required'],
        },
      },
    }
  ],
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guide',
    required: [true, 'Tour must belong to a guide'],
  },
  price: {
    type: Number,
    required: [true, 'Tour must have a price'],
  }, 
  pricePer:{
    type: String,
    enum: ['person', 'group'],
    default: 'group',
  },
  images: {
    cover: {
      url: {
        type: String,
        required: [true, 'Please provide a cover image'],
      },
      publicId: {
        type: String,
      },
    },
    gallery: [
      {
        url: {
          type: String,
        },
        publicId: {
          type: String,
        },
      },
    ],
  },
  duration: {
    type: Number,
    required: [true, 'Tour must have a duration'],
  },
  durationUnit: {
    type: String,
    enum: ['hours', 'days'],
    default: 'hours',
  },
  activityLevel: {
    type: String,
    enum: ['easy', 'moderate', 'challenging'],
    default: 'moderate',
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'Tour must have a group size'],
  },
  languages: [
    {
      type: String,
      required: [true, 'Tour must have at least one language'],
    },
  ],
  transportation: {
    type: String,
    enum: ['walking', 'public', 'private', 'mixed'],
    default: 'walking',
  },
  handicappedFriendly: {
    type: Boolean,
    default: false,
  },
  kidFriendly: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  expertise: [
    {
      type: String,
      enum: [
        'Religious',
        'Christian',
        'Jewish',
        'Muslim',
        'Political',
        'Historical',
        'Cultural',
        'Food',
        'Adventure',
        'Nature',
        'Photography',
        'Culinary',
        'All-inclusive',
      ],
      required: true,
    },
  ],
  // Ensure at least one expertise is selected
  // Mongoose validates arrays differently; use a custom validator
  // Note: Keep messages concise for UI
  
  includes: [
    {
      type: String,
      trim: true,
    },
  ],
  excluded: [
    {
      type: String,
      trim: true,
    },
  ],
  itinerary: [
    {
      title: {
        type: String,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
    },
  ],
  // Embedded tour reviews (legacy/local cache) - comment optional
  tourReviews: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
      },
      comment: {
        type: String,
        required: false,
        trim: true,
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please provide a rating'],
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  // Frequently Asked Questions (localized)
  faqs: [
    {
      question: {
        en: { type: String, trim: true },
        ar: { type: String, trim: true },
      },
      answer: {
        en: { type: String, trim: true },
        ar: { type: String, trim: true },
      },
    },
  ],
  averageTemperature: {
    type: Number,
  },
 
  locationNames: [String],
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

// Custom validator: at least one expertise
TourSchema.path('expertise').validate(function (value) {
  return Array.isArray(value) && value.length > 0;
}, 'Please select at least one expertise');

// Virtual populate reviews
TourSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tour',
  justOne: false,
});

// Virtual populate bookings
TourSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'tour',
  justOne: false,
});

export default mongoose.models.Tour || mongoose.model('Tour', TourSchema); 