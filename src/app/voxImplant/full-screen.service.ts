import { Inject, Injectable } from '@angular/core';
import { DataBusMessageType, DataBusService, Route } from './data-bus.service';
import { DOCUMENT } from '@angular/common';
import { IIDClass } from './interfaces/IIDClass';

@Injectable()
export class FullScreenService implements IIDClass {
  readonly ID = 'FullScreenService';

  constructor(private dataBusService: DataBusService, @Inject(DOCUMENT) private document: Document) {}

  get isFullScreen(): boolean {
    return !!this.document.fullscreenElement;
  }

  toggleFullScreen(el: HTMLElement) {
    if (!el) return false;
    if (this.isFullScreen) {
      this.document.exitFullscreen().then(() => {
        this.dataBusService.send({
          data: undefined,
          route: [Route.Inner],
          sign: this.ID,
          type: DataBusMessageType.FullScreenStopped,
        });
      });
    } else {
      el.requestFullscreen().then(() => {
        this.dataBusService.send({
          data: undefined,
          route: [Route.Inner],
          sign: this.ID,
          type: DataBusMessageType.FullScreenStarted,
        });
      });
    }
  }
}
