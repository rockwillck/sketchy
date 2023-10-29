// Start coding here
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
const canvas3 = document.getElementById("preview")
const ctx3 = canvas3.getContext("2d")

function getHue(red, green, blue) {

    min = Math.min(Math.min(red, green), blue);
    max = Math.max(Math.max(red, green), blue);

    if (min == max) {
        return 0;
    }

    hue = 0;
    if (max == red) {
        hue = (green - blue) / (max - min);

    } else if (max == green) {
        hue = 2 + (blue - red) / (max - min);

    } else {
        hue = 4 + (red - green) / (max - min);
    }

    hue = hue * 60;
    if (hue < 0) hue = hue + 360;

    return Math.round(hue);
}

var floor = 0.6
const lookup = [
    [], 
    [3], 
    [2], 
    [4], 
    [1], 
    [0, 2], 
    [5],
    [0], 
    [0], 
    [5], 
    [1, 3],
    [1], 
    [4], 
    [2], 
    [3], 
    []
]
const width = 200
const height = 200
var allPoints = Array.from({length: width + 1}, (_, i) => (Array.from({length: height + 1}, (_, i) => 1)))
var imageData
function imageInput(input) {
    var file = input.files[0];
    var reader = new FileReader();

    image = new Image()
    if (input.files && input.files[0]) {
        var reader  = new FileReader();
        reader.onloadend = function () {
            image.src = reader.result;
        }

        if (file) {
            reader.readAsDataURL(file);
        } else {
            image.src = "";
        }
      }

    image.onload = (e) => {
        canvas.width = image.width
        canvas.height = image.height
        canvas3.width = image.width
        canvas3.height = image.height
        if (image.width > image.height) {
            canvas.style.width = "100vmin";
            canvas.style.height = `${image.height/image.width*100}vmin`
            canvas3.style.width = "100vmin";
            canvas3.style.height = `${image.height/image.width*100}vmin`
        } else {
            canvas.style.height = "100vmin";
            canvas.style.width = `${image.width/image.height*100}vmin`
            canvas3.style.width = "100vmin";
            canvas3.style.height = `${image.height/image.width*100}vmin`
        }
        ctx.drawImage(image, 0, 0)
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        setId = setInterval(setUp, 50)
        preview()
        mediaRecorder.start();
    }
}

rWeight = 1
gWeight = 1
bWeight = 1
var allLines = []
function setUp() {
    allLines = []
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    let maximum = 0
    let minimum = 255
    for (y = 1; y < height; y++) {
        row = allPoints[y]
        for (x = 1; x < width; x++) {
            xScaled = Math.floor(x*canvas.width/width)
            yScaled = Math.floor(y*canvas.height/height)
            row[x] = (imageData[(yScaled*canvas.width+xScaled)*4 + 0]*rWeight + imageData[(yScaled*canvas.width+xScaled)*4 + 1]*gWeight + imageData[(yScaled*canvas.width+xScaled)*4 + 2]*bWeight)/(rWeight + gWeight + bWeight)
            // row[x] = getHue(imageData[(yScaled*canvas.width+xScaled)*4 + 0], imageData[(yScaled*canvas.width+xScaled)*4 + 1], imageData[(yScaled*canvas.width+xScaled)*4 + 2])
            maximum = Math.max(row[x], maximum)
            minimum = Math.min(row[x], minimum)
        }
    }
    for (y = 0; y < height; y++) {
        row = allPoints[y]
        for (x = 0; x < width; x++) {
            row[x] = (row[x] - minimum)/(maximum - minimum)
        }
    }

    // boxes
    for (y = 0; y < height; y++) {
        row = allPoints[y]
        for (x = 0; x < width; x++) {
    
            corners = (allPoints[y][x] > floor ? 1 : 0)*2**3 + (allPoints[y][x + 1] > floor ? 1 : 0)*2**2 + (allPoints[y + 1][x + 1] > floor ? 1 : 0)*2 + (allPoints[y + 1][x] > floor ? 1 : 0)*1
            
            // ctx.font = "30px Arial"
            // ctx.fillText( Math.round((allPoints[y][x]-floor)*100)/100, x*canvas.width/width, y*canvas.height/height)

            // L, T, R, B
            midpoints = [
            (floor - (allPoints[y][x]))/(allPoints[y + 1][x] - allPoints[y][x]),
            (floor - (allPoints[y][x]))/(allPoints[y][x + 1] - allPoints[y][x]),
            (floor - (allPoints[y][x + 1]))/(allPoints[y + 1][x + 1] - allPoints[y][x + 1]),
            (floor - (allPoints[y+1][x]))/(allPoints[y+1][x + 1] - allPoints[y+1][x]),
            ]
            for (line of lookup[corners]) {
                // values .. 0: NW, 1: NE, 2: SE, 3: SW, 4:_, 5: |
                let vertices = []
                switch (line) {
                    case 0:
                        vertices.push([(x+midpoints[1])*canvas.width/width, (y)*canvas.height/height])
                        vertices.push([(x)*canvas.width/width, (y + midpoints[0])*canvas.height/height])
                        break;
                    case 1:
                        vertices.push([(x+midpoints[1])*canvas.width/width, (y)*canvas.height/height])
                        vertices.push([(x+1)*canvas.width/width, (y + midpoints[2])*canvas.height/height])
                        break;
                    case 2:
                        vertices.push([(x+1)*canvas.width/width, (y+midpoints[2])*canvas.height/height])
                        vertices.push([(x+midpoints[3])*canvas.width/width, (y + 1)*canvas.height/height])
                        break;
                    case 3:
                        vertices.push([(x+midpoints[3])*canvas.width/width, (y+1)*canvas.height/height])
                        vertices.push([(x)*canvas.width/width, (y + midpoints[0])*canvas.height/height])
                        break;
                    case 4:
                        vertices.push([(x)*canvas.width/width, (y+midpoints[0])*canvas.height/height])
                        vertices.push([(x + 1)*canvas.width/width, (y + midpoints[2])*canvas.height/height])
                        break;
                    case 5:
                        vertices.push([(x+midpoints[1])*canvas.width/width, (y)*canvas.height/height])
                        vertices.push([(x + midpoints[3])*canvas.width/width, (y + 1)*canvas.height/height])
                        break;
                }
                ctx.beginPath()
                ctx.moveTo(vertices[0][0], vertices[0][1])
                ctx.lineTo(vertices[1][0], vertices[1][1])
                ctx.closePath()
                ctx.stroke()
                allLines.push(vertices)
            }
            
        }
    }
    ctx.globalAlpha = 0.1
    ctx.drawImage(image, 0, 0)
    ctx.globalAlpha = 1
}


