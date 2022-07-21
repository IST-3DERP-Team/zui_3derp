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

        return Controller.extend("zui3derp.controller.Version", {

            onInit: function() {
                that = this;  
                
                var oComponent = this.getOwnerComponent();
                this._router = oComponent.getRouter();
                this._router.getRoute("RouteVersion").attachPatternMatched(this._routePatternMatched, this);

                this._attrValueHelpData = {
                    attributes: [],
                    attributecodes: [],
                    uom: [],
                    processes: [],
                    materialtypes: [],
                    gmc: [],
                    styles: []
                };
            },

            _routePatternMatched: function (oEvent) {
                this._sbu = oEvent.getParameter("arguments").sbu;
                this._styleNo = oEvent.getParameter("arguments").styleno;
                this._version = oEvent.getParameter("arguments").version;

                this.getAttributesFilterData();
                this.getHeaderData(this._styleNo);
                this.getVersionsData();
                this.setEditMode();
            },

            getHeaderData: function(styleNo) {
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

            getVersionsData() {
                this.getVersionAttrTable();
                this.getbomGMCTable("N");
                this.getbomUVTable();
                this.getDetailedBOM();
                this.getMaterialList();
            },

            getAttributesFilterData: function () {
                var oSHModel = this.getOwnerComponent().getModel("SearchHelps");
                var me = this;
                
                var oModel = this.getOwnerComponent().getModel();
                oModel.setHeaders({
                    sbu: this._sbu
                });

                //get Attribute Types
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
                var oJSONModel2 = new JSONModel();
                var oView = this.getView();
                oModel.read("/AttribCodeSet", {
                    success: function (oData, oResponse) {
                        me._attrValueHelpData.attributecodes = oData.results;
                        oJSONModel2.setData(me._attrValueHelpData);
                        oView.setModel(oJSONModel2, "ValueHelpModel");
                    },
                    error: function (err) { }
                });

                //Usage Classes
                var oJSONModel3 = new JSONModel();
                oModel.read("/UsageClassSet", {
                    success: function (oData, oResponse) {
                        me._attrValueHelpData.usageclasses = oData.results;
                        oJSONModel3.setData(me._attrValueHelpData);
                        oView.setModel(oJSONModel3, "ValueHelpModel");
                    },
                    error: function (err) { }
                });

                //get UoM
                var oJSONModel4 = new JSONModel();
                oSHModel.read("/UOMSet", {
                    success: function (oData, oResponse) {
                        me._attrValueHelpData.uom = oData.results;
                        oJSONModel4.setData(me._attrValueHelpData);
                        oView.setModel(oJSONModel4, "ValueHelpModel");
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

                //get Material Types
                var oJSONModel6 = new JSONModel();
                oSHModel.read("/MatTypeSet", {
                    success: function (oData, oResponse) {
                        me._attrValueHelpData.materialtypes = oData.results;
                        oJSONModel6.setData(me._attrValueHelpData);
                        oView.setModel(oJSONModel6, "ValueHelpModel");
                    },
                    error: function (err) { }
                });

                //get GMC
                var oJSONModel7 = new JSONModel();
                oSHModel.read("/GMCSet", {
                    success: function (oData, oResponse) {
                        me._attrValueHelpData.gmc = oData.results;
                        oJSONModel7.setData(me._attrValueHelpData);
                        oView.setModel(oJSONModel7, "ValueHelpModel");
                    },
                    error: function (err) { }
                });

                //get Styles
                var oJSONModel8 = new JSONModel();
                oModel.read("/StyleSet", {
                    success: function (oData, oResponse) {
                        me._attrValueHelpData.styles = oData.results;
                        oJSONModel8.setData(me._attrValueHelpData);
                        oView.setModel(oJSONModel8, "ValueHelpModel");
                    },
                    error: function (err) { }
                });

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

            onSaveVersionAttrTable: function() {
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("versionAttrTable").getModel("DataModel");
                var path;

                var oData = oTableModel.getData();
                var oEntry = {
                    Styleno: this._styleNo,
                    Verno: this._version,
                    VersionToItems: [ ]
                }

                // for (var i = oData.results.length - 1; i >= 0; i--) {
                
                for (var i = 0; i < oData.results.length; i++) {
                    
                    // var item = {
                    //     "Styleno": this._styleNo,
                    //     "AttribTyp": oData.results[i].AttribTyp,
                    //     "AttribCd": oData.results[i].AttribCd,
                    //     "Attribgrp": "",
                    //     "Attribseq": " ",
                    //     "Baseind": " ",
                    //     "Deleted": " ",
                    //     "Desc1": " ",
                    //     "Desc2": " ",
                    //     "Valuetyp": "STRVAL",
                    //     "Attribval": " ",
                    //     "Valunit": " ",
                    //     "Createdby": " ",
                    //     "Createddt": " ",
                    //     "Updatedby": " ",
                    //     "Updateddt": " "
                    // };

                    var item =  {
                        "Styleno": this._styleNo,
                        "Verno": this._version,
                        "Attribgrp": "1",
                        "Attribseq": "1",
                        "Attribtyp": oData.results[i].Attribtyp,
                        "Attribcd": oData.results[i].Attribcd,
                        "Baseind": " ",
                        "Desc1": oData.results[i].Desc1,
                        "Desc2": " ",
                        "Valuetyp": " ",
                        "Attribval": oData.results[i].Attribval,
                        "Deleted": " ",
                        "Valunit": oData.results[i].Valunit,
                        "Createdby": " ",
                        "Createddt": " ",
                        "Updatedby": " ",
                        "Updateddt": " "
                    }
    
                    oEntry.VersionToItems.push(item);
                };

                path = "/VersionAttributesSet";

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

            onGetComponent: function() {
                
                this.getbomGMCTable("Y");
            },

            getbomGMCTable: function(getComponent) {
                var me = this;
                var columnData = [];

                this._getComponent = getComponent;

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
                var rowData = {
                    items: []
                };

                oModel.setHeaders({
                    styleno: this._styleNo,
                    verno: this._version,
                    getcomponent: this._getComponent
                });
                oModel.read("/StyleBOMGMCSet", {
                    success: function (oData, oResponse) {
                        // rowData = oData.results;

                        var style;
                        var item = {};
                        var items = [];

                        for (var i = 0; i < oData.results.length; i++) {
                            items = [];
                            if(oData.results[i].BOMITMTYP === 'STY') {
                                
                                style = oData.results[i].BOMSTYLE;
                                for (var j = 0; j < oData.results.length; j++) {
                                    if(oData.results[j].BOMITMTYP === 'GMC' && oData.results[j].BOMSTYLE === style) {
                                        items.push(oData.results[j]);
                                    }
                                }

                                item = oData.results[i];
                                item.items = items;
                                rowData.items.push(item);
                            } else if (oData.results[i].BOMITMTYP === 'GMC' && oData.results[i].BOMSTYLE === ''){
                                rowData.items.push(oData.results[i]);
                            }
                        }

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
                                width: "9rem"
                            });
                        });

                        // oTable.bindRows("DataModel>/results");
                    },
                    error: function (err) { }
                });
            },

            columnTemplate: function(columnName, columnDesc, columnType) {
                var oColumnTemplate;
                if(columnName === "BOMSEQ" || columnName === "BOMITEM" || columnName === "DESC1" ) {
                    oColumnTemplate = new sap.m.Text({ text: "{DataModel>" + columnName + "}" });
                } else if (columnName === "BOMITMTYP") {
                    oColumnTemplate = new sap.m.ComboBox({ 
                            value: "{DataModel>" + columnName + "}",
                            items: [{
                                    key: "GMC",
                                    text: "GMC"
                                },{
                                    key: "STY",
                                    text: "STY"
                            }]                             
                        });
                } else if (columnName === "PROCESSCD") {
                    oColumnTemplate = new sap.m.Input({ 
                        value: "{DataModel>" + columnName + "}",
                        showValueHelp: true,
                        valueHelpRequest: that.onProcessesValueHelp,
                        suggestionItems: {
                            path: "ValueHelpModel>/processes",
                            template: new sap.ui.core.Item({
                                text: "{ValueHelpModel>ProcessCd}"
                            })
                        },
                        editable: "{= ${DataModel>BOMITMTYP} === 'STY' ? false : true }"
                    });
                } else if (columnName === "MATTYP") {
                    oColumnTemplate = new sap.m.Input({ 
                            value: "{DataModel>" + columnName + "}",
                            showValueHelp: true,
                            valueHelpRequest: that.onMatTypeValueHelp,
                            editable: "{= ${DataModel>BOMITMTYP} === 'STY' ? false : true }"
                        });
                } else if (columnName === "USGCLS") {
                    oColumnTemplate = new sap.m.ComboBox({ 
                            value: "{DataModel>" + columnName + "}",
                            showSecondaryValues: true,
                            items: {
                                path: "ValueHelpModel>/usageclasses",
                                template: new sap.ui.core.Item({
                                    key: "{ValueHelpModel>Usgcls}",
                                    text: "{ValueHelpModel>Usgcls}",
                                    additionalText: "{ValueHelpModel>Usgcls}"
                                })
                            },
                            editable: "{= ${DataModel>BOMITMTYP} === 'STY' ? false : true }"
                        });
                } else if (columnName === "UOM") {
                    oColumnTemplate = new sap.m.ComboBox({ 
                            value: "{DataModel>" + columnName + "}",
                            showSecondaryValues: true,
                            items: {
                                path: "ValueHelpModel>/uom",
                                template: new sap.ui.core.Item({
                                    key: "{ValueHelpModel>Valunit}",
                                    text: "{ValueHelpModel>Valunit}",
                                    additionalText: "{ValueHelpModel>Desc1}"
                                })
                            },
                            editable: "{= ${DataModel>BOMITMTYP} === 'STY' ? false : true }"
                        });
                } else if (columnName === "GMC") {
                    oColumnTemplate = new sap.m.Input({ 
                        value: "{DataModel>" + columnName + "}",
                        showValueHelp: true,
                        valueHelpRequest: that.onGMCValueHelp,
                        editable: "{= ${DataModel>BOMITMTYP} === 'STY' ? false : true }"
                    });
                } else if (columnName === "BOMSTYLE") {
                    oColumnTemplate = new sap.m.Input({ 
                        value: "{DataModel>" + columnName + "}",
                        showValueHelp: true,
                        valueHelpRequest: that.onStyleValueHelp,
                        editable: "{= ${DataModel>BOMITMTYP} === 'GMC' ? false : true }"
                    });
                } else if (columnName === "BOMSTYLVER") {
                    oColumnTemplate = new sap.m.Input({ 
                        value: "{DataModel>" + columnName + "}",
                        editable: "{= ${DataModel>BOMITMTYP} === 'GMC' ? false : true }"
                    });
                } else {
                    oColumnTemplate = new sap.m.Input({ 
                        value: "{DataModel>" + columnName + "}",
                        editable: "{= ${DataModel>BOMITMTYP} === 'STY' ? false : true }"
                    })
                }
                return oColumnTemplate;
            },

            onSaveBOMbyGMC: function() {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("bomGMCTable").getModel("DataModel");
                var path;
                var item = {};

                var oData = oTableModel.getData();
                var oEntry = {
                    Styleno: this._styleNo,
                    GMCToItems: [ ]
                }

                for (var i = 0; i < oData.results.items.length; i++) {

                    item = that.addBOMItem(oData.results.items[i]);
                    oEntry.GMCToItems.push(item);

                    if(oData.results.items[i].BOMITMTYP === 'STY') {
                        if(oData.results.items[i].items !== undefined) {
                            for (var j = 0; j < oData.results.items[i].items.length; j++) {
                                item = that.addBOMItem(oData.results.items[i].items[j]);
                                oEntry.GMCToItems.push(item);
                            }
                        }
                    }
                    
                    
                };

                path = "/BOMGMCSet";

                oModel.create(path, oEntry, {
                    method: "POST",
                    success: function(oData, oResponse) {
                        Common.showMessage("Saved");
                        me.getbomGMCTable("N");
                        me.getbomUVTable();
                        me.getDetailedBOM();
                    },
                    error: function(err) {
                        Common.showMessage("Error");
                    }
                });
            },

            addBOMItem: function(item) {
                return {
                    "Styleno": this._styleNo,
                    "Verno": this._version,
                    "Bomseq": " ",
                    "Bomitem": " ",
                    "Compseq": " ",
                    "Sortseq": " ",
                    "Partseq": " ",
                    "Uvseq": " ",
                    "Altseq": " ",
                    "Bomitmtyp": item.BOMITMTYP,
                    "Bomstyle": item.BOMSTYLE,
                    "Bomstylver": item.BOMSTYLVER,
                    "Partcd": item.PARTCD,
                    "Partdesc": item.PARTDESC,
                    "Partcnt": item.PARTCNT,
                    "Usgcls": item.USGCLS,
                    "Custstyle": item.CUSTSTYLE,
                    "Color": " ",
                    "Sizes": " ",
                    "Dest": " ",
                    "Mattyp": item.MATTYP,
                    "Gmc": item.GMC,
                    "Matno": item.REFMATNO,
                    "Entryuom": item.UOM,
                    "Matconsper": item.CONSUMPPER,
                    "Per": item.PER,
                    "Issueuom": item.UOM,
                    "Matconsump": " ",
                    "Wastage": item.WASTAGE,
                    "Comconsump": item.COMCONSUMP,
                    "Override": " ",
                    "Altconsump": " ",
                    "Consump": item.CONSUMP,
                    "Diml": " ",
                    "Dimw": " ",
                    "Dimuom": item.UOM,
                    "Processcd": item.PROCESSCD,
                    "Remarks": " ",
                    "Refmatno": item.REFMATNO,
                    "Refmatdesc": item.REFMATDESC,
                    "Refcolor": " ",
                    "Refmattyp": " ",
                    "Vendmatcd": " ",
                    "Vendmatdesc": " ",
                    "Deleted": " ",
                    "Createdby": " ",
                    "Createddt": " ",
                    "Updatedby": " ",
                    "Updateddt": " "
                }
            },

            getbomUVTable: function() {
                var me = this;
                var columnData = [];
                var oModel = this.getOwnerComponent().getModel();

                var usageClass = this.getView().byId("UsageClassCB").getSelectedKey();

                oModel.setHeaders({
                    sbu: this._sbu,
                    type: 'BOMUV',
                    usgcls: usageClass
                });

                oModel.read("/DynamicColumnsSet", {
                    success: function (oData, oResponse) {
                        var columns = oData.results;

                        if(usageClass === "AUV") {
                            oModel.setHeaders({
                                styleno: me._styleNo
                            });
                            oModel.read("/StyleAttributesColorSet", {
                                success: function (oData, oResponse) {
                                    var colors = oData.results;
    
                                    for (var i = 0; i < columns.length; i++) {
                                        if(columns[i].ColumnName === "COLOR") {
                                            for (var j = 0; j < colors.length; j++) {
                                                columnData.push({
                                                    "ColumnName": colors[j].Attribcd,
                                                    "ColumnDesc": colors[j].Desc1,
                                                    "ColumnType": "COLOR"
                                                })                                            
                                            }
                                        } else {
                                            columnData.push({
                                                "ColumnName": columns[i].ColumnName,
                                                "ColumnDesc": columns[i].ColumnName,
                                                "ColumnType": columns[i].ColumnType
                                            }) 
                                        }                            
                                    }
    
    
                                    me.getbomUVTableData(columnData, colors);
                                },
                                error: function (err) { }
                            });

                        } else if(usageClass === "SUV") {

                            oModel.setHeaders({
                                styleno: me._styleNo
                            });
                            oModel.read("/StyleAttributesSizeSet", {
                                success: function (oData, oResponse) {
                                    var sizes = oData.results;
    
                                    for (var i = 0; i < columns.length; i++) {
                                        if(columns[i].ColumnName === "SIZE") {
                                            for (var j = 0; j < sizes.length; j++) {
                                                columnData.push({
                                                    "ColumnName": sizes[j].Attribcd,
                                                    "ColumnDesc": sizes[j].Desc1,
                                                    "ColumnType": "COLOR"
                                                })                                            
                                            }
                                        } else {
                                            columnData.push({
                                                "ColumnName": columns[i].ColumnName,
                                                "ColumnDesc": columns[i].ColumnName,
                                                "ColumnType": columns[i].ColumnType
                                            }) 
                                        }                            
                                    }
    
    
                                    me.getbomUVTableData(columnData, sizes);
                                },
                                error: function (err) { }
                            });
                        }               

                    },
                    error: function (err) { }
                });
            },

            getbomUVTableData: function(columnData, pivot) {
                var oTable = this.getView().byId("bomUVTable");
                var oModel = this.getOwnerComponent().getModel();
                var rowData = [];

                var usageClass = this.getView().byId("UsageClassCB").getSelectedKey();

                oModel.setHeaders({
                    styleno: this._styleNo,
                    verno: this._version,
                    usgcls: usageClass
                });
                oModel.read("/StyleBOMUVSet", {
                    success: function (oData, oResponse) {
                        var rowData = oData.results;

                        var unique = rowData.filter((rowData, index, self) =>
                        index === self.findIndex((t) => (t.GMC === rowData.GMC && t.PARTCD === rowData.PARTCD && t.MATTYPCLS === rowData.MATTYPCLS)));

                        for (var i = 0; i < unique.length; i++) {
                            for (var j = 0; j < rowData.length; j++) {
                                if(unique[i].GMC === rowData[j].GMC && unique[i].PARTCD === rowData[j].PARTCD && unique[i].MATTYPCLS === rowData[j].MATTYPCLS) {
                                    // if(rowData[j].COLOR === "C1") {
                                        
                                    // } else if(rowData[j].COLOR === "C2") {
                                    //     unique[i].C2 = rowData[j].DESC1;
                                    // }

                                    for (var k = 0; k < pivot.length; k++) {                                        
                                        var colname = pivot[k].Attribcd;
                                        if(rowData[j].COLOR === colname) {
                                            unique[i][colname] = rowData[j].DESC1;
                                        } else if(rowData[j].SZE === colname) {
                                            unique[i][colname] = rowData[j].DESC1;
                                        }
                                    }
                                }
                            }
                        }

                        rowData = oData.results;
                        var oJSONModel = new JSONModel();
                        oJSONModel.setData({
                            results: unique,
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

            getColumnDesc: function(columnName, columnDesc, columnType) {
                var desc;
                if(columnType === "COLOR" || columnType === "SIZE") {
                    desc = columnDesc;
                } else {
                    desc = "{i18n>" + columnName + "}";
                }
                return desc;
            },

            getDetailedBOM:function(){
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var oTable = this.getView().byId("bomDetailedTable");
                oModel.setHeaders({
                    styleno: this._styleNo,
                    verno: this._version
                });
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

            addLineBOM: function(oEvent) {
                var oButton = oEvent.getSource();
                var tabName = oButton.data('TableName')
                var oTable = this.getView().byId(tabName);
                var oModel = this.getView().byId(tabName).getModel("DataModel");
                var oData = oModel.getProperty('/results');
                oData.items.push({});
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

            removeLineBOM: function(oEvent) {
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
                oData.results.items = oData.results.items.filter(function(value, index) {
                    return selected.indexOf(index) == -1;
                })

                oModel.setData(oData);
                oTable.clearSelection();
                // oData.push({});
                // oTable.getBinding("rows").refresh();
            },

            setEditMode: function(oEvent) {
                var oJSONModel = new JSONModel();
                var data;

                if(oEvent !== undefined) {
                    var oButton = oEvent.getSource();
                    var section = oButton.data('Section')
                
                    var currentMode = this.getView().getModel("EditModeModel");
                    if(currentMode !== undefined) {
                        var currentModeData = currentMode.getData();
                        if(section === "VersionAttributes") 
                            currentModeData.versionAttrEditMode = !currentModeData.versionAttrEditMode;
                        if(section === "BOMbyGMC")
                            currentModeData.bomGMCEditMode = !currentModeData.bomGMCEditMode;
                        if(section === "BOMbyUV")
                            currentModeData.bomUVEditMode = !currentModeData.bomUVEditMode;
                        if(section === "MaterialList")
                            currentModeData.materialListEditMode = !currentModeData.materialListEditMode;
                        data = currentModeData; 
                    }
                } else {
                    data = {
                        versionAttrEditMode: false,
                        bomGMCEditMode: false,
                        bomUVEditMode: false,
                        materialListEditMode: false
                    };           
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

            onUomValueHelp : function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                var attrTyp = oData.getProperty('Valunit');
                this.inputId = oEvent.getSource().getId();
                this.descId = oEvent.getSource().getParent().mAggregations.cells[2].getId();
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
                this._uomValueHelpDialog.open(sInputValue);
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
                    var productInput = this.byId(this.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    var descText= this.byId(this.descId);
                    descText.setText(oSelectedItem.getDescription());
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onProcessesValueHelp : function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                that.inputId = oEvent.getSource().getId();
                if (!that._processesValueHelpDialog) {
                    that._processesValueHelpDialog = sap.ui.xmlfragment(
                        "zui3derp.view.fragments.Processes",
                        that
                    );
                    that.getView().addDependent(that._processesValueHelpDialog);
                }
                that._processesValueHelpDialog.open(sInputValue);
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
                    var productInput = sap.ui.getCore().byId(that.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onMatTypeValueHelp : function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                var attrTyp = oData.getProperty('Valunit');
                that.inputId = oEvent.getSource().getId();
                that.descId = oEvent.getSource().getParent().mAggregations.cells[2].getId();
                if (!that._matTypeValueHelpDialog) {
                    that._matTypeValueHelpDialog = sap.ui.xmlfragment(
                        "zui3derp.view.fragments.MaterialTypes",
                        that
                    );
                    that.getView().addDependent(that._matTypeValueHelpDialog);
                }
                that._matTypeValueHelpDialog.open(sInputValue);
            },

            _matTypeValueHelpSearch : function (evt) {
                var sValue = evt.getParameter("value");
                var oFilter = new Filter(
                    "Desc1",
                    sap.ui.model.FilterOperator.Contains, sValue
                );
                evt.getSource().getBinding("items").filter([oFilter]);
            },
    
            _matTypeValueHelpClose : function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = sap.ui.getCore().byId(that.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    // var descText= that.byId(that.descId);
                    // descText.setText(oSelectedItem.getDescription());
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onGMCValueHelp : function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                var matType = oData.getProperty('MATTYP');
                that.inputId = oEvent.getSource().getId();
                that.matType = oEvent.getSource().getParent().mAggregations.cells[12].getId();
                if (!that._GMCValueHelpDialog) {
                    that._GMCValueHelpDialog = sap.ui.xmlfragment(
                        "zui3derp.view.fragments.GMC",
                        that
                    );
                    that.getView().addDependent(that._GMCValueHelpDialog);
                }
                if(matType !== undefined && matType !== '') {
                    that._GMCValueHelpDialog.getBinding("items").filter([new Filter(
                        "Mattyp",
                        sap.ui.model.FilterOperator.EQ, matType
                    )]);
                }
                
                that._GMCValueHelpDialog.open(sInputValue);
            },

            _GMCValueHelpSearch : function (evt) {
                var sValue = evt.getParameter("value");
                var oFilter = new Filter(
                    "Gmc",
                    sap.ui.model.FilterOperator.Contains, sValue
                );
                evt.getSource().getBinding("items").filter([oFilter]);
            },
    
            _GMCValueHelpClose : function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = sap.ui.getCore().byId(that.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    var matTypeInput= sap.ui.getCore().byId(that.matType);
                    matTypeInput.setValue(oSelectedItem.getInfo());
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onStyleValueHelp : function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                // var matType = oData.getProperty('MATTYP');
                that.inputId = oEvent.getSource().getId();
                that.matType = oEvent.getSource().getParent().mAggregations.cells[12].getId();
                if (!that._styleValueHelpDialog) {
                    that._styleValueHelpDialog = sap.ui.xmlfragment(
                        "zui3derp.view.fragments.Styles",
                        that
                    );
                    that.getView().addDependent(that._styleValueHelpDialog);
                }
                
                that._styleValueHelpDialog.open(sInputValue);
            },

            _styleValueHelpSearch : function (evt) {
                var sValue = evt.getParameter("value");
                var oFilter = new Filter(
                    "Gmc",
                    sap.ui.model.FilterOperator.Contains, sValue
                );
                evt.getSource().getBinding("items").filter([oFilter]);
            },
    
            _styleValueHelpClose : function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = sap.ui.getCore().byId(that.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    var matTypeInput= sap.ui.getCore().byId(that.matType);
                    matTypeInput.setValue(oSelectedItem.getInfo());
                }
                evt.getSource().getBinding("items").filter([]);
            }
        });
    });

