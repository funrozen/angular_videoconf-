import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '@shared';
import { VoxImplantConferenceRoutingModule } from './vox-implant-conference-routing.module';
import { HomeComponent } from './components/home/home.component';
import { WelcomeComponent } from './components/welcome/welcome.component';

import { ParticipantsListComponent } from '@app/voxImplant/components/participants-list/participants-list.component';
import { VideoWallComponent } from '@app/voxImplant/components/video-wall/video-wall.component';
import { InfoFormComponent } from '@app/voxImplant/components/info-form/info-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CameraAllowAccessComponent } from './components/camera-allow-access/camera-allow-access.component';
import { BrowserIsNotSupportedComponent } from './components/browser-is-not-supported/browser-is-not-supported.component';
import { ErrorNotifyComponent } from './components/error-notify/error-notify.component';
import { MediaSettingFormComponent } from './components/media-setting-form/media-setting-form.component';
import { MediaAllowNotifyComponent } from './components/media-allow-notify/media-allow-notify.component';
import { LocalVideoComponent } from './components/local-video/local-video.component';
import { EndpointVideoComponent } from './components/endpoint-video/endpoint-video.component';

import { EnviromentComponent } from './components/enviroment/enviroment.component';
import { LeaveRoomComponent } from './components/leave-room/leave-room.component';
import { SidePanelComponent } from './components/side-panel/side-panel.component';
import { ChatComponent } from './components/chat/chat.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UIService } from '@app/voxImplant/ui.service';
import { WSService } from '@app/voxImplant/ws.service';
import { VIManagerService } from '@app/voxImplant/vimanager.service';
import { ReporterService } from '@app/voxImplant/reporter.service';
import { SDKService } from '@app/voxImplant/sdk.service';
import { FullScreenService } from '@app/voxImplant/full-screen.service';
import { ConferenceManagementService } from '@app/voxImplant/conference-management.service';
import { ChatManagerService } from '@app/voxImplant/chat-manager.service';
import { CallManagerService } from '@app/voxImplant/call-manager.service';
@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    SharedModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    VoxImplantConferenceRoutingModule,
  ],
  declarations: [
    HomeComponent,
    WelcomeComponent,
    ParticipantsListComponent,
    VideoWallComponent,
    InfoFormComponent,
    CameraAllowAccessComponent,
    BrowserIsNotSupportedComponent,
    ErrorNotifyComponent,
    MediaSettingFormComponent,
    MediaAllowNotifyComponent,
    LocalVideoComponent,
    EndpointVideoComponent,

    EnviromentComponent,

    LeaveRoomComponent,

    SidePanelComponent,

    ChatComponent,
  ],
  providers: [
    UIService,
    WSService,
    VIManagerService,
    ReporterService,
    SDKService,
    FullScreenService,
    ConferenceManagementService,
    ChatManagerService,
    CallManagerService,
  ],
})
export class VoxImplantConferenceModule {}
