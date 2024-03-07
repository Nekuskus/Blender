const delay = ms => new Promise(res => setTimeout(res, ms));

const blender_img = document.getElementById('blender')

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
    new_audio.addEventListener('ended', audioEndedHandler);
}


async function showBlender() {
    //blender_img.style.top = `${(parseFloat(blender_img.style.top == "" ? 0 : blender_img.style.top.replace('px', '')) ) + 250}px`
    blender_img.style.transform = 'translate(0, -50%)'
    blender_img.style.top = "50%"
    document.getElementById('show-button').style.display = 'none';

    await delay(2500);

    let audio = getNextSong();
    audio.play();
    audio.addEventListener('ended', audioEndedHandler);

    document.getElementsByTagName('body')[0].style.backgroundColor = "#339670";
    
    blender_img.style.top = "50%"
    blender_img.style.left = "50%"
    blender_img.style.transform = 'translate(-50%, -50%)'
    
    await delay(5000);

    
    const welcome = document.getElementById('welcome');
    welcome.style.opacity = '1'
    document.documentElement.style.setProperty('--bg-opacity', '0.1');

    document.getElementById('orders-panel').style.opacity = '1'
    document.getElementById('settings-panel').style.opacity = '1'


}

function moveBlender() {
    console.log(blender_img.style.top)
    console.log(blender_img.style.top)
}


let blender = new Blender();