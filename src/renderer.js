var socket = io();

var overlayCvs = document.getElementById('overlay-canvas');

var workspace = new CV_PAINTER(overlayCvs);
var dirField = document.getElementById('field-directory');
var nameField = document.getElementById('field-filename');

var DATA = {}




var player1 = document.getElementById('field-player1name');
var player2 = document.getElementById('field-player2name');
var player1score = document.getElementById('field-player1score');
var player2score = document.getElementById('field-player2score');
var gamenum = document.getElementById('field-gamenumber');
var logosrc = document.getElementById('logo-source');
var languageChoice = document.getElementById('lang-choice');

function LoadData(data) {
    player1.value = data["general"]["field_player1name"];
    player2.value = data["general"]["field_player2name"];
    player1score.value = data["general"]["field_player1score"];
    player2score.value = data["general"]["field_player2score"];
    logosrc.innerText = data["general"]["url_tournamentlogo"];
    gamenum.value = data["general"]["field_gamenumber"];
    nameField.value = data["exports"]["field_filename"];
    dirField.value = data["exports"]["field_outputdir"];

    var i,k,t;
    var sections = ['lower','upper'];
    for (i = 0; i < 2; i++) {
        for (k = 0; k < 3; k++) {
            document.getElementById(`field-deck${k+1}-${sections[i]}-reg1`).value =  data["decks"][sections[i]][`deck${k+1}`]['region1'];
            document.getElementById(`field-deck${k+1}-${sections[i]}-reg2`).value =  data["decks"][sections[i]][`deck${k+1}`]['region2'];

            var radios = document.getElementsByName(`deck${k+1}-state-${sections[i]}`);

            for (t = 0; t < radios.length; t++) {
                if (radios[t].value == data["decks"][sections[i]][`deck${k+1}`]['state']) {
                    radios[t].checked = true;
                    break;
                }
            }
        }
    }

    UpdateOverlay();
}

var regions = ['BC','BW','DE','FR','IO','MT','NX','PZ','SH','SI'];

var images = 0;
var counter = 0;

function Overlay_DeckPack(x,y, position ,reg1, reg2, state='normal') {
    images += 2;
    // Deck draw
    var deckBaseImg = new Image();
    deckBaseImg.src = `assets/props/${position == "upper" ? "upperdeckpack/udp-" : (position == "lower" ? "lowerdeckpack/ldp-" : "")}body-${state == 'selected' ? 'selected' : 'normal'}.png`;
    var borderDeckImg = new Image();
    borderDeckImg.src = `assets/props/${position == "upper" ? "upperdeckpack/udp-" : (position == "lower" ? "lowerdeckpack/ldp-" : "")}border-${state == 'crossed' ? 'crossed' : 'normal'}.png`;

    var regionUpperImg = new Image();
    var regionLowerImg = new Image();
    // Region images
    if (reg1 != "") {
        
        regionUpperImg.src = `assets/props/regionicons/${reg1}.png`; 
        images++;
    }

    if (reg2 != "") {
        
        regionLowerImg.src = `assets/props/regionicons/${reg2}.png`; 
        images++;
    }
    
    
    var deckBase = new CV_PROP(deckBaseImg, x, y);
    workspace.AppendProp(deckBase);


    if (regionUpperImg.src == regionLowerImg.src) {
        var region = new CV_PROP(regionUpperImg, x+18, y+62, 64, 64);
        workspace.AppendProp(region);
    } else {
        var regionUpper = new CV_PROP(regionUpperImg, x+18, y+30, 64, 64);
        var regionLower = new CV_PROP(regionLowerImg, x+18, y+100, 64, 64);
        workspace.AppendProp(regionUpper);
        workspace.AppendProp(regionLower);
    }

    

    var borderDeck = new CV_PROP(borderDeckImg, x, y);
    workspace.AppendProp(borderDeck);



    deckBaseImg.addEventListener('load', function() {
        counter++;
        if (counter === images) {
            workspace.RefreshDraw();
        }
    });

    borderDeckImg.addEventListener('load', function() {
        counter++;
        if (counter === images) {
            workspace.RefreshDraw();
        }
    });

    regionLowerImg.addEventListener('load', function() {
        counter++;
        if (counter === images) {
            workspace.RefreshDraw();
        }
    });

    regionUpperImg.addEventListener('load', function() {
        counter++;
        if (counter === images) {
            workspace.RefreshDraw();
        }
    });
}

