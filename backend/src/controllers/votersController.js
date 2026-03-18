const VoterService = require("../services/voterService");
const AccountService = require("../services/accountService");
const { formatForMySQL, toPHTime } = require("../utils/dateFormatter");

class VoterController {

    // ADD THIS METHOD
    static async register(req, res) {
        try {
            const { fullname, email, password } = req.body;
            const result = await AccountService.create(fullname, email, password);
            res.status(201).json(result);
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ status: "error", message: error.message });
        }
    }

    // ADD THIS METHOD
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await AccountService.login(email, password);
            res.status(200).json(result);
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ status: "error", message: error.message });
        }
    }

    // inadd ko to
    static async getAll(req, res) {
        const { election_id } = req.query;
        const electionId = election_id ? Number(election_id) : null;
        const result = await VoterService.getAll(electionId);
        res.status(200).json(result);
    }

    static async vote(req, res) {
        const { election_id, votes } = req.body;
        const voter_id = req.user.id;
        const result = await VoterService.castVote(
            voter_id,
            election_id,
            votes
        );

        const io = req.app.get("io");
        io.to(`election_${election_id}`).emit("voteUpdate", {
            electionId: election_id,
            voterId: voter_id,
            timestamp: toPHTime(new Date())
        });

        res.json(result);
    }

    static async getById(req, res) {
        const result = await VoterService.getById(req.params.id);
        if (!result) {
            return res.status(404).json({ status: "error", error: "Voter not found" });
        }
        res.json({ status: "success", data: result });
    }

    static async update(req, res) {
        const { full_name, email, password } = req.body;
        const result = await VoterService.update(req.params.id, { full_name, email, password });
        res.json(result);
    }

    static async delete(req, res) {
        const result = await VoterService.delete(req.params.id);
        res.json(result);
    }
}

module.exports = VoterController;