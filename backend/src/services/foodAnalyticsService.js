const FoodOrder = require('../models/foodOrder');
const { Meal } = require('../models/meal');
const Restaurant = require('../models/restaurant');

const topMeals = async (limit = 10) => {
  return Meal.find({}).sort({ orderCount: -1 }).limit(limit).lean();
};

const topRestaurants = async (limit = 10) => {
  return FoodOrder.aggregate([
    { $group: { _id: '$restaurantId', orderCount: { $sum: 1 } } },
    { $sort: { orderCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'restaurants',
        localField: '_id',
        foreignField: '_id',
        as: 'restaurant',
      },
    },
    { $unwind: '$restaurant' },
    { $project: { restaurant: 1, orderCount: 1 } },
  ]);
};

const categoryPopularity = async () => {
  return FoodOrder.aggregate([
    { $unwind: '$mealItems' },
    {
      $lookup: {
        from: 'meals',
        localField: 'mealItems.mealId',
        foreignField: '_id',
        as: 'meal',
      },
    },
    { $unwind: '$meal' },
    { $group: { _id: '$meal.category', totalOrders: { $sum: '$mealItems.quantity' } } },
    { $sort: { totalOrders: -1 } },
  ]);
};

const conversionRate = async () => {
  const totalOrders = await FoodOrder.countDocuments();
  const confirmedOrders = await FoodOrder.countDocuments({ status: { $in: ['accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'completed'] } });
  return totalOrders === 0 ? 0 : (confirmedOrders / totalOrders) * 100;
};

module.exports = { topMeals, topRestaurants, categoryPopularity, conversionRate };
