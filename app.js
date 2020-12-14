
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
const defaultValues = {
    width: 800,
    height: 800,
    z: 2,
    x: 0,
    y: 0
}

let data = "0, 1, 60, 0";
let lastData = "";
let width = defaultValues.width;
let height = defaultValues.height;
let z = defaultValues.z;
let x = defaultValues.x;
let y = defaultValues.y;
let lastWidth = 0;
let lastHeight = 0;
let CSV = false;
let lastxPoint = 0;
let lastYPoint = 0;
let lastZ = 0;
let first = true;
let refresh = false;
CSVdata = "";
openButton = document.getElementById("openInputs");
document.getElementById("openInputs").style.display = "none";
xInput.value = 0;
yInput.value = 0;
let overlayChange = false;
let overlay = false;
let imageURL = "";


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
    if (isNaN(x)) {
        x = defaultValues.x;
    } 
    if (isNaN(y)) {
        y = defaultValues.y;
    } 
    if (isNaN(z)) {
        z = defaultValues.z;
    }
    xDisplay.innerHTML = x;
    yDisplay.innerHTML = y;
    zDisplay.innerHTML = z;
    halfWidth = width/2;
    halfHeight = height/2;
    xInput.max = width;
    xInput.min = (-1*width);
    yInput.max = height;
    yInput.min = (-1*height);

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
    completedRadi = [];
    addZero = true;
    $('#graph').remove();
    $('#inputs').append("<canvas id = 'graph'></canvas>");
    $('#graph').width(500);
    $('#graph').height(300);
    /*
    angles.forEach((a) => {
        completedRadi.push(-1*a);
        if (a == 0) {
            addZero = false;
        }
    });
    if (addZero) {
        completedRadi.push(0);
    }
    angles.forEach((a) => {
        completedRadi.push(a);
    });;

    completedIntensities = [];
    intensities.forEach((a, i) => {
        completedIntensities.push(intensities[(intensities.length-1)-i]);
    });
    intensities.forEach((a) => {
        completedIntensities.push(a);
    });
    
    console.log(completedIntensities);
    */
    const chartCanvas = document.getElementById('graph').getContext('2d');
    let chartData = data.split(',');

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
                data: intensities,
                lineTension: 0
                
            }]
        },
    
        
    });
}

function line(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 5;
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

async function createProjection(angles, intensities) {
    /*
    const file = await fetch('');
    const response = await file.text();
    */
    ctx.clearRect(0, 0, width, height);
    maxAngle = parseInt((Math.atan(halfWidth/z)) * (180/Math.PI));
    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    console.log("maxAngle " + maxAngle);
    rMax = Math.sqrt((width*width) + (height*height))/2;
    radi = [];
    angles.forEach((a, i) => {
        toRadi = parseInt((Math.tan(a * (Math.PI / 180)))*z);
        if (toRadi > rMax) {
            angles.splice(i);
            console.log("removing" + toRadi);
        }
        radi.push(toRadi);

    });
    //console.log(Math.asin(0.707) * (180/Math.PI));
    const numSteps = (radi.length-1);
    //console.log('radi: ' + radi);
    //console.log('intensities: ' + intensities);
    //console.log("numSteps: " + numSteps);
    console.log(intensities);
    for (let i = numSteps; i>0; i--) {
        //console.log(Math.tan(45));
        ctx.beginPath();
        ctx.ellipse(xPoint, yPoint, radi[i], radi[i], 0, 0, 2 * Math.PI);
        if (i!=0) {
            gradient = ctx.createRadialGradient(xPoint, yPoint, radi[i-1], xPoint, yPoint, radi[i]);

        } else {
            gradient = ctx.createRadialGradient(xPoint, yPoint, 1, xPoint, yPoint, radi[i]);
        }

        gradient.addColorStop(0, "rgb(" + intensities[i-1] + ",  " + intensities[i-1] + ", " + intensities[i-1] + ")");
        gradient.addColorStop(1, "rgb(" + intensities[i] + ",  " + intensities[i] + ", " + intensities[i] + ")"); 

        ctx.fillStyle = gradient;
        ctx.fill();
    }
    
    
}
function updateProjection() {
    if (width != lastWidth || height != lastHeight) {
        $("#canvasHolder").height(height); 
        $("#canvasHolder").width(width);
        $('#canvas').attr({width: canvasHolder.innerWidth(), height: canvasHolder.innerHeight()});
    }
    //rMax = Math.sqrt((width*width) + (height*height))/2;
    xPoint = x + (width/2);
    yPoint = y + (height/2);

    if (xPoint != lastxPoint || yPoint != lastyPoint || z != lastZ || refresh == true || lastData != data) {
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
            //console.log(parseFloat(values[i]));
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
        
        console.log(decimalIntensities);
        if (refresh == true || lastData != data) {
            chartResults(angles, decimalIntensities);
        }
        createProjection(angles, modifiedIntensities);
        if (overlay) {
            let xLength = width/10;
            let yLength = height/10;
            line(0, 0, xLength, 0, 15);
            line(0, 0, 0, yLength, 15);
            line(0, height - yLength, 0, height, 15);
            line(0, height, xLength, height, 15);
            line(width-xLength, 0, width, 0, 15);
            line(width, 0, width, yLength, 15);
            line(width-xLength, height, width, height, 15);
            line(width, height-yLength, width, height, 15);
            line(halfWidth - 25, halfHeight, halfWidth + 25, halfHeight, 5);
            line(halfWidth, halfHeight-25, halfWidth, halfHeight + 25, 5);
        }
        imageURL = document.getElementById("canvas").toDataURL();
        document.getElementById("projectionImage").src = imageURL;

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

    updateValues();
    updateProjection();
    lastHeight = height;
    lastWidth = width;
    refresh = false;
    lastData = data;
    lastxPoint = xPoint;
    lastyPoint = yPoint;
    lastZ = z;

}, 50);
