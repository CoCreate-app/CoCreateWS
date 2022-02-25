var express = require('express');
var router = express.Router();
// var path = require('path');
// var fs = require('fs');
const mime = require('mime-types');
const render = require('./render');
const dns = require('dns');

const { MongoClient } = require('mongodb');
let ObjectID = require('mongodb').ObjectID;

var config = require('../../config');

let dbClient = null;

MongoClient.connect(config.db_url, { useNewUrlParser: true, poolSize: 10, useUnifiedTopology: true })
    .then((client, err) => {
        dbClient = client;
    });

const masterOrg = '5ae0cfac6fb8c4e656fdaf92'
router.get('/*', async(req, res) => {
    let organization_id;
    let hostname = req.hostname;
    // dns.resolve(hostname, 'TXT', (err, records) => {
    //     if (records)
    //         organization_id = records[0][0];
    //     if (err)
    //         console.log(hostname, err);
    // });

    if (!organization_id) {
        let masterDB = dbClient.db(masterOrg)
        let collection = masterDB.collection('organizations')
        let organization = await collection.findOne({ "domains": { $in: [hostname] } })
        if (!organization)
            return res.send('Organization cannot be found using the domain:' + hostname);
        organization_id = organization._id.toString();
    }
    let [url, parameters] = req.url.split("?");
    if(parameters){}
    if (url.endsWith('/')) {
        url += "index.html";
    }
    else {
       let directory = url.split("/").slice(-1)[0];
       if (!directory.includes('.')){
            url += "/index.html";
       }
    }

    url = url.startsWith('/ws') ? url.substr(3) : url; // dev
    
    let orgDB = dbClient.db(organization_id)
    let collection = orgDB.collection('files')
    // fix: '*' causing error 'must be a single String of 12 bytes or a string of 24 hex characters'
    let file = await collection.findOne({domains: { $in: [hostname, '*'] }, "path" : url});

    if (!file)
        return res.status(404).send(`${url} could not be found for ${organization_id} `);

    if (!file['public'] ||  file['public'] === "false")
        return res.status(404).send(`access not allowed`);

    let data;
    if (file['src'])
        data = file['src'];
    else {
        let collection = orgDB.collection(file['collection'])
        let fileSrc = await collection.findOne({"_id": new ObjectID(file["document_id"])});
        data = fileSrc[file['name']];
    }

    if (!data) {
        res.send('Document provided by routes could not be found and has no src ');
    }

    let content_type = file['content_type'] || mime.lookup(url) || 'text/html';

    if (content_type.startsWith('image/') || content_type.startsWith('audio/') || content_type.startsWith('video/')) {
        var base64Data = data.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
        let file = Buffer.from(base64Data, 'base64');
        res.writeHead(200, {
         'Content-Type': content_type,
         'Content-Length': file.length
        });
        res.end(file);
    }
    else if (content_type === 'text/html') {
        try {
            let fullHtml = await render(orgDB, data, organization_id);
            res.type(content_type);
            res.send(fullHtml);
            console.log('html sent')
        }
        catch (err) {
            if (err.message.startsWith('infinite loop:')) {
                console.log('infinte loop ')
                return res.send('there is a infinite loop');

            }
            else {
                console.warn('something is wrong with server-rendering: ' + err.message)
                return res.send(data + `<script>console.log("${'something is wrong with server-rendering: ' + err.message}")</script>`)
            }
        }

    }
    else {
        res.type(content_type);
        res.send(data);
        console.log('else')
    }


});

module.exports = router;
