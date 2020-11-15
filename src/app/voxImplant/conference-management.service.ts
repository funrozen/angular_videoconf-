import { Injectable } from '@angular/core';
import {
  DataBusMessageType,
  DataBusService,
  IDataBusMessage,
  IToggleLocalCameraMessage,
  IToggleLocalMicMessage,
} from '@core/data-bus.service';
import { SDKService } from '@app/voxImplant/sdk.service';
import { CurrentUserService } from '../@core/current-user.service';
import { VIManagerService } from './vimanager.service';
import { IIDClass } from '@app/interfaces/IIDClass';
import { createLogger } from '@core';

@Injectable({
  providedIn: 'root',
})
export class ConferenceManagementService implements IIDClass {
  readonly ID = 'ConferenceManagementService';
  private logger = createLogger(this.ID);
  constructor(
    private dataBusService: DataBusService,
    private sdkService: SDKService,
    private currentUserService: CurrentUserService,
    private vimanagerService: VIManagerService
  ) {
    this.dataBusService.inner$.subscribe((message: IDataBusMessage) => {
      switch (message.type) {
        case DataBusMessageType.ReConnect:
          this.sdkService.reconnect();
          break;
        case DataBusMessageType.MicToggle:
          {
            switch ((<IToggleLocalMicMessage>message).data.status) {
              case 'mute':
                this.currentUserService.microphoneEnabled = false;
                break;
              case 'unmute':
                this.currentUserService.microphoneEnabled = true;
                break;
            }
            this.vimanagerService.enableLocalMic(this.currentUserService.microphoneEnabled);
          }
          break;
        case DataBusMessageType.CameraToggle:
          {
            if (this.vimanagerService.permissions.video === false) {
              this.logger.warn('it impossible switch local video when it is not allow');
            } else {
              switch ((<IToggleLocalCameraMessage>message).data.status) {
                case 'hide':
                  this.currentUserService.cameraStatus = false;
                  break;
                case 'show':
                  this.currentUserService.cameraStatus = true;
                  break;
              }
              (this.vimanagerService.enableLocalCam(this.currentUserService.cameraStatus) as Promise<any>)
                .then((e: any) => {
                  //this.currentUserService.cameraStatus = !this.currentUserService.cameraStatus;
                  //TODO switch camera off in a service
                })
                .catch(() => {
                  this.logger.warn("Can't change the camera state");
                });
            }
          }
          break;
        default:
          break;
      }
    });
  }
}
