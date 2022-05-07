
const fs = require('fs');
const path = require("path")
const prettier = require("prettier");

function updateConfig(organization_id, apiKey) {
    const ppath = './'
    let configfile = path.resolve(ppath, 'CoCreate.config1.js');
    if(!fs.existsSync(configfile))
        return console.error('path does not exist:', configfile)
    
    let object = require(configfile)

    Object.assign(object.config, {organization_id})
    Object.assign(object.config, {apiKey})
    delete object.organization
    delete object.user
    let str = JSON.stringify(object)
    let formated = prettier.format(str, { semi: false, parser: "json" });
    let config = `module.exports = ${formated}`

    // process.exit()
    if (fs.existsSync(configfile))
        fs.unlinkSync(configfile)
    fs.writeFileSync(configfile, config)
    
    console.log(configfile)
}
