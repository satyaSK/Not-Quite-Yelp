const jwt = require('jsonwebtoken');
const { getUserById } = require('../models/user');

secretKey = 'amishah';

exports.requireAuthentication = function (req, res, next) {
  const authHeader = req.get('Authorization') || '';
  const parts = authHeader.split(' ');
  const token = parts[0] === 'Bearer' ? parts[1] : null;
  if (!token) {
    req.userId = null;
    next();
  }
  try {
    payload = jwt.verify(token, secretKey);
    req.userId = payload.sub;
    next();
  } catch (e) {
    console.log(e);
    res.status(400).send({
      error: 'Invalid Auth Token',
    });
  }
};

exports.authenticateForRateLimiting = function (req) {
  const authHeader = req.get('Authorization') || '';
  const parts = authHeader.split(' ');
  const token = parts[0] === 'Bearer' ? parts[1] : null;
  if (!token) {
    req.userId = null;
  }
  try {
    const payload = jwt.verify(token, secretKey);
    return {
        id : payload.sub
    }
    } catch (err) {
        return undefined
    }
};

exports.hasPermission = async (req_uid, ownerid) => {
  const user = await getUserById(ownerid);
  //console.log(user)
  if (!user) {
    return false;
  }
  if (req_uid == ownerid || user.admin === true) {
    return true;
  }
  return false;
};
