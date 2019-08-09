import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FilesService, WantedToken, } from '../../../../services/files.service';
import { File } from '../../../../interfaces';
import { ShareDialogComponent } from '../share-dialog/share-dialog.component';
import { environment } from '../../../../../environments/environment';
import { BasicDialogComponent } from '../../../basic-dialog/basic-dialog.component';

@Component({
  selector: 'app-preview',
  templateUrl: './open.component.html',
  styleUrls: ['./open.component.css']
})
export class OpenComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<OpenComponent>, @Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, private fileService: FilesService) { }

  ngOnInit() {
  }

  openShare(file: File) {
    const dialogRef = this.dialog.open(ShareDialogComponent);
    dialogRef.afterClosed().subscribe(data => {
      const wantedToken: WantedToken = {
        sharedfor: data.sharedfor,
        url: file.path,
        lifespan: data.lifespan,
      };
      this.fileService.getShareToken(wantedToken).subscribe(data => {
        const shareURL = `${environment.host}${file.path}?token=${data}`;
        this.dialog.open(BasicDialogComponent, {
          data: {
            message: `The file will be available with the following link for ${wantedToken.lifespan} day${wantedToken.lifespan > 1 ? 's' : ''} :`,
            link: {
              caption: file.name,
              href: shareURL
            }
          }
        });
      });
    }
    );
  }

}
