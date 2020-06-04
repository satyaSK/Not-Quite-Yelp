const router = require('express').Router()
const url = require('url');

const {getbusinesses,getSpecificBusiness, addBusiness ,modifyBusiness, deleteBusiness} = require('../models/business')
const {addUserBusiness,deleteUserBusiness} = require('../models/user')
const {requireAuthentication, hasPermission} = require('../lib/auth')

//hard code the user
//let userId = "5ebec33e3eb6404bd7426ccd"

router.get('/businesses', async (req,res,next)=>{ 
    console.log("endpoit hit")
    /* Pagination logic --> */
    let url_parts = url.parse(req.url, true) // parse the query string parts
    let query = url_parts.query
    let page = parseInt(query.page) || 1 // if there is a page param in query string, set it that or set 1 by default
    
    try{
        const result = await getbusinesses(page)
        res.status(200).send(result)
    }
    catch (err){
        res.status(500).send({
            err:"Server-side Error while fetching businesses"})
    } 
})

router.get('/businesses/:id', async (req,res,next)=>{

    try {
        const result = await getSpecificBusiness(req.params.id)
        res.status(200).send(result)
    } catch (err) {
        res.status(500).send({err:"Error happened while fetching that business"})
    }

})


router.post('/businesses', requireAuthentication, async (req,res,next)=>{
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

    //verify the body here first
        const insertedId = await addBusiness(req.body)
        const userBusinessAdded = await addUserBusiness(ownerId, insertedId)

        if(insertedId && userBusinessAdded){
            res.status(200).send({
                id: insertedId,
                links:{
                    business: `/businesses/${insertedId}`
                }  
            })
        } else {
            res.status(500).send({err:"Business registration failed"})
        }
    
    
})




router.put("/businesses/:bizid",async (req,res)=>{
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
    
    //validate the schema before moving further
    const modifiedBool = await modifyBusiness(req.params.bizid, req.body)
    if (modifiedBool) {
        res.status(200).send({
            message:"Modified Successfully",
            links:{
                business:  `/businesses/${req.params.bizid}`
            }
    })
    } else {
        res.status(500).send({err:"Modification failed"})
    }
})


router.delete("/businesses/:bizid", async (req,res)=>{
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
    
    const deleteBool = await deleteBusiness(req.params.bizid)
    const deleteBool2 = await deleteUserBusiness(ownerId, req.params.bizid)
    if (deleteBool && deleteBool2) {
        res.status(200).send({messge:"Deleted successfully"})
    } else {
        res.status(500).send({err:"Deletion failed"})
    }   
})

module.exports = router