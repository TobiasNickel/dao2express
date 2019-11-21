const { db } = require('../db')

module.exports.userDao = db.prepareDao({
    collectionName: 'user',
    schema: {
        name: 'string',
        email: 'string',
        password: 'string?',
        age: 'number?',
    },
    map: user => {
        delete user.password;
        return user;
    },
    defaults: {

    },
    relations: {
        // to load pictures from a pictures dao or collection
        pictures: { collection: 'pictures', localKey: '_id', foreignKey: "uploader", multiple: true }
    }
});