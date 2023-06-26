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
		//Kutsutaan funktioita, jotka tekevät joukkeista taulukon ja rasteista listan ja järjestää ne sivulle
		tulokset();
		rastit();
		// Noudetaan sivulla oleva painike rastin lisäykselle ja lisätään siihen tapahtumankäsittelijä
		let rastipainike = document.getElementById("lahetyspainike");
		rastipainike.addEventListener("click", lisaaRasti);
	  }
	);

  });
 // voit määritellä omia funktioita tänne saman lohkon sisään jolloin näkevät myös xmldata-muuttujan
 /**
  * Funktio, jolla lisätään rasti xmldataan sekä sivun lopussa olevaan listaan. Ensin haetaan lomake, josta syötteet etsitään ja
  * alustetaan aputaulukot, joita käytetään rastin syötteiden oikeellisuustarkistuksissa. Sitten tarkastetaan, että syötteet
  * eivät ole tyhjiä, syötettyä koodia ei ole jo olemassa, ja että lat ja lon ovat numeroita. Kun syötteet ovat tarkastettu,
  * ne sijoitetaan uuteen rastielementtiin, ja rasti lisätään xmldataan. Onnistuneen lisäyksen jälkeen nollataan syötekentät,
  * poistetaan sivulla oleva vanha lista ja kutsutaan uudestaan rastit() - funktiota, joka rakentaa rastilistan uudestaan
  * sisällyttäen syötetyn elementin.
  * 
  * @param {*} e tapahtuma, joka kutsui funktiota
  * @var {Element} kaikkiRastit - rastit, joiden sisältöä verrataan lisättävään rastiin
  * @var {Array} vanhatTunnisteet - aputaulukko, johon kootaan talteen kaikkien olemassa olevien rastien tunnistenumerot
  * @var {Array} vanhatKoodit - aputaulukko, johon kootaan talteen kaikkien olemassa olevien rastien koodit
  * @var {Element} rastixml - syötteenä lisättävä elementti
  * @var {li} kohdeLista - sivulla oleva lista, johon lisättävä elementti liitetään
  */
let lisaaRasti = function lisaaRasti(e) {
	e.preventDefault();
	let lomake = document.getElementById("rastinLisays");
	console.log(lomake);

	let kaikkiRastit = xmldata.documentElement.getElementsByTagName("rasti");
	let vanhatTunnisteet = [];
	let vanhatKoodit = [];

	// Etsitään vanhojen rastien korkein tunnisteen arvo, jotta sen avulla voidaan muodostaa uuden rastin tunniste
	for (let rasti of kaikkiRastit) {
		vanhatTunnisteet.push(parseInt(rasti.getAttribute("tunniste")));
		vanhatKoodit.push(rasti.getAttribute("koodi"));
	}
	let entinenKorkein = vanhatTunnisteet.reduce((a,b) => Math.max(a,b, -Infinity));

	console.log(vanhatTunnisteet);

	let syotekoodi = lomake[3].value;
	let syotelat = lomake[1].value;
	let syotelon = lomake[2].value;

	// Tarkistetaan että kaikkiin kenttiin on syötetty ainakin yksi muu merkki kuin välilyönti
	if (syotekoodi.trim() == "" || syotelat.trim() == "" || syotelon.trim() == "") {
		console.log("Jokin kenttä on tyhjä");
		return;
	}

	// Tarkistetaan onko syötetty koodi jo olemassa vanhoissa rasteissa
	if (vanhatKoodit.includes(syotekoodi)) {
		console.log("Koodi on jo olemassa");
		return;
	}

	// Tarkistetaan, että lat ja lon kääntyvät oikein numerotyypeiksi
	if (isNaN(syotelat) || isNaN(syotelon)) {
		console.log("Latitude tai Longitude ei ole numero");
		return;
	}

	// Koodin syötteessä hyväksytään välilyönnit, kunhan on ainakin yksi merkki jossain vaiheessa syötettä. Ohjeistus sanoi että koodi saa
	// olla mitä tahansa, kunhan kaikki tiedot on täytetty, joten välilyönnitkin sallitaan. Huomioi, että tämä vaikuttaa rastien järjestyksessä,
	// koodit jotka alkavat välilyönneillä menevät listan alkuun
	let rastixml = xmldata.createElement("rasti");
	rastixml.setAttribute("tunniste", (entinenKorkein+1));
	rastixml.setAttribute("koodi", syotekoodi);
	rastixml.setAttribute("lat", Number(syotelat));
	rastixml.setAttribute("lon", Number(syotelon));

	// Nollataan syötekentät lisäyksen jälkeen
	lomake[3].value = "";
	lomake[1].value = "";
	lomake[2].value = "";

	// Lisätään syötetty rasti xmldataan
	xmldata.children[0].children[0].appendChild(rastixml);
	console.log(xmldata.children[0].children[0]);

	let kohdeLista = document.getElementById("rastiLista");
	// Poistetaan vanha lista, muistaen että poistaessa listan pituus lyhenee koko ajan joten pituus pitää ottaa talteen etukäteen
	let listanPituus = kohdeLista.children.length;
	for (let i=0; i<listanPituus; i++) {
		kohdeLista.children[0].remove();
	}
	rastit();
};

