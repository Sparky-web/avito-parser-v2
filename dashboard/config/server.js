const dotenv = require("dotenv")
const path = require("path")
dotenv.config({path: path.join(__dirname, "../../.env")})

module.exports = ({ env }) => ({
  host: env('HOST', process.env.STRAPI_HOST || "0.0.0.0"),
  port: env.int('PORT', process.env.STRAPI_PORT || "1337"),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', '9af385aedb63c3bb22814bd2adf195a3'),
    },
  },
});
