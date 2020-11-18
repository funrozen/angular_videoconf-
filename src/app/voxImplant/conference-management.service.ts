import { Injectable, OnDestroy } from '@angular/core';
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
import { createLogger, untilDestroyed } from '@core';
import { CallManagerService } from '@app/voxImplant/call-manager.service';

@Injectable({
  providedIn: 'root',
})
export class ConferenceManagementService implements IIDClass, OnDestroy {
  readonly ID = 'ConferenceManagementService';
  private logger = createLogger(this.ID);
  constructor(
    private dataBusService: DataBusService,
    private sdkService: SDKService,
    private currentUserService: CurrentUserService,
    private vimanagerService: VIManagerService,
    private callManagerService: CallManagerService
  ) {
    this.dataBusService.inner$.pipe(untilDestroyed(this)).subscribe((message: IDataBusMessage) => {
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
                  //TODO switch camera status here instead few rows above
                })
                .catch(() => {
                  this.logger.warn("Can't change the camera state");
                });
            }
          }
          break;

        case DataBusMessageType.InitCall: {
          this.sdkService.joinConf();
          break;
        }

        case DataBusMessageType.CallConnected:
          {
            // WSService.login(
            //   e.headers['X-Conf-Sess'],
            //   e.headers['X-Conf-Call'],
            //   !currentUser.microphoneEnabled,
            //   false,
            //   currentUser.cameraStatus === 1 ? true : false
            // );
            // if (CallManager.currentConf.settings.video.sendVideo) {
            //   window.VoxImplant.getInstance().showLocalVideo(true);
            // }
            //settingsApplyButton.disabled = false;
            //settingsApplyButton.classList.remove('loading');
          }
          break;

        default:
          break;
      }
    });
  }

  ngOnDestroy(): void {}
}
