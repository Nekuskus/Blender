let rand = (min, max) => (Math.random() * (max - min) + min);

class Blender extends AGDDev {
    #isLidOpen; #maxLoad; #maxLiquidTemp; #foodstuffsList; #liquidsList; #blend_interval; #img; #blendProgress; #blendTarget; #curImage;
    constructor(power = 1200, voltage = 230, MTBF = 450, energyClass = 'B', psu = "AC", maxLoad = "5kg", maxLiquidTemp = new Celcius(35), width = "15cm", height = "38cm", depth = "15cm", weight = "3.05kg") {
        if(psu == "DC") {
            throw new Error("Blender nie może operować na prądzie stałym.")
        }
        if(power <= 0) {
            throw new Error("Moc nie może być zerowa lub ujemna, to urządzenie nie wspiera ujemnej mocy.")
        }
        super(
            psu, 
            voltage, 
            power, 
            "blender", 
            energyClass, 
            MTBF, 
            width, 
            height, 
            depth, 
            weight)
        this.#isLidOpen = false;
        this.#maxLoad = unitParse(maxLoad);
        this.#maxLiquidTemp = maxLiquidTemp;
        this.#foodstuffsList = [];
        this.#liquidsList = [];
        this.#blend_interval = -1;
        this.#blendProgress = 0;
        this.#blendTarget = -1;
        this.#curImage = -1;
        this.#img = document.getElementById('blender');
        console.log(super.report());

        document.getElementById('power-span').innerText = `${this.getPower()}W`
        document.getElementById('voltage-span').innerText = `${this.getVoltage()}V`
        document.getElementById('mtbf-span').innerText = `${this.getMTBF()}h`
        document.getElementById('energy-class-span').innerText = `${this.getEnergyClass()}`
        document.getElementById('psu-span').innerText = `${this.getPSU()}`
        document.getElementById('max-load-span').innerText = `${this.getMaxLoadStr()}`
        document.getElementById('small-m-max').innerText = `${this.getMaxLoadStr()}`
        document.getElementById('max-volume-span').innerText = `${this.getMaxVolumeStr()}`
        document.getElementById('small-v-max').innerText = `${this.getMaxVolumeStr()}`
        document.getElementById('max-temp-span').innerText = `${this.#maxLiquidTemp.report()}`
        let size = this.sizeOrg()
        document.getElementById('width-span').innerText = `${size['width']}`
        document.getElementById('height-span').innerText = `${size['height']}`
        document.getElementById('depth-span').innerText = `${size['depth']}`
        document.getElementById('weight-span').innerText = `${this.getWeight().getOriginal()}`

        document.getElementById('cur-load-span').innerText = `0/${this.getMaxLoadStr()}`
        document.getElementById('cur-volume-span').innerText = `0/${this.getMaxVolumeStr()}`
        document.getElementById('power-on-span').innerText = `${this.powerOnCounter()} razy`
        document.getElementById('lifecycle-span').innerText = `${this.getLCycles()}`
        document.getElementById('time-span').innerText = `${this.runtime()}s`
        document.getElementById('estimate-span').innerText = `${(this.runtimeSinceBreak()/(60*60)).toFixed(4)}`
        document.getElementById('max-estimate-span').innerText = `${MTBF}h`
        document.getElementById('power-use-span').innerText = `0kW`
        document.getElementById('kwh-span').innerText = `${this.getPower()/1000}kWh`
        document.getElementById('chance-span').innerText = `${(250 * (TIMEDELTA / (this.getMTBF()*60*60)) * this.getEnergyClassCoefficient() * this.curBreakageMod()).toFixed(2)}`
    }
    

    getMaxVolume() {
        let props = super.size()
        return props.width * props.depth * (props.height > 0.10 ? props.height - 0.10 : 0) * 1_000 //min height blendera 10cm, jak jest podane mniejsze to defaultujemy do 0cm, -10cm funkcjonuje tutaj jako wysokość panelu pokręteł i przycisków na blenderze
    }

