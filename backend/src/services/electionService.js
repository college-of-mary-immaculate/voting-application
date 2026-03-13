const DBService = require("./dbService");
const PositionService = require("./positionService");
const { formatForMySQL } = require("../utils/dateFormatter");
const { generatePlaceholders, flattenValues } = require("../utils/dbHelper");

class ElectionService {
  static async create(election_type_id, election_name, start_at, end_at) {
    if (!election_type_id || !election_name || !start_at || !end_at) {
      throw new Error("All fields are required: type, name, start_at, end_at");
    }

    const startDate = formatForMySQL(start_at);
    const endDate = formatForMySQL(end_at);

    if (new Date(startDate) >= new Date(endDate)) {
      throw new Error("`start_at` must be earlier than `end_at`");
    }

    const existing = await DBService.read(
      `SELECT * FROM elections WHERE election_type_id = ? AND election_name = ?`,
      [election_type_id, election_name]
    );

    if (existing.length > 0) {
      throw new Error(
        "An election with this name already exists for the selected type."
      );
    }

    const now = new Date();
    let status = "Upcoming";
    const startTime = new Date(startDate);
    const endTime = new Date(endDate);

    if (now >= startTime && now <= endTime) status = "Ongoing";
    else if (now > endTime) status = "Closed";

    const sql = `
      INSERT INTO elections
      (election_type_id, election_name, start_at, end_at, status)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await DBService.write(sql, [
      election_type_id,
      election_name,
      startDate,
      endDate,
      status,
    ]);

    const insertedId = result.insertId || result.lastInsertRowid;

    const templates = await PositionService.selectTemplate(election_type_id);

    if (templates.length > 0) {
      const values = templates.map((t) => [
        insertedId,
        t.position_name,
        t.max_vote_allowed,
      ]);

      const placeholders = generatePlaceholders(values);
      const flattened = flattenValues(values);

      await DBService.write(
        `INSERT INTO positions (election_id, position_name, max_vote_allowed)
         VALUES ${placeholders}`,
        flattened
      );
    }

    const [created] = await DBService.read(
      `SELECT 
         e.election_id,
         e.election_name,
         e.start_at,
         e.end_at,
         e.status,
         t.type_name
       FROM elections e
       JOIN election_types t ON e.election_type_id = t.type_id
       WHERE e.election_id = ?`,
      [insertedId]
    );

    return {
      status: "success",
      message: "Election created successfully",
      data: created || { election_id: insertedId },
    };
  }

  static async getAll() {
    // ito nadagdag – added election_type_id to the SELECT list
    const elections = await DBService.read(
      `SELECT 
         e.election_id,
         e.election_type_id,
         e.election_name,
         e.start_at,
         e.end_at,
         e.status,
         t.type_name
       FROM elections e
       JOIN election_types t ON e.election_type_id = t.type_id
       ORDER BY e.start_at ASC`
    );

    if (elections.length === 0) {
      return { status: "success", message: "No elections found", data: [] };
    }

    const now = new Date();

    const formattedElections = elections.map((e) => {
      const start = new Date(e.start_at);
      const end = new Date(e.end_at);

      let timeLeft = null;
      let isActive = false;

      if (now < start) {
        timeLeft = Math.floor((start - now) / 1000);
      } else if (now >= start && now <= end) {
        isActive = true;
        timeLeft = Math.floor((end - now) / 1000);
      }

      const status =
        now > end ? "Closed" : isActive ? "Ongoing" : e.status;

      return {
        ...e,
        start_at: formatForMySQL(e.start_at),
        end_at: formatForMySQL(e.end_at),
        server_time: formatForMySQL(now),
        is_active: isActive,
        seconds_until_start: now < start ? timeLeft : 0,
        seconds_left: isActive ? timeLeft : 0,
        status,
      };
    });

    return { status: "success", data: formattedElections };
  }

  //update
  static async update(election_id, election_type_id, election_name, start_at, end_at) {
    if (!election_id) {
      throw new Error("election_id is required");
    }

    if (!election_type_id || !election_name || !start_at || !end_at) {
      throw new Error("All fields are required: election_type_id, election_name, start_at, end_at");
    }

    const startDate = formatForMySQL(start_at);
    const endDate = formatForMySQL(end_at);

    if (new Date(startDate) >= new Date(endDate)) {
      throw new Error("start_at must be earlier than end_at");
    }

    // check if election exists
    const exists = await DBService.read(
      `SELECT election_id FROM elections WHERE election_id = ?`,
      [election_id]
    );

    if (exists.length === 0) {
      throw new Error(`Election with ID ${election_id} not found`);
    }

    // prevent name conflict
    const duplicate = await DBService.read(
      `SELECT election_id FROM elections 
       WHERE election_type_id = ? AND election_name = ? AND election_id != ?`,
      [election_type_id, election_name, election_id]
    );

    if (duplicate.length > 0) {
      throw new Error("Another election with this name already exists for the selected type.");
    }

    // compute new status
    const now = new Date();
    let status = "Upcoming";
    if (now >= new Date(startDate) && now <= new Date(endDate)) {
      status = "Ongoing";
    } else if (now > new Date(endDate)) {
      status = "Closed";
    }

    const sql = `
      UPDATE elections
      SET
        election_type_id = ?,
        election_name    = ?,
        start_at         = ?,
        end_at           = ?,
        status           = ?
      WHERE election_id = ?
    `;

    await DBService.write(sql, [
      election_type_id,
      election_name,
      startDate,
      endDate,
      status,
      election_id
    ]);

    return {
      status: "success",
      message: "Election updated successfully",
      data: {
        election_id,
        election_type_id,
        election_name,
        start_at: startDate,
        end_at: endDate,
        status
      }
    };
  }

  //delete
  static async delete(election_id) {
    if (!election_id) {
      throw new Error("Election ID is required");
    }

    const exists = await DBService.read(
      `SELECT election_id FROM elections WHERE election_id = ?`,
      [election_id]
    );

    if (exists.length === 0) {
      throw new Error("Election not found");
    }

    await DBService.write(
      `DELETE FROM elections WHERE election_id = ?`,
      [election_id]
    );

    return {
      status: "success",
      message: "Election deleted successfully"
    };
  }
}

module.exports = ElectionService;