import { Injectable } from '@angular/core';
import { HelperService } from '@core/helper.service';
import { environment } from '@env/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class CurrentUserService {
  private isConfOwner: boolean;
  private serviceId: string;
  private name: string;
  private email: string;
  private cameraStatus: number;
  private microphoneEnabled: boolean;
  private uuid: string;

  constructor() {
    this.isConfOwner = this.isConferenceOwner();
    this.serviceId = this.getServiceIdFromUrl(window.location);

    this.name = 'John Doe';
    this.email = 'Email';
    this.cameraStatus = 1;
    this.microphoneEnabled = true;
    this.uuid = HelperService.uuid();
  }

  getCallSettings() {
    const config = {
      number: `conf_${this.serviceId}`,
      video: { sendVideo: this.cameraStatus === 1, receiveVideo: true },
      extraHeaders: {
        'X-Display-Name': this.name,
        'X-Email': this.email,
      },
    };
    if (environment.appConfig.sendUID) config.extraHeaders['X-UUID'] = this.uuid;
    return config;
  }

  isConferenceOwner() {
    return !this.getServiceIdFromUrl(window.location);
  }

  getServiceIdFromUrl(url: Location) {
    return environment.appConfig.getServiceIdFromUrl(url);
  }

  setLocalStorage() {
    const userData = {
      isConfOwner: this.isConfOwner,
      name: this.name,
      email: this.email,
      cameraStatus: this.cameraStatus,
      microphoneEnabled: this.microphoneEnabled,
      uuid: this.uuid,
    };

    localStorage.user_data = JSON.stringify(userData);
  }

  getLocalStorage() {
    return localStorage.getItem('user_data') ? JSON.parse(localStorage.user_data) : null;
  }
}
