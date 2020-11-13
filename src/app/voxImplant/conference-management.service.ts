import { Injectable } from '@angular/core';
import { DataBusMessageType, DataBusService, IDataBusMessage } from '@core/data-bus.service';
import { SDKService } from '@app/voxImplant/sdk.service';

@Injectable({
  providedIn: 'root',
})
export class ConferenceManagementService {
  constructor(private dataBusService: DataBusService, private sdkService: SDKService) {
    this.dataBusService.inner$.subscribe((message: IDataBusMessage) => {
      switch (message.type) {
        case DataBusMessageType.ReConnect:
          this.sdkService.reconnect();
          break;
      }
    });
  }
}
