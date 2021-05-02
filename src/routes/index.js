var express = require('express');
var router = express.Router();
var path = require('path');
var utils = require("../helpers/utils.js");
var fs = require('fs');
const render = require('./render');

/**
 * <write a short decription>
 * 
 * 1. with hostname we query a master db in order to find the organization_id... 
 *      with the org id we can now query for the uri in collection "files" and return value for fieldName "src"
 * 2. in db we store path as /docs/dnd but need something more flexible so we can respond even if request /docs/dnd/
 * 
 * */
router.get('/*', async(req, res, next) => {
    console.log("GetRoutes by organization")
    console.log('...........',  req.hostname, req.url)
    let hostname = req.hostname;
    let url = req.url;
    let route_uri = url.split(req.hostname)[0];
    let masterDB = '5ae0cfac6fb8c4e656fdaf92'
    route_uri = route_uri.indexOf('?') ? route_uri.split('?')[0] : route_uri

    let organization = await utils.organizationsfindOne({ domains: hostname }, masterDB)
    if (organization == null) {
        res.send('Organization cannot be found using the domain:' + hostname);
        return null;
    }
    else {

        let organization_id = organization._id.toString();
        route_uri = route_uri.indexOf('/ws') != -1 ? route_uri.substr(3) : route_uri;
        let route_files = await utils.routesfindOne({ hostname: hostname, route_uri: route_uri }, organization_id);
        // console.log(organization, hostname, route_uri,route_files);
        let data = null;

        if (route_files != null) {
            try {
                //verifing if exists
                console.log("GET SOURCE ")
                data = route_files['src'];
                if (data == '')
                    throw "Error src empty";
            }
            catch (e) {
                console.log("Exception GET SOURCE ", e)
                var route_export = await utils.getDocument({
                    'collection': route_files['collection'],
                    'document_id': route_files['document_id']
                }, organization_id);
                data = route_export[route_files['name']]
            }
            try {
       
                data = await render(data, organization_id)
            }
            catch (err) {
                console.log('infinite loop', err)
                res.send('there is a an infinite loop');
                return;
            }

            if (data != null) {
                let content_type = '';
                let is_file = route_files['is_file'];
                let ext = path.extname(route_uri).substr(1);
                if (!is_file) {
                    switch (ext) {
                        case 'css':
                            content_type = 'text/css'
                            break;
                        case 'js':
                            content_type = 'text/javascript'
                            break;
                        case 'xml':
                            content_type = 'text/xml'
                            break;
                        default:
                            content_type = 'text/html'
                    }
                    res.type(content_type);
                    res.send(data);
                }
                else {
                    // let content_type = route['content_type'] || "image/png";
                    let file = Buffer.from(data, 'base64');
                    // res.set('Content-Type', content_type);
                    res.send(file);
                }
            }
            else {
                res.send('Document provided by routes could not be found ');
            }
        }
        else {
            res.send('Organization could not be found for [' + hostname + '] in masterDb [' + organization_id + '] ');
        }
    }

});

module.exports = router;
