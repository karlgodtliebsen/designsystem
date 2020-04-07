import { Component, Input } from '@angular/core';

import { ThemeColor } from '@kirbydesign/angular';
import { Color, ColorHelper } from '@kirbydesign/angular';

@Component({
  selector: 'cookbook-divider-example',
  templateUrl: './divider-example.component.html',
  styleUrls: ['./divider-example.component.scss'],
})
export class DividerExampleComponent {
  @Input() themeColor: ThemeColor = 'white';
  @Input() hasMargin: boolean = true;
}
