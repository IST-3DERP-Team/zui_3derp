sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
    "../js/Common",
    "sap/ui/model/json/JSONModel",
    "sap/m/library"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, Common, JSONModel) {
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
                this._sbu = oEvent.getParameter("arguments").sbu;
                this._styleNo = oEvent.getParameter("arguments").styleno;
                this._version = oEvent.getParameter("arguments").version;

                this.getMaterialList("N");
                this.getMaterials();
            },

            getMaterialList:function(assignAuto){
                var me = this;
                var oTable = this.getView().byId("generalTable");

                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new sap.ui.model.json.JSONModel();
                var oTable = this.getView().byId("materialListTable");
                var entitySet = "/StyleMaterialListSet"
                oModel.setHeaders({
                    styleno: this._styleNo,
                    verno: this._version,
                    assign: assignAuto                    
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

            onAssignAutomatic: function() {
                this.getMaterialList("Y");
            },

            onCreateMaterial: function() {
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("materialListTable").getModel("DataModel");
                var oData = oTableModel.getData();
                var oSelected = this.getView().byId("materialListTable").getSelectedIndices();

                var oEntry = {
                    Styleno: this._styleNo,
                    CreateMat: "Y",
                    MatListToItems: [ ]
                }

                for (var i = 0; i < oSelected.length; i++) {

                    var index = oSelected[i];

                    var item = {
                        "Styleno": this._styleNo,
                        "Verno": oData.results[index].Verno,
                        "Seqno": oData.results[index].Seqno,
                        "Matno": oData.results[index].Matno,
                        "Mattyp": oData.results[index].Mattyp,
                        "Gmc": oData.results[index].Gmc,
                        "Matconsump": oData.results[index].Matconsump,
                        "Wastage": oData.results[index].Wastage,
                        "Comconsump": oData.results[index].Comconsump,
                        "Consump": oData.results[index].Consump,
                        "Uom": oData.results[index].Uom,
                        "Supplytyp": oData.results[index].Supplytyp,
                        "Vendorcd": oData.results[index].Vendorcd,
                        "Currencycd": oData.results[index].Currencycd,
                        "Unitprice": oData.results[index].Unitprice,
                        "Purgrp": oData.results[index].Purgrp,
                        "Purplant": oData.results[index].Purplant,
                        "Matdesc1": oData.results[index].Matdesc1,
                        "Matdesc2": oData.results[index].Matdesc2,
                        "Deleted": " ",
                        "Createdby": " ",
                        "Createddt": " ",
                        "Updatedby": " ",
                        "Updateddt": " "
                    }
    
                    oEntry.MatListToItems.push(item);
                };

                var path = "/MaterialListSet";

                oModel.create(path, oEntry, {
                    method: "POST",
                    success: function(oData, oResponse) {
                        me.getMaterialList("Y");
                        Common.showMessage("Saved");
                    },
                    error: function(err) {
                        Common.showMessage("Error");
                    }
                });
            },

            onSaveMaterialList: function() {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("materialListTable").getModel("DataModel");
                var path;

                var oData = oTableModel.getData();

                var oEntry = {
                    Styleno: this._styleNo,
                    CreateMat: "N",
                    MatListToItems: [ ]
                }

                for (var i = 0; i < oData.results.length; i++) {

                    var item = {
                        "Styleno": this._styleNo,
                        "Verno": oData.results[i].Verno,
                        "Seqno": oData.results[i].Seqno,
                        "Matno": oData.results[i].Matno,
                        "Mattyp": oData.results[i].Mattyp,
                        "Gmc": oData.results[i].Gmc,
                        "Matconsump": oData.results[i].Matconsump,
                        "Wastage": oData.results[i].Wastage,
                        "Comconsump": oData.results[i].Comconsump,
                        "Consump": oData.results[i].Consump,
                        "Uom": oData.results[i].Uom,
                        "Supplytyp": oData.results[i].Supplytyp,
                        "Vendorcd": oData.results[i].Vendorcd,
                        "Currencycd": oData.results[i].Currencycd,
                        "Unitprice": oData.results[i].Unitprice,
                        "Purgrp": oData.results[i].Purgrp,
                        "Purplant": oData.results[i].Purplant,
                        "Matdesc1": oData.results[i].Matdesc1,
                        "Matdesc2": oData.results[i].Matdesc2,
                        "Deleted": " ",
                        "Createdby": " ",
                        "Createddt": " ",
                        "Updatedby": " ",
                        "Updateddt": " "
                    }
    
                    oEntry.MatListToItems.push(item);
                };

                path = "/MaterialListSet";

                oModel.create(path, oEntry, {
                    method: "POST",
                    success: function(oData, oResponse) {
                        me.getMaterialList("N");
                        Common.showMessage("Saved");
                    },
                    error: function(err) {
                        Common.showMessage("Error");
                    }
                });
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