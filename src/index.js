const express = require('express')
const bodyParser = require('body-parser')
const businessRouter = require('./router/businesses.js')
const reviewRouter = require('./router/reviews')
const photoRouter =  require('./router/photos')
const userRouter =  require('./router/users')
const {connectToDB}  = require('./lib/db')
const {getDBReference}= require('./lib/db')
var ObjectID = require('mongodb').ObjectID;
const { applyRateLimit } = require('./lib/ratelimiting');

app = express()
app.use(bodyParser.json())


const port = process.env.PORT || 3000

app.use(applyRateLimit)
app.use(businessRouter)
app.use(userRouter)
app.use(photoRouter)
app.use(reviewRouter)

/* These endpoints are for debugging purposes only
*/
app.get("/users",async (req,res)=>{
    const db = getDBReference()
    const collection = db.collection('users')
    const result = await collection.find({}).toArray()
    res.send(result)
})

app.get("/photos",async (req,res)=>{
    const db = getDBReference()
    const collection = db.collection('photos')
    const result = await collection.find({}).toArray()
    res.send(result)
})

app.get("/reviews",async (req,res)=>{
    const db = getDBReference()
    const collection = db.collection('reviews')
    const result = await collection.find({}).toArray()
    res.send(result)
})

app.delete("/users/:uid",async (req,res)=>{
    const db = getDBReference()
    const collection = db.collection('users')
    const result = await collection.deleteOne({
        "_id" : new ObjectID(req.params.uid)
    })
    res.send(result.modifiedCount)
})



app.get('/',(req,res,next)=>{
    res.send("Yelp app!")
})

app.get("*", (req,res)=>{
    res.send({
        Error:"This page is --> not found!"
    })
})



//make sure to connect to DB successfully before starting up the server
connectToDB(()=>{
    app.listen(port,()=>{
        console.log("Node server listening on port:",port)
    })
})
