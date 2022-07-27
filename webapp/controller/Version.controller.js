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

            onInit: function () {
                that = this;

                var oComponent = this.getOwnerComponent();
                this._router = oComponent.getRouter();
                this._router.getRoute("RouteVersion").attachPatternMatched(this._routePatternMatched, this);

                this._colors;
                this._sizes;

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

            onRefresh: function() { 
                this.getbomGMCTable("N");
                this.getDetailedBOM();
                this.getMaterialList();
            },

            getHeaderData: function (styleNo) {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var oView = this.getView();
                var entitySet = "/StyleDetailSet('" + styleNo + "')"

                oModel.read(entitySet, {
                    success: function (oData, oResponse) {
                        oData.SelectedVersion = me._version;
                        oJSONModel.setData(oData);
                        oView.setModel(oJSONModel, "headerData");
                    },
                    error: function () { }
                })

            },

            getVersionsData() {
                this.getColors();
                this.getSizes();
                this.getVersionAttrTable();
                this.getbomGMCTable("N");
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

                //get Supply Types
                var oJSONModel9 = new JSONModel();
                oSHModel.read("/SupplyTypeSet", {
                    success: function (oData, oResponse) {
                        me._attrValueHelpData.supplytypes = oData.results;
                        oJSONModel9.setData(me._attrValueHelpData);
                        oView.setModel(oJSONModel9, "ValueHelpModel");
                    },
                    error: function (err) { }
                });

                //get Vendors
                var oJSONModel10 = new JSONModel();
                oSHModel.read("/VendorSet", {
                    success: function (oData, oResponse) {
                        me._attrValueHelpData.vendors = oData.results;
                        oJSONModel10.setData(me._attrValueHelpData);
                        oView.setModel(oJSONModel10, "ValueHelpModel");
                    },
                    error: function (err) { }
                });

                //get Currencies
                var oJSONModel11 = new JSONModel();
                oSHModel.read("/CurrencySet", {
                    success: function (oData, oResponse) {
                        me._attrValueHelpData.currencies = oData.results;
                        oJSONModel11.setData(me._attrValueHelpData);
                        oView.setModel(oJSONModel11, "ValueHelpModel");
                    },
                    error: function (err) { }
                });

                //get Purchasing Groups
                var oJSONModel12 = new JSONModel();
                oSHModel.read("/PurGrpSet", {
                    success: function (oData, oResponse) {
                        me._attrValueHelpData.purgroups = oData.results;
                        oJSONModel12.setData(me._attrValueHelpData);
                        oView.setModel(oJSONModel12, "ValueHelpModel");
                    },
                    error: function (err) { }
                });

                //get Purchasing Plants
                var oJSONModel13 = new JSONModel();
                oSHModel.setHeaders({
                    sbu: this._sbu
                });
                oSHModel.read("/PurPlantSet", {
                    success: function (oData, oResponse) {
                        me._attrValueHelpData.purplants = oData.results;
                        oJSONModel13.setData(me._attrValueHelpData);
                        oView.setModel(oJSONModel13, "ValueHelpModel");
                    },
                    error: function (err) { }
                });
            },

            getVersionAttrTable: function () {
                var oTable = this.getView().byId("versionAttrTable");
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var entitySet = "/StyleVersionAttributesSet"
                oModel.setHeaders({
                    styleno: this._styleNo,
                    verno: this._version
                });
                oModel.read(entitySet, {
                    success: function (oData, oResponse) {
                        oJSONModel.setData(oData);
                        oTable.setModel(oJSONModel, "DataModel");
                    },
                    error: function () { }
                })
            },

            onSaveVersionAttrTable: function () {
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("versionAttrTable").getModel("DataModel");
                var path;

                var oData = oTableModel.getData();
                var oEntry = {
                    Styleno: this._styleNo,
                    Verno: this._version,
                    VersionToItems: []
                }

                for (var i = 0; i < oData.results.length; i++) {

                    var item = {
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
                    success: function (oData, oResponse) {
                        Common.showMessage("Saved");
                    },
                    error: function (err) {
                        Common.showMessage("Error");
                    }
                });
            },

            onGetComponent: function () {
                this.getbomGMCTable("Y");
            },

            getColors: function () {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                oModel.setHeaders({
                    styleno: this._styleNo
                });
                oModel.read("/StyleAttributesColorSet", {
                    success: function (oData, oResponse) {
                        me._colors = oData.results;
                    },
                    error: function (err) { }
                });
            },

            getSizes: function () {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                oModel.setHeaders({
                    styleno: this._styleNo
                });
                oModel.read("/StyleAttributesSizeSet", {
                    success: function (oData, oResponse) {
                        me._sizes = oData.results;
                    },
                    error: function (err) { }
                });
            },

            getbomGMCTable: function (getComponent) {
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
                                "ColumnType": column.ColumnType,
                                "Editable": column.Editable,
                                "Mandatory": column.Mandatory,
                                "Visible": true
                            })
                        })
                        //pivot colors
                        me._colors.forEach((column) => {
                            columnData.push({
                                "ColumnName": column.Attribcd,
                                "ColumnDesc": column.Desc1,
                                "ColumnType": "COLOR",
                                "Editable": column.Editable,
                                "Mandatory": false,
                                "Visible": true
                            })
                        })
                        me.getbomGMCTableData(columnData);
                    },
                    error: function (err) { }
                });
            },

            getbomGMCTableData: function (columnData) {
                var me = this;

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
                            if (oData.results[i].BOMITMTYP === 'STY') {

                                style = oData.results[i].BOMSTYLE;
                                for (var j = 0; j < oData.results.length; j++) {
                                    if (oData.results[j].BOMITMTYP === 'GMC' && oData.results[j].BOMSTYLE === style) {
                                        items.push(oData.results[j]);
                                    }
                                }

                                item = oData.results[i];
                                item.items = items;
                                rowData.items.push(item);
                            } else if (oData.results[i].BOMITMTYP === 'GMC' && oData.results[i].BOMSTYLE === '') {
                                rowData.items.push(oData.results[i]);
                            }
                        }

                        var oJSONModel = new JSONModel();
                        oJSONModel.setData({
                            results: rowData,
                            columns: columnData
                        });

                        oTable.setModel(oJSONModel, "DataModel");

                        oTable.bindColumns("DataModel>/columns", function (sId, oContext) {
                            var column = oContext.getObject();
                            return new sap.ui.table.Column({
                                label: that.getColumnDesc(column),
                                template: that.columnTemplate('GMC', column),
                                sortProperty: column.ColumnName,
                                filterProperty: column.ColumnName,
                                width: "9rem"
                            });
                        });

                        me.getbomUVTable();
                    },
                    error: function (err) { }
                });
            },

            columnTemplate: function (type, column) {
                var columnName = column.ColumnName;
                var columnType = column.ColumnType;
                var editModeCond;

                if(type === "GMC") {
                    editModeCond = '${EditModeModel>/bomGMCEditMode} ? true : false';
                } else {
                    editModeCond = '${EditModeModel>/bomUVEditMode} ? true : false';
                }

                var oColumnTemplate;
                if (columnType === "COLOR") {
                    oColumnTemplate = new sap.m.Input({
                        value: "{DataModel>" + columnName + "}",
                        editable: "{= ${DataModel>USGCLS} === 'AUV' ? " + editModeCond + " : false }",
                        visible: true
                    });
                } else {
                    if (columnName === "BOMSEQ" || columnName === "BOMITEM" || columnName === "DESC1") {
                        oColumnTemplate = new sap.m.Text({ text: "{DataModel>" + columnName + "}" });
                    } else if (columnName === "BOMITMTYP") {
                        oColumnTemplate = new sap.m.ComboBox({
                            value: "{DataModel>" + columnName + "}",
                            items: [{
                                key: "GMC",
                                text: "GMC"
                            }, {
                                key: "STY",
                                text: "STY"
                            }],
                            editable: ((column.Editable) ? "{= " + editModeCond + " }" : false ),
                            visible: column.Visible
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
                            editable: ((column.Editable) ? "{= ${DataModel>BOMITMTYP} === 'STY' ? false : " + editModeCond + " }" : false ),
                            visible: column.Visible
                        });
                    } else if (columnName === "MATTYP") {
                        oColumnTemplate = new sap.m.Input({
                            value: "{DataModel>" + columnName + "}",
                            showValueHelp: true,
                            valueHelpRequest: that.onMatTypeValueHelp,
                            editable: ((column.Editable) ? "{= ${DataModel>BOMITMTYP} === 'STY' ? false : " + editModeCond + " }" : false ),
                            visible: column.Visible
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
                            editable: ((column.Editable) ? "{= ${DataModel>BOMITMTYP} === 'STY' ? false : " + editModeCond + " }" : false ),
                            visible: column.Visible
                        });
                    } else if (columnName === "ENTRYUOM") {
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
                            editable: ((column.Editable) ? "{= ${DataModel>BOMITMTYP} === 'STY' ? false : " + editModeCond + " }" : false ),
                            visible: column.Visible
                        });
                    } else if (columnName === "GMC") {
                        oColumnTemplate = new sap.m.Input({
                            value: "{DataModel>" + columnName + "}",
                            showValueHelp: true,
                            valueHelpRequest: that.onGMCValueHelp,
                            editable: ((column.Editable) ? "{= ${DataModel>BOMITMTYP} === 'STY' ? false : " + editModeCond + " }" : false ),
                            visible: column.Visible
                        });
                    } else if (columnName === "BOMSTYLE") {
                        oColumnTemplate = new sap.m.Input({
                            value: "{DataModel>" + columnName + "}",
                            showValueHelp: true,
                            valueHelpRequest: that.onStyleValueHelp,
                            editable: ((column.Editable) ? "{= ${DataModel>BOMITMTYP} === 'GMC' ? false : " + editModeCond + " }" : false ),
                            visible: column.Visible
                        });
                    } else if (columnName === "BOMSTYLVER") {
                        oColumnTemplate = new sap.m.Input({
                            value: "{DataModel>" + columnName + "}",
                            type: "Number",
                            editable: ((column.Editable) ? "{= ${DataModel>BOMITMTYP} === 'GMC' ? false : " + editModeCond + " }" : false ),
                            visible: column.Visible
                        });
                    } else {
                        oColumnTemplate = new sap.m.Input({
                            value: "{DataModel>" + columnName + "}",
                            editable: ((column.Editable) ? "{= ${DataModel>BOMITMTYP} === 'STY' ? false : " + editModeCond + " }" : false ),
                            visible: column.Visible
                        })
                    }
                }
                return oColumnTemplate;
            },

            onSaveBOMbyGMC: function () {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("bomGMCTable").getModel("DataModel");
                var path;
                var item = {};

                var oData = oTableModel.getData();
                var oEntry = {
                    Styleno: this._styleNo,
                    GMCToItems: []
                }

                for (var i = 0; i < oData.results.items.length; i++) {
                    item = that.addBOMItem(oData.results.items[i]);
                    oEntry.GMCToItems.push(item);

                    if (oData.results.items[i].BOMITMTYP === 'STY') {
                        if (oData.results.items[i].items !== undefined) {
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
                    success: function (oDataRes, oResponse) {
                        Common.showMessage("Saved");
                        me.getbomGMCTable("N");

                        var oEntry = {
                            Styleno: me._styleNo,
                            Verno: me._version,
                            Usgcls: "AUV",
                            UVToItems: []
                        }

                        for (var i = 0; i < oData.results.items.length; i++) {

                            if (oData.results.items[i].USGCLS === "AUV") {
                                for (var j = 0; j < me._colors.length; j++) {

                                    var color = me._colors[j];
                                    item = {
                                        "Styleno": me._styleNo,
                                        "Verno": me._version,
                                        "Gmc": oData.results.items[i].GMC,
                                        "Partcd": oData.results.items[i].PARTCD,
                                        "Usgcls": oData.results.items[i].USGCLS,
                                        "Seqno": " ",
                                        "Bomitem": " ",
                                        "Color": color.Attribcd,
                                        "Sze": " ",
                                        "Dest": " ",
                                        "Mattyp": oData.results.items[i].MATTYP,
                                        "Mattypcls": "ZCOLR",
                                        "Attribcd": " ",
                                        "Desc1": oData.results.items[i][color.Attribcd],
                                        "Consump": " ",
                                        "Wastage": " ",
                                        "Createdby": " ",
                                        "Createddt": " ",
                                        "Updatedby": " ",
                                        "Updateddt": " "
                                    };
                                    oEntry.UVToItems.push(item);
                                }
                            }
                        };

                        if (oEntry.UVToItems.length > 0) {
                            path = "/BOMUVSet";

                            oModel.create(path, oEntry, {
                                method: "POST",
                                success: function (oData, oResponse) {
                                    Common.showMessage("Saved");
                                    me.getbomGMCTable("N");
                                },
                                error: function (err) {
                                    Common.showMessage("Error");
                                }
                            });
                        }

                    },
                    error: function (err) {
                        Common.showMessage("Error");
                    }
                });
            },

            addBOMItem: function (item) {
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
                    "Entryuom": item.ENTRYUOM,
                    "Matconsper": item.CONSUMPPER,
                    "Per": item.PER,
                    "Issueuom": " ",
                    "Matconsump": " ",
                    "Wastage": item.WASTAGE,
                    "Comconsump": item.COMCONSUMP,
                    "Override": " ",
                    "Altconsump": " ",
                    "Consump": item.CONSUMP,
                    "Diml": " ",
                    "Dimw": " ",
                    "Dimuom":  " ",
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

            getbomUVTable: function () {
                var me = this;
                var columnData = [];
                var oModelUV = this.getOwnerComponent().getModel();

                var usageClass = this.getView().byId("UsageClassCB").getSelectedKey();

                oModelUV.setHeaders({
                    sbu: this._sbu,
                    type: 'BOMUV',
                    usgcls: usageClass
                });

                oModelUV.read("/DynamicColumnsSet", {
                    success: function (oData, oResponse) {
                        var columns = oData.results;

                        if (usageClass === "AUV") {
                            for (var i = 0; i < columns.length; i++) {
                                if (columns[i].ColumnName === "COLOR") {
                                    for (var j = 0; j < me._colors.length; j++) {
                                        columnData.push({
                                            "ColumnName": me._colors[j].Attribcd,
                                            "ColumnDesc": me._colors[j].Desc1,
                                            "ColumnType": "COLOR",
                                            "Editable": true,
                                            "Mandatory": false,
                                            "Visible": true
                                        })
                                    }
                                } else {
                                    columnData.push({
                                        "ColumnName": columns[i].ColumnName,
                                        "ColumnDesc": columns[i].ColumnName,
                                        "ColumnType": columns[i].ColumnType,
                                        "Editable": columns[i].Editable,
                                        "Mandatory": columns[i].Mandatory,
                                        "Visible": true
                                    })
                                }
                            }
                            me.getbomUVTableData(columnData, me._colors);

                        } else if (usageClass === "SUV") {

                            for (var i = 0; i < columns.length; i++) {
                                if (columns[i].ColumnName === "SIZE") {
                                    for (var j = 0; j < me._sizes.length; j++) {
                                        columnData.push({
                                            "ColumnName": me._sizes[j].Attribcd,
                                            "ColumnDesc": me._sizes[j].Desc1,
                                            "ColumnType": "SIZE",
                                            "Editable": true,
                                            "Mandatory": false,
                                            "Visible": true
                                        })
                                    }
                                } else {
                                    columnData.push({
                                        "ColumnName": columns[i].ColumnName,
                                        "ColumnDesc": columns[i].ColumnName,
                                        "ColumnType": columns[i].ColumnType,
                                        "Editable": columns[i].Editable,
                                        "Mandatory": columns[i].Mandatory,
                                        "Visible": true
                                    })
                                }
                            }
                            me.getbomUVTableData(columnData, me._sizes);
                        }

                    },
                    error: function (err) { }
                });
            },

            getbomUVTableData: function (columnData, pivot) {
                var oTable = this.getView().byId("bomUVTable");
                var oModel = this.getOwnerComponent().getModel();
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

                            //Merge BOM by UV
                            for (var j = 0; j < rowData.length; j++) {
                                if (unique[i].GMC === rowData[j].GMC && unique[i].PARTCD === rowData[j].PARTCD && unique[i].MATTYPCLS === rowData[j].MATTYPCLS) {
                                    for (var k = 0; k < pivot.length; k++) {
                                        var colname = pivot[k].Attribcd;
                                        if (rowData[j].COLOR === colname) {
                                            unique[i][colname] = rowData[j].DESC1;
                                        } else if (rowData[j].SZE === colname) {
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

                        oTable.bindColumns("DataModel>/columns", function (sId, oContext) {
                            var column = oContext.getObject();
                            return new sap.ui.table.Column({
                                label: that.getColumnDesc(column),
                                template: that.columnTemplate('UV',column),
                                sortProperty: column.ColumnName,
                                filterProperty: column.ColumnName,
                                width: "8rem"
                            });
                        });

                        oTable.bindRows("DataModel>/results");

                        var oTableGMC = that.getView().byId("bomGMCTable");
                        var oGMCTableData = oTableGMC.getModel('DataModel').getData();

                        for (var i = 0; i < oGMCTableData.results.items.length; i++) {
                            for (var k = 0; k < pivot.length; k++) {
                                var colorName = pivot[k].Attribcd;
                                for (var j = 0; j < rowData.length; j++) {
                                    if (rowData[j].MATTYPCLS === 'ZCOLR' && rowData[j].COLOR === colorName) {
                                        if (oGMCTableData.results.items[i].GMC === rowData[j].GMC && oGMCTableData.results.items[i].PARTCD === rowData[j].PARTCD && oGMCTableData.results.items[i].MATTYP === rowData[j].MATTYP) {
                                            oGMCTableData.results.items[i][colorName] = rowData[j].DESC1;
                                        }
                                    }
                                }
                            }
                        }

                        oTableGMC.getBinding("rows").refresh();
                    },
                    error: function (err) { }
                });
            },

            getColumnDesc: function (column) {
                var desc;
                if (column.ColumnType === "COLOR" || column.ColumnType === "SIZE") {
                    desc = column.ColumnDesc;
                } else {
                    desc = "{i18n>" + column.ColumnName + "}";
                }
                return desc;
            },

            onSaveBOMbyUV: function () {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("bomUVTable").getModel("DataModel");
                var usageClass = this.getView().byId("UsageClassCB").getSelectedKey();
                var path;
                var item = {};

                var oData = oTableModel.getData();
                var oEntry = {
                    Styleno: this._styleNo,
                    Verno: this._version,
                    Usgcls: usageClass,
                    UVToItems: []
                }

                for (var i = 0; i < oData.results.length; i++) {

                    if (usageClass === "AUV") {
                        for (var j = 0; j < this._colors.length; j++) {

                            var color = this._colors[j];
                            item = {
                                "Styleno": this._styleNo,
                                "Verno": this._version,
                                "Gmc": oData.results[i].GMC,
                                "Partcd": oData.results[i].PARTCD,
                                "Usgcls": oData.results[i].USGCLS,
                                "Seqno": " ",
                                "Bomitem": " ",
                                "Color": color.Attribcd,
                                "Sze": " ",
                                "Dest": " ",
                                "Mattyp": oData.results[i].MATTYP,
                                "Mattypcls": oData.results[i].MATTYPCLS,
                                "Attribcd": oData.results[i].ATTRIBCD,
                                "Desc1": oData.results[i][color.Attribcd],
                                "Consump": oData.results[i].CONSUMP,
                                "Wastage": oData.results[i].WASTAGE,
                                "Createdby": " ",
                                "Createddt": " ",
                                "Updatedby": " ",
                                "Updateddt": " "
                            };
                            oEntry.UVToItems.push(item);
                        }
                    } else if (usageClass === "SUV") {
                        for (var k = 0; k < this._sizes.length; k++) {

                            var size = this._sizes[k];
                            item = {
                                "Styleno": this._styleNo,
                                "Verno": this._version,
                                "Gmc": oData.results[i].GMC,
                                "Partcd": oData.results[i].PARTCD,
                                "Usgcls": oData.results[i].USGCLS,
                                "Seqno": " ",
                                "Bomitem": " ",
                                "Color": " ",
                                "Sze": size.Attribcd,
                                "Dest": " ",
                                "Mattyp": oData.results[i].MATTYP,
                                "Mattypcls": oData.results[i].MATTYPCLS,
                                "Attribcd": oData.results[i].ATTRIBCD,
                                "Desc1": oData.results[i][size.Attribcd],
                                "Consump": oData.results[i].CONSUMP,
                                "Wastage": oData.results[i].WASTAGE,
                                "Createdby": " ",
                                "Createddt": " ",
                                "Updatedby": " ",
                                "Updateddt": " "
                            };
                            oEntry.UVToItems.push(item);
                        }
                    }
                };

                path = "/BOMUVSet";

                oModel.create(path, oEntry, {
                    method: "POST",
                    success: function (oData, oResponse) {
                        Common.showMessage("Saved");
                        me.getbomGMCTable("N");
                    },
                    error: function (err) {
                        Common.showMessage("Error");
                    }
                });
            },

            onRMC: function() {
                var oModel = this.getOwnerComponent().getModel();

                var entitySet = "/StyleBOMGMCSet(STYLENO='" + this._styleNo +  "',VERNO='" + this._version + "')";

                oModel.setHeaders({sbu: this._sbu});

                var oEntry = {
                    STYLENO: this._styleNo,
                    VERNO: this._version
                };

                oModel.update(entitySet, oEntry, {
                    method: "PUT",
                    success: function(data, oResponse) {
                        Common.showMessage("Saved");
                    },
                    error: function() {
                        Common.showMessage("Error");
                    }
                });
            },

            getDetailedBOM: function () {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var oTable = this.getView().byId("bomDetailedTable");
                var rowData = {
                    items: []
                };
                var data = {results: rowData};
                
                oModel.setHeaders({
                    styleno: this._styleNo,
                    verno: this._version
                });
                var entitySet = "/StyleDetailedBOMSet"
                oModel.read(entitySet, {
                    success: function (oData, oResponse) {

                        var style;
                        var gmc;
                        var partcd;
                        var item = {};
                        var item2 = {};
                        var items = [];
                        var items2 = [];

                        for (var i = 0; i < oData.results.length; i++) {

                            if (oData.results[i].Bomitmtyp === 'STY') {

                                item = oData.results[i];
                                items = [];

                                style = oData.results[i].Bomstyle;
                                for (var j = 0; j < oData.results.length; j++) {
                                    if (oData.results[j].Bomitmtyp === 'GMC' && oData.results[j].Bomstyle === style) {
                                        
                                        items2 = [];

                                        item2 = oData.results[j];

                                        gmc = oData.results[j].Gmc;
                                        partcd = oData.results[j].Partcd;
                                        for (var k = 0; k < oData.results.length; k++) {
                                            if (oData.results[k].Bomitmtyp === 'MAT' && oData.results[k].Gmc === gmc && oData.results[k].Partcd === partcd) {
                                                items2.push(oData.results[k]);
                                            }
                                        }

                                        item2.items = items2;
                                        items.push(item2);
                                    }
                                }

                                item.items = items;
                                rowData.items.push(item);
                            } else if (oData.results[i].Bomitmtyp === 'GMC' && oData.results[i].Bomstyle === '') {

                                items = [];

                                item = oData.results[i];

                                gmc = oData.results[i].Gmc;
                                partcd = oData.results[i].Partcd;
                                for (var k = 0; k < oData.results.length; k++) {
                                    if (oData.results[k].Bomitmtyp === 'MAT' && oData.results[k].Gmc === gmc && oData.results[k].Partcd === partcd) {
                                        items.push(oData.results[k]);
                                    }
                                }

                                item.items = items;
                                rowData.items.push(item);
                            }
                        }

                        oJSONModel.setData(data);
                        oTable.setModel(oJSONModel, "DataModel");
                    },
                    error: function () { }
                })
            },

            getMaterialList: function () {
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
                    success: function (oData, oResponse) {
                        oJSONModel.setData(oData);
                        oTable.setModel(oJSONModel, "DataModel");
                    },
                    error: function () { }
                })
            },

            onSaveMaterialList: function() {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("materialListTable").getModel("DataModel");
                var path;

                var oData = oTableModel.getData();
                var oEntry = {
                    Styleno: this._styleNo,
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
                        me.getMaterialList();
                        Common.showMessage("Saved");
                    },
                    error: function(err) {
                        Common.showMessage("Error");
                    }
                });
            },

            onAssignMaterial: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteAssignMaterial", {
                    styleno: this._styleNo,
                    sbu: this._sbu,
                    version: this._version
                });
            },

            addLine: function (oEvent) {
                var oButton = oEvent.getSource();
                var tabName = oButton.data('TableName')
                var oTable = this.getView().byId(tabName);
                var oModel = this.getView().byId(tabName).getModel("DataModel");
                var oData = oModel.getProperty('/results');
                oData.push({});
                oTable.getBinding("rows").refresh();
            },

            addLineBOM: function (oEvent) {
                var oButton = oEvent.getSource();
                var tabName = oButton.data('TableName')
                var oTable = this.getView().byId(tabName);
                var oModel = this.getView().byId(tabName).getModel("DataModel");
                var oData = oModel.getProperty('/results');
                oData.items.push({});
                oTable.getBinding("rows").refresh();
            },

            removeLine: function (oEvent) {
                var oButton = oEvent.getSource();
                var tabName = oButton.data('TableName')
                var oTable = this.getView().byId(tabName);
                var oModel = this.getView().byId(tabName).getModel("DataModel");
                var oData = oModel.getData(); // oModel.getProperty('/results');
                var selected = oTable.getSelectedIndices();
                oData.results = oData.results.filter(function (value, index) {
                    return selected.indexOf(index) == -1;
                })

                oModel.setData(oData);
                oTable.clearSelection();
            },

            removeLineBOM: function (oEvent) {
                var oButton = oEvent.getSource();
                var tabName = oButton.data('TableName')
                var oTable = this.getView().byId(tabName);
                var oModel = this.getView().byId(tabName).getModel("DataModel");
                var oData = oModel.getData();
                var selected = oTable.getSelectedIndices();
                oData.results.items = oData.results.items.filter(function (value, index) {
                    return selected.indexOf(index) == -1;
                })

                oModel.setData(oData);
                oTable.clearSelection();
            },

            setEditMode: function (oEvent) {
                var oJSONModel = new JSONModel();
                var data;

                if (oEvent !== undefined) {
                    var oButton = oEvent.getSource();
                    var section = oButton.data('Section')

                    var currentMode = this.getView().getModel("EditModeModel");
                    if (currentMode !== undefined) {
                        var currentModeData = currentMode.getData();
                        if (section === "VersionAttributes")
                            currentModeData.versionAttrEditMode = !currentModeData.versionAttrEditMode;
                        if (section === "BOMbyGMC")
                            currentModeData.bomGMCEditMode = !currentModeData.bomGMCEditMode;
                        if (section === "BOMbyUV")
                            currentModeData.bomUVEditMode = !currentModeData.bomUVEditMode;
                        if (section === "MaterialList")
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

            onAttrTypesValueHelp: function (oEvent) {
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

            _attrTypesValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var oFilter = new Filter(
                    "Attribtyp",
                    sap.ui.model.FilterOperator.Contains, sValue
                );
                evt.getSource().getBinding("items").filter([oFilter]);
            },

            _attrTypesValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = this.byId(this.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onAttrCodesValueHelp: function (oEvent) {
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

            _attrCodesValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var oFilter = new Filter(
                    "Desc1",
                    sap.ui.model.FilterOperator.Contains, sValue
                );
                evt.getSource().getBinding("items").filter([oFilter]);
            },

            _attrCodesValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = this.byId(this.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    var descText = this.byId(this.descId);
                    descText.setText(oSelectedItem.getDescription());
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onUomValueHelp: function (oEvent) {
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
                this._uomValueHelpDialog.open(sInputValue);
            },

            _uomValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var oFilter = new Filter(
                    "Desc1",
                    sap.ui.model.FilterOperator.Contains, sValue
                );
                evt.getSource().getBinding("items").filter([oFilter]);
            },

            _uomValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = this.byId(this.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    var descText = this.byId(this.descId);
                    descText.setText(oSelectedItem.getDescription());
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onProcessesValueHelp: function (oEvent) {
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

            _processesValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var oFilter = new Filter(
                    "Desc1",
                    sap.ui.model.FilterOperator.Contains, sValue
                );
                evt.getSource().getBinding("items").filter([oFilter]);
            },

            _processesValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = sap.ui.getCore().byId(that.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onMatTypeValueHelp: function (oEvent) {
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

            _matTypeValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var oFilter = new Filter(
                    "Desc1",
                    sap.ui.model.FilterOperator.Contains, sValue
                );
                evt.getSource().getBinding("items").filter([oFilter]);
            },

            _matTypeValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = sap.ui.getCore().byId(that.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onGMCValueHelp: function (oEvent) {
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
                if (matType !== undefined && matType !== '') {
                    that._GMCValueHelpDialog.getBinding("items").filter([new Filter(
                        "Mattyp",
                        sap.ui.model.FilterOperator.EQ, matType
                    )]);
                }

                that._GMCValueHelpDialog.open(sInputValue);
            },

            _GMCValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var oFilter = new Filter(
                    "Gmc",
                    sap.ui.model.FilterOperator.Contains, sValue
                );
                evt.getSource().getBinding("items").filter([oFilter]);
            },

            _GMCValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = sap.ui.getCore().byId(that.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    var matTypeInput = sap.ui.getCore().byId(that.matType);
                    matTypeInput.setValue(oSelectedItem.getInfo());
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onStyleValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
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

            _styleValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var oFilter = new Filter(
                    "Gmc",
                    sap.ui.model.FilterOperator.Contains, sValue
                );
                evt.getSource().getBinding("items").filter([oFilter]);
            },

            _styleValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = sap.ui.getCore().byId(that.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    var matTypeInput = sap.ui.getCore().byId(that.matType);
                    matTypeInput.setValue(oSelectedItem.getInfo());
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onSupplyTypeValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                // var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                that.inputId = oEvent.getSource().getId();
                // that.matType = oEvent.getSource().getParent().mAggregations.cells[12].getId();
                if (!that._supplyTypeValueHelpDialog) {
                    that._supplyTypeValueHelpDialog = sap.ui.xmlfragment(
                        "zui3derp.view.fragments.SupplyTypes",
                        that
                    );
                    that.getView().addDependent(that._supplyTypeValueHelpDialog);
                }

                that._supplyTypeValueHelpDialog.open(sInputValue);
            },

            _supplyTypeValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var oFilter = new Filter(
                    "Supplytype",
                    sap.ui.model.FilterOperator.Contains, sValue
                );
                evt.getSource().getBinding("items").filter([oFilter]);
            },

            _supplyTypeValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = sap.ui.getCore().byId(that.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onVendorValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                // var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                that.inputId = oEvent.getSource().getId();
                // that.matType = oEvent.getSource().getParent().mAggregations.cells[12].getId();
                if (!that._vendorValueHelpDialog) {
                    that._vendorValueHelpDialog = sap.ui.xmlfragment(
                        "zui3derp.view.fragments.Vendors",
                        that
                    );
                    that.getView().addDependent(that._vendorValueHelpDialog);
                }

                that._vendorValueHelpDialog.open(sInputValue);
            },

            _vendorValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var oFilter = new Filter(
                    "Desc1",
                    sap.ui.model.FilterOperator.Contains, sValue
                );
                evt.getSource().getBinding("items").filter([oFilter]);
            },

            _vendorValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = sap.ui.getCore().byId(that.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onCurrencyValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                // var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                that.inputId = oEvent.getSource().getId();
                // that.matType = oEvent.getSource().getParent().mAggregations.cells[12].getId();
                if (!that._currencyValueHelpDialog) {
                    that._currencyValueHelpDialog = sap.ui.xmlfragment(
                        "zui3derp.view.fragments.Currencies",
                        that
                    );
                    that.getView().addDependent(that._currencyValueHelpDialog);
                }

                that._currencyValueHelpDialog.open(sInputValue);
            },

            _currencyValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var oFilter = new Filter(
                    "Waers",
                    sap.ui.model.FilterOperator.Contains, sValue
                );
                evt.getSource().getBinding("items").filter([oFilter]);
            },

            _currencyValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = sap.ui.getCore().byId(that.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onPurGroupValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                // var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                that.inputId = oEvent.getSource().getId();
                // that.matType = oEvent.getSource().getParent().mAggregations.cells[12].getId();
                if (!that._purGroupValueHelpDialog) {
                    that._purGroupValueHelpDialog = sap.ui.xmlfragment(
                        "zui3derp.view.fragments.PurchasingGroups",
                        that
                    );
                    that.getView().addDependent(that._purGroupValueHelpDialog);
                }

                that._purGroupValueHelpDialog.open(sInputValue);
            },

            _purGroupValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var oFilter = new Filter(
                    "Purgrp",
                    sap.ui.model.FilterOperator.Contains, sValue
                );
                evt.getSource().getBinding("items").filter([oFilter]);
            },

            _purGroupValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = sap.ui.getCore().byId(that.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onPurPlantValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                // var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                that.inputId = oEvent.getSource().getId();
                // that.matType = oEvent.getSource().getParent().mAggregations.cells[12].getId();
                if (!that._purPlantValueHelpDialog) {
                    that._purPlantValueHelpDialog = sap.ui.xmlfragment(
                        "zui3derp.view.fragments.PurchasingPlants",
                        that
                    );
                    that.getView().addDependent(that._purPlantValueHelpDialog);
                }

                that._purPlantValueHelpDialog.open(sInputValue);
            },

            _purPlantValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var oFilter = new Filter(
                    "Plant",
                    sap.ui.model.FilterOperator.Contains, sValue
                );
                evt.getSource().getBinding("items").filter([oFilter]);
            },

            _purPlantValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = sap.ui.getCore().byId(that.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onExportExcel: Common.onExportExcel
        });
    });

