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

async function getPresentationById(presentationId, user) {
    // console.log('try tos get data from DB');
    let sql = 'select * from presentations where _id = $1 and _owner_id = $2',
        values = [presentationId, user.id];
    return await db.query(sql, values)
        .then(async (data) => {
            //console.log(data);
            let result = {
                id: data.rows[0]._id,
                owner_id: data.rows[0]._owner_id,
                content: data.rows[0]._content
            }
            result.content.preview_image = await getImagePathById(result.content.preview_image, user.id)
            return result
        })
        .catch((err) => {
            console.log(err);
            return null;
        });
}

async function deletePresentationById(presentationId, user) {
     console.log('deletePresentationById');
    let sql = 'DELETE FROM presentations where _id = $1 and _owner_id = $2',
        values = [presentationId, user.id];
    return await db.query(sql, values)
        .then(async (data) => {
            console.log(data);
            return true
        })
        .catch((err) => {
            console.log(err);
            return null;
        });
}


async function deleteSlidesByPresentationId(presentationId, user) {
    console.log('deletePresentationById');
    let sql = 'DELETE FROM slides where _presentation_id = $1',
        values = [presentationId];
    return await db.query(sql, values)
        .then(async (data) => {
            console.log(data);
            return true
        })
        .catch((err) => {
            console.log(err);
            return null;
        });
}

async function getSlidesForPresentation(presentationId, user)
{
    let slides = []

    let sql = 'select * from slides WHERE _presentation_id = $1 ORDER BY _id ',
        values = [presentationId];
    await db.query(sql, values)
        .then(async (data) => {

                for (let i = 0; i < data.rows.length; i++) {
                    let slide = {
                        id: data.rows[i]._id,
                        presentation_id: data.rows[i]._presentation_id,
                        content: data.rows[i]._content
                    }
                    //console.log(jsonPresentation.content.preview_image)
                    slides.push(slide)
                }
                    console.log(slides);
            }
        )
        .catch((err) => {
            console.log(err);
            return null;
        });
    return slides
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

    let insertedRowId = -1
    let sql = 'INSERT INTO presentations (_owner_id, _content) VALUES($1, $2) RETURNING *',
        values = [owner_id, content];

    await db.query(sql, values)
        .then((res) => {
            insertedRowId = res.rows[0]._id
        })
        .catch((err) => {
            console.log(err);
            return null;
        })
    return insertedRowId
}



async function updatePresentation(user, presentationId, presentationName, countOfSlides, previewImage, slidesId)
{
    if (user === undefined) {
        return null;
    }


    let owner_id = user.id
    let content = {
        preview_image: previewImage,
        name: presentationName,
        count_of_slides: countOfSlides,
        slides_id: slidesId
    }

    let insertedRowId = -1
    let sql = 'UPDATE presentations SET _content = $1 WHERE _id = $2 AND _owner_id = $3 RETURNING *',
        values = [content, presentationId, owner_id];

    await db.query(sql, values)
        .then(async (res) => {
            insertedRowId = res.rows[0]._id
        })
        .catch((err) => {
            console.log(err);
            return null;
        })
    return insertedRowId
}


async function updateSlide(slide, user)
{
    if (user === undefined) {
        return null;
    }

    let updatedRowId = -1
    let sql = 'UPDATE slides SET _content = $1 WHERE _id = $2 AND _presentation_id = $3 RETURNING *',
        values = [slide.content, slide.id, slide.presentation_id];
    console.log('values:')
    console.log(values)
    await db.query(sql, values)
        .then(async (res) => {
            console.log(res)
            updatedRowId = res.rows[0]._id
        })
        .catch((err) => {
            console.log(err);
            return null;
        })
    return updatedRowId
}



async function addNewSlide(user, presentation_id, backgroundImage)
{
    if (user === undefined) {
        return null;
    }
    //_id
    //_presentation_id
    //_content
    let html = [
        {
            "item": "<div class=\"container-fluid draggable\"><h1 style=\"text-align: center;\">Default Title</h1></div>"
        },
        {
            "item": "<div class=\"container-fluid draggable\"><h1 style=\"text-align: center;\">Default Title</h1></div>"
        },
        {
            "item": "<div class=\"container-fluid draggable\"><h1 style=\"text-align: center;\">Default Title</h1></div>"
        }
    ]


    let content = {
        background: backgroundImage,
        html: html
    }

    let insertedRowId = -1
    let sql = 'INSERT INTO slides (_presentation_id, _content) VALUES($1, $2) RETURNING *',
        values = [presentation_id, content];

    await db.query(sql, values)
        .then(async (res) => {
            insertedRowId = res.rows[0]._id
            console.log('слайд создан, id:' + insertedRowId)
        })
        .catch((err) => {
            console.log(err);
            return null;
        })
    return insertedRowId
}


//UPDATE films SET kind = 'Dramatic' WHERE kind = 'Drama';

async function newImage(user, path, something)
{
    if (user === undefined) {
        return null;
    }

    let owner_id = user.id


    let sql = 'INSERT INTO images (_owner_id, _path, _something) VALUES($1, $2, $3) RETURNING *',
        values = [owner_id, path, something];

    let insertedRowId = -1

    await db.query(sql, values)
        .then(async (res) => {
            insertedRowId = res.rows[0]._id
        })
        .catch((err) => {
            console.log(err);
        })

    return insertedRowId
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
        .then(async (res) => {

            for (let i = 0; i < res.rows.length; i++) {
                let jsonPresentation = {
                    id: res.rows[i]._id,
                    owner_id: res.rows[i]._owner_id,
                    content: res.rows[i]._content
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
    deletePresentationById: deletePresentationById,
    deleteSlidesByPresentationId: deleteSlidesByPresentationId,
    getMyPresentations: getMyPresentations,
    newPresentation: newPresentation,
    updatePresentation: updatePresentation,
    newImage: newImage,
    addNewSlide: addNewSlide,
    getSlidesForPresentation: getSlidesForPresentation,
    updateSlide: updateSlide
}