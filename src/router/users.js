const router = require('express').Router()
const url = require('url');
const {registerUser, validateCredentials, generateJWTtoken} = require("../models/user")
const {getBusinesses, getPhotos, getReviews} = require('../models/user')
const {requireAuthentication} = require("../lib/auth")

//hard code the user
// let userId = "5ebec33e3eb6404bd7426ccd"


router.post("/users/register",async (req,res)=>{
    //extract username, password and admin status
    
    if (req.body){
        let userId = await registerUser(req.body)
        if(userId){
            res.status(200).send({
                success:`User generated with ID: ${userId}`
            })
        } else{
            res.status(400).send({
                fail:"Failed to register user: Invalid user body or DB error"
            })
        }
    }
    //let auth lib handle the encryption
    //return success/failure 
})

router.post("/login", async (req,res)=>{
    //validate user credential body first --> email, password
    const userId = await validateCredentials(req.body)

    if (userId){
        res.status(200).send({
            token: generateJWTtoken(userId)
        })
    } else{
        res.status(400).send({
            error:"Please check your email and password, and try again!"
        })
    }
})


router.get("/users/:id/businesses", requireAuthentication, async (req,res)=>{
    const result = await getBusinesses(req.params.id)
    if (result){
        res.status(200).send(result)
    }else{
        res.status(500).send({
            err:"No results to show"
        })
    }
})

router.get("/users/:id/reviews", requireAuthentication, async (req,res)=>{
    const result = await getReviews(req.params.id)
    if (result){
        res.status(200).send(result)
    }else{
        res.status(500).send({
            err:"No results to show"
        })
    }
})

router.get("/users/:id/photos",requireAuthentication, async (req,res)=>{
    const result = await getPhotos(req.params.id)
    if (result){
        res.status(200).send(result)
    }else{
        res.status(500).send({
            err:"No results to show"
        })
    }
})

module.exports = router