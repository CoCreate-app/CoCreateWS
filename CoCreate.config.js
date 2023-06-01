module.exports = {
    "config": {
        "organization_id": "5ff747727005da1c272740ab",
        "key": "2061acef-0451-4545-f754-60cf8160",
        "host": "general.cocreate.app"
    },
    "db": {
        "mongodb": {
            "provider": "mongodb",
            "url": [
                "<dburl>"
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