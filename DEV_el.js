const energyClasses = {'A': 0.75, 'B': 1, 'C': 1.05, 'D': 1.15, 'E': 1.30, 'F': 1.55} // Post-2023 nie ma już A+, A++, i A+++

class ElDev {
    /*Electricity device
    property specification:
        #psu - power supply (alternating current (1 or 'AC')/ direct current (0 or 'DC')
        #voltage - supply voltage ([V])
        #power - device power([W])
        #status - device is on (1 or 'ON') or off (0 or 'OFF')
        #usable - 'True' if usable
        #powerOnCounter
    out parameters:
        voltage_in - input voltage 
    method specification:
        on(voltage_in='') - device enable
        off() - device disable
        report() - show status info
    */
    #psu; #voltage; #power; #status; #powerOnCounter; #usable; #breakMod; #runtime; #runtimeSinceBreak; #runtimeInterval;
    constructor(psu, voltage, power) {
        if(psu != "DC" && psu != "AC") {
            throw new Error("Niepoprawny typ zasilania, musi być AC lub DC");
        }
        this.#psu = psu
        if(voltage == 0) {
            throw new Error("Nominalne napięcie urządzenia nie może być zerem!");
        }
        this.#voltage = voltage
        if(power < 0) {
            throw new Error("Moc urządzenia nie może być ujemna! (Może, ale układy scalone tego urządzenia nie funkcjonowały by wtedy poprawnie.)");
        }
        this.#power = power
        this.#status = 0
        this.#powerOnCounter = 0
        this.#usable = true
        this.#breakMod = 0;
        this.#runtime = 0;
        this.#runtimeSinceBreak = 0;
        this.#runtimeInterval = -1;
    }

    getPSU() {
        return this.#psu;
    }

    getPower() {
        return this.#power
    }

    getVoltage() {
        return this.#voltage
    }

    incrementRuntime(n = 3555) {
        this.#runtime += n;
        this.#runtimeSinceBreak += n;
        
        document.getElementById('time-span').innerText = `${this.runtime()}s`
        document.getElementById('estimate-span').innerText = `${(this.runtimeSinceBreak()/(60*60)).toFixed(4)}`
    }

    runtime() {
        return this.#runtime;
    }

    runtimeSinceBreak() {
        return this.#runtimeSinceBreak;
    }


    on(voltage_in = '') {
        if(!this.#usable) {
            throw new Error("Urządzenie jest uszkodzone, nie można uruchomić.");
        }

        let parsed_in = (voltage_in == '' || parseFloat(voltage_in) == NaN) ? this.#voltage : parseFloat(voltage_in);
        this.#breakMod = (parsed_in >= this.#voltage) ? parsed_in/this.#voltage : (this.#voltage+(this.#voltage-parsed_in))/this.#voltage;
        if(!this.isOn()) {
            this.#powerOnCounter += 1
            document.getElementById('power-on-span').innerText = `${this.#powerOnCounter} razy`
        }
        if(this.#runtimeInterval == -1) {
            this.#runtimeInterval = setInterval(this.incrementRuntime.bind(this), 1000)
        }
        this.#status = 1
    }

