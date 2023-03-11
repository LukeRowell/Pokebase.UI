import { Component, ViewChild, AfterViewInit, Output, EventEmitter, Optional } from '@angular/core';
import { Pokemon } from './models/pokemon';
import { SearchValues } from './models/SearchValues';
import { Sort, MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Chart, ChartOptions } from 'chart.js';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { DialogValues } from './models/DialogValues';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

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
  results = 0;
  resultsPercentage = "";
  dialogValues = new DialogValues();

  // Pie
  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false
  };

  public genChartDatasets = [{ data: [0] }];
  public typeChartDatasets = [{ data: [0], backgroundColor: [''] }];
  public monoVsDualChartDatasets = [{ data: [0], backgroundColor: ['darkred', 'darkgreen'] }];
  public totalChartDatasets = [{ data: [0] }];
  public pieChartLegend = false;
  public pieChartPlugins = [];
  public genChartLabels = [['']];
  public typeChartLabels = [['']];
  public monoVsDualChartLabels = [['']];
  public totalChartLabels = [['']];

  constructor(public dialog: MatDialog, private snackBar: MatSnackBar) { }

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

    this.dataSource = new MatTableDataSource(this.pokemonList);
    this.results = this.pokemonList.length;
    this.resultsPercentage = ((this.results / 1008) * 100).toFixed(2);
  }

  compare(a: number | string | boolean, b: number | string | boolean, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  updatePokemonListFromQuery(pokemon: Pokemon[]) {
    this.pokemonList = pokemon;
    this.dataSource = new MatTableDataSource(this.pokemonList);
    this.results = this.pokemonList.length;
    this.resultsPercentage = ((this.results / 1008) * 100).toFixed(2);
    this.genChartLabels = [];
    this.typeChartLabels = [];
    this.totalChartLabels = [];
    this.typeChartDatasets[0].backgroundColor = [];
    this.genChartDatasets[0].data = [];
    this.typeChartDatasets[0].data = [];
    this.monoVsDualChartDatasets[0].data = [];
    this.totalChartDatasets[0].data = [];
    let i = 0;
    let genDataArr = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    let typeDict: { [type: string]: [number, string]} = 
                    {'Bug': [0, '#AABB22'], 'Dark': [0, '#705848'], 'Dragon': [0, '#7766EE'], 'Electric': [0, '#FFCC33'],
                     'Fairy': [0, '#EE99EE'], 'Fighting': [0, '#BB5544'], 'Fire': [0, '#FF4422'], 'Flying': [0, '#8899FF'],
                     'Ghost': [0, '#6666BB'], 'Grass': [0, '#77CC55'], 'Ground': [0, '#DDBB55'], 'Ice': [0, '#66CCFF'],
                     'Normal': [0, '#AAAA99'], 'Poison': [0, '#AA5599'], 'Psychic': [0, '#FF5599'], 'Rock': [0, '#BBAA66'],
                     'Steel': [0, '#AAAABB'], 'Water': [0, '#3399FF'], 'None': [0, 'black']
                    };
    let totalDict: { [statRange: string]: number } = {'0 - 99': 0, '100 - 199': 0, '200 - 299': 0, '300 - 399': 0, '400 - 499': 0, '500 - 599': 0, '600 - 699': 0, '700 - 799': 0};

    for (var p of pokemon) {
      p.spritePath = "/assets/sprites/" + p.gen.toString() + "/" + p.name.toLowerCase().replace(': ', '-') + ".png";
      p.bulbaLink = "https://bulbapedia.bulbagarden.net/wiki/" + p.name + "_(Pokémon)";
      
      genDataArr[p.gen - 1]++;
      typeDict[p.type1][0]++;
      p.type2 == null ? typeDict['None'][0]++ : typeDict[p.type2][0]++;

      if (p.total <= 99) {
        totalDict['0 - 99']++;
      }
      else if (p.total >= 100 && p.total <= 199) {
        totalDict['100 - 199']++;
      }
      else if (p.total >= 200 && p.total <= 299) {
        totalDict['200 - 299']++;
      }
      else if (p.total >= 300 && p.total <= 399) {
        totalDict['300 - 399']++;
      }
      else if (p.total >= 400 && p.total <= 499) {
        totalDict['400 - 499']++;
      }
      else if (p.total >= 500 && p.total <= 599) {
        totalDict['500 - 599']++;
      }
      else if (p.total >= 600 && p.total <= 699) {
        totalDict['600 - 699']++;
      }
      else if (p.total >= 700) {
        totalDict['700 - 799']++;
      }
    }

    for (let i = 0; i < genDataArr.length; i++) {
      if (genDataArr[i] != 0) {
        this.genChartDatasets[0].data.push(genDataArr[i]);
        this.genChartLabels.push(['Gen ' + (i + 1).toString(), ((genDataArr[i]/this.pokemonList.length) * 100).toFixed(0) + '%']);
      }
    }

    for (let key in typeDict) {
      if (key != 'None' && typeDict[key][0] > 0) {
        this.typeChartDatasets[0].data.push(typeDict[key][0]);
        this.typeChartLabels.push([key, typeDict[key][0].toString()]);
        this.typeChartDatasets[0].backgroundColor.push(typeDict[key][1]);
      }
      i++;
    }

    this.monoVsDualChartDatasets[0].data.push(typeDict['None'][0]);
    this.monoVsDualChartDatasets[0].data.push(pokemon.length - typeDict['None'][0]);
    this.monoVsDualChartLabels = [ ['Mono-type'], ['Dual-type'] ];

    for (let key in totalDict) {
      if (totalDict[key] != 0) {
        this.totalChartDatasets[0].data.push(totalDict[key]);
        this.totalChartLabels.push([key]);
      }
    }
  }

  //When a pokemon is searched, clear the list and add the new pokemon
  updatePokemonListFromSearch(pokemon: Pokemon) {
    pokemon.spritePath = "/assets/sprites/" + pokemon.gen.toString() + "/" + pokemon.name.toLowerCase().replace(': ', '-') + ".png";
    pokemon.bulbaLink = "https://bulbapedia.bulbagarden.net/wiki/" + pokemon.name + "_(Pokémon)";
    this.pokemonList = [];
    this.pokemonList.push(pokemon);
    this.dataSource = new MatTableDataSource(this.pokemonList);
    this.results = this.pokemonList.length;
    this.resultsPercentage = ((this.results / 1008) * 100).toFixed(2);
  }

  exportListToCSV() {
    let fileContent = "";
    let fileExtension = "";
    let headerRow = "";

    if (this.dialogValues.selectedType == ".csv") {
      fileContent = "data:text/csv;charset=utf-8,";
      fileExtension = ".csv";
    }

    else {
      fileContent = "data:text/charset=utf-8,";
      fileExtension = ".txt";
    }

    if (this.dialogValues.includeHeaders) {
      if (this.dialogValues.includeNdexno) {
        headerRow += "No.,"; 
      }
      if (this.dialogValues.includeName) {
        headerRow += "Name,"; 
      }
      if (this.dialogValues.includeType1) {
        headerRow += "Type 1,"; 
      }
      if (this.dialogValues.includeType2) {
        headerRow += "Type 2,"; 
      }
      if (this.dialogValues.includeHP) {
        headerRow += "HP,"; 
      }
      if (this.dialogValues.includeAttack) {
        headerRow += "Attack,"; 
      }
      if (this.dialogValues.includeDefense) {
        headerRow += "Defense,"; 
      }
      if (this.dialogValues.includeSpatk) {
        headerRow += "Sp. Atk,"; 
      }
      if (this.dialogValues.includeSpdef) {
        headerRow += "Sp. Def,"; 
      }
      if (this.dialogValues.includeSpeed) {
        headerRow += "Speed,"; 
      }
      if (this.dialogValues.includeTotal) {
        headerRow += "Total,"; 
      }
      if (this.dialogValues.includeGen) {
        headerRow += "Gen,"; 
      }

      headerRow = headerRow.substring(0, headerRow.length - 1);
      headerRow += "\n";

      fileContent += headerRow;
    }

    for (var p of this.pokemonList) 
    {
      let row = "";

      if (this.dialogValues.includeNdexno) {
        row += p.ndexno + ","; 
      }
      if (this.dialogValues.includeName) {
        row += p.name + ","; 
      }
      if (this.dialogValues.includeType1) {
        row += p.type1 + ","; 
      }
      if (this.dialogValues.includeType2) {
        row += (p.type2 == null ? "" : p.type2) + ","; 
      }
      if (this.dialogValues.includeHP) {
        row += p.hp + ","; 
      }
      if (this.dialogValues.includeAttack) {
        row += p.attack + ","; 
      }
      if (this.dialogValues.includeDefense) {
        row += p.defense + ","; 
      }
      if (this.dialogValues.includeSpatk) {
        row += p.spatk + ","; 
      }
      if (this.dialogValues.includeSpdef) {
        row += p.spdef + ","; 
      }
      if (this.dialogValues.includeSpeed) {
        row += p.speed + ","; 
      }
      if (this.dialogValues.includeTotal) {
        row += p.total + ","; 
      }
      if (this.dialogValues.includeGen) {
        row += p.gen + ","; 
      }

      row = row.substring(0, row.length - 1);
      row += "\n";

      fileContent += row;
    }

    var encodedURI = encodeURI(fileContent);
    var link = document.createElement("a");
    var d = new Date();
    var n = d.toLocaleTimeString();

    n = n.slice(0, n.length - 3);

    link.setAttribute("href", encodedURI);
    link.setAttribute("download", "results_" + n + fileExtension);

    document.body.appendChild(link);

    link.click();
  }

  openDialog() {
    const dialogRef = this.dialog.open(DialogExportListDialog, {
      width: '33%',
      height: '35%',
      maxWidth: '500px',
      panelClass: 'custom-modal',
      data: this.dialogValues
    });

    dialogRef.backdropClick().subscribe(result => {
      dialogRef.close(dialogRef.componentInstance.data);
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.isExporting) {
        this.exportListToCSV();
      }
    });

    dialogRef.componentInstance.clipboardUpdated.subscribe(() => {
      let config = new MatSnackBarConfig();
      let clipboardContent = "";
      let headerRow = "";
      
      config.duration = 2000;
      config.panelClass = ['custom-class'];

      if (this.dialogValues.includeHeaders) {
        if (this.dialogValues.includeNdexno) {
          headerRow += "No.,"; 
        }
        if (this.dialogValues.includeName) {
          headerRow += "Name,"; 
        }
        if (this.dialogValues.includeType1) {
          headerRow += "Type 1,"; 
        }
        if (this.dialogValues.includeType2) {
          headerRow += "Type 2,"; 
        }
        if (this.dialogValues.includeHP) {
          headerRow += "HP,"; 
        }
        if (this.dialogValues.includeAttack) {
          headerRow += "Attack,"; 
        }
        if (this.dialogValues.includeDefense) {
          headerRow += "Defense,"; 
        }
        if (this.dialogValues.includeSpatk) {
          headerRow += "Sp. Atk,"; 
        }
        if (this.dialogValues.includeSpdef) {
          headerRow += "Sp. Def,"; 
        }
        if (this.dialogValues.includeSpeed) {
          headerRow += "Speed,"; 
        }
        if (this.dialogValues.includeTotal) {
          headerRow += "Total,"; 
        }
        if (this.dialogValues.includeGen) {
          headerRow += "Gen,"; 
        }
  
        headerRow = headerRow.substring(0, headerRow.length - 1);
        headerRow += "\n";
  
        clipboardContent += headerRow;
      }
  
      for (var p of this.pokemonList) 
      {
        let row = "";
  
        if (this.dialogValues.includeNdexno) {
          row += p.ndexno + ","; 
        }
        if (this.dialogValues.includeName) {
          row += p.name + ","; 
        }
        if (this.dialogValues.includeType1) {
          row += p.type1 + ","; 
        }
        if (this.dialogValues.includeType2) {
          row += (p.type2 == null ? "" : p.type2) + ","; 
        }
        if (this.dialogValues.includeHP) {
          row += p.hp + ","; 
        }
        if (this.dialogValues.includeAttack) {
          row += p.attack + ","; 
        }
        if (this.dialogValues.includeDefense) {
          row += p.defense + ","; 
        }
        if (this.dialogValues.includeSpatk) {
          row += p.spatk + ","; 
        }
        if (this.dialogValues.includeSpdef) {
          row += p.spdef + ","; 
        }
        if (this.dialogValues.includeSpeed) {
          row += p.speed + ","; 
        }
        if (this.dialogValues.includeTotal) {
          row += p.total + ","; 
        }
        if (this.dialogValues.includeGen) {
          row += p.gen + ","; 
        }
  
        row = row.substring(0, row.length - 1);
        row += "\n";
  
        clipboardContent += row;
      }

      navigator.clipboard.writeText(clipboardContent);
      this.snackBar.open("List copied to clipboard!", "", config);
    });
  }
}

@Component({
  selector: 'dialog-export-list-dialog',
  templateUrl: 'dialog-export-list-dialog.html',
})
export class DialogExportListDialog {
  @Output() clipboardUpdated = new EventEmitter<any>();

  dialogValues = new DialogValues();

  constructor(@Inject(MAT_DIALOG_DATA) @Optional() public data: DialogValues) {
    if (data) {
      this.dialogValues = data;
    }
  }

  setExporting(exportVal: boolean) {
    this.dialogValues.isExporting = exportVal;
  }

  copyToClipboard() {
    this.clipboardUpdated.emit();
  }
}