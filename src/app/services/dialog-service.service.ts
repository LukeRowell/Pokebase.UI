import { Injectable } from '@angular/core';
import { DialogValues } from '../models/DialogValues';

@Injectable({
  providedIn: 'root'
})
export class DialogServiceService {
  public diagValues;

  constructor() {
    this.diagValues = new DialogValues();
  }
}
