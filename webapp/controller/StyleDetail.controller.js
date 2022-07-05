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
        this._valueHelpData;

        return Controller.extend("zui3derp.controller.StyleDetail", {
            
            onInit: function() {
                that = this;  
                var oComponent = this.getOwnerComponent();
                this._router = oComponent.getRouter();
                this._router.getRoute("RouteStyleDetail").attachPatternMatched(this._routePatternMatched, this);

                this._User = 'EMALLARI';
                this._valueHelpData = {
                    seasons: [],
                    salesgroups: [],
                    customergroups: [],
                    producttypes: [],
                    attributes: [],
                    attributecodes: [],
                    processes: [],
                    vastypes: []
                };
            },

            _routePatternMatched: function (oEvent) {
                this._styleNo = oEvent.getParameter("arguments").styleno;
                this._sbu = oEvent.getParameter("arguments").sbu;

                if(this._styleNo === "NEW") {
                    var oJSONModel = new JSONModel();
                    var data = {
                        "Styleno": "New Style",
                        "Statuscd": "CRT"
                    };                    
                    oJSONModel.setData(data);
                    this.getView().setModel(oJSONModel, "headerData");
                    this.setEditMode("NEW");
                } else {
                    this.getHeaderData(this._styleNo);
                    this.setEditMode();
                }
                this.getComboBoxData();
                this.getGeneralTable();
                this.getColorsTable();
                this.getSizesTable();
                this.getProcessesTable();
                this.getVersionsTable();
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
                var oJSONModel0 = new sap.ui.model.json.JSONModel();
                var oView = this.getView();
                oModel.setHeaders({
                    sbu: this._sbu
                });
                oModel.read("/SeasonSet", {
                    success: function (oData, oResponse) {
                        me._valueHelpData.seasons = oData.results;
                        oJSONModel0.setData(me._valueHelpData);
                        oView.setModel(oJSONModel0, "ValueHelpModel");
                    },
                    error: function (err) { }
                });

                //get Attributes
                var oJSONModel1 = new sap.ui.model.json.JSONModel();
                var oView = this.getView();
                oModel.setHeaders({
                    dispgrp: "STYINFO"
                });
                oModel.read("/AttribTypeSet", {
                    success: function (oData, oResponse) {
                        me._valueHelpData.attributes = oData.results;
                        oJSONModel1.setData(me._valueHelpData);
                        oView.setModel(oJSONModel1, "ValueHelpModel");
                    },
                    error: function (err) { }
                });

                //get Attribute Codes
                var oJSONModela = new sap.ui.model.json.JSONModel();
                var oView = this.getView();
                oModel.read("/AttribCodeSet", {
                    success: function (oData, oResponse) {
                        me._valueHelpData.attributecodes = oData.results;
                        oJSONModela.setData(me._valueHelpData);
                        oView.setModel(oJSONModela, "ValueHelpModel");
                    },
                    error: function (err) { }
                });

                //get Product Types
                var oJSONModel2 = new sap.ui.model.json.JSONModel();
                var prodTypeCB = this.getView().byId("prodTypeCB");
                oModel.setHeaders({
                    sbu: this._sbu
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

                //Process Codes
                var oJSONModel5 = new sap.ui.model.json.JSONModel();
                oModel.read("/ProcessCodeSet", {
                    success: function (oData, oResponse) {
                        me._valueHelpData.processes = oData.results;
                        oJSONModel5.setData(me._valueHelpData);
                        oView.setModel(oJSONModel5, "ValueHelpModel");
                    },
                    error: function (err) { }
                });

                //VAS Types
                var oJSONModel6 = new sap.ui.model.json.JSONModel();
                oModel.read("/VASTypeSet", {
                    success: function (oData, oResponse) {
                        me._valueHelpData.vastypes = oData.results;
                        oJSONModel6.setData(me._valueHelpData);
                        oView.setModel(oJSONModel6, "ValueHelpModel");
                    },
                    error: function (err) { }
                });

                //Usage Classes
                var oJSONModel7 = new sap.ui.model.json.JSONModel();
                oModel.read("/UsageClassSet", {
                    success: function (oData, oResponse) {
                        me._valueHelpData.usageclasses = oData.results;
                        oJSONModel7.setData(me._valueHelpData);
                        oView.setModel(oJSONModel7, "ValueHelpModel");
                    },
                    error: function (err) { }
                });
            },
            
            getGeneralTable:function(){
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

            getColorsTable:function(){
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

            getSizesTable:function(){
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

            getProcessesTable:function(){
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

            getVersionsTable: function(){
                var oTable = this.getView().byId("versionsTable");
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new sap.ui.model.json.JSONModel();
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

            onSelectVersion: function(oEvent) {
                var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                var version = oData.getProperty('Verno');
                var desc;
                var desc1 = oData.getProperty('Desc1');
                var desc2 = oData.getProperty('Desc1');
                if(desc1 !== undefined) {
                    desc = desc1;
                } else {
                    desc = desc2;
                }

                var oObjHeader = this.getView().byId("VersionHeader");
                oObjHeader.setTitle(desc);
                oObjHeader.setIntro('Version ' + version);

                this._version = version;
                this.getVersionsData();
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
                var oJSONModel = new sap.ui.model.json.JSONModel();
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
                        me.getVersionsTable();
                    },
                    error: function() {
                        
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
                        var oJSONModel = new sap.ui.model.json.JSONModel();
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
                var oJSONColumnsModel = new sap.ui.model.json.JSONModel();

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

                        var oJSONModel = new sap.ui.model.json.JSONModel();
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
                var oJSONModel = new sap.ui.model.json.JSONModel();
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
                var oJSONModel = new sap.ui.model.json.JSONModel();
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
                        genAttrEditMode: true,
                        colorsEditMode: true,
                        sizesEditMode: true,
                        processEditMode: true
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
                            data = currentModeData; 
                        }
                    } else {
                        data = {
                            headerEditMode: false,
                            genAttrEditMode: false,
                            colorsEditMode: false,
                            sizesEditMode: false,
                            processEditMode: false
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
                    "AttribTyp",
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
                var attrTyp = oData.getProperty('AttribTyp');
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
                    "AttribTyp",
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
                var ProcessCd = oData.getProperty('ProcessCd');

                if (!this._VASTypeValueHelpDialog) {
                    this._VASTypeValueHelpDialog = sap.ui.xmlfragment(
                        "zui3derp.view.fragments.VASTypes",
                        this
                    );
                    this.getView().addDependent(this._VASTypeValueHelpDialog);
                }
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

            uploadAttachment: function() {
                if (!this._UploadFileDialog) {
                    this._UploadFileDialog = sap.ui.xmlfragment("zui3derp.view.fragments.UploadFile", this);
                    this.getView().addDependent(this._ConfirmNewDialog);
                }
                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                this._UploadFileDialog.addStyleClass("sapUiSizeCompact");
                this._UploadFileDialog.open();
            },

            pad: function (num, size) {
                num = num.toString();
                while (num.length < size) num = "0" + num;
                return num;
            },

            onCancelNewVersion: Common.onCancelNewVersion,

            onCancelUploadFile: Common.onCancelUploadFile
        });
    });
