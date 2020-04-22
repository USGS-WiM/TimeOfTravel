import { Component, OnInit, NgZone, Input, AfterViewInit } from '@angular/core';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import * as messageType from '../../../../shared/messageType';
import { MapService } from '../../services/map.services';
import { deepCopy } from '../../../../shared/extensions/object.DeepCopy';
import { StudyService } from '../../services/study.service';
import { NavigationService } from '../../services/navigationservices.service';
import * as L from 'leaflet';
import * as turf from '@turf/turf';
import * as $ from 'jquery';
import { Subscription } from 'rxjs';
import { walker } from '../../models/walker';
// import { ConsoleReporter } from 'jasmine';
import { UpstreamcalculatorService } from '../../services/upstreamcalculator.service';
 let search_api: any;

@Component({
  selector: "tot-map",
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})

export class MapComponent extends deepCopy implements OnInit, AfterViewInit {

  //#region "General variables"
  private messager: ToastrService;
  private MapService: MapService;
  private NavigationService: NavigationService;
  private StudyService: StudyService;
  private ToTCalculator: UpstreamcalculatorService;

  private _layersControl;
  private _bounds;
  private _layers = [];
  private subscription: Subscription;
  public fitBounds;
  public states: any = [];
  public reportMap = undefined;
  public poi;
  public flowlines;
  public layerGroup;
  public reportlayerGroup;
  public map: L.Map;
  public walkerArray: Array<walker> = [];

  public evnt;
  @Input() report: boolean;

  scaleMap: string;

  //#endregion

  //#region "Map helper methods of layerControl"
  public get LayersControl() {
    return this._layersControl;
  }

  public get Layers() {
    return this._layers;
  }

  public get MapOptions() {
    return this.MapService.Options;
  }


  // <!--"MapOptions"-->


  optionsSpec: any = {
    layers: [{ url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: 'Open Street Map' }],
    zoom: 5,
    center: [46.879966, -121.726909]
  };

  // Leaflet bindings
  zoom = this.optionsSpec.zoom;
  center = L.latLng(this.optionsSpec.center);

  options = {
    layers: [L.tileLayer(this.optionsSpec.layers[0].url, { attribution: this.optionsSpec.layers[0].attribution })],
    zoom: this.optionsSpec.zoom,
    center: L.latLng(this.optionsSpec.center)
  };

  //#endregion

  //#region "Contructor & ngOnit map subscribers
  constructor(mapservice: MapService, ToTCalculator: UpstreamcalculatorService, navigationservice: NavigationService, toastr: ToastrService, studyservice: StudyService) {
    super();
    this.ToTCalculator = ToTCalculator;
    this.messager = toastr;
    this.MapService = mapservice;
    this.NavigationService = navigationservice;
    this.StudyService = studyservice;
    this.layerGroup = new L.FeatureGroup([]); // streamLayer
    this.reportlayerGroup = new L.FeatureGroup([]);
  }

  ngOnInit() {


    this.MapService.bounds.subscribe(b => {
      this.fitBounds = b;
    });

    this.NavigationService.navigationGeoJSON$.subscribe(data => {
      // console.log(data);
    });
    //#region "Base layer and overlay subscribers"
    // method to subscribe to the layers
    this.MapService.LayersControl.subscribe(data => {
      this._layersControl = {
        baseLayers: data.baseLayers.reduce((acc, ml) => {
          acc[ml.name] = ml.layer;
          return acc;
        }, {}),
        overlays: data.overlays.reduce((acc, ml) => { acc[ml.name] = ml.layer; return acc; }, {})
      };

      // method to filter out layers by visibility
      if (data.overlays.length > 0) {
        const activelayers = data.overlays
          .filter((l: any) => l.visible)
          .map((l: any) => l.layer);
        activelayers.unshift(data.baseLayers.find((l: any) => (l.visible)).layer);
        this._layers = activelayers;
      }
    });

    //#endregion

    //#region "Map helpers subscribers of services"
    this.MapService.LatLng.subscribe(res => {
        this.poi = res;
    });

    this.MapService.layerGroup.subscribe(layerGroup => {
      this.layerGroup = layerGroup;
    });

    this.MapService.reportlayerGroup.subscribe(reportlayerGroup => {
      this.reportlayerGroup = reportlayerGroup;
    });
    //#endregion
  }

  //#endregion

  //#region "Report map helper"
  ngAfterViewInit() {
    // if this map is for the report
    if (this.report) {
        // if map already initialized, reset to avoid errors
        if (this.reportMap !== undefined) {
            this.reportMap.off();
            this.reportMap.remove();
      }
        this.reportMap = new L.Map('reportMap', this.options);
        // add point of interest
        const marker = L.marker(this.poi, {
            icon: L.icon(this.MapService.markerOptions.Spill)
        });

        marker.addTo(this.reportMap);
        this.reportlayerGroup.addTo(this.reportMap);

        this.reportMap.fitBounds(this.layerGroup.getBounds());
    }
  }

  //#endregion

  //#region "Map click events"
  public onMapReady(map: L.Map) {
    map.invalidateSize();
    this.MapService.map = map;
  }

