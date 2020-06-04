const {getDBReference} = require('../lib/db')
var ObjectID = require('mongodb').ObjectID;

exports.addReview = async (review) =>{
    const db = getDBReference()
    const collection = db.collection('reviews')

    const result = await collection.insertOne(review)

    return result.insertedId
}

exports.getReview = async (pid)=>{
    const db = getDBReference()
    const collection = db.collection('reviews')

    const result = collection.findOne({"_id": new ObjectID(pid)})

    delete result._id
    delete result.businessId
    return result
}


exports.modifyReview = async (pid, newReview)=>{
    const db = getDBReference()
    const collection = db.collection('reviews')

    const result = await collection.updateOne(
        {"_id":new ObjectID(pid)},
        {$set: newReview}
    )

    if(result.modifiedCount){
        return true
    }
    return false
}

exports.deleteReview = async (pid)=>{
    const db = getDBReference()
    const collection = db.collection('reviews')

    const result = await collection.deleteOne(
        {"_id":new ObjectID(pid)}
    )

    if(result.deletedCount){
        return true
    }
    return false
}



// // Very good link for schema design rules: https://www.mongodb.com/blog/post/6-rules-of-thumb-for-mongodb-schema-design-part-1

// const mongoose = require("mongoose")

// let mongodb = "mongodb://127.0.0.1:27017/yelp-api"
// options = { useNewUrlParser: true, useCreateIndex:true, useUnifiedTopology: true } //to keep deprecation warnings away

// mongoose.connect(mongodb,options)
// .then(()=>{console.log("MongoDB Server Live at Port: 27017")})
// .catch((err)=>{console.log("Found Error:",err)})


// var Schema = mongoose.Schema

// let ReviewSchema = new Schema({

//     business_name:{
//         required:true,
//         trim:true,
//         type:String
//     },
//     stars:{
//         required:true,
//         trim:true,
//         type:String
//     },
//     expense:{
//         required:true,
//         trim:true,
//         type:String
//     },
//     reviewText:{
//         required:true,
//         trim:true,
//         type:String
//     }
// })

// let Review = mongoose.model("Reviews", ReviewSchema)

// module.exports = Review