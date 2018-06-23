const { Router } = require('express')

const min = (a, b) => (a < b ? a : b);
/**
 * 
 * @param {Object} query 
 */
function queryOptions(query) {
    const data = {};
    const options = {};
    Object.keys(query).forEach(propName => {
        if (propName[0] === '_') {
            options[propName.substr(1)] = query[propName];
        } else {
            data[propName] = query[propName];
        }
    });
    return {
        data,
        options,
    };
}

async function fetch(dao, items, relations) {
    if (!relations) return;
    await Promise.all(relations.split(',').map(async name => {
        const fetchName = name[0].toUpperCase() + name.substr(1);
        await dao['fetch' + fetchName](items);
    }));
}

module.exports = function (dao, options) {
    const outputFilter = dao.outputFilter || (_ => _);
    console.assert(typeof outputFilter === 'function', 'outputFilter is not a function');
    const getById = dao.getById || dao.getBy_id;
    console.assert(typeof getById === 'function', 'getById is not a function');
    const maxPageSize = dao.maxPageSize || 1000;
    console.assert(typeof maxPageSize === 'number', 'maxPageSize is not a number');

    const router = new Router();
    router.get('/', async (req, res, next) => {
        try {
            const { data, options } = queryOptions(req.query);
            let word = '';
            if (data.q) {
                word = data.q;
                delete data.q;
            }
            const items = await dao.search(word, data, options.order, options.page||0, options.pageSize||1000, req.connection);
            // const pagesize = min(options.pagesize || dao.db.defaultPageSize || 1, maxPageSize);
            // const items = await dao.find(data, options.page || 0, pagesize);
            await fetch(dao, items, options.fetch);
            const output = await Promise.all(items.map(item => outputFilter(item, req)));
            res.json(output.filter(_ => _));
        } catch (err) { next(err); }
    });

    router.post('/', async (req, res, next) => {
        try {
            const { data, options } = queryOptions(req.query);
            const item = await dao.insert(data);
            const output = await outputFilter(item, req);
            res.json(output);
        } catch (err) { next(err); }
    });

    router.get('/:id', async (req, res, next) => {
        try {
            const { data, options } = queryOptions(req.query);
            const item = await (dao.getOneById||dao.getOneBy_id)(req.params.id);
            if (item) {
                await fetch(dao, item, options.fetch);
            }
            const output = await outputFilter(item, req);
            res.json(output);
        } catch (err) { next(err); }
    });

    router.post('/:id', async (req, res, next) => {
        try {
            const { data, options } = queryOptions(req.query);
            const item = await (dao.getOneById||dao.getOneBy_id)(req.params.id);
            const updated = {
                ...item,
                ...data,
            };
            const output = await dap.save(updated);
            res.json();
        } catch (err) { next(err); }
    });

    router.delete('/:id', async (req, res, next) => {
        try {
            const output = await (dao.removeById || dao.removeBy_id)(req.param.id);
            res.json(output);
        } catch (err) { next(err); }
    });

    return router;
}