"use strict";
//@ts-check
// voit tutkia käsiteltävää xmldataa suoraan osoitteesta
// https://appro.mit.jyu.fi/cgi-bin/tiea2120/randomize.cgi
// xmldata muuttuu hieman jokaisella latauskerralla

// seuraava lataa datan ja luo sen käsittelyyn tarvittavan parserin
// xmldata-muuttuja sisältää kaiken tarvittavan datan

{
  let xmldata; 

  window.addEventListener("load", function() {
	fetch('https://appro.mit.jyu.fi/cgi-bin/tiea2120/randomize.cgi')
	  .then(response => response.text())
	  .then(function(data) {
		let parser = new window.DOMParser();
		xmldata = parser.parseFromString( data, "text/xml" );
		// tästä eteenpäin omaa koodia
		console.log(xmldata);
		console.log(xmldata.documentElement);
		console.log(xmldata.documentElement.getElementsByTagName("joukkue"));
	  }
	);

  });
 // voit määritellä omia funktioita tänne saman lohkon sisään jolloin näkevät myös xmldata-muuttujan
 // ...
 // ...
 // ...
}
