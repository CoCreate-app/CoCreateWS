var utils = require("../helpers/utils.js");
var config = require('../../config.json');
var path = require('path');
var fs = require('fs');

module.exports.getRouteMongo = async (req, res, next) => {

    let hostname = req.hostname; 
    let url = req.url; 
    let route_uri = url.split(req.hostname)[0];
    route_uri = route_uri.indexOf('?') ? route_uri.split('?')[0] : route_uri

    let organization = await utils.organizationsfindOne({domains:hostname},'5de0387b12e200ea63204d6c')

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
                            content_type = 'text/html'
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
                res.send('Error Get ROute Document Export Collection -> '+route['collection'] + ' document_id -> '+route['document_id']);
            }
        }
        else {
                res.send('No Found this ROute in ours BD  Host ['+hostname+'] and OrgId ['+organization_id+'] ');
        }
    }
    
}
module.exports.getRoute = async (req, res, next) => {
    
    // to test -> http://52.207.107.241:8081/organization/hello/org
    // -> https://server.cocreate.app:8088/organization/test/frank
    
    /*
    db.organizations.findOneAndUpdate(
       { _id:ObjectId('5de0387b12e200ea63204d6c') },
       { $set: { "routes" : [{
                        route: '/test/frank',
                        collection: 'module_activities',
                        document_id: "5e4802ce3ed96d38e71fc7e5",
                        name: 'name1',
                      },
                      {
                        route: '/hello/jean',
                        collection: 'modules',
                        document_id: '5de03fc7c745412976891134',
                        name: 'html',
                      },
                      {
                        route: '/hello/org',
                        collection: 'organizations',
                        document_id: '5f03eb8462181154025cd876',
                        name: 'name',
                      }
                      ]} },
       {  upsert:true, returnNewDocument : true }
    );
    */
    
    console.log("URL=> ",req.url , " req.hostname ", req.hostname)
    let route_uri = req.url.split('/organization')[1];
    let organization_id = '5de0387b12e200ea63204d6c';
    
    var org = await utils.getDocument({'collection':'organizations','document_id':organization_id});
    var route = org.routes.find(element => element.route.toLowerCase() == route_uri);
    if (typeof route != 'undefined'){
        console.log(" Route ",route);
        var result = await utils.getDocument(route);
        console.log("Result ",result)
        res.send(result[route.name]);
    }
    else {
        let list_route = '<ul>'
        org.routes.forEach(function(route) {   
            list_route += '<li>'+route.route+'</li>';
        });
        list_route += '</ul>'
            res.send('This route does not exist: '+list_route);
    }
}

