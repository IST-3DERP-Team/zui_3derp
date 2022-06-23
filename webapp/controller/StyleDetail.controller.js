sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("zui3derp.controller.StyleDetail", {
            
            onInit: function(){
                this.oGeneralTable();
                this.oColorsTable();
                this.oSizesTable();
                this.oProcessesTable();
            },

            oGeneralTable:function(){
                var me = this;
                var oTable = this.getView().byId("generalTable");
            },

            oColorsTable:function(){
                var me = this;
                var oTable = this.getView().byId("colorsTable");
            },

            oSizesTable:function(){
                var me = this;
                var oTable = this.getView().byId("sizesTable");
            },
            oProcessesTable:function(){
                var me = this;
                var oTable = this.getView().byId("processesTable");
            }
        });
    });
