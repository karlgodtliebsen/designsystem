import { Component, OnInit } from '@angular/core';
declare var require: any;

@Component({
  selector: 'cookbook-checkbox-showcase',
  templateUrl: './checkbox-showcase.component.html',
  styleUrls: ['./checkbox-showcase.component.scss'],
})
export class CheckboxShowcaseComponent {
  exampleHtml: string = require('!raw-loader!../../examples/checkbox-example/checkbox-example.component.html')
    .default;
}
