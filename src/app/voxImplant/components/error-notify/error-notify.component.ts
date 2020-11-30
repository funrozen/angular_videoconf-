import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataBusService } from '@core/data-bus.service';
import { IIDClass } from '@app/interfaces/IIDClass';

import { Subscription } from 'rxjs';
//TODO how switch it off??
@Component({
  selector: 'app-error-notify',
  templateUrl: './error-notify.component.html',
  styleUrls: ['./error-notify.component.scss'],
})
export class ErrorNotifyComponent implements IIDClass, OnDestroy {
  readonly ID = 'ErrorNotify';
  text: string;
  defaultShowTimeMs: number = 3000 * 1000;
  timeoutId: any;
  show: boolean = false;
  private subscriptions: Subscription = new Subscription();
  constructor(private dataBusService: DataBusService) {
    this.subscriptions.add(
      this.dataBusService.errorBus$.pipe().subscribe((e) => {
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
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
