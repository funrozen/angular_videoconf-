import { Component, ElementRef, Inject, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FullScreenService } from '@app/voxImplant/full-screen.service';
import { DataBusMessageType, DataBusService, IMuteMessage } from '@core/data-bus.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-endpoint-video',
  templateUrl: './endpoint-video.component.html',
  styleUrls: ['./endpoint-video.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EndpointVideoComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private fullScreenService: FullScreenService,
    private dataBusService: DataBusService
  ) {
    this.subscriptions.add(
      this.dataBusService.inward$.pipe().subscribe((message) => {
        switch (message.type) {
          case DataBusMessageType.Mute:
            {
              //TODO move to filter
              if ((<IMuteMessage>message).data.endpointId === this.id) {
                this.isMicrophoneMuted = !!(<IMuteMessage>message).data.value;
              }
            }
            break;
        }
      })
    );
  }

  @Input() id: string;
  @Input() name: string;
  //template.content.querySelector('.js__endpoint').style.order = place;
  @Input() place: string;

  @ViewChild('theElement') theElementRef: ElementRef;
  isMicrophoneMuted: boolean = false;

  ngOnInit(): void {}

  toggleFullScreen() {
    this.fullScreenService.toggleFullScreen(this.theElementRef.nativeElement);
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
