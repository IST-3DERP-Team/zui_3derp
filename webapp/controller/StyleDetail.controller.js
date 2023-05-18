sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
    "../js/Common",
    "../js/Constants",
    "../js/Utils",
    "sap/ui/model/json/JSONModel",
    'jquery.sap.global',
    'sap/ui/core/routing/HashChanger',
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "../js/TableValueHelp",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, Common, Constants, Utils, JSONModel, jQuery, HashChanger, History, MessageBox, TableValueHelp) {
        "use strict";

        var that;
        var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "MM/dd/yyyy" });
        var _promiseResult;
        var _sAction;

        return Controller.extend("zui3derp.controller.StyleDetail", {

            onInit: function () {
                that = this;

                //Initialize router
                var oComponent = this.getOwnerComponent();
                this._router = oComponent.getRouter();
                this._router.getRoute("RouteStyleDetail").attachPatternMatched(this._routePatternMatched, this);

                //Add the attachments to screen
                this.appendUploadCollection();

                //Set the file data model
                var oModel = this.getOwnerComponent().getModel("FileModel");
                this.getView().setModel(oModel, "FileModel");


                this._headerChanged = false; //Set change flag
                this._validationErrors = [];

                if (sap.ui.getCore().byId("backBtn") !== undefined) {
                    this._fBackButton = sap.ui.getCore().byId("backBtn").mEventRegistry.press[0].fFunction;
                    sap.ui.getCore().byId("backBtn").mEventRegistry.press[0].fFunction = function (oEvent) {
                        that.onNavBack();
                    }
                }
                // var lookUpModel = {
                //     AttribCdModel: [],
                //     AttribTypeModel: [],
                //     ProcessCodeModel: [],
                //     UOMModel: [],
                //     UOMGMCModel: []
                // }

                // this.getOwnerComponent().getModel("LOOKUP_MODEL").setData(lookUpModel);
                this.getOwnerComponent().getModel("COLOR_MODEL").setData({ items: [] });
                this._tableValueHelp = TableValueHelp;

                //this.getAppAction();

                //Initialize translations
                this._i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();

                // console.log("init");
            },

            onExit: function () {
                sap.ui.getCore().byId("backBtn").mEventRegistry.press[0].fFunction = this._fBackButton;
            },

            getAppAction: async function () {
                if (sap.ushell.Container !== undefined) {
                    const fullHash = new HashChanger().getHash();
                    const urlParsing = await sap.ushell.Container.getServiceAsync("URLParsing");
                    const shellHash = urlParsing.parseShellHash(fullHash);
                    _sAction = shellHash.action;
                    var bAppChange;
                    console.log("dito")
                    if (_sAction == "display") bAppChange = false;
                    else bAppChange = true;
                } else {
                    bAppChange = true;
                }

                this.setControlAppAction(bAppChange);
            },

            onAfterRendering: function () {
                //double click event
                // console.log("onAfterRendering");
                // Utils.getStyleSearchHelps(this);
                // Utils.getAttributesSearchHelps(this);
                // Utils.getProcessAttributes(this);
                var oModel = new JSONModel();
                var oTable = this.getView().byId("versionsTable");
                oTable.setModel(oModel);
                oTable.attachBrowserEvent('dblclick', function (e) {
                    e.preventDefault();
                    that.onRouteVersion(); //navigate to RouteVersion page
                });
            },

            _routePatternMatched: async function (oEvent) {
                Common.openLoadingDialog(that);
                this._styleNo = oEvent.getParameter("arguments").styleno; //get Style from route pattern
                this._sbu = oEvent.getParameter("arguments").sbu; //get SBU from route pattern
                this._iono = oEvent.getParameter("arguments").iono; //get IONO from route pattern

                this._oModelStyle = this.getOwnerComponent().getModel("ZGW_3DERP_IOSTYLE_SRV");

                //set all as no changes at first load
                this._headerChanged = false;
                this._generalAttrChanged = false;
                this._colorChanged = false;
                this._sizeChanged = false;
                this._processChanged = false;
                this._versionChanged = false;
                this._dataMode = "READ";
                this._aColumns = {};
                this._colFilters = {};

                var lookUpData = this.getOwnerComponent().getModel("LOOKUP_MODEL").getData();
                // console.log(lookUpData)
                // console.log(this.getOwnerComponent().getModel("LOOKUP_MODEL").getData()["SeasonsModel"])
                // console.log(this.getOwnerComponent().getModel("LOOKUP_MODEL").getData()["ProdTypeModel"])
                // console.log(this.getOwnerComponent().getModel("LOOKUP_MODEL").getData()["StyleCatModel"])
                // console.log(this.getOwnerComponent().getModel("LOOKUP_MODEL").getData()["SalesGroupModel"])
                // console.log(this.getOwnerComponent().getModel("LOOKUP_MODEL").getData()["CustGroupModel"])
                // console.log(this.getOwnerComponent().getModel("LOOKUP_MODEL").getData()["CustomerModel"])

                if (this.getOwnerComponent().getModel("LOOKUP_MODEL").getData()["SeasonsModel"] !== undefined) {
                    this.getView().setModel(new JSONModel(lookUpData.SeasonsModel), "SeasonsModel");
                }
                if (this.getOwnerComponent().getModel("LOOKUP_MODEL").getData()["ProdTypeModel"] !== undefined) {
                    this.getView().setModel(new JSONModel(lookUpData.ProdTypeModel), "ProdTypeModel");
                }
                if (this.getOwnerComponent().getModel("LOOKUP_MODEL").getData()["StyleCatModel"] !== undefined) {
                    this.getView().setModel(new JSONModel(lookUpData.StyleCatModel), "StyleCatModel");
                }
                if (this.getOwnerComponent().getModel("LOOKUP_MODEL").getData()["SalesGroupModel"] !== undefined) {
                    this.getView().setModel(new JSONModel(lookUpData.SalesGroupModel), "SalesGroupModel");
                }
                if (this.getOwnerComponent().getModel("LOOKUP_MODEL").getData()["CustGroupModel"] !== undefined) {
                    this.getView().setModel(new JSONModel(lookUpData.CustGroupModel), "CustGroupModel");
                }
                if (this.getOwnerComponent().getModel("LOOKUP_MODEL").getData()["CustomerModel"] !== undefined) {
                    this.getView().setModel(new JSONModel(lookUpData.CustomerModel), "CustomerModel");
                }
                if (this.getOwnerComponent().getModel("LOOKUP_MODEL").getData()["SizeGroupModel"] !== undefined) {
                    this.getView().setModel(new JSONModel(lookUpData.SizeGroupModel), "SizeGroupModel");
                }
                if (this.getOwnerComponent().getModel("LOOKUP_MODEL").getData()["UOMModel"] !== undefined) {
                    this.getView().setModel(new JSONModel(lookUpData.UOMModel), "UOMModel");
                }
                if (this.getOwnerComponent().getModel("LOOKUP_MODEL").getData()["AttribTypeModel"] !== undefined) {
                    this.getView().setModel(new JSONModel(lookUpData.AttribTypeModel), "AttribTypeModel");
                }
                if (this.getOwnerComponent().getModel("LOOKUP_MODEL").getData()["AttribCdModel"] !== undefined) {
                    this.getView().setModel(new JSONModel(lookUpData.AttribCdModel), "AttribCdModel");
                }
                if (this.getOwnerComponent().getModel("LOOKUP_MODEL").getData()["ProcessAttribCodeModel"] !== undefined) {
                    this.getView().setModel(new JSONModel(lookUpData.ProcessAttribCodeModel), "ProcessAttribCodeModel");
                }
                if (this.getOwnerComponent().getModel("LOOKUP_MODEL").getData()["ProcessCodeModel"] !== undefined) {
                    this.getView().setModel(new JSONModel(lookUpData.ProcessCodeModel), "ProcessCodeModel");
                }
                if (this.getOwnerComponent().getModel("LOOKUP_MODEL").getData()["VASTypModel"] !== undefined) {
                    this.getView().setModel(new JSONModel(lookUpData.VASTypModel), "VASTypModel");
                }
                // console.log(this.getOwnerComponent().getModel("LOOKUP_MODEL").getData())

                _promiseResult = new Promise((resolve, reject) => {
                    resolve(that.getCaptionMsgs());
                });
                await _promiseResult;

                this.setChangeStatus(false);
                //set blnIOMod to true if route from IO
                var oJSONModel = new JSONModel();
                var oView = this.getView();
                var data = {
                    "blnIOMod": this._iono != ' ' ? true : false,
                }
                oJSONModel.setData(data);
                oView.setModel(oJSONModel, "IO");

                this.getIOs(false);
                this.getAppAction();
                this.setReqField("HeaderEditModeModel", false);

                if (this._styleNo === Constants.NEW) {
                    //create new - only header is editable at first
                    this.setHeaderEditMode();
                    this.setDetailVisible(false);
                    //this.setReqField("header", true);

                } else {
                    //existing style, get the style data
                    //this.cancelHeaderEdit();
                    this.setDetailVisible(true); //make detail section visible
                    this.getGeneralTable(); //get general attributes
                    this.getSizesTable(); //get sizes
                    this.getProcessesTable(); //get process
                    this.getVersionsTable(); //get versions
                    setTimeout(() => {
                       // this.cancelHeaderEdit();
                    }, 500);
                }

                //close all edit modes
                this.closeEditModes();

                //Load header
                this.getHeaderConfig(); //get visible header fields

                if (this._styleNo === Constants.NEW) {
                    //get default values from IO
                    if (this._iono != ' ') {
                        this.getIOHdrSet(this._iono);
                    }
                    else {
                        this.getHeaderData(); //get header data from style
                    }

                }
                else {
                    this.getHeaderData(); //get header data from style
                }

                this.getColorsTable();

                //Load value helps
                _promiseResult = new Promise((resolve, reject) => {
                    resolve(that.loadSearchHelps());
                });
                await _promiseResult;

                // Utils.getStyleSearchHelps(this);
                // Utils.getAttributesSearchHelps(this);
                // Utils.getProcessAttributes(this);
                // Utils.getVersionSearchHelps(this);

                //Attachments
                this.bindUploadCollection();
                this.getView().getModel("FileModel").refresh();
                this.setFilesEditMode();

                var cIconTabBar = this.getView().byId("detailPanel");
                if (this.getOwnerComponent().getModel("UI_MODEL").getData().fromScreen === "VERSION") {
                    cIconTabBar.setSelectedKey("version");
                }
                else {
                    cIconTabBar.setSelectedKey("genAttrib");
                }

                Common.closeLoadingDialog(that);
                console.log("route")
                //this.getAppAction();

                // setTimeout(() => {
                //     this.getColumnProp();
                // }, 1000);

                 
                _promiseResult = new Promise((resolve, reject) => {
                    resolve(that.getColumnProp());
                });
                await _promiseResult;
            },

            loadSearchHelps:async function(){
                await Utils.getStyleSearchHelps(this);
                await Utils.getAttributesSearchHelps(this);
                await Utils.getProcessAttributes(this);
                await Utils.getVersionSearchHelps(this);
            },

            closeEditModes: function () {
                //this.cancelGeneralAttrEdit();
                //this.cancelColorsEdit();
                //this.cancelSizeEdit();
                //this.cancelProcessEdit();
                //this.cancelVersionEdit();
                //this.cancelFilesEdit();

                var oJSONModel = new JSONModel();
                var data = {};
                that._headerChanged = false;
                that._generalAttrChanged = false;
                that._colorChanged = false;
                that._sizeChanged = false;
                that._processChanged = false;
                that._versionChanged = false;

                that.setChangeStatus(false);
                data.editMode = false;
                oJSONModel.setData(data);

                if (this._styleNo !== Constants.NEW) {
                    that.getView().setModel(oJSONModel, "HeaderEditModeModel");
                }
                that.getView().setModel(oJSONModel, "GenAttrEditModeModel");
                that.getView().setModel(oJSONModel, "ColorEditModeModel");
                that.getView().setModel(oJSONModel, "SizeEditModeModel");
                that.getView().setModel(oJSONModel, "ProcessEditModeModel");
                that.getView().setModel(oJSONModel, "VersionEditModeModel");
            },

            setChangeStatus: function (changed) {
                //controls the edited warning message
                try {
                    sap.ushell.Container.setDirtyFlag(changed);
                } catch (err) { }
            },

            setReqField(pType, pEditable) {
                if (pType == "HeaderEditModeModel") {
                    var fields = ["feSTYLECD", "feSTYLECAT", "fePRODTYP", "feDESC1", "feSALESGRP", "feSEASONCD", "feCUSTGRP", "feSOLDTOCUST", "feSIZEGRP", "feUOM"];

                    fields.forEach(id => {
                        if (pEditable) {
                            this.byId(id).setLabel("*" + this.byId(id).getLabel());
                            this.byId(id)._oLabel.addStyleClass("requiredField");
                        } else {
                            //console.log(this.byId(id).getLabel())
                            if (this.byId(id).getLabel() != null) {
                                this.byId(id).setLabel(this.byId(id).getLabel().replaceAll("*", ""));
                                this.byId(id)._oLabel.removeStyleClass("requiredField");
                            }
                        }
                    })
                } else {
                    var oTable = this.byId(pType);

                    oTable.getColumns().forEach((col, idx) => {
                        if (col.getLabel().getText().includes("*")) {
                            col.getLabel().setText(col.getLabel().getText().replaceAll("*", ""));
                        }

                        this._aColumns[pType].filter(item => item.label === col.getLabel().getText())
                            .forEach(ci => {
                                if (ci.required) {
                                    col.getLabel().removeStyleClass("requiredField");
                                }
                            })
                    })
                }
            },

            setDetailVisible: function (bool) {
                var detailPanel = this.getView().byId('detailPanel'); //show detail section if there is header info
                detailPanel.setVisible(bool);
            },

            getIOHdrSet: function (iono) {
                var oJSONModel = new JSONModel();
                var oView = this.getView();

                Common.openLoadingDialog(that);

                //read IO header data and set default value
                var entitySet = "/IOHdrSet('" + iono + "')"
                this._oModelStyle.read(entitySet, {
                    success: function (oData, oResponse) {
                        console.log(oData);
                        var ioData = {
                            "Stylecd": oData.Stylecd,
                            "Custgrp": oData.Custgrp,
                            "Prodtyp": oData.Prodtype,
                            "Salesgrp": oData.Salesgrp,
                            "Seasoncd": oData.Seasoncd,
                            "Uom": oData.Baseuom,
                            "Soldtocust": oData.Soldtocust
                        }

                        oJSONModel.setData(ioData);
                        oView.setModel(oJSONModel, "headerData");
                        Common.closeLoadingDialog(that);
                    },
                    error: function () {
                        Common.closeLoadingDialog(that);
                    }
                })

            },

            applyToIO: function () {
                //from IO module create new Style
                var param = {};
                var me = this;
                param["IONO"] = this._iono;
                param["STYLENO"] = this._styleNo
                //Common.openLoadingDialog(that);

                this._oModelStyle.update("/CreateIOStyleSet('" + this._iono + "')", param, {
                    method: "PUT",
                    success: function (data, oResponse) {
                        setTimeout(() => {
                            //Common.showMessage(me._i18n.getText('t13') + param["IONO"]);
                            //Common.closeLoadingDialog(that);
                            //me.routeTOIO();
                        }, 1000);
                    },
                    error: function (err) {
                        Common.closeLoadingDialog(that);
                        //show message strip on error
                        var errorMsg;
                        try {
                            errorMsg = JSON.parse(err.responseText).error.message.value;
                        } catch (err) {
                            errorMsg = err.responseText;
                        }
                        //oMsgStrip.setVisible(true);
                        //oMsgStrip.setText(errorMsg);
                        MessageBox.warning(errorMsg);
                    }
                });
            },

            //redirect to IO
            onNavBack: function (oEvent) {
                if (this._GenericFilterDialog) {
                    this._GenericFilterDialog.setModel(new JSONModel());
                    this.byId("generalTable").getColumns().forEach(col => col.setProperty("filtered", false));
                    this.byId("colorsTable").getColumns().forEach(col => col.setProperty("filtered", false));
                    this.byId("sizesTable").getColumns().forEach(col => col.setProperty("filtered", false));
                    this.byId("processesTable").getColumns().forEach(col => col.setProperty("filtered", false));
                    this.byId("versionsTable").getColumns().forEach(col => col.setProperty("filtered", false));
                    this.byId("ioTable").getColumns().forEach(col => col.setProperty("filtered", false));
                }

                console.log(this._iono)
                if (this._iono != " ") {
                    this.routeTOIO();
                    //sap.ui.getCore().byId("backBtn").mEventRegistry.press[0].fFunction = this._fBackButton;
                }
                else {
                    var oHistory = History.getInstance();
                    var sPreviousHash = oHistory.getPreviousHash();

                    if (sPreviousHash !== undefined) {
                        window.history.go(-1);
                    } else {
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                        oRouter.navTo("RouteStyles", {}, true);
                    }
                }
            },

            routeTOIO: function () {
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                    target: {
                        semanticObject: "ZSO_3DERP_ORD_IO",
                        action: _sAction + "&/RouteIODetail/" + this._iono + "/" + this._sbu + "/" + this._styleNo + "/itfSTYLE"
                    }

                })) || ""; // generate the Hash to display style

                oCrossAppNavigator.toExternal({
                    target: {
                        shellHash: hash
                    }
                });
            },

            getCaptionMsgs: async function () {
                var me = this;
                var oDDTextParam = [], oDDTextResult = {};
                var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_COMMON_SRV");

                oDDTextParam.push({ CODE: "COPY" });

                oDDTextParam.push({ CODE: "IONO" });
                oDDTextParam.push({ CODE: "IODESC" });
                oDDTextParam.push({ CODE: "IOTYPE" });
                oDDTextParam.push({ CODE: "SALESGRP" });
                oDDTextParam.push({ CODE: "SEASONCD" });
                oDDTextParam.push({ CODE: "PRODPLANT" });
                oDDTextParam.push({ CODE: "STATUSCD" });
                oDDTextParam.push({ CODE: "VERNO" });
                oDDTextParam.push({ CODE: "CREATEDBY" });
                oDDTextParam.push({ CODE: "CREATEDDT" });
                oDDTextParam.push({ CODE: "IOLIST" });

                oDDTextParam.push({ CODE: "ATTRIBSEQ" });
                oDDTextParam.push({ CODE: "ATTRIBTYP" });
                oDDTextParam.push({ CODE: "ATTRIBCD" });
                oDDTextParam.push({ CODE: "DESC" });
                oDDTextParam.push({ CODE: "ATTRIBVAL" });
                oDDTextParam.push({ CODE: "ATTRIBVALUNIT" });
                oDDTextParam.push({ CODE: "CASVERIND" });
                oDDTextParam.push({ CODE: "COLORCD" });
                oDDTextParam.push({ CODE: "SORTSEQ" });
                oDDTextParam.push({ CODE: "SIZECD" });
                oDDTextParam.push({ CODE: "BASEIND" });
                oDDTextParam.push({ CODE: "SEQ" });
                oDDTextParam.push({ CODE: "PROCESSCD" });
                oDDTextParam.push({ CODE: "LEADTM" });
                oDDTextParam.push({ CODE: "VASTYP" });
                oDDTextParam.push({ CODE: "STATUS" });
                oDDTextParam.push({ CODE: "DESC1" });
                oDDTextParam.push({ CODE: "DESC2" });
                oDDTextParam.push({ CODE: "DELETED" });

                oDDTextParam.push({CODE: "INFO_INPUT_REQD_FIELDS"}); 
                oDDTextParam.push({CODE: "INFO_NO_DATA_EDIT"}); 
                oDDTextParam.push({CODE: "INFO_NO_SEL_RECORD_TO_PROC"}); 
                oDDTextParam.push({CODE: "INFO_NO_RECORD_TO_REMOVE"}); 
                
                return new Promise((resolve, reject)=>{
                    oModel.create("/CaptionMsgSet", { CaptionMsgItems: oDDTextParam  }, {
                        method: "POST",
                        success: function (oData, oResponse) {
                            oData.CaptionMsgItems.results.forEach(item => {
                                oDDTextResult[item.CODE] = item.TEXT;
                            })

                            me.getView().setModel(new JSONModel(oDDTextResult), "ddtext");
                            me.getOwnerComponent().getModel("CAPTION_MSGS_MODEL").setData({ text: oDDTextResult })
                            resolve();
                        },
                        error: function (err) { resolve(); }
                    });
                });
            },

            getColumnProp: async function () {
                var sPath = jQuery.sap.getModulePath("zui3derp", "/model/columns.json");

                var oModelColumns = new JSONModel();
                await oModelColumns.loadData(sPath);

                // var oColumns = oModelColumns.getData();
                this._oModelColumns = oModelColumns.getData();

                this.setFormValueHelp(this.byId("UOM"), "header");
                this.setFormValueHelp(this.byId("SEASONCD"), "header");
                this.setFormValueHelp(this.byId("CUSTGRP"), "header");
                this.setFormValueHelp(this.byId("SOLDTOCUST"), "header");
                this.setFormValueHelp(this.byId("SIZEGRP"), "header");
                this.setFormValueHelp(this.byId("SALESGRP"), "header");
                this.setFormValueHelp(this.byId("STYLECAT"), "header");
                this.setFormValueHelp(this.byId("PRODTYP"), "header");

                // this.setTableValueHelp(this.byId("generalTable"), "general");
                // this.setTableValueHelp(this.byId("processesTable"), "processes");

                this.setLocTableColumns("generalTable", this._oModelColumns["general"]);
                this.setLocTableColumns("colorsTable", this._oModelColumns["colors"]);
                this.setLocTableColumns("processesTable", this._oModelColumns["processes"]);
                this.setLocTableColumns("versionsTable", this._oModelColumns["versions"]);

                this.updateColumnMenu(this.byId("generalTable"), "generalTable");
                this.updateColumnMenu(this.byId("colorsTable"), "colorsTable");
                this.updateColumnMenu(this.byId("sizesTable"), "sizesTable");
                this.updateColumnMenu(this.byId("processesTable"), "processesTable");
                this.updateColumnMenu(this.byId("versionsTable"), "versionsTable");
                this.updateColumnMenu(this.byId("ioTable"), "ioTable");
            },

            setFormValueHelp: function(oControl, sForm) {
                var sColumnName = "", sFormModel = "", sColumnPath = "";

                if (oControl.getBindingInfo("value").parts[0].path.indexOf("/") >= 0) {
                    sColumnName = oControl.getBindingInfo("value").parts[0].path.slice(1);
                }

                if (oControl.getBindingInfo("value").parts[0].model !== undefined) {
                    sFormModel = oControl.getBindingInfo("value").parts[0].model;
                }

                if (sFormModel !== "") {
                    sColumnPath = sFormModel + ">/" + sColumnName;
                }
                else {
                    sColumnPath = sColumnName;
                }

                var bValueFormatter = false;
                var vColProp = this._oModelColumns[sForm].filter(item => item.ColumnName.toUpperCase() === sColumnName.toUpperCase());
                var sSuggestItemText = vColProp[0].ValueHelp["SuggestionItems"].text;
                var sSuggestItemAddtlText = vColProp[0].ValueHelp["SuggestionItems"].additionalText !== undefined ? vColProp[0].ValueHelp["SuggestionItems"].additionalText : '';                                    
                var sTextFormatMode = "Key";

                if (vColProp[0].TextFormatMode && vColProp[0].TextFormatMode !== "" && vColProp[0].TextFormatMode !== "Key" && vColProp[0].ValueHelp["items"].value !== vColProp[0].ValueHelp["items"].text) {
                    sTextFormatMode = vColProp[0].TextFormatMode;
                    bValueFormatter = true;

                    if (vColProp[0].ValueHelp["SuggestionItems"].additionalText && vColProp[0].ValueHelp["SuggestionItems"].text !== vColProp[0].ValueHelp["SuggestionItems"].additionalText) {
                        if (sTextFormatMode === "ValueKey" || sTextFormatMode === "Value") {
                            sSuggestItemText = vColProp[0].ValueHelp["SuggestionItems"].additionalText;
                            sSuggestItemAddtlText = vColProp[0].ValueHelp["SuggestionItems"].text;
                        }
                    }
                }
  
                var oInput = oControl;                
                oInput.setMaxSuggestionWidth(vColProp[0].ValueHelp["SuggestionItems"].additionalText !== undefined ? vColProp[0].ValueHelp["SuggestionItems"].maxSuggestionWidth : "1px")
                oInput.bindAggregation("suggestionItems", {
                    path: vColProp[0].ValueHelp["SuggestionItems"].path,
                        length: 10000,
                        template: new sap.ui.core.ListItem({
                            key: vColProp[0].ValueHelp["SuggestionItems"].text,
                            text: sSuggestItemText,
                            additionalText: sSuggestItemAddtlText,
                        }),
                        templateShareable: false
                });

                if (bValueFormatter) {
                    oInput.setProperty("textFormatMode", sTextFormatMode);
                    oInput.bindValue({  
                        parts: [{ path: sColumnPath }, { value: vColProp[0].ValueHelp["items"].path }, { value: vColProp[0].ValueHelp["items"].value }, { value: vColProp[0].ValueHelp["items"].text }, { value: sTextFormatMode }],
                        formatter: this.formatFormValueHelp.bind(this)
                    });
                }
            },

            formatFormValueHelp: function(sValue, sPath, sKey, sText, sFormat) {
                // console.log(sValue, sPath, sKey, sText, sFormat);
                var oValue = this.getView().getModel(sPath).getData().results.filter(v => v[sKey] === sValue);

                if (oValue && oValue.length > 0) {
                    if (sFormat === "Value") {
                        return oValue[0][sText];
                    }
                    else if (sFormat === "ValueKey") {
                        return oValue[0][sText] + " (" + sValue + ")";
                    }
                    else if (sFormat === "KeyValue") {
                        return sValue + " (" + oValue[0][sText] + ")";
                    }
                }
                else return sValue;
            },

            setTableValueHelp: function(oTable, sTable) {
                var sColumnName = "", sTableModel = "", sColumnPath = "";

                oTable.getColumns().forEach(col => {
                    if (col.getAggregation("template").getBindingInfo("value") !== undefined) {
                        sColumnName = col.getAggregation("template").getBindingInfo("value").parts[0].path;

                        if (sColumnName.toUpperCase() === "ATTRIBTYP" || sColumnName.toUpperCase() === "ATTRIBCD" || sColumnName.toUpperCase() === "PROCESSCD" || sColumnName.toUpperCase() === "VASTYP") {
                            sTableModel = col.getAggregation("template").getBindingInfo("value").parts[0].model;

                            if (sTableModel !== "") {
                                sColumnPath = sTableModel + ">" + sColumnName;
                            }
                            else {
                                sColumnPath = sColumnName;
                            }

                            var bValueFormatter = false;
                            var vColProp = this._oModelColumns[sTable].filter(item => item.ColumnName.toUpperCase() === sColumnName.toUpperCase());
                            var sSuggestItemText = vColProp[0].ValueHelp["SuggestionItems"].text;
                            var sSuggestItemAddtlText = vColProp[0].ValueHelp["SuggestionItems"].additionalText !== undefined ? vColProp[0].ValueHelp["SuggestionItems"].additionalText : '';                                    
                            var sTextFormatMode = "Key";
            
                            if (vColProp[0].TextFormatMode && vColProp[0].TextFormatMode !== "" && vColProp[0].TextFormatMode !== "Key" && vColProp[0].ValueHelp["items"].value !== vColProp[0].ValueHelp["items"].text) {
                                sTextFormatMode = vColProp[0].TextFormatMode;
                                bValueFormatter = true;
            
                                if (vColProp[0].ValueHelp["SuggestionItems"].additionalText && vColProp[0].ValueHelp["SuggestionItems"].text !== vColProp[0].ValueHelp["SuggestionItems"].additionalText) {
                                    if (sTextFormatMode === "ValueKey" || sTextFormatMode === "Value") {
                                        sSuggestItemText = vColProp[0].ValueHelp["SuggestionItems"].additionalText;
                                        sSuggestItemAddtlText = vColProp[0].ValueHelp["SuggestionItems"].text;
                                    }
                                }
                            }

                            var oInput = col.getAggregation("template");
                            oInput.setMaxSuggestionWidth(vColProp[0].ValueHelp["SuggestionItems"].additionalText !== undefined ? vColProp[0].ValueHelp["SuggestionItems"].maxSuggestionWidth : "1px")
                            oInput.bindAggregation("suggestionItems", {
                                path: vColProp[0].ValueHelp["SuggestionItems"].path,
                                    length: 10000,
                                    template: new sap.ui.core.ListItem({
                                        key: vColProp[0].ValueHelp["SuggestionItems"].text,
                                        text: sSuggestItemText,
                                        additionalText: sSuggestItemAddtlText,
                                    }),
                                    templateShareable: false
                            });

                            if (bValueFormatter) {
                                oInput.setProperty("textFormatMode", sTextFormatMode);
                                oInput.bindValue({  
                                    parts: [{ path: sColumnPath }, { value: vColProp[0].ValueHelp["items"].path }, { value: vColProp[0].ValueHelp["items"].value }, { value: vColProp[0].ValueHelp["items"].text }, { value: sTextFormatMode }],
                                    formatter: this.formatTableValueHelp.bind(this)
                                });
                            }

                            // console.log(col.getAggregation("template"))
                        }
                    }
                })
            },

            formatTableValueHelp: function(sValue, sPath, sKey, sText, sFormat) {
                // console.log(sValue, sPath, sKey, sText, sFormat);
                var oValue = this.getView().getModel(sPath).getData().results.filter(v => v[sKey] === sValue);

                if (oValue && oValue.length > 0) {
                    if (sFormat === "Value") {
                        return oValue[0][sText];
                    }
                    else if (sFormat === "ValueKey") {
                        return oValue[0][sText] + " (" + sValue + ")";
                    }
                    else if (sFormat === "KeyValue") {
                        return sValue + " (" + oValue[0][sText] + ")";
                    }
                }
                else return sValue;
            },

            updateColumnMenu(oTable, sTableId) {
                // var oTable = this.getView().byId("styleDynTable"); 
                var me = this;

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
                                me.onColFilter(sTableId, oEvent.getSource().oParent.oParent.getAggregation("label").getProperty("text"));
                            }
                        })
                        
                        //Create the Menu Item that need to be added
                        setTimeout(() => {
                            // console.log(oMenu)
                            var wCustomFilter = false;
                            oMenu.getItems().forEach(item => {
                                if (item.sId.indexOf("filter") >= 0) {
                                    oMenu.removeItem(item);
                                }

                                if (item.mProperties.text !== undefined && item.mProperties.text === "Filter") {
                                    wCustomFilter = true;
                                }
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
            // Style Header
            //******************************************* */

            getHeaderData: async function () {
                var me = this;
                var styleNo = this._styleNo;
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var oView = this.getView();

                Common.openLoadingDialog(that);

                //read Style header data
                var entitySet = "/StyleDetailSet('" + styleNo + "')"
                new Promise((resolve, reject) => {
                    oModel.read(entitySet, {
                        success: function (oData, oResponse) {
                            // var oldData = oData;
                            // me._headerData = JSON.parse(JSON.stringify(oData));
                            //console.log(oData);
                            oJSONModel.setData(oData);
                            oView.setModel(oJSONModel, "headerData");

                            if (me._styleNo === Constants.NEW) {
                                //set default Style Catergory
                                var oModel = me.getOwnerComponent().getModel("ZGW_3DERP_COMMON_SRV");
                                const filter = "SBU eq '" + me._sbu + "' and MODULE eq 'STYLE'";

                                oModel.read("/ZerpCheckSet", {
                                    urlParameters: {
                                        "$filter": filter
                                    },
                                    success: function (oData, oResponse) {
                                        //console.log(oData);
                                        me.getView().getModel("headerData").setProperty("/Stylecat", oData.results[0].VALUE);
                                        resolve();
                                    },
                                    error: function (err) {
                                        Common.closeLoadingDialog(that);
                                    }
                                });


                                //set default Season
                                var oSHModel = me.getOwnerComponent().getModel("SearchHelps");
                                oSHModel.setHeaders({
                                    sbu: me._sbu
                                });
                                oSHModel.read("/SeasonSet", {
                                    success: function (oData, oResponse) {
                                        //var season = this.getView().getModel("SeasonsModel").getData();
                                        //console.log(JSON.stringify(oData.results));
                                        oData.results.sort(function (a, b) {
                                            return (b.Yr - a.Yr) || (b.Seq - a.Seq);
                                        });
                                        me.getView().getModel("headerData").setProperty("/Seasoncd", oData.results[0].Seasoncd);

                                    },
                                    error: function (err) { }
                                });

                            }

                            Common.closeLoadingDialog(that);
                            me.setChangeStatus(false);
                            resolve();
                        },
                        error: function (err) {
                            console.log(err);
                            Common.closeLoadingDialog(that);
                        }
                    })
                });
            },

            getHeaderConfig: function () {
                var me = this;
                var oView = this.getView();
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new sap.ui.model.json.JSONModel();

                //get header fields
                oModel.setHeaders({
                    sbu: this._sbu,
                    type: Constants.STYLHDR
                });
                oModel.read("/DynamicColumnsSet", {
                    success: function (oData, oResponse) {
                        var visibleFields = new JSONModel();
                        var visibleFields = {};
                        //get only visible fields
                        for (var i = 0; i < oData.results.length; i++) {
                            visibleFields[oData.results[i].ColumnName] = oData.results[i].Visible;
                        }
                        var JSONdata = JSON.stringify(visibleFields);
                        var JSONparse = JSON.parse(JSONdata);
                        oJSONModel.setData(JSONparse);
                        oView.setModel(oJSONModel, "VisibleFieldsData");
                        me._aColumns["header"] = oData.results;
                    },
                    error: function (err) { }
                });
            },

            setHeaderEditMode: async function () {
                if (this._styleNo === Constants.NEW) {
                    //unlock editable fields of style header
                    var oJSONModel = new JSONModel();
                    var data = {};
                    this._headerChanged = false;
                    data.editMode = true;
                    oJSONModel.setData(data);
                    this.getView().setModel(oJSONModel, "HeaderEditModeModel");

                    Utils.getStyleSearchHelps(this);

                    this.setControlEditMode("HeaderEditModeModel", true);
                    this.setReqField("HeaderEditModeModel", true);
                    this.disableOtherTabs("detailPanel");
                    this.setDtlsEnableButton(false);
                }
                else {
                    if (this.getView().getModel("IOData").getData().filter(fItem => fItem.WITHORDERDTL === "X").length > 0) {
                        MessageBox.information("Header info editing not allowed.\r\nStyle already used in IO with order details.");
                    }
                    else if (this.getView().getModel("IOData").getData().filter(fItem => fItem.WITHBOMSIZEUV === "X").length > 0) {
                        MessageBox.information("Header info editing not allowed.\r\nStyle already used in IO and BOM by GMC has ASUV/SUV already.");
                    }
                    else {
                        // const result = await this.lockStyle("X");
                        const result = await this.lockStyle("X");
                        console.log(result);
                        if (result.Type != "S") {
                            MessageBox.warning(result.Message);
                        }
                        else {

                            //unlock editable fields of style header
                            var oJSONModel = new JSONModel();
                            var data = {};
                            this._headerChanged = false;
                            data.editMode = true;
                            oJSONModel.setData(data);
                            this.getView().setModel(oJSONModel, "HeaderEditModeModel");

                            Utils.getStyleSearchHelps(this);
                            this.setControlEditMode("HeaderEditModeModel", true);
                            this.setReqField("HeaderEditModeModel", true);
                            this.disableOtherTabs("detailPanel");
                            this.setDtlsEnableButton(false);

                            if (this.getView().getModel("IOData").getData().length > 0) {
                                MessageBox.information("Only size group can be edited.\r\nStyle already used in IO.");

                                this.byId("STYLECD").setEnabled(false);
                                this.byId("PRODTYP").setEnabled(false);
                                this.byId("STYLECAT").setEnabled(false);
                                this.byId("CUSTPRDTYP").setEnabled(false);
                                this.byId("DESC1").setEnabled(false);
                                this.byId("SALESGRP").setEnabled(false);
                                this.byId("PRODGRP").setEnabled(false);
                                this.byId("STYLEGRP").setEnabled(false);
                                this.byId("SEASONCD").setEnabled(false);
                                this.byId("CUSTGRP").setEnabled(false);
                                this.byId("SOLDTOCUST").setEnabled(false);
                                this.byId("UOM").setEnabled(false);
                                this.byId("REMARKS1").setEnabled(false);
                            }
                        }
                    }
                }
            },

            setHeaderReadMode: function () {
                //unlock editable fields of style header
                var oJSONModel = new JSONModel();
                var data = {};
                this._headerChanged = false;
                data.editMode = false;
                oJSONModel.setData(data);
                this.getView().setModel(oJSONModel, "HeaderEditModeModel");
            },

            cancelHeaderEdit: function () {
                //confirm cancel edit of style header
                if (this._headerChanged) {
                    if (!this._DiscardHeaderChangesDialog) {
                        this._DiscardHeaderChangesDialog = sap.ui.xmlfragment("zui3derp.view.fragments.dialog.DiscardHeaderChanges", this);
                        this.getView().addDependent(this._DiscardHeaderChangesDialog);
                    }
                    jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                    this._DiscardHeaderChangesDialog.addStyleClass("sapUiSizeCompact");
                    this._DiscardHeaderChangesDialog.open();
                } else {
                    this.closeHeaderEdit();
                }
            },

            closeHeaderEdit: function () {
                //on cancel confirmed - close edit mode and reselect backend data
                var oJSONModel = new JSONModel();
                var data = {};
                that._headerChanged = false;
                that.setChangeStatus(false);
                data.editMode = false;
                oJSONModel.setData(data);
                that.getView().setModel(oJSONModel, "HeaderEditModeModel");
                if (that._DiscardHeaderChangesDialog) {
                    that._DiscardHeaderChangesDialog.close();
                    that.getHeaderData();
                }
                var oMsgStrip = that.getView().byId('HeaderMessageStrip');
                oMsgStrip.setVisible(false);
                // console.log("closeHeaderEdit")
                //hide controls
                //this.setControlEditMode("HeaderEditModeModel", false)
                //set required header fields
                //this.setReqField("HeaderEditModeModel", false);
                //this.enableOtherTabs("detailPanel");
                //this.setDtlsEnableButton(true);
                this.setTabReadMode("HeaderEditModeModel");
                // this.generalAttrDataCheck();

                this.byId("STYLECD").setEnabled(true);
                this.byId("PRODTYP").setEnabled(true);
                this.byId("STYLECAT").setEnabled(true);
                this.byId("CUSTPRDTYP").setEnabled(true);
                this.byId("DESC1").setEnabled(true);
                this.byId("SALESGRP").setEnabled(true);
                this.byId("PRODGRP").setEnabled(true);
                this.byId("STYLEGRP").setEnabled(true);
                this.byId("SEASONCD").setEnabled(true);
                this.byId("CUSTGRP").setEnabled(true);
                this.byId("SOLDTOCUST").setEnabled(true);
                this.byId("UOM").setEnabled(true);
                this.byId("REMARKS1").setEnabled(true);

                if (this.getView().getModel("CustomersModel") !== undefined) {
                    this.getView().setModel(new JSONModel(this.getView().getModel("CustomersModel").getData()), "CustomerModel");
                }
            },

            onHeaderChange: function (oEvent) {
                //set change flag for header
                this._headerChanged = true;
                this.setChangeStatus(true);
            },

            onHeaderInputLiveChange: function (oEvent) {
                //set change flag for header
                this._headerChanged = true;
                this.setChangeStatus(true);

                var oSource = oEvent.getSource();
                oSource.setValueState("None");
                oSource.setValueStateText("");
            },

            onHeaderInputChange: function (oEvent) {
                //set change flag for header
                this._headerChanged = true;
                this.setChangeStatus(true);

                var oSource = oEvent.getSource();
                var isInvalid = !oSource.getSelectedKey() && oSource.getValue().trim();
                oSource.setValueState(isInvalid ? "Error" : "None");
                oSource.setValueStateText(isInvalid ? "Invalid Value" : "");

                oSource.getSuggestionItems().forEach(item => {                    
                    if (item.getProperty("key") === oSource.getSelectedKey()) {
                        isInvalid = false;
                        oSource.setValueState(isInvalid ? "Error" : "None");
                        oSource.setValueStateText(isInvalid ? "Invalid Value" : "");
                    }
                })

                var oModelData = {};
                var sInputField = oSource.getBindingInfo("value").parts[0].path;

                if (isInvalid) {
                    this._validationErrors.push(oEvent.getSource().getId());

                    if (sInputField.toUpperCase() === "/CUSTGRP") {
                        oModelData["results"] = [];
                        this.getView().setModel(new JSONModel(oModelData), "CustomerModel");                        
                    }
                }
                else {
                    this.getView().getModel("headerData").setProperty(oSource.getBindingInfo("value").parts[0].path, oSource.getSelectedKey());

                    this._validationErrors.forEach((item, index) => {
                        if (item === oEvent.getSource().getId()) {
                            this._validationErrors.splice(index, 1)
                        }
                    })

                    if (sInputField.toUpperCase() === "/CUSTGRP") {
                        var aModelData = this.getView().getModel("CustomersModel").getData().results.filter(fItem => fItem.Custgrp === oSource.getSelectedKey());
                        oModelData["results"] = aModelData;
                        this.getView().setModel(new JSONModel(oModelData), "CustomerModel");
                    } 
                    else if (sInputField.toUpperCase() === "/PRODTYP") {
                        //set default UOM
                        const prodTyp = this.getView().getModel("ProdTypeModel").getData();
                        const result = prodTyp.results.filter(item => item.ProdTyp === oSource.getSelectedKey())
                        this.getView().getModel("headerData").setProperty("/Uom", result[0].Uom);
                    }
                }
            },

            onSaveHeader: function () {
                //save style header button clicked
                var oModel = this.getOwnerComponent().getModel();
                var me = this;
                var path;
                var oHeaderModel = this.getView().getModel("headerData");
                var oEntry = oHeaderModel.getData();

                //initialize message strip
                var oMsgStrip = this.getView().byId('HeaderMessageStrip');
                oMsgStrip.setVisible(false);

                //check if there are changes
                if (!this._headerChanged) {
                    // if (oEntry === me._headerData) {
                    Common.showMessage(this._i18n.getText('t7')); //no changes made
                } else {

                    //set http header data
                    oEntry.Styleno = this._styleNo;
                    oEntry.Sbu = this._sbu;

                    if (this._styleNo === Constants.NEW) { //creating a new style

                        //set default style info for NEW
                        oEntry.Statuscd = Constants.CRT;
                        oEntry.Createdby = "$";
                        oEntry.Createddt = "$";
                        oEntry.Verno = "1";

                        path = "/StyleDetailSet";

                        oModel.setHeaders({
                            sbu: this._sbu
                        });
                        console.log(oEntry);

                        MessageBox.confirm(this._i18n.getText('ConfirmSave'), {
                            actions: ["Yes", "No"],
                            onClose: function (sAction) {
                                if (sAction === "Yes") {
                                    Common.openLoadingDialog(that);
                                    //call create new style
                                    oModel.create(path, oEntry, {
                                        method: "POST",
                                        success: function (oData, oResponse) {

                                            var oJSONModel = new JSONModel();
                                            me._styleNo = oData.Styleno;
                                            oJSONModel.setData(oData);

                                            //on successful create, select data related to style
                                            me.getHeaderData();
                                            me.getGeneralTable();
                                            me.getSizesTable();
                                            me.getVersionsTable();
                                            me.getProcessesTable();
                                            me._headerChanged = false;
                                            me.setChangeStatus(false);
                                            me.setDetailVisible(true);
                                            //me.setHeaderReadMode();
                                            me.setTabReadMode("HeaderEditModeModel");
                                            //on save, execute apply to IO
                                            if(me._iono != ' '){
                                                me.applyToIO();
                                            }
                                            Common.closeLoadingDialog(that);
                                            //Common.showMessage(me._i18n.getText('t4'));
                                            MessageBox.information(me._i18n.getText('t4'));

                                            //change the url hash to the new style no
                                            var oHashChanger = HashChanger.getInstance();
                                            var currHash = oHashChanger.getHash();
                                            var newHash = currHash.replace(Constants.NEW, me._styleNo);
                                            oHashChanger.replaceHash(newHash);
                                        },
                                        error: function (err) {
                                            //show message strip on error
                                            var errorMsg;
                                            try {
                                                errorMsg = JSON.parse(err.responseText).error.message.value;
                                            } catch (err) {
                                                errorMsg = err.responseText;
                                            }
                                            //oMsgStrip.setVisible(true);
                                            //oMsgStrip.setText(errorMsg);
                                            Common.closeLoadingDialog(that);
                                            MessageBox.information(errorMsg);
                                        }
                                    });
                                }
                            }
                        });


                    } else {
                        //style already existing, call update method
                        path = "/StyleDetailSet('" + this._styleNo + "')";
                        oModel.setHeaders({
                            sbu: this._sbu
                        });
                        console.log(oEntry);
                        MessageBox.confirm(this._i18n.getText('ConfirmSave'), {
                            actions: ["Yes", "No"],
                            onClose: function (sAction) {
                                if (sAction === "Yes") {
                                    Common.openLoadingDialog(that);
                                    oModel.update(path, oEntry, {
                                        method: "PUT",
                                        success: function (data, oResponse) {
                                            //reselect the data to ensure consistency
                                            me.getHeaderData();
                                            me.getSizesTable();
                                            me._headerChanged = false;
                                            me.setChangeStatus(false);
                                            me.setTabReadMode("HeaderEditModeModel");
                                            //on save, execute apply to IO
                                            if(me._iono != ' '){
                                                me.applyToIO();
                                            }
                                            Common.closeLoadingDialog(that);
                                            // me.generalAttrDataCheck();
                                            //Common.showMessage(me._i18n.getText('t4'));
                                            MessageBox.information(me._i18n.getText('t4'));
                                        },
                                        error: function (err, oMessage) {
                                            //show message strip on error
                                            var errorMsg;
                                            try {
                                                errorMsg = JSON.parse(err.responseText).error.message.value;
                                            } catch (err) {
                                                errorMsg = err.responseText;
                                            }
                                            // oMsgStrip.setVisible(true);
                                            // oMsgStrip.setText(errorMsg);
                                            MessageBox.information(errorMsg);
                                            Common.closeLoadingDialog(that);
                                        }
                                    });
                                }
                            }
                        });

                    }

                }
            },

            onDeleteStyle: function () {
                //show confirmation to delete style
                if (!this._ConfirmDeleteDialog) {
                    this._ConfirmDeleteDialog = sap.ui.xmlfragment("zui3derp.view.fragments.dialog.ConfirmDeleteStyle", this);
                    this.getView().addDependent(this._ConfirmDeleteDialog);
                }
                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                this._ConfirmDeleteDialog.addStyleClass("sapUiSizeCompact");
                this._ConfirmDeleteDialog.open();
            },

            onConfirmDeleteStyle: function () {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();

                if (this._GenericFilterDialog) {
                    this._GenericFilterDialog.setModel(new JSONModel());
                    this.byId("generalTable").getColumns().forEach(col => col.setProperty("filtered", false));
                    this.byId("colorsTable").getColumns().forEach(col => col.setProperty("filtered", false));
                    this.byId("sizesTable").getColumns().forEach(col => col.setProperty("filtered", false));
                    this.byId("processesTable").getColumns().forEach(col => col.setProperty("filtered", false));
                    this.byId("versionsTable").getColumns().forEach(col => col.setProperty("filtered", false));
                    this.byId("ioTable").getColumns().forEach(col => col.setProperty("filtered", false));
                }

                if (this._styleNo === Constants.NEW) { //deleted without style no, return to style screen
                    this.setChangeStatus(false);
                    that._router.navTo("RouteStyles");
                } else {
                    //existing style, call style delete method
                    var entitySet = "/StyleSet(STYLENO='" + that._styleNo + "')";

                    Common.openLoadingDialog(that);
                    this._ConfirmDeleteDialog.close();

                    oModel.remove(entitySet, {
                        method: "DELETE",
                        success: function (data, oResponse) {
                            me.setChangeStatus(false);
                            me._router.navTo("RouteStyles"); //return to styles screen
                            Common.closeLoadingDialog(me);
                            Common.showMessage(me._i18n.getText('t4'));
                        },
                        error: function () {
                            Common.closeLoadingDialog(me);
                            Common.showMessage(me._i18n.getText('t5'));
                        }
                    });
                }
            },

            //******************************************* */
            // General Attributes
            //******************************************* */

            getGeneralTable: function () {
                //Get general attributes data
                var me = this;
                var oTable = this.getView().byId("generalTable");
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var oReqAttr = [];
                // var oMsgStrip = this.getView().byId("GeneralAttrInfoMessageStrip");
                // oMsgStrip.setVisible(false);
                this._genAttrInfo = "";

                Common.openLoadingDialog(that);

                var entitySet = "/StyleAttributesGeneralSet";
                oModel.setHeaders({
                    styleno: this._styleNo,
                    sbu: this._sbu
                });
                oModel.read(entitySet, {
                    success: function (oData, oResponse) {                       
                        // oData.results.forEach((item, index) => {
                        //     item.Casverind = item.Casverind === "X" ? true : false;

                        //     if (index === 0) item.ACTIVE = "X";
                        //     else item.ACTIVE = "";
                        // });

                        // oJSONModel.setData(oData);
                        // oTable.setModel(oJSONModel, "DataModel");
                        // Common.closeLoadingDialog(that);

                        oModel.read("/AttributesConfigSet", {
                            success: function (oDataConfig, oResponse) {
                                // me._attributesconfig = oDataConfig.results;
                                var sMessage = "";

                                oData.results.forEach((item, index) => {
                                    item.Casverind = item.Casverind === "X" ? true : false;
                                    item.Property = "";

                                    oDataConfig.results.filter(fItem => fItem.TYPE === item.Attribtyp).forEach(e => {
                                        if (e.PROP === "M") {
                                            if (oReqAttr.findIndex(val => val.TYPE === e.TYPE) < 0) {
                                                if (me.getView().getModel("AttribCdModel").getData().results.filter(fItem => fItem.Attribtyp === e.TYPE).length > 0 && item.Attribcd === "") {
                                                    sMessage += "Attribute code is required for type " + e.TYPE + ".\r\n";
                                                }
                                            }
                                            
                                            if (e.CODE === item.Attribcd) {
                                                item.Property = e.PROP;
    
                                                if (oReqAttr.findIndex(val => val.TYPE === e.TYPE && val.CODE === e.CODE) < 0) { 
                                                    oReqAttr.push({TYPE: e.TYPE, CODE: e.CODE}); 
    
                                                    if (item.Valuetyp.toUpperCase() === "STRVAL" && item.Attribval === "") {
                                                        sMessage += "Attribute value is required for type/code " + e.TYPE + "/" + e.CODE + ".\r\n";
                                                    }
                                                    else if (item.Valuetyp.toUpperCase() === "NUMVALUE" && (item.Attribval === "" || item.Valunit === "")) {
                                                        sMessage += "Attribute value and UOM is required for type/code " + e.TYPE + "/" + e.CODE + ".\r\n";
                                                    }
                                                }
                                            }
                                            else if (e.CODE === "") { 
                                                item.Property = e.PROP;
    
                                                if (oReqAttr.findIndex(val => val.TYPE === e.TYPE) < 0) { 
                                                    oReqAttr.push({TYPE: e.TYPE, CODE: ""});     
                                                    if (item.Valuetyp.toUpperCase() === "STRVAL" && item.Attribval === "") {
                                                        sMessage += "Attribute value is required for type " + e.TYPE + ".\r\n";
                                                    }
                                                    else if (item.Valuetyp.toUpperCase() === "NUMVALUE" && (item.Attribval === "" || item.Valunit === "")) {
                                                        sMessage += "Attribute value and UOM is required for type " + e.TYPE + ".\r\n";
                                                    }
                                                }
                                            }
                                        }
                                    });
        
                                    if (index === 0) item.ACTIVE = "X";
                                    else item.ACTIVE = "";
                                });

                                oJSONModel.setData(oData);
                                // oTable.setModel(oJSONModel, "DataModel");
                                if (oTable.getModel("DataModel") === undefined) {
                                    oTable.setModel(oJSONModel, "DataModel");
                                }
                                else {
                                    oTable.getModel("DataModel").setProperty("/results", oData.results);
                                }
                                //oTable.setVisibleRowCount(oData.results.length); //updating visible rows
                                // oTable.onAttachPaste(); //for copy-paste
                                Common.closeLoadingDialog(that);
                                me._attributesconfig = oReqAttr;

                                if (sMessage !== "") {
                                    // oMsgStrip.setVisible(true);
                                    // oMsgStrip.setText(sMessage + "Enter value on these attributes to be able to work with other style details.");
                                    me.disableOtherTabs("detailPanel");
                                    me._genAttrInfo = sMessage + "Enter value on these attributes to be able to work with other style details.";
                                    me.getOwnerComponent().getModel("UI_MODEL").setProperty("/genAttrInfo", me._genAttrInfo);
                                    me.byId("btnGenAttrInfo").setVisible(true);
                                }
                                else {
                                    me.enableOtherTabs("detailPanel"); 
                                    me.enableVersionItemTab();
                                    me.byId("btnGenAttrInfo").setVisible(false);
                                }
                            },
                            error: function (err) { 
                                Common.closeLoadingDialog(that);
                            }
                        }); 
                    },
                    error: function () {
                        Common.closeLoadingDialog(that);
                    }
                })
            },

            setGeneralAttrEditMode: async function () {
                const result = await this.lockStyle("X");
                if (result.Type != "S") {
                    MessageBox.warning(result.Message);
                }
                else {
                    //set general attributes table edit mode
                    var oJSONModel = new JSONModel();
                    var data = {};
                    this._generalAttrChanged = true;
                    data.editMode = true;
                    oJSONModel.setData(data);
                    this.getView().setModel(oJSONModel, "GenAttrEditModeModel");

                    Utils.getAttributesSearchHelps(this);
                    this.setControlEditMode("GenAttrEditModeModel", true);
                    this.disableOtherTabs("detailPanel");
                    this.byId("btnHdrEdit").setEnabled(false);
                    this.byId("btnHdrDelete").setEnabled(false);
                    this.byId("btnHdrClose").setEnabled(false);
                    this.setRowEditMode("generalTable");
                    this.setGeneralAttrEditModeControls();

                     //mark as required fields
                     var oTable = this.getView().byId("generalTable");
                     oTable.getColumns().forEach((col, idx) => {
                        const colProp = col.mProperties.filterProperty;
                        if(colProp == "Attribtyp")
                            col.getLabel().addStyleClass("sapMLabelRequired");
                    });

                    var oMsgStrip = this.getView().byId("GeneralAttrInfoMessageStrip");
                    oMsgStrip.setVisible(false);
                }
            },

            setGeneralAttrEditModeControls: function() {
                //update to base on binding indices
                var oTable = this.getView().byId("generalTable");

                setTimeout(() => {
                    for (var i = 0; i < oTable.getModel("DataModel").getData().results.length; i++) {
                        var iRowIndex = oTable.getBinding("rows").aIndices[i];
    
                        // var iRowIndex = +oTable.getContextByIndex(i).getPath().replace("/results/", "");
                        var oRow = oTable.getRows()[iRowIndex];
                        var vAttrTyp = oTable.getContextByIndex(iRowIndex).getProperty("Attribtyp");
                        var vValTyp = oTable.getContextByIndex(iRowIndex).getProperty("Valuetyp").toUpperCase();
                        var bNew = oTable.getContextByIndex(iRowIndex).getProperty("NEW");                    
                        var oCellCtrlValTyp = "";

                        oRow.getCells().forEach(cell => {
                            if ((bNew === undefined || !bNew) && this._dataMode === "NEW") {
                                if (cell.getBindingInfo("text") === undefined) {
                                    cell.setEnabled(false);
                                }
                            }
                            else {
                                if (cell.getBindingInfo("value") !== undefined) {
                                    oCellCtrlValTyp = "value";
                                }
                                else if (cell.getBindingInfo("text") !== undefined) {
                                    oCellCtrlValTyp = "text";
                                }
                                else if (cell.getBindingInfo("selected") !== undefined) {
                                    oCellCtrlValTyp = "selected";
                                }
                                
                                if (oCellCtrlValTyp !== "text") {
                                    if (cell.getBindingInfo(oCellCtrlValTyp).parts[0].path.toUpperCase() === "ATTRIBTYP") {
                                        cell.setEnabled(true);
                                    }
                                    else if (cell.getBindingInfo(oCellCtrlValTyp).parts[0].path.toUpperCase() === "ATTRIBVAL") {
                                        if (vValTyp === "STRVAL" || vValTyp === "NUMVALUE") {
                                            cell.setEnabled(true);
            
                                            if (vValTyp === "NUMVALUE") {
                                                cell.setType(sap.m.InputType.Number);
                                            }
                                            else if (vValTyp === "STRVAL") {
                                                cell.setType(sap.m.InputType.Text);
                                            }
                                        }
                                        else {
                                            cell.setEnabled(false);
                                        }
                                    }
                                    else if (cell.getBindingInfo(oCellCtrlValTyp).parts[0].path.toUpperCase() === "VALUNIT") {
                                        if (vValTyp === "NUMVALUE") {
                                            cell.setEnabled(true);
                                        }
                                        else {
                                            cell.setEnabled(false);
                                        }
                                    }
                                    else if (cell.getBindingInfo(oCellCtrlValTyp).parts[0].path.toUpperCase() === "ATTRIBCD") {
                                        if (this.getView().getModel("AttribCdModel").getData().results.filter(fItem => fItem.Attribtyp === vAttrTyp).length > 0 && vAttrTyp !== "" && vAttrTyp !== undefined) {
                                            cell.setEnabled(true);
                                        }
                                        else {
                                            cell.setEnabled(false);
                                        }
                                    }
                                    else if (cell.getBindingInfo(oCellCtrlValTyp).parts[0].path.toUpperCase() === "CASVERIND") {
                                        if (vAttrTyp !== "" && vAttrTyp !== undefined) {
                                            cell.setEnabled(true);
                                        }
                                        else {
                                            cell.setEnabled(false);
                                        }
                                    }
                                }
                            }
                        })
                    }                     
                }, 10);
            },

            cancelGeneralAttrEdit: function () {
                //cancel edit mode of general attributes
                if (this._generalAttrChanged) {
                    if (!this._DiscardGeneralAttrChangesDialog) {
                        this._DiscardGeneralAttrChangesDialog = sap.ui.xmlfragment("zui3derp.view.fragments.dialog.DiscardGeneralAttrChanges", this);
                        this.getView().addDependent(this._DiscardGeneralAttrChangesDialog);
                    }
                    jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                    this._DiscardGeneralAttrChangesDialog.addStyleClass("sapUiSizeCompact");
                    this._DiscardGeneralAttrChangesDialog.open();
                } else {
                    this.closeGeneralAttrEdit();
                }

            },

            closeGeneralAttrEdit: function () {
                //on confirm cancel, reselect general attributes from backend
                var oJSONModel = new JSONModel();
                var data = {};
                that._generalAttrChanged = false;
                that.setChangeStatus(false);
                data.editMode = false;
                oJSONModel.setData(data);
                that.getView().setModel(oJSONModel, "GenAttrEditModeModel");
                if (that._DiscardGeneralAttrChangesDialog) {
                    that._DiscardGeneralAttrChangesDialog.close();
                    that.getGeneralTable();
                }
                var oMsgStrip = that.getView().byId('GeneralAttrMessageStrip');
                oMsgStrip.setVisible(false);
                this.setTabReadMode("GenAttrEditModeModel")
                this.setRowReadMode("generalTable");
                // this.setControlEditMode("GenAttrEditModeModel",false);
                // this.enableOtherTabs("detailPanel");
                // this.byId("btnHdrEdit").setEnabled(true);
                // this.byId("btnHdrDelete").setEnabled(true);
                this.getView().setModel(new JSONModel(this.getView().getModel("AttribCdModel").getData()), "AttribCodeModel");
            },

            onGeneralAttrChange: function (oEvent) {
                this._generalAttrChanged = true;
                this.setChangeStatus(true);

                if (oEvent !== undefined) {
                    var oSource = oEvent.getSource();

                    if (oSource.getBindingInfo("value") !== undefined) {
                        var sRowPath = oSource.oParent.getBindingContext("DataModel").sPath;
                        var vColPath = oSource.getBindingInfo("value").parts[0].path;
                        var oModelData = {};

                        if (vColPath.toUpperCase() === "ATTRIBTYP") {
                            this.setGeneralAttrEditModeControls();
    
                            if (oEvent.getParameter("value") === "") {
                                this.byId("generalTable").getModel("DataModel").setProperty(sRowPath + "/Attribtyp", "");
                                this.byId("generalTable").getModel("DataModel").setProperty(sRowPath + "/Attribcd", "");
                                this.byId("generalTable").getModel("DataModel").setProperty(sRowPath + "/Desc1", "");
                            }
                            else {
                                this.byId("generalTable").getModel("DataModel").setProperty(sRowPath + "/Attribtyp", oSource.getSelectedKey());
                            }

                            var aModelData = this.getView().getModel("AttribCdModel").getData().results.filter(fItem => fItem.Attribtyp === oSource.getSelectedKey());
                            oModelData["results"] = aModelData;
                            this.getView().setModel(new JSONModel(oModelData), "AttribCodeModel");
                        }
                        else if (vColPath.toUpperCase() === "ATTRIBCD") {   
                            if (oEvent.getParameter("value") === "") {
                                this.byId("generalTable").getModel("DataModel").setProperty(sRowPath + "/Attribcd", "");
                                this.byId("generalTable").getModel("DataModel").setProperty(sRowPath + "/Desc1", "");
                            }
                            else {
                                this.byId("generalTable").getModel("DataModel").setProperty(sRowPath + "/Attribcd", oSource.getSelectedKey());

                                this.getView().getModel("AttribCdModel").getData().results.filter(fItem => fItem.Attribcd === oSource.getSelectedKey()).forEach(item => {
                                    this.byId("generalTable").getModel("DataModel").setProperty(sRowPath + "/Desc1", item.Desc1);
                                    var iRowIndex = +sRowPath.replace("/results/","");

                                    if (this.byId("generalTable").getContextByIndex(iRowIndex).getProperty("Valuetyp").toUpperCase() === "NUMVALUE") {
                                        this.byId("generalTable").getModel("DataModel").setProperty(sRowPath + "/Valunit", item.Valunit);
                                    }
                                })                                
                            }
                        }
                    }
                }
            },

            onSaveGeneralTable: function () {
                //save general attributes table changes
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("generalTable").getModel("DataModel");
                var path;

                //initialize message strip
                var oMsgStrip = this.getView().byId('GeneralAttrMessageStrip');
                oMsgStrip.setVisible(false);

                if (!this._generalAttrChanged) { //check if data is changed
                    MessageBox.information(this._i18n.getText('t7'));                    
                } else {
                    //get table data and build the payload
                    var sMessage = "";
                    var oData = oTableModel.getData();
                    var oEntry = {
                        Styleno: this._styleNo,
                        Type: Constants.GENERAL,
                        AttributesToItems: []
                    }
                    for (var i = 0; i < oData.results.length; i++) {
                        var bProceed = true;

                        if (oData.results[i].Property === "M") {
                            if (me.getView().getModel("AttribCdModel").getData().results.filter(fItem => fItem.Attribtyp === oData.results[i].Attribtyp).length > 0 && oData.results[i].Attribcd === "") {
                                bProceed = false;
                                sMessage += "Attribute code is required for type " + oData.results[i].Attribtyp + ".\r\n";
                            }

                            if (oData.results[i].Valuetyp.toUpperCase() === "STRVAL" && oData.results[i].Attribval === "") {
                                bProceed = false;
                                
                                if (oData.results[i].Attribcd !== "") {
                                    sMessage += "Attribute value is required for type/code " + oData.results[i].Attribtyp + "/" + oData.results[i].Attribcd + ".\r\n";
                                }
                                else {
                                    sMessage += "Attribute value is required for type " + oData.results[i].Attribtyp + ".\r\n";
                                }
                            }
                            else if (oData.results[i].Valuetyp.toUpperCase() === "NUMVALUE" && (oData.results[i].Attribval === "" || oData.results[i].Valunit === "")) {
                                bProceed = false;

                                if (oData.results[i].Attribcd !== "") {
                                    sMessage += "Attribute value and UOM is required for type/code " + oData.results[i].Attribtyp + "/" + oData.results[i].Attribcd + ".\r\n";
                                }
                                else {
                                    sMessage += "Attribute value and UOM is required for type " + oData.results[i].Attribtyp + ".\r\n";
                                }
                            }                            
                        }
                        
                        if (bProceed) {
                            var item = {
                                "Styleno": this._styleNo,
                                "Attribtyp": oData.results[i].Attribtyp,
                                "Attribcd": oData.results[i].Attribcd,
                                "Baseind": false,
                                "Desc1": oData.results[i].Desc1,
                                "Valuetyp": oData.results[i].Valuetyp,
                                "Attribval": oData.results[i].Attribval,
                                "Valunit": oData.results[i].Valunit,
                                "Attribseq": oData.results[i].Attribseq,
                                "Casverind": (oData.results[i].Casverind === true ? "X" : "")
                            };
    
                            oEntry.AttributesToItems.push(item);
                        }
                    };
                    
                    if (sMessage === "") {
                        Common.openLoadingDialog(that);
                        console.log(oEntry)
                        MessageBox.confirm(this._i18n.getText('ConfirmSave'), {
                            actions: ["Yes", "No"],
                            onClose: function (sAction) {
                                if (sAction === "Yes") {
                                    //call deep entity create method 
                                    path = "/AttributesGeneralSet";
                                    oModel.setHeaders({
                                        sbu: this._sbu
                                    });
                                    oModel.create(path, oEntry, {
                                        method: "POST",
                                        success: function (oData, oResponse) {
                                            Common.closeLoadingDialog(that);
                                            me._generalAttrChanged = false;
                                            me.setChangeStatus(false);
                                            Utils.getProcessAttributes(me); //need to reload available attribute types for process tables
                                            me.setTabReadMode("GenAttrEditModeModel");
                                            me.setRowReadMode("generalTable");
                                            me.getGeneralTable();
                                            MessageBox.information(me._i18n.getText('t4'));

                                            //on save, execute apply to IO
                                            if(me._iono != ' '){
                                                me.applyToIO();
                                            }

                                        },
                                        error: function (err) {
                                            //show error messages
                                            Common.closeLoadingDialog(that);
                                            var errorMsg = JSON.parse(err.responseText).error.message.value;
                                //             //oMsgStrip.setVisible(true);
                                //             //oMsgStrip.setText(errorMsg);
                                //             // Common.showMessage(me._i18n.getText('t5'));
                                            MessageBox.information(me._i18n.getText('t5') + "\r\n" + errorMsg);
                                        }
                                    });
                                }
                            }
                        });
                    }
                    else {
                        MessageBox.information(sMessage);
                    }
                }
            },

            onDeleteGeneralAttr: function () {
                //confirmation to delete selected general attribute lines
                this.onDeleteTableItems('generalTable', 'ConfirmDeleteGeneralAttr', this._ConfirmDeleteGeneralAttr);
            },

            onConfirmDeleteGeneralAttr: function (oEvent) {
                //start of delete of selected lines
                var me = this;
                var oModel = this.getOwnerComponent().getModel();

                //get selected lines to delete
                var oTable = this.getView().byId("generalTable");
                var oTableModel = oTable.getModel("DataModel");
                var oData = oTableModel.getData();
                var selected = oTable.getSelectedIndices();

                oModel.setUseBatch(true);
                oModel.setDeferredGroups(["group1"]);

                // this._ConfirmDeleteGeneralAttr.close();
                oEvent.getSource().getParent().close();

                if (selected.length > 0) {
                    //call delete method for each selected line
                    selected.sort((a, b) => -1);

                    for (var i = 0; i < selected.length; i++) {
                        var vProp = oData.results[selected[i]].Property;
                        var attrtype = oData.results[selected[i]].Attribtyp;
                        var attrcd = oData.results[selected[i]].Attribcd;
                        var entitySet = "/StyleAttributesGeneralSet(Styleno='" + that._styleNo + "',Attribtyp='" + attrtype + "',Attribcd='" + attrcd + "')";

                        if (vProp !== "M") {
                            oModel.remove(entitySet, {
                                groupId: "group1",
                                changeSetId: "changeSetId1",
                                method: "DELETE",
                                success: function (data, oResponse) {
                                },
                                error: function () {
                                }
                            });
    
                            oModel.submitChanges({
                                groupId: "group1"
                            });
                            oModel.setRefreshAfterChange(true);                            
                        }
                        else {
                            selected.splice(i, 1);
                        }
                    }

                    //remove the deleted lines from the table
                    oData.results = oData.results.filter(function (value, index) {
                        return selected.indexOf(index) == -1;
                    })

                    oTableModel.setData(oData);
                    oTable.clearSelection();
                }
            },

            generalAttrDataCheck: function() {
                var me = this;
                var sMessage = "";
                var oTable = this.getView().byId("generalTable");
                var oData = oTable.getModel("DataModel").getData();
                var oMsgStrip = this.getView().byId("GeneralAttrInfoMessageStrip");
                oMsgStrip.setVisible(false);

                oData.results.forEach((item, index) => {
                    if (item.Property === "M") {
                        if (me.getView().getModel("AttribCdModel").getData().results.filter(fItem => fItem.Attribtyp === item.Attribtyp).length > 0 && item.Attribcd === "") {
                            sMessage += "Attribute code is required for type " + item.Attribtyp + ".\r\n";
                        }

                        if (item.Valuetyp.toUpperCase() === "STRVAL" && item.Attribval === "") {                           
                            if (item.Attribcd !== "") {
                                sMessage += "Attribute value is required for type/code " + item.Attribtyp + "/" + item.Attribcd + ".\r\n";
                            }
                            else {
                                sMessage += "Attribute value is required for type " + item.Attribtyp + ".\r\n";
                            }
                        }
                        else if (item.Valuetyp.toUpperCase() === "NUMVALUE" && (item.Attribval === "" || item.Valunit === "")) {
                            if (item.Attribcd !== "") {
                                sMessage += "Attribute value and UOM is required for type/code " + item.Attribtyp + "/" + item.Attribcd + ".\r\n";
                            }
                            else {
                                sMessage += "Attribute value and UOM is required for type " + item.Attribtyp + ".\r\n";
                            }
                        }                        
                    }
                });
                
                if (sMessage !== "") {
                    // oMsgStrip.setVisible(true);
                    // oMsgStrip.setText(sMessage + "Enter value on these attributes to be able to work with other style details.");
                    this.disableOtherTabs("detailPanel");
                }
                else { this.enableOtherTabs("detailPanel"); }
            },

            viewGenAttrInfo: function() {
                MessageBox.information(this._genAttrInfo);
            },

            //******************************************* */
            // Colors Attribute
            //******************************************* */

            getColorsTable: function () {
                //selection of color attributes table
                var me = this;
                var oTable = this.getView().byId("colorsTable");
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();

                Common.openLoadingDialog(that);

                var entitySet = "/StyleAttributesColorSet"
                oModel.setHeaders({
                    styleno: this._styleNo
                });
                oModel.read(entitySet, {
                    success: function (oData, oResponse) {
                        me.enableVersionItemTab();

                        // if (oData.results.filter(fItem => fItem.Sortseq === "0").length === oData.results.length) {
                        //     oData.results.forEach(item => item.Sortseq = item.Attribseq);
                        // }

                        oData.results.forEach(item => item.Attribseq = me.pad(item.Attribseq, 2));

                        oJSONModel.setData(oData);
                        // oTable.setModel(oJSONModel, "DataModel");
                        // console.log(oTable.getModel("DataModel").getData())

                        if (oTable.getModel("DataModel") === undefined) {
                            oTable.setModel(oJSONModel, "DataModel");
                        }
                        else {
                            oTable.getModel("DataModel").setProperty("/results", oData.results);
                        }

                        //oTable.setVisibleRowCount(oData.results.length); //updating visible rows
                        // oTable.attachPaste(); //for copy-paste
                        Common.closeLoadingDialog(that);
                        me.getOwnerComponent().getModel("COLOR_MODEL").setProperty("/items", oData.results);
                    },
                    error: function () {
                        Common.closeLoadingDialog(that);
                    }
                })
            },

            getBOMCOlor: async (me) => {
                var oModel = me.getOwnerComponent().getModel();
                var retData = [];

                var promise = new Promise((resolve, reject) => {
                    oModel.setHeaders({
                        STYLENO: me._styleNo
                    });

                    oModel.read("/BOMColorSet", {
                        success: function (oData, oResponse) {
                            retData = oData.results;
                            resolve(retData);
                            Common.closeLoadingDialog(that);
                        },
                        error: function (err) {
                            Common.closeLoadingDialog(that);
                            resolve(retData);
                        }
                    });
                })

                return await promise;
            },

            setColorCreateMode: async function () {
                // this._bomColors = [];
                // this._bomColors = await this.getBOMCOlor(this);

                // var oTable = this.getView().byId("colorsTable");

                // if (this._bomColors.length > 0) {
                //     var oTableModel = oTable.getModel("DataModel");
                //     var oData = oTableModel.getData();

                //     for (var i = 0; i < oData.results.length; i++) {
                //         if (this._bomColors.filter(fItem => fItem.COLOR === oData.results[i].Attribcd).length > 0) {
                //             console.log("1")
                //             oTable.getRows()[i].getCells().forEach(cell => {
                //                 if (cell.getBindingInfo("value") !== undefined) {
                //                     cell.setProperty("editable", false);
                //                 }
                //             });
                //         }
                //         else {
                //             oTable.getRows()[i].getCells().forEach(cell => {
                //                 if (cell.getBindingInfo("value") !== undefined) {
                //                     cell.setProperty("editable", true);
                //                 }
                //             });
                //         }
                //     }
                // }
                // else {
                //     oTable.getRows().forEach(row => {
                //         row.getCells().forEach(cell => {
                //             if (cell.getBindingInfo("value") !== undefined) {
                //                 cell.setProperty("editable", true);
                //             }
                //         });
                //     });
                // }

                const result = await this.lockStyle("X");
                if (result.Type != "S") {
                    MessageBox.warning(result.Message);
                }
                else {
                    //set colors table editable
                    var oJSONModel = new JSONModel();
                    var data = {};
                    data.editMode = true;
                    oJSONModel.setData(data);
                    this.getView().setModel(oJSONModel, "ColorEditModeModel");

                    this.byId("btnColorAdd").setVisible(true);
                    this.byId("btnColorRemoveRow").setVisible(true);
                    this.byId("btnColorSave").setVisible(true);
                    this.byId("btnColorCancel").setVisible(true);
                    this.byId("btnColorEdit").setVisible(false);
                    this.byId("btnColorDelete").setVisible(false);

                    this.disableOtherTabs("detailPanel");
                    this.byId("btnHdrEdit").setEnabled(false);
                    this.byId("btnHdrDelete").setEnabled(false);
                    this.byId("btnHdrClose").setEnabled(false);
                    this.setRowEditMode("colorsTable");
                    this.setColorEditModeControls();

                    //mark as required fields
                    var oTable = this.getView().byId("colorsTable");
                    oTable.getColumns().forEach((col, idx) => {
                        //console.log(col);
                        const colProp = col.mProperties.filterProperty;
                        if(colProp == "Desc1" || colProp == "Sortseq")
                            col.getLabel().addStyleClass("sapMLabelRequired");
                    });
                }
            },

            setColorEditMode: async function () {
                this._bomColors = [];
                this._bomColors = await this.getBOMCOlor(this);

                var oTable = this.getView().byId("colorsTable");
                var oTableModel = oTable.getModel("DataModel");
                var oData = oTableModel.getData();
                var bProceed = true;
                // var noEdit= 0;

                if (oData.results.length === 0) {
                    MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_NO_DATA_EDIT"]);
                    bProceed = false;
                }
                else {
                    bProceed = true;
                    // var oTableModel = oTable.getModel("DataModel");
                    // var oData = oTableModel.getData();

                    // for (var i = 0; i < oData.results.length; i++) {
                    //     if (this._bomColors.filter(fItem => fItem.COLOR === oData.results[i].Attribcd).length > 0) {
                    //         // noEdit++;
                    //         oTable.getRows()[i].getCells().forEach(cell => {
                    //             if (cell.getBindingInfo("value") !== undefined) {
                    //                 if (cell.getBindingInfo("value").parts[0].path === "Sortseq") {
                    //                     cell.setProperty("editable", true);
                    //                 }
                    //                 else {
                    //                     cell.setProperty("editable", false);
                    //                 }
                    //             }
                    //         });
                    //     }
                    //     else {
                    //         oTable.getRows()[i].getCells().forEach(cell => {
                    //             if (cell.getBindingInfo("value") !== undefined) {
                    //                 cell.setProperty("editable", true);
                    //             }
                    //         });
                    //     }
                    // }

                    // if (oData.results.length === noEdit) {
                    //     bProceed = false;
                    //     MessageBox.information("Color/s already used in BOM.")
                    // }
                }

                if (bProceed) {
                    const result = await this.lockStyle("X");
                    if (result.Type != "S") {
                        MessageBox.warning(result.Message);
                    }
                    else {
                        //set colors table editable
                        var oJSONModel = new JSONModel();
                        var data = {};
                        this._colorChanged = false;
                        data.editMode = true;
                        oJSONModel.setData(data);
                        this.getView().setModel(oJSONModel, "ColorEditModeModel");
                        this.byId("btnColorAdd").setVisible(false);
                        this.byId("btnColorSave").setVisible(true);
                        this.byId("btnColorCancel").setVisible(true);
                        this.byId("btnColorEdit").setVisible(false);
                        this.byId("btnColorDelete").setVisible(false);

                        this.disableOtherTabs("detailPanel");
                        this.byId("btnHdrEdit").setEnabled(false);
                        this.byId("btnHdrDelete").setEnabled(false);
                        this.byId("btnHdrClose").setEnabled(false);
                        this.setColorEditModeControls();
                        this.setRowEditMode("colorsTable");

                        //mark as required fields
                        oTable.getColumns().forEach((col, idx) => {
                            //console.log(col);
                            const colProp = col.mProperties.filterProperty;
                            if(colProp == "Desc1" || colProp == "Sortseq")
                                col.getLabel().addStyleClass("sapMLabelRequired");
                        });
                    }
                }
            },

            setColorReadMode: function () {
                //set colors table editable
                var oJSONModel = new JSONModel();
                var data = {};
                this._colorChanged = false;
                data.editMode = false;
                oJSONModel.setData(data);
                this.getView().setModel(oJSONModel, "ColorEditModeModel");
            },

            cancelColorsEdit: function () {
                //cancel edit of colors table
                if (this._colorChanged) {
                    if (!this._DiscardColorsChangesDialog) {
                        this._DiscardColorsChangesDialog = sap.ui.xmlfragment("zui3derp.view.fragments.dialog.DiscardColorsChanges", this);
                        this.getView().addDependent(this._DiscardColorsChangesDialog);
                    }
                    jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                    this._DiscardColorsChangesDialog.addStyleClass("sapUiSizeCompact");
                    this._DiscardColorsChangesDialog.open();
                } else {
                    this.closeColorsEdit();
                }
            },

            closeColorsEdit: function () {
                //edit cancelled, reselect backend data, close edit mode
                var oJSONModel = new JSONModel();
                var data = {};
                that._colorChanged = false;
                that.setChangeStatus(false);
                data.editMode = false;
                oJSONModel.setData(data);
                that.getView().setModel(oJSONModel, "ColorEditModeModel");
                if (that._DiscardColorsChangesDialog) {
                    that._DiscardColorsChangesDialog.close();
                    that.getColorsTable();
                }
                var oMsgStrip = that.getView().byId('ColorsMessageStrip');
                oMsgStrip.setVisible(false);

                this.setTabReadMode("ColorEditModeModel");
                this.setRowReadMode("colorsTable");
                /*
               var oTable = this.getView().byId("colorsTable");

               oTable.getRows().forEach(row => {
                   row.getCells().forEach(cell => {
                       if (cell.getBindingInfo("value") !== undefined) {
                           cell.setProperty("editable", false);
                       }
                   });
               });


              
               this.byId("btnColorAdd").setVisible(true);
               this.byId("btnColorSave").setVisible(false);
               this.byId("btnColorCancel").setVisible(false);
               this.byId("btnColorEdit").setVisible(true);
               this.byId("btnColorDelete").setVisible(true);

               this.enableOtherTabs("detailPanel");
               this.byId("btnHdrEdit").setEnabled(true);
               this.byId("btnHdrDelete").setEnabled(true);
               */
            },

            onColorChange: function () {
                //set colors table edit flag
                this._colorChanged = true;
                this.setChangeStatus(true);
            },

            onSaveColorTable: function () {
                //save changes to colors table
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("colorsTable").getModel("DataModel");
                var path;
                var oData = oTableModel.getData().results.sort((a,b) => (+a.Sortseq) > (+b.Sortseq) ? 1 : -1);
                
                //initialize message strip
                var oMsgStrip = this.getView().byId('ColorsMessageStrip');
                oMsgStrip.setVisible(false);

                if (!this._colorChanged) { //check if there are changes to colors table
                    MessageBox.information(this._i18n.getText('t7'));
                } else {

                    //build the headers and payload
                    var oEntry = {
                        Styleno: this._styleNo,
                        Type: Constants.COLOR,
                        AttributesToItems: []
                    }

                    for (var i = 0; i < oData.length; i++) {
                        var item = {
                            "Styleno": this._styleNo,
                            "Attribtyp": "COLOR",
                            "Attribcd": oData[i].Attribcd,
                            "Baseind": false,
                            "Desc1": oData[i].Desc1,
                            "Valuetyp": "STRVAL",
                            "Attribseq": oData[i].Attribseq,
                            "Sortseq": oData[i].Sortseq
                        };
                        oEntry.AttributesToItems.push(item);
                    };

                    // color code = seq, auto-generated, should not have a duplicate value
                    // var hasDuplicateColorCd = false;
                    // oData.results.map(v => v.Attribcd.toLowerCase()).sort().sort((a, b) => {
                    //     if (a == b) hasDuplicateColorCd = true
                    // })
                    // if (hasDuplicateColorCd) {
                    //     //Common.showMessage("Duplicate color is not allow");
                    //     oMsgStrip.setVisible(true);
                    //     oMsgStrip.setText("Duplicate Color is not allowed");
                    //     return;
                    // }

                    var hasDuplicateColorDesc = false;
                    oData.map(v => v.Desc1.toLowerCase()).sort().sort((a, b) => {
                        if (a == b) hasDuplicateColorDesc = true
                    })

                    if (hasDuplicateColorDesc) {
                        //Common.showMessage("Duplicate color is not allow");
                        // oMsgStrip.setVisible(true);
                        // oMsgStrip.setText("Duplicate Description is not allowed");
                        MessageBox.information("Duplicate Description is not allowed");
                        return;
                    }

                    MessageBox.confirm(this._i18n.getText('ConfirmSave'), {
                        actions: ["Yes", "No"],
                        onClose: function (sAction) {
                            if (sAction === "Yes") {
                                Common.openLoadingDialog(that);
                                //call the create deep of general attributes
                                path = "/AttributesGeneralSet";
                                oModel.setHeaders({
                                    sbu: this._sbu
                                });

                                oModel.create(path, oEntry, {
                                    method: "POST",
                                    success: function (oData, oResponse) {
                                        Common.closeLoadingDialog(me);
                                        me._colorChanged = false;
                                        me.setChangeStatus(false);
                                        Utils.getProcessAttributes(me);
                                        //me.setColorReadMode();
                                        me.setTabReadMode("ColorEditModeModel");
                                        me.setRowReadMode("colorsTable");
                                        me.getColorsTable();

                                        //on save, execute apply to IO
                                        if(me._iono != ' '){
                                            me.applyToIO();
                                        }

                                        me.enableOtherTabs("detailPanel");
                                        me.byId("btnHdrEdit").setEnabled(true);
                                        me.byId("btnHdrDelete").setEnabled(true);

                                        MessageBox.information(me._i18n.getText('t4'));
                                    },
                                    error: function (err) {
                                        Common.closeLoadingDialog(me);
                                        // Common.showMessage(me._i18n.getText('t5'));
                                        var errorMsg = JSON.parse(err.responseText).error.message.value;
                                        // oMsgStrip.setVisible(true);
                                        // oMsgStrip.setText(errorMsg);
                                        MessageBox.information(me._i18n.getText('t5') + "\r\n" + errorMsg);
                                    }
                                });
                            }
                        }
                    });
                }
            },

            onDeleteColor: function () {
                //get selected lines to delete
                this.onDeleteTableItems('colorsTable', 'ConfirmDeleteColor', this._ConfirmDeleteColor);
            },

            onConfirmDeleteColor: function (oEvent) {
                //confirm delete selected colors

                //get selected lines to delete
                var oModel = this.getOwnerComponent().getModel();
                var oTable = this.getView().byId("colorsTable");
                var oTableModel = oTable.getModel("DataModel");
                var oData = oTableModel.getData();
                var selected = oTable.getSelectedIndices();

                oModel.setUseBatch(true);
                oModel.setDeferredGroups(["group1"]);

                oEvent.getSource().getParent().close();
                // this._ConfirmDeleteColor.close();

                if (selected.length > 0) {
                    selected.sort((a, b) => -1);
                    //call delete method for each selected lines
                    for (var i = (selected.length - 1); i >= 0; i--) {
                        var attrtype = Constants.COLOR;
                        var attrcd = oData.results[selected[i]].Attribcd;
                        var entitySet = "/StyleAttributesColorSet(Styleno='" + that._styleNo + "',Attribtype='" + attrtype + "',Attribcd='" + attrcd + "')";

                        if (this._bomColors.filter(fItem => fItem.COLOR === attrcd).length === 0) {
                            oModel.remove(entitySet, {
                                groupId: "group1",
                                changeSetId: "changeSetId1",
                                method: "DELETE",
                                success: function (data, oResponse) {
                                },
                                error: function () {
                                }
                            });
                            oModel.submitChanges({
                                groupId: "group1"
                            });
                            oModel.setRefreshAfterChange(true);
                        }
                        else {
                            selected.splice(i, 1);
                        }
                    }

                    //remove deleted lines from the table
                    oData.results = oData.results.filter(function (value, index) {
                        return selected.indexOf(index) == -1;
                    })

                    oTableModel.setData(oData);
                    oTable.clearSelection();

                    if (oData.results.length === 0) { this.disableTabItem("detailPanel","version"); }
                    // this.getColorsTable();

                }
            },

            setColorEditModeControls: async function() {
                //update to base on binding indices
                var oTable = this.getView().byId("colorsTable");

                if (this._dataMode !== "NEW") {
                    this._bomColors = [];
                    this._bomColors = await this.getBOMCOlor(this);    
                }

                setTimeout(() => {
                    for (var i = 0; i < oTable.getModel("DataModel").getData().results.length; i++) {
                        var iRowIndex = oTable.getBinding("rows").aIndices[i];
                        var oRow = oTable.getRows()[iRowIndex];
                        var vAttribcd = oTable.getContextByIndex(iRowIndex).getProperty("Attribcd");                    
                        var bNew = oTable.getContextByIndex(iRowIndex).getProperty("NEW");                    
                        var oCellCtrlValTyp = "";

                        oRow.getCells().forEach(cell => {
                            if ((bNew === undefined || !bNew) && this._dataMode === "NEW") {
                                if (cell.getBindingInfo("text") === undefined) {
                                    cell.setEnabled(false);
                                }
                            }
                            else {
                                if (cell.getBindingInfo("value") !== undefined) {
                                    oCellCtrlValTyp = "value";

                                    if (this._dataMode === "NEW") { cell.setEnabled(true) }
                                }
                                else if (cell.getBindingInfo("text") !== undefined) {
                                    oCellCtrlValTyp = "text";
                                }
                                else if (cell.getBindingInfo("selected") !== undefined) {
                                    oCellCtrlValTyp = "selected";

                                    if (this._dataMode === "NEW") { cell.setEnabled(true) }
                                }

                                if (this._dataMode !== "NEW" && oCellCtrlValTyp !== "text") {
                                    if (this._bomColors.filter(fItem => fItem.COLOR === vAttribcd).length > 0) {
                                        if (cell.getBindingInfo(oCellCtrlValTyp).parts[0].path.toUpperCase() !== "SORTSEQ" && oCellCtrlValTyp !== "text") {
                                            cell.setEnabled(false);
                                        }
                                    }
                                    else {
                                        cell.setEnabled(true);
                                    }
                                }
                            }
                        })
                    }                     
                }, 10);
            },

            //******************************************* */
            // Sizes Attribute
            //******************************************* */

            getSizesTable: function () {
                //select size attributes
                var me = this;
                var oTable = this.getView().byId("sizesTable");
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var oTable = this.getView().byId("sizesTable");
                var oSizeGrp = this.getView().byId("SIZEGRP").getValue();

                Common.openLoadingDialog(that);

                var entitySet = "/StyleAttributesSizeSet"
                oModel.setHeaders({
                    styleno: this._styleNo,
                    attribgrp: oSizeGrp
                });
                oModel.read(entitySet, {
                    success: function (oData, oResponse) {
                        me.enableVersionItemTab();
                        oJSONModel.setData(oData);
                        oTable.setModel(oJSONModel, "DataModel");                        
                        Common.closeLoadingDialog(that);
                    },
                    error: function () {
                        Common.closeLoadingDialog(that);
                    }
                })
            },

            setSizeEditMode: async function () {
                const result = await this.lockStyle("X");
                if (result.Type != "S") {
                    MessageBox.warning(result.Message);
                }
                else {
                    //set size table editable
                    var oJSONModel = new JSONModel();
                    var data = {};
                    this._sizeChanged = false;
                    data.editMode = true;
                    oJSONModel.setData(data);
                    this.getView().setModel(oJSONModel, "SizeEditModeModel");

                    this.setControlEditMode("SizeEditModeModel", true);
                    this.disableOtherTabs("detailPanel");
                    this.byId("btnHdrEdit").setEnabled(false);
                    this.byId("btnHdrDelete").setEnabled(false);
                }
            },

            cancelSizeEdit: function () {
                //confirm size edit cancel
                if (this._sizeChanged) {
                    if (!this._DiscardSizesChangesDialog) {
                        this._DiscardSizesChangesDialog = sap.ui.xmlfragment("zui3derp.view.fragments.dialog.DiscardSizesChanges", this);
                        this.getView().addDependent(this._DiscardSizesChangesDialog);
                    }
                    jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                    this._DiscardSizesChangesDialog.addStyleClass("sapUiSizeCompact");
                    this._DiscardSizesChangesDialog.open();
                } else {
                    this.closeSizeEdit();
                }

                this.setDtlsEnableButton(true);
            },

            closeSizeEdit: function () {
                //editing cancelled, reselect sizes from backend, close table edit mode
                var oJSONModel = new JSONModel();
                var data = {};
                that._sizeChanged = false;
                that.setChangeStatus(false);
                data.editMode = false;
                oJSONModel.setData(data);
                that.getView().setModel(oJSONModel, "SizeEditModeModel");
                if (that._DiscardSizesChangesDialog) {
                    that._DiscardSizesChangesDialog.close();
                    that.getSizesTable();
                }
                var oMsgStrip = that.getView().byId('SizesMessageStrip');
                oMsgStrip.setVisible(false);

                this.setTabReadMode("SizeEditModeModel");
                // this.enableOtherTabs("detailPanel");
                // this.byId("btnHdrEdit").setEnabled(true);
                // this.byId("btnHdrDelete").setEnabled(true);
            },

            onSizeChange: function () {
                //set size attributes change flag
                this._sizeChanged = true;
                this.setChangeStatus(true);
            },

            onSaveSizeTable: function () {
                //save changes of size table
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("sizesTable").getModel("DataModel");
                var path;
                var lv_baseindctr = 0;

                //initiliaze message strip
                var oMsgStrip = this.getView().byId('SizesMessageStrip');
                oMsgStrip.setVisible(false);

                if (!this._sizeChanged) { //check if there are changes 
                    MessageBox.information(this._i18n.getText('t7'));
                } else {
                    //build header and payload
                    var oData = oTableModel.getData();
                    var oEntry = {
                        Styleno: this._styleNo,
                        Type: Constants.SIZE,
                        AttributesToItems: []
                    }
                    for (var i = 0; i < oData.results.length; i++) {
                        if (oData.results[i].Baseind === true) { //for checking if multiple base ind selected
                            lv_baseindctr++;
                        }
                        var item = {
                            "Styleno": this._styleNo,
                            "Attribtyp": Constants.SIZE,
                            "Attribcd": oData.results[i].Attribcd,
                            "Attribgrp": oData.results[i].Attribgrp,
                            "Baseind": oData.results[i].Baseind,
                            "Desc1": oData.results[i].Desc1,
                            "Valuetyp": Constants.STRVAL,
                            "Attribseq": oData.results[i].Attribseq
                        };
                        oEntry.AttributesToItems.push(item);
                    };

                    if (lv_baseindctr > 1) { //do not allow multiple base indicator
                        MessageBox.information(this._i18n.getText('t9'));
                    } else {
                        MessageBox.confirm(this._i18n.getText('ConfirmSave'), {
                            actions: ["Yes", "No"],
                            onClose: function (sAction) {
                                if (sAction === "Yes") {

                                    Common.openLoadingDialog(that);
                                    //call create deep method of size attirbutes
                                    path = "/AttributesGeneralSet";
                                    oModel.setHeaders({
                                        sbu: this._sbu
                                    });
                                    oModel.create(path, oEntry, {
                                        method: "POST",
                                        success: function (oData, oResponse) {
                                            me._sizeChanged = false;
                                            me.setChangeStatus(false);
                                            Common.closeLoadingDialog(me);
                                            me.setTabReadMode("SizeEditModeModel");
                                            //Common.showMessage(me._i18n.getText('t4'));
                                            MessageBox.information(me._i18n.getText('t4'));
                                            Utils.getProcessAttributes(me);

                                            //on save, execute apply to IO
                                            if(me._iono != ' '){
                                                me.applyToIO();
                                            }
                                        },
                                        error: function (err) {
                                            Common.closeLoadingDialog(me);
                                            //Common.showMessage(me._i18n.getText('t5'));
                                            var errorMsg = JSON.parse(err.responseText).error.message.value;
                                            //oMsgStrip.setVisible(true);
                                            //oMsgStrip.setText(errorMsg);
                                            MessageBox.information(me._i18n.getText('t5') + ": " + errorMsg);
                                        }
                                    });
                                }
                                // this.enableOtherTabs("detailPanel");
                                // this.byId("btnHdrEdit").setEnabled(true);
                                // this.byId("btnHdrDelete").setEnabled(true);
                            },
                            error: function (err) {
                                Common.closeLoadingDialog(me);
                                // Common.showMessage(me._i18n.getText('t5'));
                                var errorMsg = JSON.parse(err.responseText).error.message.value;
                                // oMsgStrip.setVisible(true);
                                // oMsgStrip.setText(errorMsg);
                                MessageBox.information(me._i18n.getText('t5') + "\r\n" + errorMsg);
                            }
                        });
                    }
                }
            },

            //******************************************* */
            // Process Attributes
            //******************************************* */

            getProcessesTable: function () {
                //get processes data
                var oTable = this.getView().byId("processesTable");
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();

                Common.openLoadingDialog(that);

                var entitySet = "/StyleAttributesProcessSet"
                oModel.setHeaders({
                    styleno: this._styleNo,
                    sbu: this._sbu
                });
                oModel.read(entitySet, {
                    success: function (oData, oResponse) {
                        oJSONModel.setData(oData);
                        // oTable.setModel(oJSONModel, "DataModel");

                        if (oTable.getModel("DataModel") === undefined) {
                            oTable.setModel(oJSONModel, "DataModel");
                        }
                        else {
                            oTable.getModel("DataModel").setProperty("/results", oData.results);
                        }
                        //oTable.setVisibleRowCount(oData.results.length);
                        // oTable.attachPaste();
                        Common.closeLoadingDialog(that);
                    },
                    error: function () {
                        Common.closeLoadingDialog(that);
                    }
                })
            },

            setProcessEditMode: async function () {
                const result = await this.lockStyle("X");
                if (result.Type != "S") {
                    MessageBox.warning(result.Message);
                }
                else {
                    //set edit mode processes table
                    var oJSONModel = new JSONModel();
                    var data = {};
                    data.editMode = true;
                    oJSONModel.setData(data);
                    this.getView().setModel(oJSONModel, "ProcessEditModeModel");

                    var oTable = this.getView().byId("processesTable");
                    //mark as required field
                    oTable.getColumns().forEach((col, idx) => {
                        const colProp = col.mProperties.filterProperty;
                        if(colProp == "Processcd")
                            col.getLabel().addStyleClass("sapMLabelRequired");
                    });

                    Utils.getProcessAttributes(this);
                    this.setControlEditMode("ProcessEditModeModel", true)
                    this.disableOtherTabs("detailPanel");
                    this.byId("btnHdrEdit").setEnabled(false);
                    this.byId("btnHdrDelete").setEnabled(false);
                    this.byId("btnHdrClose").setEnabled(false);
                    this.setRowEditMode("processesTable");
                    this.setProcessEditModeControls();
                }
            },

            cancelProcessEdit: function () {
                //confirm cancel editing of process table
                if (this._processChanged) {
                    if (!this._DiscardProcessChangesDialog) {
                        this._DiscardProcessChangesDialog = sap.ui.xmlfragment("zui3derp.view.fragments.dialog.DiscardProcessChanges", this);
                        this.getView().addDependent(this._DiscardProcessChangesDialog);
                    }
                    jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                    this._DiscardProcessChangesDialog.addStyleClass("sapUiSizeCompact");
                    this._DiscardProcessChangesDialog.open();
                } else {
                    this.closeProcessEdit();
                }

                this.setDtlsEnableButton(true);
            },

            closeProcessEdit: function () {
                //editing process tbale cancelled, reselect backend data, close edit mode
                var oJSONModel = new JSONModel();
                var data = {};
                that._processChanged = false;
                that.setChangeStatus(false);
                data.editMode = false;
                oJSONModel.setData(data);
                that.getView().setModel(oJSONModel, "ProcessEditModeModel");
                if (that._DiscardProcessChangesDialog) {
                    that._DiscardProcessChangesDialog.close();
                    that.getProcessesTable();
                }
                var oMsgStrip = that.getView().byId('ProcessesMessageStrip');
                oMsgStrip.setVisible(false);

                this.setTabReadMode("ProcessEditModeModel");
                this.setRowReadMode("processesTable");
                // this.enableOtherTabs("detailPanel");
                // this.byId("btnHdrEdit").setEnabled(true);
                // this.byId("btnHdrDelete").setEnabled(true);
                this.getView().setModel(new JSONModel(this.getView().getModel("VASTypeModel").getData()), "VASTypModel");
                this.getView().setModel(new JSONModel(this.getView().getModel("ProcessAttribCodeModel").getData()), "ProcessAttribCdModel");
            },

            onProcessChange: function () {
                this._processChanged = true;
                this.setChangeStatus(true);
            },

            onProcessInputChange: function (oEvent) {
                this._processChanged = true;
                this.setChangeStatus(true);

                if (oEvent !== undefined) {
                    var oSource = oEvent.getSource();

                    if (oSource.getBindingInfo("value") !== undefined) {
                        var sRowPath = oSource.oParent.getBindingContext("DataModel").sPath;
                        var vColPath = oSource.getBindingInfo("value").parts[0].path;
                        var oModelData = {};

                        if (oEvent.getParameter("value") === "") {
                            this.byId("processesTable").getModel("DataModel").setProperty(sRowPath + "/" + vColPath, "");
                        }
                        else {
                            this.byId("processesTable").getModel("DataModel").setProperty(sRowPath + "/" + vColPath, oSource.getSelectedKey());
                        }

                        // this.getView().setModel(new JSONModel(this.getView().getModel("VASTypeModel").getData()), "VASTypModel");
                        // this.getView().setModel(new JSONModel(this.getView().getModel("ProcessAttribCodeModel").getData()), "ProcessAttribCdModel");
                    }
                }
            },

            onSaveProcessTable: function () {
                //save process table
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("processesTable").getModel("DataModel");
                var path;

                //initialize message strip
                var oMsgStrip = this.getView().byId('ProcessesMessageStrip');
                oMsgStrip.setVisible(false);

                if (!this._processChanged) { //check changed data
                    MessageBox.information(this._i18n.getText('t7'));
                } else {
                    //build header and payload
                    var oData = oTableModel.getData();
                    var oEntry = {
                        Styleno: this._styleNo,
                        ProcessToItems: []
                    }

                    for (var i = 0; i < oData.results.length; i++) {
                        var item = {
                            "Styleno": this._styleNo,
                            "Seqno": oData.results[i].Seqno,
                            "Processcd": oData.results[i].Processcd,
                            "Leadtm": oData.results[i].Leadtm,
                            // "Leadtime": oData.results[i].Leadtime,
                            "Attribtyp": oData.results[i].Attribtyp,
                            "Attribcd": oData.results[i].Attribcd,
                            "Vastyp": oData.results[i].Vastyp
                        }
                        oEntry.ProcessToItems.push(item);
                    };
                    MessageBox.confirm(this._i18n.getText('ConfirmSave'), {
                        actions: ["Yes", "No"],
                        onClose: function (sAction) {
                            if (sAction === "Yes") {
                                //call create deep method of process attributes
                                Common.openLoadingDialog(that);
                                path = "/AttributesProcessSet";

                                oModel.setHeaders({
                                    sbu: this._sbu
                                });
                                oModel.create(path, oEntry, {
                                    method: "POST",
                                    success: function (oData, oResponse) {
                                        Common.closeLoadingDialog(me);
                                        me._processChanged = false;
                                        me.setChangeStatus(false);
                                        me.setTabReadMode("ProcessEditModeModel");
                                        me.setRowReadMode("processesTable");
                                        me.getProcessesTable();
                                        //Common.showMessage(me._i18n.getText('t4'));
                                        MessageBox.information(me._i18n.getText('t4'));
                                        //on save, execute apply to IO
                                        if(me._iono != ' '){
                                            me.applyToIO();
                                        }
                                    },
                                    error: function (err) {
                                        Common.closeLoadingDialog(me);
                                        //Common.showMessage(me._i18n.getText('t5'));
                                        var errorMsg = JSON.parse(err.responseText).error.message.value;
                                        //oMsgStrip.setVisible(true);
                                        //oMsgStrip.setText(errorMsg);
                                        MessageBox.information(me._i18n.getText('t5') + "\r\n" + errorMsg);
                                    }
                                });
                            }
                        }
                    });
                }
            },

            onDeleteProcess: function () {
                //confirm delete selected process items
                this.onDeleteTableItems('processesTable', 'ConfirmDeleteProcess', this._ConfirmDeleteProcess);
            },

            onConfirmDeleteProcess: function (oEvent) {
                //start delete process of selected items
                //get selected items to delete
                var oModel = this.getOwnerComponent().getModel();
                var oTable = this.getView().byId("processesTable");
                var oTableModel = oTable.getModel("DataModel");
                var oData = oTableModel.getData();
                var selected = oTable.getSelectedIndices();

                oModel.setUseBatch(true);
                oModel.setDeferredGroups(["group1"]);

                // this._ConfirmDeleteProcess.close();
                oEvent.getSource().getParent().close();

                if (selected.length > 0) {
                    //call delete method for each selected item
                    for (var i = 0; i < selected.length; i++) {
                        var seqno = oData.results[selected[i]].Seqno;
                        seqno = this.pad(seqno, 3);

                        var entitySet = "/StyleAttributesProcessSet(Styleno='" + that._styleNo + "',Seqno='" + seqno + "')";
                        oModel.remove(entitySet, {
                            groupId: "group1",
                            changeSetId: "changeSetId1",
                            method: "DELETE",
                            success: function (data, oResponse) {
                            },
                            error: function () {
                            }
                        });

                        oModel.submitChanges({
                            groupId: "group1"
                        });
                        oModel.setRefreshAfterChange(true);
                    }

                    oData.results = oData.results.filter(function (value, index) {
                        return selected.indexOf(index) == -1;
                    })

                    oTableModel.setData(oData);
                    oTable.clearSelection();
                }
            },

            setProcessEditModeControls: function() {
                //update to base on binding indices
                var oTable = this.getView().byId("processesTable");

                setTimeout(() => {
                    for (var i = 0; i < oTable.getModel("DataModel").getData().results.length; i++) {
                        var iRowIndex = oTable.getBinding("rows").aIndices[i];
    
                        // var iRowIndex = +oTable.getContextByIndex(i).getPath().replace("/results/", "");
                        var oRow = oTable.getRows()[iRowIndex];
                        var bNew = oTable.getContextByIndex(iRowIndex).getProperty("NEW");                    
                        var oCellCtrlValTyp = "";

                        oRow.getCells().forEach(cell => {
                            if ((bNew === undefined || !bNew) && this._dataMode === "NEW") {
                                if (cell.getBindingInfo("text") === undefined) {
                                    cell.setEnabled(false);
                                }
                            }
                            else {
                                if (cell.getBindingInfo("value") !== undefined) {
                                    oCellCtrlValTyp = "value";

                                    if (this._dataMode === "NEW") { cell.setEnabled(true) }
                                }
                                else if (cell.getBindingInfo("text") !== undefined) {
                                    oCellCtrlValTyp = "text";
                                }
                                else if (cell.getBindingInfo("selected") !== undefined) {
                                    oCellCtrlValTyp = "selected";

                                    if (this._dataMode === "NEW") { cell.setEnabled(true) }
                                }
                                
                                if (this._dataMode !== "NEW") {
                                    if (oCellCtrlValTyp !== "text") {
                                        cell.setEnabled(true);
                                    }
                                    else {
                                        cell.setEnabled(false);
                                    }
                                }
                            }
                        })
                    }                     
                }, 100);
            },

            bindProcessSuggestItems: function() {
                // var oTable = 
                // oInput.bindAggregation("suggestionItems", {
                //     path: "VASTypeModel>/" + vProcesscd,
                //     length: 10000,
                //     template: new sap.ui.core.ListItem({
                //         key: "{VASTypeModel>" + oKey + "}",
                //         text: "{VASTypeModel>" + oText + "}",
                //         additionalText: oAddtlText !== "" ? "{VASTypeModel>" + oAddtlText + "}" : oAddtlText,
                //     }),
                //     templateShareable: false
                // });
            },

            //******************************************* */
            // Style Versions
            //******************************************* */onRouteVersion

            getVersionsTable: function () {
                //get versions data of style
                var oTable = this.getView().byId("versionsTable");
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();

                Common.openLoadingDialog(that);

                var entitySet = "/StyleVersionSet"
                oModel.setHeaders({
                    styleno: this._styleNo
                });
                oModel.read(entitySet, {
                    success: function (oData, oResponse) {
                        oJSONModel.setData(oData);
                        oData.results.forEach((item, index) => {
                            item.Deleted = item.Deleted === "X" ? true : false;
                        });

                        if (oTable.getModel("DataModel") === undefined) {
                            oTable.setModel(oJSONModel, "DataModel");
                        }
                        else {
                            oTable.getModel("DataModel").setProperty("/results", oData.results);
                        }
                        oTable.setVisibleRowCount(oData.results.length);
                        // oTable.attachPaste();
                        Common.closeLoadingDialog(that);
                    },
                    error: function () {
                        Common.closeLoadingDialog(that);
                    }
                })
            },

            onSelectVersion: function (oEvent) {
                /*
                //check first if Size Group have selected Base Indicator
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
               
                var entitySet = "/VersionStyleCheckSet"
                oModel.setHeaders({
                    styleno: this._styleNo
                });
                oModel.read(entitySet, {
                    success: function (oData, oResponse) {
                        oJSONModel.setData(oData.results);
                    },
                    error: function () {
                        Common.closeLoadingDialog(that);
                    }
                })
                console.log(oJSONModel);
                */

                if (this._GenericFilterDialog) {
                    this._GenericFilterDialog.setModel(new JSONModel());
                    this.byId("generalTable").getColumns().forEach(col => col.setProperty("filtered", false));
                    this.byId("colorsTable").getColumns().forEach(col => col.setProperty("filtered", false));
                    this.byId("sizesTable").getColumns().forEach(col => col.setProperty("filtered", false));
                    this.byId("processesTable").getColumns().forEach(col => col.setProperty("filtered", false));
                    this.byId("versionsTable").getColumns().forEach(col => col.setProperty("filtered", false));
                    this.byId("ioTable").getColumns().forEach(col => col.setProperty("filtered", false));
                }

                //selecting version to view
                var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                var version = oData.getProperty('Verno');
                this._iono = ' ';
                that._router.navTo("RouteVersion", {
                    styleno: that._styleNo,
                    sbu: that._sbu,
                    version: version
                });
            },

            onRouteVersion: function (oEvent) {
                if (this.getOwnerComponent().getModel("COLOR_MODEL").getData().items.length === 0) {
                    MessageBox.information("No colors found.")
                }
                else {
                    var oTable = this.getView().byId("versionsTable");
                    var selected = oTable.getSelectedIndices();

                    var oTmpSelected = [];
                    selected.forEach(item => {
                        oTmpSelected.push(oTable.getBinding("rows").aIndices[item])
                    })
                    selected = oTmpSelected;
                    var oTableModel = this.getView().byId("versionsTable").getModel("DataModel");
                    var oData = oTableModel.getData();

                    var verno = oData.results[selected].Verno;

                    if (this._GenericFilterDialog) {
                        this._GenericFilterDialog.setModel(new JSONModel());
                        this.byId("generalTable").getColumns().forEach(col => col.setProperty("filtered", false));
                        this.byId("colorsTable").getColumns().forEach(col => col.setProperty("filtered", false));
                        this.byId("sizesTable").getColumns().forEach(col => col.setProperty("filtered", false));
                        this.byId("processesTable").getColumns().forEach(col => col.setProperty("filtered", false));
                        this.byId("versionsTable").getColumns().forEach(col => col.setProperty("filtered", false));
                        this.byId("ioTable").getColumns().forEach(col => col.setProperty("filtered", false));
                    }

                    that._router.navTo("RouteVersion", {
                        styleno: that._styleNo,
                        sbu: that._sbu,
                        version: verno
                    });
                }
            },

            onCreateNewVersion: async function () {
                const result = await this.lockStyle("X");
                if (result.Type != "S") {
                    MessageBox.warning(result.Message);
                }
                else {
                    //open create new version dialog
                    if (!that._NewVerionDialog) {
                        that._NewVerionDialog = sap.ui.xmlfragment("zui3derp.view.fragments.CreateNewVersion", that);
                        that.getView().addDependent(that._NewVerionDialog);
                    }
                    jQuery.sap.syncStyleClass("sapUiSizeCompact", that.getView(), that._LoadingDialog);
                    that._NewVerionDialog.addStyleClass("sapUiSizeCompact");
                    that._NewVerionDialog.setTitle("Create New Version");
                    that._NewVerionDialog.open();
                    that._copyFrVer = "";
                    sap.ui.getCore().byId("newVersionDesc1").setValue("");
                    sap.ui.getCore().byId("newVersionDesc2").setValue("");                    
                }
            },

            onSaveNewVersion: function () {
                //save info of new versions
                var oModel = this.getOwnerComponent().getModel();
                var me = this;
                var path;

                //get data from new version dialog
                var oDesc1 = sap.ui.getCore().byId("newVersionDesc1").getValue();
                var oDesc2 = sap.ui.getCore().byId("newVersionDesc2").getValue();
                var oCurrent = sap.ui.getCore().byId("newVersionCurrent").getSelected();

                Common.openLoadingDialog(that);

                //build header and payload
                path = "/StyleVersionSet";
                var oEntry = {
                    "Styleno": this._styleNo,
                    "Verno": "",
                    "Desc1": oDesc1,
                    "Desc2": oDesc2,
                    "Currentver": oCurrent
                };
                MessageBox.confirm(this._i18n.getText('ConfirmSave'), {
                    actions: ["Yes", "No"],
                    onClose: function (sAction) {
                        if (sAction === "Yes") {
                            oModel.setHeaders({
                                sbu: this._sbu,
                                copy: this._copyFrVer
                            });
                            //call create method of style version
                            oModel.create(path, oEntry, {
                                method: "POST",
                                success: function (oData, oResponse) {
                                    me.getVersionsTable();
                                    me._NewVerionDialog.close();
                                    Common.closeLoadingDialog(that);
                                    Common.showMessage(me._i18n.getText('t4'));

                                    if (oCurrent) { me.getHeaderData(); }

                                    this.enableOtherTabs("detailPanel");
                                    this.byId("btnHdrEdit").setEnabled(true);
                                    this.byId("btnHdrDelete").setEnabled(true);
                                    this.byId("btnHdrClose").setEnabled(true);
                                    
                                    MessageBox.information(me._i18n.getText('t4'));
                                },
                                error: function (err) {
                                    Common.closeLoadingDialog(that);
                                    //Common.showMessage(me._i18n.getText('t5'));
                                    var errorMsg = JSON.parse(err.responseText).error.message.value;
                                    MessageBox.information(me._i18n.getText('t5') + ": " + errorMsg);
                                }
                            });
                        }
                    }
                });
            },

            setVersionEditMode: async function () {
                const result = await this.lockStyle("X");
                if (result.Type != "S") {
                    MessageBox.warning(result.Message);
                }
                else {
                    //set edit mode of versions table
                    var oJSONModel = new JSONModel();
                    var data = {};
                    this._versionChanged = false;
                    data.editMode = true;
                    oJSONModel.setData(data);
                    this.getView().setModel(oJSONModel, "VersionEditModeModel");

                    this.setControlEditMode("VersionEditModeModel", true);
                    this.disableOtherTabs("detailPanel");
                    this.byId("btnHdrEdit").setEnabled(false);
                    this.byId("btnHdrDelete").setEnabled(false);
                    this.byId("btnHdrClose").setEnabled(false);
                    this.setRowEditMode("versionsTable");
                }
            },

            cancelVersionEdit: function () {
                //confirm cancel of edit versions
                if (this._versionChanged) {
                    if (!this._DiscardVersionChangesDialog) {
                        this._DiscardVersionChangesDialog = sap.ui.xmlfragment("zui3derp.view.fragments.dialog.DiscardVersionChanges", this);
                        this.getView().addDependent(this._DiscardVersionChangesDialog);
                    }
                    jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                    this._DiscardVersionChangesDialog.addStyleClass("sapUiSizeCompact");
                    this._DiscardVersionChangesDialog.open();
                } else {
                    this.closeVersionEdit();
                }
            },

            closeVersionEdit: function () {
                //cancel edit mode, reselect versions data
                var oJSONModel = new JSONModel();
                var data = {};
                that._versionChanged = false;
                that.setChangeStatus(false);
                data.editMode = false;
                oJSONModel.setData(data);
                that.getView().setModel(oJSONModel, "VersionEditModeModel");
                if (that._DiscardVersionChangesDialog) {
                    that._DiscardVersionChangesDialog.close();
                    that.getVersionsTable();
                }
                var oMsgStrip = that.getView().byId('VersionsMessageStrip');
                oMsgStrip.setVisible(false);

                this.setTabReadMode("VersionEditModeModel");
                this.setRowReadMode("versionsTable");
                // this.enableOtherTabs("detailPanel");
                // this.byId("btnHdrEdit").setEnabled(true);
                // this.byId("btnHdrDelete").setEnabled(true);
            },

            onVersionChange: function () {
                //versions change flag
                this._versionChanged = true;
                this.setChangeStatus(true);
            },

            onSaveVersions: function () {
                //save changes to versions table
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("versionsTable").getModel("DataModel");
                var path;

                //initialize message strip
                var oMsgStrip = this.getView().byId('VersionsMessageStrip');
                oMsgStrip.setVisible(false);

                if (!this._versionChanged) { //check if there changes
                    MessageBox.information(this._i18n.getText('t7'));
                } else {
                    MessageBox.confirm(this._i18n.getText('ConfirmSave'), {
                        actions: ["Yes", "No"],
                        onClose: function (sAction) {
                            if (sAction === "Yes") {
                                Common.openLoadingDialog(that);

                                //build header and payload
                                var oData = oTableModel.getData();
                                var oEntry = {
                                    Styleno: this._styleNo,
                                    VerToItems: []
                                }
                                for (var i = 0; i < oData.results.length; i++) {
                                    var verno = this.pad(oData.results[i].Verno);
                                    var item = {
                                        "Styleno": this._styleNo,
                                        "Currentver": oData.results[i].Currentver,
                                        "Verno": verno,
                                        "Desc1": oData.results[i].Desc1,
                                        "Desc2": oData.results[i].Desc2
                                    }
                                    oEntry.VerToItems.push(item);
                                };
                                path = "/VersionSet";
                                oModel.setHeaders({
                                    sbu: this._sbu
                                });
                                //call create deep method of style versions
                                oModel.create(path, oEntry, {
                                    method: "POST",
                                    success: function (oData, oResponse) {
                                        me.getVersionsTable();
                                        Common.closeLoadingDialog(that);
                                        me._versionChanged = false;
                                        me.setChangeStatus(false);
                                        me.setTabReadMode("VersionEditModeModel");
                                        me.setRowReadMode("versionsTable");
                                        //MessageBox.information(me._i18n.getText('t4'));
                                        MessageBox.information(me._i18n.getText('t4'));
                                        // this.enableOtherTabs("detailPanel");
                                        // this.byId("btnHdrEdit").setEnabled(true);
                                        // this.byId("btnHdrDelete").setEnabled(true);
                                    },
                                    error: function (err) {
                                        Common.closeLoadingDialog(that);
                                        // //Common.showMessage(me._i18n.getText('t5'));
                                        var errorMsg = JSON.parse(err.responseText).error.message.value;
                                        // //oMsgStrip.setVisible(true);
                            //             //oMsgStrip.setText(errorMsg);
                                        MessageBox.information(me._i18n.getText('t5') + "\r\n" + errorMsg);
                                    }
                                });
                            }
                        }
                    });
                }
            },

            setVersionCurrent: function (oEvent) {
                //clicking the set version as current during edit mode
                var me = this;
                var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                var version = oData.getProperty('Verno');
                version = this.pad(version, 3);
                var oModel = this.getOwnerComponent().getModel();

                Common.openLoadingDialog(that);

                //set header and payload
                var entitySet = "/StyleVersionSet(Styleno='" + this._styleNo + "',Verno='" + version + "')";
                var oEntry = {
                    Styleno: this._styleNo,
                    Verno: version
                };
                oModel.setHeaders({
                    sbu: this._sbu
                });
                //call the update method of style version
                oModel.update(entitySet, oEntry, {
                    method: "PUT",
                    success: function (data, oResponse) {
                        me.getHeaderData();
                        me.getVersionsTable();
                        Common.closeLoadingDialog(that);
                        Common.showMessage(me._i18n.getText('t4'));
                    },
                    error: function () {
                        Common.closeLoadingDialog(that);
                        Common.showMessage(me._i18n.getText('t5'));
                    }
                });
            },

            onDeleteVersion: function () {
                //confirm delete of selected version items
                this.onDeleteTableItems('versionsTable', 'ConfirmDeleteVersion', this._ConfirmDeleteVersionDialog);
            },

            onConfirmDeleteVersion: function (oEvent) {
                //confirm deletion of version
                var oModel = this.getOwnerComponent().getModel();

                //get selected items to delete
                var oTable = this.getView().byId("versionsTable");
                var oTableModel = oTable.getModel("DataModel");
                var oData = oTableModel.getData();
                var selected = oTable.getSelectedIndices();

                oModel.setUseBatch(true);
                oModel.setDeferredGroups(["group1"]);

                // this._ConfirmDeleteVersionDialog.close();
                oEvent.getSource().getParent().close();

                if (selected.length > 0) {
                    selected.sort((a, b) => -1);

                    //call delete method for each item selected
                    for (var i = 0; i < selected.length; i++) {
                        var verno = oData.results[selected[i]].Verno;
                        verno = this.pad(verno, 3);

                        var entitySet = "/StyleVersionSet(Styleno='" + that._styleNo + "',Verno='" + verno + "')";
                        var oDataIO = this.byId("ioTable").getModel("DataModel").getData().results;

                        if (oDataIO.filter(fItem => (+fItem.VERNO) === (+oData.results[selected[i]].Verno)).length === 0 && !oData.results[selected[i]].Currentver) {
                            oModel.remove(entitySet, {
                                groupId: "group1",
                                changeSetId: "changeSetId1",
                                method: "DELETE",
                                success: function (data, oResponse) { },
                                error: function () { }
                            });

                            oModel.submitChanges({
                                groupId: "group1"
                            });

                            oModel.setRefreshAfterChange(true);
                        }
                        else {
                            selected.splice(i, 1);
                        }
                    }

                    oData.results = oData.results.filter(function (value, index) {
                        return selected.indexOf(index) == -1;
                    })

                    oTableModel.setData(oData);
                    oTable.clearSelection();
                }
            },

            onCopyVersion: async function (oEvent) {
                //get selected items to coy
                var oTable = this.getView().byId("versionsTable");
                var oData = oTable.getModel("DataModel").getData().results;
                var vVersion = "";
                var bProceed = true;

                if (oData.length === 1) {
                    vVersion = oData[0].Verno;                    
                }
                else {
                    var oSelectedIndices = oTable.getSelectedIndices();
                    
                    if (oSelectedIndices.length > 0) {
                        if (oSelectedIndices.length === 1) {
                            vVersion = oData.at(oTable.getBinding("rows").aIndices[oSelectedIndices[0]]).Verno;
                        }
                        else {
                            MessageBox.information("Select only one version to copy from.")
                            bProceed = false;
                        }
                    }
                    else {
                        MessageBox.information("Select version to copy from.")
                        bProceed = false;
                    }
                }

                if (bProceed) {
                    const result = await this.lockStyle("X");

                    if (result.Type != "S") {
                        MessageBox.warning(result.Message);
                    }
                    else {
                        //open create new version dialog
                        if (!that._NewVerionDialog) {
                            that._NewVerionDialog = sap.ui.xmlfragment("zui3derp.view.fragments.CreateNewVersion", that);
                            that.getView().addDependent(that._NewVerionDialog);
                        }
                        jQuery.sap.syncStyleClass("sapUiSizeCompact", that.getView(), that._LoadingDialog);
                        that._NewVerionDialog.addStyleClass("sapUiSizeCompact");
                        that._NewVerionDialog.setTitle("Copy From Version " + vVersion);
                        that._NewVerionDialog.open();
                        that._copyFrVer = vVersion;
                        sap.ui.getCore().byId("newVersionDesc1").setValue("");
                        sap.ui.getCore().byId("newVersionDesc2").setValue("");
                    }
                }
            },

            //******************************************* */
            // Attachments
            //******************************************* */

            appendUploadCollection: function () {
                //set properties and adding the attachments component to the screen
                var oUploadCollection = this.getView().byId('UploadCollection');
                oUploadCollection.attachChange(that.onFileSelected);
                oUploadCollection.setMode(sap.m.ListMode.SingleSelectLeft);
                oUploadCollection.attachBeforeUploadStarts(that.onBeforeUploadStarts);
                oUploadCollection.setMultiple(true);
                //set the odata path of the upload collection
                oUploadCollection.setUploadUrl("/sap/opu/odata/sap/ZGW_3DERP_FILES_SRV/FileSet");
                //attach function when an upload is completed
                oUploadCollection.attachUploadComplete(that.onUploadComplete);

            },

            bindUploadCollection: function () {
                var oUploadCollection = this.getView().byId('UploadCollection');
                //setting the properties of the upload collection and binding
                oUploadCollection.bindItems({
                    path: 'FileModel>/FileSet',
                    filters: [
                        new sap.ui.model.Filter("Styleno", sap.ui.model.FilterOperator.EQ, that._styleNo)
                    ],
                    template: new sap.m.UploadCollectionItem({
                        documentId: "{FileModel>ID}",
                        fileName: "{FileModel>FileName}",
                        url: "/sap/opu/odata/sap/ZGW_3DERP_FILES_SRV/FileSet(guid'{FileModel>ID}')/$value",
                        mimeType: "{FileModel>MIMEType}",
                        enableEdit: false,
                        enableDelete: false,
                        visibleDelete: false,
                        visibleEdit: false,
                        attributes: [
                            new sap.m.ObjectAttribute({ text: "{path: 'FileModel>Date', type: 'sap.ui.model.type.Date', formatOptions: { pattern: 'yyyy/MM/dd' }}" }),
                            new sap.m.ObjectAttribute({ text: "{FileModel>Desc1}" }),
                            new sap.m.ObjectAttribute({ text: "{FileModel>Desc2}" }),
                            new sap.m.ObjectAttribute({ text: "{FileModel>Remarks}" })
                        ]
                    })
                });
            },

            setFilesEditMode: function () {
                //set edit mode to the upload collection
                var oJSONModel = new JSONModel();
                var data = {};
                data.editMode = true;
                oJSONModel.setData(data);
                this.getView().setModel(oJSONModel, "FilesEditModeModel");

                var oUploadCollection = this.getView().byId('UploadCollection');
                oUploadCollection.setUploadButtonInvisible(false);
                oUploadCollection.setMode(sap.m.ListMode.SingleSelectLeft);
            },

            cancelFilesEdit: function () {
                var oJSONModel = new JSONModel();
                var data = {};
                data.editMode = false;
                oJSONModel.setData(data);
                this.getView().setModel(oJSONModel, "FilesEditModeModel");
                //make upload button visible
                var oUploadCollection = this.getView().byId('UploadCollection');
                oUploadCollection.setUploadButtonInvisible(true);
                oUploadCollection.setMode(sap.m.ListMode.None);
            },

            onAddFile: async function () {
                console.log("upload")
                //const result = await this.lockStyle("X");
                // if (result.severity === "error") {
                //     MessageBox.warning(result.message);
                // }
                // else {
                //open the file select dialog
                var oUploadCollection = this.getView().byId('UploadCollection');
                oUploadCollection.openFileDialog();
                //}
            },

            onFileSelected: function () {
                //triggered when file selected
                that.uploadFile();
            },

            uploadFile: function () {
                //open the new file dialog
                if (!this._UploadFileDialog) {
                    this._UploadFileDialog = sap.ui.xmlfragment("zui3derp.view.fragments.UploadFile", this);
                    this.getView().addDependent(this._UploadFileDialog);
                }
                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                this._UploadFileDialog.addStyleClass("sapUiSizeCompact");
                this._UploadFileDialog.open();
            },

            onStartUploadFile: function () {
                //on confirm of upload dialog, start upload of file
                this._UploadFileDialog.close();
                var oUploadCollection = this.getView().byId('UploadCollection');
                var cFiles = oUploadCollection.getItems().length;
                if (cFiles > 0) {
                    oUploadCollection.upload();
                }
                else {
                    console.log("cancel")
                }
            },

            onBeforeUploadStarts: function (oEvent) {
                //setting the HTTP headers for additional information

                //SBU
                var oStylenoParam = new sap.m.UploadCollectionParameter({
                    name: "sbu",
                    value: that._sbu
                });
                oEvent.getParameters().addHeaderParameter(oStylenoParam);

                //style no
                var oStylenoParam = new sap.m.UploadCollectionParameter({
                    name: "styleno",
                    value: that._styleNo
                });
                oEvent.getParameters().addHeaderParameter(oStylenoParam);

                //file description 1
                var fileDesc1 = sap.ui.getCore().byId("FileDesc1");
                var oFileDesc1Param = new sap.m.UploadCollectionParameter({
                    name: "desc1",
                    value: fileDesc1.getValue()
                });
                oEvent.getParameters().addHeaderParameter(oFileDesc1Param);
                fileDesc1.setValue('');

                //file description 2
                var fileDesc2 = sap.ui.getCore().byId("FileDesc2");
                var oFileDesc2Param = new sap.m.UploadCollectionParameter({
                    name: "desc2",
                    value: fileDesc2.getValue()
                });
                oEvent.getParameters().addHeaderParameter(oFileDesc2Param);
                fileDesc2.setValue('');

                //remarks
                var fileRemarks = sap.ui.getCore().byId("FileRemarks");
                var oFileRemarksParam = new sap.m.UploadCollectionParameter({
                    name: "remarks",
                    value: fileRemarks.getValue()
                });
                oEvent.getParameters().addHeaderParameter(oFileRemarksParam);
                fileRemarks.setValue('');

                //filename selected
                var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                    name: "slug",
                    value: oEvent.getParameter("fileName")
                });
                oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);

                var oModel = that.getView().getModel("FileModel");
                oModel.refreshSecurityToken();

                //add the HTTP headers
                var oHeaders = oModel.oHeaders;
                var sToken = oHeaders['x-csrf-token'];

                var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                    name: "x-csrf-token",
                    value: sToken
                });
                oEvent.getParameters().addHeaderParameter(oCustomerHeaderToken);
            },

            onUploadComplete: function () {
                //on upload complete refresh the list
                that.getView().getModel("FileModel").refresh();
                var oUploadCollection = that.getView().byId('UploadCollection');
                oUploadCollection.removeAllItems();
            },

            onDeleteFile: function () {
                //confirm delete selected file dialog
                var oUploadCollection = this.getView().byId('UploadCollection');
                var selected = oUploadCollection.getSelectedItems();

                if (selected.length > 0) {
                    if (!this._ConfirmDeleteFileDialog) {
                        this._ConfirmDeleteFileDialog = sap.ui.xmlfragment("zui3derp.view.fragments.dialog.ConfirmDeleteFile", this);
                        this.getView().addDependent(this._ConfirmDeleteFileDialog);
                    }
                    jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                    this._ConfirmDeleteFileDialog.addStyleClass("sapUiSizeCompact");
                    this._ConfirmDeleteFileDialog.open();
                } else {
                    Common.showMessage(this._i18n.getText('t10'));
                }
            },

            onConfirmDeleteFile: function () {
                //delete selected file, call delete method of file odata service
                that._ConfirmDeleteFileDialog.close();
                var oUploadCollection = this.getView().byId('UploadCollection');
                var sPath = oUploadCollection.getSelectedItems()[0].getBindingContext('FileModel').sPath;
                var oModel = that.getView().getModel("FileModel");
                oModel.remove(sPath, {
                    success: function (oData, oResponse) {
                        that.getView().getModel("FileModel").refresh();
                    },
                    error: function (err) {
                    }
                });
            },

            onCancelUploadFile: function () {
                //close edit mode, refresh the file list
                that._UploadFileDialog.close();
                var oUploadCollection = this.getView().byId('UploadCollection');
                that.getView().getModel("FileModel").refresh();
                oUploadCollection.removeAllItems();
            },

            //******************************************* */
            // Search Helps
            //******************************************* */

            onSeasonsValueHelp: function (oEvent) {
                //open seasons value help
                TableValueHelp.handleHdrValueHelp(oEvent, this);

                // var sInputValue = oEvent.getSource().getValue();
                // this.inputId = oEvent.getSource().getId(); //get input field id
                // if (!this._seasonsHelpDialog) {
                //     this._seasonsHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.Seasons", this);
                //     this._seasonsHelpDialog.attachSearch(this._seasonsGroupValueHelpSearch);
                //     this.getView().addDependent(this._seasonsHelpDialog);
                // }
                // this._seasonsHelpDialog.open(sInputValue);
            },

            _seasonsGroupValueHelpSearch: function (evt) {
                //search seasons
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Seasoncd", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _seasonsGroupValueHelpClose: function (evt) {
                //on select season
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = this.byId(this.inputId);
                    input.setValue(oSelectedItem.getTitle()); //set input field selected value
                    this.onHeaderChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onStyleCatValueHelp: function (oEvent) {
                //open style category value help
                TableValueHelp.handleHdrValueHelp(oEvent, this);
                
                // var sInputValue = oEvent.getSource().getValue();
                // this.inputId = oEvent.getSource().getId(); //get input field id
                // if (!this._styleCatHelpDialog) {
                //     this._styleCatHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.StyleCat", this);
                //     this.getView().addDependent(this._styleCatHelpDialog);
                // }
                // this._styleCatHelpDialog.open(sInputValue);
            },

            _styleCatValueHelpSearch: function (evt) {
                //search style categories
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Stylcat", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _styleCatValueHelpClose: function (evt) {
                //on select style category
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = this.byId(this.inputId);
                    input.setValue(oSelectedItem.getTitle()); //set input field selected value
                    this.onHeaderChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onProdTypeValueHelp: function (oEvent) {
                //open product type value help
                TableValueHelp.handleHdrValueHelp(oEvent, this);

                // var sInputValue = oEvent.getSource().getValue();
                // this.inputId = oEvent.getSource().getId(); //get input field id
                // if (!this._prodTypeHelpDialog) {
                //     this._prodTypeHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.ProdTypes", this);
                //     this.getView().addDependent(this._prodTypeHelpDialog);
                // }
                // this._prodTypeHelpDialog.open(sInputValue);
            },

            _prodTypeValueHelpSearch: function (evt) {
                //search product types
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("ProdTyp", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _prodTypeValueHelpClose: function (evt) {
                //on select product type
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = this.byId(this.inputId);
                    input.setValue(oSelectedItem.getTitle()); //set input field selected value
                    this.onHeaderChange();

                    //set default UOM
                    const prodTyp = this.getView().getModel("ProdTypeModel").getData();
                    const result = prodTyp.results.filter(item => item.ProdTyp === oSelectedItem.getTitle())
                    this.getView().getModel("headerData").setProperty("/Uom", result[0].Uom);
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onSalesGroupValueHelp: function (oEvent) {
                //open sales group value help
                TableValueHelp.handleHdrValueHelp(oEvent, this);

                // var sInputValue = oEvent.getSource().getValue();
                // this.inputId = oEvent.getSource().getId(); //get input field id
                // if (!this._salesGroupHelpDialog) {
                //     this._salesGroupHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.SalesGroups", this);
                //     this.getView().addDependent(this._salesGroupHelpDialog);
                // }
                // this._salesGroupHelpDialog.open(sInputValue);
            },

            _salesGroupValueHelpSearch: function (evt) {
                //search sales groups
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("SalesGrp", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _salesGroupValueHelpClose: function (evt) {
                //on select sales group
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = this.byId(this.inputId);
                    input.setValue(oSelectedItem.getTitle()); //set input field selected value
                    this.onHeaderChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onCustGroupValueHelp: function (oEvent) {
                //open customer group value help
                TableValueHelp.handleHdrValueHelp(oEvent, this);

                // var sInputValue = oEvent.getSource().getValue();
                // this.inputId = oEvent.getSource().getId(); //get input field id
                // if (!this._custGroupHelpDialog) {
                //     this._custGroupHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.CustGroups", this);
                //     this.getView().addDependent(this._custGroupHelpDialog);
                // }
                // this._custGroupHelpDialog.open(sInputValue);
            },

            _custGroupValueHelpSearch: function (evt) {
                //search customer groups
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("CustGrp", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _custGroupValueHelpClose: function (evt) {
                //on select customer group
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = this.byId(this.inputId);
                    input.setValue(oSelectedItem.getTitle()); //set input field selected value
                    this.onHeaderChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onCustomersValueHelp: function (oEvent) {
                //open customers value help
                TableValueHelp.handleHdrValueHelp(oEvent, this);

                // var sInputValue = oEvent.getSource().getValue();
                // var custGrp = this.getView().byId("CUSTGRP").getValue(); //get customer group value
                // this.inputId = oEvent.getSource().getId(); //get input field id
                // if (!this._customersHelpDialog) {
                //     this._customersHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.Customers", this);
                //     this.getView().addDependent(this._customersHelpDialog);
                // }

                // //filter customers by customer group
                // this._customersHelpDialog.getBinding("items").filter([new Filter(
                //     "Custgrp",
                //     sap.ui.model.FilterOperator.EQ, custGrp
                // )]);
                // this._customersHelpDialog.open(sInputValue);
            },

            _customersValueHelpSearch: function (evt) {
                //search customers
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Custno", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));

                //filter customers by customer group
                var custGrp = this.getView().byId("CUSTGRP").getValue(); //get customer group value
                this._customersHelpDialog.getBinding("items").filter([new Filter(
                    "Custgrp",
                    sap.ui.model.FilterOperator.EQ, custGrp
                )]);
            },

            _customersValueHelpClose: function (evt) {
                //on select customer
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = this.byId(this.inputId);
                    input.setValue(oSelectedItem.getTitle()); //set input field selected customer
                    this.onHeaderChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onSizeGroupValueHelp: function (oEvent) {
                //open size group value help
                TableValueHelp.handleHdrValueHelp(oEvent, this);
                
                // var me = this;
                // var sInputValue = oEvent.getSource().getValue();
                // this.inputId = oEvent.getSource().getId();
                // var oSHModel = this.getOwnerComponent().getModel("SearchHelps");
                // var oView = this.getView();
                // var oJSONModel = new JSONModel();
                
                // oSHModel.read("/SizeGrpSet", {
                //     success: function (oData, oResponse) {
                //         oJSONModel.setData(oData);
                //         oView.setModel(oJSONModel, "SizeGroupModel");
                //         //open size group value help
                //         // if (!me._sizeGroupHelpDialog) {
                //         //     me._sizeGroupHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.SizeGroups", me);
                //         //     me.getView().addDependent(me._sizeGroupHelpDialog);
                //         // }                        
                //     },
                //     error: function (err) { }
                // });
            },

            _sizeGroupValueHelpSearch: function (evt) {
                //search size group value help
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("AttribGrp", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _sizeGroupValueHelpClose: function (evt) {
                //on select size group
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = this.byId(this.inputId);
                    input.setValue(oSelectedItem.getTitle()); //set input field selected size group
                    this.onHeaderChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onUomValueHelp: function (oEvent) {
                //separate function for header form value help
                TableValueHelp.handleHdrValueHelp(oEvent, this);
           
                //temporary comment
                //open uom value help
                 
                // if (!this._uomValueHelpDialog) {
                //     this._uomValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.UoM", this);
                //     this.getView().addDependent(this._uomValueHelpDialog);
                // }
                // this._uomValueHelpDialog.open();                
            },

            _uomValueHelpSearch: function (evt) {
                //search uom
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Valunit", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _uomValueHelpClose: function (evt) {
                //on select uom
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = this.byId("UOM");
                    input.setValue(oSelectedItem.getTitle()); //set input field selected uom
                    this.onHeaderChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onAttrTypesValueHelp: function (oEvent) {
                //open Attribute Types search help dialog
                TableValueHelp.handleTableValueHelp(oEvent, this);

                // var sInputValue = oEvent.getSource().getValue();
                // this.inputId = oEvent.getSource().getId(); //get the id of the input field
                // if (!this._attrTypesValueHelpDialog) {
                //     this._attrTypesValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.AttributeTypes", this);
                //     this.getView().addDependent(this._attrTypesValueHelpDialog);
                // }
                // this._attrTypesValueHelpDialog.open(sInputValue);
            },

            _attrTypesValueHelpSearch: function (evt) {
                //search Attribute Types
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Attribtyp", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _attrTypesValueHelpClose: function (evt) {
                //on select Attribute Types
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = this.byId(this.inputId);
                    input.setValue(oSelectedItem.getTitle()); //set value of input field
                    this.onGeneralAttrChange();

                    var sRowPath = this.byId(this.inputId).getBindingInfo("value").binding.oContext.sPath;
                    this.byId("generalTable").getModel("DataModel").setProperty(sRowPath + "/Valuetyp", oSelectedItem.data('Valuetype'))
    
                    this.setGeneralAttrEditModeControls();
                    console.log(this.byId("generalTable").getModel("DataModel").getData().results);
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onAttrCodesValueHelp: function (oEvent) {
                //open Attribute Codes search help dialog
                var sInputValue = oEvent.getSource().getValue();
                var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                var attrTyp = oData.getProperty('Attribtyp');
                this.inputId = oEvent.getSource().getId(); //get the id of the input field

                //get the id of input field of description and uom
                // var oTable = that.getView().byId("generalTable");
                // var oColumns = oTable.getColumns();
                // for (var i = 0; i < oColumns.length; i++) {
                //     var name = oColumns[i].getName();
                //     if (name === 'DESC1') {
                //         this.descId = oEvent.getSource().getParent().mAggregations.cells[i].getId();
                //         console.log(oEvent.getSource().getParent().mAggregations)
                //     }
                //     if (name === 'UOM') {
                //         this.attribUom = oEvent.getSource().getParent().mAggregations.cells[i].getId();
                //     }
                // }

                for (var i = 0; i < oEvent.getSource().getParent().mAggregations.cells.length; i++) {
                    var oCellCtrlValTyp = "";

                    if (oEvent.getSource().getParent().mAggregations.cells[i].getBindingInfo("value") !== undefined) {
                        oCellCtrlValTyp = "value";
                    }
                    else if (oEvent.getSource().getParent().mAggregations.cells[i].getBindingInfo("text") !== undefined) {
                        oCellCtrlValTyp = "text";
                    }
                    else if (oEvent.getSource().getParent().mAggregations.cells[i].getBindingInfo("selected") !== undefined) {
                        oCellCtrlValTyp = "selected";
                    }

                    if (oEvent.getSource().getParent().mAggregations.cells[i].getBindingInfo(oCellCtrlValTyp).parts[0].path.toUpperCase() === "DESC1") {
                        this.descId = oEvent.getSource().getParent().mAggregations.cells[i].getId();
                    }
                    else if (oEvent.getSource().getParent().mAggregations.cells[i].getBindingInfo(oCellCtrlValTyp).parts[0].path.toUpperCase() === "VALUNIT") {
                        this.attribUom = oEvent.getSource().getParent().mAggregations.cells[i].getId();
                    }
                }

                // //open dialog
                // if (!this._attrCodesValueHelpDialog) {
                //     this._attrCodesValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.AttributeCodes", this);
                //     this.getView().addDependent(this._attrCodesValueHelpDialog);
                // }
                // //filter the attribute codes based on the value of attribute type
                // this._attrCodesValueHelpDialog.getBinding("items").filter([new Filter(
                //     "Attribtyp",
                //     sap.ui.model.FilterOperator.EQ, attrTyp
                // )]);
                // this._attrCodesValueHelpDialog.open(sInputValue);


                var sRowPath = oEvent.getSource().oParent.getBindingContext("DataModel").sPath;
                var vAttribtyp = oEvent.getSource().oParent.oParent.getModel("DataModel").getProperty(sRowPath + "/Attribtyp");
                // var aModelData = this.getView().getModel("AttribCdModel").getData().results.filter(fItem => fItem.Attribtyp === vAttribtyp);
                // var oModelData = {};
                // oModelData["results"] = aModelData;
                // this.getView().setModel(new JSONModel(oModelData), "AttribCodeModel");

                if (this.getView().getModel("AttribCdModel").getData()[vAttribtyp] === undefined) {
                    var aModelData = this.getView().getModel("AttribCdModel").getData().results.filter(fItem => fItem.Attribtyp === vAttribtyp);
                    var oModelData = {};
                    oModelData["results"] = aModelData;
                    this.getView().setModel(new JSONModel(oModelData), "AttribCodeModel");
                    this.getView().getModel("AttribCdModel").setProperty("/" + vAttribtyp, aModelData);
                }
                else {
                    var oModelData = {};
                    oModelData["results"] = this.getView().getModel("AttribCdModel").getData()[vAttribtyp];
                    this.getView().setModel(new JSONModel(oModelData), "AttribCodeModel");
                }

                TableValueHelp.handleTableValueHelp(oEvent, this);

                var oInput = oEvent.getSource();
                // var oSuggestionItems = oInput.getBindingInfo("suggestionItems");
                var oSuggestionItemsTemplate = oInput.getBindingInfo("suggestionItems").template;
                var oKey = "", oText = "", oAddtlText = "";
                var sPath = oInput.getBindingInfo("suggestionItems").path;
                
                if ("/" + vAttribtyp !== sPath) {
                    if (oSuggestionItemsTemplate.getBindingInfo("key") !== undefined) {
                        oKey = oSuggestionItemsTemplate.getBindingInfo("key").parts[0].path;
                    }

                    if (oSuggestionItemsTemplate.getBindingInfo("text") !== undefined) {
                        oText = oSuggestionItemsTemplate.getBindingInfo("text").parts[0].path;
                    }

                    if (oSuggestionItemsTemplate.getBindingInfo("additionalText") !== undefined) {
                        oAddtlText = oSuggestionItemsTemplate.getBindingInfo("additionalText").parts[0].path;
                    }                        

                    oInput.bindAggregation("suggestionItems", {
                        path: "AttribCdModel>/" + vAttribtyp,
                        length: 10000,
                        template: new sap.ui.core.ListItem({
                            key: "{AttribCdModel>" + oKey + "}",
                            text: "{AttribCdModel>" + oText + "}",
                            additionalText: oAddtlText !== "" ? "{AttribCdModel>" + oAddtlText + "}" : oAddtlText,
                        }),
                        templateShareable: false
                    });   
                }
            },

            _attrCodesValueHelpSearch: function (evt) {
                //attribute codes search
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Attribcd", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _attrCodesValueHelpClose: function (evt) {
                //on select of attribute code
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = this.byId(this.inputId);
                    input.setValue(oSelectedItem.getTitle()); //set the value to selected attribute code
                    this.onGeneralAttrChange();
                    var descText = this.byId(this.descId);
                    descText.setText(oSelectedItem.getDescription()); //set the description

                    var iRowIndex = +this.byId(this.inputId).getBindingInfo("value").binding.oContext.sPath.replace("/results/","");
                    if (this.byId("generalTable").getContextByIndex(iRowIndex).getProperty("Valuetyp").toUpperCase() === "NUMVALUE") {
                        var uom = oSelectedItem.data('Uom');
                        var attribUom = this.byId(this.attribUom);
                        attribUom.setValue(uom); //set the uom
                    }
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onProcessesValueHelp: function (oEvent) {
                //open process code value help
                TableValueHelp.handleTableValueHelp(oEvent, this);

                // var sInputValue = oEvent.getSource().getValue();
                // this.inputId = oEvent.getSource().getId(); //get the input field id
                // if (!this._processesValueHelpDialog) {
                //     this._processesValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.Processes", this);
                //     this.getView().addDependent(this._processesValueHelpDialog);
                // }
                // this._processesValueHelpDialog.open(sInputValue);
            },

            _processesValueHelpSearch: function (evt) {
                //search process code
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("ProcessCd", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _processesValueHelpClose: function (evt) {
                //on select process code
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = this.byId(this.inputId);
                    input.setValue(oSelectedItem.getTitle()); //set selected value of input field
                    this.onProcessChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onVASTypeValueHelp: function (oEvent) {
                //open VAS types value help                
                // var sInputValue = oEvent.getSource().getValue();
                // this.inputId = oEvent.getSource().getId(); //get the input field id
                // var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                // var ProcessCd = oData.getProperty('Processcd'); //get the selected process code

                // if (!this._VASTypeValueHelpDialog) {
                //     this._VASTypeValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.VASTypes", this);
                //     this.getView().addDependent(this._VASTypeValueHelpDialog);
                // }
                // //filter the items by process code selected
                // this._VASTypeValueHelpDialog.getBinding("items").filter([new Filter(
                //     "Vasproc",
                //     sap.ui.model.FilterOperator.EQ, ProcessCd
                // )]);
                // this._VASTypeValueHelpDialog.open(sInputValue);

                var sRowPath = oEvent.getSource().oParent.getBindingContext("DataModel").sPath;
                var vProcesscd = oEvent.getSource().oParent.oParent.getModel("DataModel").getProperty(sRowPath + "/Processcd");
                // var aModelData = this.getView().getModel("VASTypeModel").getData().results.filter(fItem => fItem.Vasproc === vProcesscd);
                // var oModelData = {};
                // oModelData["results"] = aModelData;
                // this.getView().setModel(new JSONModel(oModelData), "VASTypModel");                
                
                if (this.getView().getModel("VASTypeModel").getData()[vProcesscd] === undefined) {
                    var aModelData = this.getView().getModel("VASTypeModel").getData().results.filter(fItem => fItem.Vasproc === vProcesscd);
                    var oModelData = {};
                    oModelData["results"] = aModelData;
                    this.getView().setModel(new JSONModel(oModelData), "VASTypModel");
                    this.getView().getModel("VASTypeModel").setProperty("/" + vProcesscd, aModelData);
                }
                else {
                    var oModelData = {};
                    oModelData["results"] = this.getView().getModel("VASTypeModel").getData()[vProcesscd];
                    this.getView().setModel(new JSONModel(oModelData), "VASTypModel");
                }

                TableValueHelp.handleTableValueHelp(oEvent, this);

                var oInput = oEvent.getSource();
                // var oSuggestionItems = oInput.getBindingInfo("suggestionItems");
                var oSuggestionItemsTemplate = oInput.getBindingInfo("suggestionItems").template;
                var oKey = "", oText = "", oAddtlText = "";
                var sPath = oInput.getBindingInfo("suggestionItems").path;
                
                if ("/" + vProcesscd !== sPath) {
                    if (oSuggestionItemsTemplate.getBindingInfo("key") !== undefined) {
                        oKey = oSuggestionItemsTemplate.getBindingInfo("key").parts[0].path;
                    }

                    if (oSuggestionItemsTemplate.getBindingInfo("text") !== undefined) {
                        oText = oSuggestionItemsTemplate.getBindingInfo("text").parts[0].path;
                    }

                    if (oSuggestionItemsTemplate.getBindingInfo("additionalText") !== undefined) {
                        oAddtlText = oSuggestionItemsTemplate.getBindingInfo("additionalText").parts[0].path;
                    }

                    oInput.bindAggregation("suggestionItems", {
                        path: "VASTypeModel>/" + vProcesscd,
                        length: 10000,
                        template: new sap.ui.core.ListItem({
                            key: "{VASTypeModel>" + oKey + "}",
                            text: "{VASTypeModel>" + oText + "}",
                            additionalText: oAddtlText !== "" ? "{VASTypeModel>" + oAddtlText + "}" : oAddtlText,
                        }),
                        templateShareable: false
                    });
                }
            },

            _VASTypesValueHelpSearch: function (evt) {
                //search VAS types
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Processcd", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _VASTypesValueHelpClose: function (evt) {
                //on select VAS types
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = this.byId(this.inputId);
                    input.setValue(oSelectedItem.getTitle()); //set input field selected value
                    this.onProcessChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onProcessAttrTypesValueHelp: function (oEvent) {
                //open process attributes value help
                TableValueHelp.handleTableValueHelp(oEvent, this);

                // var sInputValue = oEvent.getSource().getValue();
                // this.inputId = oEvent.getSource().getId(); //get input field id
                // if (!this._processAttrTypesValueHelpDialog) {
                //     this._processAttrTypesValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.ProcessAttributeTypes", this);
                //     this.getView().addDependent(this._processAttrTypesValueHelpDialog);
                // }
                // this._processAttrTypesValueHelpDialog.open(sInputValue);
            },

            _processAttrTypesValueHelpSearch: function (evt) {
                //search process attribute types
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Attribtyp", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _processAttrTypesValueHelpClose: function (evt) {
                //on select process attribute type
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = this.byId(this.inputId);
                    input.setValue(oSelectedItem.getTitle()); //set input field selected value
                    this.onProcessChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onProcessAttrCodesValueHelp: function (oEvent) {
                //open process attribute codes value help
                // var sInputValue = oEvent.getSource().getValue();
                // var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                // var attrTyp = oData.getProperty('Attribtyp'); //get select attribute type
                // this.inputId = oEvent.getSource().getId(); //get input field id
                // if (!this._processAttrCodesValueHelpDialog) {
                //     this._processAttrCodesValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.ProcessAttributeCodes", this);
                //     this.getView().addDependent(this._processAttrCodesValueHelpDialog);
                // }
                // //filter attribute codes by attribute type
                // this._processAttrCodesValueHelpDialog.getBinding("items").filter([new Filter(
                //     "Attribtype",
                //     sap.ui.model.FilterOperator.EQ, attrTyp
                // )]);
                // this._processAttrCodesValueHelpDialog.open(sInputValue);

                var sRowPath = oEvent.getSource().oParent.getBindingContext("DataModel").sPath;
                var vAttribtyp = oEvent.getSource().oParent.oParent.getModel("DataModel").getProperty(sRowPath + "/Attribtyp");
                // var aModelData = this.getView().getModel("ProcessAttribCodeModel").getData().results.filter(fItem => fItem.Attribtype === vAttribtyp);
                // var oModelData = {};
                // oModelData["results"] = aModelData;
                // this.getView().setModel(new JSONModel(oModelData), "ProcessAttribCdModel");
                        
                if (this.getView().getModel("ProcessAttribCodeModel").getData()[vAttribtyp] === undefined) {
                    var aModelData = this.getView().getModel("ProcessAttribCodeModel").getData().results.filter(fItem => fItem.Attribtype === vAttribtyp);
                    var oModelData = {};
                    oModelData["results"] = aModelData;
                    this.getView().setModel(new JSONModel(oModelData), "ProcessAttribCdModel");
                    this.getView().getModel("ProcessAttribCodeModel").setProperty("/" + vAttribtyp, aModelData);
                }
                else {
                    var oModelData = {};
                    oModelData["results"] = this.getView().getModel("ProcessAttribCodeModel").getData()[vAttribtyp];
                    this.getView().setModel(new JSONModel(oModelData), "ProcessAttribCdModel");
                }

                TableValueHelp.handleTableValueHelp(oEvent, this);

                var oInput = oEvent.getSource();
                // var oSuggestionItems = oInput.getBindingInfo("suggestionItems");
                var oSuggestionItemsTemplate = oInput.getBindingInfo("suggestionItems").template;
                var oKey = "", oText = "", oAddtlText = "";
                var sPath = oInput.getBindingInfo("suggestionItems").path;
                
                if ("/" + vAttribtyp !== sPath) {
                    if (oSuggestionItemsTemplate.getBindingInfo("key") !== undefined) {
                        oKey = oSuggestionItemsTemplate.getBindingInfo("key").parts[0].path;
                    }

                    if (oSuggestionItemsTemplate.getBindingInfo("text") !== undefined) {
                        oText = oSuggestionItemsTemplate.getBindingInfo("text").parts[0].path;
                    }

                    if (oSuggestionItemsTemplate.getBindingInfo("additionalText") !== undefined) {
                        oAddtlText = oSuggestionItemsTemplate.getBindingInfo("additionalText").parts[0].path;
                    }

                    oInput.bindAggregation("suggestionItems", {
                        path: "ProcessAttribCodeModel>/" + vAttribtyp,
                        length: 10000,
                        template: new sap.ui.core.ListItem({
                            key: "{ProcessAttribCodeModel>" + oKey + "}",
                            text: "{ProcessAttribCodeModel>" + oText + "}",
                            additionalText: oAddtlText !== "" ? "{ProcessAttribCodeModel>" + oAddtlText + "}" : oAddtlText,
                        }),
                        templateShareable: false
                    });
                }
            },

            _processAttrCodesValueHelpSearch: function (evt) {
                //search process attribute codes
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Attribcd", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _processAttrCodesValueHelpClose: function (evt) {
                //on select attribute code
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = this.byId(this.inputId);
                    input.setValue(oSelectedItem.getTitle()); //set input field selected value
                    this.onProcessChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            handleSuggestion: function(oEvent) {
                var oInput = oEvent.getSource();
                var sInputField = oInput.getBindingInfo("value").parts[0].path;
                var sRowPath = oEvent.getSource().oParent.getBindingContext("DataModel").sPath;
                
                if (oInput.oParent.oParent.getId().indexOf("generalTable") >= 0) {
                    if (sInputField.toUpperCase() === "ATTRIBCD") {
                        var vAttribtyp = oEvent.getSource().oParent.oParent.getModel("DataModel").getProperty(sRowPath + "/Attribtyp");

                        if (this.getView().getModel("AttribCdModel").getData()[vAttribtyp] === undefined) {
                            var aModelData = this.getView().getModel("AttribCdModel").getData().results.filter(fItem => fItem.Attribtyp === vAttribtyp);
                            var oModelData = {};
                            oModelData["results"] = aModelData;
                            this.getView().setModel(new JSONModel(oModelData), "AttribCodeModel");
                            this.getView().getModel("AttribCdModel").setProperty("/" + vAttribtyp, aModelData);
                        }
                        else {
                            var oModelData = {};
                            oModelData["results"] = this.getView().getModel("AttribCdModel").getData()[vAttribtyp];
                            this.getView().setModel(new JSONModel(oModelData), "AttribCodeModel");
                        }
    
                        // var oSuggestionItems = oInput.getBindingInfo("suggestionItems");
                        var oSuggestionItemsTemplate = oInput.getBindingInfo("suggestionItems").template;
                        var oKey = "", oText = "", oAddtlText = "";
                        var sPath = oInput.getBindingInfo("suggestionItems").path;
                        
                        if ("/" + vAttribtyp !== sPath) {
                            if (oSuggestionItemsTemplate.getBindingInfo("key") !== undefined) {
                                oKey = oSuggestionItemsTemplate.getBindingInfo("key").parts[0].path;
                            }
        
                            if (oSuggestionItemsTemplate.getBindingInfo("text") !== undefined) {
                                oText = oSuggestionItemsTemplate.getBindingInfo("text").parts[0].path;
                            }
        
                            if (oSuggestionItemsTemplate.getBindingInfo("additionalText") !== undefined) {
                                oAddtlText = oSuggestionItemsTemplate.getBindingInfo("additionalText").parts[0].path;
                            }                        
        
                            oInput.bindAggregation("suggestionItems", {
                                path: "AttribCdModel>/" + vAttribtyp,
                                length: 10000,
                                template: new sap.ui.core.ListItem({
                                    key: "{AttribCdModel>" + oKey + "}",
                                    text: "{AttribCdModel>" + oText + "}",
                                    additionalText: oAddtlText !== "" ? "{AttribCdModel>" + oAddtlText + "}" : oAddtlText,
                                }),
                                templateShareable: false
                            });   
                        }
                    }
                }
                else if (oInput.oParent.oParent.getId().indexOf("processesTable") >= 0) {
                    if (sInputField.toUpperCase() === "VASTYP") {
                        var vProcesscd = oEvent.getSource().oParent.oParent.getModel("DataModel").getProperty(sRowPath + "/Processcd");
                        
                        if (this.getView().getModel("VASTypeModel").getData()[vProcesscd] === undefined) {
                            var aModelData = this.getView().getModel("VASTypeModel").getData().results.filter(fItem => fItem.Vasproc === vProcesscd);
                            var oModelData = {};
                            oModelData["results"] = aModelData;
                            this.getView().setModel(new JSONModel(oModelData), "VASTypModel");
                            this.getView().getModel("VASTypeModel").setProperty("/" + vProcesscd, aModelData);
                        }
                        else {
                            var oModelData = {};
                            oModelData["results"] = this.getView().getModel("VASTypeModel").getData()[vProcesscd];
                            this.getView().setModel(new JSONModel(oModelData), "VASTypModel");
                        }

                        // var oSuggestionItems = oInput.getBindingInfo("suggestionItems");
                        var oSuggestionItemsTemplate = oInput.getBindingInfo("suggestionItems").template;
                        var oKey = "", oText = "", oAddtlText = "";
                        var sPath = oInput.getBindingInfo("suggestionItems").path;
                        
                        if ("/" + vProcesscd !== sPath) {
                            if (oSuggestionItemsTemplate.getBindingInfo("key") !== undefined) {
                                oKey = oSuggestionItemsTemplate.getBindingInfo("key").parts[0].path;
                            }
        
                            if (oSuggestionItemsTemplate.getBindingInfo("text") !== undefined) {
                                oText = oSuggestionItemsTemplate.getBindingInfo("text").parts[0].path;
                            }
        
                            if (oSuggestionItemsTemplate.getBindingInfo("additionalText") !== undefined) {
                                oAddtlText = oSuggestionItemsTemplate.getBindingInfo("additionalText").parts[0].path;
                            }
        
                            oInput.bindAggregation("suggestionItems", {
                                path: "VASTypeModel>/" + vProcesscd,
                                length: 10000,
                                template: new sap.ui.core.ListItem({
                                    key: "{VASTypeModel>" + oKey + "}",
                                    text: "{VASTypeModel>" + oText + "}",
                                    additionalText: oAddtlText !== "" ? "{VASTypeModel>" + oAddtlText + "}" : oAddtlText,
                                }),
                                templateShareable: false
                            });
                        }
                    }   
                    else if (sInputField.toUpperCase() === "ATTRIBCD") {
                        var vAttribtyp = oEvent.getSource().oParent.oParent.getModel("DataModel").getProperty(sRowPath + "/Attribtyp");
                        
                        if (this.getView().getModel("ProcessAttribCodeModel").getData()[vAttribtyp] === undefined) {
                            var aModelData = this.getView().getModel("ProcessAttribCodeModel").getData().results.filter(fItem => fItem.Attribtype === vAttribtyp);
                            var oModelData = {};
                            oModelData["results"] = aModelData;
                            this.getView().setModel(new JSONModel(oModelData), "ProcessAttribCdModel");
                            this.getView().getModel("ProcessAttribCodeModel").setProperty("/" + vAttribtyp, aModelData);
                        }
                        else {
                            var oModelData = {};
                            oModelData["results"] = this.getView().getModel("ProcessAttribCodeModel").getData()[vAttribtyp];
                            this.getView().setModel(new JSONModel(oModelData), "ProcessAttribCdModel");
                        }

                        // var oSuggestionItems = oInput.getBindingInfo("suggestionItems");
                        var oSuggestionItemsTemplate = oInput.getBindingInfo("suggestionItems").template;
                        var oKey = "", oText = "", oAddtlText = "";
                        var sPath = oInput.getBindingInfo("suggestionItems").path;
                        
                        if ("/" + vAttribtyp !== sPath) {
                            if (oSuggestionItemsTemplate.getBindingInfo("key") !== undefined) {
                                oKey = oSuggestionItemsTemplate.getBindingInfo("key").parts[0].path;
                            }
        
                            if (oSuggestionItemsTemplate.getBindingInfo("text") !== undefined) {
                                oText = oSuggestionItemsTemplate.getBindingInfo("text").parts[0].path;
                            }
        
                            if (oSuggestionItemsTemplate.getBindingInfo("additionalText") !== undefined) {
                                oAddtlText = oSuggestionItemsTemplate.getBindingInfo("additionalText").parts[0].path;
                            }
        
                            oInput.bindAggregation("suggestionItems", {
                                path: "ProcessAttribCodeModel>/" + vAttribtyp,
                                length: 10000,
                                template: new sap.ui.core.ListItem({
                                    key: "{ProcessAttribCodeModel>" + oKey + "}",
                                    text: "{ProcessAttribCodeModel>" + oText + "}",
                                    additionalText: oAddtlText !== "" ? "{ProcessAttribCodeModel>" + oAddtlText + "}" : oAddtlText,
                                }),
                                templateShareable: false
                            });
                        }
                    } 
                }
            },

            //******************************************* */
            // Common Functions
            //******************************************* */

            addLine: async function (oEvent) {
                if (this._dataMode === "NEW") {
                    this.addAnotherLine(oEvent);
                }
                else {
                    //adding lines to tables via model
                    this._dataMode = "NEW";
                    var oButton = oEvent.getSource();
                    var tabName = oButton.data('TableName')
                    var oTable = this.getView().byId(tabName);
                    var oModel = oTable.getModel("DataModel");
                    var oData = oModel.getProperty('/results');
                    oData.forEach(item => item.ACTIVE = "");
                    var aNewRow = [];
                    var length = oData.length;

                    if (tabName === "generalTable") {
                        aNewRow = [{
                            NEW: true, 
                            ACTIVE: "X",
                            Attribcd: "",
                            Attribtyp: "",
                            Attribval: "",
                            Casverind: false,
                            Desc1: "",
                            Valuetyp: "",
                            Valunit: ""
                        }];
                    }
                    else if (tabName === "colorsTable") {
                        var lastSeqno = 0;

                        if (length > 0) {
                            lastSeqno = Math.max.apply(Math, oData.map(function(o) { return parseInt(o.Sortseq); }));
                        }
                        
                        lastSeqno++;
                        
                        var seqno = lastSeqno.toString();

                        aNewRow = [{
                            NEW: true, 
                            ACTIVE: "X",
                            Sortseq: seqno
                        }];
                    }
                    else {
                        aNewRow = [{NEW: true, ACTIVE: "X"}];
                    }
                    
                    var aDataAfterChange = aNewRow.concat(oData);
                    oModel.setProperty('/results', aDataAfterChange);
                    // oData.push({NEW: true});
                    // oTable.getBinding("rows").refresh();
                    //oTable.setVisibleRowCount(oData.length);

                    //const result = await this.lockStyle("X");
                    //if (result.Type != "S") {
                    //    MessageBox.warning(result.Message);
                    //}
                    //else {
                        if (tabName === "generalTable") {
                            this.setGeneralAttrEditMode();
                            this.onGeneralAttrChange();
                        } else if (tabName === "colorsTable") {
                            this.setColorCreateMode();
                            this.onColorChange();
                        } else if (tabName === "processesTable") {
                            console.log("add process");
                            this.setProcessEditMode();
                            this.onProcessChange();
                        }
                    //}
                }
            },

            addAnotherLine: function (oEvent) {
                //adding lines to tables via model
                var oButton = oEvent.getSource();
                var tabName = oButton.data('TableName')
                var oTable = this.getView().byId(tabName);
                var oModel = oTable.getModel("DataModel");
                var oData = oModel.getProperty('/results');
                oData.forEach(item => item.ACTIVE = "");
                var aNewRow = [];
                var length = oData.length;

                if (tabName === "generalTable") {
                    aNewRow = [{
                        NEW: true, 
                        ACTIVE: "X",
                        Attribcd: "",
                        Attribtyp: "",
                        Attribval: "",
                        Casverind: false,
                        Desc1: "",
                        Valuetyp: "",
                        Valunit: ""
                    }];
                }
                else if (tabName === "colorsTable") {
                    var lastSeqno = 0;

                    if (length > 0) {
                        lastSeqno = Math.max.apply(Math, oData.map(function(o) { return parseInt(o.Sortseq); }));
                    }
                    
                    lastSeqno++;
                    
                    var seqno = lastSeqno.toString();

                    aNewRow = [{
                        NEW: true, 
                        ACTIVE: "X",
                        Sortseq: seqno
                    }];
                }
                else {
                    aNewRow = [{NEW: true, ACTIVE: "X"}];
                }
                
                var aDataAfterChange = aNewRow.concat(oData);

                oModel.setProperty('/results', aDataAfterChange);
                // oTable.getBinding("rows").refresh();
               
                if (tabName === "generalTable") {
                    this.setGeneralAttrEditModeControls();
                    this.byId("btnGenAttrRemoveRow").setVisible(true);
                } else if (tabName === "colorsTable") {
                    this.setColorEditModeControls();
                    this.byId("btnColorRemoveRow").setVisible(true);
                } else if (tabName === "processesTable") {
                    this.setProcessEditModeControls();
                    this.byId("btnProcessRemoveRow").setVisible(true);
                }
            },

            addProcessLine: function (oEvent) {
                //adding lines to process table via model, with sequence increment logic
                var oButton = oEvent.getSource();
                var tabName = oButton.data('TableName')
                var oTable = this.getView().byId(tabName);
                var oModel = oTable.getModel("DataModel");
                var oData = oModel.getProperty('/results');
                var length = oData.length;
                var lastSeqno = 0;
                if (length > 0) {
                    lastSeqno = parseInt(oData[length - 1].Seqno);
                }
                lastSeqno++;
                var seqno = lastSeqno.toString();
                oData.push({
                    "Seqno": seqno
                });
                oTable.getBinding("rows").refresh();
                //oTable.setVisibleRowCount(oData.length);

                this.setProcessEditMode();
                this.onProcessChange();
            },

            removeNewLine: function(oEvent) {
                var oButton = oEvent.getSource();
                var tabName = oButton.data('TableName')
                var oTable = this.getView().byId(tabName);
                var oModel = oTable.getModel("DataModel");
                var oData = oModel.getProperty('/results');
                var oNewData = oData.filter(fItem => fItem.NEW === true);
                var aSelIndices = oTable.getSelectedIndices();
                var oTmpSelectedIndices = [];
                var bProceed = false;

                if (oNewData.length > 0) {
                    if (aSelIndices.length > 0) {
                        aSelIndices.forEach(item => {
                            oTmpSelectedIndices.push(oTable.getBinding("rows").aIndices[item])
                        })
        
                        aSelIndices = oTmpSelectedIndices;       
                        aSelIndices.sort((a,b) => (a < b ? 1 : -1));

                        aSelIndices.forEach((item, index) => {
                            if (oData.at(item).NEW) {
                                var idxToRemove = oData.indexOf(oData.at(item));

                                oData.splice(idxToRemove, 1);
                                bProceed = true;
                            }
                        })

                        if (bProceed) {
                            oModel.setProperty('/results', oData);
                            oTable.clearSelection();

                            if (tabName === "generalTable") { this.setGeneralAttrEditModeControls(); }
                            else if (tabName === "colorsTable") { this.setColorEditModeControls(); }
                            else if (tabName === "processesTable") { this.setProcessEditModeControls(); }
                        }
                        else {
                            MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_SEL_RECORD_TO_REMOVE"])
                        }
                    }  
                    else {
                        var iIndexToActivate = -1;

                        oData.forEach((item, index) => {
                            if (item.ACTIVE === "X") {
                                oData.splice(index, 1);
                                oModel.setProperty('/results', oData);

                                if (tabName === "generalTable") { this.setGeneralAttrEditModeControls(); }
                                else if (tabName === "colorsTable") { this.setColorEditModeControls(); }
                                else if (tabName === "processesTable") { this.setProcessEditModeControls(); }
                            }
                        })

                        oData.forEach((item, index) => {
                            if (item.NEW && iIndexToActivate === -1) {
                                item.ACTIVE = "X";
                                iIndexToActivate = index;
                            }
                        })
                    }

                    if (oData.filter(fItem => fItem.NEW === true).length === 0) {
                        if (tabName === "generalTable") { this.byId("btnGenAttrRemoveRow").setVisible(false); }
                        else if (tabName === "colorsTable") { this.byId("btnColorRemoveRow").setVisible(false); }
                        else if (tabName === "processesTable") { this.byId("btnProcessRemoveRow").setVisible(false); }
                    }
                }
                else {
                    MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_NO_RECORD_TO_REMOVE"]);
                }
            },

            onDeleteTableItems: async function (oTableName, oFragmentName, oDialog) {
                var oTable = this.getView().byId(oTableName);
                var oTableModel = oTable.getModel("DataModel");
                var oData = oTableModel.getData();                
                var selected = oTable.getSelectedIndices();
                var bProceed = true;
                var noEdit = 0;
                var noEditMsg = "";
                var editMsg = "";

                if (selected.length > 0) {
                    if (oTableName === "colorsTable") {
                        this._bomColors = [];
                        this._bomColors = await this.getBOMCOlor(this);

                        if (this._bomColors.length > 0) {
                            noEditMsg = "Color ";
                            editMsg = "Color ";

                            for (var i = 0; i < selected.length; i++) {
                                if (this._bomColors.filter(fItem => fItem.COLOR === oData.results[selected[i]].Attribcd).length > 0) {
                                    noEdit++;
                                    noEditMsg = noEditMsg + oData.results[selected[i]].Attribcd + ", ";
                                }
                                else { editMsg = editMsg + oData.results[selected[i]].Attribcd + ", "; }
                            }

                            if (selected.length === noEdit) {
                                bProceed = false;
                                MessageBox.information("No record to delete.\r\nSelected color/s already used in BOM.")
                            }
                        }
                    }
                    else if (oTableName === "versionsTable") {
                        var oDataIO = this.byId("ioTable").getModel("DataModel").getData().results;
                        var sMessage = "", sAddtlMessage = "";
                        noEditMsg = "Version ";
                        editMsg = "Version ";

                        for (var i = 0; i < selected.length; i++) {
                            if (oData.results[selected[i]].Currentver) {
                                noEdit++;
                                sAddtlMessage = "Deletion of current version not allowed.\r\n";
                            }
                            else if (oDataIO.filter(fItem => (+fItem.VERNO) === (+oData.results[selected[i]].Verno)).length > 0) {
                                noEdit++;
                                noEditMsg = noEditMsg + oData.results[selected[i]].Verno + ", ";
                                sMessage = "No record to delete.\r\nSelected version/s already used in IO.\r\n"
                            }
                            else { editMsg = editMsg + oData.results[selected[i]].Verno + ", "; }
                        }

                        if (selected.length === noEdit) {
                            bProceed = false;
                            MessageBox.information(sMessage + sAddtlMessage);
                        }
                    }
                    else if (oTableName === "generalTable") {
                        for (var i = 0; i < selected.length; i++) {
                            var vProp = oData.results[selected[i]].Property;
                            var vType = oData.results[selected[i]].Attribtyp;
                            var vCode = oData.results[selected[i]].Attribcd;

                            if (vProp === "M") {
                                noEdit++;
                                noEditMsg += vType + "/" + vCode + ", ";
                            }
                            else {
                                editMsg += vType + "/" + vCode + ", ";
                            }
                        }

                        if (selected.length === noEdit) {
                            bProceed = false;
                            MessageBox.information("No record to delete.\r\nSelected attribute/s are mandatory.")
                        }                            
                    }

                    if (bProceed) {
                        if (!oDialog) {
                            oDialog = sap.ui.xmlfragment("zui3derp.view.fragments.dialog." + oFragmentName, this);
                            this.getView().addDependent(oDialog);
                        }

                        jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                        oDialog.addStyleClass("sapUiSizeCompact");
                        oDialog.open();

                        if (oTableName === "colorsTable" && noEdit > 0 && selected.length !== noEdit) {
                            oDialog.getContent()[0].getContent()[0].setProperty("text", noEditMsg.substring(0, noEditMsg.length - 2) + " already used in BOM.\r\n" + editMsg.substring(0, editMsg.length - 2) + " can be deleted.\r\n" + "Confirm delete color" + editMsg.substring(0, editMsg.length - 2).replace("Color", "") + "?\r\n\r\n");
                        }
                        else if (oTableName === "versionsTable" && noEdit > 0 && selected.length !== noEdit) {
                            if (noEditMsg === "Version ") noEditMsg = sAddtlMessage;
                            else noEditMsg = noEditMsg.substring(0, noEditMsg.length - 2) + " already used in IO.\r\n" + sAddtlMessage;

                            oDialog.getContent()[0].getContent()[0].setProperty("text", noEditMsg + editMsg.substring(0, editMsg.length - 2) + " can be deleted.\r\n" + "Confirm delete version" + editMsg.substring(0, editMsg.length - 2).replace("Version","") + "?\r\n\r\n");
                        }
                        else if (oTableName === "generalTable" && noEdit > 0 && selected.length !== noEdit) {
                            oDialog.getContent()[0].getContent()[0].setProperty("text", "Mandatory attribute " + noEditMsg.substring(0, noEditMsg.length - 2) + " cannot be deleted.\r\nAttribute " + editMsg.substring(0, editMsg.length - 2) + " can be deleted.\r\nConfirm delete " + editMsg.substring(0, editMsg.length - 2) + "?\r\n\r\n");   
                        }
                    }
                } else {
                    MessageBox.information(this._i18n.getText('t8'));
                    // Common.showMessage(this._i18n.getText('t8'))
                }
            },

            onCloseDialog: function (oEvent) {
                oEvent.getSource().getParent().close();
            },

            setTabReadMode: function (editModelName) {
                //set colors table editable
                var oJSONModel = new JSONModel();
                var data = {};
                this._colorChanged = false;
                data.editMode = false;
                oJSONModel.setData(data);
                this.getView().setModel(oJSONModel, editModelName);
                this._dataMode = "READ";

                if (editModelName === "HeaderEditModeModel") {
                    this.setReqField("HeaderEditModeModel", false);
                    this.setControlEditMode("HeaderEditModeModel", false);
                    this.enableOtherTabs("detailPanel");
                    this.setDtlsEnableButton(true);
                    this.byId("btnHdrEdit").setEnabled(true);
                    this.byId("btnHdrDelete").setEnabled(true);
                    this.byId("btnHdrClose").setEnabled(true);
                    //unlock style
                    this.lockStyle("O");
                }
                else if (editModelName === "GenAttrEditModeModel") {
                    var oTable = this.getView().byId("generalTable");

                    oTable.getRows().forEach(row => {
                        row.getCells().forEach(cell => {
                            if (cell.getBindingInfo("value") !== undefined || cell.getBindingInfo("selected") !== undefined) {
                                cell.setProperty("enabled", true);
                            }
                        });
                    })

                    this.setControlEditMode("GenAttrEditModeModel", false);
                    this.enableOtherTabs("detailPanel");
                    this.byId("btnHdrEdit").setEnabled(true);
                    this.byId("btnHdrDelete").setEnabled(true);
                    this.byId("btnHdrClose").setEnabled(true);
                    this.lockStyle("O");

                    //remove required field
                    oTable.getColumns().forEach((col, idx) => {
                       const colProp = col.mProperties.filterProperty;
                       if(colProp == "Attribtyp")
                           col.getLabel().removeStyleClass("sapMLabelRequired");
                   });
                }
                else if (editModelName === "SizeEditModeModel") {
                    this.setControlEditMode("SizeEditModeModel", false);
                    this.enableOtherTabs("detailPanel");
                    this.byId("btnHdrEdit").setEnabled(true);
                    this.byId("btnHdrDelete").setEnabled(true);
                    this.byId("btnHdrClose").setEnabled(true);
                    this.lockStyle("O");
                }
                else if (editModelName === "ProcessEditModeModel") {
                    var oTable = this.getView().byId("processesTable");

                    oTable.getRows().forEach(row => {
                        row.getCells().forEach(cell => {
                            if (cell.getBindingInfo("value") !== undefined || cell.getBindingInfo("selected") !== undefined) {
                                cell.setProperty("enabled", true);
                            }
                        });
                    })

                    this.setControlEditMode("ProcessEditModeModel", false);
                    this.enableOtherTabs("detailPanel");
                    this.byId("btnHdrEdit").setEnabled(true);
                    this.byId("btnHdrDelete").setEnabled(true);
                    this.byId("btnHdrClose").setEnabled(true);
                    this.lockStyle("O");

                    var oTable = this.getView().byId("processesTable");
                    //remove required field
                    oTable.getColumns().forEach((col, idx) => {
                        const colProp = col.mProperties.filterProperty;
                        if(colProp == "Processcd")
                            col.getLabel().removeStyleClass("sapMLabelRequired");
                    });
                }
                else if (editModelName === "VersionEditModeModel") {
                    this.setControlEditMode("VersionEditModeModel", false);
                    this.enableOtherTabs("detailPanel");
                    this.byId("btnHdrEdit").setEnabled(true);
                    this.byId("btnHdrDelete").setEnabled(true);
                    this.byId("btnHdrClose").setEnabled(true);
                    this.lockStyle("O");
                }
                else if (editModelName === "ColorEditModeModel") {
                    var oTable = this.getView().byId("colorsTable");

                    // oTable.getRows().forEach(row => {
                    //     row.getCells().forEach(cell => {
                    //         if (cell.getBindingInfo("value") !== undefined) {
                    //             cell.setProperty("editable", false);
                    //         }
                    //     });
                    // })

                    //remove required fields
                    oTable.getColumns().forEach((col, idx) => {
                        const colProp = col.mProperties.filterProperty;
                        if (colProp == "Desc1" || colProp == "Sortseq")
                            col.getLabel().removeStyleClass("sapMLabelRequired");
                    });

                    oTable.getRows().forEach(row => {
                        row.getCells().forEach(cell => {
                            if (cell.getBindingInfo("value") !== undefined || cell.getBindingInfo("selected") !== undefined) {
                                cell.setProperty("enabled", true);
                            }
                        });
                    })

                    this.byId("btnColorAdd").setVisible(true);
                    this.byId("btnColorRemoveRow").setVisible(false);
                    this.byId("btnColorSave").setVisible(false);
                    this.byId("btnColorCancel").setVisible(false);
                    this.byId("btnColorEdit").setVisible(true);
                    this.byId("btnColorDelete").setVisible(true);
                    this.enableOtherTabs("detailPanel");
                    this.byId("btnHdrEdit").setEnabled(true);
                    this.byId("btnHdrDelete").setEnabled(true);
                    this.byId("btnHdrClose").setEnabled(true);
                    this.lockStyle("O");
                }
            },

            setDtlsEnableButton(pEnable) {
                //General Attribute
                this.byId("btnGenAttrSave").setEnabled(pEnable);
                this.byId("btnGenAttrEdit").setEnabled(pEnable);
                this.byId("btnGenAttrDelete").setEnabled(pEnable);
                this.byId("btnGenAttrAdd").setEnabled(pEnable);
                this.byId("btnGenAttrCancel").setEnabled(pEnable);
                // this.byId("iconGenAttrInfo").setVisible(pEnable);

                //Color
                this.byId("btnColorSave").setEnabled(pEnable);
                this.byId("btnColorEdit").setEnabled(pEnable);
                this.byId("btnColorDelete").setEnabled(pEnable);
                this.byId("btnColorAdd").setEnabled(pEnable);
                this.byId("btnColorCancel").setEnabled(pEnable);

                //Size
                this.byId("btnSizeSave").setEnabled(pEnable);
                this.byId("btnSizeEdit").setEnabled(pEnable);
                this.byId("btnSizeCancel").setEnabled(pEnable);

                //Process
                this.byId("btnProcessSave").setEnabled(pEnable);
                this.byId("btnProcessEdit").setEnabled(pEnable);
                this.byId("btnProcessCancel").setEnabled(pEnable);
                this.byId("btnProcessAdd").setEnabled(pEnable);
                this.byId("btnProcessDelete").setEnabled(pEnable);

                //Version
                this.byId("btnVersionSave").setEnabled(pEnable);
                this.byId("btnVersionEdit").setEnabled(pEnable);
                this.byId("btnVersionDelete").setEnabled(pEnable);
                this.byId("btnVersionCopy").setEnabled(pEnable);
                this.byId("btnVersionAdd").setEnabled(pEnable);
                this.byId("btnVersionCancel").setEnabled(pEnable);

                //Attachment
                this.byId("btnAttachmentDelete").setEnabled(pEnable);
                this.byId("btnAttachmentAdd").setEnabled(pEnable);
            },
            
            enableTabItem: function (tabName, itemName) {
                var oIconTabBar = this.byId(tabName);
                oIconTabBar.getItems().filter(item => item.getProperty("key") === itemName)
                    .forEach(item => item.setProperty("enabled", true));
            },

            disableTabItem: function (tabName, itemName) {
                var oIconTabBar = this.byId(tabName);
                oIconTabBar.getItems().filter(item => item.getProperty("key") === itemName)
                    .forEach(item => item.setProperty("enabled", false));
            },

            setControlEditMode(pModule, pEditMode) {
                if (pEditMode) {
                    if (pModule === "HeaderEditModeModel") {
                        // Header
                        this.byId("btnHdrEdit").setVisible(!pEditMode);
                        this.byId("btnHdrDelete").setVisible(!pEditMode);
                        this.byId("btnHdrClose").setVisible(!pEditMode);

                        this.byId("btnHdrSave").setVisible(pEditMode);
                        this.byId("btnHdrCancel").setVisible(pEditMode);

                        if (this._iono != ' ') {
                            //this.byId("btnHdrApplyIO").setVisible(!pEditMode);
                        }
                    }
                    else if (pModule === "GenAttrEditModeModel") {
                        this.byId("btnGenAttrEdit").setVisible(!pEditMode);
                        this.byId("btnGenAttrDelete").setVisible(!pEditMode);
                        // this.byId("iconGenAttrInfo").setVisible(!pEditMode);

                        if (this._dataMode === "NEW") {
                            this.byId("btnGenAttrAdd").setVisible(pEditMode);
                            this.byId("btnGenAttrRemoveRow").setVisible(pEditMode);
                            this.byId("btnGenAttrInfo").setVisible(!pEditMode);
                        }
                        else {
                            this.byId("btnGenAttrAdd").setVisible(!pEditMode);
                            this.byId("btnGenAttrRemoveRow").setVisible(!pEditMode);
                        }
                                                
                        this.byId("btnGenAttrSave").setVisible(pEditMode);
                        this.byId("btnGenAttrCancel").setVisible(pEditMode);
                    }
                    else if (pModule === "SizeEditModeModel") {
                        this.byId("btnSizeEdit").setVisible(!pEditMode);

                        this.byId("btnSizeSave").setVisible(pEditMode);
                        this.byId("btnSizeCancel").setVisible(pEditMode);
                    }
                    else if (pModule === "ProcessEditModeModel") {
                        this.byId("btnProcessEdit").setVisible(!pEditMode);
                        this.byId("btnProcessDelete").setVisible(!pEditMode);
                        // this.byId("btnProcessAdd").setVisible(!pEditMode);

                        if (this._dataMode === "NEW") {
                            this.byId("btnProcessAdd").setVisible(pEditMode);
                            this.byId("btnProcessRemoveRow").setVisible(pEditMode);
                        }
                        else {
                            this.byId("btnProcessAdd").setVisible(!pEditMode);
                            this.byId("btnProcessRemoveRow").setVisible(!pEditMode);
                        }

                        this.byId("btnProcessSave").setVisible(pEditMode);
                        this.byId("btnProcessCancel").setVisible(pEditMode);
                    }
                    else if (pModule === "VersionEditModeModel") {
                        this.byId("btnVersionEdit").setVisible(!pEditMode);
                        this.byId("btnVersionDelete").setVisible(!pEditMode);
                        this.byId("btnVersionAdd").setVisible(!pEditMode);
                        this.byId("btnVersionCopy").setVisible(!pEditMode); 

                        this.byId("btnVersionSave").setVisible(pEditMode);
                        this.byId("btnVersionCancel").setVisible(pEditMode);
                    }
                }
                else {
                    if (pModule === "HeaderEditModeModel") {
                        // Header
                        this.byId("btnHdrEdit").setVisible(!pEditMode);
                        this.byId("btnHdrDelete").setVisible(!pEditMode);
                        this.byId("btnHdrClose").setVisible(!pEditMode);

                        this.byId("btnHdrSave").setVisible(pEditMode);
                        this.byId("btnHdrCancel").setVisible(pEditMode);
                    }
                    else if (pModule === "GenAttrEditModeModel") {
                        this.byId("btnGenAttrEdit").setVisible(!pEditMode);
                        this.byId("btnGenAttrDelete").setVisible(!pEditMode);
                        this.byId("btnGenAttrAdd").setVisible(!pEditMode);
                        // this.byId("iconGenAttrInfo").setVisible(!pEnable);

                        this.byId("btnGenAttrRemoveRow").setVisible(pEditMode);
                        this.byId("btnGenAttrSave").setVisible(pEditMode);
                        this.byId("btnGenAttrCancel").setVisible(pEditMode);
                    }
                    else if (pModule === "SizeEditModeModel") {
                        this.byId("btnSizeEdit").setVisible(!pEditMode);

                        this.byId("btnSizeSave").setVisible(pEditMode);
                        this.byId("btnSizeCancel").setVisible(pEditMode);
                    }
                    else if (pModule === "ProcessEditModeModel") {
                        this.byId("btnProcessEdit").setVisible(!pEditMode);
                        this.byId("btnProcessDelete").setVisible(!pEditMode);
                        this.byId("btnProcessAdd").setVisible(!pEditMode);

                        this.byId("btnProcessRemoveRow").setVisible(pEditMode);
                        this.byId("btnProcessSave").setVisible(pEditMode);
                        this.byId("btnProcessCancel").setVisible(pEditMode);
                    }
                    else if (pModule === "VersionEditModeModel") {
                        this.byId("btnVersionEdit").setVisible(!pEditMode);
                        this.byId("btnVersionDelete").setVisible(!pEditMode);
                        this.byId("btnVersionAdd").setVisible(!pEditMode);
                        this.byId("btnVersionCopy").setVisible(!pEditMode);

                        this.byId("btnVersionSave").setVisible(pEditMode);
                        this.byId("btnVersionCancel").setVisible(pEditMode);
                    }
                }               
            },

            setControlAppAction(pChange) {
                console.log(pChange, "action")
                if (this._iono != ' ') {
                    if (this._styleNo === Constants.NEW) {
                        //this.byId("btnHdrApplyIO").setVisible(false);
                        this.byId("btnHdrDelete").setVisible(false);
                        this.byId("btnHdrEdit").setVisible(false);
                        this.byId("btnHdrDelete").setVisible(false);
                    }
                    else {
                        this.byId("btnHdrEdit").setVisible(pChange);
                        //this.byId("btnHdrApplyIO").setVisible(pChange);
                        this.byId("btnHdrDelete").setVisible(false);
                    }
                }
                else {
                    if (this._styleNo === Constants.NEW) {
                        this.byId("btnHdrDelete").setVisible(false);
                        this.byId("btnHdrEdit").setVisible(false);
                        this.byId("btnHdrClose").setVisible(false);
                    }
                    else {
                        this.byId("btnHdrEdit").setVisible(pChange);
                        this.byId("btnHdrDelete").setVisible(pChange);
                        this.byId("btnHdrClose").setVisible(pChange);
                        //this.byId("btnHdrApplyIO").setVisible(false);
                    }
                }

                //General Attribute
                this.byId("btnGenAttrEdit").setVisible(pChange);
                this.byId("btnGenAttrDelete").setVisible(pChange);
                this.byId("btnGenAttrAdd").setVisible(pChange);
                // this.byId("iconGenAttrInfo").setVisible(pChange);
                this.byId("btnGenAttrSave").setVisible(false);
                this.byId("btnGenAttrCancel").setVisible(false);

                //Color
                this.byId("btnColorEdit").setVisible(pChange);
                this.byId("btnColorDelete").setVisible(pChange);
                this.byId("btnColorAdd").setVisible(pChange);
                //this.byId("btnColorSave").setVisible(pChange);
                //this.byId("btnColorCancel").setVisible(pChange);

                //Size
                this.byId("btnSizeEdit").setVisible(pChange);
                //this.byId("btnSizeSave").setVisible(pChange);
                //this.byId("btnSizeCancel").setVisible(pChange);

                //Process
                this.byId("btnProcessEdit").setVisible(pChange);
                this.byId("btnProcessAdd").setVisible(pChange);
                this.byId("btnProcessDelete").setVisible(pChange);
                //this.byId("btnProcessSave").setVisible(pChange);
                //this.byId("btnProcessCancel").setVisible(pChange);

                //Version
                this.byId("btnVersionEdit").setVisible(pChange);
                this.byId("btnVersionDelete").setVisible(pChange);
                this.byId("btnVersionAdd").setVisible(pChange);
                this.byId("btnVersionCopy").setVisible(pChange);
                //this.byId("btnVersionSave").setVisible(pChange);
                //this.byId("btnVersionCancel").setVisible(pChange);

                //Attachment
                this.byId("btnAttachmentDelete").setVisible(pChange);
                this.byId("btnAttachmentAdd").setVisible(pChange);

                if (!pChange) {
                    this.getView().byId("UploadCollection").addDelegate({
                        ondragenter: function (oEvent) {
                            oEvent.stopPropagation()
                        },
                        ondragover: function (oEvent) {
                            oEvent.stopPropagation()
                        },
                        ondrop: function (oEvent) {
                            oEvent.stopPropagation()
                        }
                    }, true);
                }

            },

            lockStyle: async function (isLock) {
                //return { "Type":"S", "Message":"Disable Locking"}
                var oModelLock = this.getOwnerComponent().getModel("ZGW_3DERP_LOCK_SRV");

                // var oParamLock = {
                //     StyleNo: this._styleNo,
                //     Lock: isLock === "X" ? "X" : "",
                //     N_ENQ: []
                // }
                var oParamLock = {
                    STYLE_TAB: [{
                        StyleNo: this._styleNo,
                        Lock: isLock === "X" ? "X" : ""
                    }
                    ],
                    Iv_Count: 300,
                    STYLE_MSG: []
                }
                Common.openLoadingDialog(that);
                return new Promise((resolve, reject) => {
                    oModelLock.create("/ZERP_STYLHDR", oParamLock, {
                        method: "POST",
                        success: function (data, oResponse) {
                            console.log("success Lock_ZERP_STYLHDR", data.STYLE_MSG.results[0]);
                            Common.closeLoadingDialog(that);
                            return resolve(data.STYLE_MSG.results[0]);


                        },
                        error: function (err) {
                            var response = JSON.parse(err.responseText);
                            var error = response.error.innererror.errordetails;
                            //var errSeverity = error[0].severity;
                            console.log(error[0]);
                            return resolve(error[0]);
                            // if (errSeverity === "error") {
                            //     MessageBox.warning(error[0].message);
                            //     return  resolve(error[0]);
                            // }
                            // else {
                            //     return resolve(error[0]);
                            // }



                        }
                    });
                });
            },

            closePage: function(){
                if (this._iono != " ") {
                    this.routeTOIO();
                }
                else {
                    if (this._GenericFilterDialog) {
                        this._GenericFilterDialog.setModel(new JSONModel());
                        this.byId("generalTable").getColumns().forEach(col => col.setProperty("filtered", false));
                        this.byId("colorsTable").getColumns().forEach(col => col.setProperty("filtered", false));
                        this.byId("sizesTable").getColumns().forEach(col => col.setProperty("filtered", false));
                        this.byId("processesTable").getColumns().forEach(col => col.setProperty("filtered", false));
                        this.byId("versionsTable").getColumns().forEach(col => col.setProperty("filtered", false));
                        this.byId("ioTable").getColumns().forEach(col => col.setProperty("filtered", false));
                    }

                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("RouteStyles", {}, true);
                }
            },

            disableOtherTabs: function (tabName) {
                var oIconTabBar = this.byId(tabName);
                oIconTabBar.getItems().filter(item => item.getProperty("key") !== oIconTabBar.getSelectedKey())
                    .forEach(item => item.setProperty("enabled", false));
            },

            enableOtherTabs: function (tabName) {
                var oIconTabBar = this.byId(tabName);
                oIconTabBar.getItems().forEach(item => {
                    item.setProperty("enabled", true)
                });

                if (this.byId("colorsTable").getModel("DataModel") !== undefined && this.byId("colorsTable").getModel("DataModel").getData().results.length === 0) { this.disableTabItem("detailPanel", "version"); }
                if (this.byId("sizesTable").getModel("DataModel") !== undefined && this.byId("sizesTable").getModel("DataModel").getData().results.length === 0) { this.disableTabItem("detailPanel", "version"); }
            },

            onRefresh: function (oEvent) {
                var oButton = oEvent.getSource();
                var tabName = oButton.data('TableName')

                if (tabName === "ioTable") {
                    this.getIOs(true);
                }
            },

            onSorted: function(oEvent) {
                var oTable = oEvent.getSource();
                var sTabId = oTable.sId.split("--")[oTable.sId.split("--").length - 1];
                this._sActiveTableId = sTabId;

                if (this._dataMode !== "READ") {
                    if (sTabId === "generalTable") { this.setGeneralAttrEditModeControls(); }
                    else if (sTabId === "colorsTable") { this.setColorEditModeControls(); }
                    else if (sTabId === "processesTable") { this.setProcessEditModeControls(); }
                }
            },

            enableVersionItemTab: function() {
                var oDataColor = [], oDataSize = [];

                if (this.getView().byId("colorsTable").getModel("DataModel").getData().results !== undefined) { oDataColor = this.getView().byId("colorsTable").getModel("DataModel").getData().results }
                if (this.getView().byId("sizesTable").getModel("DataModel") !== undefined) { oDataSize = this.getView().byId("sizesTable").getModel("DataModel").getData().results }
                
                if (oDataColor.length === 0 || oDataSize.length === 0) {
                    this.disableTabItem("detailPanel","version");
                }
                else {
                    this.enableTabItem("detailPanel","version");
                }
            },

            setLocTableColumns(sTabId, oColumns) {
                var me = this;
                var oDDText = this.getView().getModel("ddtext").getData();
                var oTable = this.byId(sTabId);

                oColumns.forEach(col => {
                    if (!(oDDText[col.ColumnLabel] === undefined || oDDText[col.ColumnLabel] === "")) {
                        col.ColumnLabel = oDDText[col.ColumnLabel];
                    }
                })

                this._aColumns[sTabId.replace("Table", "")] = oColumns;

                if (oTable.getModel("DataModel") === undefined) {
                    oTable.setModel(new JSONModel({columns: oColumns}), "DataModel");
                }
                else {
                    oTable.getModel("DataModel").setProperty("/columns", oColumns);
                }

                //bind the dynamic column to the table
                oTable.bindColumns("DataModel>/columns", function (index, context) {
                    var sColumnId = context.getObject().ColumnName;
                    var sColumnLabel = context.getObject().ColumnLabel;
                    var sColumnWidth = context.getObject().ColumnWidth;
                    var sColumnVisible = context.getObject().Visible;
                    var sColumnDataType = context.getObject().DataType;

                    if (sColumnWidth === 0) sColumnWidth = 100;
                    if (sColumnId === "Attribseq" && sTabId === "colorsTable") { sColumnDataType = "STRING" }

                    var oControl;

                    if (sColumnDataType !== "BOOLEAN") {
                        if (sColumnId.toUpperCase() === "CURRENTVER" && sTabId === "versionsTable") {
                            oControl = new sap.tnt.InfoLabel({
                                text: "{= ${DataModel>Currentver} === true ? 'Current' : ' ' }",
                                colorScheme: "{= ${DataModel>Currentver} === true ? 8 : 7 }",
                                displayOnly: true,
                                tooltip: "{= ${DataModel>Currentver} === true ? 'Current' : ' ' }",
                                visible: "{DataModel>Currentver}"
                            })
                        }
                        else {
                            oControl = new sap.m.Text({
                                wrapping: false,
                                tooltip: sColumnDataType === "BOOLEAN" ? "" : "{DataModel>" + sColumnId + "}"
                            })
        
                            if (context.getObject().TextFormatMode && context.getObject().TextFormatMode === "ValueKey") {
                                var rscPath = context.getObject().ValueHelp.items.path;
                                var rscKey = context.getObject().ValueHelp.items.value;
                                var rscValue = context.getObject().ValueHelp.items.text;
        
                                oControl.bindText({  
                                    parts: [  
                                        { path: "DataModel>" + sColumnId }
                                    ],  
                                    formatter: function(sColumnId) {
                                        var oValue = me.getView().getModel(rscPath).getData().results.filter(v => v[rscKey] === sColumnId);
        
                                        if (oValue && oValue.length > 0) {
                                            return oValue[0][rscValue] + " (" + sColumnId + ")";
                                        }
                                        else return sColumnId;
                                    }
                                });
                            }
                            else {
                                oControl.bindText({  
                                    parts: [  
                                        { path: "DataModel>" + sColumnId }
                                    ]
                                });    
                            }
                        }
                    }
                    else {
                        oControl = new sap.m.CheckBox({                           
                            selected: "{DataModel>" + sColumnId + "}", 
                            wrapping: false,
                            editable: false
                        })
                    }

                    return new sap.ui.table.Column({
                        name: sColumnLabel,
                        id: sTabId.replace("Tab", "") + "Col" + sColumnId,
                        label: new sap.m.Text({text: sColumnLabel}), 
                        template: oControl,
                        width: sColumnWidth + 'px',
                        sortProperty: sColumnId,
                        autoResizable: true,
                        visible: sColumnVisible,                       
                        hAlign: sColumnDataType === "NUMBER" ? "End" : sColumnDataType === "BOOLEAN" ? "Center" : "Begin"
                    });
                });
            },

            setRowEditMode(sTabId) {
                var oTable = this.byId(sTabId);
                var changeFunction, liveChangeFunction, inputValueHelpChangeFunction, inputValueHelpLiveChangeFunction;
                var valueHelpRequestFunction;

                if (sTabId === "colorsTable") { 
                    changeFunction = this.onColorChange.bind(this);
                    liveChangeFunction = this.onColorChange.bind(this);
                    inputValueHelpChangeFunction = this.onColorChange.bind(this);
                    inputValueHelpLiveChangeFunction = this.onColorChange.bind(this);
                }
                else if (sTabId === "processesTable") { 
                    changeFunction = this.onProcessChange.bind(this);
                    liveChangeFunction = this.onProcessChange.bind(this);
                    inputValueHelpChangeFunction = this.onProcessInputChange.bind(this);
                    inputValueHelpLiveChangeFunction = this.onProcessChange.bind(this);
                }
                else if (sTabId === "generalTable") { 
                    changeFunction = this.onGeneralAttrChange.bind(this);
                    liveChangeFunction = this.onGeneralAttrChange.bind(this);
                    inputValueHelpChangeFunction = this.onGeneralAttrChange.bind(this);
                    inputValueHelpLiveChangeFunction = this.onGeneralAttrChange.bind(this);
                }
                else if (sTabId === "versionsTable") { 
                    changeFunction = this.onVersionChange.bind(this);
                    liveChangeFunction = this.onVersionChange.bind(this);
                    inputValueHelpChangeFunction = this.onVersionChange.bind(this);
                    inputValueHelpLiveChangeFunction = this.onVersionChange.bind(this);
                }

                oTable.getColumns().forEach((col, idx) => {
                    var sColName = "";
                    var oValueHelp = false;

                    if (col.mAggregations.template.mBindingInfos.text !== undefined) {
                        sColName = col.mAggregations.template.mBindingInfos.text.parts[0].path;
                    }
                    else if (col.mAggregations.template.mBindingInfos.selected !== undefined) {
                        sColName = col.mAggregations.template.mBindingInfos.selected.parts[0].path;
                    }

                    this._aColumns[sTabId.replace("Table","")].filter(item => item.ColumnName === sColName)
                        .forEach(ci => {
                            if (ci.Editable.toString().toUpperCase() !== "FALSE") {
                                if (ci.ValueHelp !== undefined) oValueHelp = ci.ValueHelp["show"];

                                if (oValueHelp) {
                                    var bValueFormatter = false;
                                    var sSuggestItemText = ci.ValueHelp["SuggestionItems"].text;
                                    var sSuggestItemAddtlText = ci.ValueHelp["SuggestionItems"].additionalText !== undefined ? ci.ValueHelp["SuggestionItems"].additionalText : '';                                    
                                    var sTextFormatMode = "Key";

                                    if (ci.TextFormatMode && ci.TextFormatMode !== "" && ci.TextFormatMode !== "Key" && ci.ValueHelp["items"].value !== ci.ValueHelp["items"].text) {
                                        sTextFormatMode = ci.TextFormatMode;
                                        bValueFormatter = true;

                                        if (ci.ValueHelp["SuggestionItems"].additionalText && ci.ValueHelp["SuggestionItems"].text !== ci.ValueHelp["SuggestionItems"].additionalText) {
                                            if (sTextFormatMode === "ValueKey" || sTextFormatMode === "Value") {
                                                sSuggestItemText = ci.ValueHelp["SuggestionItems"].additionalText;
                                                sSuggestItemAddtlText = ci.ValueHelp["SuggestionItems"].text;
                                            }
                                        }
                                    }
                                    
                                    if (sTabId === "processesTable") {
                                        if (sColName.toUpperCase() === "PROCESSCD") {
                                            valueHelpRequestFunction = this.onProcessesValueHelp.bind(this);
                                        }
                                        else if (sColName.toUpperCase() === "VASTYP") {
                                            valueHelpRequestFunction = this.onVASTypeValueHelp.bind(this);
                                        }
                                    }
                                    else if (sTabId === "generalTable") {
                                        if (sColName.toUpperCase() === "ATTRIBTYP") {
                                            valueHelpRequestFunction = this.onAttrTypesValueHelp.bind(this);
                                        }
                                        else if (sColName.toUpperCase() === "ATTRIBCD") {
                                            valueHelpRequestFunction = this.onAttrCodesValueHelp.bind(this);
                                        }
                                    }

                                    var oInput = new sap.m.Input({
                                        type: "Text",
                                        showValueHelp: true,
                                        valueHelpRequest: valueHelpRequestFunction,
                                        showSuggestion: true,
                                        maxSuggestionWidth: ci.ValueHelp["SuggestionItems"].additionalText !== undefined ? ci.ValueHelp["SuggestionItems"].maxSuggestionWidth : "1px",
                                        suggestionItems: {
                                            path: ci.ValueHelp["SuggestionItems"].path,
                                            length: 10000,
                                            template: new sap.ui.core.ListItem({
                                                key: ci.ValueHelp["SuggestionItems"].text,
                                                text: sSuggestItemText,
                                                additionalText: sSuggestItemAddtlText,
                                            }),
                                            templateShareable: false
                                        },
                                        change: inputValueHelpChangeFunction,
                                        liveChange: inputValueHelpLiveChangeFunction
                                    })

                                    if (bValueFormatter) {
                                        oInput.setProperty("textFormatMode", sTextFormatMode)

                                        oInput.bindValue({  
                                            parts: [{ path: "DataModel>" + sColName }, { value: ci.ValueHelp["items"].path }, { value: ci.ValueHelp["items"].value }, { value: ci.ValueHelp["items"].text }, { value: sTextFormatMode }],
                                            formatter: this.formatTableValueHelp.bind(this)
                                        });
                                    }
                                    else {
                                        oInput.bindValue({  
                                            parts: [  
                                                { path: "DataModel>" + sColName }
                                            ]
                                        });
                                    }

                                    col.setTemplate(oInput);
                                }
                                else if (ci.DataType === "DATETIME") {
                                    col.setTemplate(new sap.m.DatePicker({
                                        value: "{path: 'DataModel>" + ci.ColumnName + "', mandatory: '" + ci.Mandatory + "'}",
                                        displayFormat: "MM/dd/yyyy",
                                        valueFormat: "MM/dd/yyyy",
                                        change: changeFunction,
                                        liveChange: liveChangeFunction
                                    }));
                                }
                                else if (ci.DataType === "NUMBER") {
                                    col.setTemplate(new sap.m.Input({
                                        type: sap.m.InputType.Number,
                                        textAlign: sap.ui.core.TextAlign.Right,
                                        value: {
                                            path: "DataModel>" + sColName,
                                            formatOptions: {
                                                minFractionDigits: +ci.Decimal,
                                                maxFractionDigits: +ci.Decimal
                                            },
                                            constraints: {
                                                precision: +ci.Length,
                                                scale: +ci.Decimal
                                            }
                                        },
                                        change: changeFunction,
                                        liveChange: liveChangeFunction
                                    }));
                                }
                                else if (ci.DataType === "BOOLEAN") {
                                    col.setTemplate(new sap.m.CheckBox({
                                        selected: "{DataModel>" + sColName + "}", 
                                        editable: true,
                                        select: changeFunction
                                    }));
                                }
                                else {
                                    col.setTemplate(new sap.m.Input({
                                        type: "Text",
                                        value: "{DataModel>" + sColName + "}",
                                        maxLength: +ci.Length,
                                        change: changeFunction,
                                        liveChange: liveChangeFunction
                                    }));
                                }

                                if (ci.Mandatory) {
                                    col.getLabel().addStyleClass("sapMLabelRequired");
                                }
                            }
                            else if (sTabId === "versionsTable" && sColName.toUpperCase() === "SETCURRENT") {
                                col.setVisible(true);
                                col.setTemplate(new sap.m.Button({
                                    text: "{i18n>SetCurrent}",
                                    icon: "sap-icon://detail-view",
                                    press: this.setVersionCurrent.bind(this),
                                    visible: "{= ${DataModel>Currentver} === true ? false : true }",
                                    customData: new sap.ui.core.CustomData({
                                        key: "VerNo",
                                        value: "{DataModel>Verno}"
                                    })
                                }));
                            }
                        })
                })
            },

            setRowReadMode(sTabId) {
                var me = this;
                var oTable = this.byId(sTabId);
                var sColName = "";

                oTable.getColumns().forEach((col, idx) => {
                    if (col.mAggregations.template.mBindingInfos.text !== undefined) {
                        sColName = col.mAggregations.template.mBindingInfos.text.parts[0].path;
                    }
                    else if (col.mAggregations.template.mBindingInfos.selected !== undefined) {
                        sColName = col.mAggregations.template.mBindingInfos.selected.parts[0].path;
                    }
                    else if (col.mAggregations.template.mBindingInfos.value !== undefined) {
                        sColName = col.mAggregations.template.mBindingInfos.value.parts[0].path;
                    }

                    this._aColumns[sTabId.replace("Table","")].filter(item => item.ColumnName === sColName)
                        .forEach(ci => {
                            if (ci.TextFormatMode && ci.TextFormatMode !== "" && ci.TextFormatMode !== "Key" && ci.ValueHelp && ci.ValueHelp["items"].text && ci.ValueHelp["items"].value !== ci.ValueHelp["items"].text) {
                                col.setTemplate(new sap.m.Text({
                                    text: {
                                        parts: [  
                                            { path: "DataModel>" + sColName }
                                        ],  
                                        formatter: function(sKey) {
                                            var oValue = me.getView().getModel(ci.ValueHelp["items"].path).getData().results.filter(v => v[ci.ValueHelp["items"].value] === sKey);
                                            
                                            if (oValue && oValue.length > 0) {
                                                if (ci.TextFormatMode === "Value") {
                                                    return oValue[0][ci.ValueHelp["items"].text];
                                                }
                                                else if (ci.TextFormatMode === "ValueKey") {
                                                    return oValue[0][ci.ValueHelp["items"].text] + " (" + sKey + ")";
                                                }
                                                else if (ci.TextFormatMode === "KeyValue") {
                                                    return sKey + " (" + oValue[0][ci.ValueHelp["items"].text] + ")";
                                                }
                                            }
                                            else return sKey;
                                        }
                                    },
                                    wrapping: false,
                                    tooltip: "{DataModel>" + sColName + "}"
                                }));
                            }
                            else if (ci.DataType === "STRING" || ci.DataType === "DATETIME" || ci.DataType === "NUMBER") {
                                if (sTabId === "versionsTable") { 
                                    if (sColName.toUpperCase() === "SETCURRENT") {
                                        col.setVisible(false);
                                    }
                                    else if (sColName.toUpperCase() === "CURRENTVER") {
                                        col.setTemplate(new sap.tnt.InfoLabel({
                                            text: "{= ${DataModel>Currentver} === true ? 'Current' : ' ' }",
                                            colorScheme: "{= ${DataModel>Currentver} === true ? 8 : 7 }",
                                            displayOnly: true,
                                            tooltip: "{= ${DataModel>Currentver} === true ? 'Current' : ' ' }",
                                            visible: "{DataModel>Currentver}"
                                        }))
                                    }
                                    else {
                                        col.setTemplate(new sap.m.Text({
                                            text: "{DataModel>" + sColName + "}",
                                            wrapping: false,
                                            tooltip: "{DataModel>" + sColName + "}"
                                        }));
                                    }
                                }
                                else {
                                    col.setTemplate(new sap.m.Text({
                                        text: "{DataModel>" + sColName + "}",
                                        wrapping: false,
                                        tooltip: "{DataModel>" + sColName + "}"
                                    }));
                                }
                            }
                            else if (ci.DataType === "BOOLEAN") {
                                col.setTemplate(new sap.m.CheckBox({
                                    selected: "{DataModel>" + sColName + "}", 
                                    wrapping: false,
                                    editable: false
                                }));
                            }
                        })

                    col.getLabel().removeStyleClass("sapMLabelRequired");                        
                })

                this.byId(sTabId).getModel("DataModel").getData().results.forEach(item => item.EDITED = false);
            },

            //******************************************* */
            // IO List
            //******************************************* */
            getIOs: function (showProgress) {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTable = this.byId("ioTable");

                if (showProgress) { Common.openLoadingDialog(this); }

                oModel.read('/IOSet', {
                    urlParameters: {
                        "$filter": "STYLENO eq '" + this._styleNo + "'"
                    },
                    success: function (oData) {
                        if (oData.results.length > 0) {
                            oData.results.forEach((item, index) => {
                                if (item.CREATEDDT !== null)
                                    item.CREATEDDT = dateFormat.format(new Date(item.CREATEDDT));

                                if (index === 0) item.ACTIVE = "X";
                                else item.ACTIVE = "";
                            });
                        }

                        me.getView().setModel(new JSONModel(oData.results), "IOData");
                        oTable.setModel(new JSONModel(oData), "DataModel");

                        if (showProgress) { Common.closeLoadingDialog(me); }
                    },
                    error: function (err) {
                        if (showProgress) { Common.closeLoadingDialog(me); }
                    }
                })
            },

            pad: Common.pad,

            //******************************************* */
            // Column Filtering
            //******************************************* */

            onColFilter: function(oEvent, sColumnLabel) {
                var oDDText = this.getView().getModel("ddtext").getData();
                var sTableId = "";

                if (typeof(oEvent) === "string") {
                    sTableId = oEvent;
                }
                else {
                    sTableId = oEvent.getSource().data("TableName");
                }

                if (this._aColumns["general"] === undefined) {
                    this._aColumns["general"] = [
                        { ColumnName: "Attribtyp", ColumnLabel: oDDText["ATTRIBTYP"], DataType: "STRING"  },
                        { ColumnName: "Attribcd", ColumnLabel: oDDText["ATTRIBCD"], DataType: "STRING"  },
                        { ColumnName: "Desc1", ColumnLabel: oDDText["DESC"], DataType: "STRING"  },
                        { ColumnName: "Attribval", ColumnLabel: oDDText["ATTRIBVAL"], DataType: "NUMBER"  },
                        { ColumnName: "Valunit", ColumnLabel: oDDText["ATTRIBVALUNIT"], DataType: "STRING"  },
                        { ColumnName: "Casverind", ColumnLabel: oDDText["CASVERIND"], DataType: "BOOLEAN"  }
                    ]; 
                }

                if (this._aColumns["colors"] === undefined) {
                    this._aColumns["colors"] = [
                        { ColumnName: "Attribseq", ColumnLabel: oDDText["COLORCD"], DataType: "NUMBER"  },
                        { ColumnName: "Desc1", ColumnLabel: oDDText["DESC"], DataType: "STRING"  },
                        { ColumnName: "Sortseq", ColumnLabel: oDDText["SORTSEQ"], DataType: "NUMBER"  }
                    ]; 
                }

                if (this._aColumns["sizes"] === undefined) {
                    this._aColumns["sizes"] = [
                        { ColumnName: "Attribcd", ColumnLabel: oDDText["SIZECD"], DataType: "STRING"  },
                        { ColumnName: "Baseind", ColumnLabel: oDDText["BASEIND"], DataType: "BOOLEAN" }
                    ]; 
                }

                if (this._aColumns["processes"] === undefined) {
                    this._aColumns["processes"] = [
                        { ColumnName: "Processcd", ColumnLabel: oDDText["PROCESSCD"], DataType: "STRING"  },
                        { ColumnName: "Vastyp", ColumnLabel: oDDText["VASTYP"], DataType: "STRING"  },
                        { ColumnName: "Leadtm", ColumnLabel: oDDText["LEADTM"], DataType: "NUMBER"  },
                        { ColumnName: "Attribtyp", ColumnLabel: oDDText["ATTRIBTYP"], DataType: "STRING"  },
                        { ColumnName: "Attribcd", ColumnLabel: oDDText["ATTRIBCD"], DataType: "STRING"  }
                    ]; 
                }

                if (this._aColumns["versions"] === undefined) {
                    this._aColumns["versions"] = [
                        { ColumnName: "Verno", ColumnLabel: oDDText["VERNO"], DataType: "NUMBER"  },
                        { ColumnName: "Currentver", ColumnLabel: oDDText["STATUS"], ColumnInfo: "(Current)", DataType: "BOOLEAN" },
                        { ColumnName: "Desc1", ColumnLabel: oDDText["DESC1"], DataType: "STRING" },
                        { ColumnName: "Desc2", ColumnLabel: oDDText["DESC2"], DataType: "STRING" }
                    ]; 
                }

                if (this._aColumns["io"] === undefined) {
                    this._aColumns["io"] = [
                        { ColumnName: "IONO", ColumnLabel: oDDText["IONO"], DataType: "STRING"  },
                        { ColumnName: "IODESC", ColumnLabel: oDDText["IODESC"], DataType: "STRING" },
                        { ColumnName: "IOTYPE", ColumnLabel: oDDText["IOTYPE"], DataType: "STRING" },
                        { ColumnName: "SALESGRP", ColumnLabel: oDDText["SALESGRP"], DataType: "STRING" },
                        { ColumnName: "SEASONCD", ColumnLabel: oDDText["SEASONCD"], DataType: "STRING"  },
                        { ColumnName: "PRODPLANT", ColumnLabel: oDDText["PRODPLANT"], DataType: "STRING" },
                        { ColumnName: "STATUSCD", ColumnLabel: oDDText["STATUSCD"], DataType: "STRING" },
                        { ColumnName: "VERNO", ColumnLabel: oDDText["VERNO"], DataType: "NUMBER" },
                        { ColumnName: "CREATEDBY", ColumnLabel: oDDText["CREATEDBY"], DataType: "STRING" },
                        { ColumnName: "CREATEDDT", ColumnLabel: oDDText["CREATEDDT"], DataType: "DATETIME" }
                    ]; 
                }

                var sDialogFragmentName = "zui3derp.view.fragments.dialog.GenericFilterDialog";

                if (!this._GenericFilterDialog) {
                    this._GenericFilterDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
                    this._GenericFilterDialog.setModel(new JSONModel());
                    this.getView().addDependent(this._GenericFilterDialog);
                }
                
                var oTable = this.byId(sTableId);
                var oTableColumns = jQuery.extend(true, [], this._aColumns[sTableId.replace("Table","")]);
                var oDialog = this._GenericFilterDialog;
                var aColumnItems = oDialog.getModel().getProperty("/items");
                var oFilterValues = oDialog.getModel().getProperty("/values");
                var oFilterCustom = oDialog.getModel().getProperty("/custom");
                var vSelectedItem = sColumnLabel === undefined ? oDialog.getModel().getProperty("/selectedItem") : sColumnLabel;
                var vSelectedColumn = oDialog.getModel().getProperty("/selectedColumn");
                var oSearchValues = {}; //oDialog.getModel().getProperty("/search");
                var aData = [];
                var oColumnValues = {};
                var bFiltered = false;
                var vFilterType = "VLF";

                if (oTable.getModel("DataModel") !== undefined) { aData = jQuery.extend(true, [], oTable.getModel("DataModel").getData().results) } 
                // console.log(this._colFilters)
                if (this._colFilters[sTableId] !== undefined) {
                    aColumnItems = this._colFilters[sTableId].items;
                    oFilterValues = this._colFilters[sTableId].values;
                    oFilterCustom = this._colFilters[sTableId].custom;
                    vSelectedItem = this._colFilters[sTableId].selectedItem;
                    vSelectedColumn = this._colFilters[sTableId].selectedColumn;
                    // aColumnItems = this.getOwnerComponent().getModel("FILTER_MODEL").getData()[sTableId].items;
                    // oFilterValues = this.getOwnerComponent().getModel("FILTER_MODEL").getData()[sTableId].values;
                    // oFilterCustom = this.getOwnerComponent().getModel("FILTER_MODEL").getData()[sTableId].custom;
                    // vSelectedItem = this.getOwnerComponent().getModel("FILTER_MODEL").getData()[sTableId].selectedItem;
                    // vSelectedColumn = this.getOwnerComponent().getModel("FILTER_MODEL").getData()[sTableId].selectedColumn;
                }
                else {
                    aColumnItems = undefined;
                    oFilterValues = undefined;
                    oFilterCustom = undefined;
                    vSelectedItem = "";
                    vSelectedColumn = "";
                }

                if (sColumnLabel !== undefined) { vSelectedItem = sColumnLabel }

                if (oFilterCustom === undefined) { 
                    oFilterCustom = {};
                }        

                if (aColumnItems !== undefined) {
                    if (aColumnItems.filter(fItem => fItem.isFiltered === true).length > 0) { bFiltered = true; }
                }

                if (!bFiltered) {
                    // sap.ui.getCore().byId("btnRemoveFilter").setEnabled(false);
                    oDialog.getModel().setProperty("/btnRemoveFilterEnable", false);
                }
                else {
                    oDialog.getModel().setProperty("/btnRemoveFilterEnable", true);
                }

                oTableColumns.forEach((col, idx) => {
                    if (col.ColumnName === "CREATEDDT" || col.ColumnName === "UPDATEDDT") { col.DataType = "DATETIME" }                   

                    oColumnValues[col.ColumnName] = [];

                    aData.forEach(val => {
                        if (val[col.ColumnName] === "" || val[col.ColumnName] === null || val[col.ColumnName] === undefined) { val[col.ColumnName] = "(blank)" }
                        else if (val[col.ColumnName] === true) { 
                            val[col.ColumnName] = "Yes";
                        }
                        else if (val[col.ColumnName] === false) { 
                            val[col.ColumnName] = "No";
                        }

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
                        // if (idx === 0) {
                        //     vSelectedColumn = col.ColumnName;
                        //     vSelectedItem = col.ColumnLabel;
                        //     col.selected = true;
                        // }
                        if (sColumnLabel === undefined) {
                            if (idx === 0) {
                                vSelectedColumn = col.ColumnName;
                                vSelectedItem = col.ColumnLabel;
                                col.selected = true;
                            }
                        }
                        else {
                            console.log(col.ColumnLabel)
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
                                // sap.ui.getCore().byId("btnRemoveFilter").setEnabled(true);
                                oDialog.getModel().setProperty("/btnRemoveFilterEnable", true);
                            }
                            else {
                                // sap.ui.getCore().byId("btnRemoveFilter").setEnabled(false);
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
                // oDialog.getModel().setProperty("/panelUDFToVisible", false);
                oDialog.getModel().setProperty("/searchValue", "");
                oDialog.open();
                // oDialog.setInitialFocus(sap.ui.getCore().byId("searchFilterValue"));

                // sap.ui.getCore().byId("searchFilterValue").setValue("");

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

                if (oFilterCustom[vSelectedColumn].Operator === "BT") {
                    oDialog.getModel().setProperty("/panelUDFToVisible", true);
                }
                else {
                    oDialog.getModel().setProperty("/panelUDFToVisible", false);
                }

                if (vDataType === "DATETIME") {
                    oDialog.getModel().setProperty("/customColFilterFrValVisible", false);
                    oDialog.getModel().setProperty("/customColFilterToValVisible", false);
                    oDialog.getModel().setProperty("/customColFilterFrDateVisible", true);
                    oDialog.getModel().setProperty("/customColFilterToDateVisible", true);
                }
                else{
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
                this._GenericFilterDialogModel = jQuery.extend(true, [], oDialog.getModel());

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
                var oSourceTableColumns = this.byId(sSourceTabId).getColumns();
                
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

                console.log(oFilter)
                this.byId(sSourceTabId).getBinding("rows").filter(oFilter, "Application");

                this._colFilters[sSourceTabId] = jQuery.extend(true, {}, oDialog.getModel().getData());
                // this.getOwnerComponent().getModel("FILTER_MODEL").setProperty("/" + sSourceTabId, this._colFilters[sSourceTabId]);
                // console.log(this.getOwnerComponent().getModel("FILTER_MODEL").getData());
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
                            // sap.ui.getCore().byId("btnRemoveFilter").setEnabled(true);
                            oDialog.getModel().setProperty("/btnRemoveFilterEnable", true);
                        }
                        else {
                            // sap.ui.getCore().byId("btnRemoveFilter").setEnabled(false);
                            oDialog.getModel().setProperty("/btnRemoveFilterEnable", false);
                        }
                    }
                })

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
                // sap.ui.getCore().byId("searchFilterValue").setValue(vSearchText);
                // this.onSearchFilterValue(vSearchText); 
                // sap.ui.getCore().byId("searchFilterValue").setValue("");

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
                        // sap.ui.getCore().byId("btnRemoveFilter").setEnabled(false);
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
                                // sap.ui.getCore().byId("btnRemoveFilter").setEnabled(true);
                                oDialog.getModel().setProperty("/btnRemoveFilterEnable", true);
                            }
                            else {
                                oItem.setIcon("sap-icon://text-align-justified");
                                // sap.ui.getCore().byId("btnRemoveFilter").setEnabled(false);
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

                if (!(oEvent.getSource().getSelectedKey() === undefined || oEvent.getSource().getSelectedKey() === "")) {
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
                        // sap.ui.getCore().byId("btnRemoveFilter").setEnabled(true);
                        oDialog.getModel().setProperty("/btnRemoveFilterEnable", true);
                    }
                    else {
                        oItem.setIcon("sap-icon://text-align-justified");
                        // sap.ui.getCore().byId("btnRemoveFilter").setEnabled(false);
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
                        // sap.ui.getCore().byId("btnRemoveFilter").setEnabled(true);
                        oDialog.getModel().setProperty("/btnRemoveFilterEnable", true);
                        oItem.setIcon("sap-icon://filter");
                    }
                    else {
                        // sap.ui.getCore().byId("btnRemoveFilter").setEnabled(false);
                        oDialog.getModel().setProperty("/btnRemoveFilterEnable", false);
                        oItem.setIcon("sap-icon://text-align-justified");
                    }
                }
                else {
                    oDialog.getModel().setProperty("/panelVLFVisible", true);
                    oDialog.getModel().setProperty("/panelUDFVisible", false);

                    if (oColumnValues[vSelectedColumn].filter(fItem => fItem.Selected === false).length > 0 && oEvent.getParameter("selected")) {
                        // sap.ui.getCore().byId("btnRemoveFilter").setEnabled(true);
                        oDialog.getModel().setProperty("/btnRemoveFilterEnable", true);
                        oItem.setIcon("sap-icon://filter");
                    }
                    else {
                        // sap.ui.getCore().byId("btnRemoveFilter").setEnabled(false);
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

                // sap.ui.getCore().byId("btnRemoveFilter").setEnabled(false);
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

        });
});
