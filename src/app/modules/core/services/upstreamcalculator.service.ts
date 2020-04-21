import { Injectable } from '@angular/core';
import { square } from '@turf/turf';
import { Toast, ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UpstreamcalculatorService {
  private messanger: ToastrService;


  public upstreamTOT() {
  }

  public relativeDrainge(D, MAF) { //D units (m), MAF units (m3/s)
    let D_a: number;
    D_a = (Math.pow(D, 1.25) * 3.13209) / MAF;
    return D_a;
  }

  
  public relativeDischarge( q = 0, MAF = 0) { //q units (m3/s), MAF units (m3/s)
    let Q_a: number;
    if (q > 0) {
      Q_a = q / MAF;
    } else {
      Q_a = 1;
    }
    return Q_a;
  }

  public peakVelocity(q, MAF, D) {//D units (m), q units (m3/s), MAF units (m3/s)
    let V_p: number;
    let relativeDis: number;
    if (q > 0) {
      relativeDis = this.relativeDischarge( q, MAF); 
    } else {
      relativeDis = this.relativeDischarge();
    }
    V_p = 0.02 + 0.051 * Math.pow(this.relativeDrainge(D, MAF),  0.821) * Math.pow (relativeDis, -0.465) * q / D;
    return V_p;
  }

  public peakTimeofTravel(L, q, MAF, D) { //L units (km), q units (m3/s), MAF units (m3/s), D units (m)
    let T_p: number;
    T_p = (L * 1000) / (3600 * this.peakVelocity(q, MAF, D));
    
    return T_p;
  }

  public unitPeakConcentration(L, q, MAF, D) {
    let C_up: number;
    let relativeDis: number;
    if (q > 0) {
      relativeDis = this.relativeDischarge(q, MAF);
    } else {
      relativeDis = this.relativeDischarge();
    }
    C_up = 857 * Math.pow (this.peakTimeofTravel(L, q, MAF, D), (-0.76) * Math.pow (relativeDis,(-0.079)));
    return C_up;
  }

  public leadingEdge(L, q = 0, MAF, D) {
    return (this.peakTimeofTravel(L, q, MAF, D) * 0.89);
  }

  public trailingEdge(L, q = 0, MAF, D) {
    return ((2 * Math.pow (10, 6)) / (this.unitPeakConcentration(L, q, MAF, D)*3600));
  }

  public passageTime(L, q = 0, MAF, D) {
    return ((this.leadingEdge(L, q, MAF, D) + this.trailingEdge(L, q, MAF, D)));
  }

  //Unit test according to jobsons example in the report, page 23
  public passageTimeTest(L = 0, q = 0, MAF= 0, D= 0) {
    q = 1068;
    MAF = 730;
    D = 48* Math.pow(10, 9);
    L = 104.8;

    let Q_r = (this.relativeDischarge(q, MAF)).toFixed(2);
    if (Q_r != "1.46") {
      this.messanger.show("Failed unit test, relative discharge");
    } else {
      this.messanger.show("Passed unit test, relative discharge");
    }

    let D_r = (this.relativeDrainge(D, MAF)).toFixed(2);
    if (D_r != "96396867095.29") {
      this.messanger.show("Failed unit test, compute relative drainage");
    } else {
      this.messanger.show("Passed unit test, relative drainage");
    }

    let P_v = this.peakVelocity(q, MAF, D).toFixed(2);
    if (P_v != "1.01") {
      this.messanger.show("Failed unit test, compute peak velocity");
    } else {
      this.messanger.show("Passed unit test, compute peak velocity");
    }

    let P_tot = this.peakTimeofTravel(L, q, MAF, D).toFixed(1);
    if (P_tot != "28.8") {
      this.messanger.show("Failed unit test, peak till time of travel");
    } else {
      this.messanger.show("Passed unit test, peak till time of travel")
    }

    let C_u = this.unitPeakConcentration(L, q, MAF, D).toFixed(1);
    if (C_u != "71.9") {
      this.messanger.show("Failed unit test,  unit peak concentration");
    } else {
      this.messanger.show("Passed unit test, unit peak concentration");
    }

    let T_l = this.leadingEdge(L, q, MAF, D).toFixed(1);
    if (T_l != "25.6") {
      this.messanger.show("Failed unit test,  time of leading edge");
    } else {
      this.messanger.show("Passed unit test,  time of leading edge");
    }
    let T_p = this.trailingEdge(L, q, MAF, D).toFixed(1);
    if (T_p != "7.7") {
      this.messanger.show("Failed unit test,  time of trailing edge");
    } else {
      this.messanger.show("Passed unit test, time of trailing edge");
    }
    let TOT = this.passageTime(L, q, MAF, D).toFixed(1);
    if (TOT != "33.4") {
      this.messanger.show("Failed unit test,  time of passage");
    } else {
      this.messanger.show("Passed unit test, time of passage");
    }  
  }

  constructor(private http: HttpClient, toastr: ToastrService) {
    this.messanger = toastr;
  }
}
