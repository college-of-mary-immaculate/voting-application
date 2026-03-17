const DBService = require("./dbService"); // adjust path if needed
const bcrypt = require("bcrypt");

class AdminService {
  static async getAll() {
    const rows = await DBService.read(
      "SELECT admin_id, full_name, email, created_at FROM admins ORDER BY created_at DESC",
    );
    return {
      status: "success",
      count: rows.length,
      data: rows,
    };
  }

  static async getById(adminId) {
    const rows = await DBService.read(
      "SELECT admin_id, full_name, email, created_at FROM admins WHERE admin_id = ?",
      [adminId],
    );

    if (rows.length === 0) {
      throw Object.assign(new Error("Admin not found"), { statusCode: 404 });
    }

    return {
      status: "success",
      data: rows[0],
    };
  }

  static async create({ full_name, email, password }) {
    if (!full_name || !email || !password) {
      throw Object.assign(
        new Error("Full name, email and password are required"),
        { statusCode: 400 },
      );
    }

    const existing = await DBService.read(
      "SELECT admin_id FROM admins WHERE email = ?",
      [email],
    );

    if (existing.length > 0) {
      throw Object.assign(new Error("Email already in use"), {
        statusCode: 409,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await DBService.write(
      "INSERT INTO admins (full_name, email, password_hash) VALUES (?, ?, ?)",
      [full_name, email, hashedPassword],
    );

    return {
      status: "success",
      data: {
        admin_id: result.insertId,
        full_name,
        email,
      },
    };
  }

  static async update(adminId, { full_name, email, password }) {
    const existing = await DBService.read(
      "SELECT full_name, email FROM admins WHERE admin_id = ?",
      [adminId],
    );

    if (existing.length === 0) {
      throw Object.assign(new Error("Admin not found"), { statusCode: 404 });
    }

    const current = existing[0];

    // Check email uniqueness if trying to change it
    if (email && email !== current.email) {
      const duplicate = await DBService.read(
        "SELECT admin_id FROM admins WHERE email = ? AND admin_id != ?",
        [email, adminId],
      );
      if (duplicate.length > 0) {
        throw Object.assign(new Error("Email already in use"), {
          statusCode: 409,
        });
      }
    }

    const updates = [];
    const params = [];

    if (full_name !== undefined) {
      updates.push("full_name = ?");
      params.push(full_name);
    }

    if (email !== undefined) {
      updates.push("email = ?");
      params.push(email);
    }

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.push("password_hash = ?");
      params.push(hashed);
    }

    if (updates.length === 0) {
      return { status: "success", message: "No changes provided" };
    }

    const sql = `
      UPDATE admins
      SET ${updates.join(", ")}
      WHERE admin_id = ?
    `;
    params.push(adminId);

    await DBService.write(sql, params);

    return {
      status: "success",
      message: "Admin updated successfully",
    };
  }

  static async delete(adminId) {
    const result = await DBService.write(
      "DELETE FROM admins WHERE admin_id = ?",
      [adminId],
    );

    if (result.affectedRows === 0) {
      throw Object.assign(new Error("Admin not found"), { statusCode: 404 });
    }

    return {
      status: "success",
      message: "Admin deleted successfully",
    };
  }

  // in AdminService.js
  static async assignVoterToElection(voter_id, election_id) {
    voter_id = Number(voter_id);
    election_id = Number(election_id);

    // 1. Voter exists?
    const voter = await DBService.read(
      `SELECT 1 FROM voters WHERE voter_id = ? LIMIT 1`,
      [voter_id],
    );
    if (voter.length === 0) {
      throw Object.assign(new Error("Voter not found"), { statusCode: 404 });
    }

    // 2. Election exists?
    const election = await DBService.read(
      `SELECT 1 FROM elections WHERE election_id = ? LIMIT 1`,
      [election_id],
    );
    if (election.length === 0) {
      throw Object.assign(new Error("Election not found"), { statusCode: 404 });
    }

    // 3. Already assigned? → we use INSERT IGNORE to make it idempotent
    await DBService.write(
      `INSERT IGNORE INTO voter_elections (voter_id, election_id) VALUES (?, ?)`,
      [voter_id, election_id],
    );

    return {
      status: "success",
      message: "Voter assigned to election (or already was)",
    };
  }
  static async bulkAssignVotersToElection(election_id, voter_ids) {
    election_id = Number(election_id);

    if (!Array.isArray(voter_ids) || voter_ids.length === 0) {
      throw Object.assign(new Error("No voters provided"), { statusCode: 400 });
    }

    // Verify election exists (quick check)
    const election = await DBService.read(
      `SELECT 1 FROM elections WHERE election_id = ? LIMIT 1`,
      [election_id],
    );
    if (election.length === 0) {
      throw Object.assign(new Error("Election not found"), { statusCode: 404 });
    }

    // Prepare values
    const values = voter_ids.map((id) => [Number(id), election_id]);
    const placeholders = values.map(() => "(?, ?)").join(", ");

    // Use INSERT IGNORE → skips duplicates automatically, atomic enough for this case
    await DBService.write(
      `INSERT IGNORE INTO voter_elections (voter_id, election_id) VALUES ${placeholders}`,
      values.flat(),
    );

    return {
      status: "success",
      message: `Assigned up to ${voter_ids.length} voters to election #${election_id}`,
    };
  }
}

module.exports = AdminService;
