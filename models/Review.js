import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user'],
  },
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
  },
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guide',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Review must have a rating'],
  },
  comment: {
    type: String,
    required: [true, 'Review must have a comment'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// A user can only leave one review per tour or guide
ReviewSchema.index({ user: 1, tour: 1 }, { unique: true, sparse: true });
ReviewSchema.index({ user: 1, guide: 1 }, { unique: true, sparse: true });

// Static method to calculate average rating
ReviewSchema.statics.calcAverageRating = async function(tourId, guideId) {
  if (tourId) {
    const stats = await this.aggregate([
      {
        $match: { tour: tourId },
      },
      {
        $group: {
          _id: '$tour',
          avgRating: { $avg: '$rating' },
          numReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await mongoose.model('Tour').findByIdAndUpdate(tourId, {
        rating: stats[0].avgRating,
        reviewCount: stats[0].numReviews,
      });
    } else {
      await mongoose.model('Tour').findByIdAndUpdate(tourId, {
        rating: 5,
        reviewCount: 0,
      });
    }
  }

  if (guideId) {
    const stats = await this.aggregate([
      {
        $match: { guide: guideId },
      },
      {
        $group: {
          _id: '$guide',
          avgRating: { $avg: '$rating' },
          numReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await mongoose.model('Guide').findByIdAndUpdate(guideId, {
        rating: stats[0].avgRating,
        reviewCount: stats[0].numReviews,
      });
    } else {
      await mongoose.model('Guide').findByIdAndUpdate(guideId, {
        rating: 5,
        reviewCount: 0,
      });
    }
  }
};

// Call calcAverageRating after save
ReviewSchema.post('save', function() {
  this.constructor.calcAverageRating(this.tour, this.guide);
});

// Call calcAverageRating before remove
ReviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  next();
});

ReviewSchema.post(/^findOneAnd/, async function() {
  if (this.r) {
    await this.r.constructor.calcAverageRating(this.r.tour, this.r.guide);
  }
});

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema); 