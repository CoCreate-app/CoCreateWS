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
                "<dbUrl>"
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