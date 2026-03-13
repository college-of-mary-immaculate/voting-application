const db = require('./dbService');
const bcrypt = require('bcrypt');

class AdminService {
  async getAll() { /* ... */ }
  async getById(id) { /* ... */ }
  async create(data) { /* ... */ }
  async update(id, data) { /* ... */ }
  async delete(id) { /* ... */ }
}

module.exports = new AdminService();