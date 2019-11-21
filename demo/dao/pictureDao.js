const { db } = require('../db');

module.exports.pictureDao = db.prepareDao({
    collectionName: 'pictures',
    schema: {
        name: 'string?',
        url: 'string',
        uploader: 'string?',
        tags: ['string?'],
    },
    defaults: {

    },
    relations: {
        // to load pictures from a pictures dao or collection
        uploader: { collection: 'user', localKey: 'uploader', foreignKey: '_id', multiple: true }
    }
});