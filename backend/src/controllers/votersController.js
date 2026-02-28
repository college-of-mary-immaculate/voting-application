const VoterService = require('../services/voterService');

class VoterController {
    static async register(req, res) {
        const { fullname, email, password } = req.body;
        const result = await VoterService.create(fullname, email, password);
        res.status(201).json(result);
    }
    static async login(req, res) {
        const { email, password } = req.body;
        const result = await VoterService.login(email, password);
        res.status(200).json(result);
    }
}

module.exports = VoterController;