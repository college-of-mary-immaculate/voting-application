const DBService = require("./dbService");

class PositionService {
  static async create(election_id, position_name, max_vote_allowed = 1) {
    if (!election_id || !position_name) {
      throw new Error("election_id and position_name are required");
    }

    const sql = `
      INSERT INTO positions (election_id, position_name, max_vote_allowed)
      VALUES (?, ?, ?)
    `;

    const result = await DBService.write(sql, [
      election_id,
      position_name,
      max_vote_allowed
    ]);

    return {
      status: "success",
      message: "Position created successfully",
      data: {
        position_id: result.insertId,
        election_id,
        position_name,
        max_vote_allowed
      }
    };
  }

  static async selectTemplate(election_type_id) {
    return await DBService.read(
        `SELECT position_name, max_vote_allowed
       FROM position_templates
       WHERE election_type_id = ?`,
       [election_type_id]
    );
  }
}

module.exports = PositionService;