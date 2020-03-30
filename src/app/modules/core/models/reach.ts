export class reach {
    public description: string;
    public id: number;
    public name: string;
    public parameters:Array<any>;
    public reaches: any = {}; //initial input from the service
    public result: any = {};
    public ischeked: boolean;

    constructor(arg:reach) {
        arg = arg.reaches[0];
        this.description = arg.description;
        this.id = arg.id;
        this.name = arg.name;
        this.parameters = [];
        this._init(arg.parameters);
        this.ischeked = false;
    }
    

    private _init (paramlist: Array<any>) { //paramlist should be one from the reference class ? how to bring it here ?
        for (let i = 0; i < paramlist.length; i ++){
            let newparam = {};
            for (let  mykey in paramlist[i] ){ //deep copy constructor
                newparam[mykey] = paramlist[i][mykey]; // parameters[key 1][val 1] (key1: val1) //{units: }
            }

            if (newparam["value"] == undefined){ //if there is no value key  in the dictionary --> add key
                newparam["value"] = undefined;
            }

            if (newparam["required"] == undefined){
                newparam["required"] = false;
            }
            this.parameters.push(newparam);
        };
    } //type of array with anything
}
