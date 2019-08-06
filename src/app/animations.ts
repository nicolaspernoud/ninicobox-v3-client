import { trigger, transition, style, animate, query } from '@angular/animations';

export const appAnimations = [
    trigger(
        'appear', [
            transition(':enter', [
                style({ transform: 'scale(0)', opacity: 0 }),
                animate('200ms', style({ transform: 'scale(1)', opacity: 1 }))
            ])
        ]
    ),
    trigger(
        'disappear', [
            transition(':leave', [
                style({ transform: 'scale(1)', opacity: 1 }),
                animate('200ms', style({ transform: 'scale(0)', opacity: 0 }))
            ])
        ]
    ),
    trigger('routeAnimations', [
        transition('login => *, apps => users, apps => explorer, explorer => apps, explorer => users, users => explorer, users => apps', [
            /* REPLACE PREVIOUS LINE WITH * => * WHEN THE FIREFOX BUG WILL BE CORRECTED .... */
            /*group([  // block executes in parallel
                query(':enter', [
                    style({ transform: 'scale(0)', opacity: 0 }),
                    animate('0.3s ease-in-out', style({ transform: 'scale(1)', opacity: 1 }))
                ], { optional: true }),/* ----- DEACTIVATED TEMPORARYLY TO MITIGATE A BUG WITH FIREFOX --------- */
                query(':leave', [
                    style({ transform: 'scale(1)', opacity: 1 }),
                    animate('0.3s ease-in-out', style({ transform: 'scale(0)', opacity: 0 }))
                ], { optional: true }),
            //])
        ])
    ])
];
