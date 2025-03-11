import mongoose from 'mongoose';
import Guide from './Guide';
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
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guide',
    required: [true, 'Tour must belong to a guide'],
  },
  price: {
    type: Number,
    required: [true, 'Tour must have a price'],
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
  expertise: {
    type: String,
    enum: [
      'Christian',
      'Jewish',
      'Muslim',
      'Political',
      'Historical',
      'Cultural',
      'Food',
      'All-inclusive',
    ],
    required: [true, 'Tour must have an expertise category'],
  },
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