const DBService = require("./dbService");

class ElectionService {
  static async create(election_type_id, election_name, start_at, end_at) {
    if (!election_type_id || !election_name || !start_at || !end_at) {
      throw new Error("All fields are required: type, name, start_at, end_at");
    }

    if (new Date(start_at) >= new Date(end_at)) {
      throw new Error("start_at must be earlier than end_at");
    }

    const existing = await DBService.read(
      `SELECT * FROM elections 
       WHERE election_type_id = ? 
       AND election_name = ?`,
      [election_type_id, election_name],
    );

    if (existing.length > 0) {
      throw new Error(
        "An election with this name already exists for the selected type.",
      );
    }

    const now = new Date();
    let status = "Upcoming";

    const startDate = new Date(start_at);
    const endDate = new Date(end_at);

    if (now >= startDate && now <= endDate) {
      status = "Ongoing";
    } else if (now > endDate) {
      status = "Closed";
    }

    const sql = `
      INSERT INTO elections 
      (election_type_id, election_name, start_at, end_at, status) 
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await DBService.write(sql, [
      election_type_id,
      election_name,
      start_at,
      end_at,
      status,
    ]);

    const insertedId = result.insertId || result.lastInsertRowid;

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
      [insertedId],
    );

    return {
      status: "success",
      message: "Election created successfully",
      data: created || { election_id: insertedId },
    };
  }

  static async getAll() {
    const elections = await DBService.read(
      `SELECT 
       e.election_id,
       e.election_name,
       e.start_at,
       e.end_at,
       e.status,
       t.type_name
     FROM elections e
     JOIN election_types t ON e.election_type_id = t.type_id
     ORDER BY e.start_at ASC`,
      [],
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

      return {
        ...e,
        server_time: now.toISOString(),
        is_active: isActive,
        seconds_until_start: now < start ? timeLeft : 0,
        seconds_left: isActive ? timeLeft : 0,
        status: isActive ? "Ongoing" : e.status,
      };
    });

    return {
      status: "success",
      data: formattedElections,
    };
  }
}

module.exports = ElectionService;
