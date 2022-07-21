sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
    "../js/Common",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, Common, JSONModel) {
        "use strict";

        var that;
        this._attrValueHelpData;
        var Core = sap.ui.getCore();

        return Controller.extend("zui3derp.controller.StyleDetail", {
            
            onInit: function() {
                that = this;  
                var oComponent = this.getOwnerComponent();
                this._router = oComponent.getRouter();
                this._router.getRoute("RouteStyleDetail").attachPatternMatched(this._routePatternMatched, this);

                this._User = 'EMALLARI';
                this._attrValueHelpData = {
                    Attributes: [],
                    AttributeCodes: [],
                    Processes: [],
                    VASTypes: [],
                    uom: []
                };
            },

            _routePatternMatched: function (oEvent) {
                this._styleNo = oEvent.getParameter("arguments").styleno;
                this._sbu = oEvent.getParameter("arguments").sbu;

                if(this._styleNo === "NEW") {
                    // var oJSONModel = new JSONModel();
                    // var data = {
                    //     "Styleno": "New Style",
                    //     "Statuscd": "CRT"
                    // };                    
                    // oJSONModel.setData(data);
                    // this.getView().setModel(oJSONModel, "headerData");
                    this.setEditMode("NEW");
                    // var detailPanel = this.getView().byId("detailPanel");
                    // detailPanel.setExpanded(false);
                } else {
                //     this.getHeaderData(this._styleNo);
                    this.setEditMode();
                }
                this.getHeaderData();

                this.getHeaderFilterData();
                this.getAttributesFilterData();
                this.getGeneralTable();
                this.getColorsTable();
                this.getSizesTable();
                this.getProcessesTable();
                this.getVersionsTable();
            },

            getHeaderData: function() {
                var styleNo = this._styleNo;
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
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

            onSaveHeader: function() {
                var oModel = this.getOwnerComponent().getModel();
                var me = this;
                var path;

                // oModel.setHeaders({
                //     sbu: this._sbu,
                //     userid: this._User
                // });
                
                var oHeaderModel = this.getView().getModel("headerData");
                var oEntry = oHeaderModel.getData();
                oEntry.Styleno = this._styleNo;
                oEntry.Createdby = "BAS_CONN";
                oEntry.Sbu = this._sbu;
                
                path = "/StyleDetailSet";

                if(this._styleNo === "NEW") {
               
                    oModel.create(path, oEntry, {
                        method: "POST",
                        success: function(oData, oResponse) {
                            Common.showMessage("Saved");
                            var oJSONModel = new JSONModel();
                            me._styleNo = oData.Styleno;
                            // var data = {
                            //     "Styleno": oData.Styleno,
                            //     "Statuscd": "CRT"
                            // };                    
                            oJSONModel.setData(oData);
                            me.getView().setModel(oJSONModel, "headerData");
                            me.getSizesTable();
                            me.getVersionsTable();
                            me.getProcessesTable();
                        },
                        error: function(err) {
                            Common.showMessage("Error");
                        }
                    });

                } else {
                    path = "/StyleDetailSet('" + this._styleNo +  "')";
                    
                    oModel.update(path, oEntry, {
                        method: "PUT",
                        success: function(data, oResponse) {
                            Common.showMessage("Saved");
                            var oJSONModel = new JSONModel();
                            oJSONModel.setData(oData);
                            me.getView().setModel(oJSONModel, "headerData");
                        },
                        error: function() {
                            
                        }
                    });
                }
            },

            getHeaderFilterData: function() {
                var me = this;

                var oSHModel = this.getOwnerComponent().getModel("SearchHelps");
                var oModel = this.getOwnerComponent().getModel();
                oModel.setHeaders({
                    sbu: this._sbu,
                    username: this._User
                });

                //get Seasons
                var oJSONModel0 = new JSONModel();
                var seasonsCB = this.getView().byId("seaonsCB");                
                oModel.read("/SeasonSet", {
                    success: function (oData, oResponse) {
                        oJSONModel0.setData(oData);
                        seasonsCB.setModel(oJSONModel0);
                    },
                    error: function (err) { }
                });

                //get Product Types
                var oJSONModel1 = new JSONModel();
                var prodTypeCB = this.getView().byId("prodTypeCB");
                oModel.read("/ProductTypeSet", {
                    success: function (oData, oResponse) {
                        oJSONModel1.setData(oData);
                        oJSONModel1.setSizeLimit(1000);
                        prodTypeCB.setModel(oJSONModel1);
                    },
                    error: function (err) { }
                });

                //get Style Cat
                var oJSONModel2 = new JSONModel();
                var styleCatCB = this.getView().byId("styleCatCB");
                oModel.read("/StyleCatSet", {
                    success: function (oData, oResponse) {
                        oJSONModel2.setData(oData);
                        oJSONModel2.setSizeLimit(1000);
                        styleCatCB.setModel(oJSONModel2);
                    },
                    error: function (err) { }
                });

                //get Sales Groups
                var oJSONModel3 = new JSONModel();
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
                var oJSONModel4 = new JSONModel();
                var customerGroupCB = this.getView().byId("customerGroupCB");
                oModel.read("/CustomerGroupSet", {
                    success: function (oData, oResponse) {
                        oJSONModel4.setData(oData);
                        oJSONModel4.setSizeLimit(1000);
                        customerGroupCB.setModel(oJSONModel4);
                    },
                    error: function (err) { }
                });
                
                //get Customers
                var oJSONModel5 = new JSONModel();
                var customerInput = this.getView().byId("customerInput");
                var oView = this.getView();
                oSHModel.read("/SoldToCustSet", {
                    success: function (oData, oResponse) {
                        oJSONModel5.setData(oData);
                        customerInput.setModel(oJSONModel5);
                        oView.setModel(oJSONModel5, "CustomersModel")
                    },
                    error: function (err) { }
                });

                //get Size Groups
                var oJSONModel6 = new JSONModel();
                var sizeGroupCB = this.getView().byId("sizeGroupCB");
                oSHModel.read("/SizeGrpSet", {
                    success: function (oData, oResponse) {
                        oJSONModel6.setData(oData);
                        oJSONModel6.setSizeLimit(1000);
                        sizeGroupCB.setModel(oJSONModel6);
                    },
                    error: function (err) { }
                });

                //get UoM
                var oJSONModel7 = new JSONModel();
                var uomCB = this.getView().byId("uomCB");
                oSHModel.read("/UOMSet", {
                    success: function (oData, oResponse) {
                        me._attrValueHelpData.uom = oData.results;
                        oJSONModel7.setData(me._attrValueHelpData);
                        oView.setModel(oJSONModel7, "ValueHelpModel");
                        // oJSONModel7.setData(oData);
                        // oJSONModel7.setSizeLimit(1000);
                        // uomCB.setModel(oJSONModel7);
                    },
                    error: function (err) { }
                });
            },

            getAttributesFilterData: function () {
                var me = this;
                
                var oModel = this.getOwnerComponent().getModel();
                oModel.setHeaders({
                    sbu: this._sbu
                });

                //get Attributes
                var oJSONModel1 = new JSONModel();
                oModel.setHeaders({
                    dispgrp: "STYINFO"
                });
                oModel.read("/AttribTypeSet", {
                    success: function (oData, oResponse) {
                        me._attrValueHelpData.attributes = oData.results;
                        oJSONModel1.setData(me._attrValueHelpData);
                        oView.setModel(oJSONModel1, "ValueHelpModel");
                    },
                    error: function (err) { }
                });

                //get Attribute Codes
                var oJSONModela = new JSONModel();
                var oView = this.getView();
                oModel.read("/AttribCodeSet", {
                    success: function (oData, oResponse) {
                        me._attrValueHelpData.attributecodes = oData.results;
                        oJSONModela.setData(me._attrValueHelpData);
                        oView.setModel(oJSONModela, "ValueHelpModel");
                    },
                    error: function (err) { }
                });



                //Process Codes
                var oJSONModel5 = new JSONModel();
                oModel.read("/ProcessCodeSet", {
                    success: function (oData, oResponse) {
                        me._attrValueHelpData.processes = oData.results;
                        oJSONModel5.setData(me._attrValueHelpData);
                        oView.setModel(oJSONModel5, "ValueHelpModel");
                    },
                    error: function (err) { }
                });

                //VAS Types
                var oJSONModel6 = new JSONModel();
                oModel.read("/VASTypeSet", {
                    success: function (oData, oResponse) {
                        me._attrValueHelpData.vastypes = oData.results;
                        oJSONModel6.setData(me._attrValueHelpData);
                        oView.setModel(oJSONModel6, "ValueHelpModel");
                    },
                    error: function (err) { }
                });

                //Usage Classes
                var oJSONModel7 = new JSONModel();
                oModel.read("/UsageClassSet", {
                    success: function (oData, oResponse) {
                        me._attrValueHelpData.usageclasses = oData.results;
                        oJSONModel7.setData(me._attrValueHelpData);
                        oView.setModel(oJSONModel7, "ValueHelpModel");
                    },
                    error: function (err) { }
                });
            },
            
            getGeneralTable:function(){
                var oTable = this.getView().byId("generalTable");

                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
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

            onSaveGeneralTable: function() {
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("generalTable").getModel("DataModel");
                var path;

                var oData = oTableModel.getData();
                var oEntry = {
                    Styleno: this._styleNo,
                    Type: "GENERAL",
                    AttributesToItems: [ ]
                }

                // for (var i = oData.results.length - 1; i >= 0; i--) {
                for (var i = 0; i < oData.results.length; i++) {
                    
                    var item = {
                        "Styleno": this._styleNo,
                        "Attribtyp": oData.results[i].Attribtyp,
                        "Attribcd": oData.results[i].Attribcd,
                        "Attribgrp": "",
                        "Attribseq": " ",
                        "Baseind": false,
                        "Deleted": " ",
                        "Desc1": oData.results[i].Desc1,
                        "Desc2": " ",
                        "Valuetyp": "STRVAL",
                        "Attribval": " ",
                        "Valunit": " ",
                        "Createdby": " ",
                        "Createddt": " ",
                        "Updatedby": " ",
                        "Updateddt": " "
                    };
    
                    oEntry.AttributesToItems.push(item);
                };

                path = "/AttributesGeneralSet";

                oModel.create(path, oEntry, {
                    method: "POST",
                    success: function(oData, oResponse) {
                        Common.showMessage("Saved");
                    },
                    error: function(err) {
                        Common.showMessage("Error");
                    }
                });
            },

            getColorsTable:function(){
                var oTable = this.getView().byId("colorsTable");

                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
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

            onSaveColorTable: function() {
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("colorsTable").getModel("DataModel");
                var path;

                var oData = oTableModel.getData();
                var oEntry = {
                    Styleno: this._styleNo,
                    Type: "COLOR",
                    AttributesToItems: [ ]                    
                }

                // for (var i = oData.results.length - 1; i >= 0; i--) {
                for (var i = 0; i < oData.results.length; i++) {
                    
                    var item = {
                        "Styleno": this._styleNo,
                        "Attribtyp": "COLOR",
                        "Attribcd": oData.results[i].Attribcd,
                        "Attribgrp": "",
                        "Attribseq": " ",
                        "Baseind": false,
                        "Deleted": " ",
                        "Desc1": oData.results[i].Desc1,
                        "Desc2": " ",
                        "Valuetyp": "STRVAL",
                        "Attribval": " ",
                        "Valunit": " ",
                        "Createdby": " ",
                        "Createddt": " ",
                        "Updatedby": " ",
                        "Updateddt": " "
                    };
    
                    oEntry.AttributesToItems.push(item);
                };

                path = "/AttributesGeneralSet";

                oModel.create(path, oEntry, {
                    method: "POST",
                    success: function(oData, oResponse) {
                        Common.showMessage("Saved");
                    },
                    error: function(err) {
                        Common.showMessage("Error");
                    }
                });
            },

            getSizesTable:function(){
                var oTable = this.getView().byId("sizesTable");
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var oTable = this.getView().byId("sizesTable");
                var entitySet = "/StyleAttributesSizeSet"
                // var oSizeGrp = this.getView().byId("sizeGroupCB").getSelectedKey();
                var oSizeGrp = "G235";
                oModel.setHeaders({
                    styleno: this._styleNo,
                    attribgrp: oSizeGrp
                });
                oModel.read(entitySet, {
                    success: function(oData, oResponse) {
                        oJSONModel.setData(oData);
                        oTable.setModel(oJSONModel, "DataModel");
                    },
                    error: function() { }
                })
                
            },

            onSaveSizeTable: function() {
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("sizesTable").getModel("DataModel");
                var path;
                var lv_baseindctr = 0;

                var oData = oTableModel.getData();
                var oEntry = {
                    Styleno: this._styleNo,
                    Type: "SIZE",
                    AttributesToItems: [ ]                    
                }

                // for (var i = oData.results.length - 1; i >= 0; i--) {
                for (var i = 0; i < oData.results.length; i++) {

                    if(oData.results[i].Baseind === true) {
                        lv_baseindctr++;
                    }
                    
                    var item = {
                        "Styleno": this._styleNo,
                        "Attribtyp": "SIZE",
                        "Attribcd": oData.results[i].Attribcd,
                        "Attribgrp": oData.results[i].Attribgrp,
                        "Attribseq": " ",
                        "Baseind": oData.results[i].Baseind,
                        "Deleted": " ",
                        "Desc1": oData.results[i].Desc1,
                        "Desc2": " ",
                        "Valuetyp": "STRVAL",
                        "Attribval": " ",
                        "Valunit": " ",
                        "Createdby": " ",
                        "Createddt": " ",
                        "Updatedby": " ",
                        "Updateddt": " "
                    };
    
                    oEntry.AttributesToItems.push(item);
                };

                if(lv_baseindctr > 1) {
                    Common.showMessage('Select only 1 Base Indicator');
                } else {

                    path = "/AttributesGeneralSet";

                    oModel.create(path, oEntry, {
                        method: "POST",
                        success: function(oData, oResponse) {
                            Common.showMessage("Saved");
                        },
                        error: function(err) {
                            Common.showMessage("Error");
                        }
                    });
                }
            },

            // onSaveSizeTable: function() {
            //     var me = this;
            //     var oModel = this.getOwnerComponent().getModel();
            //     var oTableModel = this.getView().byId("sizesTable").getModel("DataModel");
            //     var oTableData = oTableModel.getData();
            //     var attribcd;

            //     oTableData.results.forEach((item) => {
            //         if(item.Baseind === true) {
            //             attribcd = item.Attribcd;
            //         }
            //     })

            //     var entitySet = "/StyleAttributesSizeSet(Styleno='" + this._styleNo +  "')";

            //     oModel.setHeaders({
            //         attribcd: attribcd
            //     });

            //     var oEntry = oTableData.results[0];

            //     oModel.update(entitySet, oEntry, {
            //         method: "PUT",
            //         success: function(data, oResponse) {
            //             Common.showMessage("Saved");
            //         },
            //         error: function() {
            //             Common.showMessage("Error");
            //         }
            //     });
            // },

            getProcessesTable:function(){
                var me = this;
                var oTable = this.getView().byId("processesTable");

                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var oTable = this.getView().byId("processesTable");
                var entitySet = "/StyleAttributesProcessSet"
                oModel.setHeaders({
                    styleno: this._styleNo,
                    sbu: this._sbu
                });
                oModel.read(entitySet, {
                    success: function(oData, oResponse) {
                        oJSONModel.setData(oData);
                        oTable.setModel(oJSONModel, "DataModel");
                    },
                    error: function() { }
                })
            },

            onSaveProcessTable: function() {
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("processesTable").getModel("DataModel");
                var path;

                var oData = oTableModel.getData();
                var oEntry = {
                    Styleno: this._styleNo,
                    ProcessToItems: [ ]
                }

                for (var i = 0; i < oData.results.length; i++) {
                // for (var i = oData.results.length - 1; i >= 0; i--) {
                    
                    // var item = {
                    //     "Styleno": this._styleNo,
                    //     "AttribTyp": "SIZE",
                    //     "AttribCd": oData.results[i].Attribcd,
                    //     "Attribgrp": "",
                    //     "Attribseq": " ",
                    //     "Baseind": " ",
                    //     "Deleted": " ",
                    //     "Desc1": oData.results[i].Desc1,
                    //     "Desc2": " ",
                    //     "Valuetyp": "STRVAL",
                    //     "Attribval": " ",
                    //     "Valunit": " ",
                    //     "Createdby": " ",
                    //     "Createddt": " ",
                    //     "Updatedby": " ",
                    //     "Updateddt": " "
                    // };

                    var item = {
                        "Styleno": this._styleNo,
                        "Seqno": oData.results[i].Seqno,
                        "Parentproc": " ",
                        "Hasoutput": " ",
                        "Processcd": oData.results[i].Processcd,
                        "Reqind": " ",
                        "Deleted": " ",
                        "Leadtime": oData.results[i].Leadtime,
                        "Attribtyp": oData.results[i].Attribtyp,
                        "Attribcd": oData.results[i].Attribcd,
                        "Vastyp": oData.results[i].Vastyp,
                        "Createdby": " ",
                        "Createddt": " ",
                        "Updatedby": " ",
                        "Updateddt": " "
                    }
    
                    oEntry.ProcessToItems.push(item);
                };

                path = "/AttributesProcessSet";

                oModel.create(path, oEntry, {
                    method: "POST",
                    success: function(oData, oResponse) {
                        Common.showMessage("Saved");
                    },
                    error: function(err) {
                        Common.showMessage("Error");
                    }
                });
            },

            
            getVersionsTable: function(){
                var oTable = this.getView().byId("versionsTable");
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var entitySet = "/StyleVersionSet"
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

            onSaveNewVersion: function() {
                var oModel = this.getOwnerComponent().getModel();
                var me = this;
                var path;

                // oModel.setHeaders({
                //     sbu: this._sbu,
                //     userid: this._User
                // });
                var current;

                var oDesc1 = Core.byId("newVersionDesc1").getValue();
                var oDesc2 = Core.byId("newVersionDesc2").getValue();
                var oCurrent = Core.byId("newVersionCurrent").getSelected();
                // if(oCurrent === true) {
                //     current = "1";
                // } else {
                //     current = "0";
                // }

                // var oHeaderModel = this.getView().getModel("headerData");
                // var oEntry = oHeaderModel.getData();
                // oEntry.Styleno = this._styleNo;
                // oEntry.Createdby = "BAS_CONN";
                // oEntry.Sbu = this._sbu;
                
                path = "/StyleVersionSet";

                var oEntry = {
                    "Styleno": this._styleNo,
                    "Verno": "",
                    "Desc1": oDesc1,
                    "Desc2": oDesc2,
                    "Currentver": oCurrent
                };
               
                oModel.create(path, oEntry, {
                    method: "POST",
                    success: function(oData, oResponse) {
                        Common.showMessage("Saved");
                        me.getVersionsTable();
                        me._NewVerionDialog.close();
                    },
                    error: function(err) {
                        Common.showMessage("Error");
                    }
                });
            },

            onSelectVersion: function(oEvent) {
                var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                var version = oData.getProperty('Verno');
                // var desc;
                // var desc1 = oData.getProperty('Desc1');
                // var desc2 = oData.getProperty('Desc1');
                // if(desc1 !== undefined) {
                //     desc = desc1;
                // } else {
                //     desc = desc2;
                // }

                that._router.navTo("RouteVersion", {
                    styleno: that._styleNo,
                    sbu: that._sbu,
                    version: version
                });

                // var oObjHeader = this.getView().byId("VersionHeader");
                // oObjHeader.setTitle(desc);
                // oObjHeader.setIntro('Version ' + version);

                // this._version = version;
                // this.getVersionsData();
            },

            getVersionsData() {
                this.getVersionAttrTable();
                this.getbomGMCTable();
                this.getbomUVTable();
                this.getMaterialList();
            },

            getVersionAttrTable: function(){
                var oTable = this.getView().byId("versionAttrTable");
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var entitySet = "/StyleVersionAttributesSet"
                oModel.setHeaders({
                    styleno: this._styleNo,
                    verno: this._version
                });
                oModel.read(entitySet, {
                    success: function(oData, oResponse) {
                        oJSONModel.setData(oData);
                        oTable.setModel(oJSONModel, "DataModel");
                    },
                    error: function() { }
                })
            },

            setVersionCurrent: function(oEvent) {
                var me = this;
                var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                var version = oData.getProperty('Verno');
                version = this.pad(version, 3);
                var oModel = this.getOwnerComponent().getModel();

                var entitySet = "/StyleVersionSet(Styleno='" + this._styleNo +  "',Verno='" + version + "')";
                var oEntry = {
                    Styleno: this._styleNo,
                    Verno: version
                };

                oModel.update(entitySet, oEntry, {
                    method: "PUT",
                    success: function(data, oResponse) {
                        me.getHeaderData();
                        me.getVersionsTable();
                        Common.showMessage("Saved");
                    },
                    error: function() {
                        Common.showMessage("Error");
                    }
                });
            },

            onCreateNewVersion: function() {
                if (!that._NewVerionDialog) {
                    that._NewVerionDialog = sap.ui.xmlfragment("zui3derp.view.fragments.CreateNewVersion", that);
                    that.getView().addDependent(that._NewVerionDialog);
                }
                jQuery.sap.syncStyleClass("sapUiSizeCompact", that.getView(), that._LoadingDialog);
                that._NewVerionDialog.addStyleClass("sapUiSizeCompact");
                that._NewVerionDialog.open();
            },

            getbomGMCTable: function() {
                var me = this;
                var columnData = [];
                var oModel = this.getOwnerComponent().getModel();

                oModel.setHeaders({
                    sbu: this._sbu,
                    type: 'BOMGMC'
                });

                oModel.read("/DynamicColumnsSet", {
                    success: function (oData, oResponse) {
                        oData.results.forEach((column) => {
                            columnData.push({
                                "ColumnName": column.ColumnName,
                                "ColumnDesc": column.ColumnName,
                                "ColumnType": column.ColumnType
                            })
                        })
                        me.getGMCColors(columnData);
                    },
                    error: function (err) { }
                });
            },

            getGMCColors: function(columnData) {
                var me = this;

                var oModel = this.getOwnerComponent().getModel();

                oModel.setHeaders({
                    styleno: this._styleNo
                });
                oModel.read("/StyleAttributesColorSet", {
                    success: function (oData, oResponse) {
                        oData.results.forEach((column) => {
                            columnData.push({
                                "ColumnName": column.Attribcd,
                                "ColumnDesc": column.Desc1,
                                "ColumnType": "COLOR"
                            })
                        })
                        me.getbomGMCTableData(columnData);
                    },
                    error: function (err) { }
                });
            },

            getbomGMCTableData: function(columnData) {
                var oTable = this.getView().byId("bomGMCTable");
                var oModel = this.getOwnerComponent().getModel();
                var rowData = [];

                oModel.setHeaders({
                    styleno: this._styleNo,
                    verno: this._version
                });
                oModel.read("/StyleBOMGMCSet", {
                    success: function (oData, oResponse) {
                        rowData = oData.results;
                        var oJSONModel = new JSONModel();
                        oJSONModel.setData({
                            results: rowData,
                            columns: columnData
                        });

                        oTable.setModel(oJSONModel, "DataModel");

                        oTable.bindColumns("DataModel>/columns", function(sId, oContext) {
                            var columnName = oContext.getObject().ColumnName;
                            var columnDesc = oContext.getObject().ColumnDesc;
                            var columnType = oContext.getObject().ColumnType;
                            return new sap.ui.table.Column({
                                label: that.getColumnDesc(columnName, columnDesc, columnType),
                                template: that.columnTemplate(columnName, columnDesc, columnType),
                                sortProperty: columnName, 
                                filterProperty: columnName,
                                width: "8rem"
                            });
                        });

                        oTable.bindRows("DataModel>/results");
                    },
                    error: function (err) { }
                });
            },

            getbomUVTable: function() {
                var me = this;
                var columnData = [];
                var oModel = this.getOwnerComponent().getModel();

                oModel.setHeaders({
                    sbu: this._sbu,
                    type: 'BOMUV'
                });

                oModel.read("/DynamicColumnsSet", {
                    success: function (oData, oResponse) {
                        oData.results.forEach((column) => {
                            columnData.push({
                                "ColumnName": column.ColumnName,
                                "ColumnDesc": column.ColumnName,
                                "ColumnType": column.ColumnType
                            })
                        })
                        me.getUVColors(columnData);
                    },
                    error: function (err) { }
                });
            },

            getUVColors: function(columnData) {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();

                oModel.setHeaders({
                    styleno: this._styleNo
                });
                oModel.read("/StyleAttributesColorSet", {
                    success: function (oData, oResponse) {
                        // oData.results.forEach((column) => {
                        //     columnData.push({
                        //         "ColumnName": column.Attribcd,
                        //         "ColumnDesc": column.Desc1,
                        //         "ColumnType": "COLOR"
                        //     })
                        // })
                        me.getbomUVTableData(columnData);
                    },
                    error: function (err) { }
                });
            },

            getbomUVTableData: function(columnData) {
                var oTable = this.getView().byId("bomUVTable");
                var oModel = this.getOwnerComponent().getModel();
                var rowData = [];

                oModel.setHeaders({
                    styleno: this._styleNo,
                    verno: this._version
                });
                oModel.read("/StyleBOMUVSet", {
                    success: function (oData, oResponse) {
                        rowData = oData.results;

                        var oJSONModel = new JSONModel();
                        oJSONModel.setData({
                            results: rowData,
                            columns: columnData
                        });

                        oTable.setModel(oJSONModel, "DataModel");

                        oTable.bindColumns("DataModel>/columns", function(sId, oContext) {
                            var columnName = oContext.getObject().ColumnName;
                            var columnDesc = oContext.getObject().ColumnDesc;
                            var columnType = oContext.getObject().ColumnType;
                            return new sap.ui.table.Column({
                                label: that.getColumnDesc(columnName, columnDesc, columnType),
                                // template: new sap.m.Input({ value: "{DataModel>" + columnName + "}" }),
                                template: that.columnTemplate(columnName, columnDesc, columnType),
                                sortProperty: columnName, 
                                filterProperty: columnName,
                                width: "8rem"
                            });
                        });

                        oTable.bindRows("DataModel>/results");
                    },
                    error: function (err) { }
                });
            },

            getColumnDesc: function(columnName, columnDesc, columnType) {
                var desc;
                if(columnType === "COLOR" || columnType === "SIZE") {
                    desc = columnDesc;
                } else {
                    desc = "{i18n>" + columnName + "}";
                }
                return desc;
            },

            columnTemplate: function(columnName, columnDesc, columnType) {
                var oColumnTemplate;
                if(columnName === "BOMSEQ" || columnName === "BOMITEM") {
                    oColumnTemplate = new sap.m.Text({ text: "{DataModel>" + columnName + "}" });
                } else {
                    oColumnTemplate = new sap.m.Input({ value: "{DataModel>" + columnName + "}" })
                }
                return oColumnTemplate;
            },

            oAttachmentsTable:function(){
                var me = this;
                var oTable = this.getView().byId("attachmentsTable");
            },

            getDetailedBOM:function(){
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var oTable = this.getView().byId("bomDetailedTable");
                var entitySet = "/StyleDetailedBOMSet"
                oModel.read(entitySet, {
                    success: function(oData, oResponse) {
                        oJSONModel.setData(oData);
                        oTable.setModel(oJSONModel, "DataModel");
                    },
                    error: function() { }
                })
            },

            getMaterialList: function(){
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var oTable = this.getView().byId("materialListTable");
                var entitySet = "/StyleMaterialListSet"
                oModel.setHeaders({
                    styleno: this._styleNo,
                    verno: this._version
                });
                oModel.read(entitySet, {
                    success: function(oData, oResponse) {
                        oJSONModel.setData(oData);
                        oTable.setModel(oJSONModel, "DataModel");
                    },
                    error: function() { }
                })
            },

            onAssignMaterial: function() {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteAssignMaterial", {
                    styleno: this._styleNo,
                    sbu: this._sbu
                } );
            },

            addLine: function(oEvent) {
                var oButton = oEvent.getSource();
                var tabName = oButton.data('TableName')
                var oTable = this.getView().byId(tabName);
                var oModel = this.getView().byId(tabName).getModel("DataModel");
                var oData = oModel.getProperty('/results');
                oData.push({});
                oTable.getBinding("rows").refresh();
            },

            addProcessLine: function(oEvent) {
                var oButton = oEvent.getSource();
                var tabName = oButton.data('TableName')
                var oTable = this.getView().byId(tabName);
                var oModel = this.getView().byId(tabName).getModel("DataModel");
                var oData = oModel.getProperty('/results');
                var length = oData.length;
                var lastSeqno = 0;
                if(length > 0) {
                    lastSeqno = parseInt(oData[length - 1].Seqno);
                }
                oData.push({
                    "Seqno": lastSeqno + 1
                });
                oTable.getBinding("rows").refresh();
            },

            removeLine: function(oEvent) {
                var oButton = oEvent.getSource();
                var tabName = oButton.data('TableName')
                var oTable = this.getView().byId(tabName);
                var oModel = this.getView().byId(tabName).getModel("DataModel");
                var oData = oModel.getData(); // oModel.getProperty('/results');
                var selected = oTable.getSelectedIndices();
                // selected.forEach((item) => {
                //     oData.results.splice(item, 1);
                // });

                // var valuesArr = ["v1","v2","v3","v4","v5"];
                // var removeValFrom = [0, 2, 4];
                oData.results = oData.results.filter(function(value, index) {
                    return selected.indexOf(index) == -1;
                })

                oModel.setData(oData);
                oTable.clearSelection();
                // oData.push({});
                // oTable.getBinding("rows").refresh();
            },

            addGeneralAttr: function() {
                var oModel = this.getView().byId("generalTable").getModel("DataModel");
                var oData = oModel.getProperty('/results');
                oData.push({});

                var oTable = this.getView().byId("generalTable");
                oTable.getBinding("rows").refresh();
            },

            setEditMode: function(oEvent) {
                var oJSONModel = new JSONModel();
                var data;

                if(oEvent === "NEW") {
                    data = {
                        headerEditMode: true,
                        genAttrEditMode: false,
                        colorsEditMode: false,
                        sizesEditMode: false,
                        processEditMode: false,
                        versionEditMode: false
                    };

                } else {
                    if(oEvent !== undefined) {
                        var oButton = oEvent.getSource();
                        var section = oButton.data('Section')
                    
                        var currentMode = this.getView().getModel("EditModeModel");
                        if(currentMode !== undefined) {
                            var currentModeData = currentMode.getData();
                            if(section === "HeaderForm") 
                                currentModeData.headerEditMode = !currentModeData.headerEditMode;
                            if(section === "GeneralAttributes")
                                currentModeData.genAttrEditMode = !currentModeData.genAttrEditMode;
                            if(section === "Colors")
                                currentModeData.colorsEditMode = !currentModeData.colorsEditMode;
                            if(section === "Sizes")
                                currentModeData.sizesEditMode = !currentModeData.sizesEditMode;
                            if(section === "Processes")
                                currentModeData.processEditMode = !currentModeData.processEditMode;
                            if(section === "Versions")
                                currentModeData.versionEditMode = !currentModeData.versionEditMode;
                            data = currentModeData; 
                        }
                    } else {
                        data = {
                            headerEditMode: false,
                            genAttrEditMode: false,
                            colorsEditMode: false,
                            sizesEditMode: false,
                            processEditMode: false,
                            versionEditMode: false
                        };           
                    }
                }
                oJSONModel.setData(data);
                this.getView().setModel(oJSONModel, "EditModeModel");
            },

            onAttrTypesValueHelp : function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                this.inputId = oEvent.getSource().getId();
                if (!this._attrTypesValueHelpDialog) {
                    this._attrTypesValueHelpDialog = sap.ui.xmlfragment(
                        "zui3derp.view.fragments.AttributeTypes",
                        this
                    );
                    this.getView().addDependent(this._attrTypesValueHelpDialog);
                }
                this._attrTypesValueHelpDialog.open(sInputValue);
            },

            _attrTypesValueHelpSearch : function (evt) {
                var sValue = evt.getParameter("value");
                var oFilter = new Filter(
                    "Attribtyp",
                    sap.ui.model.FilterOperator.Contains, sValue
                );
                evt.getSource().getBinding("items").filter([oFilter]);
            },

            _attrTypesValueHelpClose : function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = this.byId(this.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onAttrCodesValueHelp : function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                var attrTyp = oData.getProperty('Attribtyp');
                this.inputId = oEvent.getSource().getId();
                this.descId = oEvent.getSource().getParent().mAggregations.cells[2].getId();
                if (!this._attrCodesValueHelpDialog) {
                    this._attrCodesValueHelpDialog = sap.ui.xmlfragment(
                        "zui3derp.view.fragments.AttributeCodes",
                        this
                    );
                    this.getView().addDependent(this._attrCodesValueHelpDialog);
                }
                this._attrCodesValueHelpDialog.getBinding("items").filter([new Filter(
                    "Attribtyp",
                    sap.ui.model.FilterOperator.EQ, attrTyp
                )]);
                this._attrCodesValueHelpDialog.open(sInputValue);
            },

            _attrCodesValueHelpSearch : function (evt) {
                var sValue = evt.getParameter("value");
                var oFilter = new Filter(
                    "Desc1",
                    sap.ui.model.FilterOperator.Contains, sValue
                );
                evt.getSource().getBinding("items").filter([oFilter]);
            },
    
            _attrCodesValueHelpClose : function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = this.byId(this.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    var descText= this.byId(this.descId);
                    descText.setText(oSelectedItem.getDescription());
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onProcessesValueHelp : function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                this.inputId = oEvent.getSource().getId();
                if (!this._processesValueHelpDialog) {
                    this._processesValueHelpDialog = sap.ui.xmlfragment(
                        "zui3derp.view.fragments.Processes",
                        this
                    );
                    this.getView().addDependent(this._processesValueHelpDialog);
                }
                this._processesValueHelpDialog.open(sInputValue);
            },

            _processesValueHelpSearch : function (evt) {
                var sValue = evt.getParameter("value");
                var oFilter = new Filter(
                    "Desc1",
                    sap.ui.model.FilterOperator.Contains, sValue
                );
                evt.getSource().getBinding("items").filter([oFilter]);
            },
    
            _processesValueHelpClose : function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = this.byId(this.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onVASTypeValueHelp : function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                this.inputId = oEvent.getSource().getId();
                var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                var ProcessCd = oData.getProperty('Processcd');

                if (!this._VASTypeValueHelpDialog) {
                    this._VASTypeValueHelpDialog = sap.ui.xmlfragment(
                        "zui3derp.view.fragments.VASTypes",
                        this
                    );
                    this.getView().addDependent(this._VASTypeValueHelpDialog);
                }

                this._VASTypeValueHelpDialog.getBinding("items").filter([new Filter(
                    "Vasproc",
                    sap.ui.model.FilterOperator.EQ, ProcessCd
                )]);

                this._VASTypeValueHelpDialog.open(sInputValue);
            },

            _VASTypesValueHelpSearch : function (evt) {
                var sValue = evt.getParameter("value");
                var oFilter = new Filter(
                    "VASTyp",
                    sap.ui.model.FilterOperator.Contains, sValue
                );
                evt.getSource().getBinding("items").filter([oFilter]);
            },
    
            _VASTypesValueHelpClose : function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = this.byId(this.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onCustomersValueHelp : function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                var custGrp = this.getView().byId("customerGroupCB").getSelectedKey();
    
                this.inputId = oEvent.getSource().getId();
                // create value help dialog
                if (!this._customersHelpDialog) {
                    this._customersHelpDialog = sap.ui.xmlfragment(
                        "zui3derp.view.fragments.Customers",
                        this
                    );
                    this.getView().addDependent(this._customersHelpDialog);
                }

                this._customersHelpDialog.getBinding("items").filter([new Filter(
                    "Custgrp",
                    sap.ui.model.FilterOperator.EQ, custGrp
                )]);
        
                // open value help dialog filtered by the input value
                this._customersHelpDialog.open(sInputValue);
            },

            _customersValueHelpSearch : function (evt) {
                var sValue = evt.getParameter("value");
                var oFilter = new Filter(
                    "Custno",
                    sap.ui.model.FilterOperator.Contains, sValue
                );
                evt.getSource().getBinding("items").filter([oFilter]);
            },
    
            _customersValueHelpClose : function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = this.byId(this.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onUomValueHelp : function () {
                // var sInputValue = "";// oEvent.getSource().getValue();
                // var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                // var attrTyp = oData.getProperty('Valunit');
                // this.inputId = oEvent.getSource().getId();
                // this.descId = oEvent.getSource().getParent().mAggregations.cells[2].getId();
                if (!this._uomValueHelpDialog) {
                    this._uomValueHelpDialog = sap.ui.xmlfragment(
                        "zui3derp.view.fragments.UoM",
                        this
                    );
                    this.getView().addDependent(this._uomValueHelpDialog);
                }
                // this._attrCodesValueHelpDialog.getBinding("items").filter([new Filter(
                //     "AttribTyp",
                //     sap.ui.model.FilterOperator.EQ, attrTyp
                // )]);
                this._uomValueHelpDialog.open();
            },

            _uomValueHelpSearch : function (evt) {
                var sValue = evt.getParameter("value");
                var oFilter = new Filter(
                    "Desc1",
                    sap.ui.model.FilterOperator.Contains, sValue
                );
                evt.getSource().getBinding("items").filter([oFilter]);
            },
    
            _uomValueHelpClose : function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = this.byId("UomInput");
                    productInput.setValue(oSelectedItem.getTitle());
                    var descText= this.byId(this.descId);
                    descText.setText(oSelectedItem.getDescription());
                }
                evt.getSource().getBinding("items").filter([]);
            },

            uploadAttachment: function() {
                if (!this._UploadFileDialog) {
                    this._UploadFileDialog = sap.ui.xmlfragment("zui3derp.view.fragments.UploadFile", this);
                    this.getView().addDependent(this._ConfirmNewDialog);
                }
                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                this._UploadFileDialog.addStyleClass("sapUiSizeCompact");
                this._UploadFileDialog.open();
            },

            onExportExcel: Common.onExportExcel,

            pad: Common.pad,

            onCancelNewVersion: Common.onCancelNewVersion,

            onCancelUploadFile: Common.onCancelUploadFile
        });
    });
