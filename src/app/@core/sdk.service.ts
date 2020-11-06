import { Injectable } from '@angular/core';
import * as VoxImplant from 'voximplant-websdk';
import { environment } from '@env/environment.prod';
import { IAppCredentials } from '@app/interfaces/IAppCredentials';
import { ClientState } from 'voximplant-websdk/Logger';

@Injectable({
  providedIn: 'root',
})
export class SDKService {
  private isReconnecting: boolean;
  private reconnectedTimes: number = 0;
  private sdk: any;
  constructor() {
    this.isReconnecting = false;

    this.sdk = VoxImplant.getInstance();
    this.sdk.on(VoxImplant.Events.ConnectionClosed, () => {
      console.error('[WebSDk] Connection was closed');
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
            console.warn('[WebSDk] Init completed');
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
        console.warn('[WebSDk] Connection was established successfully');
        this.signIn(isReconnect).then(() => {
          if (isReconnect) this.rejoinConf();
        });
      })
      .catch(() => {
        console.error('[WebSDk] Connection failed');
        this.reconnect();
      });
  }

  signIn(isReconnect: boolean) {
    return new Promise((resolve, reject) => {
      const login = `${this.credentials.userName}@${this.credentials.appName}.${this.credentials.accountName}.voximplant.com`;
      this.sdk
        .login(login, this.credentials.password)
        .then(() => {
          console.warn('[WebSDk] Auth completed');
          if (!isReconnect) LayerManager.show('conf__form');
          resolve();
        })
        .catch((e) => {
          LayerManager.show('conf__error');
          errorMessage.appendChild(document.createTextNode('SDK Error'));
          console.warn('[WebSDk] Wrong login or password');
          reject(e);
        });
    });
  }

  rejoinConf() {
    this.isReconnecting = false;
    new CallManager(currentUser.getCallSettings());
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
