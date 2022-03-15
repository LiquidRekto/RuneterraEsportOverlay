function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }

async function loadImage(imageUrl) {
    let img;
    const promise = new Promise(resolve => {
        img = new Image();
        img.onload = resolve;
        img.src = imageUrl;
    });

    await promise;
    console.log("image loaded");

    return img;
}


class CV_PAINTER {
    constructor(canvas) {
        this.width = canvas.width;
        this.height = canvas.height;
        this.workspace = canvas.getContext("2d"); // DOM ELEMENT CANVAS
        this.backgroundLayer = [];
        this.propsLayer = [];

        this.workspace.save();
    }

    
    AppendBackground(bg) {
        if (bg.constructor.name == 'CV_BACKGROUND') {
            this.backgroundLayer.push(bg);
        }
    }

    AppendProp(prop) {
        if (prop.constructor.name.includes("PROP")) {
            console.log('PROP DETECTED!')
            this.propsLayer.push(prop);
        }
    }



    RefreshDraw() {
        var pad = this.workspace;
        var bgLayer = this.backgroundLayer;
        var propLayer = this.propsLayer;

        pad.clearRect(0,0,this.width, this.height);

        // DRAW BACKGROUND
        bgLayer.forEach(function(bg) {
            if (bg.width == -1 && bg.height == -1) {
                            pad.drawImage(bg.img, bg.x, bg.y);

                    
                    } else {
                            pad.drawImage(bg.img, bg.x, bg.y, bg.width, bg.height);
                    }

            
            
        });
        propLayer.forEach(function(prop) {
            if (prop.constructor.name == "CV_PROP") {

                    if (prop.width == -1 && prop.height == -1) {
                            pad.drawImage(prop.img, prop.x, prop.y);

                    
                    } else {
                            pad.drawImage(prop.img, prop.x, prop.y, prop.width, prop.height);
                    }
                
            } else if (prop.constructor.name == "CV_TEXT_PROP") {              
                    pad.font = `${prop.size}px ${prop.fontFamily}`; 
                    pad.fillStyle = prop.color; 
                    pad.textAlign = prop.align;
                    pad.fillText(prop.text, prop.x, prop.y);
            } else if (prop.constructor.name == "CV_RECTANGLE_PROP") {
                if (prop.beginPath) {
                    pad.beginPath();
                } 
                if (prop.roundCornerRadius > 0) {
                    pad.moveTo(prop.x + prop.roundCornerRadius, prop.y);
                    pad.lineTo(prop.x + prop.width - prop.roundCornerRadius, prop.y);
                    pad.arcTo(prop.x + prop.width, prop.y, prop.x + prop.width, prop.y + prop.roundCornerRadius, prop.roundCornerRadius);
                    pad.lineTo(prop.x + prop.width, prop.y + prop.height - prop.roundCornerRadius);
                    pad.arcTo(prop.x + prop.width, prop.y + prop.height, prop.x + prop.width - prop.roundCornerRadius, prop.y + prop.height, prop.roundCornerRadius);
                    pad.lineTo(prop.x + prop.roundCornerRadius, prop.y + prop.height);
                    pad.arcTo(prop.x, prop.y + prop.height, prop.x, prop.y + prop.height - prop.roundCornerRadius, prop.roundCornerRadius);
                    pad.lineTo(prop.x, prop.y + prop.roundCornerRadius);
                    pad.arcTo(prop.x, prop.y, prop.x + prop.roundCornerRadius, prop.y, prop.roundCornerRadius);
                } else {
                    pad.moveTo(prop.x, prop.y);
                    pad.lineTo(prop.x + prop.width, prop.y);
                    pad.lineTo(prop.x + prop.width, prop.y + prop.height);
                    pad.lineTo(prop.x, prop.y + prop.height);
                    pad.lineTo(prop.x, prop.y);
                }
                pad.closePath();
                if (prop.color.constructor.name == 'CV_GRADIENT') {
                    var gradient = pad.createLinearGradient(prop.color.pos1[0], prop.color.pos1[1], prop.color.pos2[0], prop.color.pos2[1]);
                    var i;
                    for (i = 0; i < prop.color.colorBank.length; i++) {
                        gradient.addColorStop(prop.color.colorBank[i]["pos"], prop.color.colorBank[i]["color"]);
                    }
                    pad.fillStyle = gradient;
                } else {
                    pad.fillStyle = prop.color;
                }
                
                switch(prop.mode) {
                    case "fill":
                        pad.fill();
                        break;
                    case "stroke":
                        pad.stroke();
                        break;
                    case "clip":
                        pad.clip();
                        break;
                    default:
                        break;
                }

                
            } else if (prop.constructor.name == "CV_PROP_NOCLIP") {
                pad.restore();
                pad.save();
                
            } else if (prop.constructor.name == "CV_CIRCLE_PROP") {
                if (prop.beginPath) {
                    pad.beginPath();
                } 
                pad.arc(prop.x, prop.y, prop.radius, 0, Math.PI*2);
                if (prop.color.constructor.name == 'CV_GRADIENT') {
                    var gradient = pad.createLinearGradient(prop.color.pos1[0], prop.color.pos1[1], prop.color.pos2[0], prop.color.pos2[1]);
                    var i;
                    for (i = 0; i < prop.color.colorBank.length; i++) {
                        gradient.addColorStop(prop.color.colorBank[i]["pos"], prop.color.colorBank[i]["color"]);
                    }
                    pad.fillStyle = gradient;
                } else {
                    pad.fillStyle = prop.color;
                }
                switch(prop.mode) {
                    case "fill":
                        pad.fill();
                        break;
                    case "stroke":
                        pad.stroke();
                        break;
                    case "clip":
                        pad.clip();
                        break;
                    default:
                        break;
                }
            } else if (prop.constructor.name == "CV_CURVE_PROP") {
                if (prop.beginPath) {
                    pad.beginPath();
                } 
                var new_pos_points = [];
                new_pos_points.push([prop.x, prop.y]);
                prop.points.forEach(function(point) {
                    var new_x = prop.x + point[0];
                    var new_y = prop.y + point[1];
                    new_pos_points.push([new_x,new_y]);
                });
                console.log(new_pos_points);
                bezierCurveThrough(pad, new_pos_points, 0.275);

                if (prop.color.constructor.name == 'CV_GRADIENT') {
                    var gradient = pad.createLinearGradient(prop.color.pos1[0], prop.color.pos1[1], prop.color.pos2[0], prop.color.pos2[1]);
                    var i;
                    for (i = 0; i < prop.color.colorBank.length; i++) {
                        gradient.addColorStop(prop.color.colorBank[i]["pos"], prop.color.colorBank[i]["color"]);
                    }
                    pad.fillStyle = gradient;
                    pad.strokeStyle = gradient;
                } else {
                    pad.fillStyle = prop.color;
                    pad.strokeStyle = prop.color;
                }
                switch(prop.mode) {
                    case "fill":
                        pad.fill();
                        break;
                    case "stroke":
                        pad.lineWidth = prop.strokeLength;
                        pad.stroke();
                        break;
                    case "clip":
                        pad.clip();
                        break;
                    default:
                        break;
                }
            } else if (prop.constructor.name == "CV_PROP_FILL") {
                if (prop.color.constructor.name == 'CV_GRADIENT') {
                    var gradient = pad.createLinearGradient(prop.color.pos1[0], prop.color.pos1[1], prop.color.pos2[0], prop.color.pos2[1]);
                    var i;
                    for (i = 0; i < prop.color.colorBank.length; i++) {
                        gradient.addColorStop(prop.color.colorBank[i]["pos"], prop.color.colorBank[i]["color"]);
                    }
                    pad.fillStyle = gradient;
                } else {
                    pad.fillStyle = prop.color;
                }
                pad.fill();
            } else if (prop.constructor.name == "CV_PROP_STROKE") {
                if (prop.color.constructor.name == 'CV_GRADIENT') {
                    var gradient = pad.createLinearGradient(prop.color.pos1[0], prop.color.pos1[1], prop.color.pos2[0], prop.color.pos2[1]);
                    var i;
                    for (i = 0; i < prop.color.colorBank.length; i++) {
                        gradient.addColorStop(prop.color.colorBank[i]["pos"], prop.color.colorBank[i]["color"]);
                    }
                    pad.strokeStyle = gradient;
                } else {
                    pad.strokeStyle = prop.color;
                }
                pad.stroke();
            } else if (prop.constructor.name == "CV_POLY_PROP") {
                if (prop.beginPath) {
                    pad.beginPath();
                } 
                prop.indices.forEach(function(indice) {
                    if (prop.indices.indexOf(indice) == 0) {
                        pad.moveTo(prop.x+ indice[0],prop.y + indice[1]);
                    } else {
                        pad.lineTo(prop.x+ indice[0],prop.y + indice[1]);
                    }
                });
                if (prop.color.constructor.name == 'CV_GRADIENT') {
                    var gradient = pad.createLinearGradient(prop.color.pos1[0], prop.color.pos1[1], prop.color.pos2[0], prop.color.pos2[1]);
                    var i;
                    for (i = 0; i < prop.color.colorBank.length; i++) {
                        gradient.addColorStop(prop.color.colorBank[i]["pos"], prop.color.colorBank[i]["color"]);
                    }
                    pad.strokeStyle = gradient;
                    pad.fillStyle = gradient;
                } else {
                    pad.fillStyle = prop.color;
                    pad.strokeStyle = prop.color;
                }
                switch(prop.mode) {
                    case "fill":
                        pad.fill();
                        break;
                    case "stroke":
                        pad.lineWidth = prop.strokeLength;
                        pad.stroke();
                        break;
                    case "clip":
                        pad.clip();
                        break;
                    default:
                        break;
                }
            } else if (prop.constructor.name == "CV_PROP_CLIP") {
                pad.clip();
            }
            
            
        });

        
        // DRAW PROPS
    }

