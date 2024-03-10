class Blender extends AGDDev {
    #isLidOpen; #maxLoad; #maxLiquidTemp; #foodstuffsList; #liquidsList; #blend_interval; #img;
    constructor(power = 1200, voltage = 230, MTBF = 900, energyClass = 'B', psu = "AC", maxLoad = "5kg", maxLiquidTemp = new Celcius(35), width = "15cm", height = "38cm", depth = "15cm", weight = "3.05kg") {
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
        
        super.breakdown()
    }

    isLidOpen() {
        return this.#isLidOpen;
    }

    openLid() {
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
        
        this.#img.setAttribute('src', 'assets/blender_static.jpg');
        this.#img.style.height = '67vh';

        this.#img.style.opacity = '1';
        document.getElementById('on-off').style.backgroundColor = 'green'
        let label = document.getElementById('on-off-span')
        label.innerText = 'on'
        label.style.color = 'green'
    }

    async off() {
        super.off()
        
        this.#img.style.opacity = '0';
        
        await delay(2500);

        this.#img.setAttribute('src', 'assets/blender_off.jpg');
        this.#img.style.height = '67vh';

        this.#img.style.opacity = '1';
        
        document.getElementById('on-off').style.backgroundColor = 'red'

        let label = document.getElementById('on-off-span')
        label.innerText = 'off'
        label.style.color = 'red'
    }

    getMaxLoad() {
        return this.#maxLoad.getValue();
    }
    
    getMaxLoadStr() {
        return `${this.#maxLoad.getValue()/1000}kg`;
    }

    insertObject(newEdible) {
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
        if(!this.#isLidOpen) {
            throw new Error("Pokrywka musi być otwarta przed wyjmowaniem/wylewaniem składników.")
        }


        let foundObject = false;
        let skipped_removed = false;
        for(let el of this.#foodstuffsList) {
            console.log(name, el.getName())
            console.log(type, el.getType())
            console.log(count, el.getWeightPerOne())
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
            document.getElementById('cur-volume-span').innerText = `${current_volume/1000}/${this.getMaxVolumeStr()}`
            document.getElementById('small-v').innerText = `${current_volume/1000}`
        } else {
            throw new Error("Nie znaleziono obiektu do usunięcia");
        }
    }

    getContents() {
        return this.#foodstuffsList.concat(this.#liquidsList)
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
class Mixed {
    // name - nasze puree lub drink może się jakoś nazywać; defaultowo - "item1+item2+item3..." ale można też w konstruktorze podać
    //lista rzeczy
}

class Drink extends Mixed {
    //lista cieczy
}

/*outline:
metody:
    DONE - otwórz pokrywke()
    DONE - insert item(EdibleObject) jeżeli pokrywka otwarta else throw Exception
    - blend() miksuje rzeczy, wciąż działa jeśli nie ma nic w środku, jak user chce miksować nic to niech ma
        zwraca obiekt mixu złożony z report EdibleObjectów wszystkich w blenderze
        zwraca obiekt drinku, jeżeli mix zawierał ciecz
        wykorzystaj typeof aby wykorzystać do wypisywania czy coś jest owocem, warzywem lub cieczą
        processuj obrazki, dodaj obrazek
property:
    DONE - allow hot liquids => jeżeli jest FALSE a insertuje się liquid o temperaturze wyższej niż 49 stopni celsjusza to Exception
        nie wszystkie blendery dobrze pracują z ciepłą cieczą
    DONE ale jeszcze nie czyści bo jeszcze nie blenduje - contents - wszystko co wrzucone do blendera w tablicy, czyszczona po return blend()
    NOT_IMPLEMENTING (nie wyświetlam graficznie więc nie robię tego) - liquid_contents - ponieważ stackowanie cieczy jest teoretycznie osobne względem stackowania obiektów (leci na sam dół blendera obok warzyw/owoców)
    - registered_mixes - lista mixów/drinków zawierająca dla każdego name i wymagane składniki, jeśli jest match dla tego co akurat się blenduje() to podaje name drinku do Mixed aby się nazywał
        np "Tequila Sunset" => [tequila, sok pomarańczowy, syrop grenadine]
        jeśli jest więcej niż jeden match to wybiera ten gdzie jest więcej elementów
*/