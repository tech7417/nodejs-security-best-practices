const rateLimit = require('express-rate-limit');

 const limit = rateLimit({
    windowMs :  2 * 60 * 1000, // 15 minutes
    max: 5,
   message: "Too many requests, please try again later."
 })



  module.exports = limit