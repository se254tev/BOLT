const path = require('path');

const requireController = (controllerPath) => {
  const controller = require(path.resolve(__dirname, controllerPath));

  if (!controller || typeof controller !== 'object') {
    return controller;
  }

  return new Proxy(controller, {
    get(target, property, receiver) {
      if (typeof property === 'string' && !(property in target)) {
        throw new Error(`Controller ${controllerPath} is missing exported handler: ${property}`);
      }
      return Reflect.get(target, property, receiver);
    },
  });
};

module.exports = { requireController };