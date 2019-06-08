let moment = require('moment');
let db = require('./database');


async function getImagePathById(imageId, userId) {
    // console.log('try tos get data from DB');
    let sql = 'select * from images where _id = $1 and _owner_id = $2',
        values = [imageId, userId];
    return await db.query(sql, values)
        .then((data) => {
            console.log("here")
            //console.log(data);
            return {
                id: data.rows[0]._id,
                owner_id: data.rows[0]._owner_id,
                path: data.rows[0]._path,
                something: data.rows[0]._something
            };
        })
        .catch((err) => {
            console.log(err);
            return null;
        });
}

async function getPresentationById(presentationId, userId) {
    // console.log('try tos get data from DB');
    let sql = 'select * from presentations where _id = $1 and _owner_id = $2',
        values = [presentationId, userId];
    return await db.query(sql, values)
        .then((data) => {
            console.log(data);
            return {
                id: data.rows[0]._id,
                owner_id: data.rows[0]._owner_id,
                content: data.rows[0]._content
            };
        })
        .catch((err) => {
            console.log(err);
            return null;
        });
}

async function getMyPresentations(user) {
    if (user === undefined) {
        return null;
    }
    // console.log('try tos get data from DB');
    let sql = 'select * from presentations where _owner_id = $1',
        values = [user.id];

    let jsonPresentationsList = []
    await db.query(sql, values)
        .then(async (data) => {

            for (let i = 0; i < data.rows.length; i++) {
                let jsonPresentation = {
                    id: data.rows[i]._id,
                    owner_id: data.rows[i]._owner_id,
                    content: data.rows[i]._content
                }
                jsonPresentation.content.preview_image = await getImagePathById(jsonPresentation.content.preview_image, user.id)
                console.log(jsonPresentation.content.preview_image)
                jsonPresentationsList.push(jsonPresentation)
            }
        })
        .catch((err) => {
            console.log(err);
            return null;
        })
    return jsonPresentationsList;
}


module.exports = {
    getImagePathById: getImagePathById,
    getPresentationById: getPresentationById,
    getMyPresentations: getMyPresentations
}