  public onZoomChange(zoom: number) {
     this.MapService.CurrentZoomLevel = zoom;
  }

  public onMouseClick(evnt: any) { // need to create a subscriber on init and then use it as main poi value;
    this.evnt = evnt.latlng;
    if (this.StudyService.GetWorkFlow('hasMethod')) {
      (document.getElementById(this.StudyService.selectedStudy.MethodType) as HTMLInputElement).disabled = true;
      (document.getElementById(this.StudyService.selectedStudy.MethodType) as HTMLInputElement).classList.remove('waiting');

      if (this.StudyService.selectedStudy.MethodType == 'response') {
        this.setPOI(evnt.latlng, 'downstream');
      } else {
        this.setPOI(evnt.latlng, 'upstream');
      }
    }
  }

  //#endregion

  //#region "Helper methods (create FeatureGroup layer)"
  private setPOI(latlng: L.LatLng, inputString: string) {
    if (!this.StudyService.GetWorkFlow('hasPOI')) {
      this.sm('Point selected. Loading...');
      this.MapService.setCursor('');
      this.StudyService.SetWorkFlow('hasPOI', true);
      this.MapService.SetPoi(latlng);
      if (this.MapService.CurrentZoomLevel < 10 || !this.MapService.isClickable) { return; }
      const marker = L.marker(latlng, {
        icon: L.icon(this.MapService.markerOptions.Spill)
      });
      // add marker to map
      this.MapService.AddMapLayer({ name: 'POI', layer: marker, visible: true });

      this.NavigationService.getNavigationResource('3')
        .toPromise().then(data => {
          const config: Array<any> = data.configuration;
          config.forEach(item => {
            switch (item.id) {
              case 1: item.value = marker.toGeoJSON().geometry;
                      item.value.crs = { properties: { name: 'EPSG:4326' }, type: 'name' };
                      break;
              case 6: item.value = ['flowline', 'nwisgage']; // "flowline", "wqpsite", "streamStatsgage", "nwisgage"
                      break;
              case 5: item.value = inputString;
                      break;
              // tslint:disable-next-line: max-line-length
              case 0: item.value = { id: 3, description: 'Limiting distance in kilometers from starting point', name: 'Distance (km)', value: this.StudyService.distance, valueType: 'numeric' };
            }// end switch
          }); // next item
          return config;
        }).then(config => {
          this.NavigationService.getRoute('3', config, true).subscribe(response => {
            this.NavigationService.navigationGeoJSON$.next(response);
            response.features.shift();
            this.ToTCalculator.passageTimeTest();



            this.getFlowLineLayerGroup(response.features);
            this.StudyService.selectedStudy.Reaches = this.formatReaches(response);
            this.MapService.AddMapLayer({ name: 'Flowlines', layer: this.layerGroup, visible: true });
            this.StudyService.SetWorkFlow('hasReaches', true);
            this.StudyService.selectedStudy.LocationOfInterest = latlng;
            this.StudyService.setProcedure(2);

            this.ComputeTOT(response.features); // attach return to a walker array.
            this.trackFirst(this.walkerArray);
            console.log(this.walkerArray);
          });

        });
    }

  }


  public ComputeTOT(data) {
    data.forEach(reach => {
      if (reach.properties.hasOwnProperty("Discharge")) {
        const tot = this.ToTCalculator.passageTime(reach.properties.Length, reach.properties.Discharge * 0.0283168, reach.properties.Discharge * 0.0283168, reach.properties.DrainageArea*10^6);
        // find for the comid, attach time of travel;
        for (var i = 0; i < this.walkerArray.length; i++) {
          if (this.walkerArray[i].comid === reach.properties.nhdplus_comid) {
            this.walkerArray[i].result = tot;
          }
        }
      }
    })
  }

  public trackFirst(data) {
    data.forEach(awalker => {
      if (awalker.to.length == 0) { // pick up the head node
        if (awalker.from.length > 0) {

          awalker.accresult = awalker.result;
          awalker.touched = true;

          awalker.from.forEach(reachcomid => {
            this.walkerArray.forEach(o => {
              if (o.comid === reachcomid) {
                o.accresult = o.result + awalker.accresult;
                o.touched = true;
                this.accTOT(this.walkerArray, o);
                // -> keep tracing upstream ?!
              }
            })
          })
          // find this comid and add awalker.accresult;
          // reset to node to something else, and
        }
        // this.accTOT(this.walkerArray, awalker); //start process of tracing upstream
      }
    })
  }

  public accTOT(data, prev) {
    if (prev.from.length > 0) {
      prev.from.forEach(comid => {
        data.forEach(reachWalker => {
          if (reachWalker.comid === comid) {
            if (reachWalker.touched) {
            } else {
              reachWalker.accresult = prev.accresult + reachWalker.result;
              /*console.log ("Result comid");
              console.log (reachWalker.comid);
              console.log ("Accumulated TOT");
              console.log (Number.isNaN(reachWalker.accresult));*/
              if (Number.isNaN(reachWalker.accresult)){
                reachWalker.accresult = reachWalker.result;
              }
              reachWalker.touched = true;
              this.accTOT(this.walkerArray, reachWalker);
            }
          }
        });
      });
    } else {
      data.forEach(reachWalker => {
        if (reachWalker.comid === prev.comid) {
          if (reachWalker.to.length === 0) {
            reachWalker.accresult = reachWalker.result;
            reachWalker.touched = true;
          }
        }
      });
    }
  }


