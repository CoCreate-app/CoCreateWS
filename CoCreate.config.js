module.exports = {
    "config": {
        "organization_id": "5ff747727005da1c272740ab",
        "apiKey": "2061acef-0451-4545-f754-60cf8160",
        "host": "general.cocreate.app"
    },
    "database": {
        "name": 'mongodb',
        "url": ['<dbUrl>'],
    },
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
                "parentDirectory": "{{parentDirectory}}",
                "content-type": "{{content-type}}",
                "public": "true",
                "website_id": "644d4bff8036fb9d1d1fd69c"
            }
        }
    ]
}