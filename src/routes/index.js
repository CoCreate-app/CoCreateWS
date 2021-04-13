var express = require('express');
var router = express.Router();
var path = require('path');
var utils = require("../helpers/utils.js");

router.get('/*', async (req, res, next) => {

    let hostname = req.hostname; 
    let url = req.url; 
    let route_uri = url.split(req.hostname)[0];
    let masterDB = '5ae0cfac6fb8c4e656fdaf92'
    route_uri = route_uri.indexOf('?') ? route_uri.split('?')[0] : route_uri
    

    let organization = await utils.organizationsfindOne({domains:hostname},masterDB)

    if(organization == null) {
        res.send('Error Get Organization by Domain =>'+hostname);
        return null;
    } else {
        
        let organization_id = organization._id.toString();
        route_uri = route_uri.indexOf('/ws') != -1 ? route_uri.substr(3) : route_uri;
        let route = await utils.routesfindOne({hostname:hostname , route_uri : route_uri  },organization_id);
        console.log(organization, hostname, route_uri,route);
        if (route != null){
            var route_export = await utils.getDocument({
                'collection':route['collection'],
                'document_id':route['document_id']
            }, organization_id);

            if (route_export != null) {
                let content_type = '';
                let is_file = route['is_file'];
                let ext = path.extname(route_uri);
                if (!is_file) {
                    switch(ext){
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
                    res.send(route_export[route['name']]);
                } else {
                    // let content_type = route['content_type'] || "image/png";
                    let file = Buffer.from(route_export[route['name']], 'base64');
                    // res.set('Content-Type', content_type);
                    res.send(file);
                }
            }
            else {
                res.send('Document provided by routes could not be found in collection: '+route['collection'] + ' document_id: '+route['document_id']);
            }
        }
        else {
                res.send('Organization could not be found for ['+hostname+'] in masterDb ['+organization_id+'] ');
        }
    }
    
});

module.exports = router;
