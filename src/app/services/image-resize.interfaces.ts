export interface AspectRatioOptions {
    keepAspectRatio: boolean;
    forceMinDimensions?: boolean;
  }
  
  export interface NgxPicaResizeOptionsInterface {
    aspectRatio?: AspectRatioOptions;
    quality?: number;
    alpha?: boolean;
    unsharpAmount?: number;
    unsharpRadius?: number;
    unsharpThreshold?: number;
  }
  
  export enum NgxPicaErrorType {
    NO_FILES_RECEIVED = 'NO_FILES_RECEIVED',
    CANVAS_CONTEXT_IDENTIFIER_NOT_SUPPORTED = 'CANVAS_CONTEXT_IDENTIFIER_NOT_SUPPORTED',
    NOT_BE_ABLE_TO_COMPRESS_ENOUGH = 'NOT_BE_ABLE_TO_COMPRESS_ENOUGH',
    READ_ERROR = 'IMAGE_COULD_NOT_BE_LOADED'
  }
  
  export interface NgxPicaErrorInterface {
    err: NgxPicaErrorType;
    file?: File;
  }