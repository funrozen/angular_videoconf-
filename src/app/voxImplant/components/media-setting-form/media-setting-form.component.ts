import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import { CurrentUserService } from '@core/current-user.service';
import { IIDClass } from '@app/interfaces/IIDClass';
import { createLogger } from '@core';
import { VIManagerService } from '@app/voxImplant/vimanager.service';
import * as VoxImplant from 'voximplant-websdk';
import { AudioOutputInfo, AudioSourceInfo, VideoSourceInfo } from 'voximplant-websdk/Structures';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  DataBusMessageType,
  DataBusService,
  IToggleLocalCameraMessage,
  IToggleLocalMicMessage,
  Route,
} from '@core/data-bus.service';

@Component({
  selector: 'app-media-setting-form',
  templateUrl: './media-setting-form.component.html',
  styleUrls: ['./media-setting-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MediaSettingFormComponent implements OnInit, AfterViewInit, IIDClass {
  readonly ID = 'MediaSettingFormComponent';
  private logger = createLogger(this.ID);
  constructor(
    private viManagerService: VIManagerService,
    private renderer: Renderer2,
    private currentUserService: CurrentUserService,
    private dataBusService: DataBusService,
    private changeDetector: ChangeDetectorRef
  ) {}
  settingForm: FormGroup;

  @ViewChild('videoContainer') videoContainer: ElementRef;
  @ViewChild('settingsMicrophoneFlag') settingsMicrophoneFlag: ElementRef;
  @ViewChild('cameraSetting') cameraSetting: ElementRef;
  @ViewChild('selectCamera') selectCamera: ElementRef;
  @ViewChild('cameraSettingsButton') cameraSettingsButton: ElementRef;
  @ViewChild('microphoneSettings') microphoneSettings: ElementRef;
  @ViewChild('formRowCamera') formRowCamera: ElementRef;
  @ViewChild('microphoneSettingsButton') microphoneSettingsButton: ElementRef;
  @ViewChild('speakersSettings') speakersSettings: ElementRef;
  @ViewChild('speakersSettingsButton') speakersSettingsButton: ElementRef;

  private localVideoElement: HTMLVideoElement;

  ngOnInit() {
    this.settingForm = new FormGroup({});
  }

  ngAfterViewInit(): void {
    if (this.viManagerService.permissions.video) {
      this.localVideoElement = document.createElement('video');
      this.localVideoElement.setAttribute('muted', 'muted');
      this.localVideoElement.setAttribute('playsinline', 'true');
      this.localVideoElement.setAttribute('autoplay', 'true');
      this.renderer.appendChild(this.videoContainer.nativeElement, this.localVideoElement);

      this.updateLocalVideoSrc();
    } else {
      this.renderer.addClass(this.settingsMicrophoneFlag.nativeElement, 'option--off');

      this.currentUserService.cameraStatus = false;
    }
    this.getSettings();
  }

  private updateLocalVideoSrc() {
    this.localVideoElement.srcObject = new MediaStream(this.viManagerService.localStream.getVideoTracks());
    if (this.viManagerService.permissions.video !== false && this.currentUserService.cameraStatus) {
      this.localVideoElement.play().catch(this.logger.error);
    }
  }

  private getSettings() {
    this.getCameraSettings();
    this.getMicrophoneSettings();
    this.getSpeakersSettings();
    this.updateUserStatus();
  }

  private getCameraSettings() {
    VoxImplant.Hardware.CameraManager.get()
      .getInputDevices()
      .then((devices: VideoSourceInfo[]) => {
        this.cameraItems = [];
        if (devices.length === 0) {
          this.currentCamera = 'No available microphone';
        } else if (devices.length === 1) {
          this.currentCamera = devices[0].name;
        } else {
          this.currentCamera = this.viManagerService.getMicName().toString();
          devices.forEach((device: VideoSourceInfo) => {
            this.cameraItems.push({ id: device.id, name: device.name });
          });
        }
      });
  }
  public cameraItems: { id: number | string; name: string }[] = [];
  public currentCamera = 'Choose';
  public isCameraOpen = false;
  onCameraSettingButton($event: MouseEvent) {
    if (this.cameraItems.length > 0) {
      this.isCameraOpen = !this.isCameraOpen;
    }
  }

  public changeCamera(cameraId?: number | string) {
    this.viManagerService
      .changeLocalCam(cameraId)
      .then((e: MediaStream) => {
        this.localVideoElement.srcObject = e;
        this.localVideoElement.play();
      })
      .catch((e) => {
        setTimeout(() => this.changeCamera(), 0);
      });
  }

  private getMicrophoneSettings() {
    VoxImplant.Hardware.AudioDeviceManager.get()
      .getInputDevices()
      .then((devices: AudioSourceInfo[]) => {
        this.microphoneItems = [];
        if (devices.length === 0) {
          this.currentMicrophone = 'No available microphone';
        } else if (devices.length === 1) {
          this.currentMicrophone = devices[0].name;
        } else {
          this.currentMicrophone = this.viManagerService.getMicName().toString();
          devices.forEach((device: AudioSourceInfo) => {
            this.microphoneItems.push({ id: device.id, name: device.name });
          });
        }
      });
  }
  public microphoneItems: { id: number | string; name: string }[] = [];
  public currentMicrophone = 'Choose';
  public isMicrophoneOpen = false;
  onMicrophoneSettingButton($event: MouseEvent) {
    this.isMicrophoneOpen = !this.isMicrophoneOpen;
  }
  public changeMicrophone(newMic?: number | string) {
    this.viManagerService
      .changeLocalMic(newMic)
      .then((e) => {
        let name = this.viManagerService.getMicName();
        if (name) {
          this.currentMicrophone = name;
        }
      })
      .catch((e) => {
        // do nothing?
        //setTimeout(()=>this.changeMicrophone(), 0);
      })
      .finally(() => {
        this.isMicrophoneOpen = false;
      });
  }

  private getSpeakersSettings() {
    VoxImplant.Hardware.AudioDeviceManager.get()
      .getOutputDevices()
      .then((devices: AudioOutputInfo[]) => {
        this.speakerItems = [];
        if (devices.length === 0) {
          this.currentSpeaker = 'No available microphone';
        } else if (devices.length === 1) {
          this.currentSpeaker = devices[0].name;
        } else {
          this.currentSpeaker = this.viManagerService.getMicName().toString();
          devices.forEach((device: AudioOutputInfo) => {
            this.speakerItems.push({ id: device.id, name: device.name });
          });
        }
      });
  }

  public speakerItems: { id: number | string; name: string }[] = [];
  public currentSpeaker = 'Choose';
  public isSpeakerOpen = false;
  onSpeakerSettingButton($event: MouseEvent) {
    if (this.speakerItems.length > 0) {
      this.isSpeakerOpen = !this.isSpeakerOpen;
    }
  }

  public changeSpeakers(newSpeaker: number | string) {
    this.viManagerService.changeLocalSpeakers(newSpeaker);
    const speakerId = this.viManagerService.getSpeakerId();
    this.currentSpeaker = this.speakerItems.find((item) => item.id === speakerId).name;
    this.isSpeakerOpen = false;
  }

  updateUserStatus() {}

  onSubmit(e: Event) {
    e.preventDefault();

    this.viManagerService.stopLocalMedia();
    this.viManagerService.setSettings();
    // TODO start call!!!
    //new CallManager(currentUser.getCallSettings());
    //inviteInput.value = `${Env.url}${Env.replaceHistoryPrefix}${user.serviceId}`;
    this.logger.info(`[WebSDk] Call crete from serviceID: conf_${this.currentUserService.serviceId}`);
  }

  toggleMicrophone() {
    this.dataBusService.send(<IToggleLocalMicMessage>{
      type: DataBusMessageType.MicToggle,
      data: {
        status: this.currentUserService.microphoneEnabled ? 'mute' : 'unmute',
      },
      route: [Route.Inner],
      sign: this.ID,
    });
  }

  get isMicEnabled() {
    return this.currentUserService.microphoneEnabled;
  }

  toggleLocalVideo() {
    this.dataBusService.send(<IToggleLocalCameraMessage>{
      type: DataBusMessageType.CameraToggle,
      data: {
        status: this.currentUserService.cameraStatus ? 'hide' : 'show',
      },
      route: [Route.Inner],
      sign: this.ID,
    });
    // TODO it is not good solution
    setTimeout(() => {
      this.updateLocalVideoSrc();
    }, 100);
  }
  get isCameraEnabled(): boolean {
    return this.currentUserService.cameraStatus;
  }
}
