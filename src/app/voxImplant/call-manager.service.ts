import { Injectable } from '@angular/core';
import {
  DataBusMessageType,
  DataBusService,
  ErrorId,
  IEndpointMessage,
  IEndpointParticipantData,
  Route,
} from '@core/data-bus.service';
import * as VoxImplant from 'voximplant-websdk';
import { Client } from 'voximplant-websdk/Client';
import { Call } from 'voximplant-websdk/Call/Call';
import { CurrentUserService } from '@core/current-user.service';
import { callReporter } from '@app/voxImplant/vi-helpers';
import { IIDClass } from '@app/interfaces/IIDClass';
import { createLogger, ILogger } from '@core';
import { MediaRenderer } from 'voximplant-websdk/Media/MediaRenderer';

@Injectable({
  providedIn: 'root',
})
export class CallManagerService implements IIDClass {
  readonly ID = 'CallManagerService';
  private endPointsSet: any;
  private currentConf: Call;
  private sdk: Client;
  private reporter: any;
  private logger: ILogger = createLogger(this.ID);

  constructor(private dataBusService: DataBusService, private currentUserService: CurrentUserService) {}

  public init(newCallParams: any, sdk: Client) {
    this.endPointsSet = {};
    this.sdk = sdk;
    this.dataBusService.send({
      type: DataBusMessageType.CallInit,
      route: [Route.Inner],
      sign: this.ID,
      data: {},
    });

    this.currentConf = this.sdk.callConference(newCallParams);
    this.logger.info('call conference inited');
    this.reporter = callReporter(
      this.currentConf,
      this.currentUserService.name,
      this.currentUserService.serviceId,
      this.currentUserService.uuid
    );

    this.bindCallCallbacks();

    this.dataBusService.send({
      type: DataBusMessageType.CallInit,
      route: [Route.Inner],
      sign: this.ID,
      data: {},
    });
    // on CallInit
    // this.callInterface = new CallInterface();
    // this.soundAdded = document.getElementById("js__ep_added_sound");
    // this.soundAdded.volume = 0.5;
    // this.soundRemoved = document.getElementById("js__ep_removed_sound");
    // this.soundRemoved.volume = 0.5;
    // registerCallbacks(this.callInterface);
    // this.updateChatManager(currentUser);
  }

  /**
   * on leave room
   */
  disconnect() {
    this.currentConf.off(VoxImplant.CallEvents.Connected);
    this.currentConf.off(VoxImplant.CallEvents.Disconnected);
    this.currentConf.off(VoxImplant.CallEvents.Failed);
    this.currentConf.off(VoxImplant.CallEvents.MessageReceived);
    this.currentConf.off(VoxImplant.CallEvents.EndpointAdded);
    this.currentConf.hangup();
  }

  destroyCurrentConf() {
    if (this.currentConf) {
      this.disconnect();
    }
    this.currentConf = null;
  }

  bindCallCallbacks() {
    this.logger.warn(`[WebSDk] Setup listeners for ID: ${this.currentConf.id()}`);
    this.currentConf.on(VoxImplant.CallEvents.Connected, (e) => this.onCallConnected(e));
    this.currentConf.on(VoxImplant.CallEvents.Disconnected, (e) => this.onCallDisconnected(e));
    this.currentConf.on(VoxImplant.CallEvents.MessageReceived, (e) => this.onMessageReceived(e));
    this.currentConf.on(VoxImplant.CallEvents.Failed, (e) => this.onCallFailed(e));
    this.currentConf.on(VoxImplant.CallEvents.EndpointAdded, (e) => this.onEndpointAdded(e));
  }

  onCallConnected(e: any) {
    this.logger.info('CallConnected');
    /** Bug fix for FireFox */
    this.endPointsSet[`${this.currentUserService.uuid}`] = {
      displayName: this.currentUserService.name,
      id: this.currentUserService.uuid,
      isDefault: true,
    };

    this.dataBusService.send({
      type: DataBusMessageType.CallConnected,
      data: {},
      route: [Route.Inner],
      sign: this.ID,
    });

    this.checkAndSwitchCameraOff();
    this.checkAndMuteMicrophone();
    /** end */
    this.logger.warn(`[WebSDk] Call connected ID: ${e.call.id()}`);
  }

  private checkAndSwitchCameraOff() {
    if (this.currentUserService.cameraStatus !== 1) {
      //TODO make interface for the message
      this.dataBusService.send({
        type: DataBusMessageType.CameraToggle,
        data: {
          status: 'hide',
        },
        route: [Route.Inner],
        sign: this.ID,
      });
    }
  }

  private checkAndMuteMicrophone() {
    if (!this.currentUserService.microphoneEnabled) {
      //TODO make interface for the message
      this.dataBusService.send({
        type: DataBusMessageType.MuteToggle,
        data: {
          status: 'mute',
        },
        route: [Route.Inner],
        sign: this.ID,
      });
    }
  }

  onCallDisconnected(e: any) {
    if (e.headers['X-Multiple-Login']) {
      this.dataBusService.sendError({
        id: ErrorId.XMultipleLogin,
        description: 'You have connected to the conference in another browser tab or window.',
        data: e,
      });
      VoxImplant.getInstance().showLocalVideo(false);
    } else {
      this.askForReconnect(e);
    }
  }

