function 	__mergeObject(target, source) 
{
	target = target || {};
	for (let key of Object.keys(source)) {
		if (source[key] instanceof Object) {
			Object.assign(source[key], __mergeObject(target[key], source[key]))
		}
	}
	
	Object.assign(target || {}, source)
	return target
}

function __createObject(data, path) 
{
	if (!path) return data;
	
	let keys = path.split('.')
	let newObject = data;

	for (var  i = keys.length - 1; i >= 0; i--) {
		newObject = {[keys[i]]: newObject}				
	}
	return newObject;
}

function __createArray(key, data)
{
  try {
    let item = /([\w\W]+)\[(\d+)\]/gm.exec(key)
    if (item && item.length == 3) {
      let arrayKey = item[1];
      let index = parseInt(item[2]);
      
      if (!data[arrayKey] || !Array.isArray(data[arrayKey])) {
        data[arrayKey] = [];
      } 
      data[arrayKey][index] = data[key];
      delete data[key];
      key = arrayKey;
    }
  } catch {
    console.log('create array error');
  }
  return key;
}



function isObject(item) {
  return (!!item) && (item.constructor === Object);
}
function isArray(item) {
  return (!!item) && (item.constructor === Array);
}

function replaceArray(data)
{
  let keys = Object.keys(data)

  keys.forEach((k) => {
    let reg = /\[(\d+)\]/gm.exec(k)
    let newKey = null;
    if (reg && reg.length == 2) {
      newKey = k.replace(reg[0], "." + reg[1]);
      let newData = data[k];
      delete data[k];
      data[newKey] = newData
    }
  })
  return data;
}

function decodeObject(data) {
  let keys = Object.keys(data)
  let objectData = {};
  
  keys.forEach((k) => {
    k = __createArray(k, data);
    if (k.split('.').length > 1) {
      let newData = __createObject(data[k], k);
      delete data[k];
      
      objectData = __mergeObject(objectData, newData);
    } else {
      objectData[k] = data[k];
    }
  })
  return objectData;
}

function encodeObject(data) {
  let keys = Object.keys(data);
  let newData = {};
  keys.forEach((k) => {
    let data_value = data[k];
    if (isObject(data[k])) {
      let new_obj = encodeObject(data[k]);
      let newKeys = Object.keys(new_obj);
      newKeys.forEach((newKey) => {
        let value = new_obj[newKey];
        if (isNaN(parseInt(newKey))) {
          newKey = `${k}.${newKey}`;
        } else {
          newKey = `${k}[${newKey}]`;
        }
        
        newData[newKey] = value;
      })

    } else if (isArray(data_value)){
      data_value.forEach((v, index) => {
        newData[`${k}[${index}]`] = v;
      })
    } else {
      newData[k] = data[k];
    }
  })
  return newData;
}

module.exports = {
  decodeObject,
  encodeObject,
  replaceArray
};
