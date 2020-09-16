require('dotenv').config()
const router = require('express').Router()
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')


//User Model

const User =require('../models/User')

router.get('/', auth, async (req, res) =>{
    try {
        const user = await User.findById(req.user.id).select("-password")
        res.json(user)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error') 
        
    }
})

router.post('/',
[
    check('email', 'Please provide an email').isEmail(),
    check('password', 'Password at least 6 character long').exists()

  ],
async (req,res)=>{
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() })
    }
    const { email, password } = req.body

    try {
        let user = await User.findOne({email})
        if (!user) {
            return res.status(400).json({msg:'Invalid Credential'})
        }
        const match = await bcrypt.compare(password, user.password)
        if (!match) {
            return res.status(400).json({msg:'Invalid Credential'})
        }

        const payload ={
            user:{
                id:user.id
            }
        }
        jwt.sign(payload, process.env.SECRET, {
            expiresIn:3600
        },(err, token) =>{
            if (err) throw err
            res.send({token})
        })
        
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
        
    }
})



module.exports = router