module.exports = {
  "organization": {
    "name": "<organization, company or project name>",
    "domains": [
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
  // "db_url": "<MongoDb Url>",
  // "jwttoken": {
  //   "key": "<jwt token>",
  "db_url": "mongodb+srv://cocreate-app:rolling123@cocreatedb.dnjr1.mongodb.net",
  "jwttoken": {
    "key": "aaIbx6W0366Mm6NXrPQb1k3Hg3sRxd1B",
    "options": {
      "algorithm": "HS256",
      "expiresIn": "2 days",
      "issuer": "issuer"
    }
  },
  "sources": [
    {
      "entry": "./docs/index.html",
      "collection": "files",
      "document_id": "",
      "key": "src",
      "data": {
        "name": "index.html",
        "path": "/docs/CoCreateWS/index.html",
        "domains": ["*", "general.cocreate.app"],
        "directory": "/docs/CoCreateWS",
        "content-type": "text/html",
        "public": "true",
        "website_id": "5ffbceb7f11d2d00103c4535"
      }
    }
  ]
}
