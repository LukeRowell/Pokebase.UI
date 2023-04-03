import { Component, Output, EventEmitter } from '@angular/core';
import { Pokemon } from 'src/app/models/pokemon';
import { PokemonService } from 'src/app/services/pokemon.service';
import { SearchValues } from 'src/app/models/SearchValues';

@Component({
  selector: 'app-query-pokemon',
  templateUrl: './query-pokemon.component.html',
  styleUrls: ['./query-pokemon.component.css']
})
export class QueryPokemonComponent {
  @Output() tableUpdated = new EventEmitter<Pokemon[]>();
  @Output() viewSwapped = new EventEmitter<any>();

  searchValues = new SearchValues();
  test = 1;

  //Inject the pokemon service
  constructor(private pokemonService: PokemonService) {}

  ngOnInit(): void {
    this.viewSwapped.emit(0);

    this.searchValues.type1 = 'Any';
    this.searchValues.type2 = 'Any';
    this.searchValues.genFrom = 1;
    this.searchValues.genThru = 1;
    this.searchValues.sortVal = 'ndexno';
    this.searchValues.orderVal = 'ASC';

    this.pokemonService
      .getPokemon(this.searchValues)
      .subscribe((pokemon: Pokemon[]) => this.tableUpdated.emit(pokemon));

    this.searchValues.genThru = 9;
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

  log() {
    console.log(this.searchValues.genFrom);
    console.log(this.searchValues.genThru);
  }
}