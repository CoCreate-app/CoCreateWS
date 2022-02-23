module.exports = {
    db_url: process.env.MONGO_URL || 'mongodb+srv://cocreate-app:123@cocreatedb.dnjr1.mongodb.net',
    jwttoken: {
        key: process.env.JWT_KEY || 'aaIbx6W0366Mm6NXrPQb1k3Hg3sRxd1B',
        options: {
            algorithm: "HS256",
            expiresIn: "2 days",
            issuer: "issuer"
        }
    }
}

