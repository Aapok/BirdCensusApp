var vuosimuuttuja = 1;
var censusmuuttuja = 1;
var object;
var nimet = [];
var nimetparsed = [];
var span = document.getElementsByClassName("close")[0];

window.onload = function(){
	$.mobile.touchOverflowEnabled = true;
	$.ajax({
		method: "POST",
		data: {hae: "nimet"},
		url: 'php/haku.php?nimet',
		dataType:'html'
	}).done(function(response){
		var div = document.createElement("div");
		div.innerHTML = response;
		var alalajit = div.getElementsByClassName("alaji");
		for (var i= 0; i < alalajit.length; i++)
		{
			nimet.push(alalajit[i].innerHTML);
		}
		for (var i = 0; i < nimet.length; i++)
		{
			var temp = nimet[i].split("(<em>")
			fin = temp[0].split(" ");
			lat = temp[1].split("</em>)");
			nimetparsed.push({"suomenkielinen": fin[0], "latinankielinen": lat[0]})
		}
	}).fail(function(jgXHR, textStatus, errorThrown) {
			alert(textStatus + " " + errorThrown);
	})
}

function loader(){
	var $this = $( this ),
        theme = $this.jqmData( "theme" ) || $.mobile.loader.prototype.options.theme,
        msgText = $this.jqmData( "msgtext" ) || $.mobile.loader.prototype.options.text,
        textVisible = $this.jqmData( "textvisible" ) || $.mobile.loader.prototype.options.textVisible,
        textonly = !!$this.jqmData( "textonly" );
        html = $this.jqmData( "html" ) || "";
		$.mobile.loading( "show", {
            text: msgText,
            textVisible: textVisible,
            theme: theme,
            textonly: textonly,
            html: html
		});
}
function AvaaXml(xml)
{
	var lajitaulu = []
	$(xml).find("Units").each(function(){
		$(this).find("Unit").each(function(){
			$(this).find("MeasurementsOrFacts").each(function(){
				tmptaulu = []
				$(this).find("MeasurementOrFact").each(function(){
					$(this).find("MeasurementOrFactAtomised").each(function(){
						parametri = $(this).find("Parameter").text();
						arvo = $(this).find("LowerValue").text();
						tmptaulu.push({"parametri": parametri, "arvo" : arvo});
					});
				});
				lajitaulu.push(tmptaulu);
			});
		});
	});
	return lajitaulu;
}

function etsinimi(taulu)
{
	for(var i= 0; i < nimetparsed.length; i++)
	{
		if(nimetparsed[i].latinankielinen == taulu[0].arvo)
		{
			return nimetparsed[i].suomenkielinen;
		}
	}
}


function Avaa(id, lukumaara) {
	loader();
	$("#taulu2 > tbody").html("");
	$.ajax({
		method: 'POST',
		url: 'php/haku.php?xml=true', 
		data: {id: id}, 
		dataType: 'xml',
	}).done(function(response) {
		taulu = AvaaXml(response);
		vuosimuuttuja = document.getElementById('vuosi').value;
		censusmuuttuja = document.getElementById('census')
		censusmuuttuja = censusmuuttuja.options[censusmuuttuja.selectedIndex].text;
		modaaliheader = document.getElementById("modaalihead");
		modaaliheader.innerHTML = "Laskentavuosi: " + vuosimuuttuja + "<br>Laskentakausi: " + censusmuuttuja + " <br>Summattu yksilömäärä: " + lukumaara
		var tr;
		
		for (var i = 0; i < taulu.length; i++) {
			tr = $('<tr/>');
			tmp = taulu[i];
			
			finname = etsinimi(tmp);
		
			tr.append('<td> ' + finname + '</td>');
			for(var j = 0; j < 3;j++)
			{
			tr.append('<td> ' + tmp[j].arvo + '</td>');
			}
			if ( tmp.length == 3 || tmp.length > 3 && tmp[3].parametri != "YksilömääräSukupuolet")
			{
				tr.append('<td> </td>');
			}
			else if(tmp.length == 4 && tmp[3].parametri == "YksilömääräSukupuolet")
			{
				tr.append('<td> ' + tmp[3].arvo + '</td>');
			}
			$('#taulu2 tbody').append(tr);
		};
		var modal = document.getElementById("laskenta");
		$.mobile.loading( "hide" );
		modal.style.display = "block";
	}).fail(function(jgXHR, textStatus, errorThrown) {
		alert(textStatus + " " + errorThrown);
	})
	
	
}
function Sulje(){
	var modal = document.getElementById("laskenta");
	var span = document.getElementsByClassName("close")[0];
	span.onclick = function() {
    modal.style.display = "none";
	}
}

window.onclick = function(event){
	var modal = document.getElementById("laskenta");
	if (event.target == modal) {
        modal.style.display = "none";
    }
}

$(document).ready(function(){
	
	var t = $('#taulu1').DataTable({responsive: true});
	$('#jsonbutton').click(function(){
		loader();
		document.getElementById('taulu1').style.visibility = 'hidden';
		$("#taulu1 > tbody").html("");
		vuosimuuttuja = document.getElementById('vuosi').value;
		censusmuuttuja = $("#census").val();
		$.ajax({
		  method: 'POST',
		  url: 'php/haku.php?json=true', 
		  data: {vuosi: vuosimuuttuja, census: censusmuuttuja}, 
		  dataType: 'JSON',
		}).done(function(response) {
			object = $.parseJSON(response);
			
			var tr;
			for (var i = 0; i < object.length; i++) {
			t.row.add(['<a href="#" onclick="Avaa(' + object[i].documentID + ', '+ object[i].individualCount + ');"  >' + object[i].documentID + '</a>', object[i].date, object[i].team, object[i].route,object[i].grid, object[i].areaID,object[i].areaName,object[i].speciesCount, object[i].individualCount, object[i].municipality]);
			}
			t.draw(true);
			$.mobile.loading( "hide" );
			$("#taulu1").attr("style", "visibility: visible")
			if(response == "[]")
			{
				alert("Vuodelle: " + vuosimuuttuja + " ei löytynyt laskentoja");
			}
			}).fail(function(jgXHR, textStatus, errorThrown) {
			alert(textStatus + " " + errorThrown);
		})
	});
});
