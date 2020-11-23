import { Component, ElementRef, Inject, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FullScreenService } from '@app/voxImplant/full-screen.service';

@Component({
  selector: 'app-endpoint-video',
  templateUrl: './endpoint-video.component.html',
  styleUrls: ['./endpoint-video.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EndpointVideoComponent implements OnInit {
  constructor(@Inject(DOCUMENT) private document: Document, private fullScreenService: FullScreenService) {}

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
}
