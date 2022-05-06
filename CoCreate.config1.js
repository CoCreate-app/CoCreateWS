module.exports = {
  "config": {
    "apiKey": "",
    "organization_id": "^1.0.2",
    "host": "general.cocreate.app"
  },
  "db_url": "mongodb+srv://cocreate-app:123@cocreatedb.dnjr1.mongodb.net",
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
