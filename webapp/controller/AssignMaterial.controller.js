sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
    "../js/Common",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, Common, JSONModel, History) {
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

                this._materialListChanged = false;

                this.setChangeStatus(false);

                this.getMaterialList();
                this.getMaterials();
            },

            setChangeStatus: function(changed) {
                // sap.ushell.Container.setDirtyFlag(changed);
            },

            getMaterialList:function(){
                var me = this;
                var oTable = this.getView().byId("generalTable");

                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var oTable = this.getView().byId("materialListTable");

                Common.openLoadingDialog(that);

                var entitySet = "/StyleMaterialListSet"
                
                oModel.setHeaders({
                    styleno: this._styleNo,
                    verno: this._version                  
                });
                oModel.read(entitySet, {
                    success: function(oData, oResponse) {
                        oJSONModel.setData(oData);
                        oTable.setModel(oJSONModel, "DataModel");
                        Common.closeLoadingDialog(that);
                    },
                    error: function() { 
                        Common.closeLoadingDialog(that);
                    }
                })
            },

            getMaterials: function() {
                var oView = this.getView();
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();

                Common.openLoadingDialog(that);

                var entitySet = "/MaterialNoSet"
                
                oModel.read(entitySet, {
                    success: function(oData, oResponse) {
                        oJSONModel.setData(oData);
                        oView.setModel(oJSONModel, "MaterialsModel");
                        Common.closeLoadingDialog(that);
                    },
                    error: function() { 
                        Common.closeLoadingDialog(that);
                    }
                })
            },

            onAssignAutomatic: function() {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTable = this.getView().byId("materialListTable");
                var oTableModel = oTable.getModel("DataModel");
                var oData = oTableModel.getData();
                var oSelected = this.getView().byId("materialListTable").getSelectedIndices();
                var oJSONModel = new JSONModel();

                if(oSelected.length > 0) {
                    var oEntry = {
                        Styleno: this._styleNo,
                        Sbu: this._sbu,
                        Mode: "ASSIGN",
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
                            "Bommatid": oData.results[index].Bommatid,
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
                    Common.openLoadingDialog(that);

                    var path = "/MaterialListSet";

                    oModel.create(path, oEntry, {
                        method: "POST",
                        success: function(oDataReturn, oResponse) {
                            var oReturnItems = oDataReturn.MatListToItems.results;
                            for (var i = 0; i < oData.results.length; i++) {
                                var seqno = oData.results[i].Seqno;
                                var item = oReturnItems.find((result) => result.Seqno === seqno);
                                if(item !== undefined) {
                                    try {
                                        if(item.Matno !== "") {
                                            oData.results[i].Matno = item.Matno;
                                        }
                                    } catch(err) {}
                                }
                                // var itemReturn = oReturnItems.find((item) => oReturnItems.Seqno === seqno);
                                // console.log(itemsReturn);
                            }
                            // me.getMaterialList();
                            oJSONModel.setData(oData);
                            oTable.setModel(oJSONModel, "DataModel");
                            Common.closeLoadingDialog(that);
                            me.onMaterialListChange();
                        },
                        error: function(err) {
                            Common.closeLoadingDialog(that);
                            Common.showMessage("Error");
                        }
                    });
                } else {
                    Common.showMessage('No selected items');
                }
            },

            onCreateMaterial: function() {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTable = this.getView().byId("materialListTable");
                var oTableModel = oTable.getModel("DataModel");
                var oData = oTableModel.getData();
                var oSelected = this.getView().byId("materialListTable").getSelectedIndices();
                var oJSONModel = new JSONModel();

                if(oSelected.length > 0) {

                    var oEntry = {
                        Styleno: this._styleNo,
                        Sbu: this._sbu,
                        Mode: "CREATE",
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
                            "Bommatid": oData.results[index].Bommatid,
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
                    Common.openLoadingDialog(that);

                    var path = "/MaterialListSet";

                    oModel.create(path, oEntry, {
                        method: "POST",
                        success: function(oDataReturn, oResponse) {
                            // me.getMaterialList();
                            var oReturnItems = oDataReturn.MatListToItems.results;
                            for (var i = 0; i < oData.results.length; i++) {
                                var seqno = oData.results[i].Seqno;
                                var item = oReturnItems.find((result) => result.Seqno === seqno);
                                if(item !== undefined) {
                                    try {
                                        if(item.Matno !== "") {
                                            oData.results[i].Matno = item.Matno;
                                        }
                                    } catch(err) {}
                                }
                                // var itemReturn = oReturnItems.find((item) => oReturnItems.Seqno === seqno);
                                // console.log(itemsReturn);
                            }
                            // me.getMaterialList();
                            oJSONModel.setData(oData);
                            oTable.setModel(oJSONModel, "DataModel");
                            Common.closeLoadingDialog(that);
                            me.onMaterialListChange();
                            // Common.showMessage("Saved");
                        },
                        error: function(err) {
                            Common.closeLoadingDialog(that);
                            Common.showMessage("Error");
                        }
                    });

                } else {
                    Common.showMessage('No items selected');
                }
            },

            onMaterialListChange: function () {
                this._materialListChanged = true;
                this.setChangeStatus(true);
            },

            onSaveMaterialList: function() {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("materialListTable").getModel("DataModel");
                var path;

                if (!this._materialListChanged) {
                    Common.showMessage('No changes made');
                } else {

                    var oData = oTableModel.getData();

                    var oEntry = {
                        Styleno: this._styleNo,
                        Sbu: this._sbu,
                        Mode: "",
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
                            "Bommatid": oData.results[i].Bommatid,
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
                    Common.openLoadingDialog(that);

                    path = "/MaterialListSet";

                    oModel.create(path, oEntry, {
                        method: "POST",
                        success: function(oData, oResponse) {
                            me.getMaterialList();
                            Common.closeLoadingDialog(that);
                            Common.showMessage("Saved");
                            // me.onMaterialListChange();
                            me._materialListChanged = false;
                            this.setChangeStatus(false);
                        },
                        error: function(err) {
                            Common.closeLoadingDialog(that);
                            Common.showMessage("Error");
                        }
                    });

                }
            },

            onNavBack: function () {
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();
    
                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    // var oRouter = this.getOwnerComponent().getRouter();
                    // oRouter.navTo("RouteStyles");
                }
            },

            onMaterialValueHelp : function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                var gmc = oData.getProperty('Gmc');
                this.inputId = oEvent.getSource().getId();
                // create value help dialog
                if (!this._valueHelpDialog) {
                    this._valueHelpDialog = sap.ui.xmlfragment(
                        "zui3derp.view.fragments.Materials",
                        this
                    );
                    this.getView().addDependent(this._valueHelpDialog);
                }
                this._valueHelpDialog.getBinding("items").filter([new Filter("Gmc", sap.ui.model.FilterOperator.EQ, gmc)]);
                this._valueHelpDialog.open(sInputValue);
            },

            _handleValueHelpSearch : function (evt) {
                var sValue = evt.getParameter("value");
                var oFilter = new Filter(
                    "DescEn",
                    sap.ui.model.FilterOperator.Contains, sValue
                );
                evt.getSource().getBinding("items").filter([oFilter]);
            },
    
            _handleValueHelpClose : function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    that.onMaterialListChange();
                    var productInput = this.byId(this.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                }
                evt.getSource().getBinding("items").filter([]);
            }
        })
    })