    ClearAll() {
        this.backgroundLayer = [];
        this.propsLayer = [];
        this.workspace.clearRect(0,0,this.width, this.height);
    }

    RemoveClips() {
        this.workspace.restore();
        this.workspace.save();
    }

    UpdateDimension(canvas) {
        this.width = canvas.width;
        this.height = canvas.height;
    }



}

class CV_BACKGROUND {
    constructor(img, x=0, y=0, width=-1, height=-1) {
        this.img = img;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    SetPosition(x,y) {
        this.x = x;
        this.y = y;
    }


}

class CV_PROP {
    constructor(img, x=0, y=0, width=-1, height=-1) {
        this.img = img;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    SetPosition(x,y) {
        this.x = x;
        this.y = y;
    }


}

class CV_TEXT_PROP {
    constructor(text,x,y,color,size,weight,align,fontFamily) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.text = text;
        this.size = size;
        this.weight = weight;
        this.align = align;
        this.fontFamily = fontFamily;
    }
}

class CV_PROP_CLIP {
    constructor() {

    }
}

class CV_POLY_PROP {
    constructor(x,y,indices,mode,color,beginPath=true) {
        this.x = x;
        this.y = y;
        this.indices = indices;
        this.mode = mode;
        this.color = color;
        this.beginPath = beginPath;
    }
}

class CV_RECTANGLE_PROP {
    constructor(x,y,width,height,mode,color,beginPath=true,roundRadius=0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.roundCornerRadius = roundRadius;
        this.mode = mode;
        this.beginPath = beginPath;
    }
}

class CV_CIRCLE_PROP {
    constructor(x,y,radius,mode,color,beginPath=true) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.mode = mode;
        this.color = color;
        this.beginPath = beginPath;
    }
}

class CV_PROP_NOCLIP {
    constructor() {

    }
}

class CV_PROP_FILL {
    constructor(color) {
        this.color = color;
    }
}

class CV_PROP_STROKE {
    constructor(color) {
        this.color = color;
    }
}

class CV_GRADIENT {
    constructor(x1=0,y1=0,x2=0,y2=0) {
        this.colorBank = [];
        this.pos1 = [x1,y1];
        this.pos2 = [x2,y2];
    }

    AddColor(position, color) {
        this.colorBank.push({"pos":position, "color":color});
    }

    SetPositions(x1,y1,x2,y2) {
        this.pos1 = [x1,y1];
        this.pos2 = [x2,y2];
    }
}

class CV_CURVE_PROP {
    constructor(x,y,points,mode,color,lineWidth,beginPath=true) {
        this.x = x;
        this.y = y;
        this.points = points;
        this.mode = mode;
        this.color = color;
        this.strokeLength = lineWidth;
        this.beginPath = beginPath;
    }
}