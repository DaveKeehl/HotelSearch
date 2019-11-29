let searchField = document.getElementById("query");
searchField.addEventListener("keydown", (event) => {
	if (event.keyCode === 13) {
		setMapOnAll(null);
		composeRequest();
		document.activeElement.blur();
		window.scrollTo(0, 0);
	}
});

function composeRequest() {
	console.clear();
	var solrRequest = "http://localhost:8983/solr/nutch/select?q=title%3A";
	let processedQuery = searchField.value.replace(/ /g, "\%26");
	let rows = "&rows=100";
	let requestFormat = "&wt=json";
	var finalRequest = solrRequest + processedQuery + rows + requestFormat;
	console.log(finalRequest);
	if (searchField.value !== '') {
		fetch(finalRequest)
			.then(res => res.json())
			.then(function(data) {
				let output = '';
				let loadingTime = data.responseHeader.QTime + "ms.";
				let i = 0;
				if (data.response.numFound <= 0) {
					setMapOnAll(null);
					output = `
						<div id="nothing-to-show">
							<h1>No results.</h1>
							<img src="src/images/robot.png">
						</div>
					`;
					document.getElementById("results").innerHTML = output;
					mapToggle.classList.remove("colorful");
					mapToggle.classList.add("grayscale");
					mapContainer.classList.remove("map-open");
					mapContainer.classList.add("map-closed");
					mapState = false;
					console.log("no results");
				} else {
					data.response.docs.forEach(function(doc) {
						let content = `${doc.content}`;
						let splitContent = content.split("\n");
						// console.log(splitContent);
						let nextIsAddress = 0;
						let nextIsPhoneNumber = 0;
						let nextIsPropertyAmenities = 0;
						let nextIsRoomFeatures = 0;
						let nextIsRoomTypes = 0;
						let nextIsLanguageSpoken = 0;
						let title = `${doc.title}`;
						let wordsInTitle = title.split(" ");
						let hotel = title.split("-")[0].trim();
						let url = `${doc.url}`;
						let address;
						let phoneNumber;
						let hotelDescription;
						let score;
						let vote;
						let descriptions = [];
						let propertyAmenities = [];
						let roomFeatures =  [];
						let roomTypes = [];
						let languageSpoken = [];
						for (let i = 0; i < splitContent.length; i++) {
							if (nextIsAddress && nextIsPhoneNumber) {
								nextIsAddress = 0;
								nextIsPhoneNumber = 0;
							}
							if (nextIsPropertyAmenities) {
								if (splitContent[i] === "Show more" || splitContent[i] === "Room features") {
									nextIsPropertyAmenities = 0;
								} else {
									propertyAmenities.push(splitContent[i]);
								}
							}
							if (nextIsRoomFeatures) {
								if (splitContent[i] === "Show more" || splitContent[i] === "Room types") {
									nextIsRoomFeatures = 0;
								} else {
									roomFeatures.push(splitContent[i]);
								}
							}
							if (nextIsRoomTypes) {
								if (splitContent[i] === "Show more" || splitContent[i] === "Good to know") {
									nextIsRoomTypes = 0;
								} else {
									roomTypes.push(splitContent[i]);
								}
							}
							if (nextIsLanguageSpoken) {
								if (splitContent[i] === "Show more" || splitContent[i] === "Hotel links" || splitContent[i] === "Location" || splitContent[i].split(" ")[0] === "and") {
									nextIsLanguageSpoken = 0;
								} else {
									languageSpoken.push(splitContent[i]);
								}
							}
	
							if (splitContent[i] === "Share" && splitContent[i-1] === "Save") {
								nextIsAddress = 1;
							}
							else if (nextIsAddress === 1) {
								address = splitContent[i];
								nextIsPhoneNumber = 1;
								let tmp = splitContent[i+1].split(" ");
								if (tmp[0] === "00") {
									phoneNumber = splitContent[i+1];
								}
							}
							else if (splitContent[i] === "Read more") {
								descriptions.push(splitContent[i-1]);
							}
							else if (splitContent[i] === "About") {
								score = splitContent[i+1];
								vote = splitContent[i+2];
							}
							else if (splitContent[i] === "Property amenities") {
								nextIsPropertyAmenities = 1;
							}
							else if (splitContent[i] === "Room features") {
								nextIsRoomFeatures = 1;
							}
							else if (splitContent[i] === "Room types") {
								nextIsRoomTypes = 1;
							}
							else if (splitContent[i] === "Languages Spoken") {
								nextIsLanguageSpoken = 1;
							}
						}
						// console.log(propertyAmenities);
						// console.log(roomFeatures);
						// console.log(roomTypes);
						// console.log(languageSpoken);
						hotelDescription = descriptions[0];
						if (i < 20) {
							// ADD MARKER WITH POSITION
							console.log("result number: " + i);
							if (wordsInTitle[0] === "THE" && wordsInTitle[1] === "10" && wordsInTitle[2] === "BEST") {
								console.log("found a TOP 10 list... skipping");
							} else {
								// console.log(hotel);
								// console.log(url);
								// console.log(address);
								// console.log(phoneNumber);
								// console.log(hotelDescription);
								codeAddress(i, hotel, url, address, phoneNumber, hotelDescription, score, vote, propertyAmenities, roomFeatures, roomTypes, languageSpoken);
							}
						}
						if (typeof hotelDescription === 'undefined') {
							output += `
								<div class="result">
									<a href=${url} target="_blank" rel="noopener noreferrer">${title}</a>
									<p>${url}</p>
									<p>${doc.content}</p>
								</div>
							`;
						} else {
							output += `
								<div class="result">
									<a href=${url} target="_blank" rel="noopener noreferrer">${title}</a>
									<p>${url}</p>
									<p>${hotelDescription}</p>
								</div>
							`;
						}
	
						i = i + 1;
					});
				}
				// console.log(output);
				document.getElementById("numberOfResults").innerHTML = `${data.response.numFound}` + " results in " + loadingTime;
				document.getElementById("results").innerHTML = output;
			})
			.catch(error => console.log(error))
	} else {
		var output = `
			<div id="nothing-to-show">
				<h1>Please enter a query.</h1>
				<img src="src/images/robot.png">
			</div>
		`;
		document.getElementById("results").innerHTML = output;
		mapToggle.classList.remove("colorful");
		mapToggle.classList.add("grayscale");
		mapContainer.classList.remove("map-open");
		mapContainer.classList.add("map-closed");
		mapState = false;
		console.log("Please enter a query");
	}
}