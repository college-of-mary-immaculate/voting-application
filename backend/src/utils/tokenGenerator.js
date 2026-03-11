const jwt = require('jsonwebtoken');

const tokenGenerator = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );
};

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}


module.exports = tokenGenerator;