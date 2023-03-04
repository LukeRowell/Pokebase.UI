import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Pokemon } from './models/pokemon';
import { PokemonService } from './services/pokemon.service';
import { SearchValues } from './models/SearchValues';
import { Sort, MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild(MatSort) sort = new MatSort();

  title = 'Pokebase.UI';
  pokemonList: Pokemon[] = [];
  pokemonToFind?: Pokemon;
  searchValues = new SearchValues();
  displayedColumns: string[] = ['spritePath', 'ndexno', 'name', 'type1', 'type2', 'hp', 'attack', 'defense', 'spatk', 'spdef', 'speed', 'total', 'gen'];
  dataSource = new MatTableDataSource(this.pokemonList);

  constructor(private pokemonService: PokemonService) { }

  ngOnInit() : void { }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  sortData(sort: Sort) {
    const data = this.pokemonList;
  
    if (!sort.active || sort.direction === '') {
      this.pokemonList = data;
      return;
    }
    
    this.pokemonList = data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'ndexno':
          return this.compare(a.ndexno, b.ndexno, isAsc);
        case 'name':
          return this.compare(a.name, b.name, isAsc);
        case 'type1':
          return this.compare(a.type1, b.type1, isAsc);
        case 'type2':
          const aType2 = typeof(a.type2 == undefined) ? " " : !a.type2;
          const bType2 = typeof(b.type2 == undefined) ? " " : !b.type2;
          return this.compare(aType2, bType2, isAsc);
        case 'hp':
          return this.compare(a.hp, b.hp, isAsc);
        case 'attack':
          return this.compare(a.attack, b.attack, isAsc);
        case 'defense':
          return this.compare(a.defense, b.defense, isAsc);
        case 'spatk':
          return this.compare(a.spatk, b.spatk, isAsc);
        case 'spdef':
          return this.compare(a.spdef, b.spdef, isAsc);
        case 'speed':
          return this.compare(a.speed, b.speed, isAsc);
        case 'total':
          return this.compare(a.total, b.total, isAsc);
        case 'gen':
          return this.compare(a.gen, b.gen, isAsc);
        default:
          return 0;
      }
    });

    console.log(this.pokemonList);
    this.dataSource = new MatTableDataSource(this.pokemonList);
  }

  compare(a: number | string | boolean, b: number | string | boolean, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  updatePokemonListFromQuery(pokemon: Pokemon[]) {
    for (var p of pokemon)
    {
      p.spritePath = "/assets/sprites/" + p.gen.toString() + "/" + p.name.toLowerCase().replace(': ', '-') + ".png";
      p.bulbaLink = "https://bulbapedia.bulbagarden.net/wiki/" + p.name + "_(Pokémon)";
    }
  
    this.pokemonList = pokemon;
    this.dataSource = new MatTableDataSource(this.pokemonList);
  }

  //When a pokemon is searched, clear the list and add the new pokemon
  updatePokemonListFromSearch(pokemon: Pokemon) {
    pokemon.spritePath = "/assets/sprites/" + pokemon.gen.toString() + "/" + pokemon.name.toLowerCase().replace(': ', '-') + ".png";
    pokemon.bulbaLink = "https://bulbapedia.bulbagarden.net/wiki/" + pokemon.name + "_(Pokémon)";
    this.pokemonList = [];
    this.pokemonList.push(pokemon);
    this.dataSource = new MatTableDataSource(this.pokemonList);
  }
}