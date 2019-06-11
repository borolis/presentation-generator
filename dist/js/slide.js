
$(function() {
    updateDraggable()
});

let imageUrl = "../background.jpg"
let zip
let currentLayer
let textEditor
let slideDiv

let sly

let currentPresentationId
let currentPresentation
let allSlides

let currentSlide

let currentSlidePosition = -1
let previousSlidePosition = -1

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

function getSlidesForPresentation()
{
	axios.post('/api/v1', {query: "getSlidesForPresentation", data:{presentationId:currentPresentation.id}})
		.then((response) => {
			allSlides = response.data.result.slides
			console.log('all slides:')
			console.log(allSlides)

			fillSlider()
			displaySlider()

		})
		.catch((error) => {
			alert(error)
		})
}

function getPresentationById() {
	axios.post('/api/v1', {query: "getPresentation", data:{presentationId:currentPresentationId}})
		.then((response) => {
			currentPresentation = response.data.result.presentation
			console.log('currentPresentation')
			console.log(currentPresentation)

			setBackground(currentPresentation.content.preview_image.path)
			getSlidesForPresentation()

			//debugger
		})
		.catch((error) => {
			alert(error)
		})

}

function pushSlideToServer(slide) {
	//debugger
	axios.post('/api/v1', {query: "updateSlide", data:{slide:slide}})
		.then((response) => {

			//currentPresentation = response.data.result.presentation
			console.log('update slide response:')
			console.log(response.data)
			//console.log(currentPresentation)

			//setBackground(currentPresentation.content.preview_image.path)
			//getSlidesForPresentation()

			//debugger
		})
		.catch((error) => {
			alert(error)
		})

}




function loadSlide(slide)
{

}

function fillSlider(){
	let $sliderItems = $('.slider-items')
	for(let i =0; i < allSlides.length; i++)
	{
		$sliderItems.append("<li>" + (i+1) + "</li>")
	}

}

function displaySlider()
{

	let $frame = $('#centered')
	let $wrap = $frame.parent()

	// Call Sly on frame
	sly = new Sly($frame, {
			horizontal: 1,
			itemNav: 'centered',
			smart: 1,
			activateOn: 'click',
			mouseDragging: 1,
			touchDragging: 1,
			releaseSwing: 1,
			startAt: 0,
			scrollBar: $wrap.find('.scrollbar'),
			scrollBy: 1,
			speed: 300,
			elasticBounds: 1,
			easing: 'easeOutExpo',
			dragHandle: 1,
			dynamicHandle: 1,
			clickBar: 1,

			// Buttons
			prev: $wrap.find('.prev'),
			next: $wrap.find('.next')
		},
		{
			active: (eventName, itemIndex) => {
				previousSlidePosition = currentSlidePosition
				currentSlidePosition = itemIndex
				if(previousSlidePosition !== -1)
				{
					let slideDivChildren = slideDiv.children('.draggable')
					console.log('slideDivChildren')
					console.log(slideDivChildren)
					allSlides[previousSlidePosition].content.html = []
					for(let i = 0; i < slideDivChildren.length; i++)
					{
						allSlides[previousSlidePosition].content.html.push({item:slideDivChildren[i].outerHTML})
					}

					pushSlideToServer(allSlides[previousSlidePosition])
					console.log(allSlides[previousSlidePosition])
				}

				currentSlide = allSlides[itemIndex]

				console.log('currentSlide')
				console.log(currentSlide)
				console.log('itemIndex')
				console.log(itemIndex)
				console.log('slideDiv')
				console.log(slideDiv)

				slideDiv.html('')

				for(let i=0; i < currentSlide.content.html.length; i++)
				{
					slideDiv.append(currentSlide.content.html[i].item)
				}
				updateDraggable()
				updateClickHandlers()
			}
		}
	)

	sly.init()
}


function setBackground(url)
{
	console.log(imageUrl)

	slideDiv.css({'background-image': 'url("' + url + '")'})
	slideDiv.css({'background-size': 'cover'})
	slideDiv.css({'width': '100%'})
	slideDiv.css({'height': '768px'})
}


$(document).ready(function () {
	textEditor = $('#textEditor')
	slideDiv = $("#slide")
	currentPresentationId = localStorage['currentPresentationId']

	getPresentationById()


	$(".draggable").click(function () {
		currentLayer = $(this)
		textEditor.summernote('code', $(this).html())
		$(".note-editable").focus()
	})

	function debugBase64(base64URL) {
		var win = window.open();
		win.document.write('<iframe src="' + base64URL + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
	}

	function sendImageToServer(base64URL) {

		// не используется
		$.post("/uploadImage", {user: "John", base64: base64URL})
			.done(function (data) {
				console.log("Server response: " + data)
				console.log(data)
			});
	}

	async function savePresentation() {
		zip = new JSZip();
		for (let i = 0; i < allSlides.length; i++) {
			sly.activate(i)
			await html2canvas(slideDiv.get(0), {
				allowTaint: true
			}).then((canvas) => {
				let imgData = canvas.toDataURL("image/jpeg", 1.0);
				zip.file("slide_" + i + ".jpeg", imgData.split('base64,')[1], {base64: true});
			}).catch((err) => {
				console.log("error" + err)
			})
		}

		zip.generateAsync({
			type: "blob"
		}).then(function (content) {
			download(content, currentPresentation.content.name +'.zip')
			//window.location.href = "data:application/zip;base64," + content;
		})
	}

	$("#btnSave").click(()=> {
		savePresentation()
	})

/*
	$("#btnSave").click(()=> {

		html2canvas(slideDiv.get(0), {
			allowTaint: true
		})
			.then(function (canvas) {
			document.body.appendChild(canvas)

			let base64image = canvas.toDataURL('image/png')

			debugBase64(base64image) //opens new window with image(base64)
			sendImageToServer(base64image)

		}).catch(function (err) {
			console.log(err)
		})
	})
*/

	$("#btnAddLayer").click(function () {

		let $newDiv = $("<div/>")   // creates a draggable div element
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
		fontSizes: ['8', '9', '10', '11', '12', '14', '18', '24', '36', '48', '64', '82', '150'],
		callbacks: {
			onChange: function (contents, $editable) {
				let markupStr = $('#textEditor').summernote('code')
				if (markupStr == '') {
					alert("Слой удалён!")
					currentLayer.remove()
				}
				currentLayer.html(markupStr)
			}
		}
	})
})



 