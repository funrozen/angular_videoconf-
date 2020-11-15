import { Injectable } from '@angular/core';
import { Call } from 'voximplant-websdk/Call/Call';

interface IReporter {
  sendVideo: () => void;
  stopSendVideo: () => void;
  hold: () => void;
  unHold: () => void;
  shareScreen: (showLocal: any, replace: any) => void;
  stopSharingScreen: () => void;
}

/***
 *  envelope for https://vc-stats.voximplant.com/lib/index.js
 */

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  initReporter(appName: string, gw: string, gwConnectionId: string) {
    (window as any).initReporter(appName, gw, gwConnectionId);
  }

  private _callReporter: IReporter;
  callReporter(call: Call, login: any, callNumber: string, role: string): IReporter {
    // @ts-ignore
    return callReporter(call, login, role);
  }
}
