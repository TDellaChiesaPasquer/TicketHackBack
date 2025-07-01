const express = require('express');
const router = express.Router();
const Trip = require('../models/trips');
const {param, validationResult} = require('express-validator');

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


router.get('/:departure/:arrival/:timestamp',
    param('departure').escape().isLength({max: 100}),
    param('arrival').escape().isLength({max: 100}),
    param('timestamp').escape().isLength({max: 100}),
    async function (req, res, next) {
    try {
        const errors = validationResult(req);
        if (errors.length > 0) {
            return res.json({result: false, error: errors});
        }
        const date =new Date(req.params.timestamp * 1000)
        const today = new Date(date.getTime());
        today.setUTCHours(0,0,0,0);
        const tomorrow = new Date(date.getTime());
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

module.exports = router;