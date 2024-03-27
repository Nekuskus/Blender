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
    let form = document.getElementById('init-form');
    for(let elem of [...form.children]) {
        if(elem.tagName == "INPUT" && elem.value == "") {
            elem.focus()
            return;
        }
    }
    // Do not enter proper Blender UI if blender build failed
    try {
        let voltage = parseFloat(form.voltage.value)
        if (isNaN(voltage)) {
            form.voltage.focus()
            return;
        }
        
        let wattage = parseFloat(form.power.value)
        if (isNaN(wattage)) {
            form.power.focus()
            return;
        }
        
        let mtbf = parseFloat(form.mtbf.value)
        if (mtbf == NaN) {
            form.mtbf.focus()
            return;
        }
        
        let energyClass = form.energyClass.value
        let psu = form.psu.value
        
        let max_load = form['max-load'].value

        let temp_val = parseFloat(form['temp-val'].value)

        let temp = (form['temp-type'].value == "C" ? new Celcius(temp_val) : form['temp-type'].value == "F" ? new Fahrenheit(temp_val) : new Kelvin(temp_val));

        let width = form.width.value;
        let depth = form.depth.value;
        let height = form.height.value;
        let weight = form.weight.value;

        blender = new Blender(
            wattage,
            voltage,
            mtbf,
            energyClass,
            psu,
            max_load,
            temp,
            width,
            depth,
            height,
            weight
        )
        blender.on();
        blender.closeLid();


    } catch (err) {
        console.error(err);
        return;
    }
    
    blender_img.style.transform = 'translate(0, -50%)'
    blender_img.style.top = "50%"
    document.getElementById('init-form').style.display = 'none';

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
    let div = document.createElement('div');
    
    let name = document.getElementById('new-name').value.trim();
    let type = document.getElementById('new-type').value;
    let count = document.getElementById('new-count').value.trim();
    let weight = document.getElementById('new-weight').value.trim();
    if(name == "") throw new Error("Nie podano nazwy składnika.")
    if(weight == "") throw new Error("Nie podano wagi(jedzenie)/objętości(ciecze) składnika.")

    if(type == "Fruit") {
        if(count == "") throw new Error("Nie podano ilości składnika.")
        let ingr = new Fruit(name, count, weight);
        blender.insertObject(ingr);

        div.innerText = `(${name}) [${ingr.getType()}] <${count} sztuk> ${weight}`;
    } else if (type == "Vegetable") {
        if(count == "") throw new Error("Nie podano ilości składnika.")
        let ingr = new Vegetable(name, count, weight);
        blender.insertObject(ingr);

        div.innerText = `(${name}) [${ingr.getType()}] <${count} sztuk> ${weight}`;
    } else if (type == "Foodstuff") {
        if(count == "") throw new Error("Nie podano ilości składnika.")
        let ingr = new EdibleObject(name, count, weight);
        blender.insertObject(ingr);

        div.innerText = `(${name}) ${ingr.getType() != "" ? `[${ingr.getType()}] ` : ''}<${count} sztuk> ${weight}`;
    } else if (type == "Liquid") {
        let temp_val = document.getElementById('new-temp').value.trim();
        if(temp_val == "" ||isNaN(parseFloat(temp_val))) throw new Error("Podano nieprawidłową temperaturę cieczy.")
    
        let temp_type = document.getElementById('new-temp-type').value;
        let temp = new Temperature(0);

        if(temp_type == "C") {
            temp = new Celcius(temp_val);
        } else if (temp_type == "F") {
            temp = new Fahrenheit(temp_val);
        } else if (temp_type == "K") {
            temp = new Kelvin(temp_val);
        }

        let ingr = new Liquid(name, count, weight, temp, 'Ciecz');
        blender.insertLiquid(ingr);

        div.innerText = `(${name}) [${ingr.getType()}] <${weight} na litr> ${count}`;
    }
    
    div.classList.add('ingredient-entry');
    div.addEventListener('click', () => {
        let name = div.innerText.match(/\((.*?)\)/);
        if(name) name = name[0].replace('(', '').replace(')', '');
        
        let type = div.innerText.match(/\[(.*?)\]/);
        if(type) type = type[0].replace('[', '').replace(']', '');
        
        let count = div.innerText.trim().split(' ').slice(-1)[0].trim();
        if(count.includes('(') || count.includes(')') || count.includes('[') || count.includes(']')) count = null;
        blender.removeObject(name, type != null ? type : '', count != null ? count : '')
        out.removeChild(div);
    })
    out.appendChild(div)
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
        blender.on(document.getElementById('cur-v-input').value);
    }
}

function startBlend() {
    blender.blend()
}

function finishBlend() {
    blender.finish()
}

function fixBlender() {
    blender.fix()
}