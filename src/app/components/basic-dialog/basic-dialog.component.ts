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
    return `https://www.facebook.com/sharer/sharer.php?u=${location.protocol}//${location.hostname}${this.data.link.href}`;
  }

  getMailTo() {
    return `mailto:somebody?
    &subject=${this.data.link.caption}
    &body=
    <h2>${this.data.message}</h2>
    <a href="${location.protocol}//${location.hostname}${this.data.link.href}">${this.data.link.caption}</a>
    `;
  }

}
