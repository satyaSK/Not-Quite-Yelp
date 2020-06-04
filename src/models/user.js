const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const {getDBReference} = require('../lib/db')
var ObjectID = require('mongodb').ObjectID;

const secretKey = "amishah"

exports.registerUser = async (user)=>{
    const db = getDBReference()
    const collection = db.collection("users")
    try{
        const username = user.username
        const password = await bcrypt.hash(user.password, 8)

        console.log(password)
        const result = await collection.insertOne({
            admin:user.admin,
            email:user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            username: username,
            password: password,
            reviews:[],
            photos:[],
            businesses:[]
        })

        return result.insertedId

    } catch(e){
        console.log(e)
    }
    
}

getUserByEmail = async (email)=>{
    const db = getDBReference()
    const collection = db.collection("users")

    try{
        const user = await collection.findOne({"email": email})
        console.log(user.password)
        return user
    } catch (e) {
        console.log(e)
        return null
    }
}

exports.validateCredentials = async(userCredentials)=>{

    try{
        const email = userCredentials.email
        const password = userCredentials.password
        console.log(email,password)
        const user = await getUserByEmail(email)
    
        if (user && await bcrypt.compare( password, user.password)){
            console.log("user has valid credentials")
            return user._id
        }
    } catch(e){
        console.log(e)
        return null
    }
}



exports.generateJWTtoken = function (userId) {
    const payload = { sub: userId }
    return jwt.sign(payload, secretKey, { expiresIn: '24h' })
}

exports.getUserById = async (uid)=>{
    const db = getDBReference()
    const collection = db.collection("users")

    try {
        const user = await collection.aggregate([
            {
                $match: {"_id":new ObjectID(uid)}
            },
            {
                $unset: [ "_id", "password", "reviews", "photos", "businesses" ] 
            }
        ]).toArray()
        console.log(user)
        if(user){
            return user[0]
        }
    } catch (error) {
        console.log(error)
        return null
    }
    
}

exports.addUserPhoto = async (uid, pid)=>{
    const db = getDBReference()
    const collection = db.collection('users')

    userId = new ObjectID(uid)
    const result = await collection.updateOne(
        {"_id": userId},
        {$push : {"photos": new ObjectID(pid)}}

    )
    if (result.modifiedCount){
        return true
    }
    return false
}


exports.deleteUserPhoto = async (userId, pid)=>{
    const db = getDBReference()
    const collection = db.collection('users')

    const result = await collection.updateOne(
        {"_id": new ObjectID(userId)},
        {$pull : {"photos": new ObjectID(pid)}}
    )
    console.log(result.matchedCount)
    if (result.modifiedCount){

        return true
    }
    return false
}


exports.addUserReview = async (uid, rid)=>{
    const db = getDBReference()
    const collection = db.collection('users')

    userId = new ObjectID(uid)
    const result = await collection.updateOne(
        {"_id": userId},
        {$push : {"reviews": new ObjectID(rid)}}

    )
    if (result.modifiedCount){
        return true
    }
    return false
}


exports.deleteUserReview = async (userId, rid)=>{
    const db = getDBReference()
    const collection = db.collection('users')

    const result = await collection.updateOne(
        {"_id": new ObjectID(userId)},
        {$pull : {"reviews": new ObjectID(rid)}}
    )

    if (result.modifiedCount){

        return true
    }
    return false
}

exports.getReviews = async (uid)=>{
    const db = getDBReference()
    const collection = db.collection('users')

    const results = await collection.aggregate([
        {
            $match:{_id: new ObjectID(uid)}
        },
        {
            $lookup:{
                from: "reviews",
                localField: "reviews",
                foreignField:"_id",
                as: "userReviews"
            }
        },
        {
            $unset:["_id", "reviews", "photos", "businesses", "userReviews._id"]
        }
    ]).toArray()

    if(results){
        return results[0]
    }
    return null
}

exports.getPhotos = async (uid)=>{
    const db = getDBReference()
    const collection = db.collection('users')

    const results = await collection.aggregate([
        {
            $match:{_id: new ObjectID(uid)}
        },
        {
            $lookup:{
                from: "photos",
                localField: "photos",
                foreignField:"_id",
                as: "userPhotos"
            }
        },
        {
            $unset:["_id", "reviews", "photos", "businesses", "userPhotos._id"]
        }
    ]).toArray()

    if(results){
        return results[0]
    }
    return null
}

exports.getBusinesses = async (uid)=>{
    const db = getDBReference()
    const collection = db.collection('users')

    const results = await collection.aggregate([
        {
            $match:{_id: new ObjectID(uid)}
        },
        {
            $lookup:{
                from: "businesses",
                localField: "businesses",
                foreignField:"_id",
                as: "userBusinesses"
            }
        },
        {
            $unset:["_id", "reviews", "photos", "businesses", "userBusinesses._id", "userBusinesses.ownerId","userBusinesses.reviews", "userBusinesses.photos"]
        }
    ]).toArray()

    if(results){
        return results[0]
    }
    return null
}


exports.addUserBusiness = async (uid, bid)=>{
    const db = getDBReference()
    const collection = db.collection('users')

    const result = await collection.updateOne(
        {_id: new ObjectID(uid)},
        {$push: {"businesses": new ObjectID(bid)}}
    )

    if(result.modifiedCount){
        return true
    }
    return false
}

exports.deleteUserBusiness = async (uid, bid)=>{
    const db = getDBReference()
    const collection = db.collection('users')

    const result = await collection.updateOne(
        {_id: new ObjectID(uid)},
        {$pull: {"businesses": new ObjectID(bid)}}
    )
    
    if(result.modifiedCount){
        return true
    }
    return false
}



// // Very good link for schema design rules: https://www.mongodb.com/blog/post/6-rules-of-thumb-for-mongodb-schema-design-part-1

// // ****** From the Blog ********
// // What is the cardinality of my relationship? is it “one-to-few”, ***one-to-many***, or “one-to-squillions”?
// // Do you need to access the object on the “N” side separately, or ***only in the context of the parent object***?
// // What is the ratio of updates to reads for a particular field? --> very lowwwww
// const mongoose = require("mongoose")

// let mongodb = "mongodb://127.0.0.1:27017/yelp-api"
// options = { useNewUrlParser: true, useCreateIndex:true, useUnifiedTopology: true } //to keep deprecation warnings away

// mongoose.connect(mongodb,options)
// .then(()=>{console.log("MongoDB Server Live at Port: 27017")})
// .catch((err)=>{console.log("Found Error:",err)})


// var Schema = mongoose.Schema

// let UserSchema = new Schema({

//     username:{
//         required:true,
//         trim:true,
//         type:String
//     },
//     address:{
//         required:true,
//         trim:true,
//         type:String
//     },
//     businessesOwned:[],//reference to the object ID's of businesses
//     reviewsOwned:[],//reference to the object ID's of reviews
//     photosOwned:[]//reference to the object ID's of photos
// })

// let User = mongoose.model("Users", UserSchema)

// module.exports = User