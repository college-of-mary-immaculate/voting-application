const DBService = require("./dbService");
const PositionService = require("./positionService");
const { formatForMySQL, getServerTimePH } = require("../utils/dateFormatter");
const { generatePlaceholders, flattenValues } = require("../utils/dbHelper");

class ElectionService {
  static async create(election_type_id, election_name, start_at, end_at) {
    if (!election_type_id || !election_name || !start_at || !end_at) {
      throw new Error("All fields are required: type, name, start_at, end_at");
    }

    // Validate input format from frontend (datetime-local)
    if (
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(start_at) ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(end_at)
    ) {
      throw new Error("Invalid datetime format. Expected YYYY-MM-DDTHH:mm");
    }

    // Convert to MySQL DATETIME format (YYYY-MM-DD HH:mm:ss)
    const startMysql = start_at.replace("T", " ") + ":00";
    const endMysql = end_at.replace("T", " ") + ":00";

    // Parse dates as PH time for validation
    const startDate = this.parsePHDate(startMysql);
    const endDate = this.parsePHDate(endMysql);
    const now = new Date();

    if (startDate >= endDate) {
      throw new Error("start_at must be earlier than end_at");
    }

    const existing = await DBService.read(
      `SELECT * FROM elections WHERE election_type_id = ? AND election_name = ?`,
      [election_type_id, election_name],
    );

    if (existing.length > 0) {
      throw new Error(
        "An election with this name already exists for the selected type.",
      );
    }

    let status = "Upcoming";
    if (now >= startDate && now <= endDate) status = "Ongoing";
    else if (now > endDate) status = "Closed";

    const sql = `
      INSERT INTO elections
      (election_type_id, election_name, start_at, end_at, status)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await DBService.write(sql, [
      election_type_id,
      election_name,
      startMysql,
      endMysql,
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
        flattened,
      );
    }

    const [created] = await DBService.read(
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
       WHERE e.election_id = ?`,
      [insertedId],
    );

