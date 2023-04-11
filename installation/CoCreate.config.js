module.exports = {
  "organization": {
    "name": "<organization, company or project name>",
    "hosts": [
        "<optional domain pointing to this server's ip>",
    ]
  },
  "user": {
      "name": "admin",
      "email": "<email to use for login>",
      "password": "<password to use for login>"
  },
  "config": {
    "apiKey": "2061acef-0451-4545-f754-60cf8160",
    "organization_id": "5ff747727005da1c272740ab",
    "host": "general.cocreate.app"
  },
  "dbUrl": {
    'mongodb': ['<dbUrl>']
  },
  "jwttoken": {
    "options": {
      "algorithm": "HS256",
      "expiresIn": "2 days",
      "issuer": "issuer"
    }
  }
}
