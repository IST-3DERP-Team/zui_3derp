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
            
            onInit: function() {
                var oComponent = this.getOwnerComponent();
                this._router = oComponent.getRouter();
                this._router.getRoute("RouteStyleDetail").attachPatternMatched(this._routePatternMatched, this);
              
                this.oGeneralTable();
                this.oColorsTable();
                this.oSizesTable();
                this.oProcessesTable();
            },

            _routePatternMatched: function (oEvent) {
                var styleNo = oEvent.getParameter("arguments").styleno;
                if(styleNo === "NEW") {
                    var oJSONModel = new JSONModel();
                    var data = {
                        "Styleno": "New Style",
                        "Statuscd": "CRT"
                    };                    
                    oJSONModel.setData(data);
                    this.getView().setModel(oJSONModel, "headerData");

                } else {
                    this.getHeaderData(styleNo);
                }
            },

            getHeaderData: function(styleNo) {
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new sap.ui.model.json.JSONModel();
                var oView = this.getView();

                var entitySet = "/StyleDetailSet('" + styleNo + "')"

                oModel.read(entitySet, {
                    success: function(oData, oResponse) {
                        oJSONModel.setData(oData);
                        oView.setModel(oJSONModel, "headerData");
                    },
                    error: function() { }
                })

            },

            addGeneralAttr: function() {
                
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
