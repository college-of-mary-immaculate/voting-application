const ElectionService = require("../services/electionService");

class ElectionsController {

    static async createElection(req, res) {
        const { name, type, date } = req.body;
        const result = await ElectionService.create(name, type, date);
        res.status(201).json(result);
    }

    static async getElections() {
        const elections = await ElectionService.get();
        res.status(200).json({
            status: 'success',
            data: elections
        })
    }
}

module.exports = ElectionsController;
