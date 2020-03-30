import { deepCopy } from '../../../shared/extensions/object.DeepCopy';

export class walker extends deepCopy { //parameters

  public comid: number;
  public from: Array<walker>;
  public to: Array<walker>;
  private _touched: boolean;


  constructor(arg: walker) {
    super()
    this.comid = arg.comid
    this.from = arg.from
    this.to = arg.to
  }

  private _init(touched: boolean) {
    this._touched = true;
  }
}
