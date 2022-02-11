module.exports = {
    db_url: process.env.MONGO_URL || 'mongodb://localhost:27017/test',
    jwttoken: {
        key: process.env.JWT_KEY || 'secert',
        options: {
            algorithm: "HS256",
            expiresIn: "2 days",
            issuer: "issuer"
        }
    }
}