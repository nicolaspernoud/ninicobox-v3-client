import { Pipe, PipeTransform } from '@angular/core';
import { ClientApp } from '../../services/apps.service';

@Pipe({
    name: 'iframed',
    pure: false
})
export class AppFilterIframed implements PipeTransform {
    transform(apps: ClientApp[], filter: boolean): ClientApp[] {
        if (!apps) {
            return apps;
        }
        return apps.filter(item => item.iframed === filter);
    }
}
