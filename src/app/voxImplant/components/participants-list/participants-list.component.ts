import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DataBusMessageType, DataBusService, IEndpointParticipantMessage } from '@core/data-bus.service';
import { filter } from 'rxjs/operators';
import { untilDestroyed } from '@core';

//TODO as it is not depends of VoxImplants move it out
@Component({
  selector: 'app-participants-list',
  templateUrl: './participants-list.component.html',
  styleUrls: ['./participants-list.component.scss'],
})
export class ParticipantsListComponent implements OnInit, OnDestroy {
  @Input() participants: {
    id: string;
    displayName: string;
    isDefault: boolean;
  }[] = [];
  constructor() {}

  ngOnInit(): void {}
  ngOnDestroy(): void {}
}
