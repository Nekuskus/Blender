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
    #psu; #voltage; #power; #status; #powerOnCounter; #usable
    constructor(psu, voltage, power) {
        this.#psu = psu
        this.#voltage = voltage
        this.#power = power
        this.#status = 0
        this.#powerOnCounter = 0
        this.#usable = true
    }

    on(voltage_in = '') {
        //do implementacji własnej - zadanie domowe ?
        this.#status = 1
    }

    off() {
        this.#status = 0
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
    #MTBF; #energyClass; #lCycles; #powerOnCounter; #typeDev; #width; #height; #depth; #weight
    constructor(psu, voltage, power, typeDev, energyClass, MTBF, width, height, depth, weight) {
        super(psu, voltage, power)
        this.#MTBF = MTBF
        this.#energyClass = energyClass
        this.#lCycles = 0
        this.#powerOnCounter = 0
        this.#typeDev = typeDev
        this.#width = width
        this.#height = height
        this.#depth = depth
        this.#weight = weight
    }

    size(asArray = false) {
        return asArray ? [this.#width, this.#height, this.#depth] : { "width": this.#width, "height": this.#height, "depth": this.#depth }
    }

    report() {
        return `AGD dev. status: ${super.report()}`
    }

}