import { TestBed, inject } from '@angular/core/testing';
import { AppsService } from './apps.service';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('AppsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppsService, HttpClient, HttpHandler]
    });
  });

  it('should be created', inject([AppsService], (service: AppsService) => {
    expect(service).toBeTruthy();
  }));
});
