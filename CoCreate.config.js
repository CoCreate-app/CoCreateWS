module.exports = {
    "config": {
        "organization_id": "",
        "key": "",
        "host": ""
    },
    "db": {
        "mongodb": {
            "provider": "mongodb",
            "url": [
                "mongodb+srv://cocreate-app:0kqEaoEzDUM9lGTP@cocreatedatabase.ne3tel6.mongodb.net/?retryWrites=true&w=majority"
            ]
        }
    },
    "jwttoken": {
        "options": {
            "algorithm": "HS256",
            "expiresIn": "2 days",
            "issuer": "issuer"
        }
    },
    "directories": [
        {
            "entry": "./superadmin",
            "collection": "files",
            "document": {
                "name": "{{name}}",
                "src": "{{source}}",
                "hosts": [
                    "*",
                    "general.cocreate.app"
                ],
                "parentDirectory": "{{parentDirectory}}",
                "directory": "/superadmin{{directory}}",
                "path": "{{path}}",
                "content-type": "{{content-type}}",
                "public": "true"
            }
        }
    ]
}