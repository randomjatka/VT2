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
		//console.log(xmldata.documentElement.getElementsByTagName("sarjat"));
		//console.log(xmldata.documentElement.getElementsByTagName("rasti"));

		tulokset();
		rastit();
	  }
	);

  });
 // voit määritellä omia funktioita tänne saman lohkon sisään jolloin näkevät myös xmldata-muuttujan
 // ...

function tulokset() {
	let kaikkiJoukkueet = xmldata.documentElement.getElementsByTagName("joukkue");
	let kohdeTaulukko = document.getElementById("tulosTaulukko");
	let kaikkiSarjat = xmldata.documentElement.getElementsByTagName("sarja");
	console.log(kaikkiSarjat);

	//Tehdään viiteobjekti, jossa on yhdistettynä sarjojen id:t ja niiden kestot
	let helpommatSarjat = {};
	for (let kopioSarja of kaikkiSarjat) {
		helpommatSarjat[kopioSarja.getAttribute("sarjaid")] = kopioSarja.getAttribute("kesto");
	}
	//console.log(helpommatSarjat);

	let helpommatJoukkueet = [];
	for (let joukkue of kaikkiJoukkueet) {
		let kopioJoukkue = {
			"nimi": joukkue.getElementsByTagName("nimi")[0].textContent.trim(),
			// Tässä etsitään aiemmin tehdystä sarjojen viiteobjektista täsmäävä sarjan id joukkueen id:n kanssa,
			// Sitten talletetaan täsmänneen indeksin kohdalta löytyvä kesto.
			"sarja": Object.values(helpommatSarjat)[Object.keys(helpommatSarjat).findIndex(element => element == joukkue.getAttribute("sarja"))]
		};
		helpommatJoukkueet.push(kopioJoukkue);
	}
	console.log(helpommatJoukkueet);

	// Apufunktio joka järjestää joukkueet ensisijaisesti sarjan, ja toisssijaisesti nimen mukaiseen aakkosjärjestykseen
	function joukkueTuplaJarjestys(a,b){
		let tulos = a.sarja.localeCompare(b.sarja, 'fi', {sensitivity: 'base'});
		if (tulos) {
			return tulos;
		}
		if (tulos == 0) {
			let tulosKaksi = a.nimi.localeCompare(b.nimi, 'fi', {sensitivity: 'base'});
			if (tulosKaksi) {
				return tulosKaksi;
			}
		}
		return false;
	}
	helpommatJoukkueet.sort(joukkueTuplaJarjestys);
	console.log(helpommatJoukkueet);

	//console.log(kaikkiSarjat[0].parentNode.)
	//let kaikkilapsiSarjat = kaikkiSarjat.getElementsByTagName("sarjat")[0];
	//let viiteSarjat = xmldata.documentElement.getElementsByTagName("sarjat")[0]; tämä sanoo että viiteSarjat ei ole iterable, ehkä etsintälause ottaa
	//väärän listan?

	for (let joukkue of helpommatJoukkueet) {
		let tr = document.createElement("tr");
		let td = document.createElement("td");
		let tdKaksi = document.createElement("td");
		kohdeTaulukko.appendChild(tr);
		tr.appendChild(td);
		tr.appendChild(tdKaksi);
		// Tässä etsitään aiemmin tehdystä sarjojen viiteobjektista täsmäävä sarjan id joukkueen id:n kanssa,
		// Sitten talletetaan täsmänneen indeksin kohdalta löytyvä kesto.
		//let halutunSarjanIndeksi = Object.keys(helpommatSarjat).findIndex(element => element == joukkue.getAttribute("sarja"));
		//let sarjanKesto = Object.values(helpommatSarjat)[halutunSarjanIndeksi];

		/*let sarjanID = joukkue.getAttribute("sarja");
		for (let vertausSarja of kaikkiSarjat) {
			if (vertausSarja.getAttribute("sarjaid") == sarjanID) {
				sarjanID = vertausSarja.getAttribute("kesto") + "h";
			}
		}
		*/
		//let sarjanKesto = 0;
		/*for (let sarja of viiteSarjat) {
			if (sarjanID == sarja.getAttribute("sarjaid")) {
				sarjanKesto = sarja.getAttribute("kesto");
			}
		}
		*/
		//let sarjanNimi = document.querySelector("data>sarjat>sarja[sarjaid='2737134']");
		//let sarjanKesto = sarjanNimi.kesto;
		td.textContent = joukkue["sarja"] + "h";
		tdKaksi.textContent = joukkue["nimi"];
		//tdKaksi.textContent = joukkue.getElementsByTagName("nimi")[0].textContent;
		//thKaksi.textContent = joukkue.lastChild.textContent;
	}
}

function rastit(){
	let kaikkiRastit = xmldata.documentElement.getElementsByTagName("rasti");

	let helpommatRastit = [];
	for (let rasti of kaikkiRastit) {
		let helpotettuRasti = {
			"tunniste": rasti.getAttribute("tunniste"),
			"koodi": rasti.getAttribute("koodi"),
			"lat": rasti.getAttribute("lat"),
      		"lon": rasti.getAttribute("lon")
		};
		helpommatRastit.push(helpotettuRasti);
	}
	function rastiJarjestys(a,b) {
		let tulos = a.koodi.localeCompare(b.koodi, 'fi', {sensitivity: 'base'});
    	if ( tulos) {
      		return tulos;
		}
	}
	helpommatRastit.sort(rastiJarjestys);
	//console.log(helpommatRastit);

	let kohdeLista = document.getElementById("rastiLista");
	for (let helpotettu of helpommatRastit) {
		let li = document.createElement("li");
		kohdeLista.appendChild(li);
		li.textContent = helpotettu["koodi"];
		//li.textContent = rasti.getAttribute("koodi");
		//let li = document.createElement(li);
		//let liKaksi = document.createElement(li);

	}
}

}
