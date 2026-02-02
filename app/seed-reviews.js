const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// 1. Load environment variables from .env.local
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const parts = line.split('=');
      const key = parts[0];
      const value = parts.slice(1).join('=');
      if (key && value) process.env[key.trim()] = value.trim().replace(/"/g, '');
    });
  }
} catch (e) {
  console.log('Could not load .env.local, checking process.env...');
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found. Make sure .env.local exists.');
  process.exit(1);
}

// 2. Define Schemas (Simplified)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: { type: String, default: 'user' },
  image: String
}, { strict: false });

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour' },
  rating: Number,
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

// Logic to update Tour average rating
reviewSchema.statics.calcAverageRating = async function(tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Tour').findByIdAndUpdate(tourId, {
      rating: stats[0].avgRating,
      reviewCount: stats[0].numReviews
    });
    console.log(`✅ Updated Tour rating: ${stats[0].avgRating} (${stats[0].numReviews} reviews)`);
  }
};

reviewSchema.post('save', function() {
  this.constructor.calcAverageRating(this.tour);
});

const User = mongoose.model('User', userSchema);
const Review = mongoose.model('Review', reviewSchema);
// Define Tour model to ensure findByIdAndUpdate works
const Tour = mongoose.models.Tour || mongoose.model('Tour', new mongoose.Schema({}, { strict: false }));

// 3. Execution
async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔌 Connected to DB');

    const tourId = '68f680fa9c85e8b900d30a80';
    
    // Dummy Data
    const dummyReviews = [
      {
        name: "Liesl (Germany)",
        email: "liesl@test.com",
        comment: "I heard rave reviews about Kristel’s tours from so many people before I finally was able to make one, and they were so right! The Jerusalem aqua tour was very interesting and it felt like a personal experience in the small group setting we were in. Not to mention an amazing song in an underground cistern to make the day more magical! Kristel is very approachable and keeps it flowing very nicely."
      },
      {
        name: "Talita (Brazil)",
        email: "talita@test.com",
        comment: "I couldn’t recommend her more highly if you’re looking for someone knowledgeable, honest, kind, and genuinely fun to be around. A great place to start is the must-do Al-Aqsa Mosque tour, but if you’re looking for hidden gems and less obvious experiences, I highly recommend The Water of Jerusalem tour."
      },
      {
        name: "Jessica Pearson",
        email: "jessica.dummy@test.com",
        comment: "Great experience! The underground parts were fascinating and the lunch afterwards was delicious. 5 stars all the way!"
      }
    ];

    for (const data of dummyReviews) {
      // Find or create dummy user
      let user = await User.findOne({ email: data.email });
      if (!user) {
        user = await User.create({
          name: data.name,
          email: data.email,
          role: 'user',
          image: `https://ui-avatars.com/api/?name=${data.name.replace(' ', '+')}&background=random`
        });
        console.log(`👤 Created user: ${data.name}`);
      }

      // Create review
      // Check if review exists first to avoid duplicates
      const existingReview = await Review.findOne({ user: user._id, tour: tourId });
      if (!existingReview) {
        await Review.create({
          user: user._id,
          tour: tourId,
          rating: 5,
          comment: data.comment
        });
        console.log(`⭐ Added 5-star review from ${data.name}`);
      } else {
        console.log(`⚠️ Review from ${data.name} already exists.`);
      }
    }

    console.log('✨ All done!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

seed();