import { Injectable, OnDestroy } from '@angular/core';
import { SDKService } from '@app/voxImplant/sdk.service';
import { environment } from '@env/environment';
import { CurrentUserService } from '@core/current-user.service';
import { StatisticsService } from '@app/voxImplant/statistics.service';
import { IIDClass } from '@app/interfaces/IIDClass';
import { createLogger, untilDestroyed } from '@core';
import { VIManagerService } from '@app/voxImplant/vimanager.service';
import { DataBusMessageType, DataBusService, ErrorId, IDataBusMessage } from '@core/data-bus.service';
import { ConferenceManagementService } from '@app/voxImplant/conference-management.service';
import { ActivatedRoute, NavigationEnd, Router, UrlSegment } from '@angular/router';
import { filter, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

export enum UIState {
  needRoomId = 'needRoomId',
  needInfo = 'needInfo',
  needAccessAllow = 'conf__access-allow',
  needMediaSetting = 'conf__setting',
  browserIsSupported = 'conf__access-not-supported',
  mediaAccessError = 'mediaAccessError',
  videoWall = 'conf__video-section-wrapper',
  leaveRoom = 'conf__leave',
}

//TODO  move to module
@Injectable({
  providedIn: 'root',
})
export class UIService implements IIDClass, OnDestroy {
  readonly ID = 'UIService';
  private logger = createLogger(this.ID);

  navigationEnd: any;
  routePathParam: any;

  constructor(
    private sdkService: SDKService,
    private currentUserService: CurrentUserService,
    private statisticsService: StatisticsService,
    private viManagerServer: VIManagerService,
    private dataBusService: DataBusService,
    private conferenceManagement: ConferenceManagementService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.pathFromRoot;

    // route.url.subscribe((s:UrlSegment[]) => {
    //   console.log("url", s);
    //   let ss = route.snapshot;
    //   debugger;
    // });

    if (this.roomId) {
      this.onWelcome();
    } else {
      this.state = UIState.needRoomId;
    }

    this.dataBusService.inner$.pipe(untilDestroyed(this)).subscribe((message: IDataBusMessage) => {
      switch (message.type) {
        case DataBusMessageType.CallInit:
          //case DataBusMessageType.CallConnected:
          this.state = UIState.videoWall;
          break;
        case DataBusMessageType.LeaveRoom:
          //case DataBusMessageType.CallConnected:
          this.state = UIState.leaveRoom;
          break;
      }
    });
  }

  get roomId(): string {
    return this.currentUserService.serviceId;
  }

  onWelcome(e?: MouseEvent | TouchEvent) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    //there is login to cloud
    this.sdkService.login();

    if (this.currentUserService.isConfOwner) {
      this.currentUserService.serviceId = `${Math.floor(Math.random() * 99999999) + 1000000}`;
      window.history.replaceState(
        {},
        '',
        environment.appConfig.replaceHistoryPrefix + this.currentUserService.serviceId
      );
    }
    this.state = UIState.needInfo;
  }

  state: UIState;
  onJoin(serviceId: string, userEmail: string, userName: string) {
    this.currentUserService.serviceId = serviceId;
    this.currentUserService.email = userEmail;
    this.currentUserService.name = userName;

    this.statisticsService.initReporter('Videoconf', '', '');

    this.logger.info('New User:', { user: this.currentUserService.name });

    if (this.viManagerServer.checkBrowser()) {
      this.logger.info('[WebSDk] RTC SUPPORTED');
      this.state = UIState.needAccessAllow;
    } else {
      this.state = UIState.browserIsSupported;
      this.dataBusService.sendError({
        id: ErrorId.BrowserIsNotSupported,
        description: 'Browser not supported',
      });
      this.logger.warn('[WebSDk] RTC NOT SUPPORTED!');
      return;
    }

    this.viManagerServer
      .getLocalMedia()
      .then((e) => {
        this.state = UIState.needMediaSetting;
      })
      .catch(() => {
        this.state = UIState.mediaAccessError;
      });
  }

  ngOnDestroy(): void {}
}
