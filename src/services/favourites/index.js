const express = require('express'),
    FavouritesModel = require('./model'),
    mongoose = require('mongoose')

//MAIN
const favouritesRoute = express.Router()

//METHODS

//POST
favouritesRoute
    .route('/:userId')
    .post(async (req, res, next) => {
        const userId = req.params.userId
        let body = {user: new mongoose.Types.ObjectId(userId), ...req.body}
        try {
            const newFavourite = await FavouritesModel(body),
                { _id } = await newFavourite.save()
            res.send(newFavourite)
        } catch (error) {
            console.log(error)
            next(error)
        }
    })

//GET
favouritesRoute
    .route('/:userId')
    .get(async (req, res, next) => {
        const userId = req.params.userId
        let favourites
        try {
            if (req.query) {
                favourites = await FavouritesModel.find(req.query).populate('user')
            } else {
                favourites = await FavouritesModel.find().populate('user')
            }
            res.send(favourites)
        } catch (error) {
            console.log(error)
            next(error)
        }
    })

//GET BY ID
favouritesRoute
    .route('/:favouritesId')
    .get(async (req, res, next) => {
        const favouritesId = req.params.favouritesId
        try {
            const favourites = await FavouritesModel.findById(favouritesId).populate('user')
            res.send(favourites)
        } catch (error) {
            console.log(error)
            next(error)
        }
    })

//PUT
favouritesRoute
    .route('/:favouritesId')
    .put(async (req, res, next) => {
        const favouritesId = req.params.favouritesId
        let body = req.body
        try {
            const editedFavourites = await FavouritesModel.findByIdAndUpdate(favouritesId, body, { runValidators: true, new: true })
            res.send(`Favourites with ID : ${favouritesId} has been edited to : ${editedFavourites}`)
        } catch (error) {
            console.log(error)
            next(error)
        }
    })

//DELETE
favouritesRoute
    .route('/:favouritesId')
    .delete(async (req, res, next) => {
        const favouritesId = req.params.favouritesId
        try {
            const deletedFavourites = await FavouritesModel.findByIdAndRemove(favouritesId)
            res.send(`Favourites with ID : ${favouritesId} has been deleted`)
        } catch (error) {
            console.log(error)
            next(error)
        }
    })

module.exports = favouritesRoute