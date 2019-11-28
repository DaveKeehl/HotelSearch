import React from "react"
// import { Link } from "gatsby"
import Styles from "./home-css-modules.module.css"

import Layout from "../components/layout"
import SEO from "../components/seo"

function composeRequest() {
	var solrRequest = "http://localhost:8983/solr/nutch/select?q=content%3A";
	let queryText = document.getElementById("query").value;
	let processedQuery = queryText.replace(/ /g, "%20");
	let requestFormat = "&wt=json";
	var finalRequest = solrRequest + processedQuery + requestFormat;
	var dummyRequest = "https://jsonplaceholder.typicode.com/users";
	// var jsonData;
	// var results;
	console.log(finalRequest);
	if (queryText !== "") {
		fetch(finalRequest)
			.then((res) => res.json())
			.then(function(data) {
				// jsonData = data;
				// results = data.response.numFound;
				console.log(data);
				// console.log(jsonData);
			})
			.catch((error) => console.log(error))
	} else {
		console.log("Please enter a query");
	}
}

const IndexPage = () => (
  <Layout>
	<SEO title="Home"/>
	<div className={Styles.search}>
		<h1 onClick={composeRequest}>HotelSearch.</h1>
		<p>A hotel search engine for <span>Italy</span>, <span>France</span> and <span>Spain</span></p>
		<form method="POST" action="results">
			<input id="query" type="text" name="query" placeholder="Enter a query" autoFocus/>
			<input type="submit" value="Search"/>
		</form>
		<p>Made by <a href="https://github.com/DaveKeehl/ir-project" target="_blank" rel="noopener noreferrer">Davide Ciulla</a> for a <a href="https://www.usi.ch/en" target="_blank" rel="noopener noreferrer">USI</a> project.</p>
	</div>
  </Layout>
)

export default IndexPage
