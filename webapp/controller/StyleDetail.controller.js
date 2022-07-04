sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel) {
        "use strict";

        var that;

        return Controller.extend("zui3derp.controller.StyleDetail", {
            
            onInit: function() {
                that = this;  
                var oComponent = this.getOwnerComponent();
                this._router = oComponent.getRouter();
                this._router.getRoute("RouteStyleDetail").attachPatternMatched(this._routePatternMatched, this);

                this._User = 'EMALLARI';
                // this.oVersionsTable();
                // this.oAttachmentsTable();
            },

            _routePatternMatched: function (oEvent) {
                var styleNo = oEvent.getParameter("arguments").styleno;
                var sbu = oEvent.getParameter("arguments").sbu;

                this._styleNo = styleNo;
                this._sbu = sbu;
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
                this.getGeneralTable();
                this.getColorsTable();
                this.getSizesTable();
                this.getProcessesTable();
                this.getVersionsTable();
                // this.getVersionsData();
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
                    sbu: this._sbu
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
            },
            
            getGeneralTable:function(){
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

            getColorsTable:function(){
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

            getSizesTable:function(){
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
                // var oButton = oEvent.getSource();
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
                var oModel = this.getOwnerComponent().getModel();

                var entitySet = "/StyleVersionSet(Styleno='" + this._styleNo +  "',Verno='002')";
                var oEntry = { };

                oModel.update(entitySet, oEntry, {
                    method: "PUT",
                    success: function(data, oResponse) {
                        me.getVersionsTable();
                    },
                    error: function() {
                        
                    }
                });
            },

            getbomGMCTable: function() {
                var me = this;
                var columnData = [];

                var oModel = this.getOwnerComponent().getModel();
                var oJSONColumnsModel = new sap.ui.model.json.JSONModel();

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

                        // rowData = [{
                        //     PARENT: 1,
                        //     BOMSEQ: 1,
                        //     CHILD: [{
                        //         BOMSEQ: 2
                        //     }]
                        // }]

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

            addLine: function(oEvent) {
                var oButton = oEvent.getSource();
                var tabName = oButton.data('TableName')
                var oTable = this.getView().byId(tabName);
                var oModel = this.getView().byId(tabName).getModel("DataModel");
                var oData = oModel.getProperty('/results');
                oData.push({});
                oTable.getBinding("rows").refresh();
            },

            addGeneralAttr: function() {
                var oModel = this.getView().byId("generalTable").getModel("DataModel");
                var oData = oModel.getProperty('/results');
                oData.push({});

                var oTable = this.getView().byId("generalTable");
                oTable.getBinding("rows").refresh();
            },

            uploadAttachment: function() {
                if (!this._UploadFileDialog) {
                    this._UploadFileDialog = sap.ui.xmlfragment("zui3derp.view.fragments.UploadFile", this);
                    this.getView().addDependent(this._ConfirmNewDialog);
                }
                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                this._UploadFileDialog.addStyleClass("sapUiSizeCompact");
                this._UploadFileDialog.open();
            }
        });
    });
