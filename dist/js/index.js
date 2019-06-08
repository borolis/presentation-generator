let countOfBlocks = 1
let allPresentations

function onEditClick(event) {
    //console.log(event)
    let presentationId = event.currentTarget.parentElement.parentElement.parentElement.parentElement.getAttribute('presentationId')
    console.log('edit '+presentationId)
    //alert( "Edit clicked" )
}

function onRemoveClick(event) {

    let presentationId = event.currentTarget.parentElement.parentElement.parentElement.parentElement.getAttribute('presentationId')
    console.log('remove ' + presentationId)
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
        ///TODO A ROW
        ///TODO ADD BLOCK
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
            "                            <button type=\"submit\" class=\"btn remove\">\n" +
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

        ///TODO JUST ADD BLOCK
        countOfBlocks++
}



$(document).ready(function() {
    let indx = 1
    $.post( "/api/v1", { query: "getMyPresentations" }, (data) => {
        allPresentations = data.result.presentations
        allPresentations.forEach((currentPresentation)=> {
            addPresentationToList(currentPresentation)
        })

        $('.btn.edit').click(onEditClick)

        $('.btn.remove').click(onRemoveClick)

    }, "json");


   // alert('lel')
    //$(".img").children().attr('src','/upload/1.jpg');
})