    getMaxVolumeStr() {
        return `${(this.getMaxVolume()).toFixed(2).replace('.00', '')}l`;
    }

    async breakdown() {
        
        this.#img.style.opacity = '0';
        
        await delay(2500);

        this.#img.setAttribute('src', 'assets/blender_broken.jpg');
        this.#img.style.height = '67vh';

        this.#img.style.opacity = '1';

        [...document.getElementById('control-buttons').children].forEach(el => {
            if(el.id != 'fix-blender') {
                el.classList.add('broken-btn');
            }
        })

        if(this.#blend_interval != -1) {
            this.finish(true)
        }
        
        this.off(true)

        super.breakdown()
    }

    isLidOpen() {
        return this.#isLidOpen;
    }

    openLid() {
        if(this.#blend_interval != -1) {
            throw new Error("Blender aktualnie pracuje, nie można otworzyć") ;
        }

        this.#isLidOpen = true;
        let label = document.getElementById('lid-status');
        label.style.color = '#ca2525';
        label.innerText = '[Pokrywka otwarta.]';

        let label2 = document.getElementById('lid-span')
        label2.innerText = 'otwarta'
        label2.style.color = 'red'
    }

    closeLid() {
        this.#isLidOpen = false;
        let label = document.getElementById('lid-status');
        label.style.color = 'black';
        label.innerText = '[Pokrywka zamknięta.]';
        
        let label2 = document.getElementById('lid-span')
        label2.innerText = 'zamknięta'
        label2.style.color = 'black'
    }


    async on(voltage_in = '') {
        super.on(voltage_in)
        
        this.#img.style.opacity = '0';
        
        await delay(2500);
        
        if(this.#blend_interval == -1) {
            this.#img.setAttribute('src', 'assets/blender_static.jpg');
            this.#img.style.height = '67vh';
        }
        
        this.#img.style.opacity = '1';
        document.getElementById('on-off').style.backgroundColor = 'green'
        let label = document.getElementById('on-off-span')
        label.innerText = 'on'
        label.style.color = 'green'
        
        let curlabel = document.getElementById('cur-volt-span')
        curlabel.innerText = `${this.getCurVoltage()}V`

        if(Math.abs(this.getCurVoltage() - this.getVoltage()) > 25) {
            curlabel.style.color = 'red';
        } else if (Math.abs(this.getCurVoltage() - this.getVoltage()) > 0) {
            curlabel.style.color = 'yellow';
        } else {
            curlabel.style.color = 'green';
        }

        document.getElementById('chance-span').innerText = `${(250 * (TIMEDELTA / (this.getMTBF()*60*60)) * this.getEnergyClassCoefficient() * this.curBreakageMod()).toFixed(2)}`
    }

    async off(is_breaking = false) {
        super.off()
        
        this.#img.style.opacity = '0';
        
        await delay(2500);

        if(this.#blend_interval == -1 && !is_breaking) {
            this.#img.setAttribute('src', 'assets/blender_off.jpg');
            this.#img.style.height = '67vh';
        }
        this.#img.style.opacity = '1';
        
        document.getElementById('on-off').style.backgroundColor = 'red'

        let label = document.getElementById('on-off-span')
        label.innerText = 'off'
        label.style.color = 'red'
    }

