import { Component, OnInit } from '@angular/core';
import { UIService } from '@app/voxImplant/ui.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {
  constructor(public uiService: UIService) {}

  ngOnInit(): void {}
}
