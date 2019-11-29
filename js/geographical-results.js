var map;
var geocoder;
var markers = [];

function initMap() {

	geocoder = new google.maps.Geocoder();

	var Geneva = {lat: 46.2022200, lng: 6.1456900};

	var mapOptions = {
		center: Geneva,
		zoom: 4,
		mapTypeId: 'roadmap'
	};
	
	map = new google.maps.Map(document.getElementById('map'), mapOptions);

};

function codeAddress(i, hotel, url, address, phoneNumber, hotelDescription, score, vote, propertyAmenities, roomFeatures, roomTypes, languageSpoken) {
	console.log("entered");
	geocoder.geocode({ 'address': address}, function(results, status){
		if (status == 'OK') {
			let coordinates = results[0].geometry.location;
			map.setCenter(coordinates);
			let processedPropertyAmenities = [];
			let processedRoomFeatures = [];
			let processedRoomTypes = [];
			let processedLanguageSpoken = [];
			for (let i = 0; i < 8; i++) {
				processedPropertyAmenities.push((" ").concat(String(propertyAmenities[i])));
				processedRoomFeatures.push((" ").concat(String(roomFeatures[i])));
			}
			for (let i = 0; i < roomTypes.length; i++) {
				processedRoomTypes.push((" ").concat(String(roomTypes[i])));
			}
			for (let i = 0; i < languageSpoken.length; i++) {
				processedLanguageSpoken.push((" ").concat(String(languageSpoken[i])));
			}
			if (typeof phoneNumber === 'undefined') {
				var contentString = `
					<div id="content">
						<div id="siteNotice">
						</div>
						<h1 id="firstHeading" class="firstHeading">${hotel}</h1>
						<div id="bodyContent">
							<p><span>Address</span>: ${address}</p>
							<p><span>Score</span>: ${score} (${vote})</p>
							<p><span>Property amenities</span>: ${processedPropertyAmenities}</p>
							<p><span>Room features</span>: ${processedRoomFeatures}</p>
							<p><span>Room types</span>: ${processedRoomTypes}</p>
							<p><span>Languages spoken</span>: ${processedLanguageSpoken}</p>
							<p class="description">
								<span>Description</span>:
								</br>
								${hotelDescription}
							</p>
							<p>More info at:</p>
							<a href=${url} target="_blank">${url}</a>
						</div>
					</div>
				`;
			} else {
				var contentString = `
					<div id="content">
						<div id="siteNotice">
						</div>
						<h1 id="firstHeading" class="firstHeading">${hotel}</h1>
						<div id="bodyContent">
							<p><span>Address</span>: ${address}</p>
							<p><span>Phone number</span>: ${phoneNumber}</p>
							<p><span>Score</span>: ${score} (${vote})</p>
							<p><span>Property amenities</span>: ${processedPropertyAmenities}</p>
							<p><span>Room features</span>: ${processedRoomFeatures}</p>
							<p><span>Room types</span>: ${processedRoomTypes}</p>
							<p><span>Languages spoken</span>: ${processedLanguageSpoken}</p>
							<p class="description">
								<span>Description</span>:
								</br>
								${hotelDescription}
							</p>
							<p>More info at:</p>
							<a href=${url} target="_blank">${url}</a>
						</div>
					</div>
				`;
			}
			var infowindow = new google.maps.InfoWindow({
				content: contentString
			});
			var marker = new google.maps.Marker({
				map: map,
				position: coordinates,
				title: address
			});
			markers.push(marker);
			marker.addListener('click', function() {
				infowindow.open(map, marker);
			});
		} else {
			console.log(i + ") " + hotel + '--> Geocode for was not successful for the following reason: ' + status);
		}
	});
}

function setMapOnAll(map) {
	for (var i = 0; i < markers.length; i++) {
		setTimeout(function(){
			markers[i].setMap(map);
		},3000);
	}
}

function clearOverlays() {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	markers.length = 0;
}

let mapToggle = document.querySelector(".resultsHeader img");
let mapContainer = document.getElementsByClassName("mapContainer")[0];
let mapState = false;

mapToggle.addEventListener("click", event => {
	if (query.value !== "") {
		if (mapState === false) {
			mapToggle.classList.remove("grayscale");
			mapToggle.classList.add("colorful");
			mapContainer.classList.remove("map-closed");
			mapContainer.classList.add("map-open");
			mapState = true;
		} else {
			mapToggle.classList.remove("colorful");
			mapToggle.classList.add("grayscale");
			mapContainer.classList.remove("map-open");
			mapContainer.classList.add("map-closed");
			mapState = false;
		}
	} else {
		alert("Please enter a query.");
	}
});