    off() {
        if(!this.#usable) {
            throw new Error("Urządzenie jest uszkodzone, nie można wyłaczyć.");
        }

        if(this.#runtimeInterval != -1) {
            clearInterval(this.#runtimeInterval);
            this.#runtimeInterval = -1;
        }

        this.#status = 0
    }

    isOn() {
        return this.#status == 1 || this.#status == "ON"
    }

    breakdown() {
        this.#usable = false;
        this.#runtimeSinceBreak = 0;
        throw new Error("Urządzenie zostało uszkodzone.");
    }

    report() {
        let psu = '', status = ''
        if (this.#psu == 1 || this.#psu == 'AC')
            psu = 'prądem zmiennym'
        else psu = 'prądem stałym'
        if (this.#status == 1 || this.#status == 'ON')
            status = 'włączone'
        else status = 'wyłączone'
        if (!this.#usable)
            status = 'uszkodzone'
        return `Urządzenie zasilane ${psu} o napięciu nominalnym ${this.#voltage} [V] jest ${status}. Całkowita liczba uruchomień urządzenia: ${this.#powerOnCounter}.`
    }

    powerOnCounter() {
        return this.#powerOnCounter;
    }

    isUsable() {
        return this.#usable;
    }

    curBreakageMod() {
        return this.#breakMod;
    }
}
/**
 * 
 * @param {string} str
 * @returns {Count} 
 */
function unitParse(str) {
    str = str.toLowerCase()
    if (str.includes('t')) {
        num = parseFloat(str.replace('t', '')) * 1_000_000;
    } else if (str.includes('kg')) {
        num = parseFloat(str.replace('kg', '')) * 1000;
    } else if (str.includes('dag')) {
        num = parseFloat(str.replace('dag', '')) * 10;
    } else if (str.includes('mg')) {
        num = parseFloat(str.replace('mg', '')) / 1000;
    } else if (str.includes('g')) {
        num = parseFloat(str.replace('g', ''));
    } else if (str.includes('ml')) {
        num = parseFloat(str.replace('ml', '')) / 1000;
    } else if (str.includes('l')) {
        num = parseFloat(str.replace('l', ''));
    } else if (str.includes('km')) {
        num = parseFloat(str.replace('km', '')) * 1000;
    } else if (str.includes('cm')) {
        num = parseFloat(str.replace('cm', '')) / 100;
    } else if (str.includes('dm')) {
        num = parseFloat(str.replace('dm', '')) / 10;
    } else if (str.includes('mm')) {
        num = parseFloat(str.replace('mm', '')) / 1000;
    } else if (str.includes('m')) {
        num = parseFloat(str.replace('m', ''));
    } else {
        num = parseFloat(str);
    }

    if(num == NaN) {
        throw new Error("Wartość podana do unitParse() nie zawiera wartości liczbowej");
    }

    return new Count(num, str);
}

class Count {
    #value; #orig_value;
    constructor(num, orig_value) {
        this.#value = num
        this.#orig_value = orig_value
    }

    getValue() {
        return this.#value;
    }

    getOriginal() {
        return this.#orig_value
    }
}

class AGDDev extends ElDev {
    /* AGD device
            property specification:
                #lCycles - life cycles,
                #width, #height, #depth - device size
                #weight - device weight
                #typeDev - e.g. fridge, toaster, electric kettle, iron, washing machine,
                    hair dryer,  clothes dryer, razor, hair trimmer, dishwasher, cleaner, juicer, mixer, blender,
                    coffee grinder, meat grinder, air humidifier, coffee machine, electric cooker, microwave,
                    waffle maker, fryer, food processor, electric oven, planetary robot, steamer, mushroom dryer,
                    fruit dryer, boiler, electric heater, freezer, hair curler,
                #n
                    #MTBF

    */
    #MTBF; #energyClass; #lCycles; #typeDev; #width; #height; #depth; #weight
    constructor(psu, voltage, power, typeDev, energyClass, MTBF, width, height, depth, weight) {
        if(!Object.keys(energyClasses).includes(energyClass)) {
            throw new Error("Niewłaściwa klasa energetyczna, dozwolone: A, B, C, D, E, F.")
        }
        super(psu, voltage, power)
        this.#MTBF = MTBF
        this.#energyClass = energyClass
        this.#lCycles = 0
        this.#typeDev = typeDev
        this.#width = unitParse(width)
        if(this.#width.getValue() <= 0) {
            throw new Error("Wymiary urządzenia nie mogą być zerem lub ujemne (szerokość)")
        }
        this.#height = unitParse(height)
        if(this.#height.getValue() <= 0) {
            throw new Error("Wymiary urządzenia nie mogą być zerem lub ujemne (wysokość)")
        }
        this.#depth = unitParse(depth)
        if(this.#depth.getValue() <= 0) {
            throw new Error("Wymiary urządzenia nie mogą być zerem lub ujemne (głębokość)")
        }
        this.#weight = unitParse(weight)
        if(this.#weight.getValue() <= 0) {
            throw new Error("Wymiary urządzenia nie mogą być zerem lub ujemne (waga)")
        }
    }

    getMTBF() {
        return this.#MTBF
    }

    getEnergyClass() {
        return this.#energyClass
    }

    getLCycles() {
        return this.#lCycles;
    }

    getWeight() {
        return this.#weight
    }

    size(asArray = false) {
        return asArray ? [this.#width.getValue(), this.#height.getValue(), this.#depth.getValue()] : { "width": this.#width.getValue(), "height": this.#height.getValue(), "depth": this.#depth.getValue() }
    }

    sizeOrg(asArray = false) {
        return asArray ? [this.#width.getOriginal(), this.#height.getOriginal(), this.#depth.getOriginal()] : { "width": this.#width.getOriginal(), "height": this.#height.getOriginal(), "depth": this.#depth.getOriginal() }
    }

    report() {
        return `AGD dev. status: ${super.report()}`
    }

}