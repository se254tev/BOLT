const routes = [
  './src/routes/auth',
  './src/routes/admin',
  './src/routes/adminAuth',
  './src/routes/cart',
  './src/routes/chat',
  './src/routes/delivery',
  './src/routes/favorites',
  './src/routes/foodOrders',
  './src/routes/health',
  './src/routes/meals',
  './src/routes/products',
  './src/routes/properties',
  './src/routes/reviews',
  './src/routes/restaurants',
  './src/routes/users',
];

routes.forEach((route) => {
  try {
    require(route);
    console.log('OK', route);
  } catch (err) {
    console.error('ERROR', route, err.message);
    process.exitCode = 1;
  }
});
