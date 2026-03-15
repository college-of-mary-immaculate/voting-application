const DBService = require('../services/dbService');
const bcrypt = require("bcrypt");

class AccountService {
  static async create(fullname, email, password) {
    if (!fullname || !email || !password) {
      throw new Error("All fields are required.");
    }

    const voterExist = await DBService.read(
      `SELECT voter_id FROM voters WHERE email = ?`,
      [email],
    );

    if (voterExist.length > 0) {
      throw new Error("This email is already registered.");
    }

    const adminExist = await DBService.read(
      `SELECT admin_id FROM admins WHERE email = ?`,
      [email],
    );

    if (adminExist.length > 0) {
      throw new Error("This email is already registered.");
    }

    const hashedPwd = await bcrypt.hash(password, 10);

    await DBService.write(
      `INSERT INTO voters (full_name, email, password_hash)
     VALUES (?, ?, ?)`,
      [fullname, email, hashedPwd],
    );

    return {
      status: "success",
      message: "Voter Registered Successfully",
    };
  }

  static async login(email, password) {
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    const adminRows = await DBService.read(
      "SELECT * FROM admins WHERE email = ?",
      [email],
    );

    if (adminRows.length > 0) {
      const admin = adminRows[0];
      const match = await bcrypt.compare(password, admin.password_hash);

      if (!match) {
        throw new Error("Invalid email or password.");
      }

      return {
        status: "success",
        message: "Login successful",
        data: {
          id: admin.admin_id,
          email: admin.email,
          fullname: admin.full_name,
          type: "admin",
        },
      };
    }

    const voterRows = await DBService.read(
      "SELECT * FROM voters WHERE email = ?",
      [email],
    );

    if (voterRows.length > 0) {
      const voter = voterRows[0];
      const match = await bcrypt.compare(password, voter.password_hash);

      if (!match) {
        throw new Error("Invalid email or password.");
      }

      return {
        status: "success",
        message: "Login successful",
        data: {
          id: voter.voter_id,
          email: voter.email,
          fullname: voter.full_name,
          type: "voter",
        },
      };
    }

    throw new Error("Invalid email or password.");
  }
}


module.exports = AccountService;