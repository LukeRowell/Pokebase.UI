import { Component } from '@angular/core';
import { Pokemon } from './models/pokemon';
import { PokemonService } from './services/pokemon.service';
import { SearchValues } from './models/SearchValues';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Pokebase.UI';
  pokemonList: Pokemon[] = [];
  pokemonToFind?: Pokemon;
  searchValues = new SearchValues();
  displayedColumns: string[] = ['spritePath', 'ndexno', 'name', 'type1', 'type2', 'hp', 'attack', 'defense', 'spatk', 'spdef', 'speed', 'total', 'gen'];

  constructor(private pokemonService: PokemonService) {}

  ngOnInit() : void {

  }

  updatePokemonListFromQuery(pokemon: Pokemon[]) {
    for (var p of pokemon)
    {
      p.spritePath = "/assets/sprites/" + p.gen.toString() + "/" + p.name.toLowerCase().replace(': ', '-') + ".png";
      p.bulbaLink = "https://bulbapedia.bulbagarden.net/wiki/" + p.name + "_(Pokémon)";
    }
  
    this.pokemonList = pokemon;
  }

  //When a pokemon is searched, clear the list and add the new pokemon
  updatePokemonListFromSearch(pokemon: Pokemon) {
    pokemon.spritePath = "/assets/sprites/" + pokemon.gen.toString() + "/" + pokemon.name.toLowerCase().replace(': ', '-') + ".png";
    pokemon.bulbaLink = "https://bulbapedia.bulbagarden.net/wiki/" + pokemon.name + "_(Pokémon)";
    this.pokemonList = [];
    this.pokemonList.push(pokemon);
  }
}