import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss'],
})
export class SidePanelComponent implements OnInit {
  isPeopleShow: boolean = true;

  @Output() closePanelEmitter: EventEmitter<boolean> = new EventEmitter();

  @Input() participants: {
    id: string;
    displayName: string;
  }[] = [];

  onClickClose() {
    this.closePanelEmitter.emit(true);
  }

  constructor() {}

  ngOnInit(): void {}
}
