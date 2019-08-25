import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { FilesService, WantedToken, } from '../../../services/files.service';
import { environment } from '../../../../environments/environment';
import { File } from '../../../interfaces';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RenameDialogComponent } from './rename-dialog/rename-dialog.component';
import { ShareDialogComponent } from './share-dialog/share-dialog.component';
import { switchMap } from 'rxjs/operators';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { OpenComponent } from './open/open.component';
import { DomSanitizer } from '@angular/platform-browser';
import { BasicDialogComponent } from '../../basic-dialog/basic-dialog.component';
import { Subscribable } from 'rxjs';
import { appAnimations } from '../../../animations';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.css'],
  providers: [FilesService],
  animations: [appAnimations]
})

export class ExplorerComponent implements OnInit {
  files: File[] = [];
  loading = true;
  @Input() name: string;
  @Input() permissions: string;
  @Input() basePath: string;
  @Input() currentPath: string;
  @Output() CurrentPathChanged = new EventEmitter<[string, string]>();
  cutCopyFile: [File, boolean]; // Boolean is true if operation is a copy, false if it is a cut

  // tslint:disable-next-line:max-line-length
  constructor(private fileService: FilesService, private authService: AuthService, public dialog: MatDialog, public snackBar: MatSnackBar, private sanitizer: DomSanitizer) {
  }

  private exploreCurrentDirectory(): Subscribable<File[]> {
    return this.fileService.explore(this.currentPath);
  }

  private displayFiles(action?: string): (value: File[]) => void {
    return files => {
      this.files = files;
      this.files.sort(fileSortFunction);
      this.loading = false;
      if (action) { this.snackBar.open(`${action} done`, 'OK', { duration: 3000 }); }
    };
  }

  ngOnInit() {
    this.exploreCurrentDirectory().subscribe(this.displayFiles());
  }

  create(isDir: boolean) {
    const newName = isDir ? 'New folder' : 'New file';
    let variant = 0;
    let newFileName = '';
    while (true) {
      newFileName = variant === 0 ? `${newName}${isDir ? '' : '.txt'}` : `${newName} ${variant}${isDir ? '' : '.txt'}`;
      const existingFile = this.files.filter((file: File) => {
        return file.name.toLowerCase() === newFileName.toLowerCase();
      })[0];

      if (!existingFile) {
        break;
      }

      variant++;
    }
    if (isDir) {
      this.fileService.createDir(this.currentPath, newFileName)
        .pipe(switchMap(() => this.exploreCurrentDirectory())).subscribe(this.displayFiles());
    } else {
      this.fileService.setContent(this.currentPath + '/' + encodeURI(newFileName), '')
        .pipe(switchMap(() => this.exploreCurrentDirectory())).subscribe(this.displayFiles());
    }
  }

  explore(file: File) {
    this.loading = true;
    this.currentPath = file.path.replace(/\/$/, '');
    this.CurrentPathChanged.emit([this.name, this.currentPath]);
    this.exploreCurrentDirectory().subscribe(this.displayFiles());
  }

  goBack() {
    this.loading = true;
    this.currentPath = this.currentPath.substring(0, this.currentPath.lastIndexOf('/'));
    this.CurrentPathChanged.emit([this.name, this.currentPath]);
    this.exploreCurrentDirectory().subscribe(this.displayFiles());
  }

  openRename(file: File) {
    const dialogRef = this.dialog.open(RenameDialogComponent, { data: file });
    dialogRef.afterClosed().subscribe(fileAfterRename => {
      if (fileAfterRename && fileAfterRename.name) {
        const newPath = `${this.currentPath}/${encodeURI(fileAfterRename.name)}`;
        this.fileService.renameOrCopy(file.path, newPath, false)
          .pipe(switchMap(() => this.exploreCurrentDirectory())).subscribe(this.displayFiles());
      }
    });
  }

