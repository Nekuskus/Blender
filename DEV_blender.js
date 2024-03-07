class Blender extends AGDDev {
    constructor() {
        super(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
        console.log(super.report());
    }
}

class EdibleObject {
    //zaimplementuj report
    //zaimplementuj wagę_per_sztuka
    //zaimplementuj ilość
    //name
}

class Fruit extends EdibleObject {
    //klasa pusta, jest po to aby była właściwa nazwa typu
}

class Vegetable extends EdibleObject {
    //klasa pusta, jest po to aby była właściwa nazwa typu
}

class Liquid {
    //zaimplementuj objętość
    //zaimplementuj wagę_per_litr
    //name
    //temperatura
}

class Temperature {
    //just support both celcius and farenheit
}

class Celcius extends Temperature {

}

class Fahrenheit extends Temperature {

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
 - otwórz pokrywke()
 - insert item(EdibleObject) jeżeli pokrywka otwarta else throw Exception
 - blend() miksuje rzeczy, wciąż działa jeśli nie ma nic w środku, jak user chce miksować nic to niech ma
   zwraca obiekt mixu złożony z report EdibleObjectów wszystkich w blenderze
   zwraca obiekt drinku, jeżeli mix zawierał ciecz
   wykorzystaj typeof aby wykorzystać do wypisywania czy coś jest owocem, warzywem lub cieczą
property:
 - allow hot liquids => jeżeli jest FALSE a insertuje się liquid o temperaturze wyższej niż 49 stopni celsjusza to Exception
   nie wszystkie blendery dobrze pracują z ciepłą cieczą
 - contents - wszystko co wrzucone do blendera w tablicy, czyszczona po return blend()
 - liquid_contents - ponieważ stackowanie cieczy jest teoretycznie osobne względem stackowania obiektów (leci na sam dół blendera obok warzyw/owoców)
 - registered_mixes - lista mixów/drinków zawierająca dla każdego name i wymagane składniki, jeśli jest match dla tego co akurat się blenduje() to podaje name drinku do Mixed aby się nazywał
    np "Tequila Sunset" => [tequila, sok pomarańczowy, syrop grenadine]
   jeśli jest więcej niż jeden match to wybiera ten gdzie jest więcej elementów
*/