currentLine = Math.round(Math.random()*allLines.length)
allPast = []
var frames = []
function playback() {
    requestAnimationFrame(playback)
    let sets = [[allLines[currentLine][0][0], allLines[currentLine][0][1]], [allLines[currentLine][1][0], allLines[currentLine][1][1]]]
    // console.log(sets)
    // ctx.beginPath()
    // ctx.moveTo(sets[0][0], sets[0][1])
    // ctx.lineTo(sets[1][0], sets[1][1])
    // ctx.closePath()
    // ctx.strokeStyle = "rgba(0, 0, 0, 0.3)"
    // ctx.lineWidth = 10
    // ctx.stroke()

    let i = 0
    let connected = false
    for (let line of allLines) {
        if ((newIncludes(line, sets[0]) || newIncludes(line, sets[1])) && !allPast.includes(i)) {
            allPast.push(currentLine)
            currentLine = i
            connected = true
            break
        }
        i++
    }
    if (!connected) {
        currentLine = (currentLine + 1)%allLines.length
    }
}

var currentFrame = 0
var direction = 1
function preview() {
    requestAnimationFrame(preview)
    ctx3.fillStyle = "white"
    ctx3.fillRect(0, 0, canvas3.width, canvas3.height)
    if (allPast.length > 0) {
        let sets = [0, 0]
        for (let i = 0; i < currentFrame; i++) {
            let index = allPast[i]
            sets = [[allLines[index][0][0], allLines[index][0][1]], [allLines[index][1][0], allLines[index][1][1]]]
            ctx3.beginPath()
            ctx3.moveTo(sets[0][0], sets[0][1])
            ctx3.lineTo(sets[1][0], sets[1][1])
            ctx3.closePath()
            ctx3.strokeStyle = "rgba(0, 0, 0, 0.3)"
            ctx3.lineWidth = canvas.width/500
            ctx3.stroke()
        }
        currentFrame = currentFrame + direction
        if (currentFrame == allPast.length - 1 || currentFrame == 0) {
            direction *= -1
        }
    }
}

function newIncludes(array, comparable) {
    comparable.sort()
    for (el of array) {
        let i = 0
        includes = true
        for (el2 of [...el].sort()) {
            if (comparable[i] != el2) {
                includes = false
                break
            }
            i++
        }
        if (includes) {
            return true
        }
    }
    return false
}

var video = document.querySelector("video");

var videoStream = canvas3.captureStream(30);
var mediaRecorder = new MediaRecorder(videoStream);

var chunks = [];
mediaRecorder.ondataavailable = function(e) {
  chunks.push(e.data);
};

mediaRecorder.onstop = function(e) {
  var blob = new Blob(chunks, { 'type' : 'video/mp4' });
  chunks = [];
  var videoURL = URL.createObjectURL(blob);
  video.src = videoURL;
};
mediaRecorder.ondataavailable = function(e) {
  chunks.push(e.data);
};