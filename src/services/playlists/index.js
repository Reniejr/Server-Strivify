const express = require('express'),
    PlaylistModel = require('./model'),
    UsersModel = require('../users/model'),
    mongoose = require('mongoose'),
    usersRoute = require('../users')

//MAIN
const playlistRoute = express.Router()

//METHODS
//POST
playlistRoute
    .route('/:userId')
    .post(async (req, res, next) => {
        const userId = req.params.userId
        //GET USER
        let user = await UsersModel.findById(userId)
        try {
            //CREATE PLAYLIST
            let body = {user: new mongoose.Types.ObjectId(userId), ...req.body }
            const newPlaylist = await new PlaylistModel(body),
                { _id } = await newPlaylist.save()
            res.send(newPlaylist)
        } catch (error) {
            console.log(error)
            next(error)
        }
    })

//GET
playlistRoute
    .route('/')
    .get(async (req, res, next) => {
        let playlists
        try {
            if (req.query && req.query.userId) {
                const userId = req.query.userId
                playlists = await PlaylistModel.find({user : userId}).populate('user')
            } else {
                playlists = await PlaylistModel.find().populate('user')
            }
            res.send(playlists)
        } catch (error) {
            console.log(error)
            next(error)
        }
    })

//GET BY ID
playlistRoute
    .route('/:playlistId')
    .get(async (req, res, next) => {
        const playlistId = req.params.playlistId
        try {
            const playlist = await PlaylistModel.findById(playlistId).populate('user')
            res.send(playlist)
        } catch (error) {
            console.log(error)
            next(error)
        }
    })

//PUT
playlistRoute
    .route('/:playlistId')
    .put(async (req, res, next) => {
        const playlistId = req.params.playlistId
        let body = req.body
        try {
            const editPlaylist = await PlaylistModel.findByIdAndUpdate(playlistId, body, { runValidators: true, new: true })
            res.send(`Playlist with ID : ${playlistId} has been edited to : ${editPlaylist}`)
        } catch (error) {
            console.log(error)
            next(error)
        }
})

//DELETE
playlistRoute
    .route('/:playlistId')
    .delete(async (req, res, next) => {
        const playlistId = req.params.playlistId
        try {
            const deletedPlaylist = await PlaylistModel.findByIdAndRemove(playlistId)
            res.send(`Playlist with ID : ${playlistId} has been deleted`)
        } catch (error) {
            console.log(error)
            next(error)
        }
})
module.exports = playlistRoute