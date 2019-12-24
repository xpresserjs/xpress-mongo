function omitKeys(keys, returnObject = false) {
    const data = {};
    for (const key of keys) {
        data[key] = -1;
    }
    return returnObject ? {projection: data} : data;
}

module.exports.omitKeys = omitKeys;


function pickKeys(keys, returnObject = false) {
    const data = {};
    for (const key of keys) {
        data[key] = 1;
    }
    return returnObject ? {projection: data} : data;
}

module.exports.pickKeys = pickKeys;

module.exports.project = (pick = [], omit = []) => {
    return {...pickKeys(pick), ...omitKeys(omit)};
};