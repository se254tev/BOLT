const argon2 = require('argon2');
const bcrypt = require('bcryptjs');
const config = require('../config');

const hashToken = async (token) => {
  try {
    return await argon2.hash(token, { type: argon2.argon2id });
  } catch (err) {
    return bcrypt.hash(token, await bcrypt.genSalt(config.bcryptSaltRounds));
  }
};

const compareToken = async (token, hash) => {
  if (hash.startsWith('$argon2')) {
    return argon2.verify(hash, token);
  }
  return bcrypt.compare(token, hash);
};

module.exports = { hashToken, compareToken };
