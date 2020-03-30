import { NgModule } from '@angular/core';
import { AppchartsComponent } from '../appcharts/appcharts.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule, NgOption } from '@ng-select/ng-select';
import { ChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [ AppchartsComponent ],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    ChartsModule
  ],
  exports: [
    AppchartsComponent
  ]
})
export class AppChartsModule {

}
