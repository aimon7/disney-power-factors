import { Component, Inject } from '@angular/core';
import { IDisneyCharacter } from '../characters.component';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';


@Component({
  selector: 'app-character-detail',
  templateUrl: './character-detail.component.html',
  styleUrls: ['./character-detail.component.css']
})
export class CharacterDetailComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {character: IDisneyCharacter}) {}

}
