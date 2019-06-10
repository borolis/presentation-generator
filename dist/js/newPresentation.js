$(document).ready(function() {


    let formData = new FormData()
    let imagefile = document.querySelector('#file')
    formData.append('image', imagefile.files[0])

    let data = {
        title: this.title,
        tagline: this.tagline,
        slug: this.slug,
        body: this.body
    }
    formData.append('data', data)
/*
    axios.post('http://borolis.party:8080/api/v2', formData)
        .then(function (response) {
            console.log(response)
        })
        .catch(function (error) {
            alert(error)
        })
*/
})