    return {
      status: "success",
      message: "Election created successfully",
      data: created || { election_id: insertedId },
    };
  }

  static async update(
    election_id,
    election_type_id,
    election_name,
    start_at,
    end_at,
  ) {
    if (!election_id) {
      throw new Error("election_id is required");
    }

    if (!election_type_id || !election_name || !start_at || !end_at) {
      throw new Error(
        "All fields are required: election_type_id, election_name, start_at, end_at",
      );
    }

    if (
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(start_at) ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(end_at)
    ) {
      throw new Error("Invalid datetime format. Expected YYYY-MM-DDTHH:mm");
    }

    const startMysql = start_at.replace("T", " ") + ":00";
    const endMysql = end_at.replace("T", " ") + ":00";

    // Parse dates as PH time for validation
    const startDate = this.parsePHDate(startMysql);
    const endDate = this.parsePHDate(endMysql);

    if (startDate >= endDate) {
      throw new Error("start_at must be earlier than end_at");
    }

    const exists = await DBService.read(
      `SELECT election_id FROM elections WHERE election_id = ?`,
      [election_id],
    );

    if (exists.length === 0) {
      throw new Error(`Election with ID ${election_id} not found`);
    }

    const duplicate = await DBService.read(
      `SELECT election_id FROM elections 
       WHERE election_type_id = ? AND election_name = ? AND election_id != ?`,
      [election_type_id, election_name, election_id],
    );

    if (duplicate.length > 0) {
      throw new Error(
        "Another election with this name already exists for the selected type.",
      );
    }

    const now = new Date();
    let status = "Upcoming";
    if (now >= startDate && now <= endDate) {
      status = "Ongoing";
    } else if (now > endDate) {
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
      startMysql,
      endMysql,
      status,
      election_id,
    ]);

    return {
      status: "success",
      message: "Election updated successfully",
      data: {
        election_id,
        election_type_id,
        election_name,
        start_at: startMysql,
        end_at: endMysql,
        status,
      },
    };
  }

  static parsePHDate(mysqlDateTime) {
    if (!mysqlDateTime) return null;
    // mysqlDateTime format: "2026-03-19 23:10:00"
    const [datePart, timePart] = mysqlDateTime.split(" ");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);

    // Create date in PH timezone (UTC+8) by using UTC constructor with offset
    // PH is UTC+8, so we subtract 8 hours to get correct UTC timestamp
    return new Date(Date.UTC(year, month - 1, day, hour - 8, minute, second));
  }

  static async getAll() {
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
       ORDER BY e.start_at ASC`,
    );

    if (elections.length === 0) {
      return { status: "success", message: "No elections found", data: [] };
    }

    const now = new Date(); // Current UTC time

    const formattedElections = elections.map((e) => {
      // Handle if start_at/end_at are already Date objects
      let startStr, endStr;

      if (e.start_at instanceof Date) {
        // Convert Date object to MySQL string format YYYY-MM-DD HH:mm:ss
        const start = e.start_at;
        const year = start.getFullYear();
        const month = String(start.getMonth() + 1).padStart(2, "0");
        const day = String(start.getDate()).padStart(2, "0");
        const hour = String(start.getHours()).padStart(2, "0");
        const minute = String(start.getMinutes()).padStart(2, "0");
        const second = String(start.getSeconds()).padStart(2, "0");
        startStr = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

        const end = e.end_at instanceof Date ? e.end_at : new Date(e.end_at);
        const endYear = end.getFullYear();
        const endMonth = String(end.getMonth() + 1).padStart(2, "0");
        const endDay = String(end.getDate()).padStart(2, "0");
        const endHour = String(end.getHours()).padStart(2, "0");
        const endMinute = String(end.getMinutes()).padStart(2, "0");
        const endSecond = String(end.getSeconds()).padStart(2, "0");
        endStr = `${endYear}-${endMonth}-${endDay} ${endHour}:${endMinute}:${endSecond}`;
      } else {
        // Already strings
        startStr = e.start_at;
        endStr = e.end_at;
      }

      // Parse dates as PH time for correct comparison
      const start = this.parsePHDate(startStr);
      const end = this.parsePHDate(endStr);

      let timeLeft = 0;
      let isActive = false;

      if (now < start) {
        timeLeft = Math.floor((start - now) / 1000);
      } else if (now >= start && now <= end) {
        isActive = true;
        timeLeft = Math.floor((end - now) / 1000);
      }

      const status = now > end ? "Closed" : isActive ? "Ongoing" : e.status;

      return {
        election_id: e.election_id,
        election_type_id: e.election_type_id,
        election_name: e.election_name,
        type_name: e.type_name,
        // Return as string, not Date object
        start_at: startStr,
        end_at: endStr,
        server_time: getServerTimePH(),
        is_active: isActive,
        seconds_until_start: now < start ? timeLeft : 0,
        seconds_left: isActive ? timeLeft : 0,
        status,
      };
    });

    return { status: "success", data: formattedElections };
  }

  //delete
  static async delete(election_id) {
    if (!election_id) throw new Error("Election ID is required");

    const exists = await DBService.read(
      `SELECT election_id FROM elections WHERE election_id = ?`,
      [election_id],
    );
    if (exists.length === 0) throw new Error("Election not found");

    // Delete votes for candidates in this election
    await DBService.write(
      `DELETE v FROM votes v
     JOIN candidates c ON v.candidate_id = c.candidate_id
     JOIN positions p ON c.position_id = p.position_id
     WHERE p.election_id = ?`,
      [election_id],
    );

    // Delete candidates
    await DBService.write(
      `DELETE c FROM candidates c
     JOIN positions p ON c.position_id = p.position_id
     WHERE p.election_id = ?`,
      [election_id],
    );

    // Delete positions
    await DBService.write(`DELETE FROM positions WHERE election_id = ?`, [
      election_id,
    ]);

    // Finally, delete the election
    await DBService.write(`DELETE FROM elections WHERE election_id = ?`, [
      election_id,
    ]);

    return {
      status: "success",
      message: "Election deleted successfully",
    };
  }

  static async addPosition(election_id, position_name, max_vote_allowed) {
    return PositionService.create(election_id, position_name, max_vote_allowed);
  }

  static async getPositions(election_id) {
    return PositionService.getByElection(election_id);
  }

  static async getResults(election_id) {
    const sql = `
      SELECT
        p.position_id,
        p.position_name,
        c.candidate_id,
        c.full_name,
        c.ballot_number,
        COUNT(v.vote_id) AS vote_count
      FROM positions p
      JOIN candidates c
        ON p.position_id = c.position_id
      LEFT JOIN votes v
        ON c.candidate_id = v.candidate_id
      WHERE p.election_id = ?
      GROUP BY p.position_id, c.candidate_id
      ORDER BY p.position_id, c.ballot_number
    `;

    const rows = await DBService.read(sql, [election_id]);

    const map = {};

    rows.forEach((r) => {
      if (!map[r.position_id]) {
        map[r.position_id] = {
          position_id: r.position_id,
          position_name: r.position_name,
          candidates: [],
        };
      }

      map[r.position_id].candidates.push({
        candidate_id: r.candidate_id,
        full_name: r.full_name,
        ballot_number: r.ballot_number,
        votes: r.vote_count,
      });
    });

    return {
      status: "success",
      election_id,
      results: Object.values(map),
    };
  }

  static async getActiveElectionForVoter(voter_id) {
    const sql = `
    SELECT e.*
    FROM elections e
    JOIN voter_elections ve 
      ON ve.election_id = e.election_id
    WHERE ve.voter_id = ?
      AND e.status = 'Ongoing'
    LIMIT 1
  `;

    const rows = await DBService.read(sql, [voter_id]);

    if (!rows || rows.length === 0) {
      return null;
    }

    const election = rows[0];

    // Parse dates for comparison
    let startStr, endStr;

    if (election.start_at instanceof Date) {
      const start = election.start_at;
      startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")} ${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}:${String(start.getSeconds()).padStart(2, "0")}`;

      const end =
        election.end_at instanceof Date
          ? election.end_at
          : new Date(election.end_at);
      endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")} ${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}:${String(end.getSeconds()).padStart(2, "0")}`;
    } else {
      startStr = election.start_at;
      endStr = election.end_at;
    }

    // Parse dates as PH time
    const start = this.parsePHDate(startStr);
    const end = this.parsePHDate(endStr);
    const now = new Date();

    let timeLeft = 0;
    let isActive = false;

    if (now >= start && now <= end) {
      isActive = true;
      timeLeft = Math.floor((end - now) / 1000);
    }

    return {
      election_id: election.election_id,
      election_type_id: election.election_type_id,
      election_name: election.election_name,
      start_at: startStr,
      end_at: endStr,
      status: election.status,
      created_at: election.created_at,
      server_time: getServerTimePH(),
      is_active: isActive,
      seconds_left: isActive ? timeLeft : 0,
    };
  }
}

module.exports = ElectionService;
