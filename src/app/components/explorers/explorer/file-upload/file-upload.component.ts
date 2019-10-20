import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FilesService, UploadProgress } from '../../../../services/files.service';
import { ImageResizeService } from '../../../../services/image-resize.service';

@Component({
    selector: 'app-file-uploader',
    templateUrl: './file-upload.component.html'
})

export class FileUploadComponent implements OnInit {
    @Input() path;
    @Input() basePath: string;
    @Output() UploadComplete: EventEmitter<void> = new EventEmitter<void>();
    uploads: UploadProgress[] = [];

    constructor(private filesService: FilesService, private imageResizeService: ImageResizeService) { }

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

    async onChange(event) {
        if (event.target.files.length > 0) {
            const files: File[] = event.target.files;
            const imageFiles: File[] = [];
            for (const file of files) {
                this.uploads.push({
                    filename: file.name,
                    progress: 0
                });
                // If the file is an image use pica for resizing
                if (file.type === 'image/jpeg') {
                    const newFile = await this.imageResizeService.resizeImage(file, 2560, 1440, { aspectRatio: { keepAspectRatio: true } });
                    this.upLoadFile(newFile);
                } else { // Else simply upload
                    this.upLoadFile(file);
                }
            }
        }
    }

    private upLoadFile(file: File) {
        this.filesService.upload(this.path, file).subscribe(() => {
            if (!!this.UploadComplete) {
                this.UploadComplete.emit();
                this.uploads.splice(this.uploads.findIndex(element => element.filename === file.name), 1);
            }
        }, err => { throw err.err; });
    }
}
