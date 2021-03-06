// Angular modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
// Material module
import { MaterialModule } from './material.module';
// Technical modules
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { TokenInterceptor } from './services/token.interceptor';
import { ErrorInterceptor } from './services/errors.interceptor';
import { RouteGuard } from './services/route.guard';
import { ShowToRolesDirective } from './directives/showtoroles.directive';
import { ClickStopPropagationDirective } from './directives/click-stop-propagation.directive';
import { UpdateService } from './services/update.service';
import { EscapeHtmlPipe } from './pipes/keep-html.pipe';
// Business modules
import { AuthService } from './services/auth.service';
import { UsersService } from './services/users.service';
import { AppsService } from './services/apps.service';
import { LoginComponent } from './components/login/login.component';
import { ExplorersComponent } from './components/explorers/explorers.component';
import { FileUploadComponent } from './components/explorers/explorer/file-upload/file-upload.component';
import { ExplorerComponent, CutCopyProgressBarComponent } from './components/explorers/explorer/explorer.component';
import { AppsComponent } from './components/apps/apps.component';
import { UsersComponent } from './components/users/users.component';
import { AddAppDialogComponent } from './components/apps/add-app-dialog/add-app-dialog.component';
import { RenameDialogComponent } from './components/explorers/explorer/rename-dialog/rename-dialog.component';
import { ShareDialogComponent } from './components/explorers/explorer/share-dialog/share-dialog.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { OpenComponent } from './components/explorers/explorer/open/open.component';
import { BasicDialogComponent } from './components/basic-dialog/basic-dialog.component';
import { AppFilterIframed } from './components/apps/appfilteriframed.pipe';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ShowToRolesDirective,
    ClickStopPropagationDirective,
    FileUploadComponent,
    ExplorersComponent,
    ExplorerComponent,
    CutCopyProgressBarComponent,
    AppsComponent,
    AddAppDialogComponent,
    UsersComponent,
    RenameDialogComponent,
    ShareDialogComponent,
    ConfirmDialogComponent,
    OpenComponent,
    BasicDialogComponent,
    AppFilterIframed,
    EscapeHtmlPipe
  ],
  imports: [
    FormsModule,
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    MaterialModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    AuthService,
    UpdateService,
    RouteGuard,
    AppsService,
    UsersService
  ],
  bootstrap: [AppComponent],
  // tslint:disable-next-line:max-line-length
  entryComponents: [AddAppDialogComponent, RenameDialogComponent, ShareDialogComponent, CutCopyProgressBarComponent, ConfirmDialogComponent, OpenComponent, BasicDialogComponent]
})
export class AppModule { }