/**
 * Funktio, jolla muodostetaan joukkueista tulostaulukko. Ensin haetaan taulukko sivusta, ja joukkueet ja sarjat xmldatasta.
 * Sitten muodostetaan viiteobjekti sarjojen id:eistä ja kestoista, sekä muodostetaan joukkeista helposti järjestettävä taulukko.
 * Sarjan keston löytämiseksi hyödynnetään helpommatSarjat-viiteobjektia. Sitten järjestetään apuvertailufunktiota käyttämällä
 * joukkueet ensisijaisesti sarjan, ja toissijaisesti nimen mukaan. Lopuksi generoidaan tarvittava
 * taulukon rakenne uudelle joukkueelle ja lisätään joukkueen tiedot taulukkoon.
 * @var {Element} kaikkiJoukkueet - pohjadata, josta funktio ottaa taulukoitavat ja järjestettävät datapisteet
 * @var {Element} kohdeTaulukko - sivun taulukko, johon joukkueet lisätään
 * @var {Element} kaikkiSarjat - pohjadata sarjoista, joista katsotaan id:eihin täsmäävät kestot
 * @var {Object} helpommatSarjat - sarjat muutettuna javascript-objektiksi, joissa id:t ovat avaimia ja kestot arvoja
 * @var {Array} helpommatJoukkueet - aputaulukko joukkeista javascript muodossa, jotta järjestäminen olisi helpompaa
 * @var {Function} joukkueTuplaJarjestys - apufunktio, jolla joukkueet järjestetään
 */
let tulokset = function tulokset() {
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
	//let kaikkilapsiSarjat = kaikkiSarjat.getElementsByTagName("sarjat")[0];
	//let viiteSarjat = xmldata.documentElement.getElementsByTagName("sarjat")[0]; tämä sanoo että viiteSarjat ei ole iterable, ehkä etsintälause ottaa
	//väärän listan?

	// Silmukka, joka lisää taulukkoon tarvittavan rakenteen ja tiedot jokaiselle joukkueelle
	for (let joukkue of helpommatJoukkueet) {
		let tr = document.createElement("tr");
		let td = document.createElement("td");
		let tdKaksi = document.createElement("td");
		kohdeTaulukko.appendChild(tr);
		tr.appendChild(td);
		tr.appendChild(tdKaksi);
		td.textContent = joukkue["sarja"] + "h";
		tdKaksi.textContent = joukkue["nimi"];
	}
};


/**
 * Funktio, jolla rastit lisätään ja järjestetään sivun lopussa olevaan listaan. Ensin otetaan pohjadatasta rastit,
 * sitten muodostetaan taulukko, joka on helpompi järjestää. Järjestetään rastit niiden koodien perusteella, ja sitten
 * järjestetyn taulukon jokainen alkio lisätään sivun lopussa olevaan listaan
 * @var {Element} kaikkiRastit - pohjadata, josta funktio ottaa listattavat ja järjestettävät datapisteet
 * @var {Array} helpommatRastit - aputaulukko javascript muodossa, jotta rastit olisi helpompi järjestää
 * @var {Function} rastiJarjestys - apufunktio, joka järjestää rastit niiden koodi-attribuutin perusteella
 * @var {li} kohdeLista - sivulla oleva lista, johon rastit lisätään ja järjestetään
 */
let rastit = function rastit(){
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

	}
};
}