    blendInterval() {
        if(!this.isOn()) return;
        if(!this.isUsable()) return;

        this.incrementPowerUsed(TIMEDELTA * (this.getPower() / 3600000) * 4 / 5) //1/5 zużycia prądu na idle, pozostałe 4/5 dodaje się podczas blendowania
        
        document.getElementById('power-use-span').innerText = `${this.powerUsed().toFixed(4)}kW`

        this.#blendProgress += TIMEDELTA * (this.getPower()/1200) * this.getEnergyClassCoefficient() / 20;

        if (this.#blendProgress >= this.#blendTarget * (90/100)) {
            if (this.#blendProgress > this.#blendTarget) {
                this.#blendProgress = this.#blendTarget;
            }
            
            if(this.#curImage < 3) {
                this.#img.setAttribute('src', 'assets/blend-finished.gif');
                this.#curImage = 3;
            }
    
        } else if (this.#blendProgress >= this.#blendTarget * (55/100)) {
            if(this.#curImage < 2) {
                this.#img.setAttribute('src', 'assets/blend2.gif');
                this.#curImage = 2;
            }
        } else if (this.#blendProgress >= this.#blendTarget) {
            if(this.#curImage < 1) {
                this.#img.setAttribute('src', 'assets/blend1.gif');
                this.#curImage = 1;
            }
        }
        
        if(this.#blendProgress == this.#blendTarget) {
            document.getElementById('progress-span').innerText = `SKOŃCZONE ${(this.#blendProgress / this.#blendTarget * 100).toFixed(2)}`
            document.getElementById('progress-span').style.color = 'green';
            
        } else {
            document.getElementById('progress-span').innerText = (this.#blendProgress / this.#blendTarget * 100).toFixed(2)
        }

        let break_chance = 250 * (TIMEDELTA / (this.getMTBF()*60*60)) * this.getEnergyClassCoefficient() * this.curBreakageMod()

        if(rand(0, 100) <= break_chance) {
            this.breakdown()
        }

    }

    blend() {
        if(this.isLidOpen()) {
            throw new Error("Pokrywka jest otwarta, nie można blendować");
        }

        if(this.#blend_interval != -1) {
            throw new Error("Blender już pracuje, nie zaczynam kolejnego") 
        }
        
        if(this.getContents().length < 1) {
            throw new Error("Nie ma składników w Blenderze")
        }

        document.getElementById('ingredients').innerHTML = '';

        this.#curImage = -1;
        this.#blendProgress = 0;

        this.#blendTarget = (this.#foodstuffsList.length > 0 ? this.#foodstuffsList.reduce((prev, cur) => {
            return prev + cur.getTotalWeight()
        }, 0) : 0) + (this.#liquidsList.length > 0 ? this.#liquidsList.reduce((prev, cur) => {
            return prev + cur.getTotalWeight() + cur.getVolume().getValue()
        }, 0) : 0)

        this.#blend_interval = setInterval(this.blendInterval.bind(this), 1000)
    }

    finish(is_breaking = false) {
        if(this.#blend_interval != -1) {
            clearInterval(this.#blend_interval);
            
            let curlabel = document.getElementById('progress-span')
            curlabel.innerText = "N/A"
            curlabel.style.color = 'black'

            let output = document.getElementById('blend-history')
            let div = document.createElement('div');

            let dict = {}
            let weight = 0;

            let hasLiquid = false;
            let hasFoodstuffs = false;

            this.#foodstuffsList.forEach(el => {
                if(dict[el.getName()] == undefined) {
                    dict[el.getName()] = el.getCount();
                } else {
                    dict[el.getName()] += el.getCount();
                }
                weight += el.getTotalWeight();
                hasFoodstuffs = true;
            })

            this.#liquidsList.forEach(el => {
                if(dict[el.getName()] == undefined) {
                    dict[el.getName()] = 1;
                } else {
                    dict[el.getName()] += 1;
                }
                weight += el.getTotalWeight();
                hasLiquid = true;
            })

            let arr = Object.keys(dict);

            let str = `[${arr[0]}]${dict[arr[0]] > 1 ? `*${dict[arr[0]]}` : ``}`
            
            arr.shift();
            arr.forEach(key => {
                str += `+[${key}]${dict[key] > 1 ? `*${dict[key]}` : ``}`
            })

            str += ` ${weight}g`

            if((this.#blendProgress / this.#blendTarget * 100) < 100) {
                str += ` <${(this.#blendProgress / this.#blendTarget * 100).toFixed(0)}%>`
            }

            if(hasFoodstuffs && hasLiquid) {
                let res = new Mixed(str);
                div.innerText = res.report();
            } else if(hasFoodstuffs) {
                let res = new Puree(str);
                div.innerText = res.report()
            } else if(hasLiquid) {
                let res = new Drink(str);
                div.innerText = res.report()
            } else {
                div.innerText = `Nil: ${str}`; // This will not execute because empty list can't blend
            }

            

            this.#blend_interval = -1;
            this.#blendTarget = -1;
            this.#blendProgress = 0;
            this.#curImage = -1;
            this.#foodstuffsList = []
            this.#liquidsList = []
            document.getElementById('small-m').innerText = '0';
            document.getElementById('small-v').innerText = '0';
            document.getElementById('cur-load-span').innerText = `0/${this.getMaxLoadStr()}`;
            document.getElementById('cur-volume-span').innerText = `0/${this.getMaxVolumeStr()}`;
            if(!is_breaking) this.#img.setAttribute('src', 'assets/blender_static.jpg')
            
            output.appendChild(div)
        } else {
            throw new Error("Blender aktualnie nie pracuje")
        }
    }

    getMaxLoad() {
        return this.#maxLoad.getValue();
    }
    
    getMaxLoadStr() {
        return `${this.#maxLoad.getValue()/1000}kg`;
    }

    insertObject(newEdible) {
        if(this.#blend_interval != -1) {
            throw new Error("Blender aktualnie pracuje, nie można wkładać nowych składników") 
        }

        if(!this.#isLidOpen) {
            throw new Error("Pokrywka musi być otwarta przed wkładaniem składników.")
        }

        let total_weight = 0;
        this.#foodstuffsList.forEach(edible => {
            total_weight += edible.getTotalWeight();
        });

        this.#liquidsList.forEach(liquid => {
            total_weight += liquid.getTotalWeight();
        });

        if(total_weight + newEdible.getTotalWeight() > this.getMaxLoad()) {
            throw new Error(`Dodanie [${newEdible.report()}; ${newEdible.getTotalWeight()}] przekroczyłoby maksymalny limit udźwigu blendera (${this.getMaxLoad()}).`);
        }

        let current_load = total_weight + newEdible.getTotalWeight();
        document.getElementById('cur-load-span').innerText = `${current_load/1000}/${this.getMaxLoadStr()}`
        document.getElementById('small-m').innerText = `${current_load/1000}`

        this.#foodstuffsList.push(newEdible);
    }

    insertLiquid(newLiquid) {
        if(this.#blend_interval != -1) {
            throw new Error("Blender aktualnie pracuje, nie można wlewać nowych składników") 
        }

        if(!this.#isLidOpen) {
            throw new Error("Pokrywka musi być otwarta przed wlewaniem składników.")
        }

        if(newLiquid.getTemperature().getValue() > this.#maxLiquidTemp.getValue()) {
            console.error(`Ciecz (${newLiquid.getTemperature().report()}) przekracza maksymalny limit temperatury blendera (${this.#maxLiquidTemp.report()}), mimo tego dodaję... (konsekwencje będą później)`)
        }

        let total_weight = 0;
        this.#foodstuffsList.forEach(edible => {
            total_weight += edible.getTotalWeight();
        });

        let total_volume = 0;
        this.#liquidsList.forEach(liquid => {
            total_weight += liquid.getTotalWeight();
            total_volume += liquid.getVolume().getValue();
        });

        if(total_weight + newLiquid.getTotalWeight() > this.getMaxLoad()) {
            throw new Error(`Dodanie [${newLiquid.report()}; ${newLiquid.getTotalWeight()}] przekroczyłoby maksymalny limit udźwigu blendera (${this.getMaxLoad()}).`);
        }

        if(total_volume + newLiquid.getVolume().getValue() > this.getMaxVolume()) {
            throw new Error(`Dodanie [${newLiquid.report()}; ${newLiquid.getVolume().getValue()}] przekroczyłoby maksymalny limit objętości blendera i spowodowało przelanie (${this.getMaxVolume()}).`);
        }

        let current_load = total_weight + newLiquid.getTotalWeight();
        document.getElementById('cur-load-span').innerText = `${current_load/1000}/${this.getMaxLoadStr()}`
        document.getElementById('small-m').innerText = `${current_load/1000}`
        
        let current_volume = total_volume + newLiquid.getVolume().getValue();
        document.getElementById('cur-volume-span').innerText = `${current_volume.toFixed(2).replace('.00', '')}/${this.getMaxVolumeStr()}`
        document.getElementById('small-v').innerText = `${current_volume.toFixed(2).replace('.00', '')}`

        this.#liquidsList.push(newLiquid);
    }

    removeObject(name, type = '', count = '') {
        if(this.#blend_interval != -1) {
            throw new Error("Blender aktualnie pracuje, nie można wyjmować składników") 
        }

        if(!this.#isLidOpen) {
            throw new Error("Pokrywka musi być otwarta przed wyjmowaniem/wylewaniem składników.")
        }


        let foundObject = false;
        let skipped_removed = false;
        for(let el of this.#foodstuffsList) {
            if(!foundObject && el.getName() == name && (type !== '' ? type == el.getType() : true) && (count !== '' ? count == el.getWeightPerOne().getOriginal() : true)) {
                let new_list = []
                for(let elem of this.#foodstuffsList) {
                    if (!(el.getName() == name && (type !== '' ? type == el.getType() : true) && (count !== '' ? count == el.getWeightPerOne().getOriginal() : true))) {
                        new_list.push(elem);
                    } else if(skipped_removed) {
                        new_list.push(elem)
                    } else {
                        skipped_removed = true;
                    }
                }
                this.#foodstuffsList = new_list
                foundObject = true
            }
        }

        for(let el of this.#liquidsList) {
            if(!foundObject && el.getName() == name && (type !== '' ? type == el.getType() : true) && (count !== '' ? count == el.getVolume().getOriginal() : true)) {
                let new_list = []
                for(let elem of this.#liquidsList) {
                    if (!(el.getName() == name && (type !== '' ? type == el.getType() : true) && (count !== '' ? count == el.getVolume().getOriginal() : true))) {
                        new_list.push(elem);
                    } else if(skipped_removed) {
                        new_list.push(elem)
                    } else {
                        skipped_removed = true;
                    }
                }
                this.#liquidsList = new_list
                foundObject = true
            }
        }

        if(foundObject) {
            let total_weight = 0;
            this.#foodstuffsList.forEach(edible => {
                total_weight += edible.getTotalWeight();
            });
    
            let total_volume = 0;
            this.#liquidsList.forEach(liquid => {
                total_weight += liquid.getTotalWeight();
                total_volume += liquid.getVolume().getValue();
            });
    
            let current_load = total_weight;
            document.getElementById('cur-load-span').innerText = `${current_load/1000}/${this.getMaxLoadStr()}`
            document.getElementById('small-m').innerText = `${current_load/1000}`
            
            let current_volume = total_volume;
            document.getElementById('cur-volume-span').innerText = `${current_volume}/${this.getMaxVolumeStr()}`
            document.getElementById('small-v').innerText = `${current_volume}`
        } else {
            throw new Error("Nie znaleziono obiektu do usunięcia");
        }
    }

    getContents() {
        return this.#foodstuffsList.concat(this.#liquidsList)
    }

    #fixing = false;
    async fix() {
        if(this.#fixing) return;
        
        this.#fixing = true;

        this.#img.setAttribute('src', 'assets/kurier.png')
        
        await delay(5000);

        this.#img.setAttribute('src', 'assets/wrocil.jpg')

        await delay(5000);

        this.#img.setAttribute('src', 'assets/blender_off.jpg')

        Array.from(document.getElementsByClassName('broken-btn')).forEach(el => {
            el.classList.remove('broken-btn');
        })

        super.fix();
    }
}

