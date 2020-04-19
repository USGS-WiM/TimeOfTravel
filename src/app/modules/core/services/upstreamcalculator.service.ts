import { Injectable } from '@angular/core';
import { square } from '@turf/turf';

@Injectable({
  providedIn: 'root'
})
export class UpstreamcalculatorService {

  public upstreamTOT() {
  }

  public relativeDrainge(D, MAF) { //D units (m), MAF units (m3/s)
    let D_a: number;
    D_a = (D ^ 1.25) * (4.905) / MAF;
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
    V_p = 0.02 + 0.051 * this.relativeDrainge(D, MAF) ^ 0.821 * relativeDis ^ (-0.465) * q / D;
    return V_p;
  }

  public peakTimeofTravel(L, q, MAF, D) { //L - km
    let T_p: number;
    T_p = L * 1000 / (3600 * this.peakVelocity(q, MAF, D));
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
    C_up = 857 * this.peakTimeofTravel(L, q, MAF, D) ^ (-0.76) * relativeDis ^ (-0.079);
    return C_up;
  }

  public leadingEdge(L, q = 0, MAF, D) {
    return (this.peakTimeofTravel(L, q, MAF, D) * 0.89);
  }

  public trailingEdge(L, q = 0, MAF, D) {
    return (2 * 10 ^ 6 / this.unitPeakConcentration(L, q, MAF, D));
  }

  public passageTime(L, q = 0, MAF, D) {
    return (this.leadingEdge(L, q, MAF, D) + this.trailingEdge(L, q, MAF, D));
  }


  constructor() { }
}
