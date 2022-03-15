var myFont = new FontFace('BeaufortforLOLBold', 'url(assets/fonts/Beaufort-for-LOL-Bold.ttf)');
var myFont2 = new FontFace('UniversforRiotGamesUltCond', 'url(assets/fonts/UniversforRiotGames-UltCond.otf)');
//var myFont4 = new FontFace('VH-THICCCBOI-SEMIBOLD', 'url(FONTS/VH-THICCCBOI-SemiBold.otf)');
myFont.load().then(function(font){

                    // with canvas, if this is ommited won't work
        document.fonts.add(font);
                  
});
myFont2.load().then(function(font){

    // with canvas, if this is ommited won't work
document.fonts.add(font);
  
});