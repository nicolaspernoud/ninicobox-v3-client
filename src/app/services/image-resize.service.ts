import { Injectable } from '@angular/core';
import { Subject, Observable, Subscription } from 'rxjs';
import Pica from 'pica';
import { NgxPicaResizeOptionsInterface, NgxPicaErrorType, NgxPicaErrorInterface } from './image-resize.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ImageResizeService {
  private picaResizer = new Pica();
  private originCanvas: HTMLCanvasElement  =  document.createElement('canvas');
  private ctx: CanvasRenderingContext2D  = this.originCanvas.getContext('2d');
  private destinationCanvas: HTMLCanvasElement  = document.createElement('canvas');

  constructor() { }

  public resizeImages(files: File[], width: number, height: number, options?: NgxPicaResizeOptionsInterface): Observable<File> {
    const resizedImage: Subject<File> = new Subject();
    const totalFiles: number = files.length;

    if (totalFiles > 0) {
      const nextFile: Subject<File> = new Subject();
      let index = 0;

      const subscription: Subscription = nextFile.subscribe((file: File) => {
        this.resizeImage(file, width, height, options).subscribe(imageResized => {
          index++;
          resizedImage.next(imageResized);

          if (index < totalFiles) {
            nextFile.next(files[index]);

          } else {
            resizedImage.complete();
            subscription.unsubscribe();
          }
        }, (err) => {
          const ngxPicaError: NgxPicaErrorInterface = {
            file: file,
            err: err
          };

          resizedImage.error(ngxPicaError);
        });
      });

      nextFile.next(files[index]);
    } else {
      const ngxPicaError: NgxPicaErrorInterface = {
        err: NgxPicaErrorType.NO_FILES_RECEIVED
      };

      resizedImage.error(ngxPicaError);
      resizedImage.complete();
    }

    return resizedImage.asObservable();
  }

  public resizeImage(file: File, width: number, height: number, options?: NgxPicaResizeOptionsInterface): Observable<File> {
    const resizedImage: Subject<File> = new Subject();
    const img = new Image();

    if (this.ctx) {
      img.onerror = (err) => {
        resizedImage.error({ err: NgxPicaErrorType.READ_ERROR, file: file, original_error: err });
      };

      img.onload = () => {
        window.URL.revokeObjectURL(img.src);
        this.originCanvas.width = img.width;
        this.originCanvas.height = img.height;

        this.ctx.drawImage(img, 0, 0);

        const imageData = this.ctx.getImageData(0, 0, img.width, img.height);
        if (options && options.aspectRatio && options.aspectRatio.keepAspectRatio) {
          let ratio = 0;

          if (options.aspectRatio.forceMinDimensions) {
            ratio = Math.max(width / imageData.width, height / imageData.height);
          } else {
            ratio = Math.min(width / imageData.width, height / imageData.height);
          }

          width = Math.round(imageData.width * ratio);
          height = Math.round(imageData.height * ratio);
        }

        this.destinationCanvas.width = width;
        this.destinationCanvas.height = height;

        this.picaResize(file, this.originCanvas, this.destinationCanvas, options)
          .catch((err) => resizedImage.error(err))
          .then((imgResized: File) => {
            resizedImage.next(imgResized);
          });
      };
      img.src = window.URL.createObjectURL(file);
    } else {
      resizedImage.error(NgxPicaErrorType.CANVAS_CONTEXT_IDENTIFIER_NOT_SUPPORTED);
    }
    return resizedImage.asObservable();
  }

  private picaResize(file: File, from: HTMLCanvasElement, to: HTMLCanvasElement, options: any): Promise<File> {
    return new Promise<File>((resolve, reject) => {
      this.picaResizer.resize(from, to, options)
        .catch((err) => reject(err))
        .then((resizedCanvas: HTMLCanvasElement) => {
          this.picaResizer.toBlob(resizedCanvas, file.type)
            .then((blob: Blob) => {
              retrieveExif(file)
                .then(exif => {
                  const fileResized = new File([blob.slice(0, 2), exif, blob.slice(2)], file.name, {
                    type: file.type,
                    lastModified: new Date().getTime()
                  });
                  resolve(fileResized);
                });
            });
        });
    });
  }
}

const SOS = 0xffda,
  APP1 = 0xffe1,
  EXIF = 0x45786966;

function retrieveExif(blob: File): Promise<BlobPart> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const buffer = reader.result;
      const view = new DataView(buffer as ArrayBuffer);
      let offset = 0;
      if (view.getUint16(offset) !== 0xffd8) {
        return reject('not a valid jpeg');
      }
      offset += 2;

      while (true) {
        const marker = view.getUint16(offset);
        if (marker === SOS) { break; }
        const size = view.getUint16(offset + 2);
        if (marker === APP1 && view.getUint32(offset + 4) === EXIF) {
          return resolve(blob.slice(offset, offset + 2 + size));
        }
        offset += 2 + size;
      }
      return resolve(new Blob());
    });
    reader.readAsArrayBuffer(blob);
  });
}
