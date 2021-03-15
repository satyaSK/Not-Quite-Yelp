db.createUser({
    user: "yelpUser",
    pwd: "yelpPwd",
    roles: [ { role: "readWrite", db: "yelp-db" } ]
})


db.createCollection("users")
db.createCollection("businesses")
db.createCollection("reviews")
db.createCollection("photos")