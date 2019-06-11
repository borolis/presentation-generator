let countOfBlocks = 1
let allPresentations

function onEditClick(event) {
    //console.log(event)
    let presentationId = event.currentTarget.parentElement.parentElement.parentElement.parentElement.getAttribute('presentationId')
    localStorage.setItem( 'currentPresentationId', presentationId );
    console.log('edit:' + presentationId)
    window.location.href = '/slide'
    //alert( "Edit clicked" )
}

function onRemoveClick(event) {
    let confirm = window.confirm("Are you sure want to remove?")
    if(confirm)
    {
        let presentationId = event.currentTarget.parentElement.parentElement.parentElement.parentElement.getAttribute('presentationId')
        console.log('remove:' + presentationId)
        axios.post('/api/v1', {query: "deletePresentation", data:{presentationId:presentationId}})
            .then((response) => {
                window.location.href = '/'

            })
            .catch((error) => {
                alert(error)
            })

    }

}

function addPresentationToList(currentPresentation)
{
    if(countOfBlocks % 3 === 0)
    {
        let row = $("<div class=\"row presentations\"></div>")
        let table = $("<table style=\"height: 50px;\">\n" +
            "            <tbody>\n" +
            "            <tr>\n" +
            "                <td class=\"align-baseline\"></td>\n" +
            "            </tr>\n" +
            "            </tbody>\n" +
            "        </table>")

        $(".presentation-list").append(row)
        $(".presentation-list").append(table)
    }

       // console.log(allPresentations)

            //console.log(currentPresentation)
        let presentationHtml =$("<div class=\"col-lg-4 presentationItem\">\n" +
            "                <div class=\"ih-item square effect6 from_top_and_bottom\">\n" +
            "                    <a href=\"#\" onclick=\"return false\">\n" +
            "                        <div class=\"img\"><img class=\"presentationImage\" src=\"upload/1.jpg\" alt=\"img\"></div>\n" +
            "                        <div class=\"info\">\n" +
            "                            <button type=\"submit\" class=\"btn edit\">\n" +
            "                                <i class=\"fa fa-pencil\"></i>\n" +
            "                            </button>\n" +
            "                            <button type=\"submit\" class=\"btn remove confirm\">\n" +
            "                                <i class=\"fa fa-trash-o\"></i>\n" +
            "                            </button>\n" +
            "                            <p class=\"presentationName\"></p>\n" +
            "                        </div>\n" +
            "                    </a>\n" +
            "                </div>\n" +
            "            </div>")
        presentationHtml.attr('id', countOfBlocks.toString())
        presentationHtml.attr('presentationId', currentPresentation.id.toString())


        let body = presentationHtml.children().children()

        let imgClass = body.children('.img')
        let infoClass = body.children('.info')

        imgClass.children().attr('src', currentPresentation.content.preview_image.path)
        infoClass.children('.presentationName').html(currentPresentation.content.name)




    console.log(body.find('info'))
        presentationHtml.children().children().children().find('info').find('presentationName').html(currentPresentation.content.name)

    $(".row.presentations").last().append(presentationHtml)


    countOfBlocks++
}



$(document).ready(function () {
    axios.post('/api/v1', {query: "getMyPresentations"})
        .then((response) => {
            console.log(response)
            allPresentations = response.data.result.presentations
            allPresentations.forEach((currentPresentation) => {
                addPresentationToList(currentPresentation)
            })
            $('.btn.edit').click(onEditClick)

            $('.btn.remove').click(onRemoveClick)
        })
        .catch((error) => {
            alert(error)
        })
})
