sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
    "sap/m/library",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, JSONModel) {
        "use strict";

        var that;

        return Controller.extend("zui3derp.controller.AssignMaterial", {    
            onInit: function(){
                that = this;  
                var oComponent = this.getOwnerComponent();
                this._router = oComponent.getRouter();
                this._router.getRoute("RouteAssignMaterial").attachPatternMatched(this._routePatternMatched, this);
            },

            _routePatternMatched: function (oEvent) {
                var styleNo = oEvent.getParameter("arguments").styleno;
                var sbu = oEvent.getParameter("arguments").sbu;
                this.getGMCTable();
                this.getMaterials();
            },

            getGMCTable:function(){
                var me = this;
                var oTable = this.getView().byId("generalTable");

                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new sap.ui.model.json.JSONModel();
                var oTable = this.getView().byId("GMCTable");
                var entitySet = "/AssignMaterialSet"
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

            getMaterials: function() {
                var oView = this.getView();
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new sap.ui.model.json.JSONModel();
                var entitySet = "/MaterialNoSet"
                oModel.read(entitySet, {
                    success: function(oData, oResponse) {
                        oJSONModel.setData(oData);
                        oView.setModel(oJSONModel, "MaterialsModel");
                    },
                    error: function() { }
                })
            },

            handleValueHelp : function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
    
                this.inputId = oEvent.getSource().getId();
                // create value help dialog
                if (!this._valueHelpDialog) {
                    this._valueHelpDialog = sap.ui.xmlfragment(
                        "zui3derp.view.fragments.Materials",
                        this
                    );
                    this.getView().addDependent(this._valueHelpDialog);
                }
    
                // create a filter for the binding
                // this._valueHelpDialog.getBinding("items").filter([new Filter(
                //     "MatNo",
                //     sap.ui.model.FilterOperator.Contains, sInputValue
                // )]);
    
                // open value help dialog filtered by the input value
                this._valueHelpDialog.open(sInputValue);
            },

            _handleValueHelpSearch : function (evt) {
                var sValue = evt.getParameter("value");
                var oFilter = new Filter(
                    "MatNo",
                    sap.ui.model.FilterOperator.Contains, sValue
                );
                evt.getSource().getBinding("items").filter([oFilter]);
            },
    
            _handleValueHelpClose : function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = this.byId(this.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                }
                evt.getSource().getBinding("items").filter([]);
            }
        })
    })