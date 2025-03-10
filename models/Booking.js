import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user'],
  },
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a tour'],
  },
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guide',
    required: [true, 'Booking must belong to a guide'],
  },
  dates: {
    startDate: {
      type: Date,
      required: [true, 'Booking must have a start date'],
    },
    endDate: {
      type: Date,
    },
  },
  travelers: {
    type: Number,
    required: [true, 'Booking must have a number of travelers'],
    min: 1,
  },
  totalPrice: {
    type: Number,
    required: [true, 'Booking must have a total price'],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
  },
  specialRequests: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema); 