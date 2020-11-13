import { Injectable } from '@angular/core';
import { SDKService } from '@app/voxImplant/sdk.service';
import { environment } from '@env/environment';
import { CurrentUserService } from '@core/current-user.service';
//TODO  move to module
@Injectable({
  providedIn: 'root',
})
export class UIService {
  constructor(private sdkService: SDKService, private currentUserService: CurrentUserService) {}

  get roomId(): string {
    return this.currentUserService.serviceId;
  }

  onWelcome(e: MouseEvent | TouchEvent) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // this.sdkService.login();

    if (this.currentUserService.isConfOwner) {
      this.currentUserService.serviceId = `${Math.floor(Math.random() * 99999999) + 1000000}`;
      window.history.replaceState(
        {},
        '',
        environment.appConfig.replaceHistoryPrefix + this.currentUserService.serviceId
      );
    }
  }
}
