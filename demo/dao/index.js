
const { userDao } = require('./userDao');
const { pictureDao } = require('./pictureDao');

module.exports = {
    userDao,
    pictureDao,
};

(async function() {
    await userDao.insert({
        name: 'tobias',
        email: 'tobias@tnickel.de',
    });
    var tobias = await userDao.getOneByName('tobias');
    tobias.something = 'not interesting';
    await userDao.save(tobias);
    await pictureDao.insert({
        name: 'profilePicture',
        url: 'http://localhost:80/asdfsf.jpg',
        uploader: tobias._id,
        tags: ['tobias'],
    });
    await userDao.fetchPictures(tobias);
    await userDao.removeBy_id(tobias._id);
    await pictureDao.removeByUploader(tobias._id);
})().catch(err => {
    console.log(err)
    process.exit();
});