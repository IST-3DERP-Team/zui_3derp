sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/library",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel) {
        "use strict";
        

        return Controller.extend("zui3derp.controller.Styles", {
            onInit: function () {
                console.log("from styles")
            },

            onAfterRender: function(){
                var oTable = this.getView().byId("idMyTable");
                for (i = 0; i < s; i++) {
                    var oColumn = new sap.m.Column("col" + i, {
                        width: "1em",
                        header: new sap.m.Label({
                            text: "Data No. "+i
                        })
                    });
                    oTable.addColumn(oColumn);
                }
                var oCell = [];
                for (i = 0; i < s; i++) {
                    if (i === 0) {
                        var cell1 = new sap.m.Text({
                            text: "Cell No. "+i
                        });
                    }
                oCell.push(cell1);
                }
                var aColList = new sap.m.ColumnListItem("aColList", {
                    cells: oCell
                });

                oTable.bindItems("<entityset>", aColList);
            }
            
        });
        
    });
