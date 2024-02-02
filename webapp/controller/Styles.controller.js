sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../js/Common",
    "../js/Constants",
    "../js/Utils",
    "sap/ui/model/json/JSONModel",
    "sap/ui/export/Spreadsheet",
    "../control/DynamicTable",
    "sap/ui/core/routing/HashChanger",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/Token",
    'sap/m/SearchField',
    'sap/ui/model/type/String',
    "../js/SmartFilterCustomControl",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Common, Constants, Utils, JSONModel, Spreadsheet, control, HashChanger, Filter, FilterOperator, MessageBox, Token, SearchField, typeString, SmartFilterCustomControl) {
        "use strict";

        var that;
        var styleNo;
        var _oCaption = {};

        // var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: "MM/dd/yyyy" });
        var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "MM/dd/yyyy" });
        var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({ pattern: "KK:mm:ss a" });
        //var isRender=false;

        return Controller.extend("zui3derp.controller.Styles", {

            onInit: function () {
                that = this;

                //Initialize router
                var oComponent = this.getOwnerComponent();
                this._router = oComponent.getRouter();
                //this._router.getRoute("RouteStyles").attachPatternMatched(this._routePatternMatched, this);

                //get captions
                this.getCaptionMsgs();

                this.getOwnerComponent().getModel("LOOKUP_MODEL").setData(new JSONModel());
                Utils.getStyleSearchHelps(this);
                Utils.getAttributesSearchHelps(this);
                Utils.getProcessAttributes(this);
                
                //Set model of smartfilterbar
                this._Model = this.getOwnerComponent().getModel();
                //this.setSmartFilterModel();
                this._smartFilterCustomControl = SmartFilterCustomControl;
                SmartFilterCustomControl.setSmartFilterModel(this);
                //var oModelSmartFilter = this.getOwnerComponent().getModel("ZVI_3DERP_STYLES_FILTER_CDS");

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

                            if (that._GenericFilterDialog) {
                                // that.getView().removeDependent(that._GenericFilterDialog);
                                that._GenericFilterDialog.setModel(new JSONModel());
                                // that._GenericFilterDialog.destroy();
                            }
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


                this.getOwnerComponent().getModel("UI_MODEL").setData({
                    fromScreen: "MAIN",
                    genAttrInfo: "",
                    dataMode: "READ"
                })

                this._colFilters = {};

                this._oMultiInput = this.getView().byId("multiInputMatTyp");
                this._oMultiInput.addValidator(this._onMultiInputValidate.bind(this));
            },

            getCaptionMsgs: async function () {
                var me = this;
                var oDDTextParam = [], oDDTextResult = {};
                var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_COMMON_SRV");

                oDDTextParam.push({ CODE: "SBU" });
                oDDTextParam.push({ CODE: "SALESGRP" });
                oDDTextParam.push({ CODE: "CUSTGRP" });
                oDDTextParam.push({ CODE: "SEASONCD" });
                oDDTextParam.push({ CODE: "PRODTYP" });
                oDDTextParam.push({ CODE: "STYLENO" });
                oDDTextParam.push({ CODE: "STYLECAT" });
                oDDTextParam.push({ CODE: "STYLECD" });
                oDDTextParam.push({ CODE: "FTSTYLE" });
                oDDTextParam.push({ CODE: "BOMSTYLVER" });
                oDDTextParam.push({ CODE: "SOLDTOCUST" });
                oDDTextParam.push({ CODE: "DESC1" });
                oDDTextParam.push({ CODE: "DESC2" });
                oDDTextParam.push({ CODE: "STATUSCD" });
                oDDTextParam.push({ CODE: "CUSTPRDTYP" });
                oDDTextParam.push({ CODE: "PRODGRP" });
                oDDTextParam.push({ CODE: "SIZEGRP" });
                oDDTextParam.push({ CODE: "UOM" });
                oDDTextParam.push({ CODE: "STYLEGRP" });
                oDDTextParam.push({ CODE: "FABRCTN" });
                oDDTextParam.push({ CODE: "VERNO" });
                oDDTextParam.push({ CODE: "UOM" });
                oDDTextParam.push({ CODE: "CREATEDBY" });
                oDDTextParam.push({ CODE: "CREATEDDT" });
                oDDTextParam.push({ CODE: "UPDATEDBY" });
                oDDTextParam.push({ CODE: "UPDATEDDT" });
                oDDTextParam.push({ CODE: "Manage" });
                oDDTextParam.push({ CODE: "Copy" });

                oDDTextParam.push({ CODE: "Forecast" });
                oDDTextParam.push({ CODE: "Order" });
                oDDTextParam.push({ CODE: "Shipped" });
                oDDTextParam.push({ CODE: "Styles" });


                oDDTextParam.push({ CODE: "CREATENEWSTYLE" });
                oDDTextParam.push({ CODE: "REFRESH" });
                oDDTextParam.push({ CODE: "COPYSTYLE" });
                oDDTextParam.push({ CODE: "UPLOAD" });
                oDDTextParam.push({ CODE: "UPLOADSTYLE" });
                oDDTextParam.push({ CODE: "EXPORTTOEXCEL" });
                oDDTextParam.push({ CODE: "SAVELAYOUT" });
                 
                oDDTextParam.push({ CODE: "INFO_INPUT_REQD_FIELDS" });
                oDDTextParam.push({ CODE: "INFO_NO_DATA_EDIT" });
                oDDTextParam.push({ CODE: "INFO_NO_SEL_RECORD_TO_PROC" });
                oDDTextParam.push({ CODE: "INFO_NO_SEL_VER_TO_PROC" });
                oDDTextParam.push({ CODE: "INFO_NO_RECORD_TO_REMOVE" });
                oDDTextParam.push({ CODE: "INFO_CHECK_INVALID_ENTRIES" });
                oDDTextParam.push({ CODE: "INFO_INPUT_NEW_STYLE" });
                oDDTextParam.push({ CODE: "INFO_INPUT_NEW_SEASON" });
                oDDTextParam.push({ CODE: "INFO_INPUT_REQ_COLOR" });
                oDDTextParam.push({ CODE: "INFO_LAYOUT_SAVE" });
                oDDTextParam.push({CODE: "INFO_ERROR" })
                oDDTextParam.push({CODE: "INFO_SAVE_SUCCESS" });

                return new Promise((resolve, reject)=>{
                    oModel.create("/CaptionMsgSet", { CaptionMsgItems: oDDTextParam }, {
                        method: "POST",
                        success: function (oData, oResponse) {
                            oData.CaptionMsgItems.results.forEach(item => {
                                oDDTextResult[item.CODE] = item.TEXT;
                            })

                            me.getView().setModel(new JSONModel(oDDTextResult), "ddtext");
                            me.getOwnerComponent().getModel("CAPTION_MSGS_MODEL").setData({ text: oDDTextResult });
                            _oCaption = me.getView().getModel("ddtext").getData();
                            console.log(_oCaption);
                            resolve();
                        },
                        error: function (err) { resolve(); }
                    });
                });
            },

            getAppAction: async function () {
                if (sap.ushell.Container !== undefined) {
                    const fullHash = new HashChanger().getHash();
                    const urlParsing = await sap.ushell.Container.getServiceAsync("URLParsing");
                    const shellHash = urlParsing.parseShellHash(fullHash);
                    const sAction = shellHash.action;
                    var bAppChange;

                    if (sAction == "display") bAppChange = false;
                    else bAppChange = true;
                } else {
                    bAppChange = true;
                }

                var oJSONModel = new JSONModel();
                var oView = this.getView();
                var data = {
                    "appChange": bAppChange,
                }
                oJSONModel.setData(data);
                oView.setModel(oJSONModel, "AppAction");
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

                var me = this;                
                //get cds view service gateway metadata
                var oModelURI = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZVI_3DERP_STYLES_FILTER_CDS");

                oModelURI.attachMetadataLoaded(null, function(){
                    var oMetadata = oModelURI.getServiceMetadata();

                    var oInterval = setInterval(() => {
                        if (oSmartFilter !== undefined && oSmartFilter._aFields !== null) {
                            clearInterval(oInterval);

                            //loop thru smart filter criteria
                            oSmartFilter._aFields.forEach(item => {
                                //OPTIONAL: exclude SBU, SBU is using combo box custom control instead of multi input
                                if (item.name === "SBU") { return; }

                                var oMultiInput = me.byId("sff" + item.name);

                                //skip filter criteria not defined in view xml file
                                if (oMultiInput === undefined) { return; }

                                var oFieldAnnotation = oMetadata.dataServices.schema[0].annotations.filter(fItem => fItem.target === item.fullName);

                                if (oFieldAnnotation.length > 0) {
                                    //continue if filter criteria has metadata
                                    var sFieldEntitySet = oFieldAnnotation[0].annotation[0].record.propertyValue.filter(fItem => fItem.property === "CollectionPath")[0].string;
                                    var entityType = oMetadata.dataServices.schema[0].entityType.filter(fItem => fItem.name === sFieldEntitySet + "Type")[0];

                                    //load the resource 
                                    //OPTIONAL: excelude if mattyp, mattyp resource should be loaded on change of SBU value, see onSBUChange function
                                    if (item.name !== "MATTYP") {
                                        oModel.read("/" + sFieldEntitySet, {
                                            success: function (oData) {
                                                me.getView().setModel(new JSONModel(oData.results), "sfm" + item.name);
                                            },
                                            error: function (err) { }
                                        })
                                    }

                                    //define custom control properties
                                    me._oSmartFilterCustomControlProp[item.name] = {};
                                    me._oSmartFilterCustomControlProp[item.name]["property"] = [];
                                    me._oSmartFilterCustomControlProp[item.name]["label"] = item.label;
                                    me._oSmartFilterCustomControlProp[item.name]["key"] = entityType.key.propertyRef[0].name;
                                    me._oSmartFilterCustomControlProp[item.name]["maxLength"] = item.maxLength;
                                    me._oSmartFilterCustomControlProp[item.name]["type"] = item.filterType;
                                    me._oSmartFilterCustomControlProp[item.name]["desc"] = "Description";
                                    me._oSmartFilterCustomControlProp[item.name]["textFormatMode"] = "Key";

                                    //attach method/events to multi input
                                    oMultiInput.attachValueHelpRequest(SmartFilterCustomControl.onSmartFilterCustomControlValueHelp.bind(me));
                                    oMultiInput.attachChange(SmartFilterCustomControl.onSmartFilterCustomControlValueHelpChange.bind(me));
                                    oMultiInput.attachSuggest(SmartFilterCustomControl.onMultiInputSuggest.bind(me));

                                    //collect the columns to show in suggestion and value help
                                    var oCells = [];
                                    var wDesc = false;

                                    entityType.property.forEach((prop, index) => {
                                        //OPTIONAL: exclude SBU for mattyp
                                        if (item.name === "MATTYP" && prop.name === "SBU") {
                                            return;
                                        }

                                        //add field to suggestion column
                                        oMultiInput.addSuggestionColumn(new sap.m.Column({
                                            header: new sap.m.Label({ text: prop.extensions.filter(fItem => fItem.name === "label")[0].value })
                                        }))

                                        //assign data to cells
                                        oCells.push(new sap.m.Text({
                                            text: { path: "sfm" + item.name + ">" + prop.name }
                                        }))

                                        //add field to custom control property
                                        me._oSmartFilterCustomControlProp[item.name]["property"].push({
                                            name: prop.name,
                                            label: prop.extensions.filter(fItem => fItem.name === "label")[0].value
                                        })

                                        //if there is a description field in your resource, text format will display description + (key), otherwise will only show key
                                        if (prop.name.toUpperCase() === "DESCRIPTION" && !wDesc) {
                                            wDesc = true;
                                            me._oSmartFilterCustomControlProp[item.name]["desc"] = prop.name;
                                            me._oSmartFilterCustomControlProp[item.name]["textFormatMode"] = "ValueKey"; 
                                        }
                                    })

                                    //bind suggestion rows
                                    oMultiInput.bindSuggestionRows({
                                        path: "sfm" + item.name + ">/",
                                        template: new sap.m.ColumnListItem({
                                            cells: oCells
                                        }),
                                        length: 10000,
                                        templateShareable: false
                                    });

                                    //add multi input validator for checking if entered value exists on the resource
                                    oMultiInput.addValidator(SmartFilterCustomControl.onMultiInputValidate.bind(me));

                                    //add focus event in multi input to set the active custom control
                                    var oMultiInputEventDelegate = {                    
                                        onclick: function(oEvent) {
                                            SmartFilterCustomControl.onMultiInputFocus(me, oEvent);
                                        }
                                    };

                                    oMultiInput.addEventDelegate(oMultiInputEventDelegate);
                                }
                            });
                        }
                    }, 100);
                }, null);
            },

            onSearch: function () {
                Common.openLoadingDialog(that);

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
                        console.log(oData);
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
                        console.log(oData);
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
                            //me.closeLoadingDialog();
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

                if (Object.keys(this._oSmartFilterCustomControlProp).length > 0) {
                    Object.keys(this._oSmartFilterCustomControlProp).forEach(item => {
                        var oCtrl = this.getView().byId("SmartFilterBar").determineControlByName(item);

                        if (oCtrl) {
                            var aCustomFilter = [];
    
                            if (oCtrl.getTokens().length === 1) {
                                oCtrl.getTokens().map(function(oToken) {
                                    aFilters.push(new Filter(item, FilterOperator.EQ, oToken.getKey()))
                                })
                            }
                            else if (oCtrl.getTokens().length > 1) {
                                oCtrl.getTokens().map(function(oToken) {
                                    aCustomFilter.push(new Filter(item, FilterOperator.EQ, oToken.getKey()))
                                })
    
                                aFilters.push(new Filter(aCustomFilter));
                            }
                        }
                    })
                }

                oModel.read("/StyleSet", {
                    filters: aFilters,
                    success: function (oData, oResponse) {
                        oText.setText(oData.results.length + "");
                        
                        oData.results.sort(function(a,b) {
                            return new Date(b.CREATEDDT) - new Date(a.CREATEDDT);
                        });

                        oData.results.forEach(item => {

                            // item.CREATEDDT = dateFormat.format(item.CREATEDDT);
                            // item.UPDATEDDT = dateFormat.format(item.UPDATEDDT);
                            //item.CREATEDDT = dateFormat.format(new Date(item.CREATEDDT));
                            if (item.CREATEDDT !== null && item.CREATEDDT !== "  /  /" && item.CREATEDDT !== "") {
                                item.CREATEDDT = dateFormat.format(new Date(item.CREATEDDT)) + " " + that.formatTimeOffSet(item.CREATEDTM.ms);// + " " + timeFormat.format(new Date(item.CREATEDTM));
                            }
                            if (item.UPDATEDDT !== null && item.UPDATEDDT !== "  /  /" && item.UPDATEDDT !== "" && item.UPDATEDDT !== " //  /  /" && item.UPDATEDDT != "  /  /") {
                                //console.log(item.UPDATEDDT)
                                item.UPDATEDDT = dateFormat.format(new Date(item.UPDATEDDT)) + " " + that.formatTimeOffSet(item.UPDATEDTM.ms);// + " " + timeFormat.format(new Date(item.UPDATEDTM));
                            }
                        })

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
                        "ColumnName": "Copy",// this._i18n.getText('Copy')
                        "ColumnType": "COPY",
                        "Visible": false
                    });

                    //add column for manage button
                    oColumnsData.unshift({
                        "ColumnName": "Manage", //this._i18n.getText('Manage')
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
               
                Common.closeLoadingDialog(that);

                //date/number sorting
                oTable.attachSort(function(oEvent) {
                    var sPath = oEvent.getParameter("column").getSortProperty();
                    var bDescending = false;
                    
                    //remove sort icon of currently sorted column
                    oTable.getColumns().forEach(col => {
                        if (col.getSorted()) {
                            col.setSorted(false);
                        }
                    })

                    oEvent.getParameter("column").setSorted(true); //sort icon initiator

                    if (oEvent.getParameter("sortOrder") === "Descending") {
                        bDescending = true;
                        oEvent.getParameter("column").setSortOrder("Descending") //sort icon Descending
                    }
                    else {
                        oEvent.getParameter("column").setSortOrder("Ascending") //sort icon Ascending
                    }

                    var oSorter = new sap.ui.model.Sorter(sPath, bDescending ); //sorter(columnData, If Ascending(false) or Descending(True))
                    var oColumn = oColumnsData.filter(fItem => fItem.ColumnName === oEvent.getParameter("column").getProperty("sortProperty"));
                    var columnType = oColumn[0].DataType;

                    if (columnType === "DATETIME") {
                        oSorter.fnCompare = function(a, b) {
                            // parse to Date object
                            var aDate = new Date(a);
                            var bDate = new Date(b);

                            if (bDate === null) { return -1; }
                            if (aDate === null) { return 1; }
                            if (aDate < bDate) { return -1; }
                            if (aDate > bDate) { return 1; }

                            return 0;
                        };
                    }
                    else if (columnType === "NUMBER") {
                        oSorter.fnCompare = function(a, b) {
                            // parse to Date object
                            var aNumber = +a;
                            var bNumber = +b;

                            if (bNumber === null) { return -1; }
                            if (aNumber === null) { return 1; }
                            if (aNumber < bNumber) { return -1; }
                            if (aNumber > bNumber) { return 1; }

                            return 0;
                        };
                    }
                    
                    oTable.getBinding('rows').sort(oSorter);
                    // prevent internal sorting by table
                    oEvent.preventDefault();
                });

                this.updateColumnMenu();
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

                    //var sColLabel = sColumnLabel ? sColumnLabel : _oCaption.sColumnId;
                    return new sap.ui.table.Column({
                        id: sColumnId,
                        //label: sColumnLabel ? sColumnLabel : "{i18n>" + sColumnId + "}",
                        // label: sColumnLabel ? sColumnLabel : "{ddtext>/" + sColumnId + "}",
                        label: new sap.m.Text({ text: sColumnLabel ? sColumnLabel : that.getView().getModel("ddtext").getData()[sColumnId] }) ,
                        template: me.columnTemplate(sColumnId, sColumnType),
                        width: sColumnWidth ? sColumnWidth + 'px' : me.getColumnSize(sColumnId, sColumnType),
                        sortProperty: sColumnId,
                        // filterProperty: sColumnId,
                        autoResizable: true,
                        visible: sColumnVisible,
                        sorted: sColumnSorted,
                        sortOrder: ((sColumnSorted === true) ? sColumnSortOrder : "Ascending")
                    });
                });

                this.updateColumnMenu();
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

            updateColumnMenu() {                
                var me = this;
                var oTable = this.getView().byId("styleDynTable"); 

                // var oMenuItem = new sap.ui.unified.MenuItem({
                //     icon: "sap-icon://filter",
                //     text: "Filter",
                //     select: function(oEvent) {
                //         // console.log(oEvent.getSource())
                //         me.onColFilter("styleDynTable", oEvent.getSource().oParent.oParent.getAggregation("label").getProperty("text"));
                //     }
                //     // select: this.onColFilter("styleDynTable")
                //     // submenu: oSubMenu
                // })

                oTable.getColumns().forEach(col => {
                    // console.log(col.getMenu())
                    // Loop onto each column and attach Column Menu Open event
                    col.attachColumnMenuOpen(function(oEvent) {
                        //Get Menu associated with column
                        var oMenu = col.getMenu();
                        var oMenuItem = new sap.ui.unified.MenuItem({
                            icon: "sap-icon://filter",
                            text: "Filter",
                            select: function(oEvent) {
                                me.onColFilter("styleDynTable", oEvent.getSource().oParent.oParent.getAggregation("label").getProperty("text"));
                            }
                        })

                        //Create the Menu Item that need to be added
                        setTimeout(() => {
                            // console.log(oMenu)
                            var wCustomFilter = false;
                            oMenu.getItems().forEach(item => {
                                // if (item.sId.indexOf("filter") >= 0) {
                                //     oMenu.removeItem(item);
                                // }

                                if (item.mProperties.text !== undefined && item.mProperties.text === "Filter") {
                                    wCustomFilter = true;
                                }

                                // console.log(item.mProperties.text)
                            })
                            
                            if (!wCustomFilter) {
                                oMenu.insertItem(oMenuItem, 2);
                            }
                            
                            oMenu.setPageSize(oMenu.getItems().length); 
                        }, 10);
                    });
                });                
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
                this.getOwnerComponent().getModel("UI_MODEL").setProperty("/fromScreen", "MAIN");
                
                if (this._GenericFilterDialog) {
                    this._GenericFilterDialog.setModel(new JSONModel());
                    console.log("go to details");
                }

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
                that._styleNo = aData[selected].STYLENO; 
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
                        oData["results"]=oData.results.filter(x=> x.Deleted !== "X");
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
                    MessageBox.information(_oCaption.INFO_INPUT_NEW_STYLE);
                } else if (newSeason === "") {
                    MessageBox.information(_oCaption.INFO_INPUT_NEW_SEASON);
                } else {
                    const isSeasonValid = this.getView().getModel("SeasonsModel").getData().results.filter(item => item.Seasoncd ===newSeason);
                    if (isSeasonValid.length == 0){
                        MessageBox.information("Invalid Season Code");
                        return;
                    }

                    if (bomCheck === true && colorCheck === false) {
                        MessageBox.information(_oCaption.INFO_INPUT_REQ_COLOR);
                    }else if (selected.length <= 0){
                        MessageBox.information(_oCaption.INFO_NO_SEL_VER_TO_PROC);
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
                                MessageBox.information(_oCaption.INFO_SAVE_SUCCESS);
                            },
                            error: function () {
                                me._CopyStyleDialog.close();
                                MessageBox.information(_oCaption.INFO_ERROR);
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
                    //that.onHeaderChange();
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
                        MessageBox.information(_oCaption.INFO_LAYOUT_SAVE);
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
                        sap.m.MessageBox.information(_oCaption.INFO_LAYOUT_SAVE);
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

                if (Object.keys(this._oSmartFilterCustomControlProp).length > 0) {
                    Object.keys(this._oSmartFilterCustomControlProp).forEach(item => {
                        var oCtrl = this.getView().byId("SmartFilterBar").determineControlByName(item);

                        if (oCtrl) {
                            var aCustomFilter = [];
    
                            if (oCtrl.getTokens().length === 1) {
                                oCtrl.getTokens().map(function(oToken) {
                                    aFilters.push(new Filter(item, FilterOperator.EQ, oToken.getKey()))
                                })
                            }
                            else if (oCtrl.getTokens().length > 1) {
                                oCtrl.getTokens().map(function(oToken) {
                                    aCustomFilter.push(new Filter(item, FilterOperator.EQ, oToken.getKey()))
                                })
    
                                aFilters.push(new Filter(aCustomFilter));
                            }
                        }
                    })
                }

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
                if(oEvent.getParameter("rowContext") != null){
                    var sPath = oEvent.getParameter("rowContext").getPath();
                    var oTable = this.getView().byId("styleDynTable");
                    var model = oTable.getModel();
                    //get the selected  data from the model and set to variable style
                    var data = model.getProperty(sPath);
                    styleNo = data['STYLENO'];
                }

            },

            onRefresh: function (oEvent) {
                //this.getColumns("SEARCH");
                this.getDynamicTableData("");
            },

            //padding zeroes for formatting
            pad: Common.pad,

            //export to spreadsheet utility
            onExport: Utils.onExport,

            //******************************************* */
            // Column Filtering
            //******************************************* */

            onColFilter: function(oEvent, sColumnLabel) {
                // console.log(oEvent, sColumnLabel)
                var sTableId = "";

                if (typeof(oEvent) === "string") {
                    sTableId = oEvent;
                }
                else {
                    sTableId = oEvent.getSource().data("TableName");
                }

                var sDialogFragmentName = "zui3derp.view.fragments.dialog.GenericFilterDialog";

                if (!this._GenericFilterDialog) {
                    this._GenericFilterDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
                    this._GenericFilterDialog.setModel(new JSONModel());
                    this.getView().addDependent(this._GenericFilterDialog);
                }

                var oTable = this.byId(sTableId);
                var oTableColumns = jQuery.extend(true, [], this.getView().getModel("DynColumns").getData().results);
                var oDialog = this._GenericFilterDialog;
                var aColumnItems = oDialog.getModel().getProperty("/items");
                var oFilterValues = oDialog.getModel().getProperty("/values");
                var oFilterCustom = oDialog.getModel().getProperty("/custom");
                var vSelectedItem = sColumnLabel === undefined ? oDialog.getModel().getProperty("/selectedItem") : sColumnLabel;
                var vSelectedColumn = oDialog.getModel().getProperty("/selectedColumn");
                var oSearchValues = {}; //oDialog.getModel().getProperty("/search");
                var aData = jQuery.extend(true, [], oTable.getModel("DataModel").getData().results);
                var oColumnValues = {};
                var bFiltered = false;
                var vFilterType = "VLF";

                if (oFilterCustom === undefined) { 
                    oFilterCustom = {};
                }        

                if (aColumnItems !== undefined) {
                    if (aColumnItems.filter(fItem => fItem.isFiltered === true).length > 0) { bFiltered = true; }
                }

                if (!bFiltered) {
                    oDialog.getModel().setProperty("/btnRemoveFilterEnable", false);
                }
                else {
                    oDialog.getModel().setProperty("/btnRemoveFilterEnable", true);
                }

                oTableColumns = oTableColumns.filter(col => !(col.ColumnName === "Manage" || col.ColumnName === "Copy"));
                oTableColumns.forEach((col, idx) => {
                    if (col.ColumnName === "CREATEDDT" || col.ColumnName === "UPDATEDDT") { col.DataType = "DATETIME" }

                    oColumnValues[col.ColumnName] = [];

                    aData.forEach(val => {
                        if (val[col.ColumnName] === "" || val[col.ColumnName] === null || val[col.ColumnName] === undefined) { val[col.ColumnName] = "(blank)" }
                        else if (val[col.ColumnName] === true) { val[col.ColumnName] = "Yes" }
                        else if (val[col.ColumnName] === false) { val[col.ColumnName] = "No" }

                        if (oColumnValues[col.ColumnName].findIndex(item => item.Value === val[col.ColumnName]) < 0) {
                            if (bFiltered && oFilterValues && oFilterValues[col.ColumnName].findIndex(item => item.Value === val[col.ColumnName]) >= 0) {
                                oFilterValues[col.ColumnName].forEach(item => {
                                    if (item.Value === val[col.ColumnName]) {
                                        oColumnValues[col.ColumnName].push({
                                            Value: item.Value,
                                            Selected: item.Selected
                                        })
                                    }
                                })
                            }
                            else {
                                oColumnValues[col.ColumnName].push({
                                    Value: val[col.ColumnName],
                                    Selected: true
                                })
                            }
                        }
                    }); 

                    oColumnValues[col.ColumnName].sort((a,b) => ((col.DataType === "NUMBER" ? +a.Value : (col.DataType === "DATETIME" ? (a.Value === "(blank)" ? "" : new Date(a.Value)) : a.Value)) > (col.DataType === "NUMBER" ? +b.Value : (col.DataType === "DATETIME" ? (b.Value === "(blank)" ? "" : new Date(b.Value)) : b.Value)) ? 1 : -1));

                    col.selected = false;                    

                    if (!bFiltered) { 
                        if (sColumnLabel === undefined) {
                            if (idx === 0) {
                                vSelectedColumn = col.ColumnName;
                                vSelectedItem = col.ColumnLabel;
                                col.selected = true;
                            }
                        }
                        else {
                            if (vSelectedItem === col.ColumnLabel) { 
                                vSelectedColumn = col.ColumnName;
                                col.selected = true;
                            }
                        }

                        oFilterCustom[col.ColumnName] = {
                            Operator: col.DataType === "STRING" ? "Contains" : "EQ",
                            ValFr: "",
                            ValTo: ""
                        };

                        col.filterType = "VLF";
                        col.isFiltered = false;                        
                    }
                    else if (bFiltered) {
                        aColumnItems.filter(fItem => fItem.ColumnName === col.ColumnName).forEach(item => {
                            col.filterType = item.filterType;
                            col.isFiltered = item.isFiltered;
                        })

                        if (vSelectedItem === col.ColumnLabel) { 
                            vSelectedColumn = col.ColumnName;
                            vFilterType = col.filterType;
                            col.selected = true;

                            if (col.isFiltered) {
                                oDialog.getModel().setProperty("/btnRemoveFilterEnable", true);
                            }
                            else {
                                oDialog.getModel().setProperty("/btnRemoveFilterEnable", false);
                            }
                        }
                    }

                    col.filterOperator = col.DataType === "STRING" ? "Contains" : "EQ";

                    oSearchValues[col.ColumnName] = "";
                })

                oDialog.getModel().setProperty("/sourceTabId", sTableId);
                oDialog.getModel().setProperty("/items", oTableColumns);
                oDialog.getModel().setProperty("/values", oColumnValues);
                oDialog.getModel().setProperty("/currValues", jQuery.extend(true, [], oColumnValues[vSelectedColumn]));
                oDialog.getModel().setProperty("/rowCount", oColumnValues[vSelectedColumn].length);
                oDialog.getModel().setProperty("/selectedItem", vSelectedItem);
                oDialog.getModel().setProperty("/selectedColumn", vSelectedColumn);
                oDialog.getModel().setProperty("/search", oSearchValues);
                oDialog.getModel().setProperty("/reset", false);
                oDialog.getModel().setProperty("/custom", oFilterCustom);
                oDialog.getModel().setProperty("/customColFilterOperator", oFilterCustom[vSelectedColumn].Operator);
                oDialog.getModel().setProperty("/customColFilterFrVal", oFilterCustom[vSelectedColumn].ValFr);
                oDialog.getModel().setProperty("/customColFilterToVal", oFilterCustom[vSelectedColumn].ValTo);
                oDialog.getModel().setProperty("/searchValue", "");
                oDialog.getModel().setProperty("/panelUDFToVisible", false);
                oDialog.open();
                // oDialog.setInitialFocus(sap.ui.getCore().byId("searchFilterValue"));

                var bAddSelection = false;
                var iStartSelection = -1, iEndSelection = -1;
                var oTableValues = oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[1].getItems()[0]; // oDialog.getContent()[0].getDetailPage("detail").getContent()[0].getItems()[0].getContent()[0];
                
                oTableValues.clearSelection();
                oColumnValues[vSelectedColumn].forEach((row, idx) => {
                    if (row.Selected) { 
                        if (iStartSelection === -1) iStartSelection = idx;
                        iEndSelection = idx;
                    }
                    
                    if (!row.Selected || idx === (oColumnValues[vSelectedColumn].length - 1)) {
                        if (iStartSelection !== -1) { 
                            if (!bAddSelection) { oTableValues.setSelectionInterval(iStartSelection, iEndSelection); }
                            else { oTableValues.addSelectionInterval(iStartSelection, iEndSelection); }
                            
                            bAddSelection = true;
                            oDialog.getModel().setProperty("/reset", false);
                        } 

                        iStartSelection = -1;
                        iEndSelection = -1;
                    }
                })

                oDialog.getModel().setProperty("/reset", true);

                var oBtnClear;
                oDialog.getAggregation("buttons").forEach(item => {
                    item.getAggregation("customData").forEach(data => {
                        if (data.getProperty("value") === "Clear") { oBtnClear = item; }
                    })
                })

                if (bFiltered) { oBtnClear.setEnabled(true); }
                else { oBtnClear.setEnabled(false); }

                oDialog.getContent()[0].getMasterPages()[0].getContent()[0].getItems().forEach(item => {
                    if (oTableColumns.filter(fItem => fItem.ColumnLabel === item.getTitle())[0].isFiltered) { item.setIcon("sap-icon://filter") }
                    else { item.setIcon("sap-icon://text-align-justified") }
                });

                if (vFilterType === "UDF") {
                    oDialog.getModel().setProperty("/selectUDF", true);
                    oDialog.getModel().setProperty("/panelVLFVisible", false);
                    oDialog.getModel().setProperty("/panelUDFVisible", true);
                }
                else {
                    oDialog.getModel().setProperty("/selectVLF", true);
                    oDialog.getModel().setProperty("/panelVLFVisible", true);
                    oDialog.getModel().setProperty("/panelUDFVisible", false);
                }

                var vDataType = oTableColumns.filter(fItem => fItem.ColumnName === vSelectedColumn)[0].DataType;
                
                if (vDataType === "BOOLEAN") {
                    oDialog.getModel().setProperty("/rbtnUDFVisible", false);
                    oDialog.getModel().setProperty("/lblUDFVisible", false);
                }
                else {
                    oDialog.getModel().setProperty("/rbtnUDFVisible", true);
                    oDialog.getModel().setProperty("/lblUDFVisible", true);
                }

                if (vDataType === "NUMBER") {
                    oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[0].getItems()[1].setType("Number");
                    oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[1].getItems()[1].setType("Number");
                }
                else {
                    oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[0].getItems()[1].setType("Text");
                    oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[1].getItems()[1].setType("Text");
                }

                if (vDataType === "DATETIME") {
                    oDialog.getModel().setProperty("/customColFilterFrValVisible", false);
                    oDialog.getModel().setProperty("/customColFilterToValVisible", false);
                    oDialog.getModel().setProperty("/customColFilterFrDateVisible", true);
                    oDialog.getModel().setProperty("/customColFilterToDateVisible", true);
                }
                else {
                    oDialog.getModel().setProperty("/customColFilterFrValVisible", true);
                    oDialog.getModel().setProperty("/customColFilterToValVisible", true);
                    oDialog.getModel().setProperty("/customColFilterFrDateVisible", false);
                    oDialog.getModel().setProperty("/customColFilterToDateVisible", false);
                }

                if (vDataType !== "STRING") {
                    if (oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[0].getItems()[0].getItems().filter(item => item.getKey() === "Contains").length > 0) {
                        oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[0].getItems()[0].removeItem(3);
                        oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[0].getItems()[0].removeItem(2);
                    }
                }
                else {
                    if (oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[0].getItems()[0].getItems().filter(item => item.getKey() === "Contains").length === 0) {
                        oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[0].getItems()[0].insertItem(
                            new sap.ui.core.Item({
                                key: "Contains", 
                                text: "Contains"
                            }), 2
                        );
    
                        oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[0].getItems()[0].insertItem(
                            new sap.ui.core.Item({
                                key: "NotContains", 
                                text: "Not Contains"
                            }), 3
                        );
                    }
                }

                var oDelegateClick = {
                    onclick: function (oEvent) {
                        if (oEvent.srcControl.data("FilterType") === "UDF") {
                            oDialog.getModel().setProperty("/panelVLFVisible", false);
                            oDialog.getModel().setProperty("/panelUDFVisible", true);
        
                        }
                        else {
                            oDialog.getModel().setProperty("/panelVLFVisible", true);
                            oDialog.getModel().setProperty("/panelUDFVisible", false);
                        }
                    }
                };

                oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[0].getItems()[0].getContent()[3].addEventDelegate(oDelegateClick);
                oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[0].getItems()[0].getContent()[6].addEventDelegate(oDelegateClick);
                // sap.ui.getCore().byId("btnRemoveFilter").setTooltip("Remove " + vSelectedItem + " Filter");                
                this._GenericFilterDialogModel = jQuery.extend(true, [], oDialog.getModel())

                this._colFilters[sTableId] = jQuery.extend(true, {}, oDialog.getModel().getData());
                // this.getOwnerComponent().getModel("FILTER_MODEL").setProperty("/" + sTableId, this._colFilters[sTableId]);
            },

            onColFilterClear: function(oEvent) {
                var oDialog = this._GenericFilterDialog;
                var aColumnItems = oDialog.getModel().getProperty("/items");
                var oColumnValues = oDialog.getModel().getProperty("/values");
                var sSourceTabId = oDialog.getModel().getData().sourceTabId;
                oDialog.close();

                var oFilter = "";

                aColumnItems.forEach(item => {
                    oColumnValues[item.ColumnName].forEach(val => val.Selected = true)
                    item.isFiltered = false;
                })

                this.byId(sSourceTabId).getBinding("rows").filter(oFilter, "Application");
                // this.setActiveRowHighlight(sSourceTabId.replace("Tab",""));
                
                oDialog.getContent()[0].getMasterPages()[0].getContent()[0].getItems().forEach(item => item.setIcon("sap-icon://text-align-justified"));

                this.getView().byId("StylesCount").setText(this.byId(sSourceTabId).getModel("DataModel").getData().results.length + "");
                this.byId(sSourceTabId).getColumns().forEach(col => {                   
                    col.setProperty("filtered", false);
                })

                this._colFilters[sSourceTabId] = jQuery.extend(true, {}, oDialog.getModel().getData());
                // this.getOwnerComponent().getModel("FILTER_MODEL").setProperty("/" + sSourceTabId, this._colFilters[sSourceTabId]);
            },

            onColFilterCancel: function(oEvent) {
                var oDialogModel = this._GenericFilterDialogModel;
                var oDialog = this._GenericFilterDialog;
                oDialog.getModel().setProperty("/items", oDialogModel.getData().items);
                oDialog.getModel().setProperty("/values", oDialogModel.getData().values);
                oDialog.getModel().setProperty("/currValues", oDialogModel.getData().currValues);
                oDialog.getModel().setProperty("/search", oDialogModel.getData().search);
                oDialog.getModel().setProperty("/custom", oDialogModel.getData().custom);

                oDialog.getContent()[0].getMasterPages()[0].getContent()[0].getItems().forEach(item => {
                    var isFiltered = oDialogModel.getData().items.filter(fItem => fItem.ColumnLabel === item.getTitle())[0].isFiltered;
                    
                    if (isFiltered) {
                        item.setIcon("sap-icon://filter");
                    }
                    else {
                        item.setIcon("sap-icon://text-align-justified");
                    }
                });

                this._GenericFilterDialog.close();
            },

            onColFilterConfirm: function(oEvent) {
                var oDialog = this._GenericFilterDialog;
                var aColumnItems = oDialog.getModel().getProperty("/items");
                var oColumnValues = oDialog.getModel().getProperty("/values");
                var oFilterCustom = oDialog.getModel().getProperty("/custom");
                var sSourceTabId = oDialog.getModel().getData().sourceTabId;
                oDialog.close();

                var aFilter = [];
                var oFilter = null;
                var oSourceTableColumns = this.byId(sSourceTabId).getColumns().filter(fItem => fItem.getAggregation("label") !== null);
               
                aColumnItems.forEach(item => {
                    var oColumn = oSourceTableColumns.filter(fItem => fItem.getAggregation("label").getProperty("text") === item.ColumnLabel)[0];                    
                    var aColFilter = [];
                    var oColFilter = null;

                    if (item.filterType === "VLF" && oColumnValues[item.ColumnName].filter(fItem => fItem.Selected === false).length > 0) {
                        oColumnValues[item.ColumnName].forEach(val => {
                            if (val.Selected) {
                                if (val.Value === "(blank)") {
                                    aColFilter.push(new Filter(item.ColumnName, this.getConnector("EQ"), ""));
                                    aColFilter.push(new Filter(item.ColumnName, this.getConnector("EQ"), null));
                                    aColFilter.push(new Filter(item.ColumnName, this.getConnector("EQ"), undefined));
                                }
                                else if (item.DataType === "BOOLEAN") {
                                    if (val.Value === "Yes") {
                                        aColFilter.push(new Filter(item.ColumnName, this.getConnector("EQ"), true))
                                    }
                                    else {
                                        aColFilter.push(new Filter(item.ColumnName, this.getConnector("EQ"), false))
                                    }
                                }
                                else {
                                    aColFilter.push(new Filter(item.ColumnName, this.getConnector("EQ"), val.Value))
                                }
                            }
                        })

                        oColFilter = new Filter(aColFilter, false);
                        aFilter.push(new Filter(oColFilter));

                        oColumn.setProperty("filtered", true);
                        item.isFiltered = true;
                    }
                    else if (item.filterType === "UDF" && oFilterCustom[item.ColumnName].ValFr !== "") {
                        if (oFilterCustom[item.ColumnName].ValTo !== "") {
                            aFilter.push(new Filter(item.ColumnName, this.getConnector("BT"), oFilterCustom[item.ColumnName].ValFr, oFilterCustom[item.ColumnName].ValTo));
                        }
                        else {
                            aFilter.push(new Filter(item.ColumnName, this.getConnector(oFilterCustom[item.ColumnName].Operator), oFilterCustom[item.ColumnName].ValFr));
                        }

                        oColumn.setProperty("filtered", true);
                        item.isFiltered = true;
                    }
                    else {
                        oColumn.setProperty("filtered", false);
                        item.isFiltered = false;
                    }
                })
                
                if (aFilter.length > 0) {
                    oFilter = new Filter(aFilter, true);
                }
                else {
                    oFilter = "";
                }

                // console.log(oFilter)
                this.byId(sSourceTabId).getBinding("rows").filter(oFilter, "Application");
                
                if (oFilter !== "") {                 
                    if (this.byId(sSourceTabId).getBinding("rows").aIndices.length === 0) {
                        this.getView().byId("StylesCount").setText("0");
                    }
                    else {
                        this.getView().byId("StylesCount").setText(this.byId(sSourceTabId).getBinding("rows").aIndices.length + "");
                    }
                }
                else {
                    this.getView().byId("StylesCount").setText(this.byId(sSourceTabId).getModel("DataModel").getData().results.length + "");
                }

                this._colFilters[sSourceTabId] = jQuery.extend(true, {}, oDialog.getModel().getData());
                // this.getOwnerComponent().getModel("FILTER_MODEL").setProperty("/" + sSourceTabId, this._colFilters[sSourceTabId]);
            },

            onFilterItemPress: function(oEvent) {
                var oDialog = this._GenericFilterDialog;
                var aColumnItems = oDialog.getModel().getProperty("/items");
                var oColumnValues = oDialog.getModel().getProperty("/values");
                var oFilterCustom = oDialog.getModel().getProperty("/custom");
                // var oSearchValues = oDialog.getModel().getProperty("/search");
                var vSelectedItem = oEvent.getSource().getSelectedItem().getProperty("title");
                var vSelectedColumn = "";

                aColumnItems.forEach(item => {
                    if (item.ColumnLabel === vSelectedItem) { 
                        vSelectedColumn = item.ColumnName; 

                        if (item.isFiltered) {
                            oDialog.getModel().setProperty("/btnRemoveFilterEnable", true);
                        }
                        else {
                            oDialog.getModel().setProperty("/btnRemoveFilterEnable", false);
                        }
                    }
                })
                // oDialog.getModel().setProperty("/btnRemoveFilterEnable", true);
                oDialog.getModel().setProperty("/currValues", jQuery.extend(true, [], oColumnValues[vSelectedColumn]));
                oDialog.getModel().setProperty("/rowCount", oColumnValues[vSelectedColumn].length);
                oDialog.getModel().setProperty("/selectedItem", vSelectedItem);
                oDialog.getModel().setProperty("/selectedColumn", vSelectedColumn);
                oDialog.getModel().setProperty("/reset", false);
                oDialog.getModel().setProperty("/customColFilterOperator", oFilterCustom[vSelectedColumn].Operator);
                oDialog.getModel().setProperty("/customColFilterFrVal", oFilterCustom[vSelectedColumn].ValFr);
                oDialog.getModel().setProperty("/customColFilterToVal", oFilterCustom[vSelectedColumn].ValTo);
                oDialog.getModel().setProperty("/searchValue", "");

                // var vSearchText = oSearchValues[vSelectedColumn];
                // this.onSearchFilterValue(vSearchText); 

                var bAddSelection = false;
                var iStartSelection = -1, iEndSelection = -1;
                var oTableValues = oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[1].getItems()[0];
                oTableValues.clearSelection();
                oColumnValues[vSelectedColumn].forEach((row, idx) => {
                    if (row.Selected) { 
                        if (iStartSelection === -1) iStartSelection = idx;
                        iEndSelection = idx;
                    }
                    
                    if (!row.Selected || idx === (oColumnValues[vSelectedColumn].length - 1)) {
                        if (iStartSelection !== -1) { 
                            if (!bAddSelection) { oTableValues.setSelectionInterval(iStartSelection, iEndSelection); }
                            else { oTableValues.addSelectionInterval(iStartSelection, iEndSelection); }
                            
                            bAddSelection = true;
                            oDialog.getModel().setProperty("/reset", false);
                        } 

                        iStartSelection = -1;
                        iEndSelection = -1;
                    }
                })

                var vFilterType = aColumnItems.filter(fItem => fItem.ColumnName === vSelectedColumn)[0].filterType;
                var vDataType = aColumnItems.filter(fItem => fItem.ColumnName === vSelectedColumn)[0].DataType;

                if (vFilterType === "UDF") {
                    oDialog.getModel().setProperty("/selectVLF", false);
                    oDialog.getModel().setProperty("/selectUDF", true);
                    oDialog.getModel().setProperty("/panelVLFVisible", false);
                    oDialog.getModel().setProperty("/panelUDFVisible", true);

                }
                else {
                    oDialog.getModel().setProperty("/selectUDF", false);
                    oDialog.getModel().setProperty("/selectVLF", true);
                    oDialog.getModel().setProperty("/panelVLFVisible", true);
                    oDialog.getModel().setProperty("/panelUDFVisible", false);

                }

                if (oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[0].getItems()[0].getSelectedKey() === "BT") {
                    oDialog.getModel().setProperty("/panelUDFToVisible", true);
                }
                else {
                    oDialog.getModel().setProperty("/panelUDFToVisible", false);
                }

                if (vDataType === "BOOLEAN") {
                    oDialog.getModel().setProperty("/rbtnUDFVisible", false);
                    oDialog.getModel().setProperty("/lblUDFVisible", false);
                }
                else {
                    oDialog.getModel().setProperty("/rbtnUDFVisible", true);
                    oDialog.getModel().setProperty("/lblUDFVisible", true);
                }

                if (vDataType === "NUMBER") {
                    oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[0].getItems()[1].setType("Number");
                    oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[1].getItems()[1].setType("Number");
                }
                else {
                    oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[0].getItems()[1].setType("Text");
                    oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[1].getItems()[1].setType("Text");
                }

                if (vDataType === "DATETIME") {
                    oDialog.getModel().setProperty("/customColFilterFrValVisible", false);
                    oDialog.getModel().setProperty("/customColFilterToValVisible", false);
                    oDialog.getModel().setProperty("/customColFilterFrDateVisible", true);
                    oDialog.getModel().setProperty("/customColFilterToDateVisible", true);
                }
                else {
                    oDialog.getModel().setProperty("/customColFilterFrValVisible", true);
                    oDialog.getModel().setProperty("/customColFilterToValVisible", true);
                    oDialog.getModel().setProperty("/customColFilterFrDateVisible", false);
                    oDialog.getModel().setProperty("/customColFilterToDateVisible", false);
                }

                if (vDataType !== "STRING") {
                    if (oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[0].getItems()[0].getItems().filter(item => item.getKey() === "Contains").length > 0) {
                        oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[0].getItems()[0].removeItem(3);
                        oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[0].getItems()[0].removeItem(2);
                    }
                }
                else {
                    if (oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[0].getItems()[0].getItems().filter(item => item.getKey() === "Contains").length === 0) {
                        oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[0].getItems()[0].insertItem(
                            new sap.ui.core.Item({
                                key: "Contains", 
                                text: "Contains"
                            }), 2
                        );
    
                        oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[0].getItems()[0].insertItem(
                            new sap.ui.core.Item({
                                key: "NotContains", 
                                text: "Not Contains"
                            }), 3
                        );
                    }
                }

                // sap.ui.getCore().byId("btnRemoveFilter").setTooltip("Remove " + vSelectedItem + " Filter");
                oDialog.getModel().setProperty("/reset", true);
                // oDialog.getModel().refresh();
            },

            onFilterValuesSelectionChange: function(oEvent) { 
                var oDialog = this._GenericFilterDialog;
                
                if (oDialog.getModel().getProperty("/reset")) {
                    var aColumnItems = oDialog.getModel().getProperty("/items");
                    var oColumnValues = oDialog.getModel().getProperty("/values");
                    var oCurrColumnValues = oDialog.getModel().getProperty("/currValues");
                    var vSelectedColumn = oDialog.getModel().getProperty("/selectedColumn");
                    var vSelectedItem = oDialog.getModel().getProperty("/selectedItem");
                    var oTableValues = oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[1].getItems()[0];
                    var bFiltered = false;
                    
                    oCurrColumnValues.forEach((item, idx) => {
                        if (oTableValues.isIndexSelected(idx)) { 
                            item.Selected = true;
                            oColumnValues[vSelectedColumn].filter(fItem => fItem.Value === item.Value).forEach(val => val.Selected = true);
                        }
                        else { 
                            bFiltered = true;
                            item.Selected = false;
                            oColumnValues[vSelectedColumn].filter(fItem => fItem.Value === item.Value).forEach(val => val.Selected = false);
                        }
                    })

                    if (bFiltered) { 
                        oDialog.getModel().setProperty("/selectVLF", true);
                        oDialog.getModel().setProperty("/panelVLFVisible", true);
                        oDialog.getModel().setProperty("/panelUDFVisible", false);
    
                        aColumnItems.forEach(item => {
                            if (item.ColumnName === vSelectedColumn) {
                                item.filterType = "VLF";
                                item.isFiltered = true;
                            }
                        })
                    }
                    else {
                        oDialog.getModel().setProperty("/btnRemoveFilterEnable", false);
                    }

                    // if (oColumnValues[vSelectedColumn].filter(fItem => fItem.Selected === true).length === 0) {
                    //     MessageBox.information("Please select at least one (1) value.");
                    // }
                    // else {
                        var vFilterType = aColumnItems.filter(fItem => fItem.ColumnName === vSelectedColumn)[0].filterType;
                        var oItem = oDialog.getContent()[0].getMasterPages()[0].getContent()[0].getItems().filter(fItem => fItem.getTitle() === vSelectedItem)[0];

                        if (vFilterType === "VLF") {
                            if (bFiltered) {
                                oItem.setIcon("sap-icon://filter");
                                oDialog.getModel().setProperty("/btnRemoveFilterEnable", true);
                            }
                            else {
                                oItem.setIcon("sap-icon://text-align-justified");
                                oDialog.getModel().setProperty("/btnRemoveFilterEnable", false);
                            }
                        }
                    // }
                }
            },

            onSearchFilterValue: function(oEvent) {
                var oDialog = this._GenericFilterDialog;   
                var oColumnValues = oDialog.getModel().getProperty("/values");
                var oCurrColumnValues = []; //oDialog.getModel().getProperty("/currValues");
                var oSearchValues = oDialog.getModel().getProperty("/search");
                var vSelectedColumn = oDialog.getModel().getProperty("/selectedColumn");
                var oTableValues = oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[1].getItems()[0];
                var sQuery = "";
                var bAddSelection = false;
                var iStartSelection = -1, iEndSelection = -1;

                if (typeof(oEvent) === "string") {
                    sQuery = oEvent;
                }
                else {
                    sQuery = oEvent.getParameter("query");
                }

                if (sQuery) {
                    oColumnValues[vSelectedColumn].forEach(val => {
                        if (val.Value.toLocaleLowerCase().indexOf(sQuery.toLocaleLowerCase()) >= 0) {
                            oCurrColumnValues.push(val);
                        }
                    })
                }
                else {
                    oCurrColumnValues = oColumnValues[vSelectedColumn];
                }

                oSearchValues[vSelectedColumn] = sQuery;
                oDialog.getModel().setProperty("/search", oSearchValues);
                oDialog.getModel().setProperty("/currValues", oCurrColumnValues);
                oDialog.getModel().setProperty("/rowCount", oCurrColumnValues.length);
                oDialog.getModel().setProperty("/reset", false);

                var oCopyCurrColumnValues = jQuery.extend(true, [], oCurrColumnValues)
                oTableValues.clearSelection();

                oCopyCurrColumnValues.forEach((row, idx) => {
                    if (row.Selected) { 
                        if (iStartSelection === -1) iStartSelection = idx;
                        iEndSelection = idx;
                    }
                    
                    if (!row.Selected || idx === (oCopyCurrColumnValues.length - 1)) {
                        if (iStartSelection !== -1) { 
                            if (!bAddSelection) { oTableValues.setSelectionInterval(iStartSelection, iEndSelection); }
                            else { oTableValues.addSelectionInterval(iStartSelection, iEndSelection); }
                            
                            bAddSelection = true;
                            oDialog.getModel().setProperty("/reset", false);
                        } 

                        iStartSelection = -1;
                        iEndSelection = -1;
                    }
                })

                oDialog.getModel().setProperty("/reset", true);
            },

            onCustomColFilterChange: function(oEvent) {
                var oDialog = this._GenericFilterDialog;

                if (oEvent.getSource().getSelectedKey() !== undefined) {
                    if (oEvent.getSource().getSelectedKey() === "BT") {
                        oDialog.getModel().setProperty("/panelUDFToVisible", true);
                    }
                    else {
                        oDialog.getModel().setProperty("/panelUDFToVisible", false);
                    }
                }

                var aColumnItems = oDialog.getModel().getProperty("/items");
                var vSelectedColumn = oDialog.getModel().getProperty("/selectedColumn");
                var vSelectedItem = oDialog.getModel().getProperty("/selectedItem");
                var oFilterCustom = oDialog.getModel().getProperty("/custom");
                var sOperator = oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[0].getItems()[0].getSelectedKey();
                var vDataType = aColumnItems.filter(fItem => fItem.ColumnName === vSelectedColumn)[0].DataType;
                var sValueFr = oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[0].getItems()[1].getValue();
                var sValueTo = oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[1].getItems()[1].getValue();

                if (vDataType === "DATETIME") {
                    sValueFr = oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[0].getItems()[2].getValue();
                    sValueTo = oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[1].getItems()[2].getValue();
                }

                oFilterCustom[vSelectedColumn].Operator = sOperator;
                oFilterCustom[vSelectedColumn].ValFr = sValueFr;
                oFilterCustom[vSelectedColumn].ValTo = sValueTo;
                oDialog.getModel().setProperty("/custom", oFilterCustom);

                if (sValueFr !== "") { 
                    oDialog.getModel().setProperty("/selectUDF", true);
                    oDialog.getModel().setProperty("/panelVLFVisible", false);
                    oDialog.getModel().setProperty("/panelUDFVisible", true);

                    aColumnItems.forEach(item => {
                        if (item.ColumnName === vSelectedColumn) {
                            item.filterType = "UDF";
                            item.isFiltered = true;
                        }
                    })                    
                }

                var vFilterType = aColumnItems.filter(fItem => fItem.ColumnName === vSelectedColumn)[0].filterType;
                var oItem = oDialog.getContent()[0].getMasterPages()[0].getContent()[0].getItems().filter(fItem => fItem.getTitle() === vSelectedItem)[0];

                if (vFilterType === "UDF") {
                    if (sValueFr !== "") {
                        oItem.setIcon("sap-icon://filter");
                        oDialog.getModel().setProperty("/btnRemoveFilterEnable", true);
                    }
                    else {
                        oItem.setIcon("sap-icon://text-align-justified");
                        oDialog.getModel().setProperty("/btnRemoveFilterEnable", false);
                    }
                }                
            },

            onSetUseColFilter: function(oEvent) {
                var oDialog = this._GenericFilterDialog;
                var aColumnItems = oDialog.getModel().getProperty("/items");
                var oColumnValues = oDialog.getModel().getProperty("/values");
                var vSelectedColumn = oDialog.getModel().getProperty("/selectedColumn");
                var vSelectedItem = oDialog.getModel().getProperty("/selectedItem");

                aColumnItems.forEach(item => {
                    if (item.ColumnName === vSelectedColumn && oEvent.getParameter("selected")) {
                        item.filterType = oEvent.getSource().data("FilterType");
                    }
                })

                var oItem = oDialog.getContent()[0].getMasterPages()[0].getContent()[0].getItems().filter(fItem => fItem.getTitle() === vSelectedItem)[0];
                
                if (oEvent.getSource().data("FilterType") === "UDF") {
                    oDialog.getModel().setProperty("/panelVLFVisible", false);
                    oDialog.getModel().setProperty("/panelUDFVisible", true);


                    if (oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[2].getItems()[0].getItems()[1].getValue() !== "" && oEvent.getParameter("selected")) {
                        oDialog.getModel().setProperty("/btnRemoveFilterEnable", true);
                        oItem.setIcon("sap-icon://filter");
                    }
                    else {
                        oDialog.getModel().setProperty("/btnRemoveFilterEnable", false);
                        oItem.setIcon("sap-icon://text-align-justified");
                    }
                }
                else {
                    oDialog.getModel().setProperty("/panelVLFVisible", true);
                    oDialog.getModel().setProperty("/panelUDFVisible", false);


                    if (oColumnValues[vSelectedColumn].filter(fItem => fItem.Selected === false).length > 0 && oEvent.getParameter("selected")) {
                        oDialog.getModel().setProperty("/btnRemoveFilterEnable", true);
                        oItem.setIcon("sap-icon://filter");
                    }
                    else {
                        oDialog.getModel().setProperty("/btnRemoveFilterEnable", false);
                        oItem.setIcon("sap-icon://text-align-justified");
                    }
                }
            },

            onRemoveColFilter: function(oEvent) {
                var oDialog = this._GenericFilterDialog;
                var aColumnItems = oDialog.getModel().getProperty("/items");
                var oColumnValues = oDialog.getModel().getProperty("/values");
                var oFilterCustom = oDialog.getModel().getProperty("/custom");
                var vSelectedColumn = oDialog.getModel().getProperty("/selectedColumn");
                var vSelectedItem = oDialog.getModel().getProperty("/selectedItem");

                aColumnItems.forEach(item => {
                    if (item.ColumnName === vSelectedColumn) {
                        item.isFiltered = false;

                        // oFilterCustom[vSelectedColumn].Operator = item.filterOperator;
                        // oFilterCustom[vSelectedColumn].ValFr = "";
                        // oFilterCustom[vSelectedColumn].ValTo = "";
                    }
                })

                oFilterCustom[vSelectedColumn].ValFr = "";
                oFilterCustom[vSelectedColumn].ValTo = "";
                oDialog.getModel().setProperty("/custom", oFilterCustom);
                // oDialog.getModel().setProperty("/customColFilterOperator", oFilterCustom[vSelectedColumn].Operator);
                oDialog.getModel().setProperty("/customColFilterFrVal", "");
                oDialog.getModel().setProperty("/customColFilterToVal", "");
                
                oColumnValues[vSelectedColumn].forEach(item => item.Selected = true);

                var bAddSelection = false;
                var iStartSelection = -1, iEndSelection = -1;
                var oTableValues = oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[1].getItems()[0];

                oDialog.getModel().setProperty("/reset", false);
                oTableValues.clearSelection();
                oColumnValues[vSelectedColumn].forEach((row, idx) => {
                    if (row.Selected) { 
                        if (iStartSelection === -1) iStartSelection = idx;
                        iEndSelection = idx;
                    }
                    
                    if (!row.Selected || idx === (oColumnValues[vSelectedColumn].length - 1)) {
                        if (iStartSelection !== -1) { 
                            if (!bAddSelection) { oTableValues.setSelectionInterval(iStartSelection, iEndSelection); }
                            else { oTableValues.addSelectionInterval(iStartSelection, iEndSelection); }
                            
                            bAddSelection = true;
                            oDialog.getModel().setProperty("/reset", false);
                        } 

                        iStartSelection = -1;
                        iEndSelection = -1;
                    }
                })

                oDialog.getModel().setProperty("/reset", true);

                oDialog.getModel().setProperty("/values", oColumnValues);
                oDialog.getModel().setProperty("/currValues", oColumnValues[vSelectedColumn]);

                oDialog.getContent()[0].getMasterPages()[0].getContent()[0].getItems().forEach(item => {
                    if (item.getTitle() === vSelectedItem) {
                        item.setIcon("sap-icon://text-align-justified")
                    }
                });

                oDialog.getModel().setProperty("/btnRemoveFilterEnable", false);
            },

            getConnector(args) {
                var oConnector;

                switch (args) {
                    case "EQ":
                        oConnector = sap.ui.model.FilterOperator.EQ
                        break;
                    case "NE":
                        oConnector = sap.ui.model.FilterOperator.NE
                        break;
                    case "GT":
                        oConnector = sap.ui.model.FilterOperator.GT
                        break;
                    case "GE":
                        oConnector = sap.ui.model.FilterOperator.GE
                        break; 
                    case "LT":
                        oConnector = sap.ui.model.FilterOperator.LT
                        break;
                    case "LE":
                        oConnector = sap.ui.model.FilterOperator.LE
                        break;
                    case "BT":
                        oConnector = sap.ui.model.FilterOperator.BT
                        break;
                    case "Contains":
                        oConnector = sap.ui.model.FilterOperator.Contains
                        break;
                    case "NotContains":
                        oConnector = sap.ui.model.FilterOperator.NotContains
                        break;
                    case "StartsWith":
                        oConnector = sap.ui.model.FilterOperator.StartsWith
                        break;
                    case "NotStartsWith":
                        oConnector = sap.ui.model.FilterOperator.NotStartsWith
                        break;
                    case "EndsWith":
                        oConnector = sap.ui.model.FilterOperator.EndsWith
                        break;
                    case "NotEndsWith":
                        oConnector = sap.ui.model.FilterOperator.NotEndsWith
                        break;
                    default:
                        oConnector = sap.ui.model.FilterOperator.Contains
                        break;
                }

                return oConnector;
            },

            formatTimeOffSet(pTime) {
                let TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
                return timeFormat.format(new Date(pTime + TZOffsetMs));
            },

            onCustomSmartFilterValueHelpChange: function(oEvent) {
                if (oEvent.getParameter("value") === "") {
                    this._oMultiInput.setValueState("None");
                }
            },

            onCustomSmartFilterValueHelp: function() {
                this.oColModel = new JSONModel({
                    "cols": [
                        {
                            "label": "Sales Group",
                            "template": "SalesGrp",
                            "sortProperty": "SalesGrp"
                        },
                        {
                            "label": "Description",
                            "template": "Desc1",
                            "sortProperty": "Desc1"
                        },
                    ]
                });

                var aCols = this.oColModel.getData().cols;
                this._oBasicSearchField = new SearchField({
                    showSearchButton: false
                });
    
                this._oCustomSmartFilterValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.SmartFilterValueHelpDialog", this);
                this.getView().addDependent(this._oCustomSmartFilterValueHelpDialog);
    
                this._oCustomSmartFilterValueHelpDialog.setRangeKeyFields([{
                    label: "Sales Group",
                    key: "SalesGrp",
                    type: "string",
                    typeInstance: new typeString({}, {
                        maxLength: 4
                    })
                }]);
    
                // this._oCustomSmartFilterValueHelpDialog.getFilterBar().setBasicSearch(this._oBasicSearchField);
    
                this._oCustomSmartFilterValueHelpDialog.getTableAsync().then(function (oTable) {
                    oTable.setModel(this.getView().getModel("SalesGroupModel"));
                    oTable.setModel(this.oColModel, "columns");

                    if (oTable.bindRows) {
                        oTable.bindAggregation("rows", "/results");
                    }
    
                    if (oTable.bindItems) {
                        oTable.bindAggregation("items", "/results", function () {
                            return new ColumnListItem({
                                cells: aCols.map(function (column) {
                                    return new Label({ text: "{" + column.template + "}" });
                                })
                            });
                        });
                    }
    
                    this._oCustomSmartFilterValueHelpDialog.update();
                }.bind(this));
    
                
                this._oCustomSmartFilterValueHelpDialog.setTokens(this._oMultiInput.getTokens());
                this._oCustomSmartFilterValueHelpDialog.open();
            },

            
            onCustomSmartFilterValueHelpOkPress: function (oEvent) {
                var aTokens = oEvent.getParameter("tokens");

                this._oMultiInput.setTokens(aTokens);
                this._oCustomSmartFilterValueHelpDialog.close();
            },
    
            onCustomSmartFilterValueHelpCancelPress: function () {
                this._oCustomSmartFilterValueHelpDialog.close();
            },
    
            onCustomSmartFilterValueHelpAfterClose: function () {
                this._oCustomSmartFilterValueHelpDialog.destroy();
            },
    
            onFilterBarSearch: function (oEvent) {
                var sSearchQuery = this._oBasicSearchField.getValue(),
                    aSelectionSet = oEvent.getParameter("selectionSet");

                var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
                    if (oControl.getValue()) {
                        aResult.push(new Filter({
                            path: oControl.getName(),
                            operator: FilterOperator.Contains,
                            value1: oControl.getValue()
                        }));
                    }

                    return aResult;
                }, []);
    
                this._filterTable(new Filter({
                    filters: aFilters,
                    and: true
                }));
            },

            _filterTable: function (oFilter) {
                var oValueHelpDialog = this._oCustomSmartFilterValueHelpDialog;
    
                oValueHelpDialog.getTableAsync().then(function (oTable) {
                    if (oTable.bindRows) {
                        oTable.getBinding("rows").filter(oFilter);
                    }
    
                    if (oTable.bindItems) {
                        oTable.getBinding("items").filter(oFilter);
                    }
    
                    oValueHelpDialog.update();
                });
            },
    
            _onMultiInputValidate: function(oArgs) {
                var aToken = this._oMultiInput.getTokens();

                if (oArgs.suggestionObject) {
                    var oObject = oArgs.suggestionObject.getBindingContext("SalesGroupModel").getObject(),
                        oToken = new Token();

                    oToken.setKey(oObject.SalesGrp);
                    oToken.setText(oObject.Desc1 + " (" + oObject.SalesGrp + ")");
                    aToken.push(oToken)

                    this._oMultiInput.setTokens(aToken);
                    this._oMultiInput.setValueState("None");
                }
                else if (oArgs.text !== "") {
                    this._oMultiInput.setValueState("Error");
                }
    
                return null;
            },

            onCustomSmartFilterValueHelpChange: function(oEvent) {
                if (oEvent.getParameter("value") === "") {
                    this._oMultiInput.setValueState("None");
                }
            },

        });

    });