function getRadioCheckedValue(radioBtns) {
    var i;
    for (i = 0; i < radioBtns.length; i++) {
        if (radioBtns[i].checked == true) {
            console.log("DETECTED: " + radioBtns[i].value);
            return radioBtns[i].value;
        }
    }
}



function UpdateOverlay() {
    images = 0;
    counter = 0;

    workspace.ClearAll();

    var image = new Image();
    images++;
    image.src = "assets/base.png";
    var baseImg = new CV_PROP(image);
    workspace.AppendProp(baseImg);
    
    
    var player1_name = new CV_TEXT_PROP(player1.value,1551,1045,'white',30,'','left','BeaufortforLOLBold');
    workspace.AppendProp(player1_name);
    var player2_name = new CV_TEXT_PROP(player2.value,40,55,'white',30,'','left','BeaufortforLOLBold');
    workspace.AppendProp(player2_name);
    
    var player1_score = new CV_TEXT_PROP(player1score.value,1867,1050,'#efb550',42,'','center','UniversforRiotGamesUltCond');
    workspace.AppendProp(player1_score);
    var player2_score = new CV_TEXT_PROP(player2score.value,357,60,'#efb550',42,'','center','UniversforRiotGamesUltCond');
    workspace.AppendProp(player2_score);

    var logo = new Image();
    
    // Logo Import
    if (logosrc.innerText != "") {
        try {
            images++;
            console.log(logosrc.innerText);
            logo.src = logosrc.innerText;
            var logoImg = new CV_PROP(logo, 10, 480, 120, 120);
            workspace.AppendProp(logoImg);
            
    
            logo.addEventListener('load', function() {
                counter++;
                if (counter === images) {
                    workspace.RefreshDraw();
                }
            });
        } catch {
            images--;
        }
    }
    var t = getRadioCheckedValue(document.getElementsByName('deck1-state-lower'));
    console.log("CHECKED: " + t);

    Overlay_DeckPack(20,80,'upper',document.getElementById('field-deck1-upper-reg1').value, document.getElementById('field-deck1-upper-reg2').value, getRadioCheckedValue(document.getElementsByName('deck1-state-upper')));
    Overlay_DeckPack(120,80,'upper',document.getElementById('field-deck2-upper-reg1').value,document.getElementById('field-deck2-upper-reg2').value,getRadioCheckedValue(document.getElementsByName('deck2-state-upper')));
    Overlay_DeckPack(220,80,'upper',document.getElementById('field-deck3-upper-reg1').value,document.getElementById('field-deck3-upper-reg2').value,getRadioCheckedValue(document.getElementsByName('deck3-state-upper')));

    Overlay_DeckPack(1600,810,'lower',document.getElementById('field-deck1-lower-reg1').value,document.getElementById('field-deck1-lower-reg2').value,getRadioCheckedValue(document.getElementsByName('deck1-state-lower')));
    Overlay_DeckPack(1700,810,'lower',document.getElementById('field-deck2-lower-reg1').value,document.getElementById('field-deck2-lower-reg2').value,getRadioCheckedValue(document.getElementsByName('deck2-state-lower')));
    Overlay_DeckPack(1800,810,'lower',document.getElementById('field-deck3-lower-reg1').value,document.getElementById('field-deck3-lower-reg2').value,getRadioCheckedValue(document.getElementsByName('deck3-state-lower')));
    

    console.log(images);
    

    var roundText = "";
    switch(languageChoice.value) {
        case "en_us":
            roundText = "R O U N D   ";
            break;
        case "vi_vn":
            roundText = "V Á N   ";
            break;
    }
    
    
    

    var round_num = new CV_TEXT_PROP(roundText + gamenum.value,210,1055,'#97baf5',54,'','center','BeaufortforLOLBold');


    workspace.AppendProp(round_num);

    image.addEventListener('load', function() {
        counter++;
        if (counter === images) {
            workspace.RefreshDraw();
        }
    });
    

    

    
};




