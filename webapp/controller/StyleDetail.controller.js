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
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, Common, Constants, Utils, JSONModel, jQuery, HashChanger, History, MessageBox) {
        "use strict";

        var that;
        var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "MM/dd/yyyy" });
        
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

                 
                if (sap.ui.getCore().byId("backBtn") !== undefined) {
                    this._fBackButton = sap.ui.getCore().byId("backBtn").mEventRegistry.press[0].fFunction;
                    sap.ui.getCore().byId("backBtn").mEventRegistry.press[0].fFunction = function (oEvent) {
                        that.onNavBack();
                    }
                }
                var lookUpModel={
                    AttribCdModel:[],
                    AttribTypeModel:[],
                    ProcessCodeModel:[],
                    UOMModel:[],
                    UOMGMCModel:[]
                }
                
                this.getOwnerComponent().getModel("LOOKUP_MODEL").setData(lookUpModel);
                this.getOwnerComponent().getModel("COLOR_MODEL").setData({ items: [] });

                //Initialize translations
                this._i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },

            onExit: function() {
                sap.ui.getCore().byId("backBtn").mEventRegistry.press[0].fFunction = this._fBackButton;
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

            _routePatternMatched: function (oEvent) {
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
                
                if (this._styleNo === Constants.NEW) {
                    //create new - only header is editable at first
                    this.setHeaderEditMode();
                    this.setDetailVisible(false);
                    //this.setReqField("header", true);

                } else {
                    //existing style, get the style data
                    this.cancelHeaderEdit();
                    this.setDetailVisible(true); //make detail section visible
                    this.getGeneralTable(); //get general attributes
                    this.getSizesTable(); //get sizes
                    this.getProcessesTable(); //get process
                    this.getVersionsTable(); //get versions
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
                Utils.getStyleSearchHelps(this);
                Utils.getAttributesSearchHelps(this);
                Utils.getProcessAttributes(this);

                //Attachments
                this.bindUploadCollection();
                this.getView().getModel("FileModel").refresh();
                this.setFilesEditMode();
                this.getCaptionMsgs();

                var cIconTabBar = this.getView().byId("detailPanel");
                if (this.getOwnerComponent().getModel("UI_MODEL").getData().fromScreen === "VERSION") {
                    cIconTabBar.setSelectedKey("version");
                }
                else {
                    cIconTabBar.setSelectedKey("genAttrib");
                }

                Common.closeLoadingDialog(that);
            },

            closeEditModes: function () {
                this.cancelGeneralAttrEdit();
                this.cancelColorsEdit();
                this.cancelSizeEdit();
                this.cancelProcessEdit();
                this.cancelVersionEdit();
                this.cancelFilesEdit();
            },

            setChangeStatus: function (changed) {
                //controls the edited warning message
                try {
                    sap.ushell.Container.setDirtyFlag(changed);
                } catch (err) { }
            },

            setReqField(pType, pEditable) {
                if (pType == "header") {
                    var fields = ["feSTYLECD","feSTYLECAT", "fePRODTYP", "feDESC1", "feSALESGRP", "feSEASONCD", "feCUSTGRP", "feSOLDTOCUST", "feSIZEGRP", "feUOM"];

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
                            "Uom": oData.Baseuom
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
                Common.openLoadingDialog(that);

                this._oModelStyle.update("/CreateIOStyleSet('" + this._iono + "')", param, {
                    method: "PUT",
                    success: function (data, oResponse) {
                        setTimeout(() => {
                            Common.showMessage(me._i18n.getText('t13') + param["IONO"]);
                            Common.closeLoadingDialog(that);
                            me.routeTOIO();
                        }, 1000);
                    },
                    error: function (err) {
                        //show message strip on error
                        var errorMsg;
                        try {
                            errorMsg = JSON.parse(err.responseText).error.message.value;
                        } catch (err) {
                            errorMsg = err.responseText;
                        }
                        oMsgStrip.setVisible(true);
                        oMsgStrip.setText(errorMsg);
                    }
                });
            },

            //redirect to IO
            onNavBack: function (oEvent) {
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
                        semanticObject: "ZSO_IO2",
                        action: "display&/RouteIODetail/" + this._iono + "/" + this._sbu + "/" + this._styleNo +"/itfSTYLE"
                    }

                })) || ""; // generate the Hash to display style

                oCrossAppNavigator.toExternal({
                    target: {
                        shellHash: hash
                    }
                });
            },

            getCaptionMsgs: function() {
                var me = this;
                var oDDTextParam = [], oDDTextResult = {};
                var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_COMMON_SRV");

                oDDTextParam.push({CODE: "COPY"}); 

                oDDTextParam.push({CODE: "IONO"});
                oDDTextParam.push({CODE: "IODESC"});
                oDDTextParam.push({CODE: "IOTYPE"});
                oDDTextParam.push({CODE: "SALESGRP"});
                oDDTextParam.push({CODE: "SEASONCD"});
                oDDTextParam.push({CODE: "PRODPLANT"});
                oDDTextParam.push({CODE: "STATUSCD"});
                oDDTextParam.push({CODE: "VERNO"});  
                oDDTextParam.push({CODE: "CREATEDBY"});  
                oDDTextParam.push({CODE: "CREATEDDT"});  
                oDDTextParam.push({CODE: "IOLIST"}); 

                oDDTextParam.push({CODE: "ATTRIBSEQ"}); 
                oDDTextParam.push({CODE: "ATTRIBTYP"});
                oDDTextParam.push({CODE: "ATTRIBCD"});  
                oDDTextParam.push({CODE: "DESC"});  
                oDDTextParam.push({CODE: "ATTRIBVAL"});  
                oDDTextParam.push({CODE: "ATTRIBVALUNIT"}); 
                oDDTextParam.push({CODE: "CASVERIND"}); 

                oDDTextParam.push({CODE: "INFO_INPUT_REQD_FIELDS"}); 
                oDDTextParam.push({CODE: "INFO_NO_DATA_EDIT"}); 
                oDDTextParam.push({CODE: "INFO_NO_SEL_RECORD_TO_PROC"}); 
                
                oModel.create("/CaptionMsgSet", { CaptionMsgItems: oDDTextParam  }, {
                    method: "POST",
                    success: function(oData, oResponse) {        
                        oData.CaptionMsgItems.results.forEach(item => {
                            oDDTextResult[item.CODE] = item.TEXT;
                        })

                        me.getView().setModel(new JSONModel(oDDTextResult), "ddtext");
                        me.getOwnerComponent().getModel("CAPTION_MSGS_MODEL").setData({text: oDDTextResult})
                    },
                    error: function(err) { }
                });
            },

            //******************************************* */
            // Style Header
            //******************************************* */

            getHeaderData: function () {
                var me = this;
                var styleNo = this._styleNo;
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var oView = this.getView();

                Common.openLoadingDialog(that);

                //read Style header data
                var entitySet = "/StyleDetailSet('" + styleNo + "')"
                oModel.read(entitySet, {
                    success: function (oData, oResponse) {
                        // var oldData = oData;
                        // me._headerData = JSON.parse(JSON.stringify(oData));
                        //console.log(oData);
                        oJSONModel.setData(oData);
                        oView.setModel(oJSONModel, "headerData");
                        Common.closeLoadingDialog(that);
                        me.setChangeStatus(false);
                    },
                    error: function (err) {
                        console.log(err);
                        Common.closeLoadingDialog(that);
                    }
                })
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
                    },
                    error: function (err) { }
                });
            },

            setHeaderEditMode: function () {   
                if (this._styleNo === Constants.NEW) {
                    //unlock editable fields of style header
                    var oJSONModel = new JSONModel();
                    var data = {};
                    this._headerChanged = false;
                    data.editMode = true;
                    oJSONModel.setData(data);
                    this.getView().setModel(oJSONModel, "HeaderEditModeModel");

                    Utils.getStyleSearchHelps(this);

                    this.setReqField("header", true);
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
                        //unlock editable fields of style header
                        var oJSONModel = new JSONModel();
                        var data = {};
                        this._headerChanged = false;
                        data.editMode = true;
                        oJSONModel.setData(data);
                        this.getView().setModel(oJSONModel, "HeaderEditModeModel");
    
                        Utils.getStyleSearchHelps(this);
    
                        this.setReqField("header", true);
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

                this.setReqField("header", false);
                this.enableOtherTabs("detailPanel");
                this.setDtlsEnableButton(true);
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
            },

            onHeaderChange: function () {
                //set change flag for header
                this._headerChanged = true;
                this.setChangeStatus(true);
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
                                me.setReqField("header", false);
                                Common.showMessage(me._i18n.getText('t4'));

                                //from IO module create new Style
                                // var param = {};
                                // param["IONO"] = me._iono;
                                // param["STYLENO"] = me._styleNo

                                // me._oModelStyle.update("/CreateIOStyleSet('" + me._iono + "')", param, {
                                //     method: "PUT",
                                //     success: function (data, oResponse) {
                                //     }
                                // });

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
                                oMsgStrip.setVisible(true);
                                oMsgStrip.setText(errorMsg);
                            }
                        });

                    } else {
                        //style already existing, call update method
                        path = "/StyleDetailSet('" + this._styleNo + "')";
                        oModel.setHeaders({
                            sbu: this._sbu
                        });
                        console.log(oEntry);
                        oModel.update(path, oEntry, {
                            method: "PUT",
                            success: function (data, oResponse) {
                                //reselect the data to ensure consistency
                                me.getHeaderData();
                                me.getSizesTable();
                                me._headerChanged = false;
                                me.setChangeStatus(false);
                                me.setTabReadMode("HeaderEditModeModel");
                                me.setReqField("header", false);
                                Common.showMessage(me._i18n.getText('t4'));
                            },
                            error: function (err, oMessage) {
                                //show message strip on error
                                var errorMsg;
                                try {
                                    errorMsg = JSON.parse(err.responseText).error.message.value;
                                } catch (err) {
                                    errorMsg = err.responseText;
                                }
                                oMsgStrip.setVisible(true);
                                oMsgStrip.setText(errorMsg);
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
                var oTable = this.getView().byId("generalTable");
                var oReqAttr = [];
                var bProceed = true;
                var oMsgStrip = this.getView().byId("GeneralAttrInfoMessageStrip");
                oMsgStrip.setVisible(false);

                Common.openLoadingDialog(that);

                var entitySet = "/StyleAttributesGeneralSet";
                oModel.setHeaders({
                    styleno: this._styleNo,
                    sbu: this._sbu
                });
                oModel.read(entitySet, {
                    success: function (oData, oResponse) {
                        console.log(oData)
                        
                        oData.results.forEach((item, index) => {
                            item.Casverind = item.Casverind === "X" ? true : false;

                            if (index === 0) item.ACTIVE = "X";
                            else item.ACTIVE = "";
                        });

                        oJSONModel.setData(oData);
                        oTable.setModel(oJSONModel, "DataModel");
                        Common.closeLoadingDialog(that);

                        // oModel.read("/AttributesConfigSet", {
                        //     success: function (oDataConfig, oResponse) {
                        //         // me._attributesconfig = oDataConfig.results;

                        //         oData.results.forEach((item, index) => {
                        //             item.Casverind = item.Casverind === "X" ? true : false;
                        //             item.Property = "";

                        //             oDataConfig.results.filter(fItem => fItem.TYPE === item.Attribtyp).forEach(e => {
                        //                 item.Property = e.PROP;

                        //                 if (e.PROP === "M") { 
                        //                     if (oReqAttr.findIndex(val => val === item.Attribtyp) < 0) { oReqAttr.push(item.Attribtyp); }
                        //                 }
                        //             });
        
                        //             if (index === 0) item.ACTIVE = "X";
                        //             else item.ACTIVE = "";
                        //         });

                        //         oDataConfig.results.forEach(item => {
                        //             if (item.PROP === "M") {
                        //                 if (oReqAttr.findIndex(val => val === item.Attribtyp) < 0) { oReqAttr.push(item.Attribtyp); }
                        //             }

                        //             if (oData.results.filter(fItem => fItem.Attribtyp === item.TYPE).length === 0) {
                        //                 bProceed = false;
                        //             }
                        //         })

                        //         oJSONModel.setData(oData);
                        //         oTable.setModel(oJSONModel, "DataModel");
                        //         //oTable.setVisibleRowCount(oData.results.length); //updating visible rows
                        //         // oTable.onAttachPaste(); //for copy-paste
                        //         Common.closeLoadingDialog(that);
                        //         me._attributesconfig = oReqAttr;

                        //         if (!bProceed) {
                        //             oMsgStrip.setVisible(true);
                        //             // sMessage = sMessage.substring(0, sMessage.length - 2)
                        //             oMsgStrip.setText("Attribute Type/s is required: " + oReqAttr.join(", ") + ". Insert record on these attributes to be able to work with other style details.");
                        //             me.disableOtherTabs("detailPanel");
                        //         }

                        //         // if (oData.results.filter(fItem => fItem.Attribval === "" && fItem.Property === "M").length > 0) {
                        //         //     oMsgStrip.setVisible(true);
                        //         //     // sMessage = sMessage.substring(0, sMessage.length - 2)
                        //         //     oMsgStrip.setText("Attribute Code/Value is required for Attribute Type: " + oReqAttr.join(", ") + ". Enter value on these attributes to be able to work with other style details.");
                        //         //     me.disableOtherTabs("detailPanel");
                        //         // }
                        //     },
                        //     error: function (err) { 
                        //         Common.closeLoadingDialog(that);
                        //     }
                        // }); 
                    },
                    error: function () {
                        Common.closeLoadingDialog(that);
                    }
                })
            },

            setGeneralAttrEditMode: function () {
                //set general attributes table edit mode
                var oTable = this.getView().byId("generalTable");
                var oJSONModel = new JSONModel();
                var data = {};
                this._generalAttrChanged = true;
                data.editMode = true;
                oJSONModel.setData(data);
                this.getView().setModel(oJSONModel, "GenAttrEditModeModel");

                Utils.getAttributesSearchHelps(this);

                this.disableOtherTabs("detailPanel");

                var oMsgStrip = this.getView().byId("GeneralAttrInfoMessageStrip");
                oMsgStrip.setVisible(false);

                // for (var i = 0; i < oTable.getModel("DataModel").getData().results.length; i++) {
                //     var iRowIndex = +oTable.getContextByIndex(i).getPath().replace("/results/", "");
                //     var oRow = oTable.getRows()[iRowIndex];
                //     var vValTyp = oTable.getContextByIndex(i).getProperty("Valuetyp");
                //     var oCellCtrlValTyp = "";

                //     oRow.getCells().forEach(cell => {
                //         if (cell.getBindingInfo("value") !== undefined) {
                //             oCellCtrlValTyp = "value";
                //         }
                //         else if (cell.getBindingInfo("text") !== undefined) {
                //             oCellCtrlValTyp = "text";
                //         }
                //         else if (cell.getBindingInfo("selected") !== undefined) {
                //             oCellCtrlValTyp = "selected";
                //         }
                //         console.log(cell.getBindingInfo(oCellCtrlValTyp).parts[0].path.toUpperCase())
                //         if (cell.getBindingInfo(oCellCtrlValTyp).parts[0].path.toUpperCase() === "ATTRIBVAL") {
                //             if (vValTyp === "STRVAL" || vValTyp === "NUMVALUE") {
                //                 cell.setEnabled(true);
                //             }
                //             else {
                //                 cell.setEnabled(false);
                //             }
                //         }
                //     })
                // }               
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

                this.setDtlsEnableButton(true);
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
                this.enableOtherTabs("detailPanel");
            },

            onGeneralAttrChange: function () {
                this._generalAttrChanged = true;
                this.setChangeStatus(true);
            },

            onSaveGeneralTable: function () {
                //save general attributes table changes
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("generalTable").getModel("DataModel");
                var path;
                var bProceed = true;

                //initialize message strip
                var oMsgStrip = this.getView().byId('GeneralAttrMessageStrip');
                oMsgStrip.setVisible(false);
                console.log(this._attributesconfig)
                if (!this._generalAttrChanged) { //check if data is changed
                    Common.showMessage(this._i18n.getText('t7'));
                } else {
                    //get table data and build the payload
                    var oData = oTableModel.getData();
                    var oEntry = {
                        Styleno: this._styleNo,
                        Type: Constants.GENERAL,
                        AttributesToItems: []
                    }
                    for (var i = 0; i < oData.results.length; i++) {
                        console.log(oData.results[i].Attribtyp, oData.results[i].Attribcd, oData.results[i].Attribval)
                        if (this._attributesconfig.filter(fItem => fItem === oData.results[i].Attribtyp && (oData.results[i].Attribcd === "" || oData.results[i].Attribval === "")).length > 0) {
                            bProceed = false;
                        }
                        else {
                            var item = {
                                "Styleno": this._styleNo,
                                "Attribtyp": oData.results[i].Attribtyp,
                                "Attribcd": oData.results[i].Attribcd,
                                "Baseind": false,
                                "Desc1": oData.results[i].Desc1,
                                "Valuetyp": "STRVAL",
                                "Attribval": oData.results[i].Attribval,
                                "Attribseq": oData.results[i].Attribseq,
                                "Casverind": (oData.results[i].Casverind === true ? "X" : "")
                            };
    
                            oEntry.AttributesToItems.push(item);
                        }
                    };

                    if (bProceed) {
                        Common.openLoadingDialog(that);

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
                                Common.showMessage(me._i18n.getText('t4'));
                                Utils.getProcessAttributes(me); //need to reload available attribute types for process tables
                                me.setTabReadMode("GenAttrEditModeModel");
                                me.enableOtherTabs("detailPanel");
                                me.getGeneralTable();
                            },
                            error: function (err) {
                                //show error messages
                                Common.closeLoadingDialog(that);
                                var errorMsg = JSON.parse(err.responseText).error.message.value;
                                oMsgStrip.setVisible(true);
                                oMsgStrip.setText(errorMsg);
                                Common.showMessage(me._i18n.getText('t5'));
                            }
                        });
                    }
                    else {
                        MessageBox.information("Attribute Code and Value are required for the following Attribute Type:\r\n-" + this._attributesconfig.join("\r\n-"))
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
                    for (var i = 0; i < selected.length; i++) {

                        var attrtype = oData.results[selected[i]].Attribtyp;
                        var attrcd = oData.results[selected[i]].Attribcd;

                        var entitySet = "/StyleAttributesGeneralSet(Styleno='" + that._styleNo + "',Attribtyp='" + attrtype + "',Attribcd='" + attrcd + "')";
                        console.log(entitySet)
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

                    //remove the deleted lines from the table
                    oData.results = oData.results.filter(function (value, index) {
                        return selected.indexOf(index) == -1;
                    })
                    oTableModel.setData(oData);
                    oTable.clearSelection();
                }
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
                var oTable = this.getView().byId("colorsTable");

                Common.openLoadingDialog(that);

                var entitySet = "/StyleAttributesColorSet"
                oModel.setHeaders({
                    styleno: this._styleNo
                });
                oModel.read(entitySet, {
                    success: function (oData, oResponse) {
                        // console.log("get colors", oData.results);
                        if (oData.results.length === 0) { me.disableTabItem("detailPanel","version"); }

                        // if (oData.results.filter(fItem => fItem.Sortseq === "0").length === oData.results.length) {
                        //     oData.results.forEach(item => item.Sortseq = item.Attribseq);
                        // }

                        oJSONModel.setData(oData);
                        oTable.setModel(oJSONModel, "DataModel");
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
                this._bomColors = [];
                this._bomColors = await this.getBOMCOlor(this);

                var oTable = this.getView().byId("colorsTable");

                if (this._bomColors.length > 0) {
                    var oTableModel = oTable.getModel("DataModel");
                    var oData = oTableModel.getData();

                    for (var i = 0; i < oData.results.length; i++) { 
                        if (this._bomColors.filter(fItem => fItem.COLOR === oData.results[i].Attribcd).length > 0) {
                            console.log("1")
                            oTable.getRows()[i].getCells().forEach(cell => {
                                if (cell.getBindingInfo("value") !== undefined) {
                                    cell.setProperty("editable", false);
                                }
                            });
                        }
                        else {
                            oTable.getRows()[i].getCells().forEach(cell => {
                                if (cell.getBindingInfo("value") !== undefined) {
                                    cell.setProperty("editable", true);
                                }
                            });
                        }
                    }
                }
                else {
                    oTable.getRows().forEach(row => {
                        row.getCells().forEach(cell => {
                            if (cell.getBindingInfo("value") !== undefined) {
                                cell.setProperty("editable", true);
                            }
                        });
                    });
                }

                //set colors table editable
                var oJSONModel = new JSONModel();
                var data = {};
                data.editMode = true;
                oJSONModel.setData(data);
                this.getView().setModel(oJSONModel, "ColorEditModeModel");
                this.byId("btnColorAdd").setVisible(true);
            },

            setColorEditMode: async function () { 
                this._bomColors = [];
                this._bomColors = await this.getBOMCOlor(this);

                var oTable = this.getView().byId("colorsTable");
                var oTableModel = oTable.getModel("DataModel");
                var oData = oTableModel.getData();
                var bProceed = true;
                var noEdit= 0;

                if (oData.results.length === 0) {
                    MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_NO_DATA_EDIT"]);
                    bProceed = false;
                }
                else {
                    for (var i = 0; i < oData.results.length; i++) { 
                        if (this._bomColors.filter(fItem => fItem.COLOR === oData.results[i].Attribcd).length > 0) {
                            noEdit++;
                            oTable.getRows()[i].getCells().forEach(cell => {
                                if (cell.getBindingInfo("value") !== undefined) {
                                    if (cell.getBindingInfo("value").parts[0].path === "Sortseq") {
                                        cell.setProperty("editable", true);
                                    }
                                    else {
                                        cell.setProperty("editable", false);
                                    }
                                }
                            });
                        }
                        else {
                            oTable.getRows()[i].getCells().forEach(cell => {
                                if (cell.getBindingInfo("value") !== undefined) {
                                    cell.setProperty("editable", true);
                                }
                            });
                        }
                    }

                    // if (oData.results.length === noEdit) {
                    //     bProceed = false;
                    //     MessageBox.information("Color/s already used in BOM.")
                    // }
                }                

                if (bProceed) {
                    //set colors table editable
                    var oJSONModel = new JSONModel();
                    var data = {};
                    this._colorChanged = false;
                    data.editMode = true;
                    oJSONModel.setData(data);
                    this.getView().setModel(oJSONModel, "ColorEditModeModel");
                    this.byId("btnColorAdd").setVisible(false);

                    this.disableOtherTabs("detailPanel");
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

                this.setDtlsEnableButton(true);
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

                var oTable = this.getView().byId("colorsTable");

                oTable.getRows().forEach(row => {
                    row.getCells().forEach(cell => {
                        if (cell.getBindingInfo("value") !== undefined) {
                            cell.setProperty("editable", false);
                        }
                    });
                });

                this.byId("btnColorAdd").setVisible(true);
                this.enableOtherTabs("detailPanel");
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
                var oData = oTableModel.getData();

                //initialize message strip
                var oMsgStrip = this.getView().byId('ColorsMessageStrip');
                oMsgStrip.setVisible(false);

                if (!this._colorChanged) { //check if there are changes to colors table
                    Common.showMessage(this._i18n.getText('t7'));
                } else {

                    //build the headers and payload
                    var oEntry = {
                        Styleno: this._styleNo,
                        Type: Constants.COLOR,
                        AttributesToItems: []
                    }

                    for (var i = 0; i < oData.results.length; i++) {
                        var item = {
                            "Styleno": this._styleNo,
                            "Attribtyp": "COLOR",
                            "Attribcd": oData.results[i].Attribcd,
                            "Baseind": false,
                            "Desc1": oData.results[i].Desc1,
                            "Valuetyp": "STRVAL",
                            "Attribseq": oData.results[i].Attribseq,
                            "Sortseq": oData.results[i].Sortseq
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
                    oData.results.map(v => v.Desc1.toLowerCase()).sort().sort((a, b) => {
                        if (a == b) hasDuplicateColorDesc = true
                    })
                    if (hasDuplicateColorDesc) {
                        //Common.showMessage("Duplicate color is not allow");
                        oMsgStrip.setVisible(true);
                        oMsgStrip.setText("Duplicate Description is not allowed");
                        return;
                    }

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
                            Common.showMessage(me._i18n.getText('t4'));
                            Utils.getProcessAttributes(me);
                            //me.setColorReadMode();
                            me.setTabReadMode("ColorEditModeModel");
                            me.getColorsTable();
                            me.enableOtherTabs("detailPanel");
                        },
                        error: function (err) {
                            Common.closeLoadingDialog(me);
                            Common.showMessage(me._i18n.getText('t5'));
                            var errorMsg = JSON.parse(err.responseText).error.message.value;
                            oMsgStrip.setVisible(true);
                            oMsgStrip.setText(errorMsg);
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
                    // this.getColorsTable();

                }
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
                        if (oData.results.length === 0) { me.disableTabItem("detailPanel","version"); }

                        oJSONModel.setData(oData);
                        oTable.setModel(oJSONModel, "DataModel");
                        Common.closeLoadingDialog(that);
                    },
                    error: function () {
                        Common.closeLoadingDialog(that);
                    }
                })
            },

            setSizeEditMode: function () {
                //set size table editable
                var oJSONModel = new JSONModel();
                var data = {};
                this._sizeChanged = false;
                data.editMode = true;
                oJSONModel.setData(data);
                this.getView().setModel(oJSONModel, "SizeEditModeModel");

                this.disableOtherTabs("detailPanel");
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
                    Common.showMessage(this._i18n.getText('t7'));
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
                        Common.showMessage(this._i18n.getText('t9'));
                    } else {
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
                                Common.showMessage(me._i18n.getText('t4'));
                                Utils.getProcessAttributes(me);
                            },
                            error: function (err) {
                                Common.closeLoadingDialog(me);
                                Common.showMessage(me._i18n.getText('t5'));
                                var errorMsg = JSON.parse(err.responseText).error.message.value;
                                oMsgStrip.setVisible(true);
                                oMsgStrip.setText(errorMsg);
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
                var oTable = this.getView().byId("processesTable");

                Common.openLoadingDialog(that);

                var entitySet = "/StyleAttributesProcessSet"
                oModel.setHeaders({
                    styleno: this._styleNo,
                    sbu: this._sbu
                });
                oModel.read(entitySet, {
                    success: function (oData, oResponse) {
                        oJSONModel.setData(oData);
                        oTable.setModel(oJSONModel, "DataModel");
                        //oTable.setVisibleRowCount(oData.results.length);
                        // oTable.attachPaste();
                        Common.closeLoadingDialog(that);
                    },
                    error: function () {
                        Common.closeLoadingDialog(that);
                    }
                })
            },

            setProcessEditMode: function () {
                //set edit mode processes table
                var oJSONModel = new JSONModel();
                var data = {};
                this._processChanged = false;
                data.editMode = true;
                oJSONModel.setData(data);
                this.getView().setModel(oJSONModel, "ProcessEditModeModel");

                Utils.getProcessAttributes(this);
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
            },

            onProcessChange: function () {
                this._processChanged = true;
                this.setChangeStatus(true);
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
                    Common.showMessage(this._i18n.getText('t7'));
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
                            Common.showMessage(me._i18n.getText('t4'));
                        },
                        error: function (err) {
                            Common.closeLoadingDialog(me);
                            Common.showMessage(me._i18n.getText('t5'));
                            var errorMsg = JSON.parse(err.responseText).error.message.value;
                            oMsgStrip.setVisible(true);
                            oMsgStrip.setText(errorMsg);
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

            //******************************************* */
            // Style Versions
            //******************************************* */

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
                        oTable.setModel(oJSONModel, "DataModel");
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
    
                    that._router.navTo("RouteVersion", {
                        styleno: that._styleNo,
                        sbu: that._sbu,
                        version: verno
                    });
                }             
            },

            onCreateNewVersion: function () {
                //open create new version dialog
                if (!that._NewVerionDialog) {
                    that._NewVerionDialog = sap.ui.xmlfragment("zui3derp.view.fragments.CreateNewVersion", that);
                    that.getView().addDependent(that._NewVerionDialog);
                }
                jQuery.sap.syncStyleClass("sapUiSizeCompact", that.getView(), that._LoadingDialog);
                that._NewVerionDialog.addStyleClass("sapUiSizeCompact");
                that._NewVerionDialog.open();
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
                oModel.setHeaders({
                    sbu: this._sbu                    
                });
                //call create method of style version
                oModel.create(path, oEntry, {
                    method: "POST",
                    success: function (oData, oResponse) {
                        me.getVersionsTable();
                        me._NewVerionDialog.close();
                        Common.closeLoadingDialog(that);
                        Common.showMessage(me._i18n.getText('t4'));

                        if (oCurrent) { me.getHeaderData();  }
                    },
                    error: function (err) {
                        Common.closeLoadingDialog(that);
                        Common.showMessage(me._i18n.getText('t5'));
                    }
                });
            },

            setVersionEditMode: function () {
                //set edit mode of versions table
                var oJSONModel = new JSONModel();
                var data = {};
                this._versionChanged = false;
                data.editMode = true;
                oJSONModel.setData(data);
                this.getView().setModel(oJSONModel, "VersionEditModeModel");
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
                    Common.showMessage(this._i18n.getText('t7'));
                } else {
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
                            Common.showMessage(me._i18n.getText('t4'));
                        },
                        error: function (err) {
                            Common.closeLoadingDialog(that);
                            Common.showMessage(me._i18n.getText('t5'));
                            var errorMsg = JSON.parse(err.responseText).error.message.value;
                            oMsgStrip.setVisible(true);
                            oMsgStrip.setText(errorMsg);
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
                            console.log(verno)
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

            onCopyVersion: function(oEvent) {
                var oModel = this.getOwnerComponent().getModel();

                //get selected items to coy
                var oTable = this.getView().byId("versionsTable");
                var oTableModel = oTable.getModel("DataModel");
                var oData = oTableModel.getData();
                var selected = oTable.getSelectedIndices();

                oModel.setUseBatch(true);
                oModel.setDeferredGroups(["group1"]);

                if (selected.length > 0) {
                    Common.openLoadingDialog(that);

                    //call create method for each item selected
                    for (var i = 0; i < selected.length; i++) {
                        var path = "/StyleVersionSet";
                        var oEntry = {
                            "Styleno": this._styleNo,
                            "Verno": "",
                            "Desc1": oData.results[selected[i]].Desc1 + "_Copy",
                            "Desc2": oData.results[selected[i]].Desc2,
                            "Currentver": false
                        };

                        oModel.setHeaders({
                            sbu: this._sbu,
                            type: "COPY"
                        });

                        //call create method of style version
                        oModel.create(path, oEntry, {
                            groupId: "group1",
                            changeSetId: "changeSetId1",
                            method: "POST",
                            success: function (oData, oResponse) { },
                            error: function () { }
                        });

                        oModel.submitChanges({
                            groupId: "group1"
                        });

                        oModel.setRefreshAfterChange(true);
                    }

                    console.log("refresh table");
                    this.getVersionsTable();
                    Common.closeLoadingDialog(that);
                }
                else {
                    MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_NO_SEL_RECORD_TO_PROC"])
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

            onAddFile: function () {
                console.log("upload")
                //open the file select dialog
                var oUploadCollection = this.getView().byId('UploadCollection');
                oUploadCollection.openFileDialog();
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
                //open seaons value help
                var sInputValue = oEvent.getSource().getValue();
                this.inputId = oEvent.getSource().getId(); //get input field id
                if (!this._seasonsHelpDialog) {
                    this._seasonsHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.Seasons", this);
                    this._seasonsHelpDialog.attachSearch(this._seasonsGroupValueHelpSearch);
                    this.getView().addDependent(this._seasonsHelpDialog);
                }
                this._seasonsHelpDialog.open(sInputValue);
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
                var sInputValue = oEvent.getSource().getValue();
                this.inputId = oEvent.getSource().getId(); //get input field id
                if (!this._styleCatHelpDialog) {
                    this._styleCatHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.StyleCat", this);
                    this.getView().addDependent(this._styleCatHelpDialog);
                }
                this._styleCatHelpDialog.open(sInputValue);
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
                var sInputValue = oEvent.getSource().getValue();
                this.inputId = oEvent.getSource().getId(); //get input field id
                if (!this._prodTypeHelpDialog) {
                    this._prodTypeHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.ProdTypes", this);
                    this.getView().addDependent(this._prodTypeHelpDialog);
                }
                this._prodTypeHelpDialog.open(sInputValue);
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
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onSalesGroupValueHelp: function (oEvent) {
                //open sales group value help
                var sInputValue = oEvent.getSource().getValue();
                this.inputId = oEvent.getSource().getId(); //get input field id
                if (!this._salesGroupHelpDialog) {
                    this._salesGroupHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.SalesGroups", this);
                    this.getView().addDependent(this._salesGroupHelpDialog);
                }
                this._salesGroupHelpDialog.open(sInputValue);
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
                var sInputValue = oEvent.getSource().getValue();
                this.inputId = oEvent.getSource().getId(); //get input field id
                if (!this._custGroupHelpDialog) {
                    this._custGroupHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.CustGroups", this);
                    this.getView().addDependent(this._custGroupHelpDialog);
                }
                this._custGroupHelpDialog.open(sInputValue);
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
                var sInputValue = oEvent.getSource().getValue();
                var custGrp = this.getView().byId("CUSTGRP").getValue(); //get customer group value
                this.inputId = oEvent.getSource().getId(); //get input field id
                if (!this._customersHelpDialog) {
                    this._customersHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.Customers", this);
                    this.getView().addDependent(this._customersHelpDialog);
                }
                //filter customers by customer group
                this._customersHelpDialog.getBinding("items").filter([new Filter(
                    "Custgrp",
                    sap.ui.model.FilterOperator.EQ, custGrp
                )]);
                this._customersHelpDialog.open(sInputValue);
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
                var me = this;
                var sInputValue = oEvent.getSource().getValue();
                this.inputId = oEvent.getSource().getId();
                var oSHModel = this.getOwnerComponent().getModel("SearchHelps");
                var oView = this.getView();

                //get size groups entityset
                var oJSONModel = new JSONModel();
                oSHModel.read("/SizeGrpSet", {
                    success: function (oData, oResponse) {
                        oJSONModel.setData(oData);
                        oView.setModel(oJSONModel, "SizeGroupModel");
                        //open size group value help
                        if (!me._sizeGroupHelpDialog) {
                            me._sizeGroupHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.SizeGroups", me);
                            me.getView().addDependent(me._sizeGroupHelpDialog);
                        }
                        me._sizeGroupHelpDialog.open(sInputValue);
                    },
                    error: function (err) { }
                });
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

            onUomValueHelp: function () {
                //open uom value help
                if (!this._uomValueHelpDialog) {
                    this._uomValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.UoM", this);
                    this.getView().addDependent(this._uomValueHelpDialog);
                }
                this._uomValueHelpDialog.open();
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
                var sInputValue = oEvent.getSource().getValue();
                this.inputId = oEvent.getSource().getId(); //get the id of the input field
                if (!this._attrTypesValueHelpDialog) {
                    this._attrTypesValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.AttributeTypes", this);
                    this.getView().addDependent(this._attrTypesValueHelpDialog);
                }
                this._attrTypesValueHelpDialog.open(sInputValue);
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
                var oTable = that.getView().byId("generalTable");
                var oColumns = oTable.getColumns();
                for (var i = 0; i < oColumns.length; i++) {
                    var name = oColumns[i].getName();
                    if (name === 'DESC1') {
                        this.descId = oEvent.getSource().getParent().mAggregations.cells[i].getId();
                    }
                    if (name === 'UOM') {
                        this.attribUom = oEvent.getSource().getParent().mAggregations.cells[i].getId();
                    }
                }
                //open dialog
                if (!this._attrCodesValueHelpDialog) {
                    this._attrCodesValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.AttributeCodes", this);
                    this.getView().addDependent(this._attrCodesValueHelpDialog);
                }
                //filter the attribute codes based on the value of attribute type
                this._attrCodesValueHelpDialog.getBinding("items").filter([new Filter(
                    "Attribtyp",
                    sap.ui.model.FilterOperator.EQ, attrTyp
                )]);
                this._attrCodesValueHelpDialog.open(sInputValue);
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
                    var uom = oSelectedItem.data('Uom');
                    var attribUom = this.byId(this.attribUom);
                    attribUom.setText(uom); //set the uom
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onProcessesValueHelp: function (oEvent) {
                //open process code value help
                var sInputValue = oEvent.getSource().getValue();
                this.inputId = oEvent.getSource().getId(); //get the input field id
                if (!this._processesValueHelpDialog) {
                    this._processesValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.Processes", this);
                    this.getView().addDependent(this._processesValueHelpDialog);
                }
                this._processesValueHelpDialog.open(sInputValue);
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
                var sInputValue = oEvent.getSource().getValue();
                this.inputId = oEvent.getSource().getId(); //get the input field id
                var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                var ProcessCd = oData.getProperty('Processcd'); //get the selected process code

                if (!this._VASTypeValueHelpDialog) {
                    this._VASTypeValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.VASTypes", this);
                    this.getView().addDependent(this._VASTypeValueHelpDialog);
                }
                //filter the items by process code selected
                this._VASTypeValueHelpDialog.getBinding("items").filter([new Filter(
                    "Vasproc",
                    sap.ui.model.FilterOperator.EQ, ProcessCd
                )]);
                this._VASTypeValueHelpDialog.open(sInputValue);
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
                var sInputValue = oEvent.getSource().getValue();
                this.inputId = oEvent.getSource().getId(); //get input field id
                if (!this._processAttrTypesValueHelpDialog) {
                    this._processAttrTypesValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.ProcessAttributeTypes", this);
                    this.getView().addDependent(this._processAttrTypesValueHelpDialog);
                }
                this._processAttrTypesValueHelpDialog.open(sInputValue);
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
                var sInputValue = oEvent.getSource().getValue();
                var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                var attrTyp = oData.getProperty('Attribtyp'); //get select attribute type
                this.inputId = oEvent.getSource().getId(); //get input field id
                if (!this._processAttrCodesValueHelpDialog) {
                    this._processAttrCodesValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.ProcessAttributeCodes", this);
                    this.getView().addDependent(this._processAttrCodesValueHelpDialog);
                }
                //filter attribute codes by attribute type
                this._processAttrCodesValueHelpDialog.getBinding("items").filter([new Filter(
                    "Attribtype",
                    sap.ui.model.FilterOperator.EQ, attrTyp
                )]);
                this._processAttrCodesValueHelpDialog.open(sInputValue);
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

            //******************************************* */
            // Common Functions
            //******************************************* */

            addLine: function (oEvent) {
                //adding lines to tables via model
                var oButton = oEvent.getSource();
                var tabName = oButton.data('TableName')
                var oTable = this.getView().byId(tabName);
                var oModel = this.getView().byId(tabName).getModel("DataModel");
                var oData = oModel.getProperty('/results');
                oData.push({});
                oTable.getBinding("rows").refresh();
                //oTable.setVisibleRowCount(oData.length);

                if (tabName === "generalTable") {
                    this.setGeneralAttrEditMode();
                    this.onGeneralAttrChange();
                } else if (tabName === "colorsTable") {
                    this.setColorCreateMode();
                    this.onColorChange();
                }
            },

            addProcessLine: function (oEvent) {
                //adding lines to process table via model, with sequence increment logic
                var oButton = oEvent.getSource();
                var tabName = oButton.data('TableName')
                var oTable = this.getView().byId(tabName);
                var oModel = this.getView().byId(tabName).getModel("DataModel");
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

            onDeleteTableItems: async function (oTableName, oFragmentName, oDialog) {
                var oTable = this.getView().byId(oTableName);
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
                            var oTableModel = oTable.getModel("DataModel");
                            var oData = oTableModel.getData();
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
                        var oTableModel = oTable.getModel("DataModel");
                        var oData = oTableModel.getData();
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

                    if (bProceed) {
                        if (!oDialog) {
                            oDialog = sap.ui.xmlfragment("zui3derp.view.fragments.dialog." + oFragmentName, this);
                            this.getView().addDependent(oDialog);
                        }
    
                        jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                        oDialog.addStyleClass("sapUiSizeCompact");
                        oDialog.open();

                        if (oTableName === "colorsTable" && noEdit > 0 && selected.length !== noEdit) {
                            oDialog.getContent()[0].getContent()[0].setProperty("text", noEditMsg.substring(0, noEditMsg.length - 2) + " already used in BOM.\r\n" + editMsg.substring(0, editMsg.length - 2) + " can be deleted.\r\n" + "Confirm delete color" + editMsg.substring(0, editMsg.length - 2).replace("Color","") + "?");
                        }
                        else if (oTableName === "versionsTable" && noEdit > 0 && selected.length !== noEdit) {
                            if (noEditMsg === "Version ") noEditMsg = sAddtlMessage;
                            else noEditMsg = noEditMsg.substring(0, noEditMsg.length - 2) + " already used in IO.\r\n" + sAddtlMessage;

                            oDialog.getContent()[0].getContent()[0].setProperty("text", noEditMsg + editMsg.substring(0, editMsg.length - 2) + " can be deleted.\r\n" + "Confirm delete version" + editMsg.substring(0, editMsg.length - 2).replace("Version","") + "?");
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

                if (editModelName === "ColorEditModeModel") {
                    var oTable = this.getView().byId("colorsTable");

                    oTable.getRows().forEach(row => {
                        row.getCells().forEach(cell => {
                            if (cell.getBindingInfo("value") !== undefined) {
                                cell.setProperty("editable", false);
                            }
                        });
                    })

                    this.byId("btnColorAdd").setVisible(true);
                }
            },

            setDtlsEnableButton(pEnable) {
                //General Attribute
                this.byId("btnGenAttrSave").setEnabled(pEnable);
                this.byId("btnGenAttrEdit").setEnabled(pEnable);
                this.byId("btnGenAttrDelete").setEnabled(pEnable);
                this.byId("btnGenAttrAdd").setEnabled(pEnable);
                this.byId("btnGenAttrCancel").setEnabled(pEnable);
               
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
                this.byId("btnVersionAdd").setEnabled(pEnable);
                this.byId("btnVersionCancel").setEnabled(pEnable);

                //Attachment
                this.byId("btnAttachmentDelete").setEnabled(pEnable);
                this.byId("btnAttachmentAdd").setEnabled(pEnable);
               

            },

            disableTabItem: function (tabName, itemName) {
                var oIconTabBar = this.byId(tabName);
                oIconTabBar.getItems().filter(item => item.getProperty("key") === itemName)
                    .forEach(item => item.setProperty("enabled", false));
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

                if (this.byId("colorsTable").getModel("DataModel") !== undefined && this.byId("colorsTable").getModel("DataModel").getData().results.length === 0) { this.disableTabItem("detailPanel","version"); }
                if (this.byId("sizesTable").getModel("DataModel") !== undefined && this.byId("sizesTable").getModel("DataModel").getData().results.length === 0) { this.disableTabItem("detailPanel","version"); }
            },

            onRefresh: function(oEvent) {
                var oButton = oEvent.getSource();
                var tabName = oButton.data('TableName')

                if (tabName === "ioTable") {
                    this.getIOs(true);
                }
            },

            //******************************************* */
            // IO List
            //******************************************* */
            getIOs: function(showProgress) {
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

            pad: Common.pad
        });
    });
