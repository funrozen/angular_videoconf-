import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataBusMessageType, DataBusService } from '@core/data-bus.service';
import { filter } from 'rxjs/operators';
import { untilDestroyed } from '@core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private supportMessageTypes: DataBusMessageType[] = [
    DataBusMessageType.HideInviteForm,
    DataBusMessageType.ShowInviteForm,
  ];
  isLoading = false;
  constructor(private dataBusService: DataBusService) {
    this.dataBusService.inner$
      .pipe(
        filter((message) => this.supportMessageTypes.includes(message.type)),
        untilDestroyed(this)
      )
      .subscribe((message) => {
        switch (message.type) {
          case DataBusMessageType.ShowInviteForm:
            //inviteForm.classList.remove("hidden", "popup-view");
            break;
          case DataBusMessageType.HideInviteForm:
            //inviteForm.classList.add("hidden", "popup-view");
            break;
        }
      });
  }

  ngOnInit() {
    this.isLoading = true;
  }
  ngOnDestroy() {}
}
