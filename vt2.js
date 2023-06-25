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
		console.log(xmldata.documentElement.getElementsByTagName("sarjat"));

		tulokset();
		rastit();
	  }
	);

  });
 // voit määritellä omia funktioita tänne saman lohkon sisään jolloin näkevät myös xmldata-muuttujan
 // ...
 // ...
 // ...

function tulokset() {
	let kaikkiJoukkueet = xmldata.documentElement.getElementsByTagName("joukkue");
	let kohdeTaulukko = document.getElementById("tulosTaulukko");
	let kaikkiSarjat = xmldata.documentElement.getElementsByTagName("sarja");
	//console.log(kaikkiSarjat[0].parentNode.)
	//let kaikkilapsiSarjat = kaikkiSarjat.getElementsByTagName("sarjat")[0];
	//let viiteSarjat = xmldata.documentElement.getElementsByTagName("sarjat")[0]; tämä sanoo että viiteSarjat ei ole iterable, ehkä etsintälause ottaa
	//väärän listan?


	//Muista järjestää ensin sarjojen ja sitten joukkueen aakkosjärjestyksen mukaan!
	for (let joukkue of kaikkiJoukkueet) {
		let tr = document.createElement("tr");
		let td = document.createElement("td");
		let tdKaksi = document.createElement("td");
		kohdeTaulukko.appendChild(tr);
		tr.appendChild(td);
		tr.appendChild(tdKaksi);
		let sarjanID = joukkue.getAttribute("sarja");
		for (let vertausSarja of kaikkiSarjat) {
			if (vertausSarja.getAttribute("sarjaid") == sarjanID) {
				sarjanID = vertausSarja.getAttribute("kesto") + "h";
			}
		}
		//let sarjanKesto = 0;
		/*for (let sarja of viiteSarjat) {
			if (sarjanID == sarja.getAttribute("sarjaid")) {
				sarjanKesto = sarja.getAttribute("kesto");
			}
		}
		*/
		//let sarjanNimi = document.querySelector("data>sarjat>sarja[sarjaid='2737134']");
		//let sarjanKesto = sarjanNimi.kesto;
		td.textContent = sarjanID;
		tdKaksi.textContent = joukkue.getElementsByTagName("nimi")[0].textContent;
		//thKaksi.textContent = joukkue.lastChild.textContent;
	}
}

function rastit(){
	let kaikkiRastit = xmldata.documentElement.getElementsByTagName("rasti");
	//Tähän kaikkiRastit - järjestys aakkosjärjestykseen
	let kohdeLista = document.getElementById("rastiLista");
	for (let rasti of kaikkiRastit) {
		let li = document.createElement("li");
		kohdeLista.appendChild(li);
		li.textContent = rasti.getAttribute("koodi");
		//let li = document.createElement(li);
		//let liKaksi = document.createElement(li);

	}
}

}
