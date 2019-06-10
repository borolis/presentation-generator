let moment = require('moment');
let db = require('./database');


async function getImagePathById(imageId, userId) {
    // console.log('try tos get data from DB');
    let sql = 'select * from images where _id = $1 and _owner_id = $2',
        values = [imageId, userId];
    return await db.query(sql, values)
        .then((data) => {
            //console.log("here")
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
            //console.log(data);
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

async function newPresentation(user, presentationName, countOfSlides, previewImage)
{
    if (user === undefined) {
        return null;
    }



    let owner_id = user.id
    let content = {
        preview_image: previewImage,
        name: presentationName,
        count_of_slides: countOfSlides
    }

    ///TODO make slides for presentation

    let sql = 'INSERT INTO presentations (_owner_id, _content) VALUES($1, $2) RETURNING *',
        values = [owner_id, content];

    await db.query(sql, values, (err, res) => {
        if (err) {
            console.log(err.stack)
        } else {
            //console.log('query result')
            //console.log(res.rows[0])
            return res.rows[0]._id
            // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
        }
    })
    //console.log(values)
}


async function newImage(user, path, something)
{
    if (user === undefined) {
        return null;
    }

    let owner_id = user.id


    let sql = 'INSERT INTO images (_owner_id, _path, _something) VALUES($1, $2, $3) RETURNING *',
        values = [owner_id, path, something];

    let result = await new Promise((resolve, reject)=> {
        db.query(sql, values, (err, res ) => {
            if (err) {
                console.log(err.stack)
                reject(err.stack)
            } else {
                console.log(res.rows[0])
                console.log('blyadskiy ID ' + res.rows[0]._id)

                resolve(res.rows[0]._id)
            }
        })
    })
    return result
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
                //console.log(jsonPresentation.content.preview_image)
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
    getMyPresentations: getMyPresentations,
    newPresentation: newPresentation,
    newImage: newImage
}