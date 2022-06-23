sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../js/Common",
    "sap/m/library",
    "sap/ui/model/json/JSONModel",
    "../control/DynamicTable"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Common, JSONModel, control) {
        "use strict";

        var that;

        return Controller.extend("zui3derp.controller.Styles", {

            onInit: function () {
                that = this;                
                var oComponent = this.getOwnerComponent();
                this._router = oComponent.getRouter();
                this._router.getRoute("RouteStyles").attachPatternMatched(this._routePatternMatched, this);

                this._Model = this.getOwnerComponent().getModel();
                // this._User = sap.ushell.Container.getService("UserInfo").getId();
                this._User = 'EMALLARI';
            },

            _routePatternMatched: function (oEvent) {
                this.onStyleReader();
                this.getDefaultFilters();
            },

            getDefaultFilters: function() {
                var me = this;
                var entitySet = "/DefaultFilterSet('')";
                this._Model.read(entitySet, {
                    success: function (oData, oResponse) {
                        var defaultFilters = {
                            sbu: oData.Sbu,
                            salesgrp: oData.Salesgrp,
                            custgrp: oData.Custgrp,
                            season: oData.Seasoncd,
                            prodtyp: oData.Prodtyp
                        }
                        me.getFiltersData(defaultFilters);
                    },
                    error: function (err) { }
                });
            },

            onSearch: function() {
                this.getDynamicTableColumns();
                // this.saveDefaultFilters();
                // this.getDefaultFilters();                
            },

            getDynamicTableColumns: function () {
                var me = this;

                //get dynamic columns
                var oJSONColumnsModel = new sap.ui.model.json.JSONModel();
                this.oJSONModel = new sap.ui.model.json.JSONModel();

                var oFilterSBU = this.getView().byId("filterSBU");
                this._SBU = oFilterSBU.getSelectedKey();
                this._Model.setHeaders({
                    sbu: this._SBU,
                    type: 'STYLINIT'
                });
                this._Model.read("/DynamicColumnsSet", {
                    success: function (oData, oResponse) {
                        oJSONColumnsModel.setData(oData);
                        me.oJSONModel.setData(oData);

                        var colNo = oData.results.length;

                        me.getView().setModel(oJSONColumnsModel, "DynColumns");
                        me.setTableColumns();
                        me.getDynamicTableData(oData.results);
                    },
                    error: function (err) { }
                });
            },

            getDynamicTableData: function(columns) {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var sbu = this.getView().byId("filterSBU").getSelectedKey();
                var salesgrp = this.getView().byId("filterSalesGroup").getSelectedKey();
                var custgrp = this.getView().byId("filterCustomerGroup").getSelectedKey();
                var season = this.getView().byId("filterSeason").getSelectedKey();
                var prodtyp = this.getView().byId("filterProductType").getSelectedKey();
                var selectString = "";
                var lv1 = "Col";
                var i = 1;
                var statusColNo;

                //build select columns
                var oColCount = columns.length;
                columns.forEach((column) => {

                    if(column.ColumnName === "STATUSCD")
                        statusColNo = i;

                    if(column.ColumnName === "STYLENO")
                        this._StyleNoColNo = i;

                    var lv2 = this.pad(i, 3);
                    i++;

                    var colString = lv1 + lv2;
                    selectString += colString + ",";
                })
                selectString = selectString.slice(0, -1);

                //get dynamic data
                var oJSONDataModel = new sap.ui.model.json.JSONModel();
                oModel.setHeaders({
                    sbu: sbu,
                    salesgrp: salesgrp,
                    custgrp: custgrp,
                    season: season,
                    prodtyp: prodtyp,
                    type: 'STYLINIT'
                });
                oModel.read("/DynamicDataSet", {
                    urlParameters: {
                        "$select": selectString
                    },
                    success: function (oData, oResponse) {
                        oJSONDataModel.setData(oData);
                        me.getView().setModel(oJSONDataModel, "DynData");
                        me.setTableData(statusColNo);
                    },
                    error: function (err) { }
                });
            },

            setTableColumns: function () {
                var me = this;

                var oModel = this.getView().getModel("DynColumns");
                var oDynColumns = oModel.getProperty('/results');

                var oTable = this.getView().byId("styleDynTable");
                var i = 0;

                oTable.destroyColumns();

                for (i = 0; i < oDynColumns.length; i++) {

                    var colName = "{i18n>" + oDynColumns[i].ColumnName + "}";

                    var oColumn = new sap.m.Column("Col" + i, {
                        width: "10em",
                        header: new sap.m.Label({
                            text: colName
                        })
                    });
                    oTable.addColumn(oColumn);
                }
            },

            setTableData: function (statusColNo) {
                var me = this;

                var oModel = this.getView().getModel("DynData");
                var oDynData = oModel.getProperty('/results');
                var dataLen = 22;

                var oTable = this.getView().byId("styleDynTable");

                var oCell = [];
                for (var i = 1; i < dataLen; i++) {

                    var lv1 = "Col";
                    var lv2 = this.pad(i, 3);
                    var lv_field = "{DynData>" + lv1 + lv2 + "}";

                    var cell;
                    if(i===statusColNo) {
                        cell = new sap.tnt.InfoLabel({
                            text: lv_field,
                            colorScheme: `{= $${lv_field} === 'CMP' ? 8 : $${lv_field} === 'CRT' ? 3 : 1}`
                        });
                    } else {
                        cell = new sap.m.Text({
                            text: lv_field
                        });
                    }
                    
                    oCell.push(cell);
                }

                var aColList = new sap.m.ColumnListItem({
                    type: "Navigation",
                    press: this.goToDetail,
                    cells: oCell
                });

                oTable.bindItems("DynData>/results", aColList);
            },

            goToDetail: function (oEvent) {
                var columnName = "Col" + that.pad(that._StyleNoColNo, 3)
                var oItem, oCtx;
                oItem = oEvent.getSource();
                oCtx = oItem.getBindingContext("DynData");
                var styleNo = oCtx.getProperty(columnName);
                that.navToDetail(styleNo);
            },

            navToDetail: function(styleNo) {
			    that._router.navTo("RouteStyleDetail", {
                    styleno: styleNo
                } );
            },

            getFiltersData: function (defaultFilters) {
                var me = this;
                var oJSONModel = new sap.ui.model.json.JSONModel();

                //get SBUs
                var filterSBU = this.getView().byId("filterSBU");
                this._Model.setHeaders({
                    username: this._User
                });
                this._Model.read("/SBUSet", {
                    success: function (oData, oResponse) {
                        oJSONModel.setData(oData);
                        filterSBU.setModel(oJSONModel);
                        filterSBU.setSelectedKey(defaultFilters.sbu);
                    },
                    error: function (err) { }
                });

                //get Sales Group
                var oJSONModel2 = new sap.ui.model.json.JSONModel();
                var filterSalesGroup = this.getView().byId("filterSalesGroup");
                this._Model.setHeaders({
                    username: this._User
                });
                this._Model.read("/SalesGroupSet", {
                    success: function (oData, oResponse) {
                        oJSONModel2.setData(oData);
                        filterSalesGroup.setModel(oJSONModel2);
                        filterSalesGroup.setSelectedKey(defaultFilters.salesgrp);
                    },
                    error: function (err) { }
                });

                //get Customer Group
                var oJSONModel3 = new sap.ui.model.json.JSONModel();
                var filterCustomerGroup = this.getView().byId("filterCustomerGroup");
                this._Model.setHeaders({
                    username: this._User
                });
                this._Model.read("/CustomerGroupSet", {
                    success: function (oData, oResponse) {
                        oJSONModel3.setData(oData);
                        filterCustomerGroup.setModel(oJSONModel3);
                        filterCustomerGroup.setSelectedKey(defaultFilters.custgrp);
                    },
                    error: function (err) { }
                });

                //get Season
                var oJSONModel4 = new sap.ui.model.json.JSONModel();
                var filterSeason = this.getView().byId("filterSeason");
                this._Model.setHeaders({
                    sbu: defaultFilters.sbu
                });
                this._Model.read("/SeasonSet", {
                    success: function (oData, oResponse) {
                        oJSONModel4.setData(oData);
                        filterSeason.setModel(oJSONModel4);
                        filterSeason.setSelectedKey(defaultFilters.season);
                    },
                    error: function (err) { }
                });

                //get Product Types
                var oJSONModel5 = new sap.ui.model.json.JSONModel();
                oJSONModel5.setSizeLimit(1000);
                var filterProductType = this.getView().byId("filterProductType");
                this._Model.setHeaders({
                    sbu: defaultFilters.sbu
                });
                this._Model.read("/ProductTypeSet", {
                    success: function (oData, oResponse) {
                        oJSONModel5.setData(oData);
                        filterProductType.setModel(oJSONModel5);
                        filterProductType.setSelectedKey(defaultFilters.prodtyp);
                    },
                    error: function (err) { }
                });
            },

            getSelectedStyles: function() {
                var oTable = this.getView().byId("styleDynTable");
                var selectedContexts = oTable.getSelectedContextPaths();
                var i = 0;
                var selectedItems = [];

                selectedContexts.forEach((selectedItem) => {
                    var oItem = oTable.getSelectedContexts()[i].getObject();
                    i++;
                    selectedItems.push(oItem);
                })

                return selectedItems;
            },

            onSBUChange: function () {
                var oFilterSBU = this.getView().byId("filterSBU");
                this.SBU = oFilterSBU.getSelectedKey();
                this.refreshAllData();
            },

            onCreateNewStyle: function() {
                if (!this._ConfirmNewDialog) {
                    this._ConfirmNewDialog = sap.ui.xmlfragment("zui3derp.view.fragments.ConfirmCreateStyle", this);
                    this.getView().addDependent(this._ConfirmNewDialog);
                }
                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                this._ConfirmNewDialog.addStyleClass("sapUiSizeCompact");
                this._ConfirmNewDialog.open();
            },

            onConfirmNewStyle: function() {
                this.navToDetail("NEW");
            },

            onCopyStyles: function() {
                var selectedStyles = this.getSelectedStyles();

                if(selectedStyles.length !== 0) {

                    if (!this._ConfirmCopyDialog) {
                        this._ConfirmCopyDialog = sap.ui.xmlfragment("zui3derp.view.fragments.ConfirmCopyStyles", this);
                        this.getView().addDependent(this._ConfirmCopyDialog);
                    }
                    jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                    this._ConfirmCopyDialog.addStyleClass("sapUiSizeCompact");
                    this._ConfirmCopyDialog.open();

                } else {
                    Common.showMessage("Select items to copy");
                }
                
            },

            onConfirmCopyStyles: function() {
                var selectedStyles = this.getSelectedStyles();

                if(selectedStyles.length !== 0) {
                    this._ConfirmCopyDialog.close();

                    selectedStyles.forEach((style) => {
                        if (!this._CopyStyleDialog) {
                            this._CopyStyleDialog = sap.ui.xmlfragment("zui3derp.view.fragments.CopyStyle", this);
                            this.getView().addDependent(this._CopyStyleDialog);
                        }
                        jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                        this._CopyStyleDialog.addStyleClass("sapUiSizeCompact");
                        this._CopyStyleDialog.open(); 
                    })                    
                }
            },

            onSaveCopyStyle: function() {
                this._CopyStyleDialog.close();
            },

            onCancelNewStyle: Common.onCancelNewStyle,

            onCancelCopyStyles: Common.onCancelCopyStyles,

            onCancelCopyStyle: Common.onCancelCopyStyle,

            onPersoButtonPressed: function () {
                var oPersonalizationDialog = sap.ui.xmlfragment("zui3derp.view.fragments.StylesPerso", this);
                // this.oJSONModel.setProperty("/ShowResetEnabled", this._isChangedColumnsItems());
                oPersonalizationDialog.setModel(this.oJSONModel);

                this.getView().addDependent(oPersonalizationDialog);

                this.oDataBeforeOpen = jQuery.extend(true, {}, this.oJSONModel.getData());
                oPersonalizationDialog.open();
            },

            onPersoOK: function () {

            },

            onChangeColumnsItems: function (oEvent) {
                this.oJSONModel.setProperty("/ColumnsItems", oEvent.getParameter("items"));
                this.oJSONModel.setProperty("/ShowResetEnabled", this._isChangedColumnsItems());
            },

            _isChangedColumnsItems: function () {
                var fnGetArrayElementByKey = function (sKey, sValue, aArray) {
                    var aElements = aArray.filter(function (oElement) {
                        return oElement[sKey] !== undefined && oElement[sKey] === sValue;
                    });
                    return aElements.length ? aElements[0] : null;
                };
                var fnGetUnion = function (aDataBase, aData) {
                    if (!aData) {
                        return jQuery.extend(true, [], aDataBase);
                    }
                    var aUnion = jQuery.extend(true, [], aData);
                    aDataBase.forEach(function (oMItemBase) {
                        var oMItemUnion = fnGetArrayElementByKey("columnKey", oMItemBase.columnKey, aUnion);
                        if (!oMItemUnion) {
                            aUnion.push(oMItemBase);
                            return;
                        }
                        if (oMItemUnion.visible === undefined && oMItemBase.visible !== undefined) {
                            oMItemUnion.visible = oMItemBase.visible;
                        }
                        if (oMItemUnion.width === undefined && oMItemBase.width !== undefined) {
                            oMItemUnion.width = oMItemBase.width;
                        }
                        if (oMItemUnion.total === undefined && oMItemBase.total !== undefined) {
                            oMItemUnion.total = oMItemBase.total;
                        }
                        if (oMItemUnion.index === undefined && oMItemBase.index !== undefined) {
                            oMItemUnion.index = oMItemBase.index;
                        }
                    });
                    return aUnion;
                };
                var fnIsEqual = function (aDataBase, aData) {
                    if (!aData) {
                        return true;
                    }
                    if (aDataBase.length !== aData.length) {
                        return false;
                    }
                    var fnSort = function (a, b) {
                        if (a.columnKey < b.columnKey) {
                            return -1;
                        } else if (a.columnKey > b.columnKey) {
                            return 1;
                        } else {
                            return 0;
                        }
                    };
                    aDataBase.sort(fnSort);
                    aData.sort(fnSort);
                    var aItemsNotEqual = aDataBase.filter(function (oDataBase, iIndex) {
                        return oDataBase.columnKey !== aData[iIndex].columnKey || oDataBase.visible !== aData[iIndex].visible || oDataBase.index !== aData[iIndex].index || oDataBase.width !== aData[iIndex].width || oDataBase.total !== aData[iIndex].total;
                    });
                    return aItemsNotEqual.length === 0;
                };

                var aDataRuntime = fnGetUnion(this.oDataInitial.ColumnsItems, this.oJSONModel.getProperty("/results"));
                return !fnIsEqual(aDataRuntime, this.oDataInitial.ColumnsItems);
            },

            pad: function (num, size) {
                num = num.toString();
                while (num.length < size) num = "0" + num;
                return num;
            },

            onStyleReader: function(){
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var entitySet = "/StyleStatsSet('')";
                var oJSONObject = new sap.ui.model.json.JSONModel();
                var oJSONObject2 = new sap.ui.model.json.JSONModel();
                var oJSONObject3 = new sap.ui.model.json.JSONModel();
                var oForecast = this.getView().byId("forecastNumber");
                var oOrder = this.getView().byId("orderNumber");
                var oShipped = this.getView().byId("shippedNumber");


                oModel.read(entitySet,{
                    success:function(oData){
                        oJSONObject.setData(oData)
                        oForecast.setNumber(oData.Forecast);
                    },

                    error: function(err){}
                });

                oModel.read(entitySet,{
                    success:function(oData){
                        oJSONObject2.setData(oData)
                        oOrder.setNumber(oData.Order);
                    },

                    error: function(err){}
                });

                oModel.read(entitySet,{
                    success:function(oData){
                        oJSONObject3.setData(oData)
                        oShipped.setNumber(oData.Shipped);
                    },

                    error: function(err){}
                });

            }

        });

    });
