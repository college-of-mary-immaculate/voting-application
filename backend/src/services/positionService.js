const DBService = require("./dbService");

class PositionService {
  static async create(election_id, position_name, max_vote_allowed = 1) {
    if (!election_id || !position_name) {
      throw new Error("election_id and position_name are required");
    }

    const exists = `
        SELECT * 
        FROM positions 
        WHERE election_id = ? 
          AND position_name = ?
      `;

    const isExist = await DBService.read(exists, [election_id, position_name]);

    if (isExist.length > 0) {
      throw new Error(
        `Position "${position_name}" already exists in this election.`,
      );
    }

    if (isExist.length === 0)
      throw new Error("Election with this ID not exists.");

    const sql = `
      INSERT INTO positions (election_id, position_name, max_vote_allowed)
      VALUES (?, ?, ?)
    `;

    const result = await DBService.write(sql, [
      election_id,
      position_name,
      max_vote_allowed,
    ]);

    return {
      status: "success",
      message: "Position created successfully",
      data: {
        position_id: result.insertId,
        election_id,
        position_name,
        max_vote_allowed,
      },
    };
  }
  static async getByElection(election_id) {
    if (!election_id) {
      throw new Error("Election ID is required");
    }

    const sql = `
    SELECT 
      position_id,
      position_name,
      max_vote_allowed
    FROM positions
    WHERE election_id = ?
    ORDER BY position_id
  `;

    const positions = await DBService.read(sql, [election_id]);

    return {
      status: "success",
      data: positions,
    };
  }
  static async selectTemplate(election_type_id) {
    return await DBService.read(
      `SELECT position_name, max_vote_allowed
       FROM position_templates
       WHERE election_type_id = ?`,
      [election_type_id],
    );
  }
}

module.exports = PositionService;
