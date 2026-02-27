const DBService = require('./dbService');
const bcrypt = require('bcrypt');
class VoterService {
    static async create(fullname, email, password) {
        if(!fullname || !email || !password) {
            throw new Error('All fields are required.');
        }

        let sql = `SELECT * FROM voters WHERE email = ?`;
        const exist = await DBService.read(sql, [email]);

        if(exist.length > 0) {
            throw new Error('This email is already reagistred.');
        }

        const saltRounds = 10;
        const hashedPwd = await bcrypt.hash(password, saltRounds);

        let inputs = `INSERT INTO voters (full_name, email, password_hash)
                VALUES (?, ?, ?)`;
        await DBService.write(inputs, [fullname, email, hashedPwd]);

        return {message: "Voter Registered Successfully"};
    }
}

module.exports = VoterService;