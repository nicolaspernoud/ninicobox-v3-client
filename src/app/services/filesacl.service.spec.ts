import { TestBed, inject } from '@angular/core/testing';
import { FilesACLsService } from './filesacls.service';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('FilesACLsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FilesACLsService, HttpClient, HttpHandler]
    });
  });

  it('should be created', inject([FilesACLsService], (service: FilesACLsService) => {
    expect(service).toBeTruthy();
  }));
});
