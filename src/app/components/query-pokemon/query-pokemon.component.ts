import { Component, Output, EventEmitter } from '@angular/core';
import { Pokemon } from 'src/app/models/pokemon';
import { PokemonService } from 'src/app/services/pokemon.service';
import { SearchValues } from 'src/app/models/SearchValues';
import { TypeValues } from 'src/app/models/TypeValues';

@Component({
  selector: 'app-query-pokemon',
  templateUrl: './query-pokemon.component.html',
  styleUrls: ['./query-pokemon.component.css']
})
export class QueryPokemonComponent {
  @Output() tableUpdated = new EventEmitter<Pokemon[]>();
  @Output() viewSwapped = new EventEmitter<any>();

  searchValues = new SearchValues();
  genValues: boolean [] = [false, false, false, false, false, false, false, false, false];
  typeValues = new TypeValues();
  type1Index = 0;
  type2Index = 1;

  //Inject the pokemon service
  constructor(private pokemonService: PokemonService) {}

  ngOnInit(): void {
    this.viewSwapped.emit(0);

    this.searchValues.type1 = 'Any';
    this.searchValues.type2 = 'Any';
    this.searchValues.genFrom = 1;
    this.searchValues.genThru = 1;
    this.searchValues.genValues = [true, false, false, false, false, false, false, false, false];
    this.searchValues.sortVal = 'ndexno';
    this.searchValues.orderVal = 'ASC';

    this.pokemonService
      .getPokemon(this.searchValues)
      .subscribe((pokemon: Pokemon[]) => this.tableUpdated.emit(pokemon));

    this.searchValues.genThru = 9;

    this.typeValues.values[0] = true;
    this.typeValues.values[1] = true;
    this.typeValues.total = 2;
  }

  queryPokemon() {
    this.viewSwapped.emit(1);

    this.pokemonService
      .getPokemon(this.searchValues)
      .subscribe((pokemon: Pokemon[]) => this.tableUpdated.emit(pokemon));
  }

  updateGenFrom(event?: any) {
    this.searchValues.genFrom = parseInt(event.target.ariaValueText);
  }

  updateGenThru(event?: any) {
    this.searchValues.genThru = parseInt(event.target.ariaValueText);
  }

  updateGenValues(value: boolean) {
    for (let i = 0; i < this.genValues.length; i++) {
      this.searchValues.genValues[i] = value;
    }
  }

  randomizeTypeValue(typeToChange: number) {
    let done = false;
    let randomTypeIndex = 0;

    while (!done) {
      randomTypeIndex = Math.floor(Math.random() * (21 - 1 + 1) + 1) - 1;

      let type1Cond = (randomTypeIndex != this.type1Index && randomTypeIndex != this.type2Index && randomTypeIndex != 1 && typeToChange == 1);
      let type2Cond = (randomTypeIndex != this.type2Index && randomTypeIndex != this.type1Index && randomTypeIndex != 0 && typeToChange == 2);

      if (type1Cond || type2Cond) {
        done = true;
      }
    }

    if (typeToChange == 1) {
      var typeElemToUpdate = document.getElementsByClassName("type1Display");

      this.typeValues.values[this.type1Index] = false;
      this.type1Index = randomTypeIndex;
      this.typeValues.values[this.type1Index] = true;
      this.searchValues.type1 = this.typeValues.names[this.type1Index];

      typeElemToUpdate[0].className = "type1Display " + this.searchValues.type1 + "Color";
    }
    else {
      var typeElemToUpdate = document.getElementsByClassName("type2Display");

      this.typeValues.values[this.type2Index] = false;
      this.type2Index = randomTypeIndex;
      this.typeValues.values[this.type2Index] = true;
      this.searchValues.type2 = this.typeValues.names[this.type2Index];

      typeElemToUpdate[0].className = "type2Display " + this.searchValues.type2 + "Color";
    }
  }

  randomizeGenValues() {
    let numbersToGenerate = Math.floor(Math.random() * (9 - 2 + 1) + 2);
    
    this.updateGenValues(false);

    while (numbersToGenerate--) {
      let valueIndex = Math.floor(Math.random() * (9 - 2 + 1) + 2);
      this.searchValues.genValues[valueIndex - 1] = true;
    }
  }

  updateType(elem: HTMLElement) {
    var buttonGroup = elem.classList.contains('group1') ? document.getElementsByClassName('group1') : document.getElementsByClassName('group2');

    for (let i = 0; i < buttonGroup.length; i++) {
      if (buttonGroup[i].classList.contains('selected')) {
        buttonGroup[i].classList.remove('selected');
        break;
      }
    }
    
    elem.classList.add('selected');
    elem.classList.contains('group1') ? this.searchValues.type1 = elem.classList[0] : this.searchValues.type2 = elem.classList[0];
  }

  updateTypes(typeIndex: number) {
    //var checkbox = document.getElementsByClassName(typeName);
    let name = (typeIndex == 0 || typeIndex == 1) ? "Any" : this.typeValues.names[typeIndex];
    let direction = (this.typeValues.values[typeIndex]) ? 1 : -1;
    let type1Selected = false;

    switch (this.typeValues.total) {
      case 0: 
        this.searchValues.type1 = name;
        this.typeValues.total += direction;
        this.type1Index = typeIndex;
        break;
      case 1:
        if (direction < 0) {
          if (typeIndex == this.type1Index) {
            this.searchValues.type1 = "None";
            this.type1Index = -1;
          }
          else {
            this.searchValues.type2 = "None";
            this.type2Index = -1;
          }
        }
        else {
          if (this.searchValues.type1 == "None") {
            this.searchValues.type1 = name;
            this.type1Index = typeIndex;
            type1Selected = true;
          }
          else {
            this.searchValues.type2 = name;
            this.type2Index = typeIndex;
          }
        }

        this.typeValues.total += direction;
        break;
      case 2:
        if (direction > 0) {
          this.typeValues.values[typeIndex] = false;
        }
        else {
          if (typeIndex == this.type1Index) {
            this.searchValues.type1 = "None";
            this.type1Index = -1;
            type1Selected = true;
          }
          else {
            this.searchValues.type2 = "None";
            this.type2Index = -1;
          }

          this.typeValues.total += direction;
        }
        break;
    }

    if (type1Selected) {
      var typeElemToUpdate = document.getElementsByClassName("type1Display");
      typeElemToUpdate[0].className = "type1Display " + this.searchValues.type1 + "Color";
    }
    else {
      var typeElemToUpdate = document.getElementsByClassName("type2Display");
      typeElemToUpdate[0].className = "type2Display " + this.searchValues.type2 + "Color";
    }
  }

  log() {
    console.log(this.searchValues.genFrom);
    console.log(this.searchValues.genThru);
  }
}