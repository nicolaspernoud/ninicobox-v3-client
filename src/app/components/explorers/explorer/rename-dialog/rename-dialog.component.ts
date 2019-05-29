import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-rename-dialog',
  templateUrl: './rename-dialog.component.html',
  styleUrls: ['./rename-dialog.component.css']
})
export class RenameDialogComponent {

  constructor(public dialogRef: MatDialogRef<RenameDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

}
