import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import Pica from 'pica';
import { NgxPicaResizeOptionsInterface, NgxPicaErrorType } from './image-resize.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ImageResizeService {
  private picaResizer = new Pica();

  constructor() { }

  public resizeImage(file: File, width: number, height: number, options?: NgxPicaResizeOptionsInterface): Observable<File> {
    const resizedImage: Subject<File> = new Subject();
    const originCanvas: HTMLCanvasElement = document.createElement('canvas');
    const ctx = originCanvas.getContext('2d');
    const img = new Image();

    if (ctx) {
      img.onerror = (err) => {
        resizedImage.error({ err: NgxPicaErrorType.READ_ERROR, file: file, original_error: err });
      };

      img.onload = () => {
        window.URL.revokeObjectURL(img.src);
        originCanvas.width = img.width;
        originCanvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);
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

        const destinationCanvas: HTMLCanvasElement = document.createElement('canvas');
        destinationCanvas.width = width;
        destinationCanvas.height = height;

        this.picaResize(file, originCanvas, destinationCanvas, options)
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

  private async picaResize(file: File, from: HTMLCanvasElement, to: HTMLCanvasElement, options: any): Promise<File> {
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
