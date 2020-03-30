import { NgModule } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapService } from '../../services/map.services';

@NgModule({
  declarations: [ MapComponent ],
  imports: [
    CommonModule,
    FormsModule,
    LeafletModule
  ],
  exports: [
    MapComponent
  ]
})
export class MapModule {
  // static forRoot() {
  //   return {
  //     ngModule: MapModule,
  //     providers: [ MapService ]
  //   };
  // }
}
