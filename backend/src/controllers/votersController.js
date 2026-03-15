const VoterService = require("../services/voterService");

class VoterController {

    // inadd ko to
    static async getAll(req, res) {
        const result = await VoterService.getAll();
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
        const result = await VoterService.update(req.params.id, full_name, email, password);
        res.json(result);
    }

    static async delete(req, res) {
        const result = await VoterService.delete(req.params.id);
        res.json(result);
    }
}

module.exports = VoterController;
