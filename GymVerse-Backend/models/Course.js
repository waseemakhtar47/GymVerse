const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      default: '',
    },
    videoFile: {
      type: String,
      default: '',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    duration: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    category: {
      type: String,
      required: true,
    },
 enrolledUsers: [
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      default: () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        return date;
      },
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },
    cancelledAt: {
      type: Date,
    },
    progress: {
      type: Number,
      default: 0,
    },
    lastWatched: {
      type: Date,
    },
  },
],
    validityDays: {
      type: Number,
      default: 365,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // ✅ NEW: Ratings and Reviews
    ratings: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        review: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
      }
    ],
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Method to update average rating
courseSchema.methods.updateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
  } else {
    const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
    this.averageRating = parseFloat((sum / this.ratings.length).toFixed(1));
    this.totalReviews = this.ratings.length;
  }
  return this.save();
};

module.exports = mongoose.model('Course', courseSchema);