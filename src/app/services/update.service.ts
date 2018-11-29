import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { SwUpdate } from '@angular/service-worker';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class UpdateService {

    private updateAvailable = new BehaviorSubject<boolean>(false);
    UpdateAvailable = this.updateAvailable.asObservable();

    constructor(private swUpdate: SwUpdate, private snackbar: MatSnackBar) {
        swUpdate.available.subscribe(() => {
            this.updateAvailable.next(true);
            this.snackbar
                .open('Update available', 'Update', { duration: 10000 })
                .onAction()
                .subscribe(() => {
                    swUpdate.activateUpdate().then(() => document.location.assign('/'));
                    this.updateAvailable.next(false);
                });
        });
    }

    forceUpdate() {
        this.swUpdate.activateUpdate().then(() => document.location.reload());
        this.updateAvailable.next(false);
    }

    checkForUpdate() {
        this.swUpdate.checkForUpdate();
    }
}
