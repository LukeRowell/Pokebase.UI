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
  searchValues = new SearchValues();
  test = 1;

  //Inject the pokemon service
  constructor(private pokemonService: PokemonService) {}

  ngOnInit(): void {
    this.searchValues.type1 = 'Any';
    this.searchValues.type2 = 'Any';
    this.searchValues.genFrom = 1;
    this.searchValues.genThru = 1;
    this.searchValues.sortVal = 'ndexno';
    this.searchValues.orderVal = 'ASC';

    this.pokemonService
      .getPokemon(this.searchValues)
      .subscribe((pokemon: Pokemon[]) => this.tableUpdated.emit(pokemon));
  }

  queryPokemon() {
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

  log() {
    console.log(this.searchValues.genFrom);
    console.log(this.searchValues.genThru);
  }
}