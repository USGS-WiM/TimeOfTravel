import { Component, OnInit} from '@angular/core';
import { NgbModal, NgbActiveModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'aboutModal',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})

export class AboutModalComponent implements OnInit {

    public appVersion: string;

    constructor(config: NgbModalConfig, public activeModal: NgbActiveModal) {
      // customize default values of modals used by this component tree
      config.backdrop = 'static';
      config.keyboard = false;
    }

     ngOnInit() {}

}
