import { Component, OnInit } from '@angular/core';
import { DataBusService } from '@core/data-bus.service';
import { IIDClass } from '@app/interfaces/IIDClass';
//TODO how switch it off??
@Component({
  selector: 'app-error-notify',
  templateUrl: './error-notify.component.html',
  styleUrls: ['./error-notify.component.scss'],
})
export class ErrorNotifyComponent implements IIDClass {
  readonly ID = 'ErrorNotify';
  text: string;
  defaultShowTimeMs: number = 30 * 1000;
  timeoutId: any;
  show: boolean = false;
  constructor(private dataBusService: DataBusService) {
    this.dataBusService.errorBus$.subscribe((e) => {
      this.text = e.description;
      let time = this.defaultShowTimeMs;
      if (e?.data?.showTime) {
        time = e.data.showTime;
      }
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      this.show = true;
      this.timeoutId = setTimeout(() => {
        this.show = false;
      }, time);
    });
  }
}
