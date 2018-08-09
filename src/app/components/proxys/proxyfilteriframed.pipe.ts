import { Pipe, PipeTransform } from '@angular/core';
import { ClientProxy } from '../../services/proxys.service';

@Pipe({
    name: 'iframed',
    pure: false
})
export class ProxyFilterIframed implements PipeTransform {
    transform(proxys: ClientProxy[], filter: boolean): ClientProxy[] {
        if (!proxys) {
            return proxys;
        }
        return proxys.filter(item => item.iframed === filter);
    }
}
