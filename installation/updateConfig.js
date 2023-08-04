
const fs = require('fs');
const path = require("path")

function updateConfig(organization_id, key) {
    const ppath = './'
    let configfile = path.resolve(ppath, 'CoCreate.config1.js');
    if (!fs.existsSync(configfile))
        return console.error('path does not exist:', configfile)

    let object = require(configfile)

    Object.assign(object.config, { organization_id })
    Object.assign(object.config, { key })
    delete object.organization
    delete object.user

    let str = JSON.stringify(data.object, null, 4);
    let config = `module.exports = ${str}`

    // process.exit()
    if (fs.existsSync(configfile))
        fs.unlinkSync(configfile)
    fs.writeFileSync(configfile, config)

    console.log(configfile)
}
