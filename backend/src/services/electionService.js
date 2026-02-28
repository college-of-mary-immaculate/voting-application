const DBService = require('./dbService');

class ElectionService {

    static async create(election_type_id, election_name, election_date) {

        if (!election_type_id || !election_name || !election_date) {
            throw new Error('All fields are required');
        }

        const isExist = await DBService.read(
            `SELECT * FROM elections 
             WHERE election_type_id = ? 
             AND election_name = ?`,
            [election_type_id, election_name]
        );

        if (isExist.length > 0) {
            throw new Error('Election already exists for this type.');
        }

        const today = new Date().toISOString().split('T')[0];

        let status = 'Upcoming';

        if (today === election_date) {
            status = 'Ongoing';
        } else if (today > election_date) {
            status = 'Closed';
        }

        const sql = `
            INSERT INTO elections 
            (election_type_id, election_name, election_date, status) 
            VALUES (?, ?, ?, ?)
        `;

        await DBService.write(sql, [
            election_type_id,
            election_name,
            election_date,
            status
        ]);

        return {
            status: 'success',
            message: 'Election created successfully'
        };
    }

    static async get() {

        const elections = await DBService.read(
            `SELECT 
                e.election_id,
                e.election_name,
                e.election_date,
                e.status,
                t.type_name
             FROM elections e
             JOIN election_types t 
             ON e.election_type_id = t.type_id
             ORDER BY e.election_date ASC`,
            []
        );

        if (elections.length < 1) {
            throw new Error('No elections available.');
        }

        return elections;
    }
}

module.exports = ElectionService;