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

    // ✅ NEW: Associated trainers
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

module.exports = mongoose.model("Gym", gymSchema);
