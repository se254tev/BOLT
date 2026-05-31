const mongoose = require('mongoose');

const MEAL_CATEGORIES = ['breakfast', 'lunch', 'supper', 'dinner', 'snacks', 'drinks'];

const mealSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, trim: true },
  image: { type: String, trim: true },
  category: { type: String, enum: MEAL_CATEGORIES, required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  restaurantName: { type: String, trim: true },
  isAvailable: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

mealSchema.index({ restaurantId: 1, name: 1 }, { unique: true });

mealSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = { Meal: mongoose.model('Meal', mealSchema), MEAL_CATEGORIES };
