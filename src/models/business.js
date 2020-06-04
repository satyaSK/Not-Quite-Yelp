const {getDBReference} = require('../lib/db')
var ObjectID = require('mongodb').ObjectID;

exports.getbusinesses = async (page)=>{
    const db = getDBReference()
    const collection = db.collection('businesses')
    
    //pagination stuff
    const itemPerPage = 5
    const totCount = await collection.countDocuments()
    const lastPage = Math.ceil(totCount / itemPerPage)
    page = page > lastPage ? lastPage : page
    page = page < 1 ? 1 : page
    const offset = itemPerPage * (page-1)

    const results = await collection.aggregate([ //get every document
        { $unset: [ "reviews", "photos"] } //exclude these fields
    ])
    .sort({"name":1}) //sort by name
    .skip(offset)
    .limit(itemPerPage)
    .toArray()

    return {
        businesses: results,
        pageNumeber: page,
        pageSize:itemPerPage,
        lastPage,
        businessCount: totCount
    }
}

exports.getSpecificBusiness = async (bid)=>{
    const db = getDBReference()
    const collection = db.collection('businesses')

    result = await collection.aggregate([
        {
            $match: {_id: new ObjectID(bid)}
        },
        {
            $lookup:{
                from:"reviews",
                localField: "reviews",
                foreignField: "_id",
                as: "businessReviews"
            }
        },
        {
            $lookup:{
                from:"photos",
                localField: "photos",
                foreignField: "_id",
                as: "businessPhotos"
            }
        },
        {
            $unset : ["_id", "reviews", "photos"]
        }
    ]).toArray()

    if(result){
        console.log(result[0])
        return result[0] // we have changed the result to array above
    }
    return null
}


exports.addBusiness = async (business)=>{
    const db = getDBReference()
    const collection = db.collection('businesses')
    business['reviews'] = []
    business['photos'] = []
    console.log(business)
    const result = await collection.insertOne(business)//returns JSON 

    return result.insertedId
}

exports.modifyBusiness = async (bid,updatedBusiness)=>{
    const db = getDBReference()
    const collection = db.collection('businesses')

    const result = await collection.updateOne(
        {_id: new ObjectID(bid)}, 
        { $set: updatedBusiness}
    )
        console.log(result.result.ok)
    if(result.result.ok){
        return true
    }
    return false
}

exports.deleteBusiness = async(id) => {
    const db = getDBReference()
    const collection = db.collection('businesses')
    const rev_collection = db.collection('photos')
    const photo_collection = db.collection('photos')

    business_result = await collection.deleteOne({_id: new ObjectID(id)})
    // rev_result = collection.deleteMany({})
    // actually should delete all the photos and photos associated with the business
    
    if(business_result.deletedCount){
        return true
    }
    return false

}

exports.addPhotoToBusiness = async (bid, pid) =>{
    const db = getDBReference()
    const collection = db.collection('businesses')

    const result = await collection.updateOne(
        {"_id": new ObjectID(bid)},
        { $push: {"photos" : new ObjectID(pid)}}
        )

    if (result.modifiedCount){
        return true
    }
    return false
}

exports.addReviewToBusiness = async (bid, rid) =>{
    const db = getDBReference()
    const collection = db.collection('businesses')

    const result = await collection.updateOne(
        {"_id": new ObjectID(bid)},
        { $push: {"reviews" : new ObjectID(rid)}}
        )

    if (result.modifiedCount){
        return true
    }
    return false
}

exports.deleteBusinessPhoto = async (bid, pid) =>{
    const db = getDBReference()
    const collection = db.collection('businesses')
    console.log(bid,pid)
    const result = await collection.updateOne(
        {"_id": new ObjectID(bid)},
        { $pull: {"photos" : new ObjectID(pid)}}
        )
    console.log(result.matchedCount)
    if (result.modifiedCount){
        return true
    }
    return false
}

exports.deleteBusinessReview = async (bid, rid) =>{
    const db = getDBReference()
    const collection = db.collection('businesses')

    const result = await collection.updateOne(
        {"_id": new ObjectID(bid)},
        { $pull: {"reviews" : new ObjectID(rid)}}
        )

    if (result.modifiedCount){
        return true
    }
    return false
}




// Very good link for schema design rules: https://www.mongodb.com/blog/post/6-rules-of-thumb-for-mongodb-schema-design-part-1

// const mongoose = require("mongoose")

// let mongodb = "mongodb://127.0.0.1:27017/yelp-api"
// options = { useNewUrlParser: true, useCreateIndex:true, useUnifiedTopology: true } //to keep deprecation warnings away

// mongoose.connect(mongodb,options)
// .then(()=>{console.log("MongoDB Server Live at Port: 27017")})
// .catch((err)=>{console.log("Found Error:",err)})

// let Schema = mongoose.Schema
  
// let BusinessSchema = new Schema({
//     businessId: {
//     Type: Schema.Types.ObjectId//sets the id
//     },
//     business_name:{
//         required:true,
//         trim:true,
//         type:String
//     },
//     description:{
//         required:true,
//         trim:true,
//         type:String
//     },
//     street:{
//         required:true,
//         trim:true,
//         type:String
//     },
//     city:{
//         required:true,
//         trim:true,
//         type:String
//     },
//     state:{
//         required:true,
//         trim:true,
//         type:String
//     },
//     zip:{
//         required:true,
//         trim:true,
//         type:String
//     },
//     phone:{
//         required:true,
//         trim:true,
//         type:String
//     },
//     category:{
//         required:true,
//         trim:true,
//         type:String
//     },
//     subcategory:{
//         required:true,
//         trim:true,
//         type:String
//     },
//     website:{
//         required:true,
//         trim:true,
//         type:String
//     },
//     email:{
//         required:true,
//         trim:true,
//         type:String
//     },
//     reviews:[],//array of references to review documents
//     photos:[] // array of references to photo documents

// })


// let Business = mongoose.model("Business",BusinessSchema)

// const hey = new Business({"business_name": "Pizza House",

// "description": "We serve the best pizze",
// "street": "100, 1th AVE",
// "city": "Portland",
// "state": "Oregon",
// "zip": "1111-1111",
// "phone": "541-900-1111",
// "category": "Restaurant",
// "subcategory": "Pizza",
// "website": "www.b1.com",
// "email": "-"})

// Business.find({"business_name":"Pizza House"})
// .then((res)=>console.log("Saved: ",res))
// .catch((err)=>console.log(err))

// module.exports = Business