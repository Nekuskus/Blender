const delay = ms => new Promise(res => setTimeout(res, ms));

const blender_img = document.getElementById('blender')
let blender = null;

let tracklist = [
    'assets/HOME - Resonance.mp3',
    'assets/HOME - Pyxis.mp3',
    'assets/Chris Doerksen - Night Running.mp3',
    'assets/Home - Receiver.mp3',
    'assets/HOME - Mainframe.mp3'
]
let cur_song = -1

function getNextSong() {
    cur_song += 1;
    if (cur_song == tracklist.length) {
        cur_song = 0;
    }
    return new Audio(tracklist[cur_song])
}

function audioEndedHandler() {
    let new_audio = getNextSong();
    new_audio.play()
    console.log(`Now playing, ${getPathFilename(new_audio.src)}!`);
    new_audio.addEventListener('ended', audioEndedHandler);
}

function getPathFilename(src) {
    let spl = src.split('/');
    let last = spl[spl.length-1];
    return last.split('.')[0].replaceAll('%20', ' ');
}

async function showBlender() {
    // Do not enter proper Blender UI if blender build failed
    try {
        blender = new Blender();
        blender.on();
    } catch (err) {
        console.error(err);
        return;
    }
    
    blender_img.style.transform = 'translate(0, -50%)'
    blender_img.style.top = "50%"
    document.getElementById('show-button').style.display = 'none';

    await delay(2500);

    let audio = getNextSong();
    audio.play();
    console.log(`Now playing, ${getPathFilename(audio.src)}!`);
    audio.addEventListener('ended', audioEndedHandler);

    document.getElementsByTagName('body')[0].style.backgroundColor = "#339670";
    
    blender_img.style.top = "50%"
    blender_img.style.left = "50%"
    blender_img.style.transform = 'translate(-50%, -50%)'
    
    await delay(5000);

    
    const welcome = document.getElementById('welcome');
    welcome.style.opacity = '1'
    document.documentElement.style.setProperty('--bg-opacity', '0.1');
    
    document.querySelectorAll('.initial-hide').forEach(el => {
        el.style.opacity = '1'
    })
}

function startNewEntry() {
    let out = document.getElementById('ingredients');
    let p = document.createElement('p');
    p.innerText = 'abc';
    out.appendChild(p)
}

function toggleLid() {
    if(blender.isLidOpen()) {
        blender.closeLid();
    } else {
        blender.openLid();
    }
}

function togglePower() {
    if(blender.isOn()) {
        blender.off();
    } else {
        blender.on();
    }
}

function startBlend() {
    blender.blend()
}