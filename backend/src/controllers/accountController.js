const AccountService = require('../services/accountService');
const tokenGenerator = require("../utils/tokenGenerator");

class AccountController {
  static async register(req, res) {
    const { fullname, email, password } = req.body;
    const result = await AccountService.create(fullname, email, password);
    res.status(201).json(result);
  }
  static async login(req, res) {
    const { email, password } = req.body;
    const result = await AccountService.login(email, password);

    const token = tokenGenerator({ id: result.data.id, email: email, type: result.data.type });
    res.status(200).json({
      result: result,
      token: token,
    });
  }
}

module.exports = AccountController;
