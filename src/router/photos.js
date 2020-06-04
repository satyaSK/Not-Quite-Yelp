const router = require('express').Router()
const url = require('url');
const {getPhoto, addPhoto,deletePhoto, modifyPhoto} = require('../models/photos')
const { addUserPhoto,deleteUserPhoto} = require("../models/user")
const { addPhotoToBusiness, deleteBusinessPhoto} = require("../models/business")
const {requireAuthentication, hasPermission} = require('../lib/auth')
//hard code the user
//let userId = "5ebec33e3eb6404bd7426ccd"

router.get("/photos/:id",async (req,res)=>{
        try {
            const result = await getPhoto(req.params.id)
            if (result){
            res.status(200).send(result)
            }else{
                res.status(400).send({err:"photo does not exist"})
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({err:"Server-DB error"})
        }
    
})

router.post("/photos", requireAuthentication, async (req,res,next)=>{  
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
    const insertedId = await addPhoto(req.body)
    const addToUser = await addUserPhoto(ownerId, insertedId)
    const addToBusiness = await addPhotoToBusiness(req.body.businessId,insertedId)
    
    if(insertedId && addToUser && addToBusiness){
        res.status(200).send({
            id:insertedId,
            links:{
                photo: `/photos/${insertedId}`
            }
        })
    } else{
        res.status(500).send({err:"Photo was not added!"})
    }

})


router.put("/photos/:photoid", requireAuthentication, async (req,res)=>{
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

    const modifyBool = await modifyPhoto(req.params.photoid, req.body)
    if (modifyBool) {
        res.status(200).send({
            message:"Modified Successfully",
            link:{
                photo: `/photos/${req.params.photoid}`
            }
        })
    } else {
        res.status(500).send({
            err:"Server-DB error occured"
        })
    }
})


router.delete("/photos/:photoid", requireAuthentication, async (req,res)=>{
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

    const deleteBool = await deletePhoto(req.params.photoid)
    const deleteBusinessPic = await deleteBusinessPhoto(req.body.businessId, req.params.photoid)
    const deleteUserPic = await deleteUserPhoto(ownerId,req.params.photoid)
    

    console.log(deleteBool, deleteBusinessPic, deleteUserPic)
    if (deleteBool && deleteBusinessPic && deleteUserPic) {
        res.status(200).send({
            message:"Deleted Successfully"
        })
    } else {
        res.status(500).send({
            message:"Problem occured during deletion"
        })
    }
})

module.exports = router