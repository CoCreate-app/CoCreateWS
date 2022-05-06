
const fs = require('fs');
const path = require("path")
const prettier = require("prettier");

createConfig('./CoCreate.config1.js')

function createConfig(path) {
   
    if(!fs.existsSync(path))
        return console.error('path does not exist:', path)
    let object = require(path)

    console.log(object)
    if (!object.config)
        return console.log(path, 'not updated')
    else
        Object.assign(object.config, {
           organization_Id: "^1.0.2",
        })

    let str = JSON.stringify(object)
    // console.log(str)
    let formated = prettier.format(str, { semi: false, parser: "json" });
    let config = `module.exports = ${formated}`
    // process.exit()
    fs.writeFileSync(path, config)
    console.log(path)
}
