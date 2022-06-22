sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/library",
    "sap/ui/model/json/JSONModel",
    "../control/DynamicTable"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, control) {
        "use strict";


        return Controller.extend("zui3derp.controller.Styles", {

            onInit: function () {
                var oComponent = this.getOwnerComponent();
                this._router = oComponent.getRouter();
                this._router.getRoute("RouteStyles").attachPatternMatched(this._routePatternMatched, this);

                this._Model = this.getOwnerComponent().getModel();
                this._User = sap.ushell.Container.getService("UserInfo").getId();
            },

            _routePatternMatched: function (oEvent) {
                this.refreshFilters();
                this.refreshData();
            },

            // onAfterRendering: function() {
            //                 var oTable = this.getView().byId("idMyTable");
            //                 for (i = 0; i < s; i++) {
            //                     var oColumn = new sap.m.Column("col" + i, {
            //                         width: "1em",
            //                         header: new sap.m.Label({
            //                             text: "Data No. "+i
            //     this.refreshAllData();
            // },

            refreshFilters: function () {
                this._SBU = this.getDefaultSBU();
                this._Season = this.getDefaultSeason();
                this.getFiltersData();
            },

            refreshData: function () {
                this.getDynamicTable();
            },

            getDefaultSBU: function () {
                var sbu = "VER";
                var entitySet = "/SBUSet('')";

                this._Model.read(entitySet, {
                    success: function (oData, oResponse) {
                        // sbu = "VER"
                    },
                    error: function (err) { }
                });
                return sbu;
            },

            getDefaultSeason: function () {
                var sbu = "SU22";

                var entitySet = "/SeasonSet('')";
                this._Model.read(entitySet, {
                    success: function (oData, oResponse) {
                        // sbu = "VER"
                    },
                    error: function (err) { }
                });
                return sbu;
            },

            getDynamicTable: function () {
                var me = this;

                //get dynamic columns
                var oJSONColumnsModel = new sap.ui.model.json.JSONModel();
                this.oJSONModel = new sap.ui.model.json.JSONModel();

                var oFilterSBU = this.getView().byId("filterSBU");
                this._SBU = oFilterSBU.getSelectedKey();
                this._Model.setHeaders({
                    sbu: this._SBU,
                    type: 'STYLHDR'
                });
                this._Model.read("/DynamicColumnsSet", {
                    success: function (oData, oResponse) {
                        oJSONColumnsModel.setData(oData);
                        me.oJSONModel.setData(oData);

                        var colNo = oData.results.length;

                        me.getView().setModel(oJSONColumnsModel, "DynColumns");
                        me.setTableColumns();
                    },
                    error: function (err) { }
                });

                //get dynamic data
                var oJSONDataModel = new sap.ui.model.json.JSONModel();
                this._Model.setHeaders({
                    sbu: this._SBU,
                    salesgrp: "POL",
                    custgrp: "6A",
                    season: "SP21",
                    prodtyp: "1000",
                    type: 'STYLHDR'
                });
                this._Model.read("/DynamicDataSet", {
                    success: function (oData, oResponse) {
                        oJSONDataModel.setData(oData);
                        me.getView().setModel(oJSONDataModel, "DynData");
                        me.setTableData();
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

                //                 var oCell = [];
                //                 for (i = 0; i < s; i++) {
                //                     if (i === 0) {
                //                         var cell1 = new sap.m.Text({
                //                             text: "Cell No. "+i
                //                         });
                //                     }
                //                 oCell.push(cell1);
                //                 }
                //                 var aColList = new sap.m.ColumnListItem("aColList", {
                //                     cells: oCell
                //                 });

                //                 oTable.bindItems("<entityset>", aColList);
            },

            setTableData: function () {
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
                    cell = new sap.m.Text({
                        text: lv_field
                    });
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
                var oItem, oCtx;
                oItem = oEvent.getSource();
                oCtx = oItem.getBindingContext("DynData");
                alert(oCtx.getProperty("Col001"));
            },

            getFiltersData: function () {
                var sbu = this._SBU;
                var season = this._Season;

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
                        filterSBU.setSelectedKey(sbu);
                    },
                    error: function (err) { }
                });

                //get Sales Group
                var oJSONModel2 = new sap.ui.model.json.JSONModel();
                var filterSalesGroup = this.getView().byId("filterSalesGroup");
                this._Model.setHeaders({
                    username: "EMALLARI"
                });
                this._Model.read("/SalesGroupSet", {
                    success: function (oData, oResponse) {
                        oJSONModel2.setData(oData);
                        filterSalesGroup.setModel(oJSONModel2);
                    },
                    error: function (err) { }
                });

                //get Customer Group
                var oJSONModel3 = new sap.ui.model.json.JSONModel();
                var filterCustomerGroup = this.getView().byId("filterCustomerGroup");
                this._Model.setHeaders({
                    username: "EMALLARI"
                });
                this._Model.read("/CustomerGroupSet", {
                    success: function (oData, oResponse) {
                        oJSONModel3.setData(oData);
                        filterCustomerGroup.setModel(oJSONModel3);
                    },
                    error: function (err) { }
                });

                //get Season
                var oJSONModel4 = new sap.ui.model.json.JSONModel();
                var filterSeason = this.getView().byId("filterSeason");
                this._Model.setHeaders({
                    sbu: this._SBU
                });
                this._Model.read("/SeasonSet", {
                    success: function (oData, oResponse) {
                        oJSONModel4.setData(oData);
                        filterSeason.setModel(oJSONModel4);
                        filterSeason.setSelectedKey(season);
                    },
                    error: function (err) { }
                });

                //get Product Types
                var oJSONModel5 = new sap.ui.model.json.JSONModel();
                var filterProductType = this.getView().byId("filterProductType");
                this._Model.setHeaders({
                    sbu: this._SBU
                });
                this._Model.read("/ProductTypeSet", {
                    success: function (oData, oResponse) {
                        oJSONModel5.setData(oData);
                        filterProductType.setModel(oJSONModel5);
                    },
                    error: function (err) { }
                });
            },

            onSBUChange: function () {
                var oFilterSBU = this.getView().byId("filterSBU");
                this.SBU = oFilterSBU.getSelectedKey();
                this.refreshAllData();
            },

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
            }

        });

    });
