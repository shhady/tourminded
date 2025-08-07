import mongoose from 'mongoose';
import Tour from './Tour';
import Guide from './Guide';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  // Clerk ID for syncing with Clerk authentication
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'admin'],
    default: 'user',
  },
  wishlist: {
    tours: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
    }],
    guides: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guide',
    }],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


export default mongoose.models.User || mongoose.model('User', UserSchema); 