  public getFlowLineLayerGroup(features) {
    const layerGroup = new L.FeatureGroup([]);
    const reportlayerGroup = new L.FeatureGroup([]);
    this.createWalkers(features);
    features.forEach(i => {
      if (i.geometry.type === 'Point') {
        // tslint:disable-next-line: max-line-length
        layerGroup.addLayer(L.marker([i.geometry.coordinates[1], i.geometry.coordinates[0]], { icon: L.icon(this.MapService.markerOptions.GagesDownstream) }));
        // tslint:disable-next-line: max-line-length
        reportlayerGroup.addLayer(L.marker([i.geometry.coordinates[1], i.geometry.coordinates[0]], { icon: L.icon(this.MapService.markerOptions.GagesDownstream) }));
      } else if (typeof i.properties.nhdplus_comid === 'undefined') {
      } else if (i.geometry.type === 'LineString') {
        layerGroup.addLayer(L.geoJSON(i, this.MapService.markerOptions.Polyline));
        reportlayerGroup.addLayer(L.geoJSON(i, this.MapService.markerOptions.Polyline));

        const nhdcomid = 'NHDPLUSid: ' + String(i.properties.nhdplus_comid);
        const drainage = ' Drainage area: ' + String(i.properties.DrainageArea);
        const head = i.geometry.coordinates[i.geometry.coordinates.length - 2];
        const tail = i.geometry.coordinates[1];


        // tslint:disable-next-line: max-line-length
        this.searchNearest(i, features);

        // tslint:disable-next-line: max-line-length
        layerGroup.addLayer(L.circle([head[1], head[0]], this.MapService.markerOptions.EndNode).bindPopup(nhdcomid + '\n' + drainage));
        layerGroup.addLayer(L.circle([tail[1], tail[0]], this.MapService.markerOptions.EndNode2).bindPopup(nhdcomid + '\n' + drainage));
        this.MapService.layerGroup.next(layerGroup);


        // tslint:disable-next-line: max-line-length
        reportlayerGroup.addLayer(L.circle([head[1], head[0]], this.MapService.markerOptions.EndNode).bindPopup(nhdcomid + '\n' + drainage));

        this.MapService.reportlayerGroup.next(reportlayerGroup);

        i.properties.Length = turf.length(i, { units: 'kilometers' }); // computes actual length; (services return nhdplus length)
      } else {}
    });
    // because it is async it takes time to process function above, once we have it done - we get the bounds
    // Potential to improve
    setTimeout(() => {
      this.MapService.setBounds(layerGroup.getBounds());
    });
  }


  private sm(msg: string, mType: string = messageType.INFO, title?: string, timeout?: number) {
    try {
      let options: Partial<IndividualConfig> = null;
      if (timeout) { options = { timeOut: timeout }; }
      this.messager.show(msg, title, options, mType);
    } catch (e) {
    }
  }


  private createWalkers(features) {
    for (let index = 0; index < features.length; index++) {
      const element = features[index];
      const walkerObject = new walker();
      walkerObject.comid = element.properties.nhdplus_comid;
      walkerObject.length = element.properties.Length;
      walkerObject.drainage = element.properties.DrainageArea;
      walkerObject.discharge = element.properties.Discharge;
      walkerObject.result = 0;
      walkerObject.accresult = 0;
      walkerObject.touched = false;
      this.walkerArray.push(walkerObject);
    }
  }


  private searchNearest(poi, features) {

    /*const walkerObject = new walker();
    walkerObject.comid = poi.properties.nhdplus_comid;*/


    const head = poi.geometry.coordinates[poi.geometry.coordinates.length - 1];

    features.forEach(i => {
      if (i.geometry.type === 'Point'){} else {
      const distance = turf.distance(head, i.geometry.coordinates[0]);
      if (distance < 0.01) {
        this.walkerArray.forEach( j => {
          if (j.comid === poi.properties.nhdplus_comid) {
            j.to.push(i.properties.nhdplus_comid);
          } else if (j.comid === i.properties.nhdplus_comid){
            j.from.push (poi.properties.nhdplus_comid);
          }
        })
      }
    }
    })
  }

  private formatReaches(data): any {
    const streamArray = [];
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < data.features.length; i++) {
      if (data.features[i].geometry.type === 'LineString') {
        const polylinePoints = this.deepCopy(data.features[i]);
        streamArray.push(polylinePoints);
      }
    }
    streamArray.map((reach) => {
      reach.properties.show = false;
    });

    const sortArray = streamArray.sort( (a, b) => {
      return a.properties.DrainageArea - b.properties.DrainageArea;
    });
    return (sortArray);
  }
  //#endregion

}

