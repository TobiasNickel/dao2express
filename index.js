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

module.exports = function (dao,options = {}) {
    const maxPageSize = dao.maxPageSize || 1000;
    console.assert(typeof maxPageSize === 'number', 'maxPageSize is not a number');

    const passThroughMiddleware = ((_,__,next) => next());
    const middlewares = {
        read: options.readMiddleware || passThroughMiddleware,
        update: options.updateMiddleware || passThroughMiddleware,
        create: options.createMiddleware || passThroughMiddleware,
        remove: options.removeMiddleware || passThroughMiddleware,
    };

    const router = new Router();
    router.get('/', middlewares.read, async (req, res, next) => {
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
            res.json(items);
        } catch (err) { next(err); }
    });

    router.post('/', middlewares.create, async (req, res, next) => {
        try {
            const { data, options } = queryOptions(req.query);
            const item = await dao.insert(data);
            res.json(item);
        } catch (err) { next(err); }
    });

    router.get('/:id', middlewares.read, async (req, res, next) => {
        try {
            const { data, options } = queryOptions(req.query);
            const item = await (dao.getOneById||dao.getOneBy_id)(req.params.id);
            if (item) {
                await fetch(dao, item, options.fetch);
            }
            res.json(item);
        } catch (err) { next(err); }
    });

    router.post('/:id', middlewares.update, async (req, res, next) => {
        try {
            const { data, options } = queryOptions(req.query);
            const item = await (dao.getOneById||dao.getOneBy_id)(req.params.id);
            const updated = {
                ...item,
                ...data,
            };
            const output = await dao.save(updated);
            res.json(output);
        } catch (err) { next(err); }
    });

    router.delete('/:id', middlewares.remove, async (req, res, next) => {
        try {
            const output = await (dao.removeById || dao.removeBy_id)(req.param.id);
            res.json(output);
        } catch (err) { next(err); }
    });

    return router;
}