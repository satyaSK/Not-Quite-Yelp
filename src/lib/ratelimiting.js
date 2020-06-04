const redis = require('redis') 
const { authenticateForRateLimiting } = require('./auth') 

const redisHost = process.env.REDIS_HOST || '192.168.99.100' || 'localhost' //use localhost for linux/unix based kernels
const redisPort = process.env.REDIS_PORT || '6379'

const redisClient = redis.createClient(redisPort, redisHost) 

const windowMS = 60000 

const key_type = { ip: 0, user: 1 } 
const rateLimitTokens = [5, 10] 

function getUserTokenBucket(key, type) {
  return new Promise((resolve, reject) => {
    redisClient.hgetall(key, (err, tokenBucket) => {
      if (err) {
        reject(err) 
      } else {
        if (tokenBucket) {
          tokenBucket.tokens = parseFloat(tokenBucket.tokens) 
        } else {
          tokenBucket = {
            type: type,
            tokens: rateLimitTokens[type],
            last: Date.now(),
          } 
        }
        resolve(tokenBucket) 
      }
    }) 
  }) 
}

function saveUserTokenBucket(key, tokenBucket) {
  return new Promise((resolve, reject) => {
    redisClient.hmset(key, tokenBucket, (err, resp) => {
      if (err) {
        reject() 
      } else {
        resolve() 
      }
    }) 
  }) 
}

exports.applyRateLimit = async function (req, res, next) {
  try {
    req.auth = authenticateForRateLimiting(req) 
    const key = req.auth ? req.auth.id : req.ip 
    const type = req.auth ? key_type.user : key_type.ip 

    const tokenBucket = await getUserTokenBucket(key, type) 
    const numTokens = rateLimitTokens[tokenBucket.type] 
    const timestamp = Date.now() 
    const ellapsedMill = timestamp - tokenBucket.last 
    const newTokens = ellapsedMill * (numTokens / windowMS) 

    tokenBucket.tokens += newTokens 
    tokenBucket.tokens = Math.min(tokenBucket.tokens, numTokens) 
    tokenBucket.last = timestamp 

    if (tokenBucket.tokens >= 1) {
      tokenBucket.tokens -= 1 

      await saveUserTokenBucket(key, tokenBucket) 
      next() 
    } else {
      await saveUserTokenBucket(key, tokenBucket) 
      res.status(429).send({
        error: 'Too many requests',
      }) 
    }
  } catch (err) {
    console.log(err) 
    next() 
  }
} 
