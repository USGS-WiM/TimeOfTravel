import { StudyService } from '../../services/study.service';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import { reach } from '../../models/reach';
import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label} from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import { ChartsService } from '../../services/charts.service';
import { Subscription } from 'rxjs';

interface chartData {
  id: number,
  label: string,
  value: reach[]
}

@Component({
  selector: 'app-appcharts',
  templateUrl: './appcharts.component.html',
  styleUrls: ['./appcharts.component.scss']
})

export class AppchartsComponent implements OnInit {
  private ChartService: ChartsService;
  private StudyService: StudyService;
  private messanger: ToastrService;
  private subscription: Subscription;
  

  //site grouping disabled;
  isDisabled = false;

  //most probable
  private maxMostProbableY;

  //maximum probable
  private maxMaxProbableY;

  private maxTimeLabels = [];
  private maxConcentration = [];
  private mostTimeLabels = [];
  private mostConcentration = [];
  public buttonName = "MaximumProbable";

  public showMost = true;
  public showMax = false;

  public open() {
    if (this.buttonName == "MostProbable") { //move this to the service;
      this.buttonName = "MaximumProbable";
      this.ChartService.displayAction("most", true);
      this.ChartService.displayAction("max", false);
    } else {
      this.buttonName = "MostProbable";
      this.ChartService.displayAction("most", false);
      this.ChartService.displayAction("max", true);
    }
    this.flushChartData();
    this.getAllMostProbable();
    this.generateData();
    this.chart.update();
    this.chart.updateColors();
  }


  public flushChartData() {
    //most probable
    this.maxMostProbableY = 0;

    //maximum probable
    this.maxMaxProbableY = 0;

    while (this.maxTimeLabels.length > 0) {
      this.maxTimeLabels.pop();
      this.maxConcentration.pop();
      this.mostTimeLabels.pop();
      this.mostConcentration.pop();
      this.maxLineChartData.pop();
      this.mostLineChartData.pop();
    }

    while (this.chart.datasets.length > 0) {
      this.chart.datasets.pop();
    }
    while (this.chart.labels.length > 0) {
      this.chart.labels.pop();
    }
  }


  public chartIsActive(e) {
    
    /*while (e.value.length > 1) {
      e.value.pop();
    }*/
    //just to check

    if (typeof (e) == "undefined") {//if nothing selected, plot all
      return null;
    }
    this.flushChartData();
    this.getAllForGroup(e.value);
    this.generateDataGroup(e.value);
    this.lineChartLegend = true;

    this.mostLineChartOptions.legend = { position: 'left' }
    this.maxLineChartOptions.legend = { position: 'left' }

	// Reverse the data display
	$("#footerData").toggleClass("reverse");
      this.chart.update();
      this.chart.updateColors();
  }

  reaches: reach[];
  reachesGrouped: chartData [];
  selectedGroupId: number;

  public maxLineChartLabels: Array<any> = [];
  public maxLineChartData: ChartDataSets[] = [];

  public mostLineChartLabels: Array<any> = [];
  public mostLineChartData: ChartDataSets[] = [];


  public lineChartLegend = true;
  public lineChartType = 'line';
  public lineChartPlugins = [pluginAnnotations];


  @ViewChild(BaseChartDirective,{ static: false }) chart: BaseChartDirective;
  constructor(toastr: ToastrService, studyservice: StudyService, chartservice: ChartsService) {
    this.messanger = toastr;
    this.StudyService = studyservice;
    this.ChartService = chartservice;
    this.ChartService.displayAction("max", false);
    this.ChartService.displayAction("most", true);
  }
  //Get time all, subscribe to selected row and plot selected one;
  ngOnInit() {
    this.getAllMostProbable();
    this.generateData();

    this.subscription = this.ChartService.display$.subscribe(isShown => {
      this.showMax = isShown.max;
      this.showMost = isShown.most;
    });
  }

