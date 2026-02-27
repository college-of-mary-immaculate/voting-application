const VoterService = require('../services/voterService');

class VoterController {
    static async register(req, res) {
        try {
            const { fullname, email, password } = req.body;
            const result = await VoterService.create(fullname, email, password);
            res.status(201).json(result);
        }
        catch (err) {
            console.error(`Voter registration error ${err.message}`);
            res.status(400).json({ error: err.message });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await VoterService.login(email, password);
            res.status(200).json(result);
        }
        catch (err) {
            console.error(`Voter login error ${err.message}`);
            res.status(400).json({ error: err.message });
        }
    }
}

module.exports = VoterController;