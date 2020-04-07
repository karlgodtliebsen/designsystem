import { Component } from '@angular/core';

import { ToastConfig } from '@kirbydesign/angular';
import { ToastController } from '@kirbydesign/angular';

@Component({
  selector: 'cookbook-toast-example',
  templateUrl: './toast-example.component.html',
})
export class ToastExampleComponent {
  constructor(public toastController: ToastController) {}
  showToast() {
    const config: ToastConfig = {
      message: 'Your toast message',
      messageType: 'success',
      durationInMs: 5000,
    };
    this.toastController.showToast(config, this.onToastClosed);
  }

  private onToastClosed() {
    console.log(`Toast closed`);
  }
}
