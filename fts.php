<?php 
header('Access-Control-Allow-Origin: *');// So that POST from Github can receive responses

/*------------------------------------------------------------------------------
 * === Dhamma Full Text Search: https://vpnry.github.io/fts
 * License: for free distribution only; no responsibilites.
 * Last modified: uPnry 04 Feb 2021 (Initial: 09 Nov 2020)

 * == To do: 
 * escapse some special chars like ,'` etc. in the query,
 * currently it does not work if the query contains these chars

 * == Security notes:
 * The query syntaxes below may not be secure enough, 
 * It is initially just a quick and easy implement for personal localhost use.
 * Try to improve them if you want to use it in a serious online production.
 * ----------------------------------------------------------------------------*/


mb_internal_encoding("UTF-8");

// For Heroku server, need to set to false due to storage limit
// $fullOfflineData = false;

$fullOfflineData = false;

if (isset($_POST['uType'])) {

  /*--------------------------------*/
  $typing = trim($_POST['uType']);
  $selectedDB = $_POST['database'];
  $selectedPScript = $_POST['uSelectScript'];
  $sMode = $_POST['sMode'];
  $dval = (int)$_POST['dval'];
  $etl = $_POST['etl'];
  $limit = $_POST['limit'];
  $sortBy = $_POST['order'];
  /*--------------------------------*/


  $sortByEchoRember = $sortBy;
  if ($sortBy == 'bm25') {
    $sortBy = "bm25(pn)";
    $sortByEchoRember = 'bm25';
  }

  $u1 = "<u>";
  $u2 = "</u>";
  if ($selectedPScript != 'ro' && $selectedDB == "palitptk") {
    $u1 = "@_@"; // Escapse pali converter as it also converts <u>
    $u2 = "@__@";
    $uType2 = trim($_POST['uType2']);
    if (strlen($uType2) > 0) {
      $typing = $uType2;
    }
  }
  
  // database table name: pn, columns: path, cont

  $typingJS = str_replace('`', '\`', $typing);
  $typingEcho = $typing;
  $snippetType = "snippet(pn, 1, '" . $u1 . "', '" . $u2 . "', ' ~~ '," . $etl . ")";
  if ($etl > 64) {
    $etl = 64;
  } else if ($etl == 0) {
    $snippetType = "highlight(pn, 0, '', '')";
  }

  if ($fullOfflineData) {
    switch ($selectedDB) {
      case "palitptk":
        $dbConnection = new SQLite3("data_offline/tptk.sqlite3");
        include_once("lib/tipitakaAppfileTitle.php");
        break;
      case "ttpv_budsas.net":
        $dbConnection = new SQLite3("data_offline/pnebooks_full_budsas.sqlite3");
        break;
      case "elibrary":
        $dbConnection = new SQLite3("data_offline/patxt_full.sqlite3");
        break;
      case "dictionary":
        $dbConnection = new SQLite3("data_offline/palidict_full.sqlite3");
        break;
      case "pnebook6jan2021":
        $dbConnection = new SQLite3("data_offline/pnebook6jan2021.sqlite3");
        break;
      case "engsentence":
        $dbConnection = new SQLite3("data_offline/engsentenceWebster1913.sqlite3");
        break;

      default:
        echo ("Unknown database.<br>This database might not be available for this release.");
        exit;
        break;
    }
  } else {
    switch ($selectedDB) {
      case "palitptk":
        $dbConnection = new SQLite3("data/tptk.sqlite3");
        include_once("lib/tipitakaAppfileTitle.php");
        break;
      case "ttpv_budsas.net":
        $dbConnection = new SQLite3("data/ttpv_budsas.net.sqlite3");
        break;
      case "elibrary":
        $dbConnection = new SQLite3("data/paaukmed.sqlite3");
        break;
      case "dictionary":
        $dbConnection = new SQLite3("data/palidict.sqlite3");
        break;
      default:
        echo ("Unknown database.<br>This database might not be available for this release.");
        exit;
        break;
    }
  }

  // ----------------------------------------------------------
  // TODO: IMPROVE THIS ESCAPE STRING PROPERLY
  // ----------------------------------------------------------

  //Delete these chars: `€£¥^[]{}§|~…\<>!?@#$&*()'"%-+=/;:,.
  $puncts = ["`","€","£","¥","^","[","]","{","}","§","|","~","…","<",">","!","?","@","#","$","&","*","(",")","'",'"',"%","-","+","=","/",";",":",",","."];
  $typing = str_replace($puncts, ' ', $typing);
  $typing = SQLite3::escapeString($typing);
  
  if ($sMode == 'dts') {
    $sql = <<<NBN
SELECT path, $snippetType cont FROM pn WHERE cont MATCH 'NEAR($typing, $dval)' ORDER BY $sortBy LIMIT $limit
NBN;
  } else if ($sMode == 'fts') {
    $sql = <<<NBN
SELECT path, $snippetType cont FROM pn WHERE cont MATCH '"$typing"' ORDER BY $sortBy LIMIT $limit
NBN;
  } else if ($sMode == 'sms') {
    // Thanks https://stackoverflow.com/a/1612015
    // MATCH "$typing" will simply list all docs that contain all of the word in the phrase
    // If the keywords contain any of ,.' and so on, it will yield errors
    $typing = preg_replace("/[^\p{L}\p{Nd}]+/u", " ", $typing);
    $typing = trim($typing);
    $sql = <<<NBN
SELECT path, $snippetType cont FROM pn WHERE cont MATCH "$typing" ORDER BY $sortBy LIMIT $limit
NBN;
  } else if ($sMode == 'pfs') {
    $sql = <<<NBN
SELECT path, $snippetType cont FROM pn WHERE cont MATCH '"$typing" * ' ORDER BY $sortBy LIMIT $limit
NBN;
  }

  $result = $dbConnection->query($sql);
  $merges = [];
  $totalHit = 0;
  while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    $totalHit++;
    $p = $row['path'];
    // this extra append </b> fix bold issues
    $c = '<span class="fm" id="cc' . $totalHit . '"> <z>(' . $totalHit . ')</z> ' . $row['cont'] . ' </span></b>';
    if (array_key_exists($p, $merges)) {
      $merges[$p][] = $c;
    } else {
      $merges[$p] = [$c];
    }
  }

  $resultHTML = "";
  $totalFilesFound = 0;
  if (count($merges) > 0) {
    foreach ($merges as $k => $te) {
      $totalFilesFound++;
      $k = trim($k);
      $k = substr($k, 0, -4); //.txt
      $kMapTitle = $k;
      $fileLink = 'data/' . $k;
      $fcodt = explode("/", $k);
      $fcode = end($fcodt);
      if ($selectedDB == 'palitptk') {
        $kMapTitle = $tipitakaAppfileTitle[$fcode];
        if ($fullOfflineData) {
          $fileLink = '../tptkhtml/index.html?a=' . $fcode . '-1-' . $selectedPScript;
        } else {
          $fileLink = 'https://tipitaka.app/?a=' . $fcode . '-1-' . $selectedPScript;
        }
      } else if ($selectedDB == 'ttpv_budsas.net') {
        $klen = strlen($k);
        $isBudsasNet = substr($k, 3, 10); //vi/budsas.net
        if ($isBudsasNet == 'budsas.net') {
          if ($fullOfflineData) {
            $fileLink = '../' . substr($k, 3, $klen);
          } else {
            $fileLink = 'https://' . substr($k, 3, $klen);
          }
        } else {
          $fileLink = 'https://tamtangpaliviet.net/TTPV/' . substr($k, 8, $klen);
        }
      } else if ($selectedDB == 'elibrary') {
          $fileLink = 'https://vpnry.github.io/paauk/';
      }
      // this extra prepend </b> fix bold issues
      $resultHTML .= '</b><div class="title" onclick="sh(' . $totalFilesFound . ')" id="te' . $totalFilesFound . '">' . '<c> ' . $totalFilesFound . '</c>' . '<d> Hits: {' . count($te) . '}</d><a target="_blank" href="' . $fileLink . '"> ' . '<span id="ta' . $totalFilesFound . '">' . $kMapTitle . "</span></a></div>";
      $resultHTML .= "\n<div class='hid' id='ce" . $totalFilesFound . "'>" . join("<br><br>\n", $te) . "\n</div><br>\n";
    }
  }

  if (count($merges) < 1) {
    echo "<div id='noResult'>No results!<br>Try again with <u><b>Simple match</b></u> or other search modes, or check your keywords again.<br>
        <br><b>Notes:</b> all keywords must be in <u><b>unicode</b></u>.<br>If your 'copy & paste' text from a certain book does not work here, try typing yourself again in <b>unicode</b>, normally a few words are enough!</div>";
    return;
  }

  // ----------------------------------------------------------
  // IF HAVE RESULT
  // ----------------------------------------------------------

  // ----------------------- DEBUG ----------------------------
  // echo "Query: <code>" . $typingEcho . "</code><br>";
  // echo "Code: <code>" . $sql . "</code><br>";

  echo "Limit hit setting: <b>" . $limit . "</b>";
  echo " | Total hits: <b>" . $totalHit . "</b> | Total files: <b>" . $totalFilesFound . "</b>";

  if ($totalHit == $limit) {
    echo (" | Need more results? => Increase <b>Limit hit setting</b>. 
        <div style='text-align: center; color:grey;'>Click on each title(avoid its link) to hide/show its content. Or <button id='toggleButton' onclick='toggleHideAll(" . $totalFilesFound . ")'>Show All</button></div> <br>");
  } else {
    echo (" <div style='text-align: center; color:grey;'>Click on each title(avoid its link) to hide/show its content. Or <button id='toggleButton' onclick='toggleHideAll(" . $totalFilesFound . ")'>Show All</button></div> <br>");
  }

  echo $resultHTML;

  if (($selectedPScript != 'ro') && ($selectedDB == 'palitptk')) {
    $convertPaliScript = <<<NBN
        <script id="runJSFromResponse">
          setTimeout(function () {convertPaliContent($totalFilesFound, $totalHit, "$selectedPScript");},500);
        </script>
NBN;
    echo $convertPaliScript;
  }
} else {
}
