const otplib = require('otplib');
const User = require('../models/user');

const setup = async (req, res) => {
  const user = req.user;
  const secret = otplib.authenticator.generateSecret();
  const otpauth = otplib.authenticator.keyuri(user.email, 'Bolt Admin', secret);
  // store temp secret until verification
  user.mfaTempSecret = secret;
  await user.save();
  res.json({ success: true, data: { otpauthUrl: otpauth }, message: 'MFA setup initiated' });
};

const verify = async (req, res) => {
  const { token } = req.validated || req.body;
  const user = req.user;
  const secret = user.mfaTempSecret || user.mfaSecret;
  if (!secret) return res.status(400).json({ success: false, message: 'MFA not initiated', code: 'mfa_not_initiated' });
  const valid = otplib.authenticator.check(token, secret);
  if (!valid) return res.status(400).json({ success: false, message: 'Invalid MFA token', code: 'invalid_mfa' });
  user.mfaEnabled = true;
  user.mfaSecret = secret;
  user.mfaTempSecret = undefined;
  await user.save();
  res.json({ success: true, message: 'MFA enabled' });
};

const disable = async (req, res) => {
  const user = req.user;
  user.mfaEnabled = false;
  user.mfaSecret = undefined;
  user.mfaTempSecret = undefined;
  await user.save();
  res.json({ success: true, message: 'MFA disabled' });
};

module.exports = { setup, verify, disable };
