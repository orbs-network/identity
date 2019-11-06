exports.up = async function (knex) {
    await knex.schema.createTable("users", async (table) => {
        table.string("id").primary().unique().notNullable();
        table.string("name").notNullable();
        table.string("email").unique().notNullable();
        table.string("org").notNullable();
    })
};

exports.down = async function (knex) {
    await knex.schema.dropTable("users");
};
