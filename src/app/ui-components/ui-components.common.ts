import { Routes } from '@angular/router';

import { ComparisonComponent } from './comparison/comparison.component';
import { IonicButtonComponent } from './components/ionic/ionic-button/ionic-button.component';
import { IonicDatepickerComponent } from './components/ionic/ionic-datepicker/ionic-datepicker.component';
import { IonicToggleComponent } from './components/ionic/ionic-toggle/ionic-toggle.component';
import { IonicCalendarComponent } from './components/ionic/ionic-calendar/ionic-calendar.component';
import { IonicSliderComponent } from './components/ionic/ionic-slider/ionic-slider.component';
import { IonicModalComponent } from './components/ionic/ionic-modal/ionic-modal.component';
import { IonicModalExampleComponent } from './components/ionic/ionic-modal/ionic-modal.page';

export const COMPONENT_DECLARATIONS: any[] = [
    ComparisonComponent,
    IonicDatepickerComponent,
    IonicButtonComponent,
    IonicToggleComponent,
    IonicCalendarComponent,
    IonicSliderComponent,
    IonicModalComponent,
    IonicModalExampleComponent
];

export const PROVIDERS_DECLARATIONS: any[] = [
];

export const ROUTES: Routes = [
    {
        path: '',
        component: ComparisonComponent
    },
    {
        path: 'ionic/button',
        component: IonicButtonComponent
    },
    {
        path: 'ionic/calendar',
        component: IonicCalendarComponent
    },
    {
        path: 'ionic/datepicker',
        component: IonicDatepickerComponent
    },
    {
        path: 'ionic/modal',
        component: IonicModalComponent
    },
    {
        path: 'ionic/slider',
        component: IonicSliderComponent
    },
    {
        path: 'ionic/toggle',
        component: IonicToggleComponent
    },
];