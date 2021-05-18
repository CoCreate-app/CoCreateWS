let { parse } = require("node-html-parser");
let { getDocument } = require('../helpers/utils');

module.exports = async function renderHtml(html, organization_id) {

    let dep = [];
    let dbCache = new Map();

    async function render(html, lastKey) {
        const dom = parse(html);
        for (let el of dom.querySelectorAll(
                "[data-collection][name][data-document_id]"
            )) {
            let meta = el.attributes;
            let id = meta["data-document_id"],
                coll = meta['data-collection'],
                name = meta['name'];
            let key = id + coll + name;
            if(!id || !name || !coll) continue;
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
          
                record = await
                getDocument({
                    collection: coll,
                    document_id: id
                }, organization_id);
                dbCache.set(cacheKey, record)
            }



            if(!record || !record[name])
            {
                    dep.pop();
                    continue;
            }
            let chunk = record[name];
            if (!chunk) {

                dep.pop();
                continue;
            }
            let dom = await render(chunk);

            el.innerHTML = "";
            el.appendChild(dom);


            dep.pop();
        }

        return dom;
    }
    let result = (await render(html, 'root')).toString();
    return result;
}