  open(file: File, editMode: boolean) {
    const fileType = this.getType(file);
    if (fileType === 'text') {
      this.fileService.getContent(file.path).subscribe(data => {
        const dialogRef = this.dialog.open(OpenComponent, {
          data: {
            content: data,
            file: file,
            fileType: fileType,
            editMode: editMode,
            permissions: this.permissions
          }
        });
        if (editMode) {
          dialogRef.afterClosed().subscribe(newContent => {
            if (newContent) {
              this.fileService.setContent(file.path, newContent.content)
                .pipe(switchMap(() => this.exploreCurrentDirectory())).subscribe(this.displayFiles());
            }
          });
        } else {
          this.goNext(dialogRef, file);
        }
      });
    } else if (fileType === 'audio' || fileType === 'video' || fileType === 'image' || fileType === 'other') {
      const wantedToken: WantedToken = {
        sharedfor: 'opening',
        url: file.path,
        lifespan: 1,
      };
      this.fileService.getShareToken(wantedToken).subscribe(data => {
        // tslint:disable-next-line:max-line-length
        const url = this.sanitizer.bypassSecurityTrustResourceUrl(`${environment.host}${file.path}?inline&token=${data}`);
        const dialogRef = this.dialog.open(OpenComponent, {
          data: {
            url: url,
            file: file,
            fileType: fileType,
            editMode: false,
            permissions: this.permissions
          }
        });
        this.goNext(dialogRef, file);
      });
    } else if (fileType === 'document') {
      const wantedToken: WantedToken = {
        sharedfor: 'external_editing',
        url: file.path,
        lifespan: 1,
        canwrite: true
      };
      this.fileService.getShareToken(wantedToken).subscribe(data => {
        window.location.href = `https://${this.authService.officeServer}?file=${location.protocol}//${location.hostname}${file.path}&mtime=${file.mtime.toISOString()}&token=${data}&user=${this.authService.user}`;
      });
    }
  }

  private goNext(dialogRef, file: File) {
    dialogRef.afterClosed().subscribe(offset => {
      if (offset && typeof (offset.value) === 'number') {
        const nextFile = this.files[this.files.indexOf(file) + offset.value];
        if (nextFile) {
          this.open(nextFile, false);
        }
      }
    });
  }

  cut(file: File) {
    this.cutCopyFile = [file, false];
  }

  copy(file: File) {
    this.cutCopyFile = [file, true];
  }

  paste() {
    const newPath = `${this.currentPath}/${encodeURI(this.cutCopyFile[0].name)}`;
    const action = this.cutCopyFile[1] === true ? 'Copy' : 'Cut';
    this.snackBar.openFromComponent(CutCopyProgressBarComponent);
    this.fileService.renameOrCopy(this.cutCopyFile[0].path, newPath, this.cutCopyFile[1])
      .pipe(switchMap(() => this.exploreCurrentDirectory())).subscribe(this.displayFiles(action));
    this.cutCopyFile = undefined;
  }

  download(file: File) {
    const wantedToken: WantedToken = {
      sharedfor: 'downloading',
      url: file.path,
      lifespan: 1,
    };
    this.fileService.getShareToken(wantedToken).subscribe(data => {
      const shareURL = `${environment.host}${file.path}?token=${data}`;
      const link = document.createElement('a');
      link.href = shareURL;
      document.body.appendChild(link); // required in FF, optional for Chrome
      link.click();
    }
    );
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
            message: `The file will be available with the following links for ${wantedToken.lifespan} day${wantedToken.lifespan > 1 ? 's' : ''} :`,
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

  delete(file: File) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.fileService.delete(file.path, file.isDir)
          .pipe(switchMap(() => this.exploreCurrentDirectory())).subscribe(this.displayFiles());
      }
    });
  }

  onUploadComplete() {
    this.exploreCurrentDirectory().subscribe(this.displayFiles('Upload'));
  }

  getType(file): string {
    if (/(txt|md|csv|sh|nfo|log|json|yml|srt)$/.test(file.name.toLowerCase())) { return 'text'; }
    if (/(docx|doc|odt|xlsx|xls|ods|pptx|ppt|opd)$/.test(file.name.toLowerCase())) { return 'document'; }
    if (/(jpg|png|gif|svg|jpeg)$/.test(file.name.toLowerCase())) { return 'image'; }
    if (/(mp3|wav|ogg)$/.test(file.name.toLowerCase())) { return 'audio'; }
    if (/(mp4|avi|mkv|m4v)$/.test(file.name.toLowerCase())) { return 'video'; }
    if (/(pdf)$/.test(file.name.toLowerCase())) { return 'other'; }
  }

  getInfos(file: File): string {
    const d = new Date(file.mtime);
    const i = file.size === 0 ? 0 : Math.floor(Math.log(file.size) / Math.log(1024));
    const size = (file.size / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    return `${size} - ${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  }

  mustBounce(element: HTMLElement, file: any): boolean {
    if (typeof file.mustBounce === 'undefined') {
      file.mustBounce = file.name.length * 8 > element.clientWidth;
    }
    return file.mustBounce;
  }
}

function fileSortFunction(a: File, b: File): number {
  if (a.isDir !== b.isDir) {
    if (a.isDir) { return -1; } else { return 1; }
  } else {
    return a.name.localeCompare(b.name);
  }
}

@Component({
  selector: 'app-cut-copy-progress-bar',
  template: 'Operation in progress...<mat-progress-bar mode="indeterminate"></mat-progress-bar>',
  styles: [':host {font-size: 14px;}']
})
export class CutCopyProgressBarComponent { }