// BUTTON EXPORT
var exportBtn = document.getElementById('overlay-export');
exportBtn.addEventListener('click', function() {
    var location = dirField.value + "\\" + nameField.value + ".png";
    console.log(location);
    var data = overlayCvs.toDataURL();
    socket.emit('export-overlay', {data: data, location: location});
});

// BUTTON REFRESH
var refreshBtn = document.getElementById('overlay-refresh');
refreshBtn.addEventListener('click', function() {
    UpdateOverlay();
});

// BUTTON OPEN DIALOG
var openDirBtn = document.getElementById('btn-opendir');
openDirBtn.addEventListener('click', function() {
    socket.emit('open-dir-dialog');
});

socket.on("send-dir", (data) => {
    dirField.value = data['directory'];
});

socket.on("send-logo-loc", (data) => {
    document.getElementById('logo-source').innerText = data['location'];
});

socket.on("load-savedata", (data) => {
    LoadData(data);
});

function UpdateData() {
    // GENERAL SECTION
    DATA["general"] = {};
    DATA["general"]["field_player1name"] = player1.value;
    DATA["general"]["field_player2name"] = player2.value;
    DATA["general"]["field_player1score"] = player1score.value;
    DATA["general"]["field_player2score"] = player2score.value;
    DATA["general"]["field_gamenumber"] = gamenum.value;
    DATA["general"]["url_tournamentlogo"] = logosrc.innerText;

    // EXPORTS SECTION
    DATA["exports"] = {};
    DATA["exports"]["field_filename"] = nameField.value;
    DATA["exports"]["field_outputdir"] = dirField.value;

    // DECKS SECTION
    DATA["decks"] = {
        "lower": {

        },
        "upper": {

        }
    };
    var i,k;
    var sections = ["lower","upper"];
    for (i = 0; i < 2; i++) {
        for (k = 0; k < 3; k++) {
            DATA["decks"][sections[i]][`deck${k+1}`] = {
                "region1": document.getElementById(`field-deck${k+1}-${sections[i]}-reg1`).value,
                "region2": document.getElementById(`field-deck${k+1}-${sections[i]}-reg2`).value,
                "state": getRadioCheckedValue(document.getElementsByName(`deck${k+1}-state-${sections[i]}`))
            }
        }
    }
}


    



// STATES

var currentState = "general";

var panelBtns = document.getElementsByClassName('panel-btn');
console.log(panelBtns);
var i;
for (i = 0; i < panelBtns.length; i++) {
    panelBtns[i].addEventListener('click', function() {
        document.getElementById(`section-${currentState}`).style.display = "none";
        currentState = this.name;
        document.getElementById(`section-${this.name}`).style.display = "block";
        
    });
}

// IMPORT LOGO PICTURE
var logoImpBtn = document.getElementById('btn-logoimport');
logoImpBtn.addEventListener('click', function() {
    socket.emit('open-pic-dialog');
});


// EXIT WINDOW
var exitBtn = document.getElementById('btn-exit');
exitBtn.addEventListener('click', function() {
    UpdateData();
    socket.emit('save-data', DATA);
    socket.emit('trigger-exit');
});

// MINIMIZE WINDOW
var minimizeBtn = document.getElementById('btn-minimize');
minimizeBtn.addEventListener('click', function() {
    socket.emit('trigger-minimize');
});


