const mongoose = require('mongoose'),
    { Schema } = require('mongoose')

const PlaylistModel = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'users' },
    playlist: [{type: Object}]
}, { timestamps: true })

module.exports = mongoose.model('playlists', PlaylistModel)