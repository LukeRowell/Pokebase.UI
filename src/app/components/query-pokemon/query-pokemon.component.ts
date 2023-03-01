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

  log() {
    console.log('type1: %s', this.searchValues.type1);
    console.log('type2: %s', this.searchValues.type2);
    console.log('gen from: %d', this.searchValues.genFrom);
    console.log('gen thru: %d', this.searchValues.genThru);
    console.log('sort: %s', this.searchValues.sortVal);
    console.log('order: %s', this.searchValues.orderVal);
  }
}