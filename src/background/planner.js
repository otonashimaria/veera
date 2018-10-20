/*globals PlannerData:true, SUPPLYTYPE, Supplies*/

window.Planner = {
    createPlan: function (series, wtype, element, start, end) {
        var plan = [];

        //find() function for duplicate items in steps (this) in planned items (entry)
        function equalID(entry) {
            return entry.id == this.id;
        }

        for (let key of Object.keys(PlannerData[series])) {
             var itemArray,
                 templateKey,
                 t;
             switch (key) {
                 case "core":
                     itemArray = PlannerData[series].core;
                     break;
                 case "wtype":
                     t = PlannerData[series].wtype.templates || [];
                     itemArray = t.concat(PlannerData[series].wtype[wtype]);
                     templateKey = wtype;
                     break;
                 case "element":
                     t = PlannerData[series].element.templates || [];
                     itemArray = t.concat(PlannerData[series].element[element]);
                     templateKey = element;
                     break;
                 case "stepNames":
                     continue;
                 default:
                     deverror("Internal data error (Planner). Given: ", key);
                     return;
             }

            if (itemArray) {
                 for (let item of itemArray) {
                    if (start < item.step) { //start is exclusive (we already have it!)
                        if (item.step <= end) { //see else
                            if (item.isTemplate) { //Dealing with templates
//                                item = createItemFromTemplate(item, templateKey);
                                item.id = item.id[templateKey];
                            }
                            var plannedItem = plan.find(equalID, item);
                            if (plannedItem) {
                                plannedItem.needed += item.needed;
                            }
                            else {
                                var supplydata = Supplies.getData(item.type, item.id);
                                if (supplydata) {
                                    plan.push({type: item.type,
                                               id: item.id,
                                               name: supplydata.name,
                                               needed: item.needed,
                                               current: supplydata.count
                                              });
                                }
                            }
                        }
                        else {  //early term when not finished build. WARN: Assumes step-ordered data & loop.
                            break;
                        }
                    }
                 }
            }
        }

        return plan;
    },
    listSeries: function() {
        return Object.keys(PlannerData);
    },
    listTypes: function(series) {
        if (PlannerData[series]) {
            return Object.keys(PlannerData[series].wtype);
        }
    },
    listElements: function(series) {
        if (PlannerData[series]){
            return Object.keys(PlannerData[series].element);
        }
    },
    listSteps: function(series) {
        if (PlannerData[series]) {
            return PlannerData[series].stepNames;
        }
    },
    getSeriesOptions: function (series) {    
        return {types: this.listTypes(series),
                elements: this.listElements(series),
                steps: this.listSteps(series)};
    }
};


//DBG/Build data: Find by name, use with Supply
function fi(s){
    var ret = []; 
    for (let item of Object.keys(Supplies.treasure.index)) {
        if(Supplies.treasure.index[item].name.toLowerCase().indexOf(s.toLowerCase())!=-1){
            ret.push(Supplies.treasure.index[item].name);
            ret.push(item);
        }
    } 
    return ret;
}