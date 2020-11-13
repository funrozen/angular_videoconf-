import { Injectable } from '@angular/core';
import { HelperService } from '@core/helper.service';
import { environment } from '@env/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class CurrentUserService {
  get isConfOwner(): boolean {
    return this._isConfOwner;
  }

  set isConfOwner(value: boolean) {
    this._isConfOwner = value;
  }

  get email(): string {
    return this._email;
  }

  set email(value: string) {
    this._email = value;
  }

  get cameraStatus(): number {
    return this._cameraStatus;
  }

  set cameraStatus(value: number) {
    this._cameraStatus = value;
  }

  get microphoneEnabled(): boolean {
    return this._microphoneEnabled;
  }

  set microphoneEnabled(value: boolean) {
    this._microphoneEnabled = value;
  }
  get serviceId(): string {
    return this._serviceId;
  }

  set serviceId(value: string) {
    this._serviceId = value;
  }
  get uuid(): string {
    return this._uuid;
  }

  set uuid(value: string) {
    this._uuid = value;
  }
  private _isConfOwner: boolean;
  private _serviceId: string;
  private _name: string;
  private _email: string;

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  private _cameraStatus: number;
  private _microphoneEnabled: boolean;
  private _uuid: string;

  constructor() {
    this._isConfOwner = this.isConferenceOwner();
    this._serviceId = this.getServiceIdFromUrl(window.location);

    this._name = 'John Doe';
    this._email = 'Email';
    this._cameraStatus = 1;
    this._microphoneEnabled = true;
    this._uuid = HelperService.uuid();
  }

  getCallSettings() {
    const config = {
      number: `conf_${this._serviceId}`,
      video: { sendVideo: this._cameraStatus === 1, receiveVideo: true },
      extraHeaders: {
        'X-Display-Name': this._name,
        'X-Email': this._email,
      },
    };
    if (environment.appConfig.sendUID) config.extraHeaders['X-UUID'] = this._uuid;
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
      isConfOwner: this._isConfOwner,
      name: this._name,
      email: this._email,
      cameraStatus: this._cameraStatus,
      microphoneEnabled: this._microphoneEnabled,
      uuid: this._uuid,
    };

    localStorage.user_data = JSON.stringify(userData);
  }

  getLocalStorage() {
    return localStorage.getItem('user_data') ? JSON.parse(localStorage.user_data) : null;
  }
}
