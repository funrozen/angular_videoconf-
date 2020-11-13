import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataBusMessageType, DataBusService, IEndpointMessage } from '@core/data-bus.service';
import { filter } from 'rxjs/operators';
import { untilDestroyed } from '@core';

@Component({
  selector: 'app-video-wall',
  templateUrl: './video-wall.component.html',
  styleUrls: ['./video-wall.component.scss'],
})
export class VideoWallComponent implements OnInit, OnDestroy {
  private supportMessageTypes: DataBusMessageType[] = [
    DataBusMessageType.EndpointAdded,
    DataBusMessageType.RemoteMediaAdded,
    DataBusMessageType.RemoteMediaRemoved,
    DataBusMessageType.EndpointRemoved,
  ];
  //TODO it probably need store to save video wall state
  constructor(private dataBusService: DataBusService) {
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

              // let e= message.date.endpoint;
              //if (e.endpoint.isDefault) {
              //         let localVideo = document.getElementById("localVideoNode");
              //         let nameLocalLabel = localVideo.querySelector(".conf__video-wrap .conf__video-name");
              //         nameLocalLabel.innerHTML = `${this.currentUserService.name} (you)`;
              // else{
              //
              // const node = LayerManager.renderTemplate(
              //   e.endpoint.id,
              //   e.endpoint.displayName,
              //   1 + e.endpoint.place
              // );
              //
              // container.appendChild(node);
              // this.soundAdded.play();
              // this.logger.warn(e.endpoint);
              // this.logger.error(e.endpoint.place);
              // // document.getElementById(e.endpoint.id).style.order = e.endpoint.place;
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
              // }

              //setVideoSectionWidth();
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
                //
                // setTimeout(() => {
                //   setVideoSectionWidth();
                // }, 0);
              }
            }
            break;
        }
      });
  }

  ngOnInit(): void {}

  ngOnDestroy() {}
}
