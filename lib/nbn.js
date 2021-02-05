/***********************************************************
 * Dhamma Full Text Search: https://vpnry.github.io/fts
 * License: for free distribution only; no responsibilites.
 * Last modified: uPnry 14 Jan 2021 (Initial: 09 Nov 2020)

 * Required: for pali script converter, need
 * paliScriptConverter.js loaded before running this script
 ***********************************************************/

const SCRIPT_KEY = "pDhammaFTS14Jan21";
const DB_KEY = "pDhammaFTSDB04Feb21";

var foldAllStatus = true;
var totalFilesFound = 0;
var totalHits = 0;

let usedPaliScript = localStorage.getItem(SCRIPT_KEY);
let currentPaliScript = usedPaliScript ? usedPaliScript : "ro";

let lastUseDatabase = localStorage.getItem(DB_KEY);
let currentUseDatabase = lastUseDatabase ? lastUseDatabase : "palitptk";

let UINTEXT = "";

function runOnStartUpLoaded() {
  /* ---- RUN ON START UP WHEN ALL ARE LOADED --- */
  // buildPaliScriptMenu();
  load_lastUserPaliScript("uSelectScript");
  load_lastDatabase(currentUseDatabase);

  listen_UserSelectScript("uSelectScript");
  listen_DbChoices("database");
  toggle_ScriptMenu(currentUseDatabase);
  
  document.getElementById("uType").addEventListener("input", uTyping, { passive: false });
  document.getElementById("clearText").addEventListener("click", clearTextArea, { passive: false });

  handle_POST_RESPONSE();
}

function handle_POST_RESPONSE() {
  let forme = document.getElementById("mainform");
  let resulte = document.getElementById("allResults");
  let searchButton = document.getElementById("searchButton");

  forme.onsubmit = e => {
    e.preventDefault();
    onClickSubmitChangeButtonStyle("uType");
    fetch(forme.action, {
      method: "post",
      body: new FormData(forme)
    })
      .then(res => res.text())
      .then(htmlres => {
        if (currentUseDatabase === "engsentence") {
          htmlres = webster_Format(htmlres);
          resulte.innerHTML = htmlres;
          setTimeout(webster_ClickExpand("toggleButton"), 0);
        } else {
          resulte.innerHTML = htmlres;
        }
        searchButton.style = "";
        searchButton.textContent = "Search";
        if (currentUseDatabase === "palitptk") {
          restoreUINTEXT("uType");
        }
        let rspose = document.getElementById("runJSFromResponse");
        if (rspose) eval(rspose.innerHTML);
      })
      .catch(errors => {
        resulte.innerHTML = errors;
		searchButton.style = "";
        searchButton.textContent = "Search";
      });
  };
}

function onClickSubmitConvertPaliToRo(inID, outID) {
  // Indexed pali tipitaka is in Roman only
  let nowText = document.getElementById(inID).value;
  UINTEXT = nowText.trim();
  if (UINTEXT.length < 1) return;
  let inRo = toPaliScript(UINTEXT, "ro");
  document.getElementById(outID).value = inRo;
  // Update: allow search in any language
  document.getElementById(inID).value = inRo;
}

function restoreUINTEXT(inID) {
  if (currentUseDatabase === "palitptk") {
    document.getElementById(inID).value = UINTEXT;
  }
}

function onClickSubmitChangeButtonStyle(inID) {
  if (currentUseDatabase === "palitptk") {
    onClickSubmitConvertPaliToRo("uType", "uType2");
  }
  let inText = document.getElementById(inID).value;
  inText = inText.trim();
  if (inText.length > 0) {
    let searchButton = document.getElementById("searchButton");
    searchButton.style.boxShadow = `0 -8px 6px -1px orange, 0 8px 6px 0 orange`;
    searchButton.textContent = "Working ...";
  }
}

function listen_DbChoices(radioname) {
  let radios = document.getElementsByName(radioname);
  for (let ele of radios) {
    // This is a trick to pass value to event listener,
    // put the main function inside another function in order to pass parameter
    ele.addEventListener(
      "change",
      function (e) {
        handleDbChoices(ele.value);
      },
      { passive: false }
    );
  }
}

