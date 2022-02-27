let { parse } = require("node-html-parser");
let { ObjectID } = require('mongodb');

let renderedIgnoreEl = { INPUT: true, TEXTAREA: true, SELECT: true, LINK: true, IFRAME: true, "COCREATE-SELECT": true };

module.exports = async function renderHtml(orgDB, html) {

    let dep = [];
    let dbCache = new Map();

    async function render(html, lastKey) {
        const dom = parse(html);
        for (let el of dom.querySelectorAll(
                "[collection][name][document_id]"
            )) {
            let meta = el.attributes;

            if (renderedIgnoreEl[el.tagName])
                continue;
                
            if (el.tagName == "DIV" && !el.classList.contains('domEditor'))
                continue;
                
            if (el.classList.contains('domEditor') && el.closest('.template'))
                continue;
           
            if (el.hasAttribute('actions'))
                continue;

            let id = meta["document_id"],
                coll = meta['collection'],
                name = meta['name'];
            let key = id + coll + name;
            if (!id || !name || !coll) continue;
            if (dep.includes(key))
                throw new Error(
                    `infinite loop: ${lastKey} ${id} ${coll} ${name}  has been already rendered`
                );
            else
                dep.push(key)

            let cacheKey = id + coll;
            let record;
            if (dbCache.has(cacheKey))
                record = dbCache.get(cacheKey)
            else {
                let collection = orgDB.collection(coll)
                record = await collection.findOne({"_id": new ObjectID(id)});
                dbCache.set(cacheKey, record)
            }

            if (!record || !record[name]) {
                dep.pop();
                continue;
            }
            let chunk = record[name];
            if (!chunk) {

                dep.pop();
                continue;
            }
            let dom = await render(chunk);

            el.setAttribute('rendered', '')
            el.innerHTML = "";
            el.appendChild(dom);


            dep.pop();
        }

        return dom;
    }
    let result = (await render(html, 'root')).toString();
    return result;
}
