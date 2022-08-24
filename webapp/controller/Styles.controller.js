sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../js/Common",
    "../js/Utils",
    "sap/ui/model/json/JSONModel",
    "sap/ui/export/Spreadsheet",
    "../control/DynamicTable"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Common, Utils, JSONModel, Spreadsheet, control) {
        "use strict";

        var that;

        return Controller.extend("zui3derp.controller.Styles", {

            onInit: function () {
                that = this;
                
                var oComponent = this.getOwnerComponent();
                this._router = oComponent.getRouter();
                this._router.getRoute("RouteStyles").attachPatternMatched(this._routePatternMatched, this);

                this._Model = this.getOwnerComponent().getModel();
                this.setSmartFilterModel();

                this._i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },

            setChangeStatus: function(changed) {
                try {
                    sap.ushell.Container.setDirtyFlag(changed);
                } catch (err) {}
            },

            setSmartFilterModel: function () {
                var oModel = this.getOwnerComponent().getModel("StyleHeaderFilters");
                var oSmartFilter = this.getView().byId("SmartFilterBar");
                oSmartFilter.setModel(oModel);
            },

            onSearch: function () {
                this.getDynamicTableColumns();
                this.onStyleReader();
            },

            getDynamicTableColumns: function () {
                var me = this;

                //get dynamic columns
                var oJSONColumnsModel = new JSONModel();
                this.oJSONModel = new JSONModel();

                this._sbu = this.getView().byId("SmartFilterBar").getFilterData().SBU;
                this._Model.setHeaders({
                    sbu: this._sbu,
                    type: 'STYLINIT'
                });
                this._Model.read("/DynamicColumnsSet", {
                    success: function (oData, oResponse) {
                        oJSONColumnsModel.setData(oData);
                        me.oJSONModel.setData(oData);
                        me.getView().setModel(oJSONColumnsModel, "DynColumns");
                        me.getDynamicTableData(oData.results);
                    },
                    error: function (err) { }
                });
            },

            getDynamicTableData: function (columns) {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var selectString = "";
                var lv1 = "Col";
                var i = 1;
                var statusColNo;

                

                //build select columns
                var oColCount = columns.length;
                columns.forEach((column) => {

                    if (column.ColumnName === "STATUSCD")
                        statusColNo = i;

                    if (column.ColumnName === "STYLENO")
                        this._StyleNoColNo = i;

                    var lv2 = this.pad(i, 3);
                    i++;

                    var colString = lv1 + lv2;
                    selectString += colString + ",";
                })
                selectString = selectString.slice(0, -1);

                //get dynamic data
                var oJSONDataModel = new JSONModel();
                var aFilters = this.getView().byId("SmartFilterBar").getFilters();
                var oText = this.getView().byId("StylesCount");

                this.addDateFilters(aFilters);

                oModel.read("/StyleSet", {
                    filters: aFilters,
                    success: function (oData, oResponse) {
                        oText.setText(oData.results.length + "");
                        oJSONDataModel.setData(oData);
                        me.getView().setModel(oJSONDataModel, "DataModel");
                        me.setTableData(statusColNo);
                        me.setChangeStatus(false);
                    },
                    error: function (err) { }
                });
            },

            addDateFilters: function(aFilters) {
                var createdDate = this.getView().byId("CreatedDatePicker").getValue();
                    if(createdDate !== undefined && createdDate !== '') {
                        createdDate = createdDate.replace(/\s/g, '').toString();
                        var createDateStr = createdDate.split('–');
                        var createdDate1 = createDateStr[0];
                        var createdDate2 = createDateStr[1];
                        if(createdDate2 === undefined) {
                            createdDate2 = createdDate1;
                        }
                        var lv_createdDateFilter = new sap.ui.model.Filter({
                            path: "CREATEDDT",
                            operator: sap.ui.model.FilterOperator.BT,
                            value1: createdDate1,
                            value2: createdDate2
                    });
                    
                    aFilters.push(lv_createdDateFilter);
                }

                var updatedDate = this.getView().byId("UpdatedDatePicker").getValue();
                    if(updatedDate !== undefined && updatedDate !== '') {
                        updatedDate = updatedDate.replace(/\s/g, '').toString();
                        var createDateStr = updatedDate.split('–');
                        var updatedDate1 = createDateStr[0];
                        var updatedDate2 = createDateStr[1];
                        if(updatedDate2 === undefined) {
                            updatedDate2 = updatedDate1;
                        }
                        var lv_updatedDateFilter = new sap.ui.model.Filter({
                            path: "UPDATEDDT",
                            operator: sap.ui.model.FilterOperator.BT,
                            value1: updatedDate1,
                            value2: updatedDate2
                    });
                    
                    aFilters.push(lv_updatedDateFilter);
                }
            },

            setTableData: function (statusColNo) {
                var me = this;

                var oColumnsModel = this.getView().getModel("DynColumns");
                var oDataModel = this.getView().getModel("DataModel");

                var oColumnsData = oColumnsModel.getProperty('/results');
                var oData = oDataModel.getProperty('/results');

                oColumnsData.unshift({
                    "ColumnName": "Copy",
                    "ColumnType": "COPY",
                    "Visible": false
                });

                oColumnsData.unshift({
                    "ColumnName": "Manage",
                    "ColumnType": "SEL"
                });

                var oModel = new JSONModel();
                oModel.setData({
                    columns: oColumnsData,
                    rows: oData
                });


                var oTable = this.getView().byId("styleDynTable");
                oTable.setModel(oModel);

                oTable.bindColumns("/columns", function (index, context) {
                    var sColumnId = context.getObject().ColumnName;
                    var sColumnType = context.getObject().ColumnType;
                    var sColumnVisible = context.getObject().Visible;
                    var sColumnSorted = context.getObject().Sorted;
                    var sColumnSortOrder = context.getObject().SortOrder;
                    var sColumnToolTip = context.getObject().Tooltip;
                    //alert(sColumnId.);
                    return new sap.ui.table.Column({
                        id: sColumnId,
                        label: "{i18n>" + sColumnId + "}",
                        template: me.columnTemplate(sColumnId, sColumnType),
                        width: me.getColumnSize(sColumnId, sColumnType),
                        sortProperty: sColumnId,
                        filterProperty: sColumnId,
                        autoResizable: true,
                        visible: sColumnVisible,
                        sorted: sColumnSorted,
                        sortOrder: ((sColumnSorted === true) ? sColumnSortOrder : "Ascending" )
                    });
                });
                oTable.bindRows("/rows");
            },

            getVersionsTable: function (styleNo) {
                var oView = this.getView();
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var entitySet = "/StyleVersionSet"
                oModel.setHeaders({
                    styleno: styleNo
                });
                oModel.read(entitySet, {
                    success: function (oData, oResponse) {
                        oJSONModel.setData(oData);
                        oView.setModel(oJSONModel, "VersionsDataModel");
                    },
                    error: function () { }
                })
            },

            columnTemplate: function (sColumnId, sColumnType) {
                var oColumnTemplate;

                if (sColumnId === "STATUSCD") {
                    oColumnTemplate = new sap.tnt.InfoLabel({
                        text: "{" + sColumnId + "}",
                        colorScheme: "{= ${" + sColumnId + "} === 'CMP' ? 8 : ${" + sColumnId + "} === 'CRT' ? 3 : 1}"
                    })
                } else if (sColumnType === "SEL") {
                    oColumnTemplate = new sap.m.Button({
                        text: "",
                        icon: "sap-icon://detail-view",
                        type: "Ghost",
                        press: this.goToDetail,
                        tooltip: "Manage this style"
                    });
                    oColumnTemplate.data("StyleNo", "{}");
                } else if (sColumnType === "COPY") {
                    oColumnTemplate = new sap.m.Button({
                        text: "",
                        icon: "sap-icon://copy",
                        type: "Ghost",
                        press: this.onCopyStyle,
                        tooltip: "Copy this style"
                    });
                    oColumnTemplate.data("StyleNo", "{}");
                } else {
                    oColumnTemplate = new sap.m.Text({ text: "{" + sColumnId + "}" });
                }

                return oColumnTemplate;
            },

            getColumnSize: function (sColumnId, sColumnType) {
                var mSize = '7rem';
                if (sColumnType === "SEL") {
                    mSize = '5rem';
                } else if (sColumnType === "COPY") {
                    mSize = '4rem';
                } else if (sColumnId === "STYLECD") {
                    mSize = '25rem';
                } else if (sColumnId === "DESC1" || sColumnId === "PRODTYP") {
                    mSize = '15rem';
                }
                return mSize;
            },

            goToDetail: function (oEvent) {
                var oButton = oEvent.getSource();
                var styleNo = oButton.data("StyleNo").STYLENO;
                that.setChangeStatus(false);
                that.navToDetail(styleNo);
            },

            navToDetail: function (styleNo, sbu) {
                that._router.navTo("RouteStyleDetail", {
                    styleno: styleNo,
                    sbu: that._sbu
                });
            },

            onCreateNewStyle: function () {
                this._sbu = this.getView().byId("SmartFilterBar").getFilterData().SBU;
                this.setChangeStatus(false);

                if (!this._ConfirmNewDialog) {
                    this._ConfirmNewDialog = sap.ui.xmlfragment("zui3derp.view.fragments.dialog.ConfirmCreateStyle", this);
                    this.getView().addDependent(this._ConfirmNewDialog);
                }
                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                this._ConfirmNewDialog.addStyleClass("sapUiSizeCompact");
                this._ConfirmNewDialog.open();
            },

            onConfirmNewStyle: function() {
                this.navToDetail("NEW");
            },

            onCopyMode: function() {
                var oTable = this.getView().byId("styleDynTable");
                var oCopyColumn = oTable.getColumns()[1];
                var visible = oCopyColumn.getVisible();
                var newVisible = ((visible === true) ? false : true);
                oCopyColumn.setVisible(newVisible);
            },

            onCopyStyle: function (oEvent) {
                var oButton = oEvent.getSource();
                var styleNo = oButton.data("StyleNo").STYLENO;
                that._styleNo = styleNo;

                var oData = oEvent.getSource().getParent().getBindingContext();
                var styleCode = oData.getProperty('STYLECD');
                var seasonCode = oData.getProperty('SEASONCD');
                var desc1 = oData.getProperty('DESC1');

                var oModel = new JSONModel();
                oModel.setData({
                    "STYLENO": styleNo,
                    "STYLECD": styleCode,
                    "SEASONCD": seasonCode,
                    "DESC1": desc1,
                    versions: []
                });

                that.getFiltersData();
                that.getVersionsTable(styleNo);

                var oView = that.getView();
                oView.setModel(oModel, "CopyModel")

                if (!that._CopyStyleDialog) {
                    that._CopyStyleDialog = sap.ui.xmlfragment("zui3derp.view.fragments.CopyStyle", that);
                    that.getView().addDependent(that._CopyStyleDialog);
                }
                jQuery.sap.syncStyleClass("sapUiSizeCompact", that.getView(), that._LoadingDialog);
                that._CopyStyleDialog.addStyleClass("sapUiSizeCompact");
                that._CopyStyleDialog.open();
            },

            onSaveCopyStyle: function () {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();

                var oTable = sap.ui.getCore().byId("versionsTableMain");
                var oTableModel = oTable.getModel("VersionsDataModel");
                var oData = oTableModel.getData(); 
                var selected = oTable.getSelectedIndices();

                var newStyleCode = sap.ui.getCore().byId("newStyleCode").getValue();
                var newSeason = sap.ui.getCore().byId("SEASONCD2").getValue();
                var colorCheck = sap.ui.getCore().byId("ColorCB").getSelected();
                var bomCheck = sap.ui.getCore().byId("bomCB").getSelected();
                var versions = [];

                if(newStyleCode === "") {
                    Common.showMessage(this._i18n.getText('t1'));
                } else if(newSeason === "") {
                    Common.showMessage(this._i18n.getText('t2'))
                } else {

                    if(bomCheck === true && colorCheck === false) {
                        Common.showMessage(this._i18n.getText('t3'));
                    } else {

                        for (var i = 0; i < selected.length; i++) {
                            versions.push(oData.results[selected[i]].Verno);
                        }

                        var entitySet = "/StyleSet(STYLENO='" + that._styleNo +  "')";

                        var versionStr = versions.join();

                        oModel.setHeaders({
                            styleno: that._styleNo,
                            sbu: that._sbu,
                            stylecd: newStyleCode,
                            season: newSeason,
                            color: colorCheck,
                            bom: bomCheck,
                            versions: versionStr
                        });

                        var oEntry = { 
                            STYLENO: that._styleNo
                        };

                        oModel.update(entitySet, oEntry, {
                            method: "PUT",
                            success: function(data, oResponse) {
                                me._CopyStyleDialog.close();
                                me.onSearch();
                                Common.showMessage(me._i18n.getText('t4'));
                            },
                            error: function() {
                                me._CopyStyleDialog.close();
                                Common.showMessage(me._i18n.getText('t5'));
                            }
                        });
                    }

                }
            },

            getFiltersData: function () {
                var oSHModel = this.getOwnerComponent().getModel("SearchHelps");

                //get Seasons
                var oJSONModel = new JSONModel();
                var oView = this.getView();
                oSHModel.setHeaders({
                    sbu: that._sbu
                });
                oSHModel.read("/SeasonSet", {
                    success: function (oData, oResponse) {
                        oJSONModel.setData(oData);
                        oView.setModel(oJSONModel, "SeasonsModel");
                    },
                    error: function (err) { }
                });
            },

            onSeasonsValueHelp: function (oEvent) {
                Utils.onSeasonsValueHelp(oEvent, this);
            },

            onSaveLayoutSettings: function () {
                var me = this;
                var oTable = this.getView().byId("styleDynTable");
                var oColumns = oTable.getColumns();
                var oEntry = {
                    "TableName": "STYLINIT",
                    "Sbu": that._sbu,
                    "LayoutToItems": []
                };
                var ctr = 1;

                oColumns.forEach((column) => {
                    if(column.sId !== "Manage" && column.sId !== "Copy") {
                        oEntry.LayoutToItems.push({
                            ColumnName: column.sId,
                            Order: ctr.toString(),
                            Sorted: column.mProperties.sorted,
                            SortOrder: column.mProperties.sortOrder,
                            SortSeq: "1",
                            Visible: column.mProperties.visible
                        });
                        ctr++;
                    }
                });

                var oModel = this.getOwnerComponent().getModel();
                oModel.create("/LayoutVariantSet", oEntry, {
                    method: "POST",
                    success: function(data, oResponse) {
                        Common.showMessage(me._i18n.getText('t6'));
                    },
                    error: function() {
                        alert("Error");
                    }
                });                
            },

            onStyleReader: function () {
                var oModel = this.getOwnerComponent().getModel();
                var oForecast = this.getView().byId("forecastNumber");
                var oOrder = this.getView().byId("orderNumber");
                var oShipped = this.getView().byId("shippedNumber");

                var aFilters = this.getView().byId("SmartFilterBar").getFilters();

                this.addDateFilters(aFilters);

                oModel.read("/StyleStatsSet", {
                    filters: aFilters,
                    success: function (oData) {
                        oForecast.setNumber(oData.results[0].FORECAST);
                        oOrder.setNumber(oData.results[0].ORDER);
                        oShipped.setNumber(oData.results[0].SHIPPED);
                    },
                    error: function (err) { }
                });
            },

            onUploadStyle: function() {
                var sbu = this.getView().byId("SmartFilterBar").getFilterData().SBU;
                that._router.navTo("RouteUploadStyle", {
                    sbu: sbu
                });
            },

            pad: Common.pad,

            onExportExcel: Utils.onExportExcel,

            onExport: Utils.onExport,

            onCancelNewStyle: Common.onCancelNewStyle,

            onCancelCopyStyles: Common.onCancelCopyStyles,

            onCancelCopyStyle: Common.onCancelCopyStyle,

            onCancelUploadStyle: Common.onCancelUploadStyle

        });

    });
