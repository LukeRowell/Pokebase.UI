import { Component, Input, Output, OnInit, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Pokemon } from 'src/app/models/pokemon';
import { PokemonService } from 'src/app/services/pokemon.service';

@Component({
  selector: 'app-search-pokemon',
  templateUrl: './search-pokemon.component.html',
  styleUrls: ['./search-pokemon.component.css']
})
export class SearchPokemonComponent implements OnInit {
  @Input() pokemon = "";
  @Output() tableUpdated = new EventEmitter<Pokemon>();

  //Inject the pokemon service
  constructor(private pokemonService: PokemonService) {}

  ngOnInit(): void {

  }

  //When the search button is hit, call the pokemon service by emitting/outputting the event
  searchPokemon(pokemonToSearch: string) {
    this.pokemonService
      .searchPokemonByName(pokemonToSearch)
      .subscribe((pokemon: Pokemon) => this.tableUpdated.emit(pokemon));
  }
}