import { Component, ElementRef, AfterViewInit } from '@angular/core';

import { ModalController } from '@kirbydesign/designsystem';
import { ShowcaseProperty } from '~/app/shared/showcase-properties/showcase-property';

@Component({
  selector: 'cookbook-modal-showcase',
  templateUrl: './modal-showcase.component.html',
  styleUrls: ['./modal-showcase.component.scss'],
  preserveWhitespaces: true,
})
export class ModalShowcaseComponent implements AfterViewInit {
  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private modalController: ModalController
  ) {}

  ngAfterViewInit(): void {
    this.modalController.registerPresentingElement(
      this.elementRef.nativeElement.closest('cookbook-home')
    );
  }

  scrollTo(target: Element) {
    target.scrollIntoView({ behavior: 'smooth' });
    return false;
  }

  configProperties: ShowcaseProperty[] = [
    {
      name: 'title',
      description: 'The header of the modal',
      defaultValue: '',
      inputValues: ['string'],
    },
    {
      name: 'component',
      description: 'The component which will be rendered inside the modal.',
      defaultValue: '',
      inputValues: ['Component'],
    },
    {
      name: 'flavor',
      description:
        "The flavor of the modal. Modals with 'modal' flavor fade-in/out and have a close button placed in the top right corner. Modals with a 'compact' flavor simply render the specified component, similar to alerts. As there a toolbar or close button, you should handle closing the modal yourself. Modals with a 'drawer' flavor slide-up/down and have a arrow-down button placed in the top left corner.",
      defaultValue: 'modal',
      inputValues: ['modal', 'drawer', 'compact'],
    },
    {
      name: 'drawerSupplementaryAction',
      description:
        "(Optional) Allows placing a supplementary button in the top right corner of drawers. Note that this is only available on modals with a 'drawer' flavor",
      defaultValue: '',
      inputValues: ['{iconName: string, action: Function}'],
    },
    {
      name: 'componentProps',
      description: 'The data to pass to the modal component.',
      defaultValue: '',
      inputValues: ['undefined | { [key: string]: any; }'],
    },
  ];

  properties: ShowcaseProperty[] = [
    {
      name: 'scrollDisabled',
      description: 'Disable scrolling of the modal',
      inputValues: ['true', 'false'],
      defaultValue: 'false',
    },
  ];

  footerProperties: ShowcaseProperty[] = [
    {
      name: 'themeColor',
      description: "Theme color. 'light' will use the background-color variable",
      inputValues: ['white', 'light'],
      defaultValue: 'white',
    },
  ];

  events: ShowcaseProperty[] = [
    {
      name: 'didPresent',
      description: 'Emitted when the modal is ready and the enter animation has finished',
      inputValues: ['Promise<void>'],
    },
    {
      name: 'willClose',
      description: 'Emitted when the user closes the modal or modal.close() method is called',
      inputValues: ['Promise<void>'],
    },
  ];

  eventColumns = {
    Name: 'Name',
    Description: 'Description',
    Type: 'Signature',
  };
}