function toggle_ScriptMenu(val) {
  document.getElementById(val).checked = true;
  let menu = document.getElementById("buildPaliScriptMenu");
  if (val == "palitptk") {
    menu.style.display = "";
  } else {
    menu.style.display = "none";
  }
}

function handleDbChoices(val) {
  currentUseDatabase = val;
  let menu = document.getElementById("buildPaliScriptMenu");
  if (val == "palitptk") {
    menu.style.display = "";
  } else {
    menu.style.display = "none";
  }
  localStorage.setItem(DB_KEY, val);
}

function load_lastDatabase(currentUseDatabase) {
  try {
    let ele = document.getElementById(currentUseDatabase);
    ele.checked = true;
  } catch (e) {
    console.log(`${e} \n\n
	Error when loading last used database with ID: ${currentUseDatabase}.
	Is this id name changed in the UI?
	It is now removing the mising key and reloading.`);
	localStorage.remove(DB_KEY);
	window.location.reload(true);
  }
}

function load_lastUserPaliScript(id) {
  try {
    let ele = document.getElementById(id);
    ele.value = currentPaliScript;
  } catch (e) {
    console.log(`${e} \n\nError when loading last used pali script.
	Is this id ${id} changed in the UI?
	It is now removing the mising key and reloading.`);
	localStorage.remove(SCRIPT_KEY);
	window.location.reload(true);
  }
}

function buildPaliScriptMenu() {
  let html = `
  <label for="uSelectScript">Pāḷi tipiṭaka display script</label>
  <select id="uSelectScript" name="uSelectScript">
  <option disabled value="">--Please choose an option--</option>`;
  for (let s of CVT.paliScriptInfo) {
    html += `<option value="${s[0]}" ${s[0] == currentPaliScript ? "selected" : ""} >${s[1][0]} - ${s[1][1]}</option>`;
  }
  html += "</select>";
  document.getElementById("buildPaliScriptMenu").innerHTML = html;
  listen_UserSelectScript("uSelectScript");
}

function listen_UserSelectScript(id) {
  document.getElementById(id).addEventListener("change", saveUserScript, { passive: false });
}

function toPaliScript(mixText, currentPaliScript) {
  // (17 pali scripts +  auto detect) mix-> sinh -> userscipt
  return CVT.TextProcessor.convert(CVT.TextProcessor.convertFromMixed(mixText), currentPaliScript);
}

function convertPaliContent(totalFilesFound, totalHits, currentPaliScript) {
  if (currentPaliScript == "ro") {
    return;
  }

  // Convert file title
  let i = 0;
  for (; i < totalFilesFound; i++) {
    let ele = document.getElementById("ta" + (i + 1));
    let ntext = toPaliScript(ele.textContent, currentPaliScript);
    //ele.innerHTML = ntext.replace(/@_@/g, "<u>").replace(/@__@/g, "</u>");
    ele.textContent = ntext;
  }

  // Convert content
  let c = 0;
  try {
    for (; c < totalHits; c++) {
      let ele = document.getElementById("cc" + (c + 1));
      if (!ele) continue;
      let ntext = toPaliScript(ele.innerHTML, currentPaliScript);
      ele.innerHTML = ntext.replace(/@_@/g, "<u>").replace(/@__@/g, "</u>");
    }
  } catch (ee) {
    console.log("Error occured when converting pali script: " + ee + " id: " + c);
  }
}

function saveUserScript() {
  let select = document.getElementById("uSelectScript");
  let svalue = select.options[select.selectedIndex].value;
  svalue = svalue ? svalue : "ro";
  currentPaliScript = svalue;
  localStorage.setItem(SCRIPT_KEY, svalue);
}

function uTyping() {
  // if (currentPaliScript == "ro") {
  //   let t = document.getElementById("uType");
  //   t.value = typeVelthuis(t.value);
  // }
  // 20 Dec 2020: allow all
  let t = document.getElementById("uType");
  t.value = typeVelthuis(t.value);
}

