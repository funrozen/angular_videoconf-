import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataBusMessageType, DataBusService, IEndpointMessage } from '@core/data-bus.service';
import { filter } from 'rxjs/operators';
import { createLogger, untilDestroyed } from '@core';
import { fromEvent } from 'rxjs';
import { IIDClass } from '@app/interfaces/IIDClass';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CurrentUserService } from '@core/current-user.service';

type VideoEnpointType = {
  id: string;
  displayName: string;
  place: number;
};
type scaleSelectorResult = { Nx: number; Ny: number; targetW: number; targetH: number };

@Component({
  selector: 'app-video-wall',
  templateUrl: './video-wall.component.html',
  styleUrls: ['./video-wall.component.scss'],
})
export class VideoWallComponent implements OnInit, AfterViewInit, OnDestroy, IIDClass {
  readonly ID = 'VideoWallComponent';
  private logger = createLogger(this.ID);
  private supportMessageTypes: DataBusMessageType[] = [
    DataBusMessageType.EndpointAdded,
    DataBusMessageType.RemoteMediaAdded,
    DataBusMessageType.RemoteMediaRemoved,
    DataBusMessageType.EndpointRemoved,
  ];
  inviteForm: FormGroup;
  isLocalVideoShow = true;
  videoEndpoints: VideoEnpointType[] = [];
  roomId: string;
  initPromise: Promise<void>;
  initPromiseResolve: () => void;
  //TODO it probably need store to save video wall state
  constructor(private currentUserService: CurrentUserService, private dataBusService: DataBusService) {
    dataBusService.inner$
      .pipe(
        filter((message) => this.supportMessageTypes.includes(message.type)),
        untilDestroyed(this)
      )
      .subscribe((_message) => {
        switch (_message.type) {
          case DataBusMessageType.EndpointAdded:
            {
              let message: IEndpointMessage = _message as IEndpointMessage;

              let endpoint = message.data.endpoint;

              /* if (!CallManager.endPointsSet[`${e.endpoint.id}`]) {
                e.endpoint.on(window.VoxImplant.EndpointEvents.Removed, (e) => this.onEndpointRemoved(e));
                e.endpoint.on(window.VoxImplant.EndpointEvents.RemoteMediaAdded, (e) =>
                  this.onRemoteMediaAdded(e)
                );
                e.endpoint.on(window.VoxImplant.EndpointEvents.RemoteMediaRemoved, (e) =>
                  this.onRemoteMediaRemoved(e)
                );

                // all actions with endpoint only inside this
                console.warn(
                  `[WebSDk] New endpoint ID: ${e.endpoint.id} (${
                    e.endpoint.isDefault ? 'default' : 'regular'
                  })`
                );
                if (e.endpoint.isDefault) {
                  CallManager.endPointsSet = {};
                }
                CallManager.endPointsSet[`${e.endpoint.id}`] = e.endpoint;*/

              if (endpoint.isDefault) {
                this.isLocalVideoShow = true;

                //TODO switch local video and audio corresponding their state
              } else {
                this.videoEndpoints.push({
                  id: endpoint.id,
                  displayName: endpoint.displayName,
                  place: 1 + endpoint.place,
                });

                this.logger.info(' video added by endpoint: ', endpoint);
                //TODO fullscreen

                // const fullscreen = document
                //   .getElementById(e.endpoint.id)
                //   .querySelector(".conf__video-fullscreen");
                // if (fullscreen) {
                //   if (!document.fullscreenEnabled) {
                //     fullscreen.style.display = "none";
                //   } else {
                //     fullscreen.addEventListener("click", (event) => {
                //       this.callInterface.toggleFullScreen(e.endpoint.id);
                //     });
                //   }
                // }
              }

              this.setVideoSectionWidth();
            }
            break;
          case DataBusMessageType.RemoteMediaAdded:
            {
              // const endpointNode = document.getElementById(e.endpoint.id);
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
              // e.mediaRenderer.render(endpointNode);
              // e.mediaRenderer.placed = true;
              //
              // if (
              //   !e.endpoint.mediaRenderers.find(
              //     (renderer) => renderer.kind === "video" || renderer.kind === "sharing"
              //   )
              // ) {
              //   LayerManager.toggleVideoStub(e.endpoint.id, true);
              // }
            }
            break;

          case DataBusMessageType.RemoteMediaRemoved:
            {
              // LayerManager.toggleVideoStub(e.endpoint.id, true);
            }
            break;

          case DataBusMessageType.EndpointRemoved:
            {
              let message: IEndpointMessage = _message as IEndpointMessage;
              //this.soundRemoved.play();
              //       this.callInterface.checkFullScreen(e.endpoint.id);
              //       this.logger.warn(`[WebSDk] Endpoint was removed ID: ${e.endpoint.id}`);
              //       const node = document.getElementById(e.endpoint.id);
              //       if (node) {
              //         container.removeChild(node);
              //       }
              if (message.data.isNeedReCalcView) {
                setTimeout(() => {
                  this.setVideoSectionWidth();
                }, 0);
              }
            }
            break;
        }
      });
    this.initPromise = new Promise<void>((resolve) => {
      this.logger.info('resolve');
      this.initPromiseResolve = resolve;
    });
  }

