const config = {
    db_url: process.env.MONGO_URL || 'mongodb://localhost:27017/test',
    jwttoken: {
        key: process.env.JWT_KEY || 'secret',
        options: {
            algorithm: "HS256",
            expiresIn: "2 days",
            issuer: "issuer"
        }
    }
}

export default config;
