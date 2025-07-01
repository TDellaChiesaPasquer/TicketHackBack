const express = require('express');
const router = express.Router();
const Trip = require('../models/trips');
const User = require('../models/users');
const {param, body, validationResult} = require('express-validator');
const {authenticateToken} = require('../modules/jwt');

router.get('/', async (req, res) => {
    try {
        const tripList = await Trip.find({});
        return res.json({
            result: true,
            trips: tripList
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({result: false, error});
    }
})


router.get('/:departure/:arrival/:date',
    param('departure').escape().isLength({max: 100}),
    param('arrival').escape().isLength({max: 100}),
    param('date').escape().isLength({max: 10}),
    async function (req, res, next) {
        try {
            const errors = validationResult(req);
            if (errors.length > 0) {
                return res.json({result: false, error: errors});
            }
            const dateArray = req.params.date.split("-");
            const date = new Date( dateArray[0], dateArray[1] - 1, dateArray[2]);
            console.log(date);
            const today = new Date(date.getTime() + 2*60*60*1000);
            today.setUTCHours(0,0,0,0);
            const tomorrow = new Date(date.getTime()+2*60*60*1000);
            tomorrow.setUTCHours(23,59,59,999);
            console.log(date, today, tomorrow);
            const tripList = await Trip.find({
                departure: req.params.departure,
                arrival: req.params.arrival,
                date: {$gte: today, $lte: tomorrow}
            })
            res.json({result: true, trips: tripList});
        } catch (error) {
            console.log(error);
            res.status(500).json({result: false, error});
        }
})

router.put('/cart', authenticateToken,
    body('tripId').notEmpty().isString().isLength({max: 500}),
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (errors.length > 0) {
                return res.json({result: false, error: errors});
            }
            const tripId = req.body.tripId;
            const possibleTrip = await Trip.findOne({_id: tripId});
            if (!possibleTrip) {
                return res.json({result: false, error: "The trip doesn't exist"});
            }
            const {bookingList, panierList} = await User.findOne({email: req.email}).select('bookingList panierList');
            if (bookingList && bookingList.some(element => element.toString() === tripId)) {
                return res.json({result: false, error: 'The trip has already been booked'});
            }
            if (panierList && panierList.some(element => element.toString() === tripId)) {
                return res.json({result: false, error: 'The trip has already been put in the cart'});
            }
            const test = await User.findOneAndUpdate({email: req.email}, {$push: {panierList: tripId}});
            res.json({test: test});
        } catch (error) {
            console.log(error);
            res.status(500).json({result: false, error});
        }
})

module.exports = router;