  ngOnInit(): void {
    this.roomId = this.currentUserService.serviceId;
    this.inviteForm = new FormGroup({
      roomId: new FormControl(this.roomId, Validators.required),
    });
    this.subscribeToResizeEvent();
  }

  ngAfterViewInit(): void {
    this.initPromiseResolve();
  }

  ngOnDestroy() {}

  readonly dVideo = 360 / 640; // constant video proportions

  subscribeToResizeEvent() {
    fromEvent(window, 'resize')
      .pipe(untilDestroyed(this))
      .subscribe((_) => {
        this.setVideoSectionWidth();
      });
  }

  getDVideo(containerW: number, containerH: number) {
    if (containerW >= containerH) {
      return this.dVideo;
    } else {
      return 1 / this.dVideo;
    }
  }

  @ViewChild('videoSection') videoSection: ElementRef;

  async setVideoSectionWidth() {
    //const perf1 = window.performance.now();
    await this.initPromiseResolve();
    this.logger.info('Calculating layout');

    // const videoSection = this.videoSection.nativeElement;
    // const calculatingVideo = [...videoSection.querySelectorAll('.conf__video')];
    // let videoAmount = this.videoEndpoints.length + (this.isLocalVideoShow ? 1 : 0);
    // const allVideo =
    //   videoAmount === 1 ? [...videoSection.querySelectorAll('.conf__video-section>div')] : calculatingVideo;
    // const containerW = videoSection.clientWidth - 20;
    // const containerH = window.innerHeight - 88;
    // const N = videoAmount > 1 ? videoAmount : containerW < 584 ? 1 : 2; // additional container for the invite block if needed
    //
    // let { Nx, Ny, targetW, targetH } = this.scaleSelector(N, containerW, containerH);
    //
    // allVideo.forEach((el) => {
    //   el.style.width = targetW + 'px';
    //   el.style.height = targetH + 'px';
    //   const video = el.querySelector('video');
    //   if (video) {
    //     video.style.objectFit = this.getDVideo(containerW, containerH) !== this.dVideo ? 'cover' : 'contain';
    //   } else {
    //     setTimeout(() => {
    //       if (video)
    //         video.style.objectFit = this.getDVideo(containerW, containerH) !== this.dVideo ? 'cover' : 'contain';
    //     }, 1000);
    //   }
    // });
    // const containerPaddingW = (videoSection.clientWidth - targetW * Nx) / 2;
    // const containerPaddingH = (containerH - targetH * Ny) / 2;
    // if (containerPaddingW > 0 && containerPaddingH > 0)
    //   videoSection.style.padding = `${containerPaddingH}px ${containerPaddingW}px`;
    // else if (containerPaddingH > 0) videoSection.style.padding = `${containerPaddingH}px 0`;
    // else if (containerPaddingW > 0) videoSection.style.padding = `0 ${containerPaddingW}px`;
    // else videoSection.style.padding = `0`;
    //const perf2 = window.performance.now();
    //console.log(`Layout calculating took ${perf2 - perf1} ms`);
  }

