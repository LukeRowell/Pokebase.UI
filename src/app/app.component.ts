import { Component, ViewChild, AfterViewInit, Input, Output, EventEmitter, Optional, ElementRef, Directive } from '@angular/core';
import { Pokemon } from './models/pokemon';
import { SearchValues } from './models/SearchValues';
import { Sort, MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { DialogValues } from './models/DialogValues';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ChartConfiguration } from 'chart.js';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { FormControl } from '@angular/forms';
import { _MatRadioButtonBase } from '@angular/material/radio';
import { StackItem } from './models/StackItem';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild(MatSort) sort = new MatSort();
  @ViewChild('chartStack', { static: false }) stack?: ElementRef;

  title = 'Pokebase.UI';
  pokemonList: Pokemon[] = [];
  sliceListStack: Pokemon[][] = [];
  pokemonToFind?: Pokemon;
  searchValues = new SearchValues();
  displayedColumns: string[] = ['spritePath', 'ndexno', 'name', 'type1', 'type2', 'hp', 'attack', 'defense', 'spatk', 'spdef', 'speed', 'total', 'gen'];
  dataSource = new MatTableDataSource(this.pokemonList);
  results = 0;
  resultsPercentage = "";
  dialogValues = new DialogValues();
  offsetVal = 0;
  selectedView = new FormControl(0);
  selectedChart = new FormControl(1);
  doneLoading = true;
  clearStack = true;
  listStack: StackItem[] = [];

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    elements: {
      arc: {
        borderWidth: 5,   //TODO: Change to be a function that hides line when there is only one slice
        borderColor: 'lightblue',
        borderRadius: 5,
        borderJoinStyle: 'round'
      }
    },
    layout: {
      padding: 70
    },
    plugins: { 
      legend: {
        display: false,
        position: 'top',
      },
      datalabels: {
        align: "end",
        anchor: "end",
        offset: (context) => {
          var index = context.dataIndex;
          var value = context.dataset.data[index]!;

          if (value <= 5) {
            this.offsetVal = (this.offsetVal == 0 ? 20 : 0);
          } 
          else {
            if (this.offsetVal == 20) {
              this.offsetVal = 0;
            }
          }
          
          return this.offsetVal;
        },
        clip: false,
        display: true,
        color: "black",
        formatter: (value, ctx) => {
          if (ctx.chart.data.labels) {
            return ctx.chart.data.labels[ctx.dataIndex];
          }
        },
      },
    }
  };

  public genChartDatasets = [{ data: [0] }];
  public typeChartDatasets = [{ data: [0], backgroundColor: [''] }];
  public monoVsDualChartDatasets = [{ data: [0], backgroundColor: ['darkred', 'darkgreen'] }];
  public totalChartDatasets = [{ data: [0] }];
  public pieChartLegend = false;
  public pieChartPlugins = [ DatalabelsPlugin ];
  public genChartLabels = [['']];
  public typeChartLabels = [['']];
  public monoVsDualChartLabels = [['']];
  public totalChartLabels = [['']];

  constructor(public dialog: MatDialog, private snackBar: MatSnackBar) { }

  ngOnInit() : void { 
    this.selectedView.setValue(0);
    this.selectedChart.setValue(0);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  ngOnChanges() {
    console.log('changed');
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

  popItem = (name: string) => {
    var activity = document.getElementById("chartStack")!;

    for (let i = this.listStack.length - 1; i >= 0; i--) {
      if (this.listStack[i].button.innerHTML.toString() == name) {
        console.log('break');
        break;
      }

      console.log('removing');
      activity.removeChild(this.listStack[i].arrow);
      activity.removeChild(this.listStack[i].button);
      this.listStack.pop();
    }

    this.clearStack = false;
    this.updatePokemonListFromQuery(this.listStack[this.listStack.length - 1].pokemonList);
  }


  chartClicked(event: any) {
    var activity = document.getElementById("chartStack")!;
    let sliceList: Pokemon[] = [];
    let index = parseInt(event.active[0].index);
    let buttonText = "";

    switch (this.selectedChart.value) {
      case 0:
        let genLabel = this.genChartLabels[index][0];
        let genValue = parseInt(genLabel[genLabel.length - 1]);

        for (var p of this.pokemonList) {
          if (p.gen == genValue) {
            sliceList.push(p);
          }
        }

        buttonText = this.genChartLabels[index][0];
        break;
      case 1:
        let typeName = this.typeChartLabels[index][0];

        for (var p of this.pokemonList) {
          if (p.type1 == typeName || p.type2 == typeName) {
            sliceList.push(p);
          }
        }

        buttonText = this.typeChartLabels[index][0];
        break;
      case 2:
        for (var p of this.pokemonList) {
          if (index == 0 && p.type2 == undefined) {
            sliceList.push(p);
          }
          else if (index == 1 && p.type2 != undefined) {
            sliceList.push(p);
          }
        }

        buttonText = this.monoVsDualChartLabels[index][0];
        break;
      case 3:
        let statLabel = this.totalChartLabels[index][0];
        let lowerBound = parseInt(statLabel.slice(0, 3));
        let upperBound = parseInt(statLabel.slice(statLabel.length - 3));

        for (var p of this.pokemonList) {
          if (p.total >= lowerBound && p.total <= upperBound) {
            sliceList.push(p);
          }
        }

        buttonText = this.totalChartLabels[index][0];
        break;
      default:
        break;
    }

    this.clearStack = false;
    //console.log(this.sliceListStack);
    //this.sliceListStack.push(this.pokemonList);
    
    var button = document.createElement('button');

    button.type = 'button';
    button.className = 'stackItem';
    button.innerHTML = buttonText + '  (' + sliceList.length + ')';
    button.style.position = "relative";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";
    button.onclick = () => {
      this.popItem(button.innerHTML.toString());
    };

    let newItem = new StackItem(sliceList, button);

    newItem.pokemonList = sliceList;
    this.listStack.push(newItem);

    //console.log('new item');
    //console.log(newItem);

    this.updatePokemonListFromQuery(sliceList);
    activity.appendChild(newItem.arrow);
    activity.appendChild(newItem.button);
  }

  appendListItems(event: any) {
    console.log('stack: ', this.stack);
    if (event == 1) {
      console.log('appendListItems');
      console.log(this.listStack);

      var activity = document.getElementById("chartStack")!;

      for (let i = 0; i < this.listStack.length; i++) {
        if (i > 0) {
          //activity.appendChild(this.listStack[i].arrow);
        }
        //activity.appendChild(this.listStack[i].button);
      }
    }
  }

  updatePokemonListFromQuery(pokemon: Pokemon[]) {
    this.doneLoading = false;

    if (this.clearStack) {
      const buttonElements = document.getElementsByClassName('stackItem')!;
      const arrowElements = document.getElementsByClassName('stackItemArrow')!;
      
      while(buttonElements.length > 0) {
        buttonElements[0].parentNode!.removeChild(buttonElements[0]);
      }
      
      while(arrowElements.length > 0) {
        arrowElements[0].parentNode!.removeChild(arrowElements[0]);
      }
      this.listStack = [];
    }

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
    let genDataArr = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    let typeDict: { [type: string]: [number, string]} = 
                    {'Bug': [0, '#AABB22'], 'Dark': [0, '#705848'], 'Dragon': [0, '#7766EE'], 'Electric': [0, '#FFCC33'],
                     'Fairy': [0, '#EE99EE'], 'Fighting': [0, '#BB5544'], 'Fire': [0, '#FF4422'], 'Flying': [0, '#8899FF'],
                     'Ghost': [0, '#6666BB'], 'Grass': [0, '#77CC55'], 'Ground': [0, '#DDBB55'], 'Ice': [0, '#66CCFF'],
                     'Normal': [0, '#AAAA99'], 'Poison': [0, '#AA5599'], 'Psychic': [0, '#FF5599'], 'Rock': [0, '#BBAA66'],
                     'Steel': [0, '#AAAABB'], 'Water': [0, '#3399FF'], 'None': [0, 'black']
                    };
    let totalDict: { [statRange: string]: number } = {'0 - 99': 0, 
                                                      '100 - 199': 0, 
                                                      '200 - 299': 0, 
                                                      '300 - 399': 0, 
                                                      '400 - 499': 0, 
                                                      '500 - 599': 0, 
                                                      '600 - 699': 0, 
                                                      '700 - 799': 0};

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
        this.typeChartLabels.push([key]);
        this.typeChartDatasets[0].backgroundColor.push(typeDict[key][1]);
      }
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

    if (this.clearStack) {
      var activity = document.getElementById('chartStack')!;
      var button = document.createElement('button');

      button.type = 'button';
      button.className = 'stackItem';
      button.innerHTML = 'Main List  (' + this.pokemonList.length.toString() + ')';
      button.style.position = "relative";
      button.style.borderRadius = "5px";
      button.style.cursor = "pointer";
      button.onclick = () => {
        this.popItem(button.innerHTML.toString());
      };

      let newItem = new StackItem(pokemon, button);
      this.listStack.push(newItem);

      activity.appendChild(newItem.button);
    }

    this.clearStack = true;
    this.doneLoading = true;
  }

  hideList(event: any) {
    var listDiv = document.getElementById('chartStack')!;
    listDiv.style.display = (event == 1 ? 'flex' : 'none');
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
      minHeight: '400px',
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