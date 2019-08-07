import { trigger, transition, style, animate, query, group } from '@angular/animations';

export const appAnimations = [
    trigger(
        'appear', [
            transition(':enter', [
                style({ transform: 'scale(0)', opacity: 0 }),
                animate('200ms')
            ])
        ]
    ),
    trigger(
        'disappear', [
            transition(':leave', [
                animate('200ms', style({ transform: 'scale(0)', opacity: 0 }))
            ])
        ]
    ),
    trigger('routeAnimations', [
        transition('* => *', [
            group([  // block executes in parallel
                query(':enter', [
                    style({ transform: 'scale(0)', opacity: 0 }),
                    animate('0.3s ease-in-out')
                ], { optional: true }),
                query(':leave', [
                    animate('0.3s ease-in-out', style({ transform: 'scale(0)', opacity: 0 }))
                ], { optional: true }),
            ])
        ])
    ])
];
