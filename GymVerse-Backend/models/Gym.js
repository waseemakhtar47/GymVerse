const mongoose = require("mongoose");

const gymSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
        default: [77.281845, 28.561123],
      },
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    timings: {
      open: { type: String, default: "06:00" },
      close: { type: String, default: "22:00" },
    },
    images: [String],
    facilities: [String],
    contactNumber: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    
    pricing: {
      monthly: { type: Number, default: 49 },
      quarterly: { type: Number, default: 129 },
      yearly: { type: Number, default: 499 },
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

    trainers: [
      {
        trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        joinedAt: { type: Date, default: Date.now },
        source: { type: String, enum: ['trainer', 'owner'], default: 'trainer' },
      }
    ],
  },
  { timestamps: true },
);

gymSchema.index({ location: "2dsphere" });

// Method to update average rating
gymSchema.methods.updateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
  } else {
    const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
    this.averageRating = sum / this.ratings.length;
    this.totalReviews = this.ratings.length;
  }
  return this.save();
};

module.exports = mongoose.model("Gym", gymSchema);