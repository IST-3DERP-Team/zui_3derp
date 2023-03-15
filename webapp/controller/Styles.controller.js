sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../js/Common",
    "../js/Constants",
    "../js/Utils",
    "sap/ui/model/json/JSONModel",
    "sap/ui/export/Spreadsheet",
    "../control/DynamicTable",
    "sap/ui/core/routing/HashChanger"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Common, Constants, Utils, JSONModel, Spreadsheet, control, HashChanger) {
        "use strict";

        var that;
        var styleNo;
        //var isRender=false;

        return Controller.extend("zui3derp.controller.Styles", {

            onInit: function () {
                that = this;

                //Initialize router
                var oComponent = this.getOwnerComponent();
                this._router = oComponent.getRouter();
                //this._router.getRoute("RouteStyles").attachPatternMatched(this._routePatternMatched, this);

                //Set model of smartfilterbar
                this._Model = this.getOwnerComponent().getModel();
                this.setSmartFilterModel();

                //Initialize translations
                this._i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                this.isSearch = false;
                this.getView().setModel(new JSONModel({
                    dataMode: 'READ'
                }), "styleui");

                if (sap.ui.getCore().byId("backBtn") !== undefined) {
                    this._fBackButton = sap.ui.getCore().byId("backBtn").mEventRegistry.press[0].fFunction;

                    var oView = this.getView();
                    oView.addEventDelegate({
                        onAfterShow: function (oEvent) {
                            console.log("back")
                            sap.ui.getCore().byId("backBtn").mEventRegistry.press[0].fFunction = that._fBackButton;
                            that.onRefresh();
                        }
                    }, oView);
                }

                var oDelegateKeyUp = {
                    onkeyup: function (oEvent) {
                        that.onKeyUp(oEvent);
                    },

                    onsapenter: function (oEvent) {
                        that.onSapEnter(oEvent);
                    }
                };
                this.byId("styleDynTable").addEventDelegate(oDelegateKeyUp);
                console.log("init");

                this.getAppAction();
            },

            getAppAction: async function() {
                if (sap.ushell.Container !== undefined) {
                    const fullHash = new HashChanger().getHash(); 
                    const urlParsing = await sap.ushell.Container.getServiceAsync("URLParsing");
                    const shellHash = urlParsing.parseShellHash(fullHash); 
                    console.log(shellHash);
                    console.log(shellHash.action);
                }
            },

            onAfterRendering: function () {
                //double click event
                var oModel = new JSONModel();
                var oTable = this.getView().byId("styleDynTable");
                oTable.setModel(oModel);
                oTable.attachBrowserEvent('dblclick', function (e) {
                    e.preventDefault();
                    that.setChangeStatus(false); //remove change flag
                    that.navToDetail(styleNo); //navigate to detail page

                });

                // if (this.isSearch) {
                //     this.getColumns("SEARCH");
                // }
                console.log("after rendering");
            },

            setChangeStatus: function (changed) {
                //Set change flag 
                try {
                    sap.ushell.Container.setDirtyFlag(changed);
                } catch (err) { }
            },

            setSmartFilterModel: function () {
                //Model StyleHeaderFilters is for the smartfilterbar
                var oModel = this.getOwnerComponent().getModel("StyleHeaderFilters");
                var oSmartFilter = this.getView().byId("SmartFilterBar");
                oSmartFilter.setModel(oModel);
            },

            onSearch: function () {
                //trigger search, reselect styles
                //njoaquin replace getDynamicTableColumns with setTableColumns function
                //this.getDynamicTableColumns(); //styles table
                this.getColumns("SEARCH");
                this.getStyleStats(); //style statistics
                this.isSearch = true;
            },

            //******************************************* */
            // Styles Table
            //******************************************* */

            getDynamicTableColumns: function () {
                var me = this;

                //get dynamic columns based on saved layout or ZERP_CHECK
                var oJSONColumnsModel = new JSONModel();
                this.oJSONModel = new JSONModel();

                this._sbu = this.getView().byId("SmartFilterBar").getFilterData().SBU; //get selected SBU
                this._Model.setHeaders({
                    sbu: this._sbu,
                    type: Constants.STYLINIT
                });
                this._Model.read("/DynamicColumnsSet", {
                    success: function (oData, oResponse) {
                        oJSONColumnsModel.setData(oData);
                        me.oJSONModel.setData(oData);
                        me.getView().setModel(oJSONColumnsModel, "DynColumns"); //set the view model
                        me.getDynamicTableData(oData.results);
                    },
                    error: function (err) { }
                });
            },

            getColumns(arg) {
                var me = this;

                //get dynamic columns based on saved layout or ZERP_CHECK
                var oJSONColumnsModel = new JSONModel();
                // this.oJSONModel = new JSONModel();

                var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_COMMON_SRV");
                this._sbu = this.getView().byId("SmartFilterBar").getFilterData().SBU; //get selected SBU
                //var vSBU = this.getView().getModel("ui").getData().sbu;
                // console.log(oModel)
                oModel.setHeaders({
                    sbu: this._sbu, // vSBU,
                    type: Constants.STYLINIT,
                    tabname: 'ZERP_S_STYLHDR'
                });

                oModel.read("/ColumnsSet", {
                    success: function (oData, oResponse) {
                        // console.log(oData);
                        oJSONColumnsModel.setData(oData);
                        // me.oJSONModel.setData(oData);
                        me.getView().setModel(oJSONColumnsModel, "DynColumns"); //set the view model

                        if (oData.results.length > 0) {
                            if (arg === "AUTO_INIT") {
                                // me.getInitTableData();
                                console.log("INIT")
                            }
                            else {
                                //me.getTableData();
                                me.getDynamicTableData(oData.results);
                            }
                        }
                        else {
                            me.closeLoadingDialog();
                            sap.m.MessageBox.information("No table layout retrieve.");
                        }
                    },
                    error: function (err) {
                        Common.closeLoadingDialog(that);
                    }
                });
            },

            getDynamicTableData: function (columns) {
                //console.log(columns);
                var me = this;
                var oModel = this.getOwnerComponent().getModel();

                //get styles data for the table
                var oJSONDataModel = new JSONModel();
                var aFilters = this.getView().byId("SmartFilterBar").getFilters();
                var oText = this.getView().byId("StylesCount"); //for the count of selected styles
                this.addDateFilters(aFilters); //date not automatically added to filters

                oModel.read("/StyleSet", {
                    filters: aFilters,
                    success: function (oData, oResponse) {
                        oText.setText(oData.results.length + "");
                        
                        oData.results.sort(function(a,b) {
                            return new Date(b.CREATEDDT) - new Date(a.CREATEDDT);
                        });

                        oJSONDataModel.setData(oData);
                        me.getView().setModel(oJSONDataModel, "DataModel");
                        me.setTableData();
                        if (me.byId('styleDynTable').getColumns().length === 0) me.setTableColumns();
                        me.setChangeStatus(false);
                    },
                    error: function (err) { }
                });
            },

            addDateFilters: function (aFilters) {
                //get the date filter of created date
                var createdDate = this.getView().byId("CreatedDatePicker").getValue();
                if (createdDate !== undefined && createdDate !== '') {
                    createdDate = createdDate.replace(/\s/g, '').toString(); //properly format the date for ABAP
                    var createDateStr = createdDate.split('–');
                    var createdDate1 = createDateStr[0];
                    var createdDate2 = createDateStr[1];
                    if (createdDate2 === undefined) {
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

                //get the date filter of updated date
                var updatedDate = this.getView().byId("UpdatedDatePicker").getValue();
                if (updatedDate !== undefined && updatedDate !== '') {
                    updatedDate = updatedDate.replace(/\s/g, '').toString(); //properly format the date for ABAP
                    var createDateStr = updatedDate.split('–');
                    var updatedDate1 = createDateStr[0];
                    var updatedDate2 = createDateStr[1];
                    if (updatedDate2 === undefined) {
                        updatedDate2 = updatedDate1;
                    }
                    var lv_updatedDateFilter = new sap.ui.model.Filter({
                        path: "UPDATEDDT",
                        operator: sap.ui.model.FilterOperator.BT,
                        value1: updatedDate1,
                        value2: updatedDate2
                    });
                    aFilters.push(lv_updatedDateFilter); //add to the odata filter
                }
            },

            setTableData: function () {
                var me = this;

                //the selected dynamic columns
                var oColumnsModel = this.getView().getModel("DynColumns");
                var oDataModel = this.getView().getModel("DataModel");

                //the selected styles data
                var oColumnsData = oColumnsModel.getProperty('/results');
                var oData = oDataModel.getProperty('/results');

                let hasValue = JSON.stringify(oColumnsData).includes("Copy")
                if (!hasValue) {
                    //add column for copy button
                    oColumnsData.unshift({
                        "ColumnName": this._i18n.getText('Copy'),
                        "ColumnType": "COPY",
                        "Visible": false
                    });

                    //add column for manage button
                    oColumnsData.unshift({
                        "ColumnName": this._i18n.getText('Manage'),
                        "ColumnType": "SEL",
                        "Visible": false
                    });
                }



                //set the column and data model
                var oModel = new JSONModel();
                oModel.setData({
                    columns: oColumnsData,
                    rows: oData
                });

                // var oDelegateKeyUp = {
                //     onkeyup: function (oEvent) {
                //         that.onKeyUp(oEvent);
                //     },

                //     onsapenter: function (oEvent) {
                //         that.onSapEnter(oEvent);
                //     }
                // };
                // this.byId("styleDynTable").addEventDelegate(oDelegateKeyUp);

                var oTable = this.getView().byId("styleDynTable");
                oTable.setModel(oModel);

                //double click event
                // oTable.attachBrowserEvent('dblclick', function (e) {
                //     e.preventDefault();
                //     // that.setChangeStatus(false); //remove change flag
                //     that.navToDetail(styleNo); //navigate to detail page

                // });

                /*
                //njoaquin 09/20/2022 comment. binding of dynamic column to the table was transferred to setTableColumns function
                //bind the dynamic column to the table
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
                        sortOrder: ((sColumnSorted === true) ? sColumnSortOrder : "Ascending")
                    });
                });
                */

                //bind the data to the table
                oTable.bindRows("/rows");
            },

            setTableColumns() {
                var me = this;
                var oTable = this.getView().byId("styleDynTable");

                //bind the dynamic column to the table
                oTable.bindColumns("/columns", function (index, context) {
                    var sColumnId = context.getObject().ColumnName;
                    var sColumnLabel = context.getObject().ColumnLabel;
                    var sColumnType = context.getObject().ColumnType;
                    var sColumnWidth = context.getObject().ColumnWidth;
                    var sColumnVisible = context.getObject().Visible;
                    var sColumnSorted = context.getObject().Sorted;
                    var sColumnSortOrder = context.getObject().SortOrder;
                    // var sColumnToolTip = context.getObject().Tooltip;
                    //alert(sColumnId.);

                    if (sColumnWidth === 0 || sColumnWidth === 7) sColumnWidth = 110;

                    return new sap.ui.table.Column({
                        id: sColumnId,
                        label: sColumnLabel ? sColumnLabel : "{i18n>" + sColumnId + "}",
                        template: me.columnTemplate(sColumnId, sColumnType),
                        width: sColumnWidth ? sColumnWidth + 'px' : me.getColumnSize(sColumnId, sColumnType),
                        sortProperty: sColumnId,
                        filterProperty: sColumnId,
                        autoResizable: true,
                        visible: sColumnVisible,
                        sorted: sColumnSorted,
                        sortOrder: ((sColumnSorted === true) ? sColumnSortOrder : "Ascending")
                    });
                });
            },

            columnTemplate: function (sColumnId, sColumnType) {
                var oColumnTemplate;

                //different component based on field
                if (sColumnId === "STATUSCD") { //display infolabel for Status Code
                    oColumnTemplate = new sap.tnt.InfoLabel({
                        text: "{" + sColumnId + "}",
                        colorScheme: "{= ${" + sColumnId + "} === 'CMP' ? 8 : ${" + sColumnId + "} === 'CRT' ? 3 : 1}"
                    })
                } else if (sColumnType === "SEL") { //Manage button
                    oColumnTemplate = new sap.m.Button({
                        text: "",
                        icon: "sap-icon://detail-view",
                        type: "Ghost",
                        press: this.goToDetail,
                        tooltip: this._i18n.getText('ManageStyles')
                    });
                    oColumnTemplate.data("StyleNo", "{}"); //custom data to hold style number
                } else if (sColumnType === "COPY") { //Copy button
                    oColumnTemplate = new sap.m.Button({
                        text: "",
                        icon: "sap-icon://copy",
                        type: "Ghost",
                        press: this.onCopyStyle,
                        tooltip: this._i18n.getText('CopyStyle')
                    });
                    oColumnTemplate.data("StyleNo", "{}"); //custom data to hold style number
                } else {
                    oColumnTemplate = new sap.m.Text({
                        text: "{" + sColumnId + "}",
                        wrapping: false,
                        tooltip: "{" + sColumnId + "}"
                    }); //default text
                }

                return oColumnTemplate;
            },

            //******************************************* */
            // Navigation
            //******************************************* */

            goToDetail: function (oEvent) {
                var oButton = oEvent.getSource();
                var styleNo = oButton.data("StyleNo").STYLENO; //get the styleno binded to manage button
                that.setChangeStatus(false); //remove change flag
                that.navToDetail(styleNo); //navigate to detail page
            },

            navToDetail: function (styleNo, sbu) {
                //route to detail page
                that._router.navTo("RouteStyleDetail", {
                    styleno: styleNo,
                    sbu: that._sbu,
                    iono: ' '
                });
            },


            //******************************************* */
            // Create New Style
            //******************************************* */

            onCreateNewStyle: function () {
                //create new button clicked
                this._sbu = this.getView().byId("SmartFilterBar").getFilterData().SBU; //get selected SBU
                this.setChangeStatus(false); //remove change flag

                //confirmation to create new style
                if (!this._ConfirmNewDialog) {
                    this._ConfirmNewDialog = sap.ui.xmlfragment("zui3derp.view.fragments.dialog.ConfirmCreateStyle", this);
                    this.getView().addDependent(this._ConfirmNewDialog);
                }
                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                this._ConfirmNewDialog.addStyleClass("sapUiSizeCompact");
                this._ConfirmNewDialog.open();
            },

            onConfirmNewStyle: function () {
                //confirm create new style, navigate to detail as NEW
                this.navToDetail("NEW");
            },

            //******************************************* */
            // Copy Style
            //******************************************* */

            onCopyMode: function () {
                //on click of copy button, prompt immediately the copy style dialog
                var oTable = this.getView().byId("styleDynTable");
                
                var selected = oTable.getSelectedIndices();
                var oTmpSelected = [];
                selected.forEach(item => {
                    oTmpSelected.push(oTable.getBinding("rows").aIndices[item])
                })
                selected = oTmpSelected;
                var aData = oTable.getModel().getData().rows;
                console.log(aData[selected])

                var oModel = new JSONModel();
                oModel.setData({
                    "STYLENO": aData[selected].STYLENO,
                    "STYLECD": aData[selected].STYLECD,
                    "SEASONCD": aData[selected].SEASONCD,
                    "DESC1": aData[selected].DESC1,
                    versions: []
                });

                that.getFiltersData(); //load the search help
                that.getVersionsTable(aData[selected].STYLENO); //get versions of selected styleno

                var oView = that.getView();
                oView.setModel(oModel, "CopyModel") //set the copy model

                //open the copy style dialog
                if (!that._CopyStyleDialog) {
                    that._CopyStyleDialog = sap.ui.xmlfragment("zui3derp.view.fragments.CopyStyle", that);
                    that.getView().addDependent(that._CopyStyleDialog);
                }
                jQuery.sap.syncStyleClass("sapUiSizeCompact", that.getView(), that._LoadingDialog);
                that._CopyStyleDialog.addStyleClass("sapUiSizeCompact");
                that._CopyStyleDialog.open();
                
                //ncjoaquin 03/09/22023 comment. do not show anymore the copy button
                //show copy buttons
                /*
                var oTable = this.getView().byId("styleDynTable");
                var oCopyColumn = oTable.getColumns()[1];
                var visible = oCopyColumn.getVisible();
                var newVisible = ((visible === true) ? false : true);
                oCopyColumn.setVisible(newVisible);
                */
            },

            onCopyStyle: function (oEvent) {
                //copy button clicked
                var oButton = oEvent.getSource();
                var styleNo = oButton.data("StyleNo").STYLENO; //get styleno binded on copy button
                that._styleNo = styleNo; //set the style selected

                var oData = oEvent.getSource().getParent().getBindingContext();
                //get info of selected style to copy
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

                that.getFiltersData(); //load the search help
                that.getVersionsTable(styleNo); //get versions of selected styleno

                var oView = that.getView();
                oView.setModel(oModel, "CopyModel") //set the copy model

                //open the copy style dialog
                if (!that._CopyStyleDialog) {
                    that._CopyStyleDialog = sap.ui.xmlfragment("zui3derp.view.fragments.CopyStyle", that);
                    that.getView().addDependent(that._CopyStyleDialog);
                }
                jQuery.sap.syncStyleClass("sapUiSizeCompact", that.getView(), that._LoadingDialog);
                that._CopyStyleDialog.addStyleClass("sapUiSizeCompact");
                that._CopyStyleDialog.open();
            },

            getVersionsTable: function (styleNo) {
                //get versions of selected styleno
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

            onSaveCopyStyle: function () {
                //on confirmation of copy style
                var me = this;
                var oModel = this.getOwnerComponent().getModel();

                //get the selected versions to copy
                var oTable = sap.ui.getCore().byId("versionsTableMain");
                var oTableModel = oTable.getModel("VersionsDataModel");
                var oData = oTableModel.getData();
                var selected = oTable.getSelectedIndices();

                //get the input data
                var newStyleCode = sap.ui.getCore().byId("newStyleCode").getValue();
                var newSeason = sap.ui.getCore().byId("SEASONCD2").getValue();
                var colorCheck = sap.ui.getCore().byId("ColorCB").getSelected();
                var bomCheck = sap.ui.getCore().byId("bomCB").getSelected();
                var versions = [];

                if (newStyleCode === "") {
                    Common.showMessage(this._i18n.getText('t1'));
                } else if (newSeason === "") {
                    Common.showMessage(this._i18n.getText('t2'))
                } else {

                    if (bomCheck === true && colorCheck === false) {
                        Common.showMessage(this._i18n.getText('t3'));
                    } else {
                        //add versions to copy to the payload
                        for (var i = 0; i < selected.length; i++) {
                            versions.push(oData.results[selected[i]].Verno);
                        }

                        var entitySet = "/StyleSet(STYLENO='" + that._styleNo + "')";

                        var versionStr = versions.join();
                        //set the http headers
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
                        //call the update method of styles
                        oModel.update(entitySet, oEntry, {
                            method: "PUT",
                            success: function (data, oResponse) {
                                me._CopyStyleDialog.close();
                                me.onSearch();
                                Common.showMessage(me._i18n.getText('t4'));
                            },
                            error: function () {
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
                //load the seasons search help
                var sInputValue = oEvent.getSource().getValue();
                that.inputId = oEvent.getSource().getId();
                if (!that._seasonsHelpDialog) {
                    that._seasonsHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.Seasons", that);
                    that._seasonsHelpDialog.attachSearch(that._seasonsGroupValueHelpSearch);
                    that.getView().addDependent(that._seasonsHelpDialog);
                }
                that._seasonsHelpDialog.open(sInputValue);
            },

            _seasonsGroupValueHelpSearch: function (evt) {
                //search the list of seasons
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Seasoncd", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _seasonsGroupValueHelpClose: function (evt) {
                //season selected from the list
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = sap.ui.getCore().byId(that.inputId);
                    input.setValue(oSelectedItem.getTitle());
                    that.onHeaderChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            //******************************************* */
            // Save Table Layout
            //******************************************* */

            onSaveLayoutSettings: function () {
                //saving of the layout of table
                var me = this;
                var oTable = this.getView().byId("styleDynTable");
                var oColumns = oTable.getColumns();
                var oEntry = {
                    "TableName": "STYLINIT",
                    "Sbu": that._sbu,
                    "LayoutToItems": []
                };
                var ctr = 1;
                //get information of columns, add to payload
                oColumns.forEach((column) => {
                    if (column.sId !== "Manage" && column.sId !== "Copy") {
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
                //call the layout save
                var oModel = this.getOwnerComponent().getModel();
                oModel.create("/LayoutVariantSet", oEntry, {
                    method: "POST",
                    success: function (data, oResponse) {
                        Common.showMessage(me._i18n.getText('t6'));
                    },
                    error: function () {
                        alert("Error");
                    }
                });
            },

            onSaveTableLayout: function (oEvent) {
                //saving of the layout of table
                var me = this;
                var ctr = 1;
                //var oTable = oEvent.getSource().oParent.oParent;
                // var oTable = this.getView().byId("mainTab");
                //var oColumns = oTable.getColumns();
                var oTable = this.getView().byId("styleDynTable");
                var oColumns = oTable.getColumns();
                var vSBU = that._sbu;// this.getView().getModel("ui").getData().sbu;
                //console.log(oColumns)

                // return;
                var oParam = {
                    "SBU": vSBU,
                    "TYPE": "STYLINIT",
                    "TABNAME": "ZERP_S_STYLHDR",
                    "TableLayoutToItems": []
                };

                // if (oTable.getBindingInfo("rows").model === "gmc") {
                //     oParam['TYPE'] = "GMCHDR";
                //     oParam['TABNAME'] = "ZERP_MATGMC";
                // }
                // else if (oTable.getBindingInfo("rows").model === "attributes") {
                //     oParam['TYPE'] = "GMCATTRIB";
                //     oParam['TABNAME'] = "ZERP_GMCATTRIB";
                // }
                // else if (oTable.getBindingInfo("rows").model === "materials") {
                //     oParam['TYPE'] = "GMCMAT";
                //     oParam['TABNAME'] = "ZERP_MATERIAL";
                // }

                //get information of columns, add to payload
                oColumns.forEach((column) => {
                    if (column.sId !== "Manage" && column.sId !== "Copy") {
                        oParam.TableLayoutToItems.push({
                            // COLUMNNAME: column.sId,
                            COLUMNNAME: column.mProperties.sortProperty,
                            ORDER: ctr.toString(),
                            SORTED: column.mProperties.sorted,
                            SORTORDER: column.mProperties.sortOrder,
                            SORTSEQ: "1",
                            VISIBLE: column.mProperties.visible,
                            WIDTH: column.mProperties.width.replace('rem', '')
                        });

                        ctr++;
                    }
                });
                //call the layout save
                var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_COMMON_SRV");
                oModel.create("/TableLayoutSet", oParam, {
                    method: "POST",
                    success: function (data, oResponse) {
                        sap.m.MessageBox.information("Layout saved.");
                        //Common.showMessage(me._i18n.getText('t6'));
                    },
                    error: function (err) {
                        console.log(err);
                        sap.m.MessageBox.error(err);
                    }
                });
            },

            //******************************************* */
            // Style Stats
            //******************************************* */

            getStyleStats: function () {
                //select the style statistics
                var oModel = this.getOwnerComponent().getModel();
                var oForecast = this.getView().byId("forecastNumber");
                var oOrder = this.getView().byId("orderNumber");
                var oShipped = this.getView().byId("shippedNumber");

                //get the smartfilterbar filters for odata filter
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

            //******************************************* */
            // Upload Style
            //******************************************* */

            onUploadStyle: function () {
                //navigate to upload style on click of upload button
                var sbu = this.getView().byId("SmartFilterBar").getFilterData().SBU;
                that._router.navTo("RouteUploadStyle", {
                    sbu: sbu
                });
            },

            //******************************************* */
            // Common Functions
            //******************************************* */

            getColumnSize: function (sColumnId, sColumnType) {
                //change rem to px. 1rem=16px
                //column width of fields
                var mSize = '112px'//7rem'
                if (sColumnType === "SEL") {
                    mSize = '70px';// '5rem'
                } else if (sColumnType === "COPY") {
                    mSize = '60px';//4rem'
                } else if (sColumnId === "STYLECD") {
                    mSize = '320px';//25rem'
                } else if (sColumnId === "DESC1" || sColumnId === "PRODTYP") {
                    mSize = '240px'; //20rem
                }
                return mSize;
            },

            onCloseDialog: function (oEvent) {
                oEvent.getSource().getParent().close();
            },

            onKeyUp(oEvent) {
                //console.log("onKeyUp!");

                var _dataMode = this.getView().getModel("styleui").getData().dataMode;
                _dataMode = _dataMode === undefined ? "READ" : _dataMode;

                if ((oEvent.key === "ArrowUp" || oEvent.key === "ArrowDown") && oEvent.srcControl.sParentAggregationName === "rows" && _dataMode === "READ") {
                    var oTable = this.getView().byId("styleDynTable");
                    var model = oTable.getModel();

                    var sRowPath = this.byId(oEvent.srcControl.sId).oBindingContexts["undefined"].sPath;
                    var index = sRowPath.split("/");
                    oTable.setSelectedIndex(parseInt(index[2]));
                    //var data = model.getProperty(sRowPath);
                    // var oRow = this.getView().getModel("DataModel").getProperty(sRowPath);
                    // console.log(sRowPath)
                    // console.log(data)
                    //console.log(oRow)
                    // this.getView().getModel("ui").setProperty("/activeGmc", oRow.GMC);

                }
            },

            onSapEnter(oEvent) {
                that.setChangeStatus(false); //remove change flag
                that.navToDetail(styleNo); //navigate to detail page
            },

            onSelectionChange: function (oEvent) {
                // var oTable = this.getView().byId("styleDynTable");
                // iSelectedIndex = oEvent.getSource().getSelectedIndex();
                // oTable.setSelectedIndex(iSelectedIndex);

                var sPath = oEvent.getParameter("rowContext").getPath();
                var oTable = this.getView().byId("styleDynTable");
                var model = oTable.getModel();
                //get the selected  data from the model and set to variable style
                var data = model.getProperty(sPath);
                styleNo = data['STYLENO'];

            },

            onRefresh: function (oEvent) {
                //this.getColumns("SEARCH");
                this.getDynamicTableData("");
            },

            //padding zeroes for formatting
            pad: Common.pad,

            //export to spreadsheet utility
            onExport: Utils.onExport
        });

    });
