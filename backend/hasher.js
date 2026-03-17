const bcrypt = require('bcrypt');

async function hashPassword() {
  const password = 'alices';
  const hash = await bcrypt.hash(password, 10);
  console.log('Hashed password:', hash);
}

hashPassword();