
const businesses = require('../data/businesses.json')
const users = require('../data/users.json')
const reviews = require('../data/reviews.json')
const photos = require('../data/photos.json')

function businessIdExists(bizId){
    return bizId < businesses.length && bizId >= 0
}

function userExists(uid){
    return uid < users.length && uid >= 0
}

function reviewExists(revid){
    return revid < reviews.length && revid >= 0
}

function photoExists(picid){
    return picid < photos.length && picid >= 0
}

function businessValidated(req){
    console.log(req.body)
    return req.body && req.body.ownerid && req.body.name && req.body.zip && req.body.city && req.body.state && req.body.website && req.body.email && req.body.phone_num
}


//perform some basic user authentication
function authenticateUser(userid, entity_id, tag){
    let check_list = []
    if (tag == 'reviews'){
        check_list = users[userid].reviews_owned
    }
    if (tag == 'businesses'){
        check_list = users[userid].businesses_owned
    }
    if (tag == 'photos'){
        check_list = users[userid].photos_owned
    }

    let allow = false
    for(let i=0; i<check_list.length; i++){
        if (check_list[i] == entity_id){
            allow = true
            break
        }
    }
    return allow
}

module.exports = {
    businessIdExists,
    userExists,
    photoExists,
    reviewExists,
    authenticateUser,
    businessValidated
}