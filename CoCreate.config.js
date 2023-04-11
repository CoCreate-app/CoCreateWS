module.exports = {
    "config": {
        "apiKey": "2061acef-0451-4545-f754-60cf8160",
        "organization_id": "5ff747727005da1c272740ab",
        "host": "general.cocreate.app"
    },
    "db_url": "mongodb+srv://cocreate-app:56VAZlwk8qfiAMfk@cocreatedatabase.ne3tel6.mongodb.net/?retryWrites=true&w=majority",
    "jwttoken": {
        "options": {
            "algorithm": "HS256",
            "expiresIn": "2 days",
            "issuer": "issuer"
        }
    },
    "sources": [
        {
            "collection": "files",
            "document": {
                "_id": "63af5afb7c43c94f9cf6c4be",
                "name": "index.html",
                "path": "/docs/CoCreateWS/index.html",
                "src": "{{./docs/index.html}}",
                "hosts": [
                    "*",
                    "general.cocreate.app"
                ],
                "directory": "/docs/CoCreateWS",
                "content-type": "text/html",
                "public": "true",
                "website_id": "5ffbceb7f11d2d00103c4535"
            }
        }
    ]
}