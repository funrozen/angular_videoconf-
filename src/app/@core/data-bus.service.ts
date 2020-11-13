import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

export enum ErrorId {
  SDKError = 'SDK Error', // LayerManager.show('conf__error');
  // errorMessage.appendChild(document.createTextNode('SDK Error'));

  XMultipleLogin = 'X-Multiple-Login',
  // LayerManager.show('conf__error');
  //       errorMessage.appendChild(
  //         document.createTextNode(
  //           'You have connected to the conference in another browser tab or window.'
  //         )
  //       );
  ConnectionProblem = 'Connection problem',
  //
  //   while (errorMessage.firstChild) {
  //   errorMessage.removeChild(errorMessage.lastChild);
  // }
  // errorMessage.appendChild(
  //   document.createTextNode('Connection problem, reconnecting you to the conference, please wait…')
  // );
  //
  // this.isReconnecting = true;
  // LayerManager.show('conf__error');
}

export interface IErrorMessage {
  id: ErrorId;
  description?: string;
  data?: any;
}

export enum Route {
  Inner = 'Inner',
  Inward = 'Inward',
  Outward = 'Outward',
}

export enum DataBusMessageType {
  SignIn = 'SignIn', // happens on success sdk.login
  // [ LayerManager.show('conf__form');]
  CallInit = 'CallInit', // happens on call init
  // settingsApplyButton.disabled = true;
  // settingsApplyButton.classList.add("loading");
  CallConnected = 'CallConnected', // happens on call init
  //     inviteForm.classList.remove('hidden', 'popup-view');
  //
  //     let localVideo = document.getElementById('localVideoNode');
  //     let nameLocalLabel = localVideo.querySelector('.conf__video-wrap .conf__video-name');
  //     nameLocalLabel.innerHTML = `${this.currentUserService.name} (you)`;
  // WSService.login(
  //       e.headers['X-Conf-Sess'],
  //       e.headers['X-Conf-Call'],
  //       !this.currentUserService.microphoneEnabled,
  //       false,
  //       this.currentUserService.cameraStatus === 1 ? true : false
  //     );
  //     if (this.currentConf.settings.video.sendVideo) {
  //       VoxImplant.getInstance().showLocalVideo(true);
  //     }
  //
  //     settingsApplyButton.disabled = false;
  //     settingsApplyButton.classList.remove('loading');
  //     calculateVideoGrid();
  //     LayerManager.show('conf__video-section-wrapper');

  CameraToggle = 'CameraToggle', // toggle camera -  this.callInterface.cameraToggle('', 'hide');
  MuteToggle = 'MuteToggle', // toggle microphone  - this.callInterface.muteToggle('', 'mute');
  ReConnect = 'ReConnect', // invoke reconnect sdk
  JoinToChat = 'JoinToChat', //
  ChatMessage = 'ChatMessage', //send message to render
  Participants = 'Participants', //send participants to render data:IEndpointParticipantData
  EndpointAdded = 'EndpointAdded', // on Endpoint added
  EndpointRemoved = 'EndpointRemoved', // on Endpoint removed
  RemoteMediaAdded = 'RemoteMediaAdded', // on RemoteMedia added
  RemoteMediaRemoved = 'RemoteMediaRemoved', // on RemoteMedia removed
  ShowInviteForm = 'ShowInviteForm',
  HideInviteForm = 'ShowInviteForm',
}

export interface IDataBusMessage {
  type: DataBusMessageType;
  route: Route[];
  senderId?: string;
  // class ID which send the message
  sign: string;
  data: any;
}

export interface IEndpointParticipantData extends IDataBusMessage {
  type: DataBusMessageType.Participants;
  route: [Route.Inner];
  data: {
    id: string;
    displayName: string;
  }[];
}

export interface IEndpointMessage extends IDataBusMessage {
  type: DataBusMessageType.EndpointAdded | DataBusMessageType.EndpointRemoved;
  route: [Route.Inner];
  data: {
    endpoint: {
      id: string;
      displayName: string;
      place: number;
      isDefault: boolean;
    };
    isNeedReCalcView: boolean;
  };
}

@Injectable({
  providedIn: 'root',
})
export class DataBusService {
  // Observable string sources
  private dataBus = new Subject<IDataBusMessage>();
  // Observable string streams
  dataBus$ = this.dataBus.asObservable();

  inward$ = this.dataBus$.pipe(filter((message) => message.route.indexOf(Route.Inward) !== -1));
  outward$ = this.dataBus$.pipe(filter((message) => message.route.indexOf(Route.Outward) !== -1));
  inner$ = this.dataBus$.pipe(filter((message) => message.route.indexOf(Route.Inner) !== -1));

  private errorBus = new Subject<IErrorMessage>();
  public errorBus$ = this.errorBus.asObservable();

  constructor() {}

  sendError(errorMessage: IErrorMessage) {
    this.errorBus.next(errorMessage);
  }

  send(message: IDataBusMessage) {
    this.dataBus.next(message);
  }
}
