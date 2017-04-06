<?php 
if(isset($_GET["json"]))
{
	$vuosi = null;
	$census = null;
	if(isset($_POST["vuosi"]))
	{
		$vuosi = $_POST["vuosi"];
	}
	if(isset($_POST["census"]))
	{
		$census = $_POST["census"];
	}
	echo json_encode(file_get_contents("http://koivu.luomus.fi/talvilinnut/census.php?year=".$vuosi."&census=".$census."&json"));
}
if(isset($_GET["xml"]))
{
	$id = null;
	if(isset($_POST["id"]))
	{
		$id = $_POST["id"];
	}
	echo file_get_contents("http://hatikka.fi/?page=view&id=".$id."&source=2&xsl=false");
}
if(isset($_GET["nimet"]))
{
	echo file_get_contents("http://atlas3.lintuatlas.fi/tulokset/lajit_ryhmittain");
}
?>