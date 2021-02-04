const ctx = document.getElementById("canvas").getContext("2d");
const overlayctx = document.getElementById("overlay-canvas").getContext("2d");
const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");
const xInput = document.getElementById("x");
const yInput = document.getElementById("y");
const zInput = document.getElementById("z");
const zDisplay = document.getElementById("zDisplay");
const canvasHolder = $('#canvasHolder');
let maxCanvasSideLength = Math.min(window.innerWidth - 500, window.innerHeight - 500);
const defaultValues = {
    width: 1920,
    height: 1080,
    z: 150,
    x: 0,
    y: 0
}
let poiFactor = 0.7;
let data = setDefualtData();
let lastData = "";
let width = defaultValues.width;
let height = defaultValues.height;
let z = defaultValues.z;
let x = defaultValues.x;
let y = defaultValues.y;
let rMax = 1;
xInput.value = x;
yInput.value = y;
zInput.value = z;
let lastWidth = 0;
let lastHeight = 0;
let CSV = false;
let lastxPoint = 0;
let lastYPoint = 0;
let lastZ = 0;
let refresh = false;
let first = true;
CSVdata = "";
openButton = document.getElementById("openInputs");
document.getElementById("openInputs").style.display = "none";
xInput.value = 0;
yInput.value = 0;
let overlayChange = false;
let overlay = false;
let mouseMoved = false;
let scaleFactor = 1;
let lastScaleFactor = scaleFactor;
let lastMouseX = 0;
let lastMouseY = 0;
let mouseX = 0;
let mouseY = 0;

function resizeCanvas(newWidth, newHeight) {
    $("#canvasHolder").height(newHeight); 
    $("#canvasHolder").width(newWidth);
    $('#canvas').attr({width: canvasHolder.innerWidth(), height: canvasHolder.innerHeight()});
}

function setDefualtData() {
    let dataString = "";
    for (let i = 0; i<= 90; i+=1) {
        dataString+=(i + ", ");
        dataString+="1, ";
    }
    //dataString -= ", ";
    return dataString;
}
function toggleOverlay() {
    overlay = !overlay;
    refresh = true;
}

function updateValues() {
    width = parseInt(widthInput.value);
    height = parseInt(heightInput.value);
    z = parseFloat(zInput.value);
    if (!isNaN(parseFloat(xInput.value))) {
        x = parseFloat(xInput.value);
    }
    if (!isNaN(parseFloat(yInput.value))) {
        y = parseFloat(yInput.value);
    }
    if (isNaN(width)) {
        width = defaultValues.width;
    } 
    if (isNaN(height)) {
        height = defaultValues.height;
    } 
    //xDisplay.innerHTML = x;
    //yDisplay.innerHTML = y;
    zDisplay.innerHTML = z;
    z = Math.abs(z-(defaultValues.z*2));
    halfWidth = width/2;
    halfHeight = height/2;
    xInput.max = width;
    xInput.min = (-1*width);
    yInput.max = height;
    yInput.min = (-1*height);
    
}

function closeOptions() {
    document.getElementById("inputs").style.display = "none";
    document.getElementById("openInputs").style.display = "block";
}
function openOptions() {
    document.getElementById("inputs").style.display = "block";
    document.getElementById("openInputs").style.display = "none";
}
function chartResults(angles, intensities) {
    $('#graph').remove();
    $('#inputs').append("<canvas id = 'graph'></canvas>");
    $('#graph').css({
        "width":"500",
        "height":"31vh"
    })
    const chartCanvas = document.getElementById('graph').getContext('2d');
    let chartData = data.split(',');
    if (first) {
        Intensities = [];
        angles.forEach((a) => {
            Intensities.push(parseFloat(Math.cos(a * Math.PI/180).toFixed(2)));
        });
    }
    const chart = new Chart(chartCanvas, {
        // The type of chart we want to create
        type: 'line',
    
        // The data for our dataset
        data: {
            labels: angles,
            datasets: [{
                label: 'light falloff curve',
                backgroundColor: 'rgb(10, 20, 255)',
                borderColor: 'rgb(250, 250, 255)',
                data: Intensities,
                lineTension: 0
                
            }]
        },
    
        
    });
}

