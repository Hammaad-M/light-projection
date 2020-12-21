
const ctx = document.getElementById("canvas").getContext("2d");
const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");
const xInput = document.getElementById("x");
const yInput = document.getElementById("y");
const zInput = document.getElementById("z");
const xDisplay = document.getElementById("xDisplay");
const yDisplay = document.getElementById("yDisplay");
const zDisplay = document.getElementById("zDisplay");
const canvasHolder = $('#canvasHolder');
const maxCanvasSideLength = 850;
const defaultValues = {
    width: maxCanvasSideLength,
    height: maxCanvasSideLength,
    z: 150,
    x: 0,
    y: 0
}
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
let scaleFactor = 1;
let lastScaleFactor = scaleFactor;

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
    console.log("dataString: " + dataString);
    return dataString;
}
function toggleOverlay() {
    overlay = !overlay;
    console.log(overlay);
    refresh = true;
}

function updateValues() {
    width = parseInt(widthInput.value);
    height = parseInt(heightInput.value);
    z = parseInt(zInput.value);
    x = parseInt(xInput.value);
    y = parseInt(yInput.value);
    if (isNaN(width)) {
        width = defaultValues.width;
    } 
    if (isNaN(height)) {
        height = defaultValues.height;
    } 
    xDisplay.innerHTML = x;
    yDisplay.innerHTML = y;
    zDisplay.innerHTML = z;
    z = Math.abs(z-(defaultValues.z*2));
    halfWidth = width/2;
    halfHeight = height/2;
    xInput.max = width;
    xInput.min = (-1*width);
    yInput.max = height;
    yInput.min = (-1*height);
    xInput.value = x;
    yInput.value = x;
    
}

function closeOptions() {
    console.log("close");
    document.getElementById("inputs").style.display = "none";
    document.getElementById("openInputs").style.display = "block";
}
function openOptions() {
    console.log("open");
    document.getElementById("inputs").style.display = "block";
    document.getElementById("openInputs").style.display = "none";
}
function chartResults(angles, intensities) {
    $('#graph').remove();
    $('#inputs').append("<canvas id = 'graph'></canvas>");
    $('#graph').width(500);
    $('#graph').height(300);
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
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.strokeStyle = "blue";
    ctx.lineWidth = lineWidth;
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

async function createProjection(angles, intensities) {
    ctx.clearRect(0, 0, width, height);
    maxAngle = parseInt((Math.atan(halfWidth/z)) * (180/Math.PI));
    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    console.log("maxAngle " + maxAngle);
    radi = [];
    if (angles[angles.length-1] == 90) {
        angles[angles.length-1] = 89;
        //intensities[intensities-1] = ????
    }
    console.log("Z: " + z);
    angles.forEach((a, i) => {
        toRadi = parseInt((Math.tan(a * (Math.PI / 180)))*z);
        if (toRadi > rMax) {
            angles.splice(i);
            console.log("removing" + toRadi);
        }
        radi.push(toRadi);

    });
    console.log("r: " + radi);
    radi.forEach((a, i) => {
        radi[i] *= scaleFactor;
    });
    console.log("r: " + radi);
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
    rMax = Math.sqrt((9*width*width) + (9*height*height))/2;
    scaleFactor = Math.min(maxCanvasSideLength/width, maxCanvasSideLength/height, 1);
    width *= scaleFactor;
    height *= scaleFactor;
    halfWidth = width/2;
    halfHeight = height/2;

    if (width != lastWidth || height != lastHeight) {
        resizeCanvas(width, height); 
        refresh = true;
    } 

    console.log(width, height);
    xPoint = x + halfWidth;
    yPoint = y + halfHeight;
    if (xPoint != lastxPoint || yPoint != lastyPoint || z != lastZ || refresh == true || 
        lastData != data || width != lastWidth || height != lastHeight) {
        const values = data.split(',');
        angles = [];
        for (let i = 0; i <= values.length-2; i+=2) {
            angles.push((parseInt(values[i])));
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
        if (overlay) {
            let xLength = 100;
            let yLength = 100;
            let lineWidth = (width+height)/200;
            //borders
            line(0, 0, xLength, 0, lineWidth);
            line(0, 0, 0, yLength, lineWidth);
            
            line(0, height - yLength, 0, height, lineWidth);
            line(0, height, xLength, height, lineWidth);
            
            line(width-xLength, 0, width, 0, lineWidth);
            line(width, 0, width, yLength, lineWidth);
            
            line(width-xLength,height, width, height, lineWidth);
            line(width, height-yLength, width, height, lineWidth);
            //crossbar (50 pixel length)
            line(halfWidth - 25, halfHeight, halfWidth + 25, halfHeight, 2);
            line(halfWidth, halfHeight-25, halfWidth, halfHeight + 25, 2);
            
        }


    }



}

document.getElementById('csvButton').addEventListener('change', function() { 
    const fr=new FileReader(); 
    fr.onload=function(){ 
        //console.log(fr.result);
        refresh = true;
        data = fr.result;
    } 
    fr.readAsText(this.files[0]); 
});

setInterval(() => {
    console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||");
    console.log(x, y);
    updateValues();
    updateProjection();
    refresh = false;
    lastData = data;
    lastxPoint = xPoint;
    lastyPoint = yPoint;
    lastZ = z;
    lastHeight = height;
    lastWidth = width;
    lastScaleFactor = scaleFactor;
}, 50);
