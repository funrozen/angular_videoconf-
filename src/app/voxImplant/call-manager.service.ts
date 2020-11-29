import { Injectable, OnDestroy } from '@angular/core';
import {
  DataBusMessageType,
  DataBusService,
  ErrorId,
  IEndpointMessage,
  IEndpointParticipantMessage,
  Route,
} from '@core/data-bus.service';
import * as VoxImplant from 'voximplant-websdk';
import { Client } from 'voximplant-websdk/Client';
import { Call } from 'voximplant-websdk/Call/Call';
import { CurrentUserService } from '@core/current-user.service';
import { callReporter } from '@app/voxImplant/vi-helpers';
import { IIDClass } from '@app/interfaces/IIDClass';
import { createLogger, ILogger, untilDestroyed } from '@core';
import { MediaRenderer } from 'voximplant-websdk/Media/MediaRenderer';
import { filter } from 'rxjs/operators';

interface EndpointsData {
  displayName: string;
  id: string;
  isDefault: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CallManagerService implements IIDClass, OnDestroy {
  readonly ID = 'CallManagerService';
  private endPointsSet: Map<string, EndpointsData> = new Map<string, EndpointsData>();
  private currentConf: Call;
  private sdk: Client;
  private reporter: any;
  private logger: ILogger = createLogger(this.ID);

  constructor(private dataBusService: DataBusService, private currentUserService: CurrentUserService) {
    this.subscribe();
  }

  private subscribeToTypes: DataBusMessageType[] = [
    DataBusMessageType.CameraToggled,
    DataBusMessageType.StartShareScreen,
    DataBusMessageType.StopShareScreen,
  ];
  private subscribe() {
    this.dataBusService.inner$
      .pipe(
        filter((message) => this.subscribeToTypes.includes(message.type)),
        untilDestroyed(this)
      )
      .subscribe((message) => {
        switch (message.type) {
          case DataBusMessageType.CameraToggled:
            this.onCameraToggled();
            break;

          case DataBusMessageType.StartShareScreen:
            this.startSharingScreen();
            break;

          case DataBusMessageType.StopShareScreen:
            this.stopSharingScreen();
            break;
        }
      });
  }

  public init(newCallParams: any, sdk: Client) {
    this.sdk = sdk;
    this.dataBusService.send({
      type: DataBusMessageType.CallInit,
      route: [Route.Inner],
      sign: this.ID,
      data: {},
    });
    setTimeout(() => {
      this.currentConf = this.sdk.callConference(newCallParams);
      this.logger.info('call conference inited', newCallParams);
      this.reporter = callReporter(
        this.currentConf,
        this.currentUserService.name,
        this.currentUserService.serviceId,
        this.currentUserService.uuid
      );

      this.bindCallCallbacks();

      this.dataBusService.send({
        type: DataBusMessageType.CallInited,
        route: [Route.Inner],
        sign: this.ID,
        data: {},
      });

      // TODO

      // registerCallbacks(this.callInterface);
      //
    }, 1000);
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
    this.endPointsSet.set(this.currentUserService.uuid, <EndpointsData>{
      displayName: this.currentUserService.name,
      id: this.currentUserService.uuid,
      isDefault: true,
    });

    this.dataBusService.send({
      type: DataBusMessageType.CallConnected,
      data: { e },
      route: [Route.Inner],
      sign: this.ID,
    });

    this.onCameraToggled();
    this.onToggleMicrophone();
    /** end */
    this.logger.warn(`[WebSDk] Call connected ID: ${e.call.id()}`);
  }

  sendMessage(msg: string) {
    this.currentConf.sendMessage(msg);
  }

  private toggleCamera() {
    //TODO make interface for the message
    this.dataBusService.send({
      type: DataBusMessageType.CameraToggle,
      data: {
        status: this.currentUserService.cameraStatus ? 'hide' : 'show',
      },
      route: [Route.Inner],
      sign: this.ID,
    });
  }

  private onCameraToggled() {
    let showVideo = this.currentUserService.cameraStatus;
    if (!this.currentConf) return;
    if (showVideo) {
      //TODO
      // this.reporter.sendVideo();
      this.currentConf.sendVideo(true);
      //TODO this is not angular way!
      if (!document.getElementById('voximplantlocalvideo')) {
        this.sdk.showLocalVideo(true);
      }
      //TODO

      //LayerManager.toggleVideoStub('localVideoNode', false);
      //WSService.notifyVideo(true);
      //this.cam.classList.remove('option--off');
    } else {
      //TODO
      //this.reporter.stopSendVideo();
      this.currentConf.sendVideo(false);
      if (document.getElementById('voximplantlocalvideo')) {
        this.sdk.showLocalVideo(false);
      }

      //TODO
      // WSService.notifyVideo(false);
      // LayerManager.toggleVideoStub('localVideoNode', true);
      //this.cam.classList.add('option--off');
    }
  }

  private checkAndMuteMicrophone() {
    if (!this.currentUserService.microphoneEnabled) {
      //TODO make interface for the message
      this.dataBusService.send({
        type: DataBusMessageType.MicToggle,
        data: {
          status: this.currentUserService.microphoneEnabled ? 'mute' : 'unmute',
        },
        route: [Route.Inner],
        sign: this.ID,
      });
    }
  }

  onToggleMicrophone() {
    if (!this.currentConf) return;
    //TODO remove getElementById
    let localVideo = document.getElementById('localVideoNode');
    let muteLocalLabel = localVideo.querySelector('.conf__video-wrap .conf__video-micro');

    let mute = this.currentUserService.microphoneEnabled;

    if (!mute) {
      this.currentConf.unmuteMicrophone();
      //TODO
      //WSService.notifyMute(false);
      //muteLocalLabel.classList.add('hidden');

      //this.mic.classList.remove('option--off');
    } else {
      this.currentConf.muteMicrophone();
      //TODO
      //WSService.notifyMute(true);
      //muteLocalLabel.classList.remove('hidden');
      ///currentUser.microphoneEnabled = false;
      //this.mic.classList.add('option--off');
    }
  }

  onCallDisconnected(e: any) {
    this.logger.warn(`[WebSDk] Call disconnected ID: ${e.call.id()}`, e);
    if (e.headers['X-Multiple-Login']) {
      this.dataBusService.sendError({
        id: ErrorId.XMultipleLogin,
        description: 'You have connected to the conference in another browser tab or window.',
        data: e,
      });
      VoxImplant.getInstance().showLocalVideo(false);
    } else if (e?.reason === 'Payment Required') {
      this.dataBusService.sendError({
        data: e.reason,
        description: e.toString(),
        id: ErrorId.OutOfMoney,
      });
    } else {
      this.askForReconnect(e);
    }
  }

  private askForReconnect(e: any) {
    this.logger.warn(`[WebSDk] ask to reconnect: ${e.call.id()}`);

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
    this.logger.warn(`[WebSDk] Call failed ID: ${e.call.id()}`, e);
    if (e?.reason === 'Payment Required') {
      this.dataBusService.sendError({
        data: e.reason,
        description: e.toString(),
        id: ErrorId.OutOfMoney,
      });
    } else {
      this.askForReconnect(e);
    }
  }

  calculateParticipants() {
    const data: any[] = [];
    this.endPointsSet.forEach((endpoint) => {
      data.push({
        displayName: endpoint.displayName,
        id: endpoint.id,
        isDefault: endpoint.isDefault,
      });
    });
    this.dataBusService.send({
      data: data,
      route: [Route.Inner],
      type: DataBusMessageType.Participants,
    } as IEndpointParticipantMessage);
  }

  onEndpointAdded(e: any) {
    if (!this.endPointsSet.has(e.endpoint.id)) {
      e.endpoint.on(VoxImplant.EndpointEvents.Removed, (e: any) => this.onEndpointRemoved(e));
      e.endpoint.on(VoxImplant.EndpointEvents.RemoteMediaAdded, (e: any) => this.onRemoteMediaAdded(e));
      e.endpoint.on(VoxImplant.EndpointEvents.RemoteMediaRemoved, (e: any) => this.onRemoteMediaRemoved(e));

      // all actions with endpoint only inside this
      this.logger.warn(`[WebSDk] New endpoint ID: ${e.endpoint.id} (${e.endpoint.isDefault ? 'default' : 'regular'})`);
      if (!e.endpoint.isDefault) {
        // default is already there
        this.endPointsSet.set(e.endpoint.id, e.endpoint);
      }

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
        // todo why we need it?
        //this.checkAndSwitchCameraOff();
        //this.checkAndMuteMicrophone();
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

      if (this.endPointsSet.size < 2) {
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
    if (this.endPointsSet.has(e.endpoint.id) && !e.endpoint.isDefault) {
      const endpointNode = document.getElementById(e.endpoint.id);
      // if (
      //   e.mediaRenderer.kind === "video" &&
      //   document.getElementById(`videoStub-${e.endpoint.id}`)
      // ) {
      //   LayerManager.toggleVideoStub(e.endpoint.id, false);
      // }
      //
      // if (e.mediaRenderer.kind === "sharing") {
      //   LayerManager.toggleVideoStub(e.endpoint.id, false);
      // }
      //
      e.mediaRenderer.render(endpointNode);
      e.mediaRenderer.placed = true;
      //
      // if (
      //   !e.endpoint.mediaRenderers.find(
      //     (renderer) => renderer.kind === "video" || renderer.kind === "sharing"
      //   )
      // ) {
      //   LayerManager.toggleVideoStub(e.endpoint.id, true);
      // }
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
    if (this.endPointsSet.has(e.endpoint.id) && !e.endpoint.isDefault) {
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
    this.endPointsSet.delete(e.endpoint.id);
    const message: IEndpointMessage = {
      data: {
        endpoint: e.endpoint,
        isNeedReCalcView: this.endPointsSet.size > 0,
      },
      route: [Route.Inner],
      sign: this.ID,
      type: DataBusMessageType.EndpointRemoved,
    };

    this.dataBusService.send(message);

    if (this.endPointsSet.size < 2) {
      this.dataBusService.send({
        data: undefined,
        route: [Route.Inner],
        sign: this.ID,
        type: DataBusMessageType.ShowInviteForm,
      });
    }
    this.calculateParticipants();
  }

  ngOnDestroy(): void {}

  // updateChatManager(currentUser)
  // {
  //   ChatManager.setConnectionId(currentUser.uuid);
  //   ChatManager.setDisplayName(currentUser.name);
  //   this.callInterface.registerMessageHandlers(ChatManager.sendMessage, ChatManager.addChatMessage);
  //   ChatManager.addChatMessage = this.callInterface.addChatMessage;
  // }
  onLeaveRoom() {
    this.disconnect();
  }

  isSharing = false;
  stopSharingScreen() {
    this.currentConf
      .stopSharingScreen()
      .then(() => {
        //todo
        // CallManager.reporter.stopSharingScreen();
        this.isSharing = false;
        this.dataBusService.send({
          data: undefined,
          route: [Route.Inner],
          sign: this.ID,
          type: DataBusMessageType.ShareScreenStopped,
        });
      })
      .catch((e) => {
        this.logger.error(`[WebSDk] Cannot stop sharing: ${e.message}`);
      });
  }

  startSharingScreen() {
    // todo
    //CallManager.reporter.shareScreen(true, true);
    this.currentConf
      .shareScreen(true, true)
      .then(() => {
        this.isSharing = true;
        this.dataBusService.send({
          data: undefined,
          route: [Route.Inner],
          sign: this.ID,
          type: DataBusMessageType.ShareScreenStarted,
        });

        let renderers = VoxImplant.Hardware.StreamManager.get().getLocalMediaRenderers();

        let renderer = renderers[0];
        //if (renderer.kind === 'sharing') { //TODO actually it is video
        // TODO this one is not working but should  https://stackoverflow.com/questions/25141080/how-to-listen-for-stop-sharing-click-in-chrome-desktopcapture-api
        if (renderer) {
          renderer.stream.getTracks().forEach((tr) => {
            //tr.removeEventListener('ended', this._onSharingStopped);
            tr.addEventListener('ended', () => {
              debugger;
              this._onSharingStopped();
            });
            tr.addEventListener('inactive', () => {
              debugger;
              this._onSharingStopped();
            });
          });
        }
      })
      .catch((e) => {
        this.logger.error(`[WebSDk] Sharing failed: ${e.message}`);
        this.dataBusService.send({
          data: undefined,
          route: [Route.Inner],
          sign: this.ID,
          type: DataBusMessageType.ShareScreenStartedError,
        });
      });
  }

  private _onSharingStopped = () => {
    //TODO once run
    this.isSharing = false;
    this.dataBusService.send({
      data: undefined,
      route: [Route.Inner],
      sign: this.ID,
      type: DataBusMessageType.ShareScreenStopped,
    });
  };
}