function line(x1, y1, x2, y2, lineWidth) {
    overlayctx.beginPath();
    overlayctx.moveTo(x1, y1);
    overlayctx.lineWidth = lineWidth;
    overlayctx.lineTo(x2, y2);
    overlayctx.stroke();
}
function arc(x, y) {
    overlayctx.beginPath();
    setInverseColor(x, y);
    overlayctx.arc(x, y, 3, 0, 2*Math.PI);
    overlayctx.stroke();
    return ctx.getImageData(x, y, 1, 1).data;
}
function setInverseColor(x, y) {
    const pxColor = ctx.getImageData(x, y, 1, 1).data[0];
    if (pxColor >= 100) {
        overlayctx.fillStyle = "black";
    } else {
        overlayctx.fillStyle = "white";
    }
}

async function createProjection(angles, intensities) {
    ctx.clearRect(0, 0, width, height);
    maxAngle = parseInt((Math.atan(halfWidth/z)) * (180/Math.PI));
    radi = [];
    if (angles[angles.length-1] == 90) {
        angles[angles.length-1] = 89;
        //intensities[intensities-1] = ????
    }
    radi.forEach((a, i) => {
        radi[i] *= scaleFactor;
    });
    angles.forEach((a, i) => {
        toRadi = parseInt((Math.tan(a * (Math.PI / 180)))*z);
        if (toRadi > rMax) {
            angles.splice(i);
        }
        radi.push(toRadi);

    });
    const numSteps = (radi.length-1);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, maxCanvasSideLength, maxCanvasSideLength);
    for (let i = numSteps; i>0; i--) {
        ctx.beginPath();
        ctx.ellipse(xPoint, yPoint, radi[i], radi[i], 0, 0, 2 * Math.PI);

        if (i!=0) {
            gradient = ctx.createRadialGradient(xPoint, yPoint, radi[i-1], xPoint, yPoint, radi[i]);

        }
        gradient.addColorStop(0, "rgb(" + intensities[i-1] + ",  " + intensities[i-1] + ", " + intensities[i-1] + ")");
        gradient.addColorStop(1, "rgb(" + intensities[i] + ",  " + intensities[i] + ", " + intensities[i] + ")"); 

        ctx.fillStyle = gradient;
        ctx.fill();
    }
    
    
}
function updateProjection() {
    //rMax = Math.sqrt((width*width) + (height*height))/2;
    rMax = Math.sqrt((9*(width*width)) + (9*(height*height)))/2;
    scaleFactor = Math.min(maxCanvasSideLength/width, maxCanvasSideLength/height, 1);
    width *= scaleFactor;
    height *= scaleFactor;
    halfWidth = width/2;
    halfHeight = height/2;

    if (width != lastWidth || height != lastHeight) {
        resizeCanvas(width, height); 
        refresh = true;
    } 
    xPoint = x + halfWidth;
    yPoint = y + halfHeight;
    if (xPoint != lastxPoint || yPoint != lastyPoint || z != lastZ || refresh == true || lastData != data || width != lastWidth || height != lastHeight) {
        let values = data.split(new RegExp('\n|,'));
        for (let i = 0; i< values.length; i++) {
            if (isNaN(parseFloat(values[i]))) {
                values.splice(i, 1)
                i-=1;
            }
        }
        angles = [];
        for (let i = 0; i <= values.length-1; i+=2) {
            angles.push((parseFloat(values[i])));
        }
        angles.sort((a, b) => a - b);
        intensities = [];
        decimalIntensities = [];
        for (let i = 1; i<=values.length; i+=2) {
            intensities.push(255 * parseFloat(values[i]));  
            decimalIntensities.push(parseFloat(values[i]));
        }
        
        //change intensities based on inverse light falloff
        modifiedIntensities = [];
        let p = 0;
        intensities.forEach((a, i) => {
            if (!isNaN(angles[i])) {
                p = Math.sqrt((z*z)+(angles[i]*angles[i]));
            } else {
                p = Math.sqrt((z*z)+(angles[i-1]*angles[i-1]));
            }
            p-=z;
            if (a != 0) {
                modifiedIntensities.push(parseInt(a * ((z*z) / ((z + p)*(z + p)))));
            } else {
                modifiedIntensities.push(a);
            }
            
        })
        
        
        if (refresh == true || lastData != data) {
            chartResults(angles, decimalIntensities);
        }
        createProjection(angles, modifiedIntensities);



    }
}

document.getElementById('csvButton').addEventListener('change', function() { 
    const fr=new FileReader(); 
    fr.onload=function(){ 
        refresh = true;
        data = fr.result;
    } 
    fr.readAsText(this.files[0]); 
});

