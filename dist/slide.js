
$(function() {
    updateDraggable()
});

let imageUrl = "../background.jpg"

let currentLayer
let textEditor
let slideDiv

function updateClickHandlers()
{
    $(".draggable").click(function() {
        currentLayer = $(this)
        textEditor.summernote('code', $(this).html())
        $(".note-editable").focus()
    })
}

function updateDraggable()
{
    $(".draggable").draggable()
}


$(document).ready(function() {

	textEditor = $('#textEditor')
	slideDiv = $("#slide")

	slideDiv.css({'background-image' : 'url("' + imageUrl + '")'})
	slideDiv.css({'background-size' : 'cover'})
	slideDiv.css({'width':'100%'})
	slideDiv.css({'height':'768px'})
	
	$(".draggable").click(function() {
		currentLayer = $(this)
		textEditor.summernote('code', $(this).html())
		$(".note-editable").focus()
	})

	function debugBase64(base64URL){
		var win = window.open();
		win.document.write('<iframe src="' + base64URL  + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
	}

	function sendImageToServer(base64URL)
	{
		$.post( "/uploadImage", { user: "John", base64: base64URL } )
			.done(function( data ) {
			console.log( "Server response: " + data )
			console.log(data)
		});
	}

	$("#btnSave").click(function() {
		html2canvas(slideDiv.get(0),{
				allowTaint:true
			}).then(function(canvas) {
			document.body.appendChild(canvas)

			let base64image = canvas.toDataURL('image/png')

			debugBase64(base64image) //opens new window with image(base64)
			sendImageToServer(base64image)

		}).catch(function(err) {
			console.log(err)
		})
	})


	$("#btnAddLayer").click(function() {

        let $newDiv = $("<div/>")   // creates a div element
            .addClass("container-fluid")
            .addClass("draggable")
            .html("<div style=\"text-align: center;\"><span>Text</span></div>")

        slideDiv.append($newDiv)
        updateClickHandlers()
        updateDraggable()
	})

  
	textEditor.summernote({
			toolbar: [
				['style', ['bold', 'italic', 'underline', 'clear']],
				['font', ['bold', 'underline', 'clear']],
				['fontsize', ['fontsize']],
				['fontname', ['fontname']],
				['color', ['color']],
				['para', ['ul', 'ol', 'paragraph']],
				['table', ['table']],
				['insert', ['link', 'picture', 'video']],
				['view', ['fullscreen', 'codeview', 'help']],
			],
			fontSizes: ['8', '9', '10', '11', '12', '14', '18', '24', '36', '48' , '64', '82', '150'],
		callbacks: {
    			onChange: function(contents, $editable) {
	    			let markupStr = $('#textEditor').summernote('code')
					if(markupStr =='')
					{
						alert("Слой удалён!")
						currentLayer.remove()
					}
					currentLayer.html(markupStr)
    		}
    	}
	})
})



 