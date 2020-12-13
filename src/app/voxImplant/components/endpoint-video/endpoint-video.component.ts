import { Component, ElementRef, Inject, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FullScreenService } from '../../full-screen.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DataBusMessageType, DataBusService, IMuteMessage } from '../../data-bus.service';

@Component({
  selector: 'app-endpoint-video',
  templateUrl: './endpoint-video.component.html',
  styleUrls: ['./endpoint-video.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EndpointVideoComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private subscribeToTypes: DataBusMessageType[] = [DataBusMessageType.Mute];
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private fullScreenService: FullScreenService,
    private dataBusService: DataBusService
  ) {
    this.subscriptions.add(
      this.dataBusService.inward$
        .pipe(filter((message) => this.subscribeToTypes.includes(message.type)))
        .subscribe((message) => {
          switch (message.type) {
            case DataBusMessageType.Mute:
              {
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
