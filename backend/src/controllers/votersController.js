const VoterService = require('../services/voterService');
const tokenGenerator = require('../utils/tokenGenerator');

class VoterController {
    static async register(req, res) {
        const { fullname, email, password } = req.body;
        const result = await VoterService.create(fullname, email, password);
        res.status(201).json(result);
    }
    static async login(req, res) {
        const { email, password } = req.body;
        const result = await VoterService.login(email, password);

        const token = tokenGenerator({id: result.data.id, email: email});
        res.status(200).json({
            result: result,
            token: token
        });
    }
    // inadd ko to
    static async getAll(req, res) {
    try {
        const result = await VoterService.getAll();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch voters' });
    }
    }
}

module.exports = VoterController;