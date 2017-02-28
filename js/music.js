var context, analyser, frequencyData, source;
var isPlaying = false;
var progressDiv = document.querySelector("#progress")
    , bgDiv = document.querySelector("#bg");
context = new(window.AudioContext || window.webkitAudioContext)();
var jsmediatags = window.jsmediatags;
var filedrag = document.querySelector(".file-drag");
filedrag.addEventListener("dragover", fileDragHover, false);
filedrag.addEventListener("dragleave", fileDragHover, false);
filedrag.addEventListener("drop", fileSelectHandler, false);

function fileDragHover(e) {
    e.stopPropagation();
    e.preventDefault();
    if (e.type == "dragover") e.target.classList.add("drag-hover");
    else e.target.classList.remove("drag-hover");
}

function fileSelectHandler(e) {
    // cancel event and hover styling
    fileDragHover(e);
    // fetch FileList object
    var files = e.target.files || e.dataTransfer.files;
    // process all File objects
    for (var i = 0, f; f = files[i]; i++) {
        console.log(f);
        ParseFile(f);
    }
}

function getImageURL(image) {
    var base64String = "";
    for (var i = 0; i < image.data.length; i++) {
        base64String += String.fromCharCode(image.data[i]);
    }
    var dataUrl = "data:" + image.format + ";base64," + window.btoa(base64String);
    return dataUrl;
}

function ParseFile(file) {
    new jsmediatags.Reader(file)
    .setTagsToRead(["title", "album", "picture"])//["title", "year", "album", "year", "genre", "picture"])
    .read({
        onSuccess: function (tag) {
//                console.log(tag);
//            var dataurl = "img/default_album_art.png";
            if (tag.tags.hasOwnProperty("picture")) {
                dataurl = getImageURL(tag.tags.picture);
                
                bgDiv.style.background = "url(" + dataurl + ")";
                bgDiv.style.backgroundSize = "cover";
                bgDiv.style.backgroundPosition = "center center";

                progressDiv.style.background = "url(" + dataurl + ")";
                progressDiv.style.backgroundSize = "conatin";
                progressDiv.style.backgroundPosition = "center center";
                progressDiv.style.backgroundRepeat = "no-repeat";
            }
            
        },
        onError: function(err) {
            console.error(err);
        }
    });
    
    /*
    document.body.innerHTML =
        "<p>File information: <strong>" + file.name +
        "<br></strong> type: <strong>" + file.type +
        "<br></strong> size: <strong>" + file.size +
        "</strong> bytes</p>";*/
    var reader = new FileReader();
    console.log(context);
    if (isPlaying) source.stop();
    reader.onload = function () {
        context.decodeAudioData(reader.result, function (buffer) {
            prepare(buffer);
        });
    };
    reader.onprogress = function (data) {
        if (data.lengthComputable) {
            var progress = parseInt(((data.loaded / data.total) * 100), 10);
            console.log(progress);
            progressDiv.style.width = progress + "%";
        }
    }
    reader.readAsArrayBuffer(file);
}

function prepare(buffer) {
    //var offlineContext = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);
    source = context.createBufferSource();
    source.buffer = buffer;
    analyser = context.createAnalyser();
    // Connect the output of the source to the input of the analyser
    source.connect(analyser);
    source.onended = function () {
            isPlaying = false;
        }
        // Connect the output of the analyser to the destination
    analyser.connect(context.destination);
    console.log(analyser); // fftSize/2 = 32 data points
    analyser.fftSize = 64;
    frequencyData = new Uint8Array(analyser.frequencyBinCount);
    source.start();
    isPlaying = true;
    /*
    var filter = offlineContext.createBiquadFilter();
    filter.type = "lowpass";
    source.connect(filter);
    filter.connect(offlineContext.destination);
    source.start(0);
    offlineContext.startRendering();
    offlineContext.oncomplete = function (e) {
        process(e);
    };*/
}
var bars = document.querySelectorAll(".bar");

function update() {
    if (isPlaying) {
        // Get the new frequency data
        analyser.getByteFrequencyData(frequencyData);
        var k = 0;
        //console.log(k);
        for (var i = 0; i < bars.length; i++, k += 3) {
            var size = frequencyData[k] / 255 * window.innerHeight * 0.8;
            bars[i].style.width = size + 'px';
            bars[i].style.height = size + 'px';
            //console.log(frequencyData[i]);
        }
    }
    // Schedule the next update
    requestAnimationFrame(update);
}
// Kick it off...
//update();
var circleColors = [];
var minLum = 0
    , maxLum = 1
    , circleBaseColor = "#004276";

function ColorLuminance(hex, lum) {
    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;
    // convert to decimal and change luminosity
    var rgb = "#"
        , c, i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ("00" + c).substr(c.length);
    }
    return rgb;
}

for (var i = 0; i < bars.length; i++) {
    var lum = ((i / bars.length) * (maxLum - minLum)) + minLum;
    var color = ColorLuminance(circleBaseColor, lum);
    //var color = randomColor();
    circleColors.push(color);
    bars[i].style.background = color;
}
bars[bars.length - 1].style.background = "#ffff50";
console.log(circleColors);