function sh(id) {
  let ele = document.getElementById("ce" + id);
  if (ele.hasAttribute("class")) {
    ele.removeAttribute("class");
  } else {
    ele.setAttribute("class", "hid");
  }
}

function toggleHideAll(totalFilesFound) {
  let i = 0;
  if (foldAllStatus) {
    for (; i < totalFilesFound; i++) {
      let id = "ce" + (i + 1);
      let ele = document.getElementById(id);
      ele.removeAttribute("class");
    }
    foldAllStatus = false;

    let toggleB = document.getElementById("toggleButton");
    toggleB.style.background = "#fff";
    toggleB.textContent = "Collapse All";
  } else {
    for (; i < totalFilesFound; i++) {
      let id = "ce" + (i + 1);
      let ele = document.getElementById(id);
      ele.setAttribute("class", "hid");
    }
    foldAllStatus = true;
    let toggleB = document.getElementById("toggleButton");
    toggleB.style.background = "#58E973";
    toggleB.textContent = "Show All";
  }
}

function clearTextArea() {
  document.getElementById("uType").value = "";
  document.getElementById("uType").focus();
}

function typeVelthuis(uType) {
  /* pnry 09 Nov 2020 */
  // 20 Dec 2020 allow all
  // if (currentPaliScript == "ro") {
  return uType
    .replace(/aa/g, "ā")
    .replace(/ii/g, "ī")
    .replace(/uu/g, "ū")
    .replace(/m\.\./g, "ṁ")
    .replace(/\.m/g, "ṃ")
    .replace(/\.n/g, "ṇ")
    .replace(/\.d/g, "ḍ")
    .replace(/\.l/g, "ḷ")
    .replace(/\.r/g, "ṛ")
    .replace(/\.s/g, "ṣ")
    .replace(/s\.\./g, "ś")
    .replace(/\.t/g, "ṭ")
    .replace(/,,n/g, "ñ")
    .replace(/n\.\./g, "ṅ")
    .replace(/AA/g, "Ā")
    .replace(/II/g, "Ī")
    .replace(/UU/g, "Ū")
    .replace(/M\.\./g, "Ṁ")
    .replace(/\.M/g, "Ṃ")
    .replace(/\.N/g, "Ṇ")
    .replace(/\.D/g, "Ḍ")
    .replace(/\.L/g, "Ḷ")
    .replace(/\.R/g, "Ṛ")
    .replace(/\.S/g, "Ṣ")
    .replace(/S\.\./g, "Ś")
    .replace(/\.T/g, "Ṭ")
    .replace(/,,N/g, "Ñ")
    .replace(/N\.\./g, "Ṅ");
  // } else {
  //   return uType;
  // }
}

/* ------------ 10 Jan 2020 format Webster ------------*/
function webster_ReplaceIPA(match_str, s1 /*, sn*/) {
  s1 = s1.replace(/\*/g, "<span style='color:red;'>*</span>");
  return `<b style='color:blue;'><i>/${s1}/</i></b>`;
}

function webster_Format(htmlres) {
  /* Format IPA */
  htmlres = htmlres.replace(/\\\\(.*?)\\\\/g, webster_ReplaceIPA);

  /* Format \n and example sentence quotes */
  // JS Regex replace: use $& for whole match string, $1 for group 1st, etc...
  htmlres = htmlres.replace(/\\n([\d]+)/g, "<br><span style='color:red;'>[$1]</span>");
  htmlres = htmlres.replace(/\\n([A-Z]+.*?<u>.*?--[A-Z]+.*?\.)/g, "<br><br><b style='color:green;'> $1 </b>");
  htmlres = htmlres.replace(/\\n/g, " ");
  return htmlres;
}

function webster_ClickExpand(id) {
  foldAllStatus = true;
  id = document.getElementById(id);
  if(id) id.click();
  foldAllStatus = true;
}

window.onload = runOnStartUpLoaded;
