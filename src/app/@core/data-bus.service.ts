import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
//TODO move move to voximplant module
import { IChatMessage, IParticipant } from '@app/voxImplant/interfaces';

export enum ErrorId {
  SDKError = 'SDK Error', // LayerManager.show('conf__error');
  // TODO for 'SDK Error'
  // errorMessage.appendChild(document.createTextNode('SDK Error'));

  XMultipleLogin = 'X-Multiple-Login',
  // TODO for XMultipleLogin
  // LayerManager.show('conf__error');
  //       errorMessage.appendChild(
  //         document.createTextNode(
  //           'You have connected to the conference in another browser tab or window.'
  //         )
  //       );
  ConnectionProblem = 'Connection problem',
  // TODO for ConnectionProblem
  //   while (errorMessage.firstChild) {
  //   errorMessage.removeChild(errorMessage.lastChild);
  // }
  // errorMessage.appendChild(
  //   document.createTextNode('Connection problem, reconnecting you to the conference, please wait…')
  // );
  //
  // this.isReconnecting = true;
  // LayerManager.show('conf__error');
  BrowserIsNotSupported = 'BrowserIsNotSupported',

  // Happens when there are no funds on account
  OutOfMoney = 'OutOfMoney',
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
  InitCall = 'InitCall', // provoke init a call
  CallInit = 'CallInit', // happens on call start init
  CallInited = 'CallInited', // happens on call inited
  // settingsApplyButton.disabled = true;
  // settingsApplyButton.classList.add("loading");
  CallConnected = 'CallConnected', // happens on call init
  // CallConnected - logic on conference-management

  SendMessageToCall = 'SendMessageToCall',

  CameraToggle = 'CameraToggle', // toggle camera - toggle camera setting
  CameraToggled = 'CameraToggled', // when camera setting toggled
  MicToggle = 'MicToggle', // toggle microphone  - toggle mic setting
  MicToggled = 'MicToggled', // when camera mic toggled
  ReConnect = 'ReConnect', // invoke reconnect sdk
  JoinToChat = 'JoinToChat', //
  ChatMessage = 'ChatMessage', //send message to render
  SendMessageToChat = 'SendMessageToChat', //send message to render
  Participants = 'Participants', //send participants to render data:IEndpointParticipantMessage
  EndpointAdded = 'EndpointAdded', // on Endpoint added
  EndpointRemoved = 'EndpointRemoved', // on Endpoint removed
  RemoteMediaAdded = 'RemoteMediaAdded', // on RemoteMedia added
  RemoteMediaRemoved = 'RemoteMediaRemoved', // on RemoteMedia removed
  ShowInviteForm = 'ShowInviteForm',
  HideInviteForm = 'ShowInviteForm',
  LeaveRoom = 'LeaveRoom',
  StartShareScreen = 'StartShareScreen',

  StopShareScreen = 'StopShareScreen',
  ShareScreenStarted = 'ShareScreenStarted',
  ShareScreenStartedError = 'ShareScreenStartedError',
  ShareScreenStopped = 'ShareScreenStopped',

  FullScreenStopped = 'FullScreenStopped',
  FullScreenStarted = 'FullScreenStarted',
}

export interface IDataBusMessage {
  type: DataBusMessageType;
  route: Route[];
  senderId?: string;
  // class ID which send the message
  sign: string;
  data: any;
}

export interface IEndpointParticipantMessage extends IDataBusMessage {
  type: DataBusMessageType.Participants;
  route: [Route.Inner];
  data: IParticipant[];
}

export interface IDataBusChatMessage extends IDataBusMessage {
  type: DataBusMessageType.ChatMessage;
  route: [Route.Inner];
  data: IChatMessage;
}

export interface IToggleLocalMicMessage extends IDataBusMessage {
  type: DataBusMessageType.MicToggle;
  route: [Route.Inner];
  data: {
    status?: 'mute' | 'unmute';
  };
}
export interface IToggleLocalCameraMessage extends IDataBusMessage {
  type: DataBusMessageType.CameraToggle;
  route: [Route.Inner];
  data: {
    status?: 'hide' | 'show';
  };
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
