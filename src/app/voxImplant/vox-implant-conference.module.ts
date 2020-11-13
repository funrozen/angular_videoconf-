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
@NgModule({
  imports: [CommonModule, TranslateModule, SharedModule, ReactiveFormsModule, VoxImplantConferenceRoutingModule],
  declarations: [HomeComponent, WelcomeComponent, ParticipantsListComponent, VideoWallComponent, InfoFormComponent],
})
export class VoxImplantConferenceModule {}
