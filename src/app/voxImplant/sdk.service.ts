import { Injectable } from '@angular/core';
import * as VoxImplant from 'voximplant-websdk';
import { environment } from '@env/environment.prod';
import { IAppCredentials } from '@app/interfaces/IAppCredentials';
import { DataBusMessageType, DataBusService, ErrorId, Route } from '@core/data-bus.service';
import { IIDClass } from '@app/interfaces/IIDClass';
import { createLogger } from '@core/logger.service';
import { CallManager } from 'voximplant-websdk/Call/CallManager';
import { CallManagerService } from '@app/voxImplant/call-manager.service';
import { CurrentUserService } from '@core/current-user.service';

@Injectable({
  providedIn: 'root',
})
export class SDKService implements IIDClass {
  readonly ID = 'SDKService';
  private isReconnecting: boolean;
  private reconnectedTimes: number = 0;
  private sdk: any;
  private logger = createLogger(this.ID);
  constructor(
    private dataBusService: DataBusService,
    private callManagerService: CallManagerService,
    private currentUserService: CurrentUserService
  ) {
    this.isReconnecting = false;
    this.sdk = VoxImplant.getInstance();
    this.sdk.on(VoxImplant.Events.ConnectionClosed, () => {
      this.logger.error('[WebSDk] Connection was closed');
      this.reconnect();
    });
  }

  isReconnectedAllowed(): boolean {
    return environment.reconnectTimes < 0 || environment.reconnectTimes < this.reconnectedTimes;
  }

  get credentials(): IAppCredentials {
    return environment.appConfig.credentials;
  }

  init() {
    return new Promise((resolve, reject) => {
      if (this.sdk.getClientState() === 'DISCONNECTED') {
        this.sdk
          .init({
            // showDebugInfo: true,
            localVideoContainerId: 'localVideoNode',
            remoteVideoContainerId: 'hiddenRemote',
            queueType: VoxImplant.QueueTypes.SmartQueue,
          })
          .then((_: any) => {
            this.logger.warn('[WebSDk] Init completed');
            resolve(_);
          })
          .catch(reject);
      } else {
        resolve();
      }
    });
  }

  connectToVoxCloud(isReconnect = false) {
    this.sdk
      .connect(false)
      .then(() => {
        this.logger.warn('[WebSDk] Connection was established successfully');
        this.signIn(isReconnect).then(() => {
          if (isReconnect) this.rejoinConf();
        });
      })
      .catch(() => {
        this.logger.error('[WebSDk] Connection failed');
        this.reconnect();
      });
  }

  signIn(isReconnect: boolean) {
    return new Promise((resolve, reject) => {
      const login = `${this.credentials.userName}@${this.credentials.appName}.${this.credentials.accountName}.voximplant.com`;
      this.sdk
        .login(login, this.credentials.password)
        .then(() => {
          this.logger.warn('[WebSDk] Auth completed');
          if (!isReconnect) {
            this.dataBusService.send({
              type: DataBusMessageType.SignIn,
              route: [Route.Inner],
              sign: this.ID,
              data: {},
            });
          }
          resolve();
        })
        .catch((e: any) => {
          const errorDescription = '[WebSDk] Wrong login or password';
          this.dataBusService.sendError({
            id: ErrorId.SDKError,
            description: errorDescription,
            data: e,
          });
          this.logger.warn(errorDescription);
          reject(e);
        });
    });
  }

  rejoinConf() {
    this.isReconnecting = false;
    this.callManagerService.init(this.currentUserService.getCallSettings(), this.sdk);
  }

  reconnect() {
    if (!this.isReconnecting && this.isReconnectedAllowed()) {
      this.reconnectedTimes++;
      while (errorMessage.firstChild) {
        errorMessage.removeChild(errorMessage.lastChild);
      }
      errorMessage.appendChild(
        document.createTextNode('Connection problem, reconnecting you to the conference, please wait…')
      );
      console.warn('[WebSDk] Start to reconnect');
      this.isReconnecting = true;
      LayerManager.show('conf__error');
      CallManager.currentConf = null;
      this.sdk.showLocalVideo(false);
      if (VoxImplant.getInstance().getClientState() === VoxImplant.ClientState.LOGGING_IN) {
        this.rejoinConf();
      } else {
        this.connectToVoxCloud(true);
      }
    } else {
      console.warn('[WebSDk] We are waiting while another reconnect will be finished');
    }
  }

  login() {
    this.init().then(() => {
      this.connectToVoxCloud();
    });
  }
}