  private scaleSelector(N: number, containerW: number, containerH: number) {
    if (N === 1) {
      return { Nx: 1, Ny: 1, targetW: containerW, targetH: containerH };
    }
    const scale1 = this.scaleSelectorW(N, containerW, containerH);
    const scale2 = this.scaleSelectorH(N, containerW, containerH);
    let targetScale = scale2;
    if (scale1.targetH * scale1.targetW > scale2.targetH * scale2.targetW) return scale1;
    if (this.isScaleLessMinimum(targetScale, containerW, containerH)) {
      targetScale = this.rescaleSelectorMini(N, containerW, containerH);
    }
    return targetScale;
  }

  private isScaleLessMinimum(scale: scaleSelectorResult, containerW: number, containerH: number) {
    const maxCols = containerW > containerH ? 5 : 3;
    return scale.Nx > maxCols;
  }

  private rescaleSelectorMini(N: number, containerW: number, containerH: number): scaleSelectorResult {
    const Nx = containerW >= containerH ? 5 : 3;
    const targetW = containerW / Nx;
    const targetH = targetW * this.getDVideo(containerW, containerH);
    const Ny = Math.ceil(N / Nx);
    return { Nx, Ny, targetW, targetH };
  }

  private scaleSelectorW(N: number, containerW: number, containerH: number): scaleSelectorResult {
    const sqrCont = containerW * containerH;
    let sqr = {};
    for (let i = 1; i <= N; i++) {
      const possibleTargetW = containerW / i;
      const possibleTargetH = possibleTargetW * this.getDVideo(containerW, containerH);
      sqr[i] = containerW * (possibleTargetH * Math.ceil(N / i));
      if (sqr[i] > sqrCont) sqr[i] = 0;
    }
    let Nx = parseInt(
      Object.entries(sqr).sort((a, b) => {
        if (a[1] > b[1]) return -1;
        if (a[1] < b[1]) return 1;
        return 0;
      })[0][0],
      10
    );
    let Ny = Math.ceil(N / Nx);
    let targetW = containerW / Nx;
    let targetH = targetW * this.getDVideo(containerW, containerH);
    if (targetH <= containerW && targetW <= containerH) {
      return { Nx, Ny, targetW, targetH };
    }
    return { Nx: 0, Ny: 0, targetW: 0, targetH: 0 };
  }

  private scaleSelectorH(N: number, containerW: number, containerH: number): scaleSelectorResult {
    const sqrCont = containerW * containerH;
    let sqr = {};
    for (let i = 1; i <= N; i++) {
      const possibleTargetH = containerH / i;
      const possibleTargetW = possibleTargetH / this.getDVideo(containerW, containerH);
      sqr[i] = containerH * (possibleTargetW * Math.ceil(N / i));
      if (sqr[i] > sqrCont) sqr[i] = 0;
    }
    let indexNy = Object.entries<number>(sqr).sort((a, b) => {
      if (a[1] > b[1]) return -1;
      if (a[1] < b[1]) return 1;
      return 0;
    })[0][0];
    let Ny = parseInt(indexNy, 10);
    let Nx = Math.ceil(N / Ny);
    let targetH = containerH / Ny;
    let targetW = targetH / this.getDVideo(containerW, containerH);
    if (targetH <= containerW && targetW <= containerH) {
      return { Nx, Ny, targetW, targetH };
    }
    return { Nx: 0, Ny: 0, targetW: 0, targetH: 0 };
  }
}
