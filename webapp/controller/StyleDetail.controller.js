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

                this._User = 'EMALLARI';
                // this.oVersionsTable();
                // this.oAttachmentsTable();
            },

            _routePatternMatched: function (oEvent) {
                var styleNo = oEvent.getParameter("arguments").styleno;
                this._styleNo = styleNo;
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
                this.getComboBoxData();
                this.oGeneralTable();
                this.oColorsTable();
                this.oSizesTable();
                this.oProcessesTable();
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

            getComboBoxData: function () {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();

                //get Seasons
                var oJSONModel = new sap.ui.model.json.JSONModel();
                var seasonCB = this.getView().byId("seasonCB");
                oModel.setHeaders({
                    sbu: "VER"
                });
                oModel.read("/SeasonSet", {
                    success: function (oData, oResponse) {
                        oJSONModel.setData(oData);
                        seasonCB.setModel(oJSONModel);
                    },
                    error: function (err) { }
                });

                //get Product Types
                var oJSONModel2 = new sap.ui.model.json.JSONModel();
                var prodTypeCB = this.getView().byId("prodTypeCB");
                oModel.setHeaders({
                    sbu: "VER"
                });
                oModel.read("/ProductTypeSet", {
                    success: function (oData, oResponse) {
                        oJSONModel2.setData(oData);
                        oJSONModel2.setSizeLimit(1000);
                        prodTypeCB.setModel(oJSONModel2);
                    },
                    error: function (err) { }
                });

                //get Sales Groups
                var oJSONModel3 = new sap.ui.model.json.JSONModel();
                var salesGroupCB = this.getView().byId("salesGroupCB");
                oModel.setHeaders({
                    username: this._User
                });
                oModel.read("/SalesGroupSet", {
                    success: function (oData, oResponse) {
                        oJSONModel3.setData(oData);
                        oJSONModel3.setSizeLimit(1000);
                        salesGroupCB.setModel(oJSONModel3);
                    },
                    error: function (err) { }
                });

                //get Customer Groups
                var oJSONModel4 = new sap.ui.model.json.JSONModel();
                var customerGroupCB = this.getView().byId("customerGroupCB");
                oModel.setHeaders({
                    username: this._User
                });
                oModel.read("/CustomerGroupSet", {
                    success: function (oData, oResponse) {
                        oJSONModel4.setData(oData);
                        oJSONModel4.setSizeLimit(1000);
                        customerGroupCB.setModel(oJSONModel4);
                    },
                    error: function (err) { }
                });
            },

            
            oGeneralTable:function(){
                var me = this;
                var oTable = this.getView().byId("generalTable");

                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new sap.ui.model.json.JSONModel();
                var oTable = this.getView().byId("generalTable");
                var entitySet = "/StyleAttributesGeneralSet"
                oModel.setHeaders({
                    styleno: this._styleNo
                });
                oModel.read(entitySet, {
                    success: function(oData, oResponse) {
                        oJSONModel.setData(oData);
                        oTable.setModel(oJSONModel, "DataModel");
                    },
                    error: function() { }
                })
            },

            oColorsTable:function(){
                var me = this;
                var oTable = this.getView().byId("colorsTable");

                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new sap.ui.model.json.JSONModel();
                var oTable = this.getView().byId("colorsTable");
                var entitySet = "/StyleAttributesColorSet"
                oModel.setHeaders({
                    styleno: this._styleNo
                });
                oModel.read(entitySet, {
                    success: function(oData, oResponse) {
                        oJSONModel.setData(oData);
                        oTable.setModel(oJSONModel, "DataModel");
                    },
                    error: function() { }
                })
            },

            oSizesTable:function(){
                var me = this;
                var oTable = this.getView().byId("sizesTable");
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new sap.ui.model.json.JSONModel();
                var oTable = this.getView().byId("sizesTable");
                var entitySet = "/StyleAttributesSizeSet"
                oModel.setHeaders({
                    styleno: this._styleNo
                });
                oModel.read(entitySet, {
                    success: function(oData, oResponse) {
                        oJSONModel.setData(oData);
                        oTable.setModel(oJSONModel, "DataModel");
                    },
                    error: function() { }
                })
                
            },

            oProcessesTable:function(){
                var me = this;
                var oTable = this.getView().byId("processesTable");

                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new sap.ui.model.json.JSONModel();
                var oTable = this.getView().byId("processesTable");
                var entitySet = "/StyleAttributesProcessSet"
                oModel.setHeaders({
                    styleno: this._styleNo
                });
                oModel.read(entitySet, {
                    success: function(oData, oResponse) {
                        oJSONModel.setData(oData);
                        oTable.setModel(oJSONModel, "DataModel");
                    },
                    error: function() { }
                })
            },

            oVersionsTable:function(){
                var me = this;
                var oTable = this.getView().byId("versionsTable");
            },

            oAttachmentsTable:function(){
                var me = this;
                var oTable = this.getView().byId("attachmentsTable");
            },

            addGeneralAttr: function() {
                var oModel = this.getView().byId("generalTable").getModel("DataModel");
                var oData = oModel.getProperty('/results');
                oData.push({});

                var oTable = this.getView().byId("generalTable");
                oTable.getBinding("rows").refresh();
            }
        });
    });
