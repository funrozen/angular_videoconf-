import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IIDClass } from '@app/interfaces/IIDClass';
import { createLogger } from '@core';
import { CurrentUserService } from '@core/current-user.service';

@Component({
  selector: 'app-info-form',
  templateUrl: './info-form.component.html',
  styleUrls: ['./info-form.component.scss'],
})
export class InfoFormComponent implements OnInit, IIDClass {
  readonly ID = 'InfoFormComponent';
  logger = createLogger(this.ID);
  myForm: FormGroup;
  constructor(private userService: CurrentUserService) {}

  ngOnInit(): void {
    this.myForm = new FormGroup({
      userName: new FormControl(this.userService.name, Validators.required),
      userEmail: new FormControl(this.userService.email, [Validators.required, Validators.email]),
      serviceId: new FormControl(this.userService.serviceId, [Validators.required, Validators.pattern('[0-9]{5,10}')]),
    });
  }

  submit() {
    this.logger.info('form', { myForm: this.myForm });
    this.userService.serviceId = this.myForm.value.serviceId;
    this.userService.email = this.myForm.value.userEmail;
    this.userService.name = this.myForm.value.userName;
  }
}
