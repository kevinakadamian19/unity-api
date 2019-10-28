const WeddingsService = {
    getAllWeddings(knex) {
        return knex.select('*').from('unity_weddings')
    },
    insertWedding(knex, newWedding) {
        return knex
            .insert(newWedding)
            .into('unity_weddings')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
        return knex
            .from('unity_weddings')
            .select('*')
            .where('id', id)
            .first()
    },
    deleteWedding(knex, id) {
        return knex
            .from('unity_weddings')
            .where({id})
            .delete()
    },
    updateWedding(knex, id, newWeddingFields) {
        return knex
            .from('unity_weddings')
            .where({id})
            .update(newWeddingFields)
    }
}

module.exports = WeddingsService;