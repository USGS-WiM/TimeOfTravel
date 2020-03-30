import { NgModule } from '@angular/core';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FooterComponent } from './components/footer/footer.component';
import { MapComponent } from './components/map/map.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { CoreComponent } from './core.component';
import { MatExpansionModule, MatInputModule } from '@angular/material';
import { CommonModule } from '@angular/common';  
import { BrowserModule } from '@angular/platform-browser';
import { MatProgressButtonsModule } from 'mat-progress-buttons';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NavigationService } from './services/navigationservices.service';
import { MapService} from './services/map.services';
import { StudyService } from './services/study.service';
import { TravelTimeService } from './services/traveltimeservices.service';
import { NgxPrintModule} from 'ngx-print';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AppchartsComponent } from './components/appcharts/appcharts.component';
import { ChartsModule } from 'ng2-charts';
import { ChartsService } from './services/charts.service';
import { MapModule } from './components/map/map.module';
import { NgSelectModule, NgOption } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportModalComponent } from './components/report/report.component';
import { ReportModule } from './components/report/report.module';
import { Angulartics2Module } from 'angulartics2';
import { AppChartsModule } from './components/appcharts/appcharts.module';

@NgModule({
    declarations: [SidebarComponent, CoreComponent, FooterComponent],
  imports: [
    LeafletModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    MatExpansionModule, 
    MatInputModule, 
    CommonModule, 
    BrowserModule,
    NgSelectModule,
    MatProgressButtonsModule, 
    BrowserAnimationsModule, 
    NgxPrintModule, 
    AppRoutingModule, 
    NgbModule,
    ChartsModule,
    MapModule,
    ReportModule,
    Angulartics2Module.forRoot(),
    AppChartsModule
    ],
  providers: [MapService, NavigationService, StudyService, TravelTimeService, NgbActiveModal, ChartsService],
  exports: [SidebarComponent, MapComponent, CoreComponent, FooterComponent, AppchartsComponent, ReportModalComponent],
  bootstrap: [CoreComponent]
})
export class CoreModule { }
