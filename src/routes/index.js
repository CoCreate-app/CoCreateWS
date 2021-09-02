var express = require('express');
var router = express.Router();
var path = require('path');
var utils = require("./utils.js");
var fs = require('fs');
const mime = require('mime-types')
const render = require('./render');

const { MongoClient } = require('mongodb');
var config = require('../../config.json');

let dbClient = null;

MongoClient.connect(config.db_url, { useNewUrlParser: true, poolSize: 10 })
    .then((client, err) => {
        dbClient = client;
    });

const masterDB = '5ae0cfac6fb8c4e656fdaf92'
router.get('/*', async(req, res, next) => {

    let hostname = req.hostname;
    let organization = await utils.organizationsfindOne(dbClient, { domains: hostname }, masterDB)
    if (!organization)
        return res.send('Organization cannot be found using the domain:' + hostname);

    let url = req.url;
    if (url.endsWith('/')) {
        url += "index.html";
    }
    else {
       let directory = url.split("/").slice(-1)[0];
       if (!directory.includes('.')){
            url += "/index.html";
       }
    }
        // url = url.substring(0, url.length - 1);

    url = url.startsWith('/ws') ? url.substr(3) : url; // dev

    // console.log('>>>>>>>>>>>>>', url, organization)
    let organization_id = organization._id.toString();


    let route_files = await utils.routesfindOne(dbClient, { hostname: hostname, route_uri: url }, organization_id);


    if (!route_files)
        return res.status(404).send(`${url} could not be found for ${organization_id} `);

    // if (!route_files['public'] ||  route_files['public'] === "false")
    //     return res.status(404).send(`access not allowed`);


    console.log('called')


    let data;
    if (route_files['src'])
        data = route_files['src'];
    else {
        let route_export = await utils.getDocument(
            dbClient, {
                collection: route_files['collection'],
                document_id: route_files['document_id']
            },
            organization_id
        );
        data = route_export[route_files['name']];

    }

    if (!data) {
        res.send('Document provided by routes could not be found and has no src ');
    }

    let content_type = route_files['content_type'] ||
        mime.lookup(url) ||
        'text/html';


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

            let fullHtml = await render(dbClient, data, organization_id);
            res.type(content_type);
            // throw new Error(' "a test error"')
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