class EdibleObject {
    #name; #typename; #count; #weight_per_one;
    constructor(name, count, weight_per_one, type = '') {
        this.#name = name;
        this.#typename = type;
        if(count <= 0) {
            throw new Error("Nie można dodać zerowej lub ujemnej ilości składnika.");
        }
        this.#count = parseFloat(count);
        this.#weight_per_one = unitParse(weight_per_one);
    }

    report() {
        return this.#name + (this.#typename != '' ? ` (${this.#typename})` : '');
    }

    getName() {
        return this.#name;
    }

    getType() {
        return this.#typename;
    }
    
    getCount() {
        return this.#count;
    }

    getWeightPerOne() {
        return this.#weight_per_one;
    }

    getTotalWeight() {
        return this.#count * this.#weight_per_one.getValue();
    }
}

class Fruit extends EdibleObject {
    constructor(name, count, weight_per_one) {
        super(name, count, weight_per_one, 'Owoc')
    }
}

class Vegetable extends EdibleObject {
    constructor(name, count, weight_per_one) {
        super(name, count, weight_per_one, 'Warzywo')
    }
}

class Liquid {
    #name; #typename; #volume; #temperature; #weight_per_liter;
    constructor(name, volume, weight_per_liter, temperature, type = '') {
        this.#name = name;
        this.#typename = type;
        if(volume <= 0) {
            throw new Error("Nie można dodać zerowej lub ujemnej objętości składnika.");
        }
        this.#volume = unitParse(volume);
        this.#temperature = temperature;
        this.#weight_per_liter = unitParse(weight_per_liter);
    }

    
    report() {
        return this.#name + (this.#typename != '' ? ` (${this.#typename})` : '');
    }

