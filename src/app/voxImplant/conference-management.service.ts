import { Injectable, OnDestroy } from '@angular/core';
import {
  DataBusMessageType,
  DataBusService,
  IDataBusMessage,
  IToggleLocalCameraMessage,
  IToggleLocalMicMessage,
  Route,
} from '@core/data-bus.service';
import { SDKService } from '@app/voxImplant/sdk.service';
import { CurrentUserService } from '../@core/current-user.service';
import { VIManagerService } from './vimanager.service';
import { IIDClass } from '@app/interfaces/IIDClass';
import { createLogger, untilDestroyed } from '@core';
import { CallManagerService } from '@app/voxImplant/call-manager.service';
import { WSService } from '@app/voxImplant/ws.service';

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
    private callManagerService: CallManagerService,
    private wsService: WSService
  ) {
    this.dataBusService.inner$.pipe(untilDestroyed(this)).subscribe((message: IDataBusMessage) => {
      switch (message.type) {
        case DataBusMessageType.ReConnect:
          this.sdkService.reconnect();
          break;

        case DataBusMessageType.MicToggle:
          {
            if ((<IToggleLocalMicMessage>message).data?.status) {
              switch ((<IToggleLocalMicMessage>message).data.status) {
                case 'mute':
                  this.currentUserService.microphoneEnabled = false;
                  break;
                case 'unmute':
                  this.currentUserService.microphoneEnabled = true;
                  break;
              }
            } else {
              this.currentUserService.microphoneEnabled = !this.currentUserService.microphoneEnabled;
            }
            this.dataBusService.send({
              data: {
                microphoneEnabled: this.currentUserService.microphoneEnabled,
              },
              route: [Route.Inner],
              sign: this.ID,
              type: DataBusMessageType.MicToggled,
            });
          }
          break;

        case DataBusMessageType.CameraToggle:
          {
            if (this.vimanagerService.permissions.video === false) {
              this.logger.warn('it impossible switch local video when it is not allow');
            } else {
              if ((<IToggleLocalCameraMessage>message).data?.status) {
                switch ((<IToggleLocalCameraMessage>message).data.status) {
                  case 'hide':
                    this.currentUserService.cameraStatus = false;
                    break;
                  case 'show':
                    this.currentUserService.cameraStatus = true;
                    break;
                }
              } else {
                this.currentUserService.cameraStatus = !this.currentUserService.cameraStatus;
              }
            }
          }

          this.dataBusService.send({
            data: {
              cameraEnabled: this.currentUserService.cameraStatus,
            },
            route: [Route.Inner],
            sign: this.ID,
            type: DataBusMessageType.CameraToggled,
          });

          break;

        case DataBusMessageType.InitCall: {
          this.sdkService.joinConf();
          break;
        }

        case DataBusMessageType.CallConnected:
          {
            this.wsService.login(
              message.data.e.headers['X-Conf-Sess'],
              message.data.e.headers['X-Conf-Call'],
              !this.currentUserService.microphoneEnabled,
              false,
              this.currentUserService.cameraStatus
            );
          }
          break;

        case DataBusMessageType.LeaveRoom:
          {
            this.logger.info('Leave Room');
            //TODO
            //unregisterCallback();
            this.sdkService.onLeaveRoom();
            this.callManagerService.onLeaveRoom();
          }
          break;

        case DataBusMessageType.SendMessageToCall:
          {
            this.callManagerService.sendMessage(message.data);
          }
          break;

        case DataBusMessageType.ShareScreenStopped:
          {
            this.logger.info('Share screen stopped');
            // TODO
            // if video stub active
            // if (currentUser.cameraStatus === 0) {
            //   LayerManager.toggleVideoStub('localVideoNode', true);
            // }
            //
            // WSService.notifySharing(false);
            // this.share.classList.toggle('option--off');
            // document.getElementById('localVideoNode').classList.toggle('is--sharing');
          }
          break;

        case DataBusMessageType.ShareScreenStarted:
          {
            //
            //   WSService.notifySharing(true);
            //   this.share.classList.toggle('option--off');
            //   document.getElementById('localVideoNode').classList.toggle('is--sharing');
            //
            //   let renderer = window.VoxImplant.Hardware.StreamManager.get().getLocalMediaRenderers()[0];
            //   if (renderer.kind === 'sharing') {
            //     renderer.stream.getTracks().forEach((tr) => {
            //       tr.addEventListener('ended', () => {
            //         WSService.notifySharing(false);
            //         document.getElementById('localVideoNode').classList.toggle('is--sharing');
            //         this.share.classList.toggle('option--off');
            //         // if video stub active
            //         if (currentUser.cameraStatus === 0) {
            //           LayerManager.toggleVideoStub('localVideoNode', true);
            //         }
            //       });
            //     });
            //   }
            // })
            // .catch((e) => {
            //   console.error(`[WebSDk] Sharing failed: ${e.message}`);
            //   if (currentUser.cameraStatus === 0) {
            //     LayerManager.toggleVideoStub('localVideoNode', true);
            //   }
            // });
          }
          break;

        case DataBusMessageType.ShareScreenStartedError: {
          //TODO
          // if (currentUser.cameraStatus === 0) {
          //   LayerManager.toggleVideoStub('localVideoNode', true);
          // }
        }

        default:
          break;
      }
    });
  }

  ngOnDestroy(): void {}
}