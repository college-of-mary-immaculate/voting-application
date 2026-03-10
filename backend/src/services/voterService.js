const DBService = require("./dbService");
const bcrypt = require("bcrypt");
class VoterService {
  static async create(fullname, email, password) {
    if (!fullname || !email || !password) {
      throw new Error("All fields are required.");
    }

    let sql = `SELECT * FROM voters WHERE email = ?`;
    const exist = await DBService.read(sql, [email]);

    if (exist.length > 0) {
      throw new Error("This email is already reagistred.");
    }

    const saltRounds = 10;
    const hashedPwd = await bcrypt.hash(password, saltRounds);

    let inputs = `INSERT INTO voters (full_name, email, password_hash)
                VALUES (?, ?, ?)`;
    await DBService.write(inputs, [fullname, email, hashedPwd]);

    return { message: "Voter Registered Successfully" };
  }
  static async login(email, password) {
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }
    let sql = `SELECT * FROM voters WHERE email = ?`;
    const user = await DBService.read(sql, [email]);

    if (user.length === 0) {
      throw new Error("Invalid email or password.");
    }

    const voter = user[0];
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
        fullname: voter.fullname,
      },
    };
  }
  // inadd ko t
  static async getAll() {
    const sql = `
        SELECT 
        voter_id,
        full_name,
        email,
        has_voted,
        created_at
        FROM voters
        ORDER BY created_at DESC
    `;

    const voters = await DBService.read(sql, []);

    if (voters.length === 0) {
      throw new Error("There's no voters available");
    }
    return {
      status: "success",
      count: voters.length,
      data: voters,
    };
  }

  static async castVote(voter_id, election_id, candidates_ids) {
    if (!voter_id || !election_id || candidates_ids.length === 0) {
      throw new Error("Voting information missing fields.");
    }

    const voter = await DBService.read(
      `SELECT voter_id, has_voted FROM voters WHERE voter_id = ?`,
      [voter_id],
    );
    if (voter.length === 0) {
      throw new Error("Voter not found");
    }

    const electionSql = `SELECT election_id FROM elections WHERE election_id = ? AND status = 'Ongoing'`;
    const election = await DBService.read(electionSql, [election_id]);

    if (election.length === 0) {
      throw new Error("Election is not active.");
    }

    const isVoteExist = await DBService.read(
      `SELECT vote_id FROM votes WHERE voter_id = ? AND election_id = ?`,
      [voter_id, election_id],
    );

    if (isVoteExist.length > 0) {
      throw new Error("You already vote in this election");
    }

    const placeholders = candidates_ids.map(() => "?").join(",");
    const candidates = await DBService.read(
      `SELECT c.canditate_id, p.position, p.max_vote_allowed
        FROM candididates c
        JOIN positions p ON c.position_id = p.position_id
        WHERE c.candidate_id = ${placeholders} AND p.election_id = ?`,
      [...candidates_ids, election_id],
    );

    if (candidates.length != candidates_ids.length) {
      throw new Error("Invalid candidate selection");
    }

    const positionCount = {};
    for (const c of candidates) {
      if (!positionCount[c.position_id]) {
        positionCount[c.position_id] = { count: 0, max: c.max_vote_allowed };
      }
      positionCount[c.position_id].count += 1;

      if (positionCount[position_id].count > positionCount[position_id].max) {
        throw new Error(
          `You can only vote ${positionCount[c.position_id].max} candidate(s) for this position.`,
        );
      }

      for (const ci of candidates_ids) {
        await DBService.write(
          `INSERT INTO votes (voter_id, candidate_id, election_id) VALUES (?, ?, ?)`,
          [voter_id, ci, election_id],
        );
      }
      await DBService.write(
        `UPDATE voters SET has_voted = TRUE WHERE voter_id = ?`,
        [voter_id],
      );
      return {
        status: "success",
        message: "Vote successfully cast.",
      };
    }
  }
}

module.exports = VoterService;
