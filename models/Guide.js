import mongoose from 'mongoose';
import User from './User';
const GuideSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  names: [{
    language: {
      type: String,
      required: [true, 'Please provide a language for the name'],
    },
    value: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
  }],
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
    licenseIssueDate: {
      type: Date,
      required: [true, 'Please provide a license issue date'],
    }
  }],
  aboutSections: [{
    language: {
      type: String,
      required: [true, 'Please provide a language for the about section'],
    },
    content: {
      type: String,
      required: [true, 'Please provide an about section'],
    },
  }],
  profileImage: {
    url: {
      type: String,
      required: [true, 'Please provide a profile image'],
    },
    publicId: {
      type: String,
    },
  },
  coverImage: {
    url: {
      type: String,
      default: '', // Optional cover image
    },
    publicId: {
      type: String,
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
    image: {
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
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

// Add a virtual property to calculate years of experience
GuideSchema.virtual('yearsOfExperience').get(function() {
  if (!this.expertise || this.expertise.length === 0 || !this.expertise[0].licenseIssueDate) {
    return 0;
  }
  
  const issueDate = new Date(this.expertise[0].licenseIssueDate);
  const today = new Date();
  return Math.floor((today - issueDate) / (365.25 * 24 * 60 * 60 * 1000));
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