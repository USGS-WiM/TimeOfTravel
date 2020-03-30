import { Injectable } from '@angular/core';
import { Study } from '../models/study';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, Subject } from 'rxjs';
import { reach } from '../models/reach';

export interface UnitsArray { name: string, isactive: boolean };

export interface workflowControl {
    reachedZoom: boolean;
    hasMethod: boolean;
    hasPOI: boolean;
    hasReaches: boolean;
    hasDischarge: boolean;
    totResults: boolean;
    onInit: boolean;
  }
 
@Injectable()
export class StudyService  {


  //HOLDS DISCHARGE AND MASS;
    public selectedStudy: Study;
    private SelectedReturn = new Subject<Study>();
    study$ = this.SelectedReturn.asObservable();

  //SET MASS
    public setConcentration(mass) {
        this.selectedStudy.SpillMass = mass;
        this.SelectedReturn.next(this.selectedStudy);
    }
  //SET DISCHARGE
    public setDischarge(discharge) {
      this.selectedStudy.Discharge = discharge;
      this.SelectedReturn.next(this.selectedStudy);
  }

  //SET TIME
  public setDate(datestring) {
    this.selectedStudy.SpillDate = datestring;
    this.SelectedReturn.next(this.selectedStudy);
  }

    public WorkFlowControl: Subject<workflowControl> = new Subject<any>();
    public ReportOptions: Array<any>;
    public distance: number;
    private messager: ToastrService;

    private ResultReturn = new Subject<boolean>();
    return$ = this.ResultReturn.asObservable();

    public defDischarge = "cubic meters per second";
    public defConcentration = "kilograms";

    private selectedProcedure = new Subject<number>();
    procedureType$ = this.selectedProcedure.asObservable();

    public unitS = {
      "metric": {
        "discharge": "cubic meters per second",
        "drainageArea": "square meters",
        "distance": "meters",
        "concentration": "kilograms",
        "slope": "meters/meters"
      },
      "imperial": {
        "discharge": "cubic feet per second",
        "drainageArea": "square miles",
        "distance": "miles",
        "concentration": "pounds",
        "slope": "feet/feet"
      }
    };
    public abbrev = {
      "metric": {
        "discharge": "cms",
        "drainageArea": "m^2",
        "distance": "m",
        "concentration": "kg",
        "slope": "m/m"
      },
      "imperial": {
        "discharge": "cfs",
        "drainageArea": "mi^2",
        "distance": "mi",
        "concentration": "lbs",
        "slope": "ft/ft"
      }
    }
    private UnitsReturn = new Subject<string>();
    units$ = this.UnitsReturn.asObservable();

    private _workflow: workflowControl = { reachedZoom: false, hasMethod: false, hasPOI: false, hasReaches: false, hasDischarge: false, totResults: false, onInit: true };

    public units: UnitsArray[] = [
      { name: "metric", isactive: true },
      { name: "imperial", isactive: false }
    ];

    constructor(toastr: ToastrService) {
        this.messager = toastr;
        this.WorkFlowControl.next(this._workflow);
        this.distance = 100;
        this.UnitsReturn.next('metric');
        this.selectedProcedure.next(1);
    }

    public setUnits(unit: string) {
      this.defDischarge = this.unitS[unit].discharge;
      this.defConcentration = this.unitS[unit].concentration;
    }

    public isMetric(): boolean {
      let tf;
      this.units.forEach(j => {
        if (j.isactive) {
          if (j.name === 'imperial') {
            tf = false;
          }
          else tf = true;
        } else {}
      })
      return tf;
    }

    public get checkingDelineatedPoint(): boolean {
        return (this._workflow.hasPOI && !this._workflow.hasReaches);
    }

    public SetWorkFlow(step, tf){
        this._workflow[step] = tf;
        this.WorkFlowControl.next(this._workflow);
    }

  public noticeAction(action: boolean) {
      this.ResultReturn.next(action);
    }

    public GetWorkFlow(step) {
      if (this._workflow["totResults"]) {

        this.noticeAction(true);
      }
        return this._workflow[step];
    }


  public setProcedure(indx: number) {
      this.selectedProcedure.next(indx);
    }

    public ResetWorkFlow() {
        for(let i in this._workflow) {
           this._workflow[i] = false;
        }
        this.WorkFlowControl.next(this._workflow);
    }
}