  private askForReconnect(e: any) {
    this.logger.warn(`[WebSDk] Call ended ID: ${e.call.id()}`);

    this.dataBusService.send({
      data: {},
      route: [Route.Inner],
      sign: this.ID,
      type: DataBusMessageType.ReConnect,
    });
  }

  onMessageReceived(e: any) {
    this.logger.log(`[WebSDk] message received:`, e);
    let payload = JSON.parse(e.text);
    this.dataBusService.send({
      data: { payload },
      route: [Route.Inner],
      sign: this.ID,
      type: DataBusMessageType.JoinToChat,
    });
  }

  onCallFailed(e: any) {
    this.askForReconnect(e);
  }

  calculateParticipants() {
    const data: any[] = [];
    this.currentConf.getEndpoints().forEach((endpoint) => {
      if (!endpoint.isDefault) {
        data.push({
          displayName: endpoint.displayName,
          id: endpoint.id,
        });
      }
    });
    this.dataBusService.send({
      data: data,
      route: [Route.Inner],
      type: DataBusMessageType.Participants,
    } as IEndpointParticipantData);
  }

  onEndpointAdded(e: any) {
    if (!this.endPointsSet[`${e.endpoint.id}`]) {
      e.endpoint.on(VoxImplant.EndpointEvents.Removed, (e: any) => this.onEndpointRemoved(e));
      e.endpoint.on(VoxImplant.EndpointEvents.RemoteMediaAdded, (e: any) => this.onRemoteMediaAdded(e));
      e.endpoint.on(VoxImplant.EndpointEvents.RemoteMediaRemoved, (e: any) => this.onRemoteMediaRemoved(e));

      // all actions with endpoint only inside this
      this.logger.warn(`[WebSDk] New endpoint ID: ${e.endpoint.id} (${e.endpoint.isDefault ? 'default' : 'regular'})`);
      if (e.endpoint.isDefault) {
        this.endPointsSet = {};
      }
      this.endPointsSet[`${e.endpoint.id}`] = e.endpoint;

      if (e.endpoint.isDefault) {
        const message: IEndpointMessage = {
          data: {
            endpoint: e.endpoint,
            isNeedReCalcView: true,
          },
          route: [Route.Inner],
          sign: this.ID,
          type: DataBusMessageType.EndpointAdded,
        };
        this.dataBusService.send(message);

        this.checkAndSwitchCameraOff();
        this.checkAndMuteMicrophone();
      } else {
        const message: IEndpointMessage = {
          data: {
            endpoint: e.endpoint,
            isNeedReCalcView: true,
          },
          route: [Route.Inner],
          sign: this.ID,
          type: DataBusMessageType.EndpointAdded,
        };
        this.dataBusService.send(message);

        e.endpoint.mediaRenderers.forEach((mr: MediaRenderer) => {
          this.onRemoteMediaAdded({ endpoint: e.endpoint, mediaRenderer: mr });
        });
      }

      if (Object.keys(this.endPointsSet).length < 2) {
        this.dataBusService.send({
          data: undefined,
          route: [Route.Inner],
          sign: this.ID,
          type: DataBusMessageType.ShowInviteForm,
        });
      } else {
        this.dataBusService.send({
          data: undefined,
          route: [Route.Inner],
          sign: this.ID,
          type: DataBusMessageType.HideInviteForm,
        });
      }

      this.calculateParticipants();
    }
  }

  onRemoteMediaAdded(e: any) {
    this.logger.warn(`[WebSDk] New MediaRenderer in ${e.endpoint.id}`, e);
    if (this.endPointsSet[`${e.endpoint.id}`] && !e.endpoint.isDefault) {
      this.dataBusService.send({
        data: {
          mediaEvent: e,
        },
        route: [Route.Inner],
        sign: this.ID,
        type: DataBusMessageType.RemoteMediaAdded,
      });
    }
  }

  onRemoteMediaRemoved(e: any) {
    this.logger.warn(`[WebSDk] MediaRenderer removed from ${e.endpoint.id}`, e);
    if (this.endPointsSet[`${e.endpoint.id}`] && !e.endpoint.isDefault) {
      if (
        !e.endpoint.mediaRenderers.find(
          (renderer: MediaRenderer) => renderer.kind === 'video' || renderer.kind === 'sharing'
        )
      ) {
        this.dataBusService.send({
          data: {
            mediaEvent: e,
          },
          route: [Route.Inner],
          sign: this.ID,
          type: DataBusMessageType.RemoteMediaRemoved,
        });
      }
    }
  }

  onEndpointRemoved(e: any) {
    delete this.endPointsSet[`${e.endpoint.id}`];
    const message: IEndpointMessage = {
      data: {
        endpoint: e.endpoint,
        isNeedReCalcView: Object.keys(this.endPointsSet).length > 0,
      },
      route: [Route.Inner],
      sign: this.ID,
      type: DataBusMessageType.EndpointAdded,
    };

    this.dataBusService.send(message);

    if (Object.keys(this.endPointsSet).length < 2) {
      this.dataBusService.send({
        data: undefined,
        route: [Route.Inner],
        sign: this.ID,
        type: DataBusMessageType.ShowInviteForm,
      });
    }
  }

  // updateChatManager(currentUser)
  // {
  //   ChatManager.setConnectionId(currentUser.uuid);
  //   ChatManager.setDisplayName(currentUser.name);
  //   this.callInterface.registerMessageHandlers(ChatManager.sendMessage, ChatManager.addChatMessage);
  //   ChatManager.addChatMessage = this.callInterface.addChatMessage;
  // }
}
