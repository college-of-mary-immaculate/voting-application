const jwt = require('jsonwebtoken');

const tokenGenerator = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

module.exports = tokenGenerator;