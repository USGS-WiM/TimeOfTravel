import { Component } from '@angular/core';
import { StudyAreaService } from '../../services/studyArea.service';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import * as messageType from "../../../../shared/messageType";
import {MapService} from '../../services/map.services';
import { MatDialog, MatButtonToggleDefaultOptions } from '@angular/material';
import { CommonModule } from "@angular/common"
// import {MatExpansionModule} from '@angular/material/expansion';

@Component({
  selector: 'tot-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  providers: []
})


export class SidebarComponent {
  private MapService:MapService;
  private StudyAreaService:StudyAreaService;
  public AvailableScenarioTypes
  public dialog: MatDialog;
  public Collapsed:boolean;
  public SelectedProcedureType: ProcedureType;

  ishiddenMapLayer = true;
  ishiddenBasemaps = true;
  ishiddenOverlay = false;
  ishiddenIdentifyArea = false;

  public SelectScenario = false;
  public ReportIsActive = false;


  public get SelectedStudyArea() {return ""}
  public get SelectedScenarioType() { return "" }

  public get ZoomLevel():number{
    if (this.MapService.CurrentZoomLevel > 9) {
      //this.barButtonOptions_downstream.disabled = false;
      this.toggleButton = false;
      //this.SelectScenario = true;
      //this.ReportIsActive = true;
    } else {
      //this.SelectScenario = false;
      //this.ReportIsActive = false;
    }
    return this.MapService.CurrentZoomLevel;
  }

  private messanger:ToastrService;
  private toggleButton = true;

  public barButtonOptions_downstream: MatProgressButtonOptions;
  public barButtonOptions_upstream: MatProgressButtonOptions;
  public baselayers = [];
  public overlays = [];
  public model;

  constructor(mapservice:MapService, toastr: ToastrService) {
    this.messanger = toastr;
    this.MapService = mapservice;
   }

  ngOnInit() {

     this.barButtonOptions_downstream = {
      active: false,
      text: 'Spill Response',
      spinnerSize: 18,
      raised: true,
      stroked: false,
      buttonColor: 'primary',
      spinnerColor: 'accent',
      fullWidth: true,
      disabled: this.ZoomLevel < 10,
      mode: 'indeterminate'
    }

    this.barButtonOptions_upstream = {
      active: false,
      text: 'Spill Planning',
      spinnerSize: 18,
      raised: true,
      stroked: false,
      buttonColor: 'primary',
      spinnerColor: 'accent',
      fullWidth: true,
      disabled: true,
      mode: 'indeterminate'
    }

    this.MapService.LayersControl.subscribe(data => {
      if (this.overlays.length > 0 || this.baselayers.length > 0) {
        this.overlays = []
        this.baselayers = []
      }
      this.overlays = data.overlays;
      this.baselayers = data.baseLayers;
    })

    this.model = {
      baselayers: {},
      overlays: {}
    };
  }

  public SetBaselayer(LayerName: string) {
    this.MapService.SetBaselayer(LayerName)
  }

  public SetOverlay(LayerName: string) {
    this.MapService.SetOverlay(LayerName)
  }

  //#region "Methods"
  public SetScenarioType(ScenarioType:string) {
    if (ScenarioType = "Response") {
      this.StudyAreaService.selectedStudyArea.methodType = ScenarioType;
      //this.MapService.changeCursor("crosshair-cursor-enabled");
      this.barButtonOptions_downstream.buttonColor = 'accent';
    } else if (ScenarioType = "Spill Planning") {
      
    }
    this.SelectScenario = true; //activate scenario
  }
  
  public SetProcedureType(pType:ProcedureType){
    if(!this.canUpdateProcedure(pType)) return;
    this.SelectedProcedureType = pType;
  }
  
  public ToggleSideBar(){
    if (this.Collapsed) this.Collapsed = false;
            else this.Collapsed = true; 
  }

  /* public openDialog() {
    let dialog = this.dialog.open(ModalComponent, {
      width: '40%',
      height: '90%',
      disableClose: true
    });
    dialog.afterClosed().subscribe(result => {
      this.mapReady = true;
    });
  } */

  public toggleLayer(newVal: string) {
    /* this.MapService.chosenBaseLayer = newVal;
    this.MapService.map.removeLayer(this.MapService.baseMaps['OpenStreetMap']);
    this.MapService.map.removeLayer(this.MapService.baseMaps['Topo']);
    this.MapService.map.removeLayer(this.MapService.baseMaps['Terrain']);
    this.MapService.map.removeLayer(this.MapService.baseMaps['Satellite']);
    this.MapService.map.removeLayer(this.MapService.baseMaps['Gray']);
    this.MapService.map.removeLayer(this.MapService.baseMaps['Nautical']);
    this.MapService.map.addLayer(this.MapService.baseMaps[newVal]); */
}
  //#endregion

  //#region "Private methods"
  private init(){
    this.SelectedProcedureType = ProcedureType.IDENTIFY; 
  }
  private canUpdateProcedure(pType: ProcedureType): boolean {
    try {               
        switch (pType) {
            case ProcedureType.MAPLAYERS:
                 return true;
            case ProcedureType.IDENTIFY:
                return true;
            case ProcedureType.SCENARIO:
                if (!this.SelectScenario) {
                  this.SelectScenario = false;
                  throw new Error("Can not proceed until study area options are selected.");
                }
                return true;
            case ProcedureType.REPORT:
                if(!this.SelectScenario) {
                  this.SelectScenario = false;
                  throw new Error("Can not proceed until study area options are selected.")
                } else if(!this.SelectedScenarioType) {
                  this.ReportIsActive = false;
                  throw new Error("Can not proceed until Scenario options are selected.")
                }
                return true;
            default:
                return false;
        }//end switch          
    }
    catch (e) {
        this.sm(e.message,messageType.WARNING);         
        return false;
    }
  }
  private sm(msg: string, mType:string = messageType.INFO,title?:string,timeout?:number) {
    try {
      let options:Partial<IndividualConfig> = null;
      if(timeout) options ={timeOut:timeout};

      this.messanger.show(msg,title,options, mType)
    }
    catch (e) {
    }
  }
  //#endregion
}

enum ProcedureType{
  MAPLAYERS = 0,
  IDENTIFY = 1,
  SCENARIO = 2,
  REPORT = 3
}
