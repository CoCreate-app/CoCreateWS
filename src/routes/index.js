var express = require('express');
var router = express.Router();
var path = require('path');
var utils = require("../helpers/utils.js");
var fs = require('fs');
const mime = require('mime-types')
const render = require('./render');

/**
 * <write a short decription>
 * 
 * 1. with hostname we query a master db in order to find the organization_id... 
 *      with the org id we can now query for the uri in collection "files" and return value for fieldName "src"
 * 2. in db we store path as /docs/dnd but need something more flexible so we can respond even if request /docs/dnd/
 * 
 * */
const masterDB = '5ae0cfac6fb8c4e656fdaf92'
router.get('/*', async(req, res, next) => {
    let hostname = req.hostname;
    let organization = await utils.organizationsfindOne({ domains: hostname }, masterDB)
    if (!organization)
        return res.send('Organization cannot be found using the domain:' + hostname);


    let url = req.url;
    if (url.endsWith('/'))
        url = url.substring(0, url.length - 1);

    url = url.startsWith('/ws') ? url.substr(3) : url; // dev

    // console.log('>>>>>>>>>>>>>', url, organization)
    let organization_id = organization._id.toString();
    let route_files = await utils.routesfindOne({ hostname: hostname, route_uri: url }, organization_id);


    if (!route_files)
        return res.send(`there is no ${url} in masterDb  ${organization_id} `);
    let data;
    if (route_files['src'])
        data = route_files['src'];
    else {
        let route_export = await utils.getDocument({
            collection: route_files['collection'],
            document_id: route_files['document_id']
        }, organization_id);
        data = route_export[route_files['name']];

    }

    if (!data) {
        res.send('Document provided by routes could not be found and has no src ');
    }





    let content_type = route_files['content_type'] ||
        mime.lookup(url) ||
        'text/html';

    console.log('(>>>>>>>>>>>>>>', content_type, route_files['content_type'], route_files['route'])

    if (content_type.startsWith('image/') || content_type.startsWith('audio/') || content_type.startsWith('video/')) {
        // let content_type = route['content_type'] || "image/png";
        // todo: is there are better alternative or conevention not to process base64
        let file = Buffer.from(data, 'base64');
        res.set('Content-Type', content_type);
        res.send(file);
    }
    else if (content_type === 'text/html') {


        try {

            let fullHtml = await render(data, organization_id);
            res.type(content_type);
            res.send(fullHtml);
        }
        catch (err) {
            if (err.message.startsWith('infinite loop:'))
                return res.send('there is a infinite loop');
            else
                return res.send('something is wrong')
        }

    }
    else {
        res.type(content_type);
        res.send(data);
    }


});

module.exports = router;
