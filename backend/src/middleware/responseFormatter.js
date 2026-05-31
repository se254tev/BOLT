const responseFormatter = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (payload) => {
    if (payload && typeof payload.success !== 'undefined') {
      return originalJson(payload);
    }

    return originalJson({
      success: true,
      code: 'ok',
      message: '',
      requestId: req.requestId,
      data: payload,
    });
  };

  next();
};

module.exports = { responseFormatter }; 
