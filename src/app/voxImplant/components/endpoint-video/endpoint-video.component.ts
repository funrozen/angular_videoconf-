import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-endpoint-video',
  templateUrl: './endpoint-video.component.html',
  styleUrls: ['./endpoint-video.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EndpointVideoComponent implements OnInit {
  constructor() {}

  @Input() id: string;
  @Input() name: string;
  //template.content.querySelector('.js__endpoint').style.order = place;
  @Input() place: string;

  ngOnInit(): void {}
}
