const router = require('express').Router()
const url = require('url');

const { getReview,deleteReview,modifyReview,addReview} = require("../models/review")
const { addReviewToBusiness,deleteBusinessReview} = require("../models/business")
const { addUserReview,deleteUserReview} = require("../models/user")
const {requireAuthentication, hasPermission} = require('../lib/auth')

//hard code the user
//let userId = "5ebec33e3eb6404bd7426ccd"

router.get("/reviews/:reviewId",async (req,res)=>{
    try {
        const result = await getReview(req.params.reviewId)
        if (result){
        res.status(200).send(result)
        }else{
            res.status(400).send({err:"review does not exist"})
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({err:"Server-DB error"})
    }
})



//This might also be /businesses/:id/reviews -->then reviews should hold businessID and ownerID
router.post("/reviews", requireAuthentication, async (req,res)=>{
    /*Authenticated user enters*/ 
    const ownerId = req.body.ownerId
    console.log("User Authenticated")
    if(!(await hasPermission(req.userId, ownerId))){
        res.status(400).send({
            error:"Current user not authorized to perform this action"
        })
        return
    }
    /* Here the user is allowed to perform action*/
    
        //validate the photo first
    const insertedId = await addReview(req.body)
    const addToUser = await addUserReview(ownerId, insertedId)
    const addToBusiness = await addReviewToBusiness(req.body.businessId,insertedId)
    
    if(insertedId && addToUser && addToBusiness){
        res.status(200).send({
            id:insertedId,
            links:{
                photo: `/reviews/${insertedId}`
            }
        })
    } else{
        res.status(500).send({err:"Review was not added!"})
    }

})


router.put("/reviews/:reviewId", requireAuthentication, async (req,res)=>{
    /*Authenticated user enters*/ 
    const ownerId = req.body.ownerId
    console.log("User Authenticated")
    if(!(await hasPermission(req.userId, ownerId))){
        res.status(400).send({
            error:"Current user not authorized to perform this action"
        })
        return
    }
    /* Here the user is allowed to perform action*/
    //validate photo body

    const modifyBool = await modifyReview(req.params.reviewId, req.body)
    if (modifyBool) {
        res.status(200).send({
            message:"Modified Successfully",
            link:{
                photo: `/reviews/${req.params.reviewId}`
            }
        })
    } else {
        res.status(500).send({
            err:"Server-DB error occured"
        })
    }
})



router.delete("/reviews/:reviewId", requireAuthentication,async (req,res)=>{
    /*Authenticated user enters*/ 
    const ownerId = req.body.ownerId
    console.log("User Authenticated")
    if(!(await hasPermission(req.userId, ownerId))){
        res.status(400).send({
            error:"Current user not authorized to perform this action"
        })
        return
    }
    /* Here the user is allowed to perform action*/

    const deleteBool = await deleteReview(req.params.reviewId)

    const deleteUserPic = await deleteUserReview(ownerId,req.params.reviewId)
    const deleteBusinessPic = await deleteBusinessReview(req.body.businessId, req.params.reviewId)

    console.log(deleteBool,deleteBusinessPic,deleteUserPic)
    if (deleteBool && deleteBusinessPic && deleteUserPic) {
        res.status(200).send({
            message:"Deleted Successfully"
        })
    } else {
        res.status(500).send({
            message:"Problem occured during deletion of review"
        })
    }
})

module.exports = router