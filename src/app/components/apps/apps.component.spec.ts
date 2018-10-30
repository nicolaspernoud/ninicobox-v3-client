import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppsComponent } from './apps.component';
import { MaterialModule } from '../../material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppsService } from '../../services/apps.service';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('AppsComponent', () => {
  let component: AppsComponent;
  let fixture: ComponentFixture<AppsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppsComponent ],
      imports: [
        MaterialModule, BrowserAnimationsModule
      ],
      providers: [AppsService, HttpClient, HttpHandler]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppsComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
