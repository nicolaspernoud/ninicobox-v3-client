import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ExplorersComponent } from './explorers.component';
import { MaterialModule } from '../../material.module';
import { ExplorerComponent } from './explorer/explorer.component';
import { FileUploadComponent } from './explorer/file-upload/file-upload.component';
import { FilesService } from '../../services/files.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FilesACLsService } from '../../services/filesacls.service';
import { FilesACL } from '../../interfaces';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ExplorersComponent', () => {
  let component: ExplorersComponent;
  let fixture: ComponentFixture<ExplorersComponent>;
  let filesaclService: FilesACLsService;
  const testFilesACLs: FilesACL[] =
  [
    {
      name: 'Users Only',
      path: '../data/users',
      roles: ['user'],
      permissions: 'r'
    },
    {
      name: 'Admins Only RW',
      path: '../data/admins',
      roles: ['admin'],
      permissions: 'rw'
    }
];

  class MockRouter {
    navigate = jasmine.createSpy('navigate');
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExplorersComponent, ExplorerComponent, FileUploadComponent],
      imports: [
        MaterialModule, BrowserAnimationsModule
      ],
      providers: [FilesACLsService, AuthService, FilesService, HttpClient, HttpHandler, { provide: Router, useClass: MockRouter }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExplorersComponent);
    component = fixture.componentInstance;
    filesaclService = TestBed.get(FilesACLsService);
    spyOn(filesaclService, 'getFilesACLs').and.returnValue(Observable.of(testFilesACLs));
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
