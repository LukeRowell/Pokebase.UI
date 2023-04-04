import { Pokemon } from './pokemon';

export class StackItem {
    constructor(newList: Pokemon[], newButton: HTMLButtonElement) {
        this.pokemonList = newList;
        this.button = newButton;
        this.arrow = document.createElement('svg');
        this.arrow.className = 'stackItemArrow';
        this.arrow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="20" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
                                </svg>`;
        this.arrow.style.position = "relative";
        this.arrow.style.top = "8%";
        this.arrow.style.marginLeft = "0.5%";
        this.arrow.style.marginRight = "0.5%";
    }

    pokemonList;
    button: HTMLButtonElement;
    arrow: any;
}