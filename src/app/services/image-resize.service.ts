import { Injectable } from '@angular/core';
import { Subject, Observable, Subscription } from 'rxjs';
import Pica from 'pica';
import { NgxPicaResizeOptionsInterface, NgxPicaErrorType, NgxPicaErrorInterface } from './image-resize.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ImageResizeService {

  private picaResizer = new Pica();
  private originCanvas = document.createElement('canvas');
  private ctx = this.originCanvas.getContext('2d');
  private destinationCanvas = document.createElement('canvas');

  constructor() { }

  public async resizeImage(file: File, width: number, height: number, options?: NgxPicaResizeOptionsInterface): Promise<File> {
    const img = new Image();
    let imgpromise = onload2promise(img);
    img.src = window.URL.createObjectURL(file);
    await imgpromise;

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

    const resizedCanvas: HTMLCanvasElement = await this.picaResizer.resize(this.originCanvas, this.destinationCanvas, options);
    const blob: Blob = await this.picaResizer.toBlob(resizedCanvas, file.type);
    const exif = await retrieveExif(file);
    const fileResized = new File([blob.slice(0, 2), exif, blob.slice(2)], file.name, {
      type: file.type,
      lastModified: new Date().getTime()
    });
    window.URL.revokeObjectURL(img.src);
    return fileResized;
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

interface OnLoadAble {
  onload: any;
  onerror: any;
}

function onload2promise<T extends OnLoadAble>(obj: T): Promise<T> {
  return new Promise((resolve, reject) => {
    obj.onload = () => resolve(obj);
    obj.onerror = reject;
  });
}