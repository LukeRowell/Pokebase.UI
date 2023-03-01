import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pokemon } from '../models/pokemon';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';
import { SearchValues } from 'src/app/models/SearchValues';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private url = "Pokemon";

  constructor(private http: HttpClient) { }

  //Query for a list of pokemon with the specified parameters
  public getPokemon(searchValues: SearchValues) : Observable<Pokemon[]> {
    //console.log(searchValues);
    //console.log(`${environment.apiUrl}/${this.url}`);
    return this.http.get<Pokemon[]>(`${environment.apiUrl}/${this.url}?type1=${searchValues.type1}&type2=${searchValues.type2}&genFrom=${searchValues.genFrom}&genThru=${searchValues.genThru}&sortVal=${searchValues.sortVal}&orderVal=${searchValues.orderVal}`);
  }

  //Search for one pokemon by name
  public searchPokemonByName(name: string) : Observable<Pokemon> {
    return this.http.get<Pokemon>(`${environment.apiUrl}/${this.url}/name?name=${name}`);
  }
}