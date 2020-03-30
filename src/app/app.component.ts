import { Component} from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {AboutModalComponent} from './components/about/about.component';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	providers: [NgbModalConfig, NgbModal]
})

export class AppComponent {
	public title: string;

  	public mapSize: string;

  	constructor(config: NgbModalConfig, private modalService: NgbModal) {
   		this.title = 'USGS Time of Travel';
   		this.mapSize = 'half-map';

    	config.backdrop = 'static';
    	config.keyboard = false;
   	}

  	public openAboutModal() {
    	const modalRef = this.modalService.open(AboutModalComponent);
    	modalRef.componentInstance.title = 'About';
  	}

	public toggleSidebar() {
		console.log('Toggling Sidebar');
		$('#sidebarWrapper').toggleClass('menu-visible');
		$('#menuButtonIcon').toggleClass('fa-bars, fa-times');

	}
}
