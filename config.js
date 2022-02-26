module.exports = {
    db_url: process.env.MONGO_URL || '<mongodb url>',
    jwttoken: {
        key: process.env.JWT_KEY || '<jwt key>',
        options: {
            algorithm: "HS256",
            expiresIn: "2 days",
            issuer: "issuer"
        }
    }
}

