class Blender extends AGDDev {
    #isLidOpen; #maxLoad; #maxLiquidTemp; #foodstuffsList; #liquidsList; #blend_interval; #img;
    constructor(power = 1200, MTBF = 50, energyClass = 'B', voltage = 230, psu = "AC", maxLoad = "5kg", maxLiquidTemp = new Celcius(35), width = "15cm", height = "38cm", depth = "15cm", weight = "3.05kg") {
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
        this.#maxLiquidTemp = maxLiquidTemp.getValue();
        this.#foodstuffsList = [];
        this.#liquidsList = [];
        this.#blend_interval = -1;
        this.#img = document.getElementById('blender');
        console.log(super.report());
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

        let label2 = document.getElementById('on-off-span')
        label2.innerText = 'otwarta'
        label2.style.color = 'red'
    }

    closeLid() {
        this.#isLidOpen = false;
        let label = document.getElementById('lid-status');
        label.style.color = 'black';
        label.innerText = '[Pokrywka zamknięta.]';
        
        let label2 = document.getElementById('on-off-span')
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
        return this.#maxLoad;
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
            this.#foodstuffsList.push(newEdible);
        } else {
            throw new Error(`Dodanie [${newEdible.report()}] przekroczyłoby maksymalny limit udźwigu blendera.`);
        }
    }

    insertLiquid(newLiquid) {
        if(!this.#isLidOpen) {
            throw new Error("Pokrywka musi być otwarta przed wlewaniem składników.")
        }

        if(newLiquid.getTemperature().getValue() > this.#maxLiquidTemp) {
            this.breakdown();
            throw new Error("Ciecz przekroczyła maksymalny limit temperatury blendera.")
        }

        let total_weight = 0;
        this.#foodstuffsList.forEach(edible => {
            total_weight += edible.getTotalWeight();
        });

        let total_volume = 0;
        this.#liquidsList.forEach(liquid => {
            total_weight += liquid.getTotalWeight();
            total_volume += liquid.getVolume();
        });

        if(total_weight + newLiquid.getTotalWeight() > this.getMaxLoad()) {
            throw new Error(`Dodanie [${edibleObject.report()}] przekroczyłoby maksymalny limit udźwigu blendera.`);
        }

        if(total_volume + newLiquid.getVolume() > this.getMaxVolume()) {
            throw new Error(`Dodanie [${edibleObject.report()}] przekroczyłoby maksymalny limit objętości blendera i spowodowało przelanie.`);
        }

        this.#liquidsList.push(newLiquid);
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
        this.#count = count;
        this.#weight_per_one = unitParse(weight_per_one);
    }

    report() {
        return this.#name;
    }

    getType() {
        return this.#typename;
    }
    
    getCount() {
        return this.#count;
    }

    getTotalWeight() {
        return this.#count * this.#weight_per_one;
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
        return this.#name;
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
        return this.#volume * this.#weight_per_liter;
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
}

class Celcius extends Temperature {
    constructor(value) {
        super(value);
    }
}

class Fahrenheit extends Temperature {
    constructor(value) {
        let converted = (value - 32) / 1.8
        super(converted)
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
    - contents - wszystko co wrzucone do blendera w tablicy, czyszczona po return blend()
    not_implementing - liquid_contents - ponieważ stackowanie cieczy jest teoretycznie osobne względem stackowania obiektów (leci na sam dół blendera obok warzyw/owoców)
    - registered_mixes - lista mixów/drinków zawierająca dla każdego name i wymagane składniki, jeśli jest match dla tego co akurat się blenduje() to podaje name drinku do Mixed aby się nazywał
        np "Tequila Sunset" => [tequila, sok pomarańczowy, syrop grenadine]
        jeśli jest więcej niż jeden match to wybiera ten gdzie jest więcej elementów
*/