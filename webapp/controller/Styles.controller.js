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
                this.setSmartFilterModel();
            },

            _routePatternMatched: function (oEvent) {
                this.onStyleReader();
                this.getDefaultFilters();
            },

            setSmartFilterModel: function() {
                var oModel = this.getOwnerComponent().getModel("StyleHeaderFilters");
                var oSmartFilter = this.getView().byId("SmartFilterBar");
                oSmartFilter.setModel(oModel);
            },
 
            getDefaultFilters: function() {
                var me = this;
                var entitySet = "/DefaultFilterSet('EMALLARI')";
                
                //Set SmartFilterBar initial values
                var oSmartFilter = this.getView().byId("SmartFilterBar");
                
                this._Model.read(entitySet, {
                    success: function (oData, oResponse) {
                        var oDefaultFilter = {
                            SBU: oData.Sbu,
                            SALESGRP: {
                                items: [{
                                    key: oData.Salesgrp
                                }]
                            },
                            CUSTGRP:{
                                items: [{
                                    key: oData.Custgrp
                                }]
                            },
                            SEASONCD: {
                                items: [{
                                    key: oData.Seasoncd
                                }]
                            },
                            PRODTYP: {
                                items: [{
                                    key: oData.Prodtyp
                                }]
                            } 
                        };
                        oSmartFilter.setFilterData(oDefaultFilter);
                    },
                    error: function (err) { }
                });
            },

            onSearch: function() {
                this.getDynamicTableColumns();    

                var oSmartFilter = this.getView().byId("SmartFilterBar");
            },

            getDynamicTableColumns: function () {
                var me = this;

                //get dynamic columns
                var oJSONColumnsModel = new sap.ui.model.json.JSONModel();
                this.oJSONModel = new sap.ui.model.json.JSONModel();

                var oFilterSBU = this.getView().byId("filterSBU");
                this._SBU = "VER"; // oFilterSBU.getSelectedKey();
                this._Model.setHeaders({
                    sbu: this._SBU,
                    type: 'STYLINIT'
                });
                this._Model.read("/DynamicColumnsSet", {
                    success: function (oData, oResponse) {
                        oJSONColumnsModel.setData(oData);
                        me.oJSONModel.setData(oData);
                        // var colNo = oData.results.length;
                        me.getView().setModel(oJSONColumnsModel, "DynColumns");
                        // me.setTableColumns();
                        me.getDynamicTableData(oData.results);
                    },
                    error: function (err) { }
                });
            },

            getDynamicTableData: function(columns) {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                // var sbu = this.getView().byId("filterSBU").getSelectedKey();
                // var salesgrp = this.getView().byId("filterSalesGroup").getSelectedKey();
                // var custgrp = this.getView().byId("filterCustomerGroup").getSelectedKey();
                // var season = this.getView().byId("filterSeason").getSelectedKey();
                // var prodtyp = this.getView().byId("filterProductType").getSelectedKey();
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
                // oModel.setHeaders({
                //     sbu: 'VER',
                //     salesgrp: 'POL',
                //     custgrp: '6A',
                //     season: 'SP21',
                //     prodtyp: '1000',
                //     type: 'STYLINIT'
                // });

                var aFilters = this.getView().byId("SmartFilterBar").getFilters();
                
                oModel.read("/StyleSet", {
                    filters: aFilters,
                    success: function (oData, oResponse) {
                        oJSONDataModel.setData(oData);
                        me.getView().setModel(oJSONDataModel, "DynData");
                        me.setTableData(statusColNo);
                    },
                    error: function (err) { }
                });
            },

            // setTableColumns: function () {
            //     var me = this;

            //     var oModel = this.getView().getModel("DynColumns");
            //     var oDynColumns = oModel.getProperty('/results');
            //     var oTable = this.getView().byId("styleDynTable");
            //     var i = 0;

            //     oTable.destroyColumns();

            //     for (i = 0; i < oDynColumns.length; i++) {
            //         var colName = "{i18n>" + oDynColumns[i].ColumnName + "}";
            //         var oColumn = new sap.ui.table.Column("Col" + i, {
            //             width: "10em",
            //             header: new sap.m.Label({
            //                 text: colName
            //             })
            //         });
            //         oTable.addColumn(oColumn);
            //     }
            // },

            setTableData: function (statusColNo) {
                var me = this;

                var oColumnsModel = this.getView().getModel("DynColumns");
                var oDataModel = this.getView().getModel("DynData");

                var oColumnsData = oColumnsModel.getProperty('/results');
                var oData = oDataModel.getProperty('/results');

                oColumnsData.unshift({
                    "ColumnName":"Copy",
                    "ColumnType":"COPY"
                });

                oColumnsData.unshift({
                    "ColumnName":"View",
                    "ColumnType":"SEL"
                });
                
                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData({
                    columns: oColumnsData,
                    rows: oData
                });

                var dataLength = oData.length;
                
                var oTable = this.getView().byId("styleDynTable");

                // if (dataLength < 10) {
                //     oTable.setVisibleRowCount(dataLength);            
                // }

                oTable.setModel(oModel);

                oTable.bindColumns("/columns", function(index, context) {
                    var sColumnId = context.getObject().ColumnName;
                    var sColumnType = context.getObject().ColumnType;
                    //alert(sColumnId.);
                    return new sap.ui.table.Column({
                        id : sColumnId,
                        label: "{i18n>" + sColumnId + "}", 
                        template: me.columnTemplate(sColumnId, sColumnType),
                        width : me.getColumnSize(sColumnId, sColumnType),
                        sortProperty: sColumnId, 
                        filterProperty: sColumnId,
                        autoResizable: true
                    });
                });
                oTable.bindRows("/rows");    
            },

            columnTemplate: function(sColumnId, sColumnType) {
                var oColumnTemplate;

                if(sColumnId === "STATUSCD") {
                    oColumnTemplate = new sap.tnt.InfoLabel({ 
                        text: "{" + sColumnId + "}", 
                        colorScheme: "{= ${" + sColumnId + "} === 'CMP' ? 8 : ${" + sColumnId+ "} === 'CRT' ? 3 : 1}"
                    })
                } else if (sColumnType === "SEL") {
                    oColumnTemplate = new sap.m.Button({ 
                        text: "",
                        icon: "sap-icon://detail-view",
                        type: "Ghost",
                        press: this.goToDetail
                    });
                    oColumnTemplate.data("StyleNo", "{}");
                } else if (sColumnType === "COPY") {
                    oColumnTemplate = new sap.m.Button({ 
                        text: "",
                        icon: "sap-icon://copy",
                        type: "Ghost",
                        press: this.onCopyStyle
                    });
                    oColumnTemplate.data("StyleNo", "{}");
                } else {
                    oColumnTemplate = new sap.m.Text({ text: "{" + sColumnId + "}" });
                }

                return oColumnTemplate;
            },

            getColumnSize: function(sColumnId, sColumnType) {
                var mSize = '7rem';
                if(sColumnType === "SEL" || sColumnType === "COPY") {
                    mSize = '3.2rem';
                } else if(sColumnId === "STYLECD") {
                    mSize = '30rem';
                } else if(sColumnId === "DESC1" || sColumnId === "PRODTYP") {
                    mSize = '20rem';
                }
                
                return mSize;
            },
            
            goToDetail: function (oEvent) {
                var oButton = oEvent.getSource();
                var styleNo = oButton.data("StyleNo").STYLENO;
                that.navToDetail(styleNo);
            },

            navToDetail: function(styleNo) {
			    that._router.navTo("RouteStyleDetail", {
                    styleno: styleNo
                } );
            },

            // getFiltersData: function (defaultFilters) {
                // var me = this;
                // var oJSONModel = new sap.ui.model.json.JSONModel();

                // //get SBUs
                // // var filterSBU = this.getView().byId("filterSBU");
                // this._Model.setHeaders({
                //     username: this._User
                // });
                // this._Model.read("/SBUSet", {
                //     success: function (oData, oResponse) {
                //         oJSONModel.setData(oData);
                //         filterSBU.setModel(oJSONModel);
                //         // filterSBU.setSelectedKey(defaultFilters.sbu);
                //     },
                //     error: function (err) { }
                // });

                //set filter data
            // },

            // getSelectedStyles: function() {
                // var oTable = this.getView().byId("styleDynTable");
                // var selectedContexts = oTable.getSelectedContextPaths();
                // var i = 0;
                // var selectedItems = [];

                // selectedContexts.forEach((selectedItem) => {
                //     var oItem = oTable.getSelectedContexts()[i].getObject();
                //     i++;
                //     selectedItems.push(oItem);
                // })

                // return selectedItems;
            // },

            onSBUChange: function () {
                var oFilterSBU = this.getView().byId("filterSBU");
                this.SBU = oFilterSBU.getSelectedKey();
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

            // onConfirmNewStyle: function() {
            //     this.navToDetail("NEW");
            // },

            onCopyStyle: function(oEvent) {
                var oButton = oEvent.getSource();
                var styleNo = oButton.data("StyleNo").STYLENO;

                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData({
                    "STYLENO": styleNo,
                    "STYLECD": "STYLECODE",
                    "SEASONCD": "SeasonCd",
                    "DESC1": "DESC1",
                    versions: []
                });

                var oView = that.getView();
                oView.setModel(oModel, "CopyModel")
               
                // var selectedStyles = this.getSelectedStyles();

                if (!that._CopyStyleDialog) {
                    that._CopyStyleDialog = sap.ui.xmlfragment("zui3derp.view.fragments.CopyStyle", that);
                    that.getView().addDependent(that._CopyStyleDialog);
                }
                jQuery.sap.syncStyleClass("sapUiSizeCompact", that.getView(), that._LoadingDialog);
                that._CopyStyleDialog.addStyleClass("sapUiSizeCompact");
                that._CopyStyleDialog.open(); 
            },

            // onConfirmCopyStyles: function() {
            //     var selectedStyles = this.getSelectedStyles();

            //     if(selectedStyles.length !== 0) {
            //         this._ConfirmCopyDialog.close();

            //         selectedStyles.forEach((style) => {
            //             if (!this._CopyStyleDialog) {
            //                 this._CopyStyleDialog = sap.ui.xmlfragment("zui3derp.view.fragments.CopyStyle", this);
            //                 this.getView().addDependent(this._CopyStyleDialog);
            //             }
            //             jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
            //             this._CopyStyleDialog.addStyleClass("sapUiSizeCompact");
            //             this._CopyStyleDialog.open(); 
            //         })                    
            //     }
            // },

            onSaveCopyStyle: function() {
                this._CopyStyleDialog.close();
            },

            onCancelNewStyle: Common.onCancelNewStyle,

            onCancelCopyStyles: Common.onCancelCopyStyles,

            onCancelCopyStyle: Common.onCancelCopyStyle,

            onSaveLayoutSettings: function() {

            },

            pad: function (num, size) {
                num = num.toString();
                while (num.length < size) num = "0" + num;
                return num;
            },

            onStyleReader: function(){
                var oModel = this.getOwnerComponent().getModel();
                var oJSONObject = new sap.ui.model.json.JSONModel();
                var oForecast = this.getView().byId("forecastNumber");
                var oOrder = this.getView().byId("orderNumber");
                var oShipped = this.getView().byId("shippedNumber");

                oModel.read("/StyleStatsSet('')",{
                    success:function(oData){
                        oJSONObject.setData(oData)
                        oForecast.setNumber(oData.Forecast);
                        oOrder.setNumber(oData.Order);
                        oShipped.setNumber(oData.Shipped);
                    },
                    error: function(err){}
                });
            }

        });

    });
