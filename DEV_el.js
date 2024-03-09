const energyClasses = {'A': 1.2, 'B': 1, 'C': 0.95, 'D': 0.85, 'E': 0.75, 'F': 0.60} // Post-2023 nie ma już A+, A++, i A+++

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
    #psu; #voltage; #power; #status; #powerOnCounter; #usable; #breakMod
    constructor(psu, voltage, power) {
        this.#psu = psu
        this.#voltage = voltage
        this.#power = power
        this.#status = 0
        this.#powerOnCounter = 0
        this.#usable = true
        this.#breakMod = 0;
    }

    on(voltage_in = '') {
        if(!this.#usable) {
            throw new Error("Urządzenie jest uszkodzone, nie można uruchomić.");
        }

        let volts = (voltage_in == '' || parseFloat(voltage_in) == NaN) ? this.#voltage : parseFloat(voltage_in);
        this.#breakMod = (volts >= voltage_in) ? volts/this.#voltage : (this.#voltage+(this.#voltage-volts))/this.#voltage;
        if(this.#status != 1 && this.#status != "ON") {
            this.#powerOnCounter += 1
        }
        this.#status = 1
    }

    off() {
        if(!this.#usable) {
            throw new Error("Urządzenie jest uszkodzone, nie można wyłaczyć.");
        }

        this.#status = 0
    }

    isOn() {
        return this.#status == 1 || this.#status == "ON"
    }

    breakdown() {
        this.#usable = false;
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
 */
function unitParse(str) {
    if (str.includes('t')) {
        num = parseFloat(str.replace('t', '')) * 1_000_000;
    } else if (str.includes('kg')) {
        num = parseFloat(str.replace('kg', '')) * 1000;
    } else if (str.includes('dag')) {
        num = parseFloat(str.replace('dag', '')) * 10;
    } else if (str.includes('mg')) {
        num = parseFloat(str.replace('mg', '')) / 1000;
    } else if (str.includes('g')) {
        return parseFloat(str.replace('g', ''));
    } else if (str.includes('ml')) {
        return parseFloat(str.replace('ml', '')) / 1000;
    } else if (str.includes('l')) {
        return parseFloat(str.replace('l', ''));
    } else if (str.includes('km')) {
        return parseFloat(str.replace('km', '')) * 1000;
    } else if (str.includes('cm')) {
        return parseFloat(str.replace('cm', '')) / 100;
    } else if (str.includes('dm')) {
        return parseFloat(str.replace('dm', '')) / 10;
    } else if (str.includes('m')) {
        return parseFloat(str.replace('m', ''));
    } else {
        return parseFloat(str);
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
        this.#height = unitParse(height)
        this.#depth = unitParse(depth)
        this.#weight = unitParse(weight)
    }

    size(asArray = false) {
        return asArray ? [this.#width, this.#height, this.#depth] : { "width": this.#width, "height": this.#height, "depth": this.#depth }
    }

    getMaxVolume() {
        return this.#width * this.#height * this.#depth
    }

    getMaxVolumeStr() {
        return `${(this.getMaxVolume()*1_000_000).toFixed(2)}cm³`;
    }

    report() {
        return `AGD dev. status: ${super.report()}`
    }

}