$('#overlay-canvas').mousemove((e) => {
    let rect = document.getElementById("overlay-canvas").getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    if (mouseX != lastMouseX || mouseY != lastMouseY) {
        mouseMoved = true;
    }
});


setInterval(() => {
    maxCanvasSideLength = Math.min(window.innerWidth-500, window.innerHeight-100);
    $('#overlay-canvas').attr({width: canvasHolder.innerWidth(), height: canvasHolder.innerHeight()});
    updateValues();
    updateProjection();
    manageOverlay();
    refresh = false;
    lastData = data;
    lastxPoint = xPoint;
    lastyPoint = yPoint;
    lastZ = z;
    lastHeight = height;
    lastWidth = width;
    lastScaleFactor = scaleFactor;
}, 50);

function manageOverlay() {
    if (overlay) {
        let xLength = 100;
        let yLength = 100;
        let poiFormulaY = (halfHeight*poiFactor);
        let poiFormulaX = (halfWidth*poiFactor);
        let poiY = [halfHeight + poiFormulaY, halfHeight - poiFormulaY];
        let poiX = [halfWidth + poiFormulaX, halfWidth - poiFormulaX];
        let lineWidth = (width+height)/200;
        //borders
        overlayctx.strokeStyle = "blue";
        line(0, 0, xLength, 0, lineWidth);
        line(0, 0, 0, yLength, lineWidth);
        
        line(0, height - yLength, 0, height, lineWidth);
        line(0, height, xLength, height, lineWidth);
        
        line(width-xLength, 0, width, 0, lineWidth);
        line(width, 0, width, yLength, lineWidth);
        
        line(width-xLength,height, width, height, lineWidth);
        line(width, height-yLength, width, height, lineWidth);
        //crossbar (50 pixel length)
        line(halfWidth - 25, halfHeight, halfWidth + 25, halfHeight, 1);
        line(halfWidth, halfHeight-25, halfWidth, halfHeight + 25, 1);
        //quadrant analysis
        overlayctx.font = "13px Verdana";
        
        line(0, halfHeight, width, halfHeight, 1);
        line(halfWidth, 0, halfWidth, height, 1);    

        for (let i = 0; i < poiX.length; i++) {
            poi = arc(poiX[i], poiY[0]);
            setInverseColor(poiX[i], poiY[0]);
            overlayctx.fillText(poi[0], poiX[i]+5, poiY[0]+5);
            poi = arc(poiX[i], poiY[1]);
            setInverseColor(poiX[i], poiY[1]);
            overlayctx.fillText(poi[0], poiX[i]+5, poiY[1]+5);
        }
        let measurementCoordinates = [];
        measurementCoordinates.push(
            10, halfHeight-5,
            halfWidth+5, halfHeight-5,
            width-35, halfHeight-5,
            10, 20,
            halfWidth+5, 20,
            width-35, 20,
            5, height-5,
            halfWidth+5, height-5,
            width-35, height-5
        );
        let measurements = [];
        measurements.push(
            ctx.getImageData(0, 0, 1, 1).data,
            ctx.getImageData(halfWidth, 0, 1, 1).data,
            ctx.getImageData(width-1, 0, 1, 1).data,
            ctx.getImageData(0, halfHeight, 1, 1).data,
            ctx.getImageData(halfWidth, halfHeight, 1, 1).data,
            ctx.getImageData(width-1, halfHeight-1, 1, 1).data,
            ctx.getImageData(0, height-1, 1, 1).data,
            ctx.getImageData(halfWidth, height-1, 1, 1).data,
            ctx.getImageData(width-1, height-1, 1, 1).data
        );
        let j = 0;
        for (let i = 0; i < measurementCoordinates.length; i+=2) {
            setInverseColor(measurementCoordinates[i], measurementCoordinates[i+1]);
            overlayctx.fillText(measurements[j][0], measurementCoordinates[i], measurementCoordinates[i+1]);
            j++;
        }
    }
    if (mouseMoved) {
        let text = `x: ${mouseX}, y: ${mouseY} (${ctx.getImageData(mouseX, mouseY, 1, 1).data[0]})`;
        overlayctx.font = "12px Verdana";
        setInverseColor(mouseX, mouseY);
        lastMouseX = mouseX;
        lastMouseY = mouseY;
        overlayctx.fillText(text, mouseX, mouseY);
    }
}