
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
//let data = "30, 0, 50, 0, 45, 255, 60, 255, 0";
//let data = "";
let data = "30, 255, 0";
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
function chartResults(radi, intensities) {
    console.log(radi);
    completedRadi = [];
    addZero = true;
    $('#graph').remove();
    $('#inputs').append("<canvas id = 'graph'></canvas>");
    $('#graph').width(500);
    $('#graph').height(300);
    /*
    radi.forEach((a) => {
        completedRadi.push(-1*a);
        if (a == 0) {
            addZero = false;
        }
    });
    if (addZero) {
        completedRadi.push(0);
    }
    radi.forEach((a) => {
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
            labels: radi,
            datasets: [{
                label: 'light falloff curve',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: intensities,
                lineTension: 0
                
            }]
        },
    
        
    });
}

async function createProjection(radi, intensities, numSteps) {
    /*
    const file = await fetch('');
    const response = await file.text();
    */
    ctx.clearRect(0, 0, width, height);
    for (let i = numSteps-1; i>=0; i--) {
        currentRadi = (Math.tan(radi[i] * Math.PI / 180))*z;
        //console.log(Math.tan(45));
        ctx.beginPath();
        ctx.ellipse(xPoint, yPoint, currentRadi, currentRadi, 0, 0, 2 * Math.PI);
        if (i!=0) {
            gradient = ctx.createRadialGradient(xPoint, yPoint, radi[i-1], xPoint, yPoint, currentRadi);

        } else {
            gradient = ctx.createRadialGradient(xPoint, yPoint, 1, xPoint, yPoint, currentRadi);
        }

        gradient.addColorStop(0, "rgb(" + intensities[i+1] + ",  " + intensities[i+1] + ", " + intensities[i+1] + ")");
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
        const numSteps = Math.floor((values.length-1)/2),
        radi = [];
        for (let i = 0; i <= values.length-2; i+=2) {
            radi.push((parseInt(values[i])));
        }
        radi.sort((a, b) => a - b);
        intensities = [];
        for (let i = 1; i<=values.length-2; i+=2) {
            intensities.push(parseInt(values[i]));
        }
        intensities.push(parseInt(values[values.length-1]));

        //change intensities based on inverse light falloff
        modifiedIntensities = [];
        let p = 0;
        intensities.forEach((a, i) => {
            p = Math.sqrt((z*z)+(radi[i]*radi[i]));
            p-=z;
            console.log(a);
            if (a != 0) {
                modifiedIntensities.push(parseInt(a * ((z*z) / ((z + p)*(z + p)))));
            } else {
                modifiedIntensities.push(a);
            }
        })
        //console.log("radi: " + radi[0] + " z: " + z + " p: " + p);
        console.log(radi);
        if (refresh == true || lastData != data) {
            chartResults(radi, modifiedIntensities);
        }
        createProjection(radi, modifiedIntensities, numSteps);
    }


}
//document.getElementById('csvButton').addEventListener('click', loadCSV(), true);
document.getElementById('csvButton').addEventListener('change', function() { 
            
        const fr=new FileReader(); 
        fr.onload=function(){ 
            //console.log(fr.result);
            refresh = true;
            data = fr.result;
            console.log(data);
        } 
            
        fr.readAsText(this.files[0]); 
    }) 
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