    getName() {
        return this.#name
    }

    getType() {
        return this.#typename;
    }

    getTemperature() {
        return this.#temperature;
    }
    
    getVolume() {
        return this.#volume;
    }

    getTotalWeight() {
        return this.#volume.getValue() * this.#weight_per_liter.getValue();
    }
}

class Temperature {
    #value;
    constructor(value) { //take arbitrary value, assume Celsius as baseline
        this.#value = value;
    }

    getValue() {
        return this.#value;
    }

    report() {
        return `${this.#value}°C`
    }
}

class Celcius extends Temperature {
    constructor(value) {
        if(value < -275.15) {
            throw new Error("Próbowano skonstruować temperaturę niższą od absolutnego zera")
        }
        super(value);
    }

    report() {
        return `${this.getValue()}°C`
    }
}

class Fahrenheit extends Temperature {
    #orig_value
    constructor(value) {
        this.#orig_value = value
        let converted = (value - 32) / 1.8
        if(converted < -275.15) {
            throw new Error("Próbowano skonstruować temperaturę niższą od absolutnego zera")
        }
        super(converted)
    }

    report() {
        return `${this.#orig_value}°F`
    }
}

class Kelvin extends Temperature {
    #orig_value
    constructor(value) {
        this.#orig_value = value
        if(value < 0) {
            throw new Error("Próbowano skonstruować temperaturę niższą od absolutnego zera")
        }
        let converted = value - 273.15
        super(converted)
    }

    report() {
        return `${this.#orig_value}K`
    }
}

class Result {
    #text;
    constructor(str) {
        this.#text = str;
    }
    
    report() {
        return `${this.getName()}: ${this.getText()}`
    }

    getText() {
        return this.#text;
    }

    getName() {
        return ''
    }
}

class Mixed extends Result {
    constructor(str) {
        super(str)
    }
    
    getName() {
        return 'Smoothie'
    }
}

class Drink extends Result {
    constructor(str) {
        super(str)
    }
    
    getName() {
        return 'Drink'
    }
}

class Puree extends Result {
    constructor(str) {
        super(str)
    }
    
    getName() {
        return 'Purée'
    }
}