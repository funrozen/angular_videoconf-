import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataBusMessageType, DataBusService, IEndpointParticipantData } from '@core/data-bus.service';
import { filter } from 'rxjs/operators';
import { untilDestroyed } from '@core';

//TODO as it is not depends of VoxImplants move it out
@Component({
  selector: 'app-participants-list',
  templateUrl: './participants-list.component.html',
  styleUrls: ['./participants-list.component.scss'],
})
export class ParticipantsListComponent implements OnInit, OnDestroy {
  constructor(private dataBusService: DataBusService) {
    this.dataBusService.inner$
      .pipe(
        filter((message) => message.type === DataBusMessageType.Participants),
        untilDestroyed(this)
      )
      .subscribe((message) => {
        let endpoint = (message as IEndpointParticipantData).data;
        // const sidebar = document.querySelector(".conf__sidebar-participants-list");
        //       while (sidebar.firstChild) {
        //         sidebar.removeChild(sidebar.firstChild);
        //       }
        //       const template = document.getElementById("js__endpoint-list-template");
        //       template.content.querySelector(
        //         ".conf__sidebar-participant-title"
        //       ).textContent = `${this.currentUserService.name} (you)`;
        //       const node = document.importNode(template.content, true);
        //       node.id = "js__local_participant_enlist";
        //       sidebar.appendChild(node);
        //       if (this.currentConf) {
        //         this.currentConf.getEndpoints().forEach((endpoint) => {
        //           if (!endpoint.isDefault) {
        //             const template = document.getElementById("js__endpoint-list-template");
        //             template.content.querySelector(
        //               ".conf__sidebar-participant-title"
        //             ).textContent = `${endpoint.displayName}`;
        //             const node = document.importNode(template.content, true);
        //             node.id = "list_" + endpoint.id;
        //             sidebar.appendChild(node);
        //           }
        //         });
        //       }
      });
  }

  ngOnInit(): void {}
  ngOnDestroy(): void {}
}
