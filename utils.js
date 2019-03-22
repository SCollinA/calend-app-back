const jwt = require('jsonwebtoken')
const { APP_SECRET } = process.env

function checkLoggedIn({ authorization }) {
    // const Authorization = context.request.get('Authorization')
    if (authorization) {
      const token = authorization.replace('Bearer ', '')
      const { isLoggedIn } = jwt.verify(token, APP_SECRET)
      return isLoggedIn
    }
    throw new Error('not authenticated')
}
  
module.exports = {
    checkLoggedIn
}