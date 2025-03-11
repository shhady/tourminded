import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
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
  image: {
    url: {
      type: String,
      required: [true, 'Please provide an image URL'],
    },
    publicId: String,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual populate tours
LocationSchema.virtual('tours', {
  ref: 'Tour',
  localField: '_id',
  foreignField: 'locations',
  justOne: false,
});

// Use a try-catch block to handle potential errors
let Location;
try {
  // Check if the model already exists
  Location = mongoose.models.Location;
} catch (error) {
  // If not, create it
  Location = mongoose.model('Location', LocationSchema);
}

export default Location; 