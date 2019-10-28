const GuestsService = {
    getAllGuests(knex) {
        return knex.select('*').from('unity_guests')
    },
    insertGuest(knex, newGuest) {
        return knex
            .insert(newGuest)
            .into('unity_guests')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
        return knex
            .from('unity_guests')
            .select('*')
            .where('id', id)
            .first()
    },
    deleteGuest(knex, id) {
        return knex
            .from('unity_guests')
            .where({id})
            .delete()
    },
    updateGuest(knex, id, newGuestFields) {
        return knex
            .from('unity_guests')
            .where({id})
            .update(newGuestFields)
    }
};

module.exports = GuestsService;