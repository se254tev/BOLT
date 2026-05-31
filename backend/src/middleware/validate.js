const validateRequest = (schema) => (req, res, next) => {
  const { body, query, params } = req;
  const payload = { ...body, ...query, ...params };
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request data', details: parsed.error.format() });
  }
  req.validated = parsed.data;
  next();
};

module.exports = validateRequest;
