const {masterPool, slavePool} = require('../config/database');

class DBService {
    static async write(sql, params) {
        const [result] = await masterPool.execute(sql, params);
        return result;
    }
    
    static async read(sql, params) {
        const [result] = await slavePool.execute(sql, params);
        return result;
    }
}


module.exports = DBService;