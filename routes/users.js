var express = require('express');
var router = express.Router();
const User = require('../models/users');
const {body, validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const {generateAccessToken, authenticateToken} = require('../modules/jwt');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', 
    body('firstName').notEmpty().isString().escape().trim().isLength({max: 50}),
    body('lastName').notEmpty().isString().escape().trim().isLength({max: 50}),
    body('email').trim().escape().isEmail(),
    body('password').isString().escape().isLength({min: 8, max: 32}),
    async function (req, res, next) {
        try {
            const errors = validationResult(req);
            if (errors.length > 0) {
                return res.json({result: false, error: errors});
            }
            const {firstName, lastName, email, password} = req.body;
            const possibleUser = await User.findOne({email});
            if (possibleUser) {
                return res.json({result: false, error: 'Email déjà utilisée'});
            }
            const salt = await bcrypt.genSalt(saltRounds);
            const securedPassword = await bcrypt.hash(password, salt);
            const newUser = new User({firstName, lastName, email, password: securedPassword, panierList: [], bookingList: []});
            await newUser.save();
            res.json({result: true});
        } catch (error) {
            console.log(error);
            res.status(500).json({result: false, error});
        }
    }
)

router.post('/signin', 
    body('email').trim().escape().isEmail(),
    body('password').isString().escape().isLength({min: 8, max: 32}),
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (errors.length > 0) {
                return res.json({result: false, error: errors});
            }
            const {email, password} = req.body;
            const possibleUser = await User.findOne({email}).select('password email');
            if (!possibleUser) {
                return res.json({result: false, error: 'Email or password incorrect'});
            }
            const result = await bcrypt.compare(password, possibleUser.password);
            if (!result) {
                return res.json({result: false, error: 'Email or password incorrect'});
            }
            console.log(possibleUser.email);
            const token = generateAccessToken(possibleUser.email);
            res.json({result: true, token});
        } catch(error) {
            console.log(error);
            res.status(500).json({result: false, error});
        }
    }
)

router.get('/info', authenticateToken, async (req, res, next)=> {
    try {
        const possibleUser = await User.findOne({email: req.email}).select('email firstName lastName');
        if (!possibleUser) {
            return res.json({result: false, error: 'Account not found, please reconnect'});
        }
        return res.json({result: true, user: possibleUser});
    } catch (error) {

    }
})

module.exports = router;
