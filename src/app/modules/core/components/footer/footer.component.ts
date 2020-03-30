import { Component, OnInit } from '@angular/core';
import { StudyService } from '../../services/study.service';
import { MapService } from '../../services/map.services';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import { reach } from '../../models/reach';
import * as $ from 'jquery';
import { ChartsService } from '../../services/charts.service';
import '../../../../shared/extensions/number.toUSGSValue';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { deepCopy } from 'src/app/shared/extensions/object.DeepCopy';

@Component({
  selector: 'tot-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent extends deepCopy implements OnInit {
  // ngOnInit(): void {
  //   throw new Error("Method not implemented.");
  // }
  public spillMass;
  public spillDate;
  public units;
  public abbrev;

  private MapService: MapService;
  private StudyService: StudyService;
  private ChartService: ChartsService;
  private messanger: ToastrService;

  private showMost: boolean;
  private showMax: boolean;

  private selectedReach: reach;
  private reaches: reach[];
  private hasReaches: boolean = false;
  private selectedUnits: string;
  private setClickedRow: Function;
  private selectedRow: Number;


  public get showResult$(): boolean {
    this.units = this.MapService.unitsOptions;
    this.abbrev = this.MapService.abbrevOptions;

    if (this.StudyService.GetWorkFlow('totResults')) {
      if (!this.hasReaches) {
        if(this.StudyService.isMetric) {
          const reachesCopy = this.deepCopy(this.StudyService.selectedStudy.Results['reaches']);
          const reachList = Object.values(reachesCopy);
          reachList.shift(); // remove first element (one without results)
          this.checkUnits(reachList);
          this.hasReaches = true;
          this.selectedUnits = "metric";
        } else {
          const reachesCopy = this.deepCopy(this.StudyService.selectedStudy.Results['reaches']);
          const reachList = Object.values(reachesCopy);
          reachList.shift(); // remove first element (one without results)
          this.checkUnits(reachList);
          this.hasReaches = true;
          this.selectedUnits = "imperial";
        }
      } // else if (this.hasReaches && this.selectedUnits === "metric") {
      //     if (!this.StudyService.isMetric) {
      //       let reachList = Object.values(this.StudyService.selectedStudy.Results['reaches']);
      //       reachList.shift(); //remove first element (one without results)
      //       this.checkUnits(reachList);
      //       this.selectedUnits = "imperial";
      //     }
      // }
    }
    return (this.StudyService.GetWorkFlow('totResults'));
  }

  public get output$() {
      return this.reaches;
  }

  constructor(toastr: ToastrService, studyservice: StudyService, mapservice: MapService, chartservice: ChartsService) {
    super();
    this.messanger = toastr;
    this.StudyService = studyservice;
    this.MapService = mapservice;
    this.ChartService = chartservice;
    this.setClickedRow = function (index) {
      this.selectedRow = index; // memorise selected row
      this.selectedReach = this.reaches[index] // selected reach
      if (this.reaches[index].ischeked) { // change
        this.reaches[index].ischeked = false;
      } else {
        this.reaches[index]['ischeked'] = true;
      }
    }
  }

  ngOnInit() {
    this.ChartService.display$.subscribe(isShown => {
      this.showMax = isShown.max;
      this.showMost = isShown.most;
    });

    this.StudyService.study$.subscribe(mystudy => {
      this.spillMass = mystudy.SpillMass;
      this.spillDate = mystudy.SpillDate;
    })

  }

  public toDecimals(timeval: string) {
    return (moment.duration(timeval).asHours().toFixed(4));
  }

  public highlightFeature(indx) {
    this.ChartService.noticeAction(indx);
    this.MapService.HighlightFeature('Flowlines', Number(this.output$[indx].name.replace(/^\D+/g, '')));
  }

  private checkUnits(reaches) {
    if(!this.StudyService.isMetric()) {
      const tempreaches = [];

      for (var i = 0; i < reaches.length; i++) {
          const newreach = reaches[i]; // copy jobson output for reach i to newreach

          newreach.parameters[1].value = (reaches[i].parameters[1].value * 35.314666212661).toUSGSvalue();     // real-time discharge from cms to cfs
          newreach.parameters[0].value = (reaches[i].parameters[0].value * 35.314666212661).toUSGSvalue();     // mean annual discharge from cms to cfs
          newreach.parameters[3].value = (reaches[i].parameters[3].value * 0.00000038610215855).toUSGSvalue(); // drainage area from square meters to square miles
          newreach.parameters[4].value = (reaches[i].parameters[4].value * 0.00062137).toUSGSvalue();              // length from meters to miles
          if(newreach.parameters[6]) {  newreach.parameters[6].value = (reaches[i].parameters[6].value * 0.00062137).toUSGSvalue(); }             // cumulative length from meters to miles
          if(newreach.parameters[7]) {  newreach.parameters[7].value = (reaches[i].parameters[7].value * 0.0000022046).toUSGSvalue(); }            // spill mass from milligrams to pounds

          newreach.parameters[0].unit.unit = this.units.imperial['discharge']                    // mean annual discharge
          newreach.parameters[0].unit.abbr = this.abbrev.imperial['discharge']
          newreach.parameters[1].unit.unit = this.units.imperial['discharge']                    // real-time discharge
          newreach.parameters[1].unit.abbr = this.abbrev.imperial['discharge']
          newreach.parameters[2].unit.unit = this.units.imperial['slope']                        // slope
          newreach.parameters[2].unit.abbr = this.abbrev.imperial['slope']
          newreach.parameters[3].unit.unit = this.units.imperial['drainageArea']                 // drainage area
          newreach.parameters[3].unit.abbr = this.abbrev.imperial['drainageArea']
          newreach.parameters[4].unit.unit = this.units.imperial['distance']                     // reach length
          newreach.parameters[4].unit.abbr = this.abbrev.imperial['distance']
          if(newreach.parameters[6]) { newreach.parameters[6].unit.unit = this.units.imperial['distance'] }   // cumulative length
          if(newreach.parameters[6]) { newreach.parameters[6].unit.abbr = this.abbrev.imperial['distance'] }
          if(newreach.parameters[7]) { newreach.parameters[7].unit.unit = this.units.imperial['concentration'] }               // spill mass
          if(newreach.parameters[7]) { newreach.parameters[7].unit.abbr = this.abbrev.imperial['concentration'] }

          newreach.result.equations.vmax.value = (reaches[i].result.equations.vmax.value * 3.2808399).toUSGSvalue(); // m/s to ft/s
          newreach.result.equations.v.value = (reaches[i].result.equations.v.value * 3.2808399).toUSGSvalue(); // m/s to ft/s

          newreach.result.equations.vmax.units = this.abbrev.imperial['velocity']
          newreach.result.equations.v.units = this.abbrev.imperial['velocity']

          tempreaches.push(newreach);
      }
      this.StudyService.selectedStudy.SpillMass = (this.StudyService.selectedStudy.SpillMass * 0.453592).toUSGSvalue();
      this.reaches = tempreaches;
    } else {
      this.reaches = reaches;
    } // keep existing metric units
  }

}
