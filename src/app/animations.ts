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
    trigger('appear-router', [
        // The '* => *' will trigger the animation to change between any two states
        transition('* => *', [
            // The query function has three params.
            // First is the event, so this will apply on entering or when the element is added to the DOM.
            // Second is a list of styles or animations to apply.
            // Third we add a config object with optional set to true, this is to signal
            // angular that the animation may not apply as it may or may not be in the DOM.
            query(
                ':enter',
                [style({ transform: 'scale(0)', opacity: 0 })],
                { optional: true }
            ),
            query(
                ':leave',
                // here we apply a style and use the animate function to apply the style over 0.3 seconds
                [style({ opacity: 1 }), animate('0.3s', style({ transform: 'scale(0)', opacity: 0 }))],
                { optional: true }
            ),
            query(
                ':enter',
                [style({ opacity: 0 }), animate('0.3s', style({ transform: 'scale(1)', opacity: 1 }))],
                { optional: true }
            )
        ])
    ])
];
