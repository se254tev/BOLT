const foodService = require('../services/foodService');
const foodAnalytics = require('../services/foodAnalyticsService');

const createRestaurant = async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ error: 'Only restaurant owners can create restaurants' });
    }
    const restaurant = await foodService.createRestaurant({ user: req.user, payload: req.validated || req.body });
    res.status(201).json({ restaurant });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const listRestaurants = async (req, res) => {
  const restaurants = await foodService.listRestaurants({ search: req.query.search, verified: req.query.verified });
  res.json({ restaurants });
};

const getRestaurant = async (req, res) => {
  const restaurant = await foodService.getRestaurant(req.params.id);
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
  res.json({ restaurant });
};

const createMeal = async (req, res) => {
  try {
    const meal = await foodService.createMeal({ user: req.user, payload: req.validated || req.body });
    res.status(201).json({ meal });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const listMeals = async (req, res) => {
  const meals = await foodService.listMeals({
    search: req.query.search,
    category: req.query.category,
    restaurantId: req.query.restaurantId,
    sortBy: req.query.sortBy,
  });
  res.json({ meals });
};

const getMeal = async (req, res) => {
  const meal = await foodService.getMeal(req.params.id);
  if (!meal) return res.status(404).json({ error: 'Meal not found' });
  res.json({ meal });
};

const removeMealListing = async (req, res) => {
  try {
    await foodService.removeMeal({ mealId: req.params.id, user: req.user });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const createFoodOrder = async (req, res) => {
  try {
    const order = await foodService.createFoodOrder({ user: req.user, payload: req.validated || req.body });
    res.status(201).json({ order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getFoodOrder = async (req, res) => {
  const order = await foodService.getFoodOrder(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const restaurant = await foodService.getRestaurant(order.restaurantId);
  const isRestaurantOwner = restaurant && restaurant.ownerId.toString() === req.user.id;
  if (order.buyerId.toString() !== req.user.id && req.user.role !== 'admin' && order.deliveryAgentId?.toString() !== req.user.id && !isRestaurantOwner) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  res.json({ order });
};

const updateFoodOrderStatus = async (req, res) => {
  try {
    const order = await foodService.updateFoodOrderStatus({ id: req.params.id, status: req.validated.status, user: req.user });
    res.json({ order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getFoodAnalytics = async (req, res) => {
  const meals = await foodAnalytics.topMeals(10);
  const restaurants = await foodAnalytics.topRestaurants(10);
  const categories = await foodAnalytics.categoryPopularity();
  const conversionRate = await foodAnalytics.conversionRate();
  res.json({ analytics: { topMeals: meals, topRestaurants: restaurants, categoryPopularity: categories, conversionRate } });
};

module.exports = {
  createRestaurant,
  listRestaurants,
  getRestaurant,
  createMeal,
  listMeals,
  getMeal,
  removeMealListing,
  createFoodOrder,
  getFoodOrder,
  updateFoodOrderStatus,
  getFoodAnalytics,
};
