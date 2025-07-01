const express = require('express');
const router = express.Router();
const Trip = require('../models/trips');

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


module.exports = router;