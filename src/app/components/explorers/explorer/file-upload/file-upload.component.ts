import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FilesService, UploadProgress } from '../../../../services/files.service';

@Component({
    selector: 'app-file-uploader',
    templateUrl: './file-upload.component.html'
})

export class FileUploadComponent implements OnInit {
    @Input() path;
    @Input() basePath: string;
    @Output() UploadComplete: EventEmitter<void> = new EventEmitter<void>();
    uploads: UploadProgress[] = [];

    constructor(private filesService: FilesService) { }

    ngOnInit() {
        this.filesService.uploadProgress.subscribe(
            value => {
                try {
                    this.uploads.find(element => element.filename === value.filename).progress = value.progress;
                } catch (error) {
                    console.log('Upload element not yet defined : progress cannot be set (not an error)');
                }
            },
            err => { console.log(err); }
        );
    }

    onChange(event) {
        if (event.target.files.length > 0) {
            for (const file of event.target.files) {
                this.uploads.push({
                    filename: file.name,
                    progress: 0
                });
                this.filesService.upload(this.path, file).subscribe(
                    data => {
                        if (!!this.UploadComplete) {
                            this.UploadComplete.emit(file.name);
                            this.uploads.splice(this.uploads.findIndex(element => element.filename === file.filename));
                        }
                    },
                    err => { console.log(err); });
            }
        }
    }
}
