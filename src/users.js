const NODE_ENV = process.env.NODE_ENV || "development";
const db = require("knex")(require("../knexfile")[NODE_ENV]);

const USERS_TABLE = "users";

async function getUser(id) {
    return db(USERS_TABLE).where({ id }).first();
}

async function createUser(user) {
    return db(USERS_TABLE).insert(user);
}

async function getOrCreateUser({ sub: id, name, email, hd: org }) {
    let user = await getUser(id);
    if (!user) {
        user = { id, name, email, org };
        await createUser(user);
    }

    return user;
}

module.exports = {
    getUser,
    createUser,
    getOrCreateUser
}