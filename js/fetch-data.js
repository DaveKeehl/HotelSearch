let searchField = document.getElementById("query");
searchField.addEventListener("keydown", (event) => {
	if (event.keyCode === 13) {
		setMapOnAll(null);
		composeRequest(0);
		document.activeElement.blur();
		window.scrollTo(0, 0);
	}
});

function composeRequest() {
	console.clear();
	var solrRequest = "http://localhost:8983/solr/nutch/select?q=";
	let urlQuery = "url%3A";
	let titleQuery = "title%3A";
	let contentQuery = "content%3A";
	let queryFieldSeparator = "%20OR%20";
	let stopwords = /\b(a|an|and|are|as|at|be|but|by|for|if|in|into|is|it|no|not|of|on|or|such|that|the|their|then|there|these|they|this|to|was|will|with)\b/ig;
	let specialCharacters = /[`~!@#$%^&*()-_=+[\]{}'";,.?":{}|<>\\/]/g;
	let doubleSpaces = / +(?= )/g;
	let spaceBeforePunctuation = / +(\W)/g;
	let processedText = searchField.value.trim().replace(stopwords,'').replace(specialCharacters,'').replace(doubleSpaces,'').replace(spaceBeforePunctuation,'').replace(/ /g, "\%20OR\%20");
	let rows = "&rows=5000&start=0";
	let requestFormat = "&wt=json";
	var finalRequest = solrRequest + urlQuery + "(" + processedText + ")^2.0" + queryFieldSeparator + titleQuery + "(" + processedText + ")^1.5" + queryFieldSeparator + contentQuery + "(" + processedText + ")^1.0" + rows + requestFormat;
	console.log(finalRequest);
	if (searchField.value !== "") {
		fetch(finalRequest)
			.then(res => res.json())
			.then(function(data) {
				// console.log(data);
				let output = '';
				if (data.response.numFound === 0) {
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
					// console.log("no results");
				} else {
					let i = 0;
					skippedCounter = 0;
					keepCounter = 0;
					data.response.docs.forEach(function(doc) {
						let content = `${doc.content}`;
						// console.log(content);
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
						let skipResult = 0;
						let urlRegex1 = /https?:\/\/([a-z0-9-]+\.)*tripadvisor\.co\.uk\/Hotel_Review([a-zA-Z0-9-])*-or([0-9])*-([a-zA-Z0-9-_])*/g;
						let urlRegex2 = /https?:\/\/([a-z0-9-]+\.)*tripadvisor\.co\.uk\/Hotel_Review-s([0-9])-([a-zA-Z0-9-_])*/g;
						if (url.match(urlRegex1) || url.match(urlRegex2)) {
							// console.log("you don't want this link");
							skipResult = 1;
							skippedCounter = skippedCounter + 1;
						} else {
							// console.log(url);
							// console.log("keep this");
							keepCounter = keepCounter + 1;
						}
						let address;
						let phoneNumber;
						let hotelDescription;
						let hasNoDescription = 0;
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
							if (splitContent[i] === "Location" &&
								splitContent[i+1] === "Cleanliness" && 
								splitContent[i+2] === "Service" && 
								splitContent[i+3] === "Value" && 
								(splitContent[i+4] === "Location" || splitContent[i+4] === "Good to know" || splitContent[i+4] === "Property amenities")) {
								// console.log("this hotel has NO description!!!");
								hasNoDescription = 1;
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
							else if (splitContent[i] === "Read more" && hasNoDescription === 0) {
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
						// console.log("hasNoDescription = " + hasNoDescription);
						if (keepCounter < 20) {
							// console.log("result number: " + i);
							if (wordsInTitle[0] === "THE" && wordsInTitle[1] === "10" && wordsInTitle[2] === "BEST") {
								// console.log("found a TOP 10 list... skipping");
							} else {
								// console.log(hotel);
								// console.log(url);
								// console.log(address);
								// console.log(phoneNumber);
								// console.log(hotelDescription);
								// console.log("skipResult: " + skipResult);
								if ((typeof doc.title !== 'undefined' || typeof doc.content !== '') && skipResult === 0) {
									codeAddress(i, hotel, url, address, phoneNumber, hotelDescription, score, vote, propertyAmenities, roomFeatures, roomTypes, languageSpoken);
								}
							}
						}
						if (typeof doc.title === 'undefined' || skipResult === 1) {
							output += ``;
						}
						else if (hasNoDescription === 1 || typeof hotelDescription === 'undefined') {
							// console.log("this hotel doesn't have a description in the content field");
							output += `
								<div class="result">
									<a href=${url} target="_blank" rel="noopener noreferrer">${title}</a>
									<p>${url}</p>
									<p>${content}</p>
								</div>
							`;
						} else {
							// console.log("there is a description");
							// console.log(hotelDescription)
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
				let loadingTime = data.responseHeader.QTime + "ms.";
				let numberOfResults;
				// console.log("Total results: " + `${data.response.numFound}`);
				if (`${data.response.numFound}` > 0) {
					numberOfResults = `${data.response.numFound}` - skippedCounter;
					// console.log("Skipped results: " + skippedCounter);
					// console.log("Results shown: " + `${data.response.numFound}` + "-" + skippedCounter + " = " + numberOfResults);
				} else {
					numberOfResults = 0;
				}
				document.getElementById("numberOfResults").innerHTML = numberOfResults + " results in " + loadingTime;
				if (numberOfResults > 0) {
					document.getElementById("results").innerHTML = output;
				} else {
					document.getElementById("results").innerHTML = `
						<div id="nothing-to-show">
							<h1>No results.</h1>
							<img src="src/images/robot.png">
						</div>
					`;
				}
			})
			.catch(error => {
				console.log(error);
				output = `
					<div id="nothing-to-show">
						<h1>Ouch... Is Solr running on localhost:8983?</h1>
						<img src="src/images/robot.png">
					</div>
				`;
				document.getElementById("results").innerHTML = output;
			})
	} else {
		output = `
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
		// console.log("Please enter a query");
	}
}