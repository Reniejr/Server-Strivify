const express = require('express')

//ROUTES
const usersRoute = require('./users')
const playlistRoute = require('./playlists')
const favouritesRoute = require('./favourites')

//MAIN
const mainRoute = express.Router()

//ENDPOINTS
mainRoute.use('/user', usersRoute)
mainRoute.use('/playlist', playlistRoute)
mainRoute.use('/favourites', favouritesRoute)

module.exports = mainRoute