const DBService = require("./dbService");

class CandidatesService {
  static async create(position_id, full_name, party_name, photo_url, status) {
    if (!position_id || !full_name) {
      throw new Error("Missing required fields: position_id and full_name");
    }
    const positionExists = await DBService.read(
      `SELECT position_id FROM positions WHERE position_id = ?`,
      [position_id]
    );
    if (positionExists.length === 0) {
      throw new Error("Invalid position_id: The specified position does not exist.");
    }

    const existing = await DBService.read(
      `SELECT candidate_id FROM candidates WHERE position_id = ? AND full_name = ?`,
      [position_id, full_name]
    );
    if (existing.length > 0) {
      throw new Error("Candidate is already registered for this position.");
    }
    const sql = `INSERT INTO candidates (position_id, full_name, party_name, photo_url, status) VALUES (?, ?, ?, ?, ?)`;
    const result = await DBService.write(sql, [
      position_id,
      full_name,
      party_name,
      photo_url || null,
      status || "Active"
    ]);

    const insertedId = result.insertId || result.lastInsertRowid;
    return {
      status: "success",
      message: "Candidate created successfully",
      data: {
        candidate_id: insertedId,
        position_id,
        full_name,
        party_name,
        photo_url,
        status: status || "Active"
      }
    };
  }

  static async getAll() {
    const sql = `
      SELECT 
        c.candidate_id, 
        c.full_name, 
        c.party_name, 
        c.photo_url, 
        c.status,
        p.position_name,
        e.election_name
      FROM candidates c
      JOIN positions p ON c.position_id = p.position_id
      JOIN elections e ON p.election_id = e.election_id
      ORDER BY e.election_name ASC, p.position_name ASC, c.full_name ASC
    `;
    
    const candidates = await DBService.read(sql, []);

    return {
      status: "success",
      count: candidates.length,
      data: candidates
    };
  }
}

module.exports = CandidatesService;