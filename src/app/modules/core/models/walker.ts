import { deepCopy } from '../../../shared/extensions/object.DeepCopy';

export class walker extends deepCopy { //parameters
  public comid: any;
  public from: Array<any> = [];
  public to: Array<any> = [];
  public result;
  public drainage: number;
  public length: number;
  public discharge: number;
  public isterminal: false;
}
