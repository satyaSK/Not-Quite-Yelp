const {getDBReference} = require('../lib/db')
var ObjectID = require('mongodb').ObjectID;

exports.addPhoto = async (photo) =>{
    const db = getDBReference()
    const collection = db.collection('photos')

    const result = await collection.insertOne(photo)

    return result.insertedId
}

exports.getPhoto = async (pid)=>{
    const db = getDBReference()
    const collection = db.collection('photos')

    const result = collection.findOne({"_id": new ObjectID(pid)})

    delete result._id
    delete result.businessId
    return result
}


exports.modifyPhoto = async (pid, newPhoto)=>{
    const db = getDBReference()
    const collection = db.collection('photos')

    const result = await collection.updateOne(
        {"_id":new ObjectID(pid)},
        {$set: newPhoto}
    )

    if(result.result.ok){
        return true
    }
    return false
}

exports.deletePhoto = async (pid)=>{
    const db = getDBReference()
    const collection = db.collection('photos')

    const result = await collection.deleteOne(
        {"_id":new ObjectID(pid)}
    )

    if(result.deletedCount){
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

// let PhotoSchema = new Schema({

//     business_name:{
//         required:true,
//         trim:true,
//         type:String
//     },
//     businessId:{
//         required:true,
//         trim:true,
//         type:String
//     },
//     imgSrc:{
//         required:true,
//         trim:true,
//         type:String
//     },
//     caption:{
//         required:true,
//         trim:true,
//         type:String
//     }
// })

// let Photo = mongoose.model("Photos", PhotoSchema)

// module.exports = Photo