  //PARSE ENTIRE DATA RETURN FOR THE CHARTS
  public generateData() {
    let c = 0;
    this.output$.forEach((o => {
      let myarray = [];
      for (let i = 0; i < this.output$.length * 3; i++) {
        myarray.push(null);
      }
      myarray[c] = this.mostConcentration[c];
      myarray[c + 1] = this.mostConcentration[c + 1];
      myarray[c + 2] = this.mostConcentration[c + 2];
      let myobj = { data: myarray, label: o.name }
      this.mostLineChartData.push(myobj);
      c += 3;
    }))

    //for maxConcentration
    c = 0;
    this.output$.forEach((o => {
      let myarray = [];
      for (let i = 0; i < this.output$.length * 3; i++) {
        myarray.push(null);
      }
      myarray[c] = this.maxConcentration[c];
      myarray[c + 1] = this.maxConcentration[c + 1];
      myarray[c + 2] = this.maxConcentration[c + 2];
      let myobj = { data: myarray, label: o.name }
      this.maxLineChartData.push(myobj);
      c += 3;
    }))
    if (this.output$.length <= 5) { this.isDisabled = true; }
    if (this.mostLineChartData.length > 20) { this.lineChartLegend = false; }
  }

  //SELECT AND PARSE DATA ONLY FOR A GROUP
  public generateDataGroup(o) {
    let c = 0;
    o.forEach((o => {
      let myarray = [];
      if (o.length > 1) {
        for (let i = 0; i < o.length * 3; i++) {
          myarray.push(null);
        }
      } else {}
      myarray[c] = this.mostConcentration[c];
      myarray[c + 1] = this.mostConcentration[c + 1];
      myarray[c + 2] = this.mostConcentration[c + 2];
      let myobj = { data: myarray, label: o.name }
      this.mostLineChartData.push(myobj);
      c += 3;
    }))

    //for maxConcentration
    c = 0;
    o.forEach((o => {
      let myarray = [];
      for (let i = 0; i < o.length * 3; i++) {
        myarray.push(null);
      }
      myarray[c] = this.maxConcentration[c];
      myarray[c + 1] = this.maxConcentration[c + 1];
      myarray[c + 2] = this.maxConcentration[c + 2];
      let myobj = { data: myarray, label: o.name }
      this.maxLineChartData.push(myobj);
      c += 3;
    }))
  }


  public get output$() {
    if (this.StudyService.GetWorkFlow('totResults')) {
      this.reaches = Object.values(this.StudyService.selectedStudy.Results['reaches']);
      this.reaches.shift(); //remove first element (one without results)
      this.reachesGrouped = this.splitToarray(this.reaches);//return splitted chart;
      //update chart data;
      return (this.reaches);
    } else {
      return;
    }
  }

  public splitToarray(arr) {
    let size = 5;
    let array = [];
    let tempvar: chartData;
    let id = 0;
    if (arr.length > size) {
      var i, j, temparray;
      for (i = 0, j = arr.length; i < j; i += size) {
        temparray = arr.slice(i, i + size);
        if (temparray.length < 2) {
          array[array.length-1].value.push(temparray);
        } else {
          tempvar = { "id": id, "label": "Reach group #" + id, "value": temparray };
        }
        array.push(tempvar);
        id += 1;
      }
    } else {
      array = arr;
    }
    return (array);
  }

  public getAllForGroup(groupArray) {
    groupArray.forEach((o => {
      this.mostTimeLabels.push(o.result["tracer_Response"].leadingEdge.MostProbable.date);
      this.mostConcentration.push(o.result["tracer_Response"].leadingEdge.MostProbable.concentration);
      this.mostTimeLabels.push(o.result["tracer_Response"].peakConcentration.MostProbable.date);
      this.mostConcentration.push(o.result["tracer_Response"].peakConcentration.MostProbable.concentration);
      this.mostTimeLabels.push(o.result["tracer_Response"].trailingEdge.MostProbable.date);
      this.mostConcentration.push(o.result["tracer_Response"].trailingEdge.MostProbable.concentration);
      this.maxTimeLabels.push(o.result["tracer_Response"].leadingEdge.MaximumProbable.date);
      this.maxConcentration.push(o.result["tracer_Response"].leadingEdge.MaximumProbable.concentration);
      this.maxTimeLabels.push(o.result["tracer_Response"].peakConcentration.MaximumProbable.date);
      this.maxConcentration.push(o.result["tracer_Response"].peakConcentration.MaximumProbable.concentration);
      this.maxTimeLabels.push(o.result["tracer_Response"].trailingEdge.MaximumProbable.date);
      this.maxConcentration.push(o.result["tracer_Response"].trailingEdge.MaximumProbable.concentration);
    }))

    for (var i = 0; i < this.mostTimeLabels.length; i++) {
      this.mostLineChartLabels.push(this.mostTimeLabels[i]);
      this.maxLineChartLabels.push(this.maxTimeLabels[i]);
    }

    this.mostTimeLabels.sort(function (a, b) {
      return (a < b) ? -1 : ((a > b) ? 1 : 0);
    });

    this.maxTimeLabels.sort(function (a, b) {
      return (a < b) ? -1 : ((a > b) ? 1 : 0);
    });
    this.maxMostProbableY = Math.max.apply(Math, this.mostConcentration);
    this.maxMaxProbableY = Math.max.apply(Math, this.maxConcentration);
  }

  public getAllMostProbable() {
    this.output$.forEach((o => {
      this.mostTimeLabels.push(o.result["tracer_Response"].leadingEdge.MostProbable.date);
      this.mostConcentration.push(o.result["tracer_Response"].leadingEdge.MostProbable.concentration);
      this.mostTimeLabels.push(o.result["tracer_Response"].peakConcentration.MostProbable.date);
      this.mostConcentration.push(o.result["tracer_Response"].peakConcentration.MostProbable.concentration);
      this.mostTimeLabels.push(o.result["tracer_Response"].trailingEdge.MostProbable.date);
      this.mostConcentration.push(o.result["tracer_Response"].trailingEdge.MostProbable.concentration);

      this.maxTimeLabels.push(o.result["tracer_Response"].leadingEdge.MaximumProbable.date);
      this.maxConcentration.push(o.result["tracer_Response"].leadingEdge.MaximumProbable.concentration);
      this.maxTimeLabels.push(o.result["tracer_Response"].peakConcentration.MaximumProbable.date);
      this.maxConcentration.push(o.result["tracer_Response"].peakConcentration.MaximumProbable.concentration);
      this.maxTimeLabels.push(o.result["tracer_Response"].trailingEdge.MaximumProbable.date);
      this.maxConcentration.push(o.result["tracer_Response"].trailingEdge.MaximumProbable.concentration);
    }));
    
    for (var i = 0; i < this.mostTimeLabels.length; i++) {
      this.mostLineChartLabels.push(this.mostTimeLabels[i]);
      this.maxLineChartLabels.push(this.maxTimeLabels[i]);
    }

    this.mostTimeLabels.sort(function (a, b) {
      return (a < b) ? -1 : ((a > b) ? 1 : 0);
    });

    this.maxTimeLabels.sort(function (a, b) {
      return (a < b) ? -1 : ((a > b) ? 1 : 0);
    });


    this.maxMostProbableY = Math.max.apply(Math, this.mostConcentration);


    this.maxMaxProbableY = Math.max.apply(Math, this.maxConcentration);
  }

  public mostLineChartOptions: any = {
    responsive: true,
    elements: { line: { tension: 0 } },
    legend: { position: 'left' },
    title: {
      text: 'Most probable Time of Travel',
      display: true
    },
    scales: {
      yAxes: [{
        ticks: {
          max: this.maxMostProbableY,
          min: 0,
        }
      }],
      xAxes: [{
        type: 'time',
        ticks: {
          unit: 'minute',
          unitStepSize: 10,
          displayFormats: {
            'second': 'HH:mm:ss',
            'minute': 'HH:mm:ss',
            'hour': 'HH:mm',
          },
        },
      }],
    },
  };

  public maxLineChartOptions: any = {
    responsive: true,
    elements: { line: { tension: 0 } },
    legend: { position: 'left' },
    title: {
      text: 'Maximum probable Time of Travel',
      display: true
    },
    scales: {
      yAxes: [{
        ticks: {
          max: this.maxMaxProbableY,
          min: 0,
        }
      }],
      xAxes: [{
        type: 'time',
        ticks: {
          unit: 'minute',
          unitStepSize: 10,
          displayFormats: {
            'second': 'HH:mm:ss',
            'minute': 'HH:mm:ss',
            'hour': 'HH:mm',
          },
        },
      }],
    },
  };

  public lineChartColors: Color[] = [];


  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    //console.log(event, active);
  }
  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    //console.log(event, active);
  }
}
