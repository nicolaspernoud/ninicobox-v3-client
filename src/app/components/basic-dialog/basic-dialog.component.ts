import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { $ } from 'protractor';

@Component({
  selector: 'app-basic-dialog',
  templateUrl: './basic-dialog.component.html',
  styleUrls: ['./basic-dialog.component.css']
})
export class BasicDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<BasicDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

  getFacebookShare() {
    return `https://www.facebook.com/sharer/sharer.php?u=${window.location.hostname + this.data.link.href}`;
  }

  getMailTo() {
    return `mailto:%20?&subject=${this.data.link.caption}&body=%3Ch2%3E${this.data.message}%3C%2Fh2%3E%3Ca%20href%3D%22${window.location.hostname + this.data.link.href}%22%3E${this.data.link.caption}%3C%2Fa%3E`;
  }

}
