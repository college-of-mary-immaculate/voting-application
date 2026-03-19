const DBService = require("./dbService");

class PositionService {
  static async create(election_id, position_name, max_vote_allowed = 1) {
    if (!election_id || !position_name) {
      throw new Error("election_id and position_name are required");
    }

    const checkElection = `
        SELECT election_id 
        FROM elections 
        WHERE election_id = ?
    `;

    const electionExists = await DBService.read(checkElection, [election_id]);

    if (electionExists.length === 0) {
      throw new Error("Election with this ID does not exist.");
    }

    const checkPosition = `
        SELECT position_id 
        FROM positions 
        WHERE election_id = ? 
          AND position_name = ?
    `;

    const positionExists = await DBService.read(checkPosition, [election_id, position_name]);

    if (positionExists.length > 0) {
      throw new Error(
        `Position "${position_name}" already exists in this election.`
      );
    }

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

    // First check if election exists
    const electionExists = await DBService.read(
      `SELECT election_id FROM elections WHERE election_id = ?`,
      [election_id]
    );

    if (electionExists.length === 0) {
      throw new Error("Election with this ID does not exist.");
    }

    const sql = `
      SELECT 
        p.position_id,
        p.position_name,
        p.max_vote_allowed,
        (SELECT COUNT(*) FROM candidates c WHERE c.position_id = p.position_id) as candidates_count
      FROM positions p
      WHERE p.election_id = ?
      ORDER BY p.position_name ASC
    `;

    const positions = await DBService.read(sql, [election_id]);

    return {
      status: "success",
      count: positions.length,
      data: positions,
    };
  }

  static async getById(position_id) {
    if (!position_id) {
      throw new Error("Position ID is required");
    }

    const sql = `
      SELECT 
        p.position_id,
        p.position_name,
        p.max_vote_allowed,
        p.election_id,
        e.election_name
      FROM positions p
      JOIN elections e ON p.election_id = e.election_id
      WHERE p.position_id = ?
    `;

    const positions = await DBService.read(sql, [position_id]);

    if (positions.length === 0) {
      throw new Error("Position not found");
    }

    // Get candidates for this position
    const candidatesSql = `
      SELECT 
        candidate_id,
        ballot_number,
        full_name,
        party_name,
        photo_url,
        status
      FROM candidates
      WHERE position_id = ?
      ORDER BY ballot_number ASC
    `;

    const candidates = await DBService.read(candidatesSql, [position_id]);

    return {
      status: "success",
      data: {
        ...positions[0],
        candidates: candidates
      }
    };
  }

  static async getAll() {
    const sql = `
      SELECT 
        p.position_id,
        p.position_name,
        p.max_vote_allowed,
        p.election_id,
        e.election_name,
        (SELECT COUNT(*) FROM candidates c WHERE c.position_id = p.position_id) as candidates_count
      FROM positions p
      JOIN elections e ON p.election_id = e.election_id
      ORDER BY e.election_name ASC, p.position_name ASC
    `;

    const positions = await DBService.read(sql, []);

    return {
      status: "success",
      count: positions.length,
      data: positions
    };
  }

  static async update(position_id, position_name, max_vote_allowed) {
    if (!position_id || !position_name) {
      throw new Error("position_id and position_name are required");
    }

    // Check if position exists
    const positionExists = await DBService.read(
      `SELECT position_id, election_id FROM positions WHERE position_id = ?`,
      [position_id]
    );

    if (positionExists.length === 0) {
      throw new Error("Position not found");
    }

    // Check if another position with same name exists in same election
    const duplicateCheck = await DBService.read(
      `SELECT position_id FROM positions WHERE election_id = ? AND position_name = ? AND position_id != ?`,
      [positionExists[0].election_id, position_name, position_id]
    );

    if (duplicateCheck.length > 0) {
      throw new Error(`Another position with name "${position_name}" already exists in this election.`);
    }

    const sql = `
      UPDATE positions 
      SET position_name = ?, max_vote_allowed = ?
      WHERE position_id = ?
    `;

    await DBService.write(sql, [
      position_name,
      max_vote_allowed,
      position_id
    ]);

    return {
      status: "success",
      message: "Position updated successfully",
      data: {
        position_id,
        position_name,
        max_vote_allowed
      }
    };
  }

  static async delete(position_id) {
    if (!position_id) {
      throw new Error("Position ID is required");
    }

    // Check if position exists
    const positionExists = await DBService.read(
      `SELECT position_id FROM positions WHERE position_id = ?`,
      [position_id]
    );

    if (positionExists.length === 0) {
      throw new Error("Position not found");
    }

    // Check if position has candidates
    const hasCandidates = await DBService.read(
      `SELECT candidate_id FROM candidates WHERE position_id = ? LIMIT 1`,
      [position_id]
    );

    if (hasCandidates.length > 0) {
      throw new Error("Cannot delete position because it has existing candidates. Delete the candidates first.");
    }

    await DBService.write(
      `DELETE FROM positions WHERE position_id = ?`,
      [position_id]
    );

    return {
      status: "success",
      message: "Position deleted successfully"
    };
  }

  static async selectTemplate(election_type_id) {
    if (!election_type_id) {
      throw new Error("Election type ID is required");
    }

    const templates = await DBService.read(
      `SELECT position_name, max_vote_allowed
       FROM position_templates
       WHERE election_type_id = ?`,
      [election_type_id]
    );

    return {
      status: "success",
      count: templates.length,
      data: templates
    };
  }

  static async bulkCreate(election_id, positions) {
    if (!election_id || !positions || !Array.isArray(positions) || positions.length === 0) {
      throw new Error("Valid election_id and positions array are required");
    }

    // Check if election exists
    const electionExists = await DBService.read(
      `SELECT election_id FROM elections WHERE election_id = ?`,
      [election_id]
    );

    if (electionExists.length === 0) {
      throw new Error("Election with this ID does not exist.");
    }

    const results = [];
    const errors = [];

    for (const pos of positions) {
      try {
        const { position_name, max_vote_allowed = 1 } = pos;
        
        if (!position_name) {
          errors.push({ position_name: "missing", error: "Position name is required" });
          continue;
        }

        // Check if position already exists
        const positionExists = await DBService.read(
          `SELECT position_id FROM positions WHERE election_id = ? AND position_name = ?`,
          [election_id, position_name]
        );

        if (positionExists.length > 0) {
          errors.push({ position_name, error: "Position already exists in this election" });
          continue;
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

        results.push({
          position_id: result.insertId,
          election_id,
          position_name,
          max_vote_allowed
        });
      } catch (error) {
        errors.push({ position_name: pos.position_name || "unknown", error: error.message });
      }
    }

    return {
      status: "success",
      message: `Created ${results.length} positions, ${errors.length} failed`,
      data: {
        created: results,
        failed: errors
      }
    };
  }
}

module.exports = PositionService;