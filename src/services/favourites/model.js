const mongoose = require('mongoose'),
    { Schema } = require('mongoose')

const FavouritesModel = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'users' },
    favourites: [{ type: Object}]
}, { timestamps: true })

module.exports = mongoose.model('favourites', FavouritesModel)