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

                this._User = 'EMALLARI';
                this._attrValueHelpData = {
                    Attributes: [],
                    AttributeCodes: [],
                    uom: []
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
                this.getbomGMCTable();
                this.getbomUVTable();
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

            columnTemplate: function(columnName, columnDesc, columnType) {
                var oColumnTemplate;
                if(columnName === "BOMSEQ" || columnName === "BOMITEM") {
                    oColumnTemplate = new sap.m.Text({ text: "{DataModel>" + columnName + "}" });
                } else if (columnName === "BOMITMTYP") {
                    oColumnTemplate = new sap.m.ComboBox({ 
                            value: "{DataModel>" + columnName + "}",
                            items: [{
                                    key: "GMC",
                                    text: "GMC"
                                },{
                                    key: "STYLE",
                                    text: "STYLE"
                            }]                             
                        });
                } else {
                    oColumnTemplate = new sap.m.Input({ value: "{DataModel>" + columnName + "}" })
                }
                return oColumnTemplate;
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
            }
        });
    });

