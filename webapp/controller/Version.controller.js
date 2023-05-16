sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
    "../js/Common",
    "../js/Constants",
    "../js/Utils",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    'sap/ui/core/routing/HashChanger',
    "../js/TableValueHelp"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, Common, Constants, Utils, JSONModel, History, MessageBox, HashChanger, TableValueHelp) {
        "use strict";

        var that;
        var blnGetComponentInd = false;

        return Controller.extend("zui3derp.controller.Version", {

            onInit: function () {
                that = this;

                //Initialize router
                var oComponent = this.getOwnerComponent();
                this._router = oComponent.getRouter();
                this._router.getRoute("RouteVersion").attachPatternMatched(this._routePatternMatched, this);

                //pivot arrays
                this._colors;
                this._sizes;

                if (sap.ui.getCore().byId("backBtn") !== undefined) {
                    this._fBackButton = sap.ui.getCore().byId("backBtn").mEventRegistry.press[0].fFunction;
                    sap.ui.getCore().byId("backBtn").mEventRegistry.press[0].fFunction = function (oEvent) {
                        that.onNavBack();
                    }
                }

                //Initialize translations
                this._i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                this._tableValueHelp = TableValueHelp;
            },

            onExit: function () {
                sap.ui.getCore().byId("backBtn").mEventRegistry.press[0].fFunction = this._fBackButton;
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

            _routePatternMatched: function (oEvent) {
                this._styleNo = oEvent.getParameter("arguments").styleno; //get style route parameter
                this._sbu = oEvent.getParameter("arguments").sbu; //get SBU route parameter
                this._version = oEvent.getParameter("arguments").version; //get version route parameter

                //set change flag to false at start
                this._versionAttrChanged = false;
                this._BOMbyGMCChanged = false;
                this._BOMbyUVChanged = false;
                this._materialListChanged = false;
                this._bomuvconfig = [];
                this._dataMode = "READ";
                this._aColumns = {};
                this._colFilters = {};
                this.getOwnerComponent().getModel("UI_MODEL").setProperty("/dataMode", "READ");
                this.setChangeStatus(false);

                //Load Search Helps
                Utils.getVersionSearchHelps(this);
                var lookUpData = this.getOwnerComponent().getModel("LOOKUP_MODEL").getData();

                if (lookUpData.AttribTypeModel === undefined) {
                    Utils.getReUseSearchHelps(this);
                    lookUpData = this.getOwnerComponent().getModel("LOOKUP_MODEL").getData();
                }
                else {
                    this.getView().setModel(new JSONModel(lookUpData.AttribTypeModel), "AttribTypeModel");
                    this.getView().setModel(new JSONModel(lookUpData.AttribCdModel), "AttribCdModel");
                    this.getView().setModel(new JSONModel(lookUpData.UOMModel), "UOMModel");
                    this.getView().setModel(new JSONModel(lookUpData.UOMGMCModel), "UOMGMCModel");
                    this.getView().setModel(new JSONModel(lookUpData.ProcessCodeModel), "ProcessCodeModel");
                }

                this.getView().setModel(new JSONModel(lookUpData.UsageClassModel), "UsageClassModel");
                this.getView().setModel(new JSONModel(lookUpData.MatTypeModel), "MatTypeModel");
                this.getView().setModel(new JSONModel(lookUpData.GMCModel), "GMCModel");
                this.getView().setModel(new JSONModel(lookUpData.StylesModel), "StylesModel");
                this.getView().setModel(new JSONModel(lookUpData.SupplyTypeModel), "SupplyTypeModel");
                this.getView().setModel(new JSONModel(lookUpData.VendorModel), "VendorModel");
                this.getView().setModel(new JSONModel(lookUpData.CurrencyModel), "CurrencyModel");
                this.getView().setModel(new JSONModel(lookUpData.PurchGroupModel), "PurchGroupModel");
                this.getView().setModel(new JSONModel(lookUpData.PurPlantModel), "PurPlantModel");

                //Get Data
                this.getHeaderData(); //get style version header data
                this.getVersionsData(); //get versions data
                this.getVersionsTable();

                //Close Edit Modes
                // this.cancelVersionAttrEdit();
                // this.cancelMaterialListEdit();
                // this.cancelBOMbyGMCEdit();
                // this.cancelBOMbyUVEdit();

                this.getAppAction();

                var cIconTabBar = this.getView().byId("versionTabBar");
                if (this.getOwnerComponent().getModel("UI_MODEL").getData().fromScreen === "ASSIGNMAT") {
                    cIconTabBar.setSelectedKey("matListItemTab");
                }
                else {
                    cIconTabBar.setSelectedKey("verAtrrItemTab");
                }

                this.closeEditModes();
                // this.getView().setModel(new JSONModel(this.getOwnerComponent().getModel("CAPTION_MSGS_MODEL").getData().text), "ddtext");
                this.getCaptionMsgs();

                if (this._GenericFilterDialog) { this._GenericFilterDialog.setModel(new JSONModel()); }
                this.byId("versionAttrTable").getColumns().forEach(col => col.setProperty("filtered", false));
                this.byId("bomGMCTable").getColumns().forEach(col => col.setProperty("filtered", false));
                this.byId("bomUVTable").getColumns().forEach(col => col.setProperty("filtered", false));
                this.byId("bomDetailedTable").getColumns().forEach(col => col.setProperty("filtered", false));
                this.byId("materialListTable").getColumns().forEach(col => col.setProperty("filtered", false));

                this.getColumnProp();
            },

            closeEditModes: function () {
                var oJSONModel = new JSONModel();
                var data = {};
                that._headerChanged = false;
                that._generalAttrChanged = false;
                that._colorChanged = false;
                that._sizeChanged = false;
                that._processChanged = false;
                that._versionChanged = false;

                that.getOwnerComponent().getModel("UI_MODEL").setProperty("/fromScreen", "VERSION");
                that.setChangeStatus(false);
                data.editMode = false;
                oJSONModel.setData(data);

                that.getView().setModel(oJSONModel, "VersionAttrEditModeModel");
                that.getView().setModel(oJSONModel, "MaterialListEditModeModel");
                that.getView().setModel(oJSONModel, "BOMbyGMCEditModeModel");
                that.getView().setModel(oJSONModel, "BOMbyUVEditModeModel");
            },

            setChangeStatus: function (changed) {
                //set change flag
                try {
                    sap.ushell.Container.setDirtyFlag(changed);
                } catch (err) { }
            },

            onRefresh: function () {
                this.getVersionsData();
            },

            onNavBack: function (oEvent) {
                console.log("dumaan dito")
                if (this._GenericFilterDialog) {
                    console.log("dumaan din dito")
                    this._GenericFilterDialog.setModel(new JSONModel());
                    this.byId("versionAttrTable").getColumns().forEach(col => col.setProperty("filtered", false));
                    this.byId("bomGMCTable").getColumns().forEach(col => col.setProperty("filtered", false));
                    this.byId("bomUVTable").getColumns().forEach(col => col.setProperty("filtered", false));
                    this.byId("bomDetailedTable").getColumns().forEach(col => col.setProperty("filtered", false));
                    this.byId("materialListTable").getColumns().forEach(col => col.setProperty("filtered", false));
                }

                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("RouteStyleDetail", {
                        styleno: that._styleNo,
                        sbu: that._sbu,
                        iono: ' '
                    });
                }
            },

            getCaptionMsgs: function () {
                var me = this;
                var oDDTextParam = [], oDDTextResult = {};
                var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_COMMON_SRV");

                oDDTextParam.push({ CODE: "ATTRIBTYP" });
                oDDTextParam.push({ CODE: "ATTRIBCD" });
                oDDTextParam.push({ CODE: "DESC" });
                oDDTextParam.push({ CODE: "ATTRIBVAL" });
                oDDTextParam.push({ CODE: "ATTRIBVALUNIT" });
                oDDTextParam.push({ CODE: "BOMITEM" });
                oDDTextParam.push({ CODE: "BOMITMTYP" });
                oDDTextParam.push({ CODE: "BOMSTYLE" });
                oDDTextParam.push({ CODE: "BOMSTYLVER" });
                oDDTextParam.push({ CODE: "PARTCD" });
                oDDTextParam.push({ CODE: "PARTDESC" });
                oDDTextParam.push({ CODE: "PARTCNT" });
                oDDTextParam.push({ CODE: "USGCLS" });
                oDDTextParam.push({ CODE: "CUSTSTYLE" });
                oDDTextParam.push({ CODE: "PROCESSCD" });
                oDDTextParam.push({ CODE: "COLOR" });
                oDDTextParam.push({ CODE: "SIZE" });
                oDDTextParam.push({ CODE: "DEST" });
                oDDTextParam.push({ CODE: "MATCONSPER" });
                oDDTextParam.push({ CODE: "PER" });
                oDDTextParam.push({ CODE: "UOM" });
                oDDTextParam.push({ CODE: "WASTAGE" });
                oDDTextParam.push({ CODE: "COMCONSUMP" });
                oDDTextParam.push({ CODE: "SEQ" });
                oDDTextParam.push({ CODE: "MATTYP" });
                oDDTextParam.push({ CODE: "MATNO" });
                oDDTextParam.push({ CODE: "GMC" });
                oDDTextParam.push({ CODE: "GMCDESC" });
                oDDTextParam.push({ CODE: "ADDTLDESC" });
                oDDTextParam.push({ CODE: "CONSUMP" });
                oDDTextParam.push({ CODE: "UOM" });
                oDDTextParam.push({ CODE: "SUPPLYTYP" });
                oDDTextParam.push({ CODE: "VENDORCD" });
                oDDTextParam.push({ CODE: "CURRENCYCD" });
                oDDTextParam.push({ CODE: "UNITPRICE" });
                oDDTextParam.push({ CODE: "PURGRP" });
                oDDTextParam.push({ CODE: "PURPLANT" });

                oDDTextParam.push({ CODE: "ORDERUOM" });
                oDDTextParam.push({ CODE: "UMREZ" });
                oDDTextParam.push({ CODE: "UMREN" });


                oDDTextParam.push({ CODE: "INFO_INPUT_REQD_FIELDS" });
                oDDTextParam.push({ CODE: "INFO_NO_DATA_EDIT" });
                oDDTextParam.push({ CODE: "INFO_NO_SEL_RECORD_TO_PROC" });
                oDDTextParam.push({ CODE: "INFO_NO_RECORD_TO_REMOVE" });

                oModel.create("/CaptionMsgSet", { CaptionMsgItems: oDDTextParam }, {
                    method: "POST",
                    success: function (oData, oResponse) {
                        oData.CaptionMsgItems.results.forEach(item => {
                            oDDTextResult[item.CODE] = item.TEXT;
                        })

                        me.getView().setModel(new JSONModel(oDDTextResult), "ddtext");
                        me.getOwnerComponent().getModel("CAPTION_MSGS_MODEL").setData({ text: oDDTextResult })
                    },
                    error: function (err) { }
                });
            },

            getColumnProp: async function () {
                var sPath = jQuery.sap.getModulePath("zui3derp", "/model/columns.json");

                var oModelColumns = new JSONModel();
                await oModelColumns.loadData(sPath);

                // var oColumns = oModelColumns.getData();
                this._oModelColumns = oModelColumns.getData();

                this.setTableValueHelp(this.byId("versionAttrTable"), "versionAttr");
                this.setTableValueHelp(this.byId("materialListTable"), "materialList");

                this.updateColumnMenu(this.byId("versionAttrTable"), "versionAttrTable");
                this.updateColumnMenu(this.byId("materialListTable"), "materialListTable");
                this.updateColumnMenu(this.byId("bomDetailedTable"), "bomDetailedTable");
            },

            setTableValueHelp: function (oTable, sTable) {
                var sColumnName = "", sTableModel = "", sColumnPath = "";

                oTable.getColumns().forEach(col => {
                    if (col.getAggregation("template").getBindingInfo("value") !== undefined) {
                        sColumnName = col.getAggregation("template").getBindingInfo("value").parts[0].path;

                        if (sColumnName.toUpperCase() === "ATTRIBTYP" || sColumnName.toUpperCase() === "ATTRIBCD" || sColumnName.toUpperCase() === "VALUNIT" || sColumnName.toUpperCase() === "SUPPLYTYP"
                            || sColumnName.toUpperCase() === "VENDORCD" || sColumnName.toUpperCase() === "CURRENCYCD" || sColumnName.toUpperCase() === "PURGRP" || sColumnName.toUpperCase() === "PURPLANT"
                            || sColumnName.toUpperCase() === "PROCESSCD" || sColumnName.toUpperCase() === "MATTYP" || sColumnName.toUpperCase() === "ENTRYUOM" || sColumnName.toUpperCase() === "GMC" || sColumnName.toUpperCase() === "BOMSTYLE") {
                            sTableModel = col.getAggregation("template").getBindingInfo("value").parts[0].model;

                            if (sTableModel !== "") {
                                sColumnPath = sTableModel + ">" + sColumnName;
                            }
                            else {
                                sColumnPath = sColumnName;
                            }

                            var bValueFormatter = false;
                            var vColProp = this._oModelColumns[sTable].filter(item => item.ColumnName === sColumnName.toUpperCase());
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

            formatTableValueHelp: function (sValue, sPath, sKey, sText, sFormat) {
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
                    col.attachColumnMenuOpen(function (oEvent) {
                        //Get Menu associated with column
                        var oMenu = col.getMenu();
                        var oMenuItem = new sap.ui.unified.MenuItem({
                            icon: "sap-icon://filter",
                            text: "Filter",
                            select: function (oEvent) {
                                console.log(oEvent.getSource())
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

            getHeaderData: function () {
                //get style header data 
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var oView = this.getView();
                var entitySet = "/StyleDetailSet('" + this._styleNo + "')"
                oModel.setUseBatch(false);

                Common.openLoadingDialog(that);

                oModel.read(entitySet, {
                    success: function (oData, oResponse) {
                        oData.SelectedVersion = me._version;
                        oJSONModel.setData(oData);
                        oView.setModel(oJSONModel, "headerData");
                        Common.closeLoadingDialog(that);
                        me.setChangeStatus(false);
                    },
                    error: function () {
                        Common.closeLoadingDialog(that);
                    }
                })

            },

            getVersionsData() {
                this.getColors(); //Get Colors
                this.getVersionAttrTable(); //Get version attributes
                this.getDetailedBOM(); //Get Detailed BOM
                this.getMaterialList(); //Get material list
            },

            //******************************************* */
            // Version Attributes
            //******************************************* */

            getVersionAttrTable: function () {
                //Get version attributes
                var oTable = this.getView().byId("versionAttrTable");
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var entitySet = "/StyleVersionAttributesSet"
                oModel.setHeaders({
                    styleno: this._styleNo,
                    verno: this._version
                });
                oModel.read(entitySet, {
                    success: function (oData, oResponse) {
                        oJSONModel.setData(oData);
                        oTable.setModel(oJSONModel, "DataModel");
                        oTable.bindRows("DataModel>/results");
                        //oTable.setVisibleRowCount(oData.results.length);
                        //oTable.attachPaste();
                    },
                    error: function () { }
                })
            },

            setVersionAttrEditMode: function () {
                //set version attributes table edit mode
                var oJSONModel = new JSONModel();
                var data = {};
                this._versionAttrChanged = false;
                data.editMode = true;
                oJSONModel.setData(data);
                this.getView().setModel(oJSONModel, "VersionAttrEditModeModel");
            },

            cancelVersionAttrEdit: function () {
                //confirm cancel edit of version attributes
                if (this._versionAttrChanged) {
                    if (!this._DiscardVersionAttrChangesDialog) {
                        this._DiscardVersionAttrChangesDialog = sap.ui.xmlfragment("zui3derp.view.fragments.dialog.DiscardVersionAttrChanges", this);
                        this.getView().addDependent(this._DiscardVersionAttrChangesDialog);
                    }
                    jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                    this._DiscardVersionAttrChangesDialog.addStyleClass("sapUiSizeCompact");
                    this._DiscardVersionAttrChangesDialog.open();
                } else {
                    this.closeVersionAttrEdit();
                }
            },

            closeVersionAttrEdit: function () {
                //close version attributes edit mode, reselect backend data
                var oJSONModel = new JSONModel();
                var data = {};
                that._versionAttrChanged = false;
                that.setChangeStatus(false);
                data.editMode = false;
                oJSONModel.setData(data);
                that.getView().setModel(oJSONModel, "VersionAttrEditModeModel");
                if (that._DiscardVersionAttrChangesDialog) {
                    that._DiscardVersionAttrChangesDialog.close();
                    that.getVersionAttrTable();
                }
                var oMsgStrip = that.getView().byId('VersionAttrMessageStrip');
                oMsgStrip.setVisible(false);

                this.lockStyleVer("O");
                this.byId("btnVersionAttrRemoveRow").setVisible(false);
                this._dataMode = "READ";
                this.getOwnerComponent().getModel("UI_MODEL").setProperty("/dataMode", "READ");

                var oTable = this.getView().byId("versionAttrTable");
                oTable.getRows().forEach(row => {
                    row.getCells().forEach(cell => {
                        if (cell.getBindingInfo("value") !== undefined || cell.getBindingInfo("selected") !== undefined) {
                            cell.setProperty("enabled", true);
                        }
                    });
                })

                this.getView().setModel(new JSONModel(this.getView().getModel("AttribCdModel").getData()), "AttribCodeModel");
            },

            onVersionAttrChange: function () {
                //set version attributes change flag
                this._versionAttrChanged = true;
                this.setChangeStatus(true);
            },

            onVersionAttrInputChange: function (oEvent) {
                //set version attributes change flag
                this._versionAttrChanged = true;
                this.setChangeStatus(true);

                if (oEvent !== undefined) {
                    var oSource = oEvent.getSource();

                    if (oSource.getBindingInfo("value") !== undefined) {
                        var sRowPath = oSource.oParent.getBindingContext("DataModel").sPath;
                        var vColPath = oSource.getBindingInfo("value").parts[0].path;

                        if (oEvent.getParameter("value") === "") {
                            this.byId("versionAttrTable").getModel("DataModel").setProperty(sRowPath + "/" + vColPath, "");

                            if (vColPath.toUpperCase() === "ATTRIBCD") {
                                this.byId("versionAttrTable").getModel("DataModel").setProperty(sRowPath + "/Desc1", "");
                            }
                        }
                        else {
                            this.byId("versionAttrTable").getModel("DataModel").setProperty(sRowPath + "/" + vColPath, oSource.getSelectedKey());

                            if (vColPath.toUpperCase() === "ATTRIBCD") {
                                this.getView().getModel("AttribCdModel").getData().results.filter(fItem => fItem.Attribcd === oSource.getSelectedKey()).forEach(item => {
                                    this.byId("versionAttrTable").getModel("DataModel").setProperty(sRowPath + "/Desc1", item.Desc1);
                                })
                            }
                        }
                    }
                }
            },

            onSaveVersionAttrTable: function () {
                //save changes to version attributes table
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("versionAttrTable").getModel("DataModel");
                var path;

                //initilaize message strip
                var oMsgStrip = this.getView().byId('VersionAttrMessageStrip');
                oMsgStrip.setVisible(false);

                if (!this._versionAttrChanged) { //check changed data
                    MessageBox.information(this._i18n.getText('t7'));
                    // Common.showMessage(this._i18n.getText('t7'));
                } else {
                    //build headers and payload
                    var oData = oTableModel.getData();
                    var oEntry = {
                        Styleno: this._styleNo,
                        Verno: this._version,
                        VersionToItems: []
                    }
                    for (var i = 0; i < oData.results.length; i++) {
                        var item = {
                            "Styleno": this._styleNo,
                            "Verno": this._version,
                            "Attribtyp": oData.results[i].Attribtyp,
                            "Attribcd": oData.results[i].Attribcd,
                            "Desc1": oData.results[i].Desc1,
                            "Attribval": oData.results[i].Attribval,
                            "Valunit": oData.results[i].Valunit,
                            "Attribseq": oData.results[i].Attribseq,
                        }
                        oEntry.VersionToItems.push(item);
                    };

                    var hasDuplicate = false;
                    oData.results.map(v => v.Attribtyp.toLowerCase() + v.Attribcd.toLowerCase()).sort().sort((a, b) => {
                        if (a == b) hasDuplicate = true
                    })
                    if (hasDuplicate) {
                        //Common.showMessage("Duplicate color is not allow");
                        // oMsgStrip.setVisible(true);
                        // oMsgStrip.setText("Duplicate Attribute is not allowed");
                        MessageBox.information("Duplicate Attribute is not allowed");
                        return;
                    }

                    MessageBox.confirm(this._i18n.getText('ConfirmSave'), {
                        actions: ["Yes", "No"],
                        onClose: function (sAction) {
                            if (sAction === "Yes") {
                                Common.openLoadingDialog(that);

                                path = "/VersionAttributesSet";
                                oModel.setHeaders({
                                    sbu: this._sbu
                                });
                                //call create deep method for version attributes
                                oModel.create(path, oEntry, {
                                    method: "POST",
                                    success: function (oData, oResponse) {
                                        me._versionAttrChanged = false;
                                        me.setChangeStatus(false);
                                        Common.closeLoadingDialog(me);
                                        me.setTabReadEditMode(false, "VersionAttrEditModeModel");
                                        // Common.showMessage(me._i18n.getText('t4'));
                                        MessageBox.information(me._i18n.getText('t4'));
                                    },
                                    error: function (err) {
                                        var errorMsg = JSON.parse(err.responseText).error.message.value;
                                        // oMsgStrip.setVisible(true);
                                        // oMsgStrip.setText(errorMsg);
                                        Common.closeLoadingDialog(me);
                                        // Common.showMessage(me._i18n.getText('t5'));
                                        MessageBox.information(me._i18n.getText('t5') + ": " + errorMsg);
                                    }
                                });
                            }
                        }
                    });

                }
            },

            onDeleteVersionAttr: function () {
                //confirm delete of selected version attributes
                this.onDeleteTableItems('versionAttrTable', 'ConfirmDeleteVersionAttr', this._ConfirmDeleteVersionAttr);
            },

            onConfirmDeleteVersionAttr: function (oEvent) {
                //on delete selected version attributes

                //get selected items to delete
                var oModel = this.getOwnerComponent().getModel();
                var oTable = this.getView().byId("versionAttrTable");
                var oTableModel = oTable.getModel("DataModel");
                var oData = oTableModel.getData();
                var selected = oTable.getSelectedIndices();

                oModel.setUseBatch(true);
                oModel.setDeferredGroups(["group1"]);

                // this._ConfirmDeleteVersionAttr.close();
                oEvent.getSource().getParent().close();

                if (selected.length > 0) {
                    //call delete method for each item selected
                    for (var i = 0; i < selected.length; i++) {

                        var verno = this._version;
                        var attrtype = oData.results[selected[i]].Attribtyp;
                        var attrcd = oData.results[selected[i]].Attribcd;

                        verno = this.pad(verno, 3);

                        var entitySet = "/StyleVersionAttributesSet(Styleno='" + that._styleNo + "',Verno='" + verno + "',Attribtyp='" + attrtype + "',Attribcd='" + attrcd + "')";
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
                    //remove selected items from the table
                    oData.results = oData.results.filter(function (value, index) {
                        return selected.indexOf(index) == -1;
                    })
                    oTableModel.setData(oData);
                    oTable.clearSelection();
                }
            },

            setVersionAttrEditModeControls: function () {
                //update to base on binding indices
                var oTable = this.getView().byId("versionAttrTable");

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

            //******************************************* */
            // Color Attributes
            //******************************************* */

            getColors: function () {
                //get color attributes
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                oModel.setHeaders({
                    styleno: this._styleNo
                });
                oModel.read("/StyleAttributesColorSet", {
                    success: function (oData, oResponse) {
                        oData.results.sort((a, b) => (a.Sortseq > b.Sortseq ? 1 : -1));
                        me._colors = oData.results;
                        me.getSizes();
                    },
                    error: function (err) { }
                });
            },

            //******************************************* */
            // Size Attributes
            //******************************************* */

            getSizes: function () {
                //get sizes attributes
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                oModel.setHeaders({
                    styleno: this._styleNo
                });
                oModel.read("/StyleAttributesSizeSet", {
                    success: function (oData, oResponse) {
                        me._sizes = oData.results;
                        me.getbomGMCTable();
                    },
                    error: function (err) { }
                });
            },

            //******************************************* */
            // BOM by GMC
            //******************************************* */

            getbomGMCTable: function (oGetComponentInd) {
                //get BOM by GMC data
                var me = this;
                var columnData = [];
                var oModel = this.getOwnerComponent().getModel();

                oModel.setHeaders({
                    sbu: this._sbu,
                    type: Constants.BOMGMC
                });

                Common.openLoadingDialog(that);
                var oJSONColumnsModel = new JSONModel();
                //get dynamic columns of BOM by GMC
                oModel.read("/DynamicColumnsSet", {
                    success: function (oData, oResponse) {
                        oData.results.forEach((column) => {
                            columnData.push({
                                "ColumnName": column.ColumnName,
                                "ColumnDesc": column.ColumnName,
                                "ColumnType": column.ColumnType,
                                "Editable": column.Editable,
                                "Mandatory": column.Mandatory,
                                "Visible": column.Visible
                            })
                        })
                        oJSONColumnsModel.setData(oData.results);
                        me.getView().setModel(oJSONColumnsModel, "bombByGMCColumns");
                        //pivot colors
                        me._colors.forEach((column) => {
                            columnData.push({
                                "ColumnName": column.Attribcd,
                                "ColumnDesc": column.Desc1,
                                "ColumnType": Constants.COLOR,
                                "Editable": column.Editable,
                                "Mandatory": false,
                                "Visible": true
                            })
                        })

                        me.getbomGMCTableData(columnData, oGetComponentInd); //get BOM by GMC actual data
                    },
                    error: function (err) {
                        Common.closeLoadingDialog(that);
                    }
                });
            },

            getbomGMCTableData: function (columnData, oGetComponentInd) {
                //get BOM by GMC actual data
                var me = this;

                var oTable = this.getView().byId("bomGMCTable");
                var oModel = this.getOwnerComponent().getModel();
                var rowData = {
                    items: []
                };

                //flag if STY items needs to retrieve Components
                var getComponent = "";
                if (oGetComponentInd) {
                    getComponent = "Y";
                }
                oModel.setHeaders({
                    styleno: this._styleNo,
                    verno: this._version,
                    getcomponent: getComponent
                });
                var usageClassModel = this.getOwnerComponent().getModel("LOOKUP_MODEL").getData().UsageClassModel;
                oModel.read("/StyleBOMGMCSet", {
                    success: function (oData, oResponse) {
                        oData.results.forEach(item => {
                            item.BOMSTYLVER = item.BOMSTYLVER === "0" ? "" : item.BOMSTYLVER;
                        })
                        rowData = oData.results;
                        //Filter UV selection based on UVs declared in the BOM by GMC
                        const filteredItems = usageClassModel.results.filter((item) => {
                            return rowData.some((obj) => {
                                return obj.USGCLS === item.Usgcls;
                            });
                        });
                        //assigned to UsageClassUVModel
                        that.getView().setModel(new JSONModel({ results: filteredItems }), "UsageClassUVModel");

                        var oJSONModel = new JSONModel();
                        oJSONModel.setData({
                            results: rowData,
                            columns: columnData
                        });

                        oTable.setModel(oJSONModel, "DataModel");
                        //oTable.setVisibleRowCount(oData.results.length);
                        oTable.attachPaste();

                        if (blnGetComponentInd) {
                            me.onSaveBOMbyGMC(oGetComponentInd);
                            blnGetComponentInd = false;
                        }

                        me.getBOMGMCColorsData(); //get pivot colors data
                        me.getbomUVTable();  //get BOM by UV data

                        // if(oGetComponentInd === true) {
                        //     me._BOMbyGMCChanged = true;
                        //     me.getbomUVTable(true); 
                        // }
                        // else{
                        //     me.getbomUVTable(); 
                        // }
                    },
                    error: function (err) {
                        Common.closeLoadingDialog(that);
                    }
                });
            },

            getBOMGMCColorsData: function () {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var pivot = me._colors;

                oModel.setHeaders({
                    styleno: this._styleNo,
                    verno: this._version
                });
                oModel.read("/StyleBOMGMCColorsSet", {
                    success: function (oData, oResponse) {
                        var rowData = oData.results;

                        //GMC Colors data
                        pivot = me._colors;

                        //Pivot colors data into BOM by GMC table
                        var oTableGMC = that.getView().byId("bomGMCTable");
                        var oGMCTableData = oTableGMC.getModel('DataModel').getData();
                        for (var i = 0; i < oGMCTableData.results.length; i++) {
                            for (var k = 0; k < pivot.length; k++) {
                                var colorName = pivot[k].Attribcd;
                                for (var j = 0; j < rowData.length; j++) {
                                    if (rowData[j].MATTYPCLS === Constants.ZCOLR && rowData[j].COLOR === colorName) {
                                        if (oGMCTableData.results[i].GMC === rowData[j].GMC && oGMCTableData.results[i].PARTCD === rowData[j].PARTCD && oGMCTableData.results[i].MATTYP === rowData[j].MATTYP) {
                                            oGMCTableData.results[i][colorName] = rowData[j].DESC1;
                                        }
                                    }
                                }
                            }
                        }

                        oTableGMC.getModel('DataModel').getData().results.forEach(item => {
                            pivot.forEach(c => {
                                if (item[c.Attribcd] === undefined) {
                                    item[c.Attribcd] = "";
                                }
                            })
                        })

                        oTableGMC.bindColumns("DataModel>/columns", function (sId, oContext) {
                            var column = oContext.getObject();
                            return new sap.ui.table.Column({
                                name: column.ColumnName,
                                label: that.getColumnDesc(column),
                                template: that.columnTemplate('GMC', column),
                                sortProperty: column.ColumnName,
                                // filterProperty: column.ColumnName,
                                width: that.getColumnSize(column),
                                id: "bomGMCTable" + "-" + column.ColumnName,
                                visible: column.Visible
                            });
                        });

                        me.setTableValueHelp(oTableGMC, "bomGMC");
                        me.updateColumnMenu(oTableGMC, "bomGMCTable");
                        Common.closeLoadingDialog(that);
                    },
                    error: function (err) {
                        Common.closeLoadingDialog(that);
                    }
                });
            },

            setBOMbyGMCEditMode: async function () {
                //set BOM by GMC table edit mode
                if (this._colors.length <= 0) { //allow edit only if colors are maintained
                    // Common.showMessage(this._i18n.getText('t11'));
                    MessageBox.information(this._i18n.getText('t11'));
                } else if (this._sizes <= 0) { //allow edit only if sizes are maintained
                    // Common.showMessage(this._i18n.getText('t12'));
                    MessageBox.information(this._i18n.getText('t12'));
                }
                else {
                    const result = await this.lockStyleVer("X");
                    if (result.Type != "S") {
                        MessageBox.warning(result.Message);
                    }
                    else {
                        var oJSONModel = new JSONModel();
                        var data = {};
                        this._BOMbyGMCChanged = false;
                        data.editMode = true;
                        oJSONModel.setData(data);
                        this.getView().setModel(oJSONModel, "BOMbyGMCEditModeModel");
                        console.log(this._dataMode)
                        //mark as required field
                        var oTable = this.getView().byId("bomGMCTable");
                        var oColumnsModel = this.getView().getModel("bombByGMCColumns");
                        var oColumnsData = oColumnsModel.getProperty('/');
                        oTable.getColumns().forEach((col, idx) => {
                            //console.log(col);
                            oColumnsData.filter(item => item.ColumnName === col.sId.split("-")[1])
                                .forEach(ci => {
                                    if (ci.Editable) {
                                        if (ci.Mandatory) {
                                            col.getLabel().addStyleClass("sapMLabelRequired");
                                        }
                                    }
                                });

                        });

                        this._dataMode = "EDIT";
                        this.getOwnerComponent().getModel("UI_MODEL").setProperty("/dataMode", "EDIT");
                        // this.setBOMbyGMCEditModeControls();
                    }
                }
            },

            cancelBOMbyGMCEdit: function () {
                //confirm cancel of edit BOM by GMC
                if (this._BOMbyGMCChanged) {
                    if (!this._DiscardBOMbyGMCDialog) {
                        this._DiscardBOMbyGMCDialog = sap.ui.xmlfragment("zui3derp.view.fragments.dialog.DiscardBOMbyGMCChanges", this);
                        this.getView().addDependent(this._DiscardBOMbyGMCDialog);
                    }
                    jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                    this._DiscardBOMbyGMCDialog.addStyleClass("sapUiSizeCompact");
                    this._DiscardBOMbyGMCDialog.open();
                } else {
                    this.closeBOMbyGMCEdit();
                }
            },

            closeBOMbyGMCEdit: function () {
                //close edit mode, reselect backend data
                var oJSONModel = new JSONModel();
                var data = {};
                that._BOMbyGMCChanged = false;
                that.setChangeStatus(false);
                data.editMode = false;
                oJSONModel.setData(data);
                that.getView().setModel(oJSONModel, "BOMbyGMCEditModeModel");
                if (that._DiscardBOMbyGMCDialog) {
                    that._DiscardBOMbyGMCDialog.close();
                    that.getbomGMCTable();
                }
                var oMsgStrip = that.getView().byId('BOMbyGMCMessageStrip');
                oMsgStrip.setVisible(false);

                this.lockStyleVer("O");
                this.byId("btnBOMGMCRemoveRow").setVisible(false);
                this._dataMode = "READ";
                this.getOwnerComponent().getModel("UI_MODEL").setProperty("/dataMode", "READ");

                var oTable = this.getView().byId("bomGMCTable");
                oTable.getRows().forEach(row => {
                    row.getCells().forEach(cell => {
                        if (cell.getBindingInfo("value") !== undefined || cell.getBindingInfo("selected") !== undefined) {
                            cell.setProperty("enabled", true);
                        }
                    });
                })

                //remove required field
                var oTable = this.getView().byId("bomGMCTable");
                var oColumnsModel = this.getView().getModel("bombByGMCColumns");
                var oColumnsData = oColumnsModel.getProperty('/');
                oTable.getColumns().forEach((col, idx) => {
                    //console.log(col);
                    oColumnsData.filter(item => item.ColumnName === col.sId.split("-")[1])
                        .forEach(ci => {
                            if (ci.Editable) {
                                if (ci.Mandatory) {
                                    col.getLabel().removeStyleClass("sapMLabelRequired");
                                }
                            }
                        });

                });

                this.getView().setModel(new JSONModel(this.getView().getModel("GMCModel").getData()), "MatTypGMCModel");
            },

            onBOMbyGMCChange: function (oEvent) {
                //set change flag for BOM by GMC
                that._BOMbyGMCChanged = true;
                that.setChangeStatus(true);

                //set the default Uom every change
                try {
                    var oTable = that.getView().byId("bomGMCTable");
                    var oTableModel = oTable.getModel('DataModel');
                    var oData = oTableModel.getData();
                    var gmc = that.getView().getModel('GMCModel').getData().results;

                    for (var i = 0; i < oData.results.length; i++) {
                        var gmcUom = gmc.find((item) => item.Gmc === oData.results[i].GMC)
                        if (gmcUom !== undefined) {
                            if (oData.results[i].ENTRYUOM === undefined || oData.results[i].ENTRYUOM === "") {
                                oData.results[i].ENTRYUOM = gmcUom.Baseuom;
                            }
                        }
                    }
                } catch (err) { }
            },

            onBOMbyGMCInputChange: function (oEvent) {
                //set change flag for BOM by GMC
                that._BOMbyGMCChanged = true;
                that.setChangeStatus(true);

                //set the default Uom every change
                try {
                    var oTable = that.getView().byId("bomGMCTable");
                    var oTableModel = oTable.getModel('DataModel');
                    var oData = oTableModel.getData();
                    var gmc = that.getView().getModel('GMCModel').getData().results;

                    for (var i = 0; i < oData.results.length; i++) {
                        var gmcUom = gmc.find((item) => item.Gmc === oData.results[i].GMC)
                        if (gmcUom !== undefined) {
                            if (oData.results[i].ENTRYUOM === undefined || oData.results[i].ENTRYUOM === "") {
                                oData.results[i].ENTRYUOM = gmcUom.Baseuom;
                            }
                        }
                    }
                    console.log(oEvent.getSource())
                    if (oEvent !== undefined) {
                        var oSource = oEvent.getSource();

                        if (oSource.getBindingInfo("value") !== undefined) {
                            var sRowPath = oSource.oParent.getBindingContext("DataModel").sPath;
                            var vColPath = oSource.getBindingInfo("value").parts[0].path;

                            if (oEvent.getParameter("value") === "") {
                                that.byId("bomGMCTable").getModel("DataModel").setProperty(sRowPath + "/" + vColPath, "");

                                if (vColPath.toUpperCase() === "GMC") {
                                    that.byId("bomGMCTable").getModel("DataModel").setProperty(sRowPath + "/GMCDESC", "");
                                }
                                else if (vColPath.toUpperCase() === "BOMSTYLE") {
                                    that.byId("bomGMCTable").getModel("DataModel").setProperty(sRowPath + "/BOMSTYLVER", "");
                                    that.byId("bomGMCTable").getModel("DataModel").setProperty(sRowPath + "/DESC1", "");
                                }
                            }
                            else {
                                that.byId("bomGMCTable").getModel("DataModel").setProperty(sRowPath + "/" + vColPath, oSource.getSelectedKey());

                                if (vColPath.toUpperCase() === "GMC") {
                                    that.getView().getModel("GMCModel").getData().results.filter(fItem => fItem.Gmc === oSource.getSelectedKey()).forEach(item => {
                                        that.byId("bomGMCTable").getModel("DataModel").setProperty(sRowPath + "/MATTYP", item.Mattyp);
                                        that.byId("bomGMCTable").getModel("DataModel").setProperty(sRowPath + "/ENTRYUOM", item.Baseuom);
                                        that.byId("bomGMCTable").getModel("DataModel").setProperty(sRowPath + "/GMCDESC", item.Desc1);
                                    })
                                }
                                else if (vColPath.toUpperCase() === "BOMSTYLE") {
                                    that.getView().getModel("StylesModel").getData().results.filter(fItem => fItem.Styleno === oSource.getSelectedKey()).forEach(item => {
                                        that.byId("bomGMCTable").getModel("DataModel").setProperty(sRowPath + "/BOMSTYLVER", item.Verno);
                                        that.byId("bomGMCTable").getModel("DataModel").setProperty(sRowPath + "/DESC1", item.Desc1);
                                    })
                                }
                            }
                        }
                    }
                } catch (err) { }
            },

            onBOMbyGMCLiveChange: function (oEvent) {
                //set BOM by GMC change flag
                that._BOMbyGMCChanged = true;
                that.setChangeStatus(true);

                var oSource = oEvent.getSource();
                var sColumnName = oSource.getBindingInfo("value").parts[0].path;
                var oTable = that.getView().byId("bomGMCTable");

                if (sColumnName === "MATCONSPER" || sColumnName === "PER" || sColumnName === "WASTAGE") {
                    var sRowPath = oSource.getBindingInfo("value").binding.oContext.sPath;
                    var vMatConsPer = oTable.getModel("DataModel").getProperty(sRowPath + '/MATCONSPER');
                    var vPer = oTable.getModel("DataModel").getProperty(sRowPath + '/PER');
                    var vWastage = oTable.getModel("DataModel").getProperty(sRowPath + '/WASTAGE');

                    if (sColumnName === "MATCONSPER") { vMatConsPer = oEvent.getParameters().value; }
                    else if (sColumnName === "PER") { vPer = oEvent.getParameters().value; }
                    else if (sColumnName === "WASTAGE") { vWastage = oEvent.getParameters().value; }

                    if (vMatConsPer === "" || vMatConsPer === undefined) { vMatConsPer = "0"; }
                    if (vPer === "" || vPer === undefined) { vPer = "0"; }
                    if (vWastage === "" || vWastage === undefined) { vWastage = "0"; }

                    var vCompConsump = (((+vPer) + (+vWastage)) * (+vMatConsPer));
                    oTable.getModel("DataModel").setProperty(sRowPath + '/COMCONSUMP', vCompConsump + "");
                    oTable.getModel("DataModel").setProperty(sRowPath + '/CONSUMP', vCompConsump + "");
                    // oTable.getModel("DataModel").setProperty("/results", oTable.getModel("DataModel").getData().results);
                    // oTable.bindRows("DataModel>/results");
                }
            },

            onSaveBOMbyGMC: function (oGetComponentInd) {
                //on save of BOM by GMC 
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("bomGMCTable").getModel("DataModel");
                var path;
                var item = {};

                var oMsgStrip = this.getView().byId('BOMbyGMCMessageStrip');
                oMsgStrip.setVisible(false);

                if (!this._BOMbyGMCChanged) { //check if data changed
                    // Common.showMessage(this._i18n.getText('t7'));
                    MessageBox.information(this._i18n.getText('t7'));
                } else {
                    //build headers and payload
                    var oData = oTableModel.getData();
                    var oEntry = {
                        Styleno: this._styleNo,
                        GMCToItems: []
                    }

                    for (var i = 0; i < oData.results.length; i++) {
                        item = that.addBOMItem(oData.results[i]);
                        oEntry.GMCToItems.push(item);
                    };
                    //Common.openLoadingDialog(that);
                    path = "/BOMGMCSet";

                    oModel.setHeaders({
                        sbu: this._sbu
                    });

                    var checkColor = [];
                    //ncjoaquin 12/13/2022. remove the validation
                    //01/10/2023 validate at least one required color per BOM/GMC item

                    for (var i = 0; i < oData.results.length; i++) {
                        //pivot colros only for AUV and ASUV
                        if (oData.results[i].USGCLS === Constants.AUV || oData.results[i].USGCLS === Constants.ASUV) {
                            const noOfColors = me._colors.length;
                            let noOfHasColor = 0;
                            for (var j = 0; j < me._colors.length; j++) {
                                var color = me._colors[j];
                                //console.log("color",oData.results[i][color.Attribcd]);
                                if (oData.results[i][color.Attribcd] != "" && oData.results[i][color.Attribcd] != undefined) {
                                    noOfHasColor++;
                                }
                                // if(oData.results[i][color.Attribcd]=="")
                                // {
                                //     oMsgStrip.setVisible(true);
                                //     oMsgStrip.setText("Color Description is required");
                                //     return;
                                // }

                            }

                            if (noOfHasColor == 0) {
                                // oMsgStrip.setVisible(true);
                                // oMsgStrip.setText("At least one color is required.");
                                MessageBox.information("At least one color is required.");
                                return;
                            }
                        }
                    };

                    MessageBox.confirm(this._i18n.getText('ConfirmSave'), {
                        actions: ["Yes", "No"],
                        onClose: function (sAction) {
                            if (sAction === "Yes") {
                                Common.openLoadingDialog(that);
                                //call create deep method for BOM by GMC
                                oModel.create(path, oEntry, {
                                    method: "POST",
                                    success: function (oDataRes, oResponse) {
                                        me._BOMbyGMCChanged = false;

                                        if (oGetComponentInd === true) {
                                            me.getbomGMCTable(true);
                                            me._BOMbyGMCChanged = true;
                                        } else {
                                            me.getbomGMCTable();
                                        }
                                        me.setTabReadEditMode(false, "BOMbyGMCEditModeModel")
                                        // Common.showMessage(me._i18n.getText('t4'));
                                        MessageBox.information(me._i18n.getText('t4'));

                                        //build the BOM by UV headers and payload - this is for the colors pivot
                                        var oEntry = {
                                            Styleno: me._styleNo,
                                            Verno: me._version,
                                            Usgcls: Constants.AUV,
                                            UVToItems: []
                                        }

                                        for (var i = 0; i < oData.results.length; i++) {
                                            //pivot colros only for AUV and ASUV
                                            if (oData.results[i].USGCLS === Constants.AUV || oData.results[i].USGCLS === Constants.ASUV) {
                                                for (var j = 0; j < me._colors.length; j++) {

                                                    var color = me._colors[j];
                                                    item = {
                                                        "Styleno": me._styleNo,
                                                        "Verno": me._version,
                                                        "Gmc": oData.results[i].GMC,
                                                        "Partcd": oData.results[i].PARTCD,
                                                        "Usgcls": oData.results[i].USGCLS,
                                                        "Color": color.Attribcd,
                                                        "Mattyp": oData.results[i].MATTYP,
                                                        "Mattypcls": Constants.ZCOLR,
                                                        "Desc1": oData.results[i][color.Attribcd],
                                                        "Consump": oData.results[i].CONSUMP,
                                                        "Wastage": oData.results[i].WASTAGE
                                                    };
                                                    oEntry.UVToItems.push(item);
                                                }
                                            }
                                        };

                                        if (oEntry.UVToItems.length > 0) {

                                            path = "/BOMUVSet";
                                            console.log(oEntry)
                                            oModel.setHeaders({
                                                sbu: me._sbu
                                            });
                                            //call create deep method for BOM by UV 
                                            oModel.create(path, oEntry, {
                                                method: "POST",
                                                success: function (oData, oResponse) {
                                                    me.getbomGMCTable();
                                                    me._BOMbyGMCChanged = false;
                                                    me.setChangeStatus(false);
                                                    me.lockStyleVer("O");
                                                    // MessageBox.information(me._i18n.getText('t4'));
                                                    // Common.showMessage(me._i18n.getText('t4'));
                                                },
                                                error: function (err) {
                                                    var errorMsg = JSON.parse(err.responseText).error.message.value;
                                                    // oMsgStrip.setVisible(true);
                                                    // oMsgStrip.setText(errorMsg);
                                                    // MessageBox.information(me._i18n.getText('t5') + ": " + errorMsg);
                                                    // Common.showMessage(me._i18n.getText('t5'));
                                                }
                                            });
                                        }
                                        Common.closeLoadingDialog(that);
                                    },
                                    error: function (err) {
                                        Common.closeLoadingDialog(that);
                                        // Common.showMessage(me._i18n.getText('t5'));
                                        var errorMsg = JSON.parse(err.responseText).error.message.value;
                                        // oMsgStrip.setVisible(true);
                                        // oMsgStrip.setText(errorMsg);
                                        MessageBox.information(me._i18n.getText('t5') + ": " + errorMsg);
                                    }
                                });
                            }
                        }
                    });
                }
            },

            onSaveGetComponents: function (oGetComponentInd) {
                //on save of BOM by GMC 
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("bomGMCTable").getModel("DataModel");
                var path;
                var item = {};

                var oMsgStrip = this.getView().byId('BOMbyGMCMessageStrip');
                oMsgStrip.setVisible(false);

                if (oGetComponentInd === true) {
                    me.getbomGMCTable(true);
                    me._BOMbyGMCChanged = true;
                }

                if (!this._BOMbyGMCChanged) { //check if data changed
                    // Common.showMessage(this._i18n.getText('t7'));
                    MessageBox.information(this._i18n.getText('t7'));
                } else {

                    //build headers and payload
                    var oData = oTableModel.getData();
                    var oEntry = {
                        Styleno: this._styleNo,
                        GMCToItems: []
                    }
                    for (var i = 0; i < oData.results.length; i++) {
                        item = that.addBOMItem(oData.results[i]);
                        oEntry.GMCToItems.push(item);
                    };
                    //Common.openLoadingDialog(that);

                    path = "/BOMGMCSet";

                    oModel.setHeaders({
                        sbu: this._sbu
                    });

                    var checkColor = [];

                    for (var i = 0; i < oData.results.length; i++) {
                        //pivot colros only for AUV and ASUV
                        if (oData.results[i].USGCLS === Constants.AUV || oData.results[i].USGCLS === Constants.ASUV) {
                            for (var j = 0; j < me._colors.length; j++) {
                                var color = me._colors[j];
                                if (oData.results[i][color.Attribcd] == "") {
                                    // oMsgStrip.setVisible(true);
                                    // oMsgStrip.setText("Color Description is required");
                                    MessageBox.information("Color Description is required");
                                    return;
                                }

                            }
                        }
                    };
                    Common.openLoadingDialog(that);
                    //call create deep method for BOM by GMC
                    oModel.create(path, oEntry, {
                        method: "POST",
                        success: function (oDataRes, oResponse) {
                            me._BOMbyGMCChanged = false;

                            // if(oGetComponentInd === true) {
                            //     me.getbomGMCTable(true);
                            //     me._BOMbyGMCChanged = true;
                            // } else {
                            //     me.getbomGMCTable();
                            // }
                            me.setTabReadEditMode(false, "BOMbyGMCEditModeModel")
                            // Common.showMessage(me._i18n.getText('t4'));
                            MessageBox.information(me._i18n.getText('t4'));

                            //build the BOM by UV headers and payload - this is for the colors pivot
                            var oEntry = {
                                Styleno: me._styleNo,
                                Verno: me._version,
                                Usgcls: Constants.AUV,
                                UVToItems: []
                            }

                            for (var i = 0; i < oData.results.length; i++) {
                                //pivot colros only for AUV and ASUV
                                if (oData.results[i].USGCLS === Constants.AUV || oData.results[i].USGCLS === Constants.ASUV) {
                                    for (var j = 0; j < me._colors.length; j++) {

                                        var color = me._colors[j];
                                        item = {
                                            "Styleno": me._styleNo,
                                            "Verno": me._version,
                                            "Gmc": oData.results[i].GMC,
                                            "Partcd": oData.results[i].PARTCD,
                                            "Usgcls": oData.results[i].USGCLS,
                                            "Color": color.Attribcd,
                                            "Mattyp": oData.results[i].MATTYP,
                                            "Mattypcls": Constants.ZCOLR,
                                            "Desc1": oData.results[i][color.Attribcd],
                                            "Consump": oData.results[i].CONSUMP,
                                            "Wastage": oData.results[i].WASTAGE
                                        };
                                        oEntry.UVToItems.push(item);
                                    }
                                }
                            };

                            if (oEntry.UVToItems.length > 0) {

                                path = "/BOMUVSet";

                                oModel.setHeaders({
                                    sbu: me._sbu
                                });
                                //call create deep method for BOM by UV 
                                oModel.create(path, oEntry, {
                                    method: "POST",
                                    success: function (oData, oResponse) {
                                        me.getbomGMCTable();
                                        me._BOMbyGMCChanged = false;
                                        me.setChangeStatus(false);
                                        // Common.showMessage(me._i18n.getText('t4'));
                                        MessageBox.information(me._i18n.getText('t4'));
                                    },
                                    error: function (err) {
                                        var errorMsg = JSON.parse(err.responseText).error.message.value;
                                        // oMsgStrip.setVisible(true);
                                        // oMsgStrip.setText(errorMsg);
                                        // Common.showMessage(me._i18n.getText('t5'));
                                        MessageBox.information(me._i18n.getText('t5') + ": " + errorMsg);
                                    }
                                });
                            }
                            Common.closeLoadingDialog(that);
                        },
                        error: function (err) {
                            Common.closeLoadingDialog(that);
                            // Common.showMessage(me._i18n.getText('t5'));
                            var errorMsg = JSON.parse(err.responseText).error.message.value;
                            // oMsgStrip.setVisible(true);
                            // oMsgStrip.setText(errorMsg);
                            MessageBox.information(me._i18n.getText('t5') + ": " + errorMsg);
                        }
                    });
                }
            },

            onDeleteBOMItems: function () {
                //confirm delete selected BOM items
                this.onDeleteTableItems('bomGMCTable', 'ConfirmDeleteBOMItems', this._ConfirmDeleteBOMDialog);
            },

            onConfirmDeleteBOMItems: function (oEvent) {
                //delete selected BOM items
                var me = this;
                var oModel = this.getOwnerComponent().getModel();

                //get selected items for deletion
                var oTable = this.getView().byId("bomGMCTable");
                var oTableModel = oTable.getModel("DataModel");
                var oData = oTableModel.getData();
                var selected = oTable.getSelectedIndices();

                oModel.setUseBatch(true);
                oModel.setDeferredGroups(["group1"]);

                // this._ConfirmDeleteBOMDialog.close();
                oEvent.getSource().getParent().close();

                if (selected.length > 0) {

                    //call delete method of BOM for each item selected
                    for (var i = 0; i < selected.length; i++) {
                        var verno = this._version;
                        var bomseq = oData.results[selected[i]].BOMSEQ;
                        if (bomseq !== "0") {
                            verno = this.pad(verno, 3);
                            bomseq = this.pad(bomseq, 3);

                            var entitySet = "/StyleBOMGMCSet(STYLENO='" + this._styleNo + "',VERNO='" + verno + "',BOMSEQ='" + bomseq + "')";

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
                    }
                    //remove deleted items from the table
                    oData.results = oData.results.filter(function (value, index) {
                        return selected.indexOf(index) == -1;
                    })
                    oTableModel.setData(oData);
                    oTable.clearSelection();
                }
            },

            onGetComponent: function () {
                //save first before get components
                this._BOMbyGMCChanged = true;
                this.onSaveBOMbyGMC(true);
                blnGetComponentInd = true;
            },

            setBOMbyGMCEditModeControls: function () {
                //update to base on binding indices
                var oTable = this.getView().byId("bomGMCTable");

                setTimeout(() => {
                    for (var i = 0; i < oTable.getModel("DataModel").getData().results.length; i++) {
                        var iRowIndex = oTable.getBinding("rows").aIndices[i];
                        var oRow = oTable.getRows()[iRowIndex];
                        var bNew = oTable.getContextByIndex(iRowIndex).getProperty("NEW");

                        oRow.getCells().forEach(cell => {
                            if ((bNew === undefined || !bNew) && this._dataMode === "NEW") {
                                if (cell.getBindingInfo("text") === undefined) {
                                    cell.setEnabled(false);
                                }
                            }
                            else {
                                if (cell.getBindingInfo("value") !== undefined || cell.getBindingInfo("selected") !== undefined) {
                                    if (cell.getProperty("editable")) { cell.setEnabled(true) }
                                    else { cell.setEnabled(false) }
                                }

                            }
                        })
                    }
                }, 100);
            },

            //******************************************* */
            // RMC
            //******************************************* */
            rmcConfirmDialog: function () {
                return new Promise(resolve => {
                    sap.m.MessageBox.confirm("RMC will only be executed for materials with GMC nos assigned. Continue?", {
                        actions: ["Yes", "No"],
                        onClose: function (sAction) {
                            resolve(sAction);
                        }
                    });
                });
            },

            onRMC: async function () {
                //RMC clicked
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("bomGMCTable").getModel("DataModel");
                var oData = oTableModel.getData();
                var item = {};
                console.log(oData)
                var oMsgStrip = this.getView().byId('BOMbyGMCMessageStrip');
                oMsgStrip.setVisible(false);

                //01/10/2023 add BOMGMCColorToItems parameter
                var oEntry2 = {
                    STYLENO: this._styleNo,
                    VERNO: this._version,
                    GMCToItems: []

                };
                //console.log(oData.results);
                //console.log("colors", me._colors);
                for (var i = 0; i < oData.results.length; i++) {
                    //pivot colros only for AUV and ASUV
                    if (oData.results[i].USGCLS === Constants.AUV || oData.results[i].USGCLS === Constants.ASUV) {
                        let noOfHasColor = 0;
                        for (var j = 0; j < me._colors.length; j++) {
                            var color = me._colors[j];
                            console.log(color)
                            //add items with color description only 
                            if (oData.results[i][color.Attribcd] != "" && oData.results[i][color.Attribcd] != undefined) {
                                item = {
                                    "STYLENO": me._styleNo,
                                    "BOMSEQ": oData.results[i].BOMSEQ,
                                    "BOMITEM": oData.results[i].BOMITEM,
                                    "VERNO": me._version,
                                    "BOMITMTYP": oData.results[i].BOMITMTYP,
                                    "GMC": oData.results[i].GMC,
                                    "PARTCD": oData.results[i].PARTCD,
                                    "USGCLS": oData.results[i].USGCLS,
                                    "COLOR": color.Attribcd,
                                    "MATTYP": oData.results[i].MATTYP,
                                    "MATTYPCLS": Constants.ZCOLR,
                                    "DESC1": oData.results[i][color.Attribcd]

                                };
                                oEntry2.GMCToItems.push(item);
                                console.log(item)
                                noOfHasColor++;
                            }
                        }
                        if (noOfHasColor == 0) {
                            // oMsgStrip.setVisible(true);
                            // oMsgStrip.setText("At least one color is required.");
                            MessageBox.information("At least one color is required.");
                            return;
                        }
                    }
                };
                let noOfGMC = 0;
                let noOfBomWGMC = 0
                noOfGMC = oData.results.filter(item => item.BOMITMTYP === "GMC");
                noOfBomWGMC = oData.results.filter(item => item.BOMITMTYP === "GMC" && item.GMC !== "");
                if (noOfGMC.length == 0) {
                    MessageBox.information("RMC is only possible for materials with assigned GMC");
                    return;
                }

                let resultDialog = "";
                if (noOfGMC.length > noOfBomWGMC.length) {
                    resultDialog = await this.rmcConfirmDialog();
                }
                console.log(resultDialog);
                if (resultDialog != "No") {
                    Common.openLoadingDialog(that);

                    //build header and payload
                    var entitySet = "/StyleBOMGMCSet(STYLENO='" + that._styleNo + "',VERNO='" + that._version + "',BOMSEQ='')";
                    oModel.setHeaders({ sbu: that._sbu });
                    var oEntry = {
                        STYLENO: that._styleNo,
                        VERNO: that._version
                    };
                    oModel.setHeaders({
                        sbu: that._sbu
                    });
                    //call update method of Style BOm by GMC
                    oModel.update(entitySet, oEntry, {
                        method: "PUT",
                        success: function (data, oResponse) {
                            me.onRefresh();
                            Common.closeLoadingDialog(me);
                            // Common.showMessage(me._i18n.getText('t4'));
                            MessageBox.information(me._i18n.getText('t4'));
                        },
                        error: function () {
                            Common.closeLoadingDialog(me);
                            // Common.showMessage(me._i18n.getText('t5'));
                            MessageBox.information(me._i18n.getText('t5'));
                        }
                    });
                }
                //console.log(JSON.stringify(oEntry2));
            },

            //******************************************* */
            // BOM by UV
            //******************************************* */

            getbomUVTable: function (oGetComponentInd) {
                //get BOM by UV 
                var me = this;
                var columnData = [];
                var oModelUV = this.getOwnerComponent().getModel();
                var usageClass = this.getView().byId("UsageClassCB").getSelectedKey();

                //flag if STY items needs to retrieve Components
                var getComponent = "";
                if (oGetComponentInd) {
                    getComponent = "Y";
                }

                oModelUV.setHeaders({
                    sbu: this._sbu,
                    type: Constants.BOMUV,
                    usgcls: usageClass,
                    getcomponent: getComponent
                });

                var pivotArray;
                if (usageClass === Constants.AUV) { //for AUV, pivot will be colors
                    pivotArray = me._colors;
                } else {
                    pivotArray = me._sizes;
                }

                // var pivotArray2 = jQuery.extend(true, [], pivotArray);

                // pivotArray = pivotArray.sort((a, b) => (a.Attribcd > b.Attribcd ? 1 : -1))
                // pivotArray.forEach(item => item.Attribcd = item.Attribcd.replace("/","-"))
                // console.log(pivotArray)
                //get dynamic columns of BOM by UV
                oModelUV.read("/DynamicColumnsSet", {
                    success: function (oData, oResponse) {
                        var columns = oData.results;

                        var pivotRow;
                        //find the column to pivot
                        for (var i = 0; i < columns.length; i++) {
                            if (columns[i].Pivot !== '') {
                                pivotRow = columns[i].Pivot;
                            }
                        }
                        //build the table dyanmic columns
                        for (var i = 0; i < columns.length; i++) {
                            if (columns[i].Pivot === pivotRow) {
                                //pivot the columns
                                for (var j = 0; j < pivotArray.length; j++) {
                                    columnData.push({
                                        "ColumnName": pivotArray[j].Attribcd,
                                        "ColumnDesc": pivotArray[j].Desc1,
                                        "ColumnType": pivotRow,
                                        "Editable": true,
                                        "Mandatory": false,
                                        "Visible": true
                                    })
                                }
                            } else {
                                if (columns[i].ColumnName !== pivotRow) {
                                    if (columns[i].Visible === true) {
                                        columnData.push({
                                            "ColumnName": columns[i].ColumnName,
                                            "ColumnDesc": columns[i].ColumnName,
                                            "ColumnType": columns[i].ColumnType,
                                            "Editable": columns[i].Editable,
                                            "Mandatory": columns[i].Mandatory
                                        })
                                    }
                                }
                            }
                        }
                        me.getbomUVTableData(columnData, pivotArray);
                    },
                    error: function (err) {
                        Common.closeLoadingDialog(that);
                    }
                });

                oModelUV.setHeaders({
                    sbu: this._sbu
                });
                oModelUV.read("/BOMUVConfigSet", {
                    success: function (oData, oResponse) {
                        me._bomuvconfig = oData.results;
                    },
                    error: function (err) { }
                });
            },

            getbomUVTableData: function (columnData, pivot) {
                //Get BOM by UV actual data
                var me = this;
                var oTable = this.getView().byId("bomUVTable");
                var oModel = this.getOwnerComponent().getModel();
                var usageClass = this.getView().byId("UsageClassCB").getSelectedKey();

                oModel.setHeaders({
                    styleno: this._styleNo,
                    verno: this._version,
                    usgcls: usageClass
                });
                oModel.read("/StyleBOMUVSet", {
                    success: function (oData, oResponse) {
                        var rowData = oData.results;
                        //Get unique items of BOM by UV
                        var unique = rowData.filter((rowData, index, self) =>
                            index === self.findIndex((t) => (t.GMC === rowData.GMC && t.PARTCD === rowData.PARTCD && t.MATTYPCLS === rowData.MATTYPCLS)));

                        //For every unique item
                        for (var i = 0; i < unique.length; i++) {
                            //Set the pivot column for each unique item
                            for (var j = 0; j < rowData.length; j++) {
                                // if (rowData[j].DESC1 !== "") {
                                if (unique[i].GMC === rowData[j].GMC && unique[i].PARTCD === rowData[j].PARTCD && unique[i].MATTYPCLS === rowData[j].MATTYPCLS) {
                                    for (var k = 0; k < pivot.length; k++) {
                                        var colname = pivot[k].Attribcd;

                                        if (rowData[j].COLOR === colname) {
                                            unique[i][colname] = rowData[j].DESC1;
                                        } else if (rowData[j].SZE === colname) {
                                            // console.log(colname)
                                            // console.log(rowData[j].DESC1)
                                            unique[i][colname] = rowData[j].DESC1;
                                            // console.log(unique[i][colname])
                                        }
                                    }
                                }
                                // }                                
                            }
                        }
                        // Object.keys(unique[0]).forEach(key => {
                        //     unique.map(val => val[key.replace("/","-")] = val[key])
                        // })
                        //set the table columns/rows
                        rowData = oData.results;
                        var oJSONModel = new JSONModel();
                        oJSONModel.setData({
                            results: unique,
                            columns: columnData
                        });
                        oTable.setModel(oJSONModel, "DataModel");
                        //oTable.setVisibleRowCount(unique.length);
                        //oTable.attachPaste();
                        oTable.bindColumns("DataModel>/columns", function (sId, oContext) {
                            var column = oContext.getObject();
                            return new sap.ui.table.Column({
                                name: column.ColumnName,
                                label: that.getColumnDesc(column),
                                template: that.columnTemplate('UV', column),
                                sortProperty: column.ColumnName,
                                // filterProperty: column.ColumnName,
                                width: that.getColumnSize(column),
                                // id:"bomGMCTable" + "-" + column.ColumnName
                            });
                        });

                        oTable.bindRows("DataModel>/results");
                        me.updateColumnMenu(oTable, "bomUVTable");

                        Common.closeLoadingDialog(that);
                    },
                    error: function (err) {
                        Common.closeLoadingDialog(that);
                    }
                });
            },

            getColumnDesc: function (column) {
                var desc;
                if (column.ColumnType === Constants.COLOR || column.ColumnType === Constants.SIZE) {
                    desc = column.ColumnDesc;
                } else {
                    desc = "{i18n>" + column.ColumnName + "}";
                }
                return desc;
            },

            setBOMbyUVEditMode: async function () {
                const result = await this.lockStyleVer("X");
                if (result.Type != "S") {
                    MessageBox.warning(result.Message);
                }
                else {
                    //set BOM by UV table edit mode
                    var oJSONModel = new JSONModel();
                    var data = {};
                    this._BOMbyUVChanged = false;
                    data.editMode = true;
                    oJSONModel.setData(data);
                    this.getView().setModel(oJSONModel, "BOMbyUVEditModeModel");

                    var bomuvconfig = this._bomuvconfig.filter(fItem => fItem.MATTYP !== '');
                    var oTable = this.getView().byId("bomUVTable");
                    var vUsgcls = "", vMattypcls = "";

                    oTable.getRows().forEach(row => {
                        var oConsump, oWastage;

                        row.getCells().forEach(cell => {
                            // console.log(cell);
                            if (cell.getBindingInfo("value") !== undefined) {
                                if (cell.getBindingInfo("value").parts[0].path === "USGCLS") {
                                    vUsgcls = cell.getValue();
                                }
                                else if (cell.getBindingInfo("value").parts[0].path === "CONSUMP") {
                                    oConsump = cell;
                                    oConsump.setEditable(false);
                                }
                                else if (cell.getBindingInfo("value").parts[0].path === "WASTAGE") {
                                    oWastage = cell;
                                    oWastage.setEditable(false);
                                }
                            }
                            else if (cell.getBindingInfo("text") !== undefined) {
                                if (cell.getBindingInfo("text").parts[0].path === "MATTYPCLS") {
                                    vMattypcls = cell.getText();
                                }
                            }
                        })

                        bomuvconfig.filter(fItem => fItem.UV === vUsgcls && fItem.MATTYP === vMattypcls).forEach(item => {
                            if (item.FIELD === "CONSUMP" && oConsump) {
                                oConsump.setEditable(true);
                            }
                            else if (item.FIELD === "WASTAGE" && oWastage) {
                                oWastage.setEditable(true);
                            }
                        })
                    })

                    bomuvconfig.filter(fItem => fItem.UV === vUsgcls && fItem.MATTYP === vMattypcls).forEach(item => {
                        if (item.FIELD === "CONSUMP" && oConsump) {
                            oConsump.setEditable(true);
                        }
                        else if (item.FIELD === "WASTAGE" && oWastage) {
                            oWastage.setEditable(true);
                        }
                    })

                    this._dataMode = "EDIT";
                    this.getOwnerComponent().getModel("UI_MODEL").setProperty("/dataMode", "EDIT");
                    this.setBOMbyUVEditModeControls();
                }
            },

            cancelBOMbyUVEdit: function () {
                //confirm cancel edit of BOm by UV table
                if (this._BOMbyUVChanged) {
                    if (!this._DiscardBOMbyUVDialog) {
                        this._DiscardBOMbyUVDialog = sap.ui.xmlfragment("zui3derp.view.fragments.dialog.DiscardBOMbyUVChanges", this);
                        this.getView().addDependent(this._DiscardBOMbyUVDialog);
                    }
                    jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                    this._DiscardBOMbyUVDialog.addStyleClass("sapUiSizeCompact");
                    this._DiscardBOMbyUVDialog.open();
                } else {
                    this.closeBOMbyUVEdit();
                }
            },

            closeBOMbyUVEdit: function () {
                //close edit mode, reselect backend data
                var oJSONModel = new JSONModel();
                var data = {};
                that._BOMbyUVChanged = false;
                that.setChangeStatus(false);
                data.editMode = false;
                oJSONModel.setData(data);
                that.getView().setModel(oJSONModel, "BOMbyUVEditModeModel");
                if (that._DiscardBOMbyUVDialog) {
                    that._DiscardBOMbyUVDialog.close();
                    that.getbomGMCTable();
                }
                var oMsgStrip = that.getView().byId('BOMbyUVMessageStrip');
                oMsgStrip.setVisible(false);

                this.lockStyleVer("O");
                this._dataMode = "READ";
                this.getOwnerComponent().getModel("UI_MODEL").setProperty("/dataMode", "READ");

                var oTable = this.getView().byId("bomUVTable");
                oTable.getRows().forEach(row => {
                    row.getCells().forEach(cell => {
                        if (cell.getBindingInfo("value") !== undefined || cell.getBindingInfo("selected") !== undefined) {
                            cell.setProperty("enabled", true);
                        }
                    });
                })
            },

            onBOMbyUVChange: function () {
                //set BOM by UV change flag
                that._BOMbyUVChanged = true;
                that.setChangeStatus(true);
            },

            onSaveBOMbyUV: function () {
                //Save BOM by UV changes
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("bomUVTable").getModel("DataModel");
                var usageClass = this.getView().byId("UsageClassCB").getSelectedKey();
                var path;
                var item = {};

                var oMsgStrip = this.getView().byId('BOMbyUVMessageStrip');
                oMsgStrip.setVisible(false);

                if (!this._BOMbyUVChanged) { //check changed data
                    // Common.showMessage(this._i18n.getText('t7'));
                    MessageBox.information(me._i18n.getText('t7'));
                } else {

                    //build headers and payload
                    var oData = oTableModel.getData();
                    var oEntry = {
                        Styleno: this._styleNo,
                        Verno: this._version,
                        Usgcls: usageClass,
                        UVToItems: []
                    }

                    var pivotArray;
                    if (usageClass === Constants.AUV) {
                        pivotArray = this._colors;
                    } else {
                        pivotArray = this._sizes;
                    }

                    // var color, size;
                    //each table item
                    for (var i = 0; i < oData.results.length; i++) {

                        //deconstruct the pivot columns into line items
                        for (var j = 0; j < pivotArray.length; j++) {

                            var attrib = pivotArray[j];
                            item = {
                                "Styleno": this._styleNo,
                                "Verno": this._version,
                                "Gmc": oData.results[i].GMC,
                                "Partcd": oData.results[i].PARTCD,
                                "Usgcls": oData.results[i].USGCLS,
                                "Color": ((oData.results[i].USGCLS === Constants.AUV) ? attrib.Attribcd : ''), //for AUV save on Color
                                "Sze": ((oData.results[i].USGCLS !== Constants.AUV) ? attrib.Attribcd : ''), //Non-AUV save on Sze
                                "Dest": " ",
                                "Mattyp": oData.results[i].MATTYP,
                                "Mattypcls": oData.results[i].MATTYPCLS,
                                "Attribcd": oData.results[i].ATTRIBCD,
                                "Desc1": oData.results[i][attrib.Attribcd],
                                "Consump": oData.results[i].CONSUMP,
                                "Wastage": oData.results[i].WASTAGE
                            };
                            oEntry.UVToItems.push(item);
                        }
                    };

                    MessageBox.confirm(this._i18n.getText('ConfirmSave'), {
                        actions: ["Yes", "No"],
                        onClose: function (sAction) {
                            if (sAction === "Yes") {
                                Common.openLoadingDialog(that);

                                path = "/BOMUVSet";

                                oModel.setHeaders({
                                    sbu: this._sbu
                                });
                                //call create deep method for BOM by UV
                                oModel.create(path, oEntry, {
                                    method: "POST",
                                    success: function (oData, oResponse) {
                                        me.getbomGMCTable();
                                        me._BOMbyUVChanged = false;
                                        me.setChangeStatus(false);
                                        me.lockStyleVer("O");
                                        me.setTabReadEditMode(false, "BOMbyUVEditModeModel")
                                        Common.closeLoadingDialog(that);
                                        // Common.showMessage(me._i18n.getText('t4'));
                                        MessageBox.information(me._i18n.getText('t4'));
                                    },
                                    error: function (err) {
                                        Common.closeLoadingDialog(that);
                                        // Common.showMessage(me._i18n.getText('t5'));
                                        var errorMsg = JSON.parse(err.responseText).error.message.value;
                                        // oMsgStrip.setVisible(true);
                                        // oMsgStrip.setText(errorMsg);
                                        MessageBox.information(me._i18n.getText('t5') + ": " + errorMsg);
                                    }
                                });
                            }
                        }
                    });
                }
            },

            setBOMbyUVEditModeControls: function () {
                //update to base on binding indices
                var oTable = this.getView().byId("bomUVTable");

                setTimeout(() => {
                    for (var i = 0; i < oTable.getModel("DataModel").getData().results.length; i++) {
                        var iRowIndex = oTable.getBinding("rows").aIndices[i];
                        var oRow = oTable.getRows()[iRowIndex];

                        oRow.getCells().forEach(cell => {
                            if (cell.getBindingInfo("value") !== undefined || cell.getBindingInfo("selected") !== undefined) {
                                if (cell.getProperty("editable")) { cell.setEnabled(true) }
                                else { cell.setEnabled(false) }
                            }
                        })
                    }
                }, 100);
            },

            //******************************************* */
            // Detailed BOM
            //******************************************* */

            getDetailedBOM: function () {
                //get detailed bom data
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var oTable = this.getView().byId("bomDetailedTable");
                var rowData = {
                    items: []
                };
                var data = { results: rowData };
                oModel.setHeaders({
                    styleno: this._styleNo,
                    verno: this._version
                });
                var entitySet = "/StyleDetailedBOMSet"
                oModel.read(entitySet, {
                    success: function (oData, oResponse) {
                        //build the tree table based on selected data
                        var style, gmc, partcd;
                        var item = {};
                        var item2 = {};
                        var items = [];
                        var items2 = [];

                        for (var i = 0; i < oData.results.length; i++) {

                            if (oData.results[i].Bomitmtyp === Constants.STY) { //highest level is STY

                                item = oData.results[i];
                                items = [];
                                style = oData.results[i].Bomstyle;

                                //add GMC items under the Style, add as child
                                for (var j = 0; j < oData.results.length; j++) {
                                    if (oData.results[j].Bomitmtyp === Constants.GMC && oData.results[j].Bomstyle === style) {

                                        items2 = [];
                                        item2 = oData.results[j];
                                        gmc = oData.results[j].Gmc;
                                        partcd = oData.results[j].Partcd;

                                        //add MAT items under the GMC, add as child
                                        for (var k = 0; k < oData.results.length; k++) {
                                            if (oData.results[k].Bomitmtyp === Constants.MAT && oData.results[k].Gmc === gmc && oData.results[k].Partcd === partcd) {
                                                items2.push(oData.results[k]);
                                            }
                                        }

                                        item2.items = items2;
                                        items.push(item2);
                                    }
                                }

                                item.items = items;
                                rowData.items.push(item);

                            } else if (oData.results[i].Bomitmtyp === Constants.GMC && oData.results[i].Bomstyle === '') {
                                //for GMC type, immediately add item
                                items = [];
                                item = oData.results[i];
                                gmc = oData.results[i].Gmc;
                                partcd = oData.results[i].Partcd;

                                //add MAT items under the GMC, add as child
                                for (var k = 0; k < oData.results.length; k++) {
                                    if (oData.results[k].Bomitmtyp === Constants.MAT && oData.results[k].Gmc === gmc && oData.results[k].Partcd === partcd) {
                                        items.push(oData.results[k]);
                                    }
                                }

                                item.items = items;
                                rowData.items.push(item);
                            }
                        }

                        oJSONModel.setData(data);
                        oTable.setModel(oJSONModel, "DataModel");
                    },
                    error: function () {
                    }
                })
            },

            //******************************************* */
            // Material List
            //******************************************* */

            getMaterialList: function () {
                //get material list
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var oTable = this.getView().byId("materialListTable");

                var entitySet = "/StyleMaterialListSet"
                oModel.setHeaders({
                    styleno: this._styleNo,
                    verno: this._version
                });
                oModel.read(entitySet, {
                    success: function (oData, oResponse) {
                        oJSONModel.setData(oData);
                        oTable.setModel(oJSONModel, "DataModel");
                        //oTable.setVisibleRowCount(oData.results.length);
                        //oTable.attachPaste();
                    },
                    error: function () {
                    }
                })
            },

            setMaterialListEditMode: async function () {
                const result = await this.lockStyleVer("X");
                if (result.Type != "S") {
                    MessageBox.warning(result.Message);
                }
                else {
                    //set material list edit mode
                    var oJSONModel = new JSONModel();
                    var data = {};
                    this._materialListChanged = false;
                    data.editMode = true;
                    oJSONModel.setData(data);
                    this.getView().setModel(oJSONModel, "MaterialListEditModeModel");

                    this._dataMode = "EDIT";
                    this.getOwnerComponent().getModel("UI_MODEL").setProperty("/dataMode", "EDIT");
                    this.setMaterialListEditModeControls();

                    var oTable = this.getView().byId("bomGMCTable");
                    var oColumnsModel = this.getView().getModel("bombByGMCColumns");
                    var oColumnsData = oColumnsModel.getProperty('/');
                        oTable.getColumns().forEach((col, idx) => {
                            //console.log(col);
                            oColumnsData.filter(item => item.ColumnName === col.sId.split("-")[1])
                                .forEach(ci => {
                                    if (ci.Editable) {
                                        if (ci.Mandatory) {
                                            col.getLabel().addStyleClass("sapMLabelRequired");
                                        }
                                    }
                                });

                    });
                }
            },

            cancelMaterialListEdit: function () {
                //confirm cancel material list edit
                if (this._materialListChanged) {
                    if (!this._DiscardMaterialListChangesDialog) {
                        this._DiscardMaterialListChangesDialog = sap.ui.xmlfragment("zui3derp.view.fragments.dialog.DiscardMaterialListChanges", this);
                        this.getView().addDependent(this._DiscardMaterialListChangesDialog);
                    }
                    jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                    this._DiscardMaterialListChangesDialog.addStyleClass("sapUiSizeCompact");
                    this._DiscardMaterialListChangesDialog.open();
                } else {
                    this.closeMaterialListEdit();
                }
            },

            closeMaterialListEdit: function () {
                //close edit mode, reselect backend data
                var oJSONModel = new JSONModel();
                var data = {};
                that._materialListChanged = false;
                that.setChangeStatus(false);
                data.editMode = false;
                oJSONModel.setData(data);
                that.getView().setModel(oJSONModel, "MaterialListEditModeModel");
                if (that._DiscardMaterialListChangesDialog) {
                    that._DiscardMaterialListChangesDialog.close();
                    that.getMaterialList();
                }
                var oMsgStrip = that.getView().byId('MaterialListMessageStrip');
                oMsgStrip.setVisible(false);

                this.lockStyleVer("O");
                this._dataMode = "READ";
                this.getOwnerComponent().getModel("UI_MODEL").setProperty("/dataMode", "READ");

                var oTable = this.getView().byId("materialListTable");
                oTable.getRows().forEach(row => {
                    row.getCells().forEach(cell => {
                        if (cell.getBindingInfo("value") !== undefined || cell.getBindingInfo("selected") !== undefined) {
                            cell.setProperty("enabled", true);
                        }
                    });
                })
            },

            onMaterialListChange: function () {
                //material list change flag
                this._materialListChanged = true;
                this.setChangeStatus(true);
            },

            onMaterialListInputChange: function (oEvent) {
                //material list change flag
                this._materialListChanged = true;
                this.setChangeStatus(true);

                if (oEvent !== undefined) {
                    var oSource = oEvent.getSource();

                    if (oSource.getBindingInfo("value") !== undefined) {
                        var sRowPath = oSource.oParent.getBindingContext("DataModel").sPath;
                        var vColPath = oSource.getBindingInfo("value").parts[0].path;

                        if (vColPath.toUpperCase() === "VENDORCD") {
                            if (oEvent.getParameter("value") === "") {
                                this.byId("materialListTable").getModel("DataModel").setProperty(sRowPath + "/Vendorcd", "");
                            }
                            else {
                                this.byId("materialListTable").getModel("DataModel").setProperty(sRowPath + "/Vendorcd", oSource.getSelectedKey());

                                this.getView().getModel("VendorModel").getData().results.filter(fItem => fItem.Lifnr === oSource.getSelectedKey()).forEach(item => {
                                    this.byId("materialListTable").getModel("DataModel").setProperty(sRowPath + "/Currencycd", item.Waers);
                                })
                            }
                        }
                        else {
                            if (oEvent.getParameter("value") === "") {
                                this.byId("materialListTable").getModel("DataModel").setProperty(sRowPath + "/" + vColPath, "");
                            }
                            else {
                                this.byId("materialListTable").getModel("DataModel").setProperty(sRowPath + "/" + vColPath, oSource.getSelectedKey());
                            }
                        }
                    }
                }
            },

            onSaveMaterialList: function () {
                //save material list changes
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("materialListTable").getModel("DataModel");
                var path;

                var oMsgStrip = this.getView().byId('MaterialListMessageStrip');
                oMsgStrip.setVisible(false);

                if (!this._materialListChanged) { //check changed data
                    // Common.showMessage(this._i18n.getText('t7'));
                    MessageBox.information(me._i18n.getText('t7'));
                } else {
                    //build headers and payload
                    var oData = oTableModel.getData();
                    var oEntry = {
                        Styleno: this._styleNo,
                        Sbu: this._sbu,
                        MatListToItems: []
                    }
                    for (var i = 0; i < oData.results.length; i++) {
                        var item = {
                            "Styleno": this._styleNo,
                            "Bommatid": oData.results[i].Bommatid,
                            "Verno": oData.results[i].Verno,
                            "Seqno": oData.results[i].Seqno,
                            "Matno": oData.results[i].Matno,
                            "Mattyp": oData.results[i].Mattyp,
                            "Gmc": oData.results[i].Gmc,
                            "Matconsump": oData.results[i].Matconsump,
                            "Wastage": oData.results[i].Wastage,
                            "Comconsump": oData.results[i].Comconsump,
                            "Consump": oData.results[i].Consump,
                            "Uom": oData.results[i].Uom,
                            "Supplytyp": oData.results[i].Supplytyp,
                            "Vendorcd": oData.results[i].Vendorcd,
                            "Currencycd": oData.results[i].Currencycd,
                            "Unitprice": oData.results[i].Unitprice,
                            "Purgrp": oData.results[i].Purgrp,
                            "Purplant": oData.results[i].Purplant,
                            "Matdesc1": oData.results[i].Matdesc1,
                            "Matdesc2": oData.results[i].Matdesc2
                        }
                        oEntry.MatListToItems.push(item);
                    };
                    MessageBox.confirm(this._i18n.getText('ConfirmSave'), {
                        actions: ["Yes", "No"],
                        onClose: function (sAction) {
                            if (sAction === "Yes") {
                                Common.openLoadingDialog(that);

                                path = "/MaterialListSet";
                                oModel.setHeaders({
                                    sbu: me._sbu //this._sbu
                                });
                                //call create deep method of Material list
                                oModel.create(path, oEntry, {
                                    method: "POST",
                                    success: function (oData, oResponse) {
                                        me.getMaterialList();
                                        me._materialListChanged = false;
                                        me.setChangeStatus(false);
                                        me.setTabReadEditMode(false, "MaterialListEditModeModel");
                                        me.lockStyleVer("O");
                                        Common.closeLoadingDialog(me);
                                        // Common.showMessage(me._i18n.getText('t4'));
                                        MessageBox.information(me._i18n.getText('t4'));
                                    },
                                    error: function (err) {
                                        Common.closeLoadingDialog(me);
                                        // Common.showMessage(me._i18n.getText('t5'));
                                        var errorMsg = JSON.parse(err.responseText).error.message.value;
                                        // oMsgStrip.setVisible(true);
                                        // oMsgStrip.setText(errorMsg);
                                        MessageBox.information(me._i18n.getText('t5') + ": " + errorMsg);
                                    }
                                });
                            }
                        }
                    });

                }
            },

            onAssignMaterial: function () {
                //addisng material button clicked, navigate to assign material page
                var oData = this.byId("materialListTable").getModel("DataModel").getData().results;

                if (oData.length > 0) {
                    if (oData.filter(fItem => fItem.Matno === "").length > 0) {
                        if (this._GenericFilterDialog) {
                            this._GenericFilterDialog.setModel(new JSONModel());
                            this.byId("versionAttrTable").getColumns().forEach(col => col.setProperty("filtered", false));
                            this.byId("bomGMCTable").getColumns().forEach(col => col.setProperty("filtered", false));
                            this.byId("bomUVTable").getColumns().forEach(col => col.setProperty("filtered", false));
                            this.byId("bomDetailedTable").getColumns().forEach(col => col.setProperty("filtered", false));
                            this.byId("materialListTable").getColumns().forEach(col => col.setProperty("filtered", false));
                        }

                        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                        oRouter.navTo("RouteAssignMaterial", {
                            styleno: this._styleNo,
                            sbu: this._sbu,
                            version: this._version
                        });
                    }
                    else {
                        MessageBox.information("No valid record for material no. creation.\r\nMaterial no assigned or deleted already.");
                    }
                }
                else {
                    MessageBox.information("No available record to process.");
                }
            },

            setMaterialListEditModeControls: function () {
                //update to base on binding indices
                var oTable = this.getView().byId("materialListTable");

                setTimeout(() => {
                    for (var i = 0; i < oTable.getModel("DataModel").getData().results.length; i++) {
                        var iRowIndex = oTable.getBinding("rows").aIndices[i];
                        var oRow = oTable.getRows()[iRowIndex];

                        oRow.getCells().forEach(cell => {
                            if (cell.getBindingInfo("value") !== undefined || cell.getBindingInfo("selected") !== undefined) {
                                if (cell.getProperty("editable")) { cell.setEnabled(true) }
                                else { cell.setEnabled(false) }
                            }
                        })
                    }
                }, 100);
            },

            //******************************************* */
            // BOM GMC / BOM UV Columns
            //******************************************* */
            columnTemplate: function (type, column) {
                //set the column template based on gynamic fields
                var me = this;
                var columnName = column.ColumnName;
                var columnType = column.ColumnType;
                var editModeCond, changeFunction, liveChangeFunction, inputChangeFunction;

                //setting the change function
                if (type === Constants.GMC) {
                    changeFunction = that.onBOMbyGMCChange;
                    liveChangeFunction = that.onBOMbyGMCLiveChange;
                    inputChangeFunction = that.onBOMbyGMCInputChange;
                    editModeCond = '${BOMbyGMCEditModeModel>/editMode} ? true : false';
                } else {
                    changeFunction = that.onBOMbyUVChange;
                    liveChangeFunction = that.onBOMbyUVChange;
                    inputChangeFunction = that.onBOMbyUVChange;
                    editModeCond = '${BOMbyUVEditModeModel>/editMode} ? true : false';
                }

                var oColumnTemplate;

                if (columnType === Constants.COLOR) {
                    //input for pivot color field
                    oColumnTemplate = new sap.m.Input({
                        value: "{DataModel>" + columnName + "}",
                        change: changeFunction,
                        liveChange: changeFunction,
                        // editable: "{= ${DataModel>USGCLS} === 'AUV' ? " + editModeCond + " : ${DataModel>USGCLS} === 'ASUV' ? " + editModeCond + " : false }",
                        editable: "{= ${DataModel>USGCLS} === 'AUV' || ${DataModel>USGCLS} === 'ASUV' || ${DataModel>USGCLS} === 'ASPOUV' || ${DataModel>USGCLS} === 'ASDUV' || ${DataModel>USGCLS} === 'ACSUV' ? " + editModeCond + " :  false }",
                        enabled: "{= ${UI_MODEL>/dataMode} === 'READ' ? true : ${DataModel>USGCLS} === 'AUV' || ${DataModel>USGCLS} === 'ASUV' || ${DataModel>USGCLS} === 'ASPOUV' || ${DataModel>USGCLS} === 'ASDUV' || ${DataModel>USGCLS} === 'ACSUV' ? " + editModeCond + " : false  }",
                        visible: true,
                        tooltip: "{DataModel>" + columnName + "}"
                    });
                } else {
                    //set bom item type dropdown options
                    if (columnName === "BOMITMTYP") {
                        oColumnTemplate = new sap.m.ComboBox({
                            value: "{DataModel>" + columnName + "}",
                            items: [{
                                key: Constants.GMC,
                                text: Constants.GMC
                            }, {
                                key: Constants.STY,
                                text: Constants.STY
                            }],
                            selectedKey: Constants.GMC,
                            change: changeFunction,
                            editable: ((column.Editable) ? "{= " + editModeCond + " }" : false),
                            visible: column.Visible,
                            tooltip: "{DataModel>" + columnName + "}"
                        });
                    } else if (columnName === "PROCESSCD") {
                        //setting process code input with value help
                        oColumnTemplate = new sap.m.Input({
                            value: "{DataModel>" + columnName + "}",
                            showValueHelp: true,
                            valueHelpRequest: that.onProcessesValueHelp.bind(that),
                            showSuggestion: true,
                            suggestionItems: {
                                path: "ProcessCodeModel>/results",
                                template: new sap.ui.core.ListItem({
                                    text: "{ProcessCodeModel>ProcessCd}",
                                    additionalText: "{ProcessCodeModel>Desc1}"
                                }),
                                templateShareable: false
                            },
                            change: inputChangeFunction,
                            liveChange: changeFunction,
                            editable: ((column.Editable) ? "{= ${DataModel>BOMITMTYP} === 'STY' ? false : " + editModeCond + " }" : false),
                            visible: column.Visible,
                            tooltip: "{DataModel>" + columnName + "}"
                        });
                    } else if (columnName === "MATTYP") {
                        //setting the material type input field with value help
                        oColumnTemplate = new sap.m.Input({
                            value: "{DataModel>" + columnName + "}",
                            showValueHelp: true,
                            valueHelpRequest: that.onMatTypeValueHelp.bind(that),
                            editable: ((column.Editable) ? "{= ${DataModel>BOMITMTYP} === 'STY' ? false : " + editModeCond + " }" : false),
                            visible: column.Visible,
                            showSuggestion: true,
                            suggestionItems: {
                                path: "MatTypeModel>/results",
                                template: new sap.ui.core.ListItem({
                                    text: "{MatTypeModel>Mattype}",
                                    additionalText: "{MatTypeModel>Desc1}"
                                }),
                                templateShareable: false
                            },
                            change: inputChangeFunction,
                            liveChange: changeFunction,
                            tooltip: "{DataModel>" + columnName + "}"
                        });
                    } else if (columnName === "USGCLS") {
                        //setting dropdown for usage class
                        oColumnTemplate = new sap.m.ComboBox({
                            value: "{DataModel>" + columnName + "}",
                            showSecondaryValues: true,
                            items: {
                                path: "UsageClassModel>/results",
                                template: new sap.ui.core.ListItem({
                                    text: "{UsageClassModel>Usgcls}",
                                    additionalText: "{UsageClassModel>Ucdesc1}"
                                }),
                                templateShareable: false
                            },
                            change: changeFunction,
                            editable: ((column.Editable) ? "{= ${DataModel>BOMITMTYP} === 'STY' ? false : " + editModeCond + " }" : false),
                            visible: column.Visible,
                            tooltip: "{DataModel>" + columnName + "}"
                        });

                    } else if (columnName === "GMC") {
                        //setting the GMC input with value help
                        oColumnTemplate = new sap.m.Input({
                            value: "{DataModel>" + columnName + "}",
                            showValueHelp: true,
                            showSuggestion: true,
                            valueHelpRequest: that.onGMCValueHelp.bind(that),
                            change: inputChangeFunction,
                            liveChange: liveChangeFunction,
                            editable: ((column.Editable) ? "{= ${DataModel>BOMITMTYP} === 'STY' ? false : " + editModeCond + " }" : false),
                            visible: column.Visible,
                            tooltip: "{DataModel>" + columnName + "}",

                        });
                    } else if (columnName === "BOMSTYLE") {
                        //setting Style input with value help
                        oColumnTemplate = new sap.m.Input({
                            value: "{DataModel>" + columnName + "}",
                            showValueHelp: true,
                            showSuggestion: true,
                            valueHelpRequest: that.onStyleValueHelp.bind(that),
                            change: inputChangeFunction,
                            liveChange: changeFunction,
                            editable: ((column.Editable) ? "{= ${DataModel>BOMITMTYP} === 'STY' ? " + editModeCond + " : false  }" : false),
                            enabled: ("{= ${UI_MODEL>/dataMode} === 'READ' ? true : ${DataModel>BOMITMTYP} === 'STY' ? " + editModeCond + " : false  }"),
                            visible: column.Visible,
                            tooltip: "{DataModel>" + columnName + "}"
                        });
                    } else if (columnName === "ENTRYUOM") {
                        //setting UOM input with value help
                        oColumnTemplate = new sap.m.Input({
                            value: "{DataModel>" + columnName + "}",
                            showValueHelp: true,
                            valueHelpRequest: that.onUomGMCValueHelp.bind(that),
                            editable: ((column.Editable) ? "{= ${DataModel>BOMITMTYP} === 'STY' ? false : " + editModeCond + " }" : false),
                            visible: column.Visible,
                            showSuggestion: true,
                            suggestionItems: {
                                path: "UOMGMCModel>/results",
                                template: new sap.ui.core.ListItem({
                                    text: "{UOMGMCModel>Valunit}",
                                    additionalText: "{UOMGMCModel>Desc1}"
                                }),
                                templateShareable: false
                            },
                            change: inputChangeFunction,
                            liveChange: changeFunction,
                            tooltip: "{DataModel>" + columnName + "}"
                        });
                    } else if (columnName === "BOMSTYLVER") {
                        //setting the GMC input with value help
                        oColumnTemplate = new sap.m.Input({
                            value: "{DataModel>" + columnName + "}",
                            change: changeFunction,
                            liveChange: liveChangeFunction,
                            editable: false,
                            enabled: ("{= ${UI_MODEL>/dataMode} === 'READ' ? true : false  }"),
                            visible: column.Visible,
                            tooltip: "{DataModel>" + columnName + "}"
                        });
                    } else if (columnName === "DESC1") {
                        //setting the GMC input with value help
                        oColumnTemplate = new sap.m.Input({
                            value: "{DataModel>" + columnName + "}",
                            change: changeFunction,
                            liveChange: liveChangeFunction,
                            editable: false,
                            enabled: ("{= ${UI_MODEL>/dataMode} === 'READ' ? true : false  }"),
                            visible: column.Visible,
                            tooltip: "{DataModel>" + columnName + "}"
                        });
                    } else if (columnName === "MATCONSPER" || columnName === "PER" || columnName === "WASTAGE") {
                        //setting the GMC input with value help
                        oColumnTemplate = new sap.m.Input({
                            value: "{DataModel>" + columnName + "}",
                            change: changeFunction,
                            liveChange: liveChangeFunction,
                            editable: ((column.Editable) ? "{= ${DataModel>BOMITMTYP} === 'STY' ? false : " + editModeCond + " }" : false),
                            visible: column.Visible,
                            tooltip: "{DataModel>" + columnName + "}"
                        });
                    } else {
                        //setting the default input field
                        if (column.Editable) {
                            oColumnTemplate = new sap.m.Input({
                                value: "{DataModel>" + columnName + "}",
                                change: changeFunction,
                                liveChange: changeFunction,
                                editable: ((column.Editable) ? "{= ${DataModel>BOMITMTYP} === 'STY' ? false : " + editModeCond + " }" : false),
                                visible: column.Visible,
                                tooltip: "{DataModel>" + columnName + "}"
                            })
                        } else {
                            //setting the default text field for uneditable fields
                            oColumnTemplate = new sap.m.Text({ text: "{DataModel>" + columnName + "}", tooltip: "{DataModel>" + columnName + "}" });
                        }
                    }
                }

                return oColumnTemplate;
            },

            addBOMItem: function (item) {
                //adding BOM item to the payload
                return {
                    "Styleno": this._styleNo,
                    "Verno": this._version,
                    "Bomseq": item.BOMSEQ,
                    "Bomitmtyp": item.BOMITMTYP,
                    "Bomstyle": item.BOMSTYLE,
                    "Bomstylver": item.BOMSTYLVER,
                    "Partcd": item.PARTCD,
                    "Partdesc": item.PARTDESC,
                    "Partcnt": item.PARTCNT,
                    "Usgcls": item.USGCLS,
                    "Custstyle": item.CUSTSTYLE,
                    "Mattyp": item.MATTYP,
                    "Gmc": item.GMC,
                    "Matno": item.REFMATNO,
                    "Entryuom": item.ENTRYUOM,
                    "Matconsper": item.MATCONSPER,
                    "Per": item.PER,
                    "Wastage": item.WASTAGE,
                    "Comconsump": item.COMCONSUMP,
                    "Consump": item.CONSUMP,
                    "Processcd": item.PROCESSCD,
                    "Refmatno": item.REFMATNO,
                    "Refmatdesc": item.REFMATDESC
                }
            },

            addLine: function (oEvent) {
                if (this._dataMode === "NEW") {
                    this.addAnotherLine(oEvent);
                }
                else {
                    //add line to tables
                    this._dataMode = "NEW";
                    this.getOwnerComponent().getModel("UI_MODEL").setProperty("/dataMode", "NEW");
                    var oButton = oEvent.getSource();
                    var tabName = oButton.data('TableName')
                    var oTable = this.getView().byId(tabName);
                    var oModel = oTable.getModel("DataModel");
                    var oData = oModel.getProperty('/results');
                    oData.forEach(item => item.ACTIVE = "");

                    var aNewRow = [{ NEW: true, ACTIVE: "X" }];
                    var aDataAfterChange = aNewRow.concat(oData);
                    oModel.setProperty('/results', aDataAfterChange);

                    // oData.push({});
                    // oTable.getBinding("rows").refresh();
                    // oTable.setVisibleRowCount(oData.length);

                    if (tabName === "versionAttrTable") {
                        //this.setVersionAttrEditMode();
                        this.setTabReadEditMode(true, "VersionAttrEditModeModel");
                        this.onVersionAttrChange();
                        this.setVersionAttrEditModeControls();
                    }
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

                var aNewRow = [{ NEW: true, ACTIVE: "X" }];
                var aDataAfterChange = aNewRow.concat(oData);

                oModel.setProperty('/results', aDataAfterChange);
                // oTable.getBinding("rows").refresh();

                if (tabName === "versionAttrTable") {
                    this.setVersionAttrEditModeControls();
                    this.byId("btnVersionAttrRemoveRow").setVisible(true);
                }
                else if (tabName === "bomGMCTable") {
                    this.setBOMbyGMCEditModeControls();
                    this.byId("btnBOMGMCRemoveRow").setVisible(true);
                }
            },

            addLineBOM: function (oEvent) {
                // if (this.getOwnerComponent().getModel("COLOR_MODEL").getData().items.length === 0) {
                //     MessageBox.information("No colors found.")
                // } else
                // {
                if (this._dataMode === "NEW") {
                    this.addAnotherLine(oEvent);
                }
                else {
                    //add lines to BOM by GMC table
                    this._dataMode = "NEW";
                    this.getOwnerComponent().getModel("UI_MODEL").setProperty("/dataMode", "NEW");
                    var oButton = oEvent.getSource();
                    var tabName = oButton.data('TableName')
                    var oTable = this.getView().byId(tabName);
                    var oModel = oTable.getModel("DataModel");
                    var oData = oModel.getProperty('/results');
                    oData.forEach(item => item.ACTIVE = "");

                    var aNewRow = [{
                        NEW: true,
                        ACTIVE: "X",
                        BOMITMTYP: "GMC"
                    }];
                    var aDataAfterChange = aNewRow.concat(oData);
                    oModel.setProperty('/results', aDataAfterChange);
                    // oData.push({});
                    // oTable.getBinding("rows").refresh();
                    //oTable.setVisibleRowCount(oData.length);

                    if (tabName === "bomGMCTable") {
                        this.setTabReadEditMode(true, "BOMbyGMCEditModeModel");
                        this.onBOMbyGMCChange();
                        this.setBOMbyGMCEditModeControls();
                    }

                    console.log(this._dataMode)
                }
                //mark as required field
                var oTable = this.getView().byId("bomGMCTable");
                var oColumnsModel = this.getView().getModel("bombByGMCColumns");
                var oColumnsData = oColumnsModel.getProperty('/');
                oTable.getColumns().forEach((col, idx) => {
                    //console.log(col);
                    oColumnsData.filter(item => item.ColumnName === col.sId.split("-")[1])
                        .forEach(ci => {
                            if (ci.Editable) {
                                if (ci.Mandatory) {
                                    col.getLabel().addStyleClass("sapMLabelRequired");
                                }
                            }
                        });

                });
                // }
            },

            removeNewLine: function (oEvent) {
                var oButton = oEvent.getSource();
                var tabName = oButton.data('TableName')
                var oTable = this.getView().byId(tabName);
                var oModel = oTable.getModel("DataModel");
                var oData = oModel.getProperty('/results');
                var oNewData = oData.filter(fItem => fItem.NEW === true);
                var aSelIndices = oTable.getSelectedIndices();
                var oTmpSelectedIndices = [];
                var bProceed = false;
                console.log(oData)
                if (oNewData.length > 0) {
                    if (aSelIndices.length > 0) {
                        aSelIndices.forEach(item => {
                            oTmpSelectedIndices.push(oTable.getBinding("rows").aIndices[item])
                        })

                        aSelIndices = oTmpSelectedIndices;
                        aSelIndices.sort((a, b) => (a < b ? 1 : -1));

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

                            if (tabName === "versionAttrTable") { this.setVersionAttrEditModeControls(); }
                            else if (tabName === "bomGMCTable") { this.setBOMbyGMCEditModeControls(); }
                        }
                        else {
                            MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_SEL_RECORD_TO_REMOVE"])
                        }
                    }
                    else {
                        var iIndexToActivate = -1;
                        console.log(oData)
                        oData.forEach((item, index) => {
                            if (item.ACTIVE === "X") {
                                oData.splice(index, 1);
                                oModel.setProperty('/results', oData);

                                if (tabName === "versionAttrTable") { this.setVersionAttrEditModeControls(); }
                                else if (tabName === "bomGMCTable") { this.setBOMbyGMCEditModeControls(); }
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
                        if (tabName === "generalTable") { this.byId("btnVersionAttrRemoveRow").setVisible(false); }
                        else if (tabName === "bomGMCTable") { this.byId("btnBOMGMCRemoveRow").setVisible(false); }
                    }
                }
                else {
                    MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_NO_RECORD_TO_REMOVE"]);
                }
            },

            onSorted: function (oEvent) {
                var oTable = oEvent.getSource();
                var sTabId = oTable.sId.split("--")[oTable.sId.split("--").length - 1];
                this._sActiveTableId = sTabId;

                if (this._dataMode !== "READ") {
                    if (sTabId === "versionAttrTable") { this.setVersionAttrEditModeControls(); }
                    else if (sTabId === "bomGMCTable") { this.setBOMbyGMCEditModeControls(); }
                    else if (sTabId === "bomUVTable") { this.setBOMbyUVEditModeControls(); }
                    else if (sTabId === "materialListTable") { this.setMaterialListEditModeControls(); }
                }
            },

            getVersionsTable: function () {
                //get versions data of style
                var oTable = this.getView().byId("versionsTable");
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var oJSONStylVerModel = new JSONModel();

                Common.openLoadingDialog(that);

                var entitySet = "/StyleVersionSet"
                oModel.setHeaders({
                    styleno: this._styleNo
                });
                oModel.read(entitySet, {
                    success: function (oData, oResponse) {
                        oJSONModel.setData(oData);
                        that.getView().setModel(oJSONModel, "VersionModel");
                        const versionData = oData.results.filter(item => item.Verno === that._version);
                        const versionDeleted = versionData[0].Deleted === "X" ? "DELETED" : "";
                        oJSONStylVerModel.setData(versionData);
                        that.getView().setModel(oJSONStylVerModel, "CurrStylVersion");
                        that.getView().getModel("CurrStylVersion").setProperty("/VersionDeleted", versionDeleted);
                        // that.getView().setModel("headerData").setProperty("/Statuscd","headerData");
                        // oTable.attachPaste();
                        Common.closeLoadingDialog(that);
                    },
                    error: function () {
                        Common.closeLoadingDialog(that);
                    }
                })
            },

            //******************************************* */
            // Search Helps
            //******************************************* */

            onAttrTypesValueHelp: function (oEvent) {
                //open Attribute Types value help
                TableValueHelp.handleTableValueHelp(oEvent, this);

                // var sInputValue = oEvent.getSource().getValue();
                // this.inputId = oEvent.getSource().getId(); //get input field id
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
                //on select Attribute Type
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = this.byId(this.inputId);
                    input.setValue(oSelectedItem.getTitle()); //set input field selected attribute type
                    this.onVersionAttrChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onAttrCodesValueHelp: function (oEvent) {
                //open Attribute Codes value help
                // var sInputValue = oEvent.getSource().getValue();
                // var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                // var attrTyp = oData.getProperty('Attribtyp'); //get Attribute Type value
                // this.inputId = oEvent.getSource().getId(); //get input field id
                // this.descId = oEvent.getSource().getParent().mAggregations.cells[2].getId();
                // if (!this._attrCodesValueHelpDialog) {
                //     this._attrCodesValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.AttributeCodes", this);
                //     this.getView().addDependent(this._attrCodesValueHelpDialog);
                // }
                // //filter Attribute Codes by Attribute Type
                // this._attrCodesValueHelpDialog.getBinding("items").filter([new Filter("Attribtyp", sap.ui.model.FilterOperator.EQ, attrTyp)]);
                // this._attrCodesValueHelpDialog.open(sInputValue);

                var sRowPath = oEvent.getSource().oParent.getBindingContext("DataModel").sPath;
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
                //search attribute codes
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Attribcd", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _attrCodesValueHelpClose: function (evt) {
                //on select Attribute Code
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = this.byId(this.inputId);
                    input.setValue(oSelectedItem.getTitle()); //set input field selected Attribute Code
                    this.onVersionAttrChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onUomValueHelp: function (oEvent) {
                //open UOM value help
                TableValueHelp.handleTableValueHelp(oEvent, this);

                // var sInputValue = oEvent.getSource().getValue();
                // this.inputId = oEvent.getSource().getId(); //get input field id
                // if (!this._uomValueHelpDialog) {
                //     this._uomValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.UoM", this);
                //     that.getView().addDependent(this._uomValueHelpDialog);
                // }
                // this._uomValueHelpDialog.open(sInputValue);
            },

            _uomValueHelpSearch: function (evt) {
                //search UOMs
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Valunit", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _uomValueHelpClose: function (evt) {
                //on select UOM
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = this.byId(this.inputId);
                    input.setValue(oSelectedItem.getTitle()); //set input field selected UOM
                    this.onVersionAttrChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onUomGMCValueHelp: function (oEvent) {
                //open UOM for BOM by GMC value help
                TableValueHelp.handleTableValueHelp(oEvent, this);

                // var sInputValue = oEvent.getSource().getValue();
                // that.inputId = oEvent.getSource().getId(); //get input field id
                // if (!that._uomGMCValueHelpDialog) {
                //     that._uomGMCValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.UoMGMC", that);
                //     that.getView().addDependent(that._uomGMCValueHelpDialog);
                // }
                // that._uomGMCValueHelpDialog.open(sInputValue);
            },

            _uomGMCValueHelpSearch: function (evt) {
                //search UOM
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Valunit", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _uomGMCValueHelpClose: function (evt) {
                //on select UOM for BOM by GMC
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = sap.ui.getCore().byId(that.inputId);
                    input.setValue(oSelectedItem.getTitle()); //set input field selected UOM
                    that.onBOMbyGMCChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onProcessesValueHelp: function (oEvent) {
                //open process codes value help
                console.log(this)
                TableValueHelp.handleTableValueHelp(oEvent, this);

                // var sInputValue = oEvent.getSource().getValue();
                // that.inputId = oEvent.getSource().getId(); //get input field id
                // if (!that._processesValueHelpDialog) {
                //     that._processesValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.Processes", that);
                //     that.getView().addDependent(that._processesValueHelpDialog);
                // }
                // that._processesValueHelpDialog.open(sInputValue);
            },

            _processesValueHelpSearch: function (evt) {
                //search process codes
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("ProcessCd", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _processesValueHelpClose: function (evt) {
                //on select process
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = sap.ui.getCore().byId(that.inputId);
                    input.setValue(oSelectedItem.getTitle()); //set input field selected process code
                    that.onBOMbyGMCChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onMatTypeValueHelp: function (oEvent) {
                //open Material Types value help
                TableValueHelp.handleTableValueHelp(oEvent, this);

                // var sInputValue = oEvent.getSource().getValue();
                // that.inputId = oEvent.getSource().getId(); //get input field id
                // if (!that._matTypeValueHelpDialog) {
                //     that._matTypeValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.MaterialTypes", that);
                //     that.getView().addDependent(that._matTypeValueHelpDialog);
                // }
                // that._matTypeValueHelpDialog.open(sInputValue);
            },

            _matTypeValueHelpSearch: function (evt) {
                //search Material Types
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Mattype", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _matTypeValueHelpClose: function (evt) {
                //on select Material Type
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = sap.ui.getCore().byId(that.inputId);
                    input.setValue(oSelectedItem.getTitle()); //set input field selected Material Type
                    that.onBOMbyGMCChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onGMCValueHelp: function (oEvent) {
                //open GMV value help
                // var sInputValue = oEvent.getSource().getValue();
                // var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                // that.materialType = oData.getProperty('MATTYP'); //get Material Type
                // that.inputId = oEvent.getSource().getId(); //get input field id

                // var oTable = that.getView().byId("bomGMCTable");
                // var oColumns = oTable.getColumns();

                // //Get input field ids of Material Type and GMC
                // for (var i = 0; i < oColumns.length; i++) {
                //     var name = oColumns[i].getName();
                //     if (name === Constants.MATTYP) {
                //         that.matType = oEvent.getSource().getParent().mAggregations.cells[i].getId();
                //     }
                //     if (name === Constants.ENTRYUOM) {
                //         that.baseUom = oEvent.getSource().getParent().mAggregations.cells[i].getId();
                //     }
                // }

                // if (!that._GMCValueHelpDialog) {
                //     that._GMCValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.GMC", that);
                //     that.getView().addDependent(that._GMCValueHelpDialog);
                // }
                // //filter GMC by Material Type
                // if (that.materialType !== undefined && that.materialType !== '') {
                //     that._GMCValueHelpDialog.getBinding("items").filter([new Filter(
                //         "Mattyp",
                //         sap.ui.model.FilterOperator.EQ, that.materialType
                //     )]);
                // }
                // that._GMCValueHelpDialog.open(sInputValue);

                var sRowPath = oEvent.getSource().oParent.getBindingContext("DataModel").sPath;
                var vMattyp = oEvent.getSource().oParent.oParent.getModel("DataModel").getProperty(sRowPath + "/MATTYP");
                console.log(vMattyp)
                if (vMattyp !== undefined && vMattyp !== "") {
                    if (this.getView().getModel("GMCModel").getData()[vMattyp] === undefined) {
                        var aModelData = this.getView().getModel("GMCModel").getData().results.filter(fItem => fItem.Mattyp === vMattyp);
                        var oModelData = {};
                        oModelData["results"] = aModelData;
                        this.getView().setModel(new JSONModel(oModelData), "MatTypGMCModel");
                        this.getView().getModel("GMCModel").setProperty("/" + vMattyp, aModelData);
                    }
                    else {
                        var oModelData = {};
                        oModelData["results"] = this.getView().getModel("GMCModel").getData()[vMattyp];
                        this.getView().setModel(new JSONModel(oModelData), "MatTypGMCModel");
                    }
                }
                else {
                    vMattyp = "results"
                    this.getView().setModel(new JSONModel(this.getView().getModel("GMCModel").getData()), "MatTypGMCModel");
                }

                TableValueHelp.handleTableValueHelp(oEvent, this);

                var oInput = oEvent.getSource();
                // var oSuggestionItems = oInput.getBindingInfo("suggestionItems");
                var oSuggestionItemsTemplate = oInput.getBindingInfo("suggestionItems").template;
                var oKey = "", oText = "", oAddtlText = "";
                var sPath = oInput.getBindingInfo("suggestionItems").path;

                if ("/" + vMattyp !== sPath) {
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
                        path: "GMCModel>/" + vMattyp,
                        length: 10000,
                        template: new sap.ui.core.ListItem({
                            key: "{GMCModel>" + oKey + "}",
                            text: "{GMCModel>" + oText + "}",
                            additionalText: oAddtlText !== "" ? "{GMCModel>" + oAddtlText + "}" : oAddtlText,
                        }),
                        templateShareable: false
                    });
                }
            },

            _GMCValueHelpSearch: function (evt) {
                //search GMC
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Gmc", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));

                //add filter GMC by Material Type
                if (that.materialType !== undefined && that.materialType !== '') {
                    that._GMCValueHelpDialog.getBinding("items").filter([new Filter(
                        "Mattyp",
                        sap.ui.model.FilterOperator.EQ, that.materialType
                    )]);
                }
            },

            _GMCValueHelpClose: function (evt) {
                //on select GMC
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = sap.ui.getCore().byId(that.inputId);
                    input.setValue(oSelectedItem.getTitle()); //set input field selected GMC
                    that.onBOMbyGMCChange();

                    var matTypeInput = sap.ui.getCore().byId(that.matType);
                    matTypeInput.setValue(oSelectedItem.getInfo()); //set Material Type field of GMC

                    var oBaseuom = oSelectedItem.data('Baseuom'); //get the Base UOM of GMC
                    var uomInput = sap.ui.getCore().byId(that.baseUom);
                    uomInput.setValue(oBaseuom); //set the Baseuom
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onStyleValueHelp: function (oEvent) {
                //open styles value help
                TableValueHelp.handleTableValueHelp(oEvent, this);

                // var sInputValue = oEvent.getSource().getValue();
                // that.inputId = oEvent.getSource().getId(); //get input field id
                // var oTable = that.getView().byId("bomGMCTable");
                // var oColumns = oTable.getColumns();

                // //get input field ids of Version and Description
                // for (var i = 0; i < oColumns.length; i++) {
                //     var name = oColumns[i].getName();
                //     if (name === Constants.BOMSTYLVER) {
                //         that.vernoInput = oEvent.getSource().getParent().mAggregations.cells[i].getId();
                //     }
                //     if (name === Constants.DESC1) {
                //         that.desc1Input = oEvent.getSource().getParent().mAggregations.cells[i].getId();
                //     }
                // }

                // if (!that._styleValueHelpDialog) {
                //     that._styleValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.Styles", that);
                //     that.getView().addDependent(that._styleValueHelpDialog);
                // }

                // that._styleValueHelpDialog.open(sInputValue);
            },

            _styleValueHelpSearch: function (evt) {
                //search Styles
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Styleno", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _styleValueHelpClose: function (evt) {
                //on select Style and Version
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    that.onBOMbyGMCChange();
                    var input = sap.ui.getCore().byId(that.inputId);
                    input.setValue(oSelectedItem.getDescription()); //set input field id selected style no

                    var vernoInput = sap.ui.getCore().byId(that.vernoInput);
                    var oVerno = oSelectedItem.data('Verno');
                    vernoInput.setValue(oVerno); //set version text field selected style version

                    var desc1Input = sap.ui.getCore().byId(that.desc1Input);
                    desc1Input.setValue(oSelectedItem.getTitle()); //set description text field selected style desc1
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onSupplyTypeValueHelp: function (oEvent) {
                //open Supply Type value help
                TableValueHelp.handleTableValueHelp(oEvent, this);

                // var sInputValue = oEvent.getSource().getValue();
                // that.inputId = oEvent.getSource().getId(); //get input field id
                // if (!that._supplyTypeValueHelpDialog) {
                //     that._supplyTypeValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.SupplyTypes", that);
                //     that.getView().addDependent(that._supplyTypeValueHelpDialog);
                // }
                // that._supplyTypeValueHelpDialog.open(sInputValue);
            },

            _supplyTypeValueHelpSearch: function (evt) {
                //search Supply Types
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Supplytype", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _supplyTypeValueHelpClose: function (evt) {
                //on select Supply Type
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = sap.ui.getCore().byId(that.inputId);
                    input.setValue(oSelectedItem.getTitle()); //set input field selected Supply Type
                    that.onMaterialListChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onVendorValueHelp: function (oEvent) {
                //open Vendor value help
                TableValueHelp.handleTableValueHelp(oEvent, this);

                // var sInputValue = oEvent.getSource().getValue();
                // that.inputId = oEvent.getSource().getId(); //get input field id

                // var oTable = that.getView().byId("materialListTable");
                // var oColumns = oTable.getColumns();

                // //Get input field id of Currency
                // for (var i = 0; i < oColumns.length; i++) {
                //     var name = oColumns[i].getFilterProperty();
                //     console.log(name)
                //     if (name === "Currencycd") {
                //         that.currency = oEvent.getSource().getParent().mAggregations.cells[i].getId();
                //     }
                // }

                // if (!that._vendorValueHelpDialog) {
                //     that._vendorValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.Vendors", that);
                //     that.getView().addDependent(that._vendorValueHelpDialog);
                // }

                // that._vendorValueHelpDialog.open(sInputValue);
            },

            _vendorValueHelpSearch: function (evt) {
                //search Vendors
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _vendorValueHelpClose: function (evt) {
                //on select Vendor
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = sap.ui.getCore().byId(that.inputId);
                    input.setValue(oSelectedItem.getTitle()); //set input field id selected Vendor
                    that.onMaterialListChange();

                    var oCurrency = oSelectedItem.data('Waers'); //get the Base UOM of GMC
                    var currencyInput = sap.ui.getCore().byId(that.currency);
                    currencyInput.setValue(oCurrency); //set the Baseuom
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onCurrencyValueHelp: function (oEvent) {
                //open Currency value help
                TableValueHelp.handleTableValueHelp(oEvent, this);

                // var sInputValue = oEvent.getSource().getValue();
                // that.inputId = oEvent.getSource().getId(); //get input field id
                // if (!that._currencyValueHelpDialog) {
                //     that._currencyValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.Currencies", that);
                //     that.getView().addDependent(that._currencyValueHelpDialog);
                // }

                // that._currencyValueHelpDialog.open(sInputValue);
            },

            _currencyValueHelpSearch: function (evt) {
                //search Vendors
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Waers", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _currencyValueHelpClose: function (evt) {
                //on select Vendor
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = sap.ui.getCore().byId(that.inputId);
                    input.setValue(oSelectedItem.getTitle()); //set input field selected Currency
                    that.onMaterialListChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onPurGroupValueHelp: function (oEvent) {
                //open Purchasing Group value help
                TableValueHelp.handleTableValueHelp(oEvent, this);

                // var sInputValue = oEvent.getSource().getValue();
                // that.inputId = oEvent.getSource().getId(); //get input field id
                // if (!that._purGroupValueHelpDialog) {
                //     that._purGroupValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.PurchasingGroups", that);
                //     that.getView().addDependent(that._purGroupValueHelpDialog);
                // }

                // that._purGroupValueHelpDialog.open(sInputValue);
            },

            _purGroupValueHelpSearch: function (evt) {
                //search Purchasing Groups
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Purgrp", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _purGroupValueHelpClose: function (evt) {
                //on select Purchasing Group
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = sap.ui.getCore().byId(this.inputId);
                    input.setValue(oSelectedItem.getTitle()); //set input field selected Purchasing Group
                    this.onMaterialListChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onPurPlantValueHelp: function (oEvent) {
                //open Purchasing Plant value help
                TableValueHelp.handleTableValueHelp(oEvent, this);

                // var sInputValue = oEvent.getSource().getValue();
                // that.inputId = oEvent.getSource().getId(); //get input field id
                // if (!that._purPlantValueHelpDialog) {
                //     that._purPlantValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.PurchasingPlants", that);
                //     that.getView().addDependent(that._purPlantValueHelpDialog);
                // }
                // that._purPlantValueHelpDialog.open(sInputValue);
            },

            _purPlantValueHelpSearch: function (evt) {
                //search Purchasing Plant
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _purPlantValueHelpClose: function (evt) {
                //on select Purchasing Plant
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = sap.ui.getCore().byId(that.inputId);
                    input.setValue(oSelectedItem.getTitle()); //set input field selected Purchasing Plant 
                    that.onMaterialListChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            handleTitleSelectorPress: function (oEvent) {
                var oSourceControl = oEvent.getSource(),
                    oControlDomRef = oEvent.getParameter("domRef"),
                    oView = this.getView();



                if (!this._pPopover) {
                    this._pPopover = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.Versions", this);
                    this._pPopover.attachSearch(this._versionValueHelpSearch);
                    oView.addDependent(this._pPopover);
                }

                this._pPopover.setModel(oSourceControl.getModel());
                // this._pPopover.open(oControlDomRef);
                this._pPopover.open();
            },

            _versionValueHelpSearch: function (evt) {
                //search seasons
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Verno", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _versionValueHelpClose: function (evt) {
                //on select version
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    console.log(oSelectedItem.getTitle());
                    if (this._GenericFilterDialog) {
                        this._GenericFilterDialog.setModel(new JSONModel());
                        this.byId("versionAttrTable").getColumns().forEach(col => col.setProperty("filtered", false));
                        this.byId("bomGMCTable").getColumns().forEach(col => col.setProperty("filtered", false));
                        this.byId("bomUVTable").getColumns().forEach(col => col.setProperty("filtered", false));
                        this.byId("bomDetailedTable").getColumns().forEach(col => col.setProperty("filtered", false));
                        this.byId("materialListTable").getColumns().forEach(col => col.setProperty("filtered", false));
                    }

                    const verno = oSelectedItem.getTitle();
                    that._router.navTo("RouteVersion", {
                        styleno: that._styleNo,
                        sbu: that._sbu,
                        version: verno
                    });
                    // var input = this.byId(this.inputId);
                    // input.setValue(oSelectedItem.getTitle()); //set input field selected value
                    // this.onHeaderChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            handleItemSelect: function (oEvent) {
                var oItem = oEvent.getParameter("listItem"),
                    oObjectHeader = this.byId("objectHeader");

                oObjectHeader.setTitle(oItem.getTitle());
                oObjectHeader.setBindingContext(oItem.getBindingContext());

                // note: We don't need to chain to the _pPopover promise, since this event-handler
                // is only called from within the loaded dialog itself.
                this.byId("myPopover").close();
            },

            handleSuggestion: function (oEvent) {
                var oInput = oEvent.getSource();
                var sInputField = oInput.getBindingInfo("value").parts[0].path;
                var sRowPath = oEvent.getSource().oParent.getBindingContext("DataModel").sPath;

                if (oInput.oParent.oParent.getId().indexOf("versionAttrTable") >= 0) {
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
                else if (oInput.oParent.oParent.getId().indexOf("bomGMCTable") >= 0) {
                    if (sInputField.toUpperCase() === "GMC") {
                        var vMattyp = oEvent.getSource().oParent.oParent.getModel("DataModel").getProperty(sRowPath + "/MATTYP");
                        console.log(vMattyp)
                        if (vMattyp !== undefined && vMattyp !== "") {
                            if (this.getView().getModel("GMCModel").getData()[vMattyp] === undefined) {
                                var aModelData = this.getView().getModel("GMCModel").getData().results.filter(fItem => fItem.Mattyp === vMattyp);
                                var oModelData = {};
                                oModelData["results"] = aModelData;
                                this.getView().setModel(new JSONModel(oModelData), "MatTypGMCModel");
                                this.getView().getModel("GMCModel").setProperty("/" + vMattyp, aModelData);
                            }
                            else {
                                var oModelData = {};
                                oModelData["results"] = this.getView().getModel("GMCModel").getData()[vMattyp];
                                this.getView().setModel(new JSONModel(oModelData), "MatTypGMCModel");
                            }
                        }
                        else {
                            vMattyp = "results";
                            this.getView().setModel(new JSONModel(this.getView().getModel("GMCModel").getData()), "MatTypGMCModel");
                        }

                        // var oSuggestionItems = oInput.getBindingInfo("suggestionItems");
                        var oSuggestionItemsTemplate = oInput.getBindingInfo("suggestionItems").template;
                        var oKey = "", oText = "", oAddtlText = "";
                        var sPath = oInput.getBindingInfo("suggestionItems").path;

                        if ("/" + vMattyp !== sPath) {
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
                                path: "GMCModel>/" + vMattyp,
                                length: 10000,
                                template: new sap.ui.core.ListItem({
                                    key: "{GMCModel>" + oKey + "}",
                                    text: "{GMCModel>" + oText + "}",
                                    additionalText: oAddtlText !== "" ? "{GMCModel>" + oAddtlText + "}" : oAddtlText,
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

            getColumnSize: function (oColumn) {
                //column width of fields
                var mSize = '8rem';
                if (oColumn.ColumnName === "GMCDESC") {
                    mSize = '28rem';
                } else if (oColumn.ColumnName === "PARTDESC") {
                    mSize = '16rem';
                } else if (oColumn.ColumnName === "PROCESSCD") {
                    mSize = '18rem';
                } else if (oColumn.ColumnName === "MATTYP") {
                    mSize = '16rem';
                } else if (oColumn.ColumnName === "ENTRYUOM") {
                    mSize = '11rem';
                } else if (oColumn.ColumnName === "BOMSTYLE") {
                    mSize = '10rem';
                }
                return mSize;
            },

            onDeleteTableItems: function (oTableName, oFragmentName, oDialog) {
                var oTable = this.getView().byId(oTableName);
                var selected = oTable.getSelectedIndices();
                if (selected.length > 0) {
                    if (!oDialog) {
                        oDialog = sap.ui.xmlfragment("zui3derp.view.fragments.dialog." + oFragmentName, this);
                        this.getView().addDependent(oDialog);
                    }
                    jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                    oDialog.addStyleClass("sapUiSizeCompact");
                    oDialog.open();
                } else {
                    // Common.showMessage(this._i18n.getText('t8'));
                    MessageBox.information(this._i18n.getText('t8'));
                }
            },

            onCloseDialog: function (oEvent) {
                oEvent.getSource().getParent().close();
            },

            setTabReadEditMode: function (dataMode, editModelName) {
                //set colors table editable
                var oJSONModel = new JSONModel();
                var data = {};
                this._colorChanged = false;
                data.editMode = dataMode;
                oJSONModel.setData(data);
                this.getView().setModel(oJSONModel, editModelName);

                if (!dataMode) {
                    this._dataMode = "READ";
                    this.getOwnerComponent().getModel("UI_MODEL").setProperty("/dataMode", "READ");
                }

                if (editModelName === "VersionAttrEditModeModel") {
                    if (this._dataMode === "NEW") {
                        this.byId("btnVersionAttrAdd").setVisible(true);
                        this.byId("btnVersionAttrRemoveRow").setVisible(true);
                    }
                    else {
                        this.byId("btnVersionAttrRemoveRow").setVisible(false);

                        var oTable = this.getView().byId("versionAttrTable");
                        oTable.getRows().forEach(row => {
                            row.getCells().forEach(cell => {
                                if (cell.getBindingInfo("value") !== undefined || cell.getBindingInfo("selected") !== undefined) {
                                    cell.setProperty("enabled", true);
                                }
                            });
                        })
                    }
                }
                else if (editModelName === "BOMbyGMCEditModeModel") {
                    if (this._dataMode === "NEW") {
                        this.byId("btnBOMGMCAdd").setVisible(true);
                        this.byId("btnBOMGMCRemoveRow").setVisible(true);
                    }
                    else {
                        this.byId("btnBOMGMCRemoveRow").setVisible(false);

                        var oTable = this.getView().byId("bomGMCTable");
                        oTable.getRows().forEach(row => {
                            row.getCells().forEach(cell => {
                                if (cell.getBindingInfo("value") !== undefined || cell.getBindingInfo("selected") !== undefined) {
                                    cell.setProperty("enabled", true);
                                }
                            });
                        })
                    }
                }
                else if (editModelName === "BOMbyUVEditModeModel") {
                    var oTable = this.getView().byId("bomUVTable");
                    oTable.getRows().forEach(row => {
                        row.getCells().forEach(cell => {
                            if (cell.getBindingInfo("value") !== undefined || cell.getBindingInfo("selected") !== undefined) {
                                cell.setProperty("enabled", true);
                            }
                        });
                    })
                }
                else if (editModelName === "MaterialListEditModeModel") {
                    var oTable = this.getView().byId("materialListTable");
                    oTable.getRows().forEach(row => {
                        row.getCells().forEach(cell => {
                            if (cell.getBindingInfo("value") !== undefined || cell.getBindingInfo("selected") !== undefined) {
                                cell.setProperty("enabled", true);
                            }
                        });
                    })
                }
            },

            lockStyleVer: async function (isLock) {
                return { "Type": "S", "Message": "Disable Locking" }
                var oModelLock = this.getOwnerComponent().getModel("ZGW_3DERP_LOCK_SRV");

                var oParamLock = {
                    STYLE_TAB: [{
                        StyleNo: this._styleNo,
                        VerNo: this._version,
                        Lock: isLock === "X" ? "X" : ""
                    }
                    ],
                    Iv_Count: 300,
                    STYLE_MSG: []
                }
                Common.openLoadingDialog(that);
                return new Promise((resolve, reject) => {
                    oModelLock.create("/ZERP_STYLVER", oParamLock, {
                        method: "POST",
                        success: function (data, oResponse) {
                            console.log("success Lock_ZERP_STYLver", data.STYLE_MSG.results[0]);
                            Common.closeLoadingDialog(that);
                            return resolve(data.STYLE_MSG.results[0]);
                        },
                        error: function (err) {
                            var error = err.message;
                            Common.closeLoadingDialog(that);
                            return resolve(error);
                            /*
                            var response = JSON.parse(err.responseText);
                            var error = response.error.innererror.errordetails;
                            var errSeverity = error[0].severity;
                            console.log(error[0]);
                             Common.closeLoadingDialog(that);
                             return resolve(error[0]);
                            */


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

            pad: Common.pad,

            onExport: Utils.onExport,

            //******************************************* */
            // Column Filtering
            //******************************************* */

            onColFilter: function (oEvent, sColumnLabel) {
                var oDDText = this.getView().getModel("ddtext").getData();

                var sTableId = "";

                if (typeof (oEvent) === "string") {
                    sTableId = oEvent;
                }
                else {
                    sTableId = oEvent.getSource().data("TableName");
                }

                if (this._aColumns["versionAttr"] === undefined) {
                    this._aColumns["versionAttr"] = [
                        { ColumnName: "Attribtyp", ColumnLabel: oDDText["ATTRIBTYP"], DataType: "STRING" },
                        { ColumnName: "Attribcd", ColumnLabel: oDDText["ATTRIBCD"], DataType: "STRING" },
                        { ColumnName: "Desc1", ColumnLabel: oDDText["DESC"], DataType: "STRING" },
                        { ColumnName: "Attribval", ColumnLabel: oDDText["ATTRIBVAL"], DataType: "NUMBER" },
                        { ColumnName: "Valunit", ColumnLabel: oDDText["ATTRIBVALUNIT"], DataType: "STRING" }
                    ];
                }

                if (sTableId === "bomGMCTable" && this._aColumns["bomGMC"] === undefined) {
                    this._aColumns["bomGMC"] = [];

                    this.byId(sTableId).getModel("DataModel").getData().columns.forEach(col => {
                        var vDataType = "STRING";
                        var oColumn = this.byId(sTableId).getColumns().filter(fItem => fItem.getProperty("name") === col.ColumnName)[0];
                        var vColLabel = oColumn.getAggregation("label").getProperty("text");

                        switch (col.ColumnName) {
                            case "BOMSEQ":
                            case "BOMSTYLVER":
                            case "PARTCNT":
                            case "MATCONSPER":
                            case "PER":
                            case "WASTAGE":
                            case "COMCONSUMP":
                            case "CONSUMP":
                                vDataType = "NUMBER"
                                break;
                            default:
                                vDataType = "STRING"
                                break;
                        }

                        this._aColumns["bomGMC"].push({
                            ColumnName: col.ColumnName, ColumnLabel: vColLabel, DataType: vDataType
                        })
                    })
                }

                if (sTableId === "bomUVTable" && this._aColumns["bomUV"] === undefined) {
                    this._aColumns["bomUV"] = [];

                    this.byId(sTableId).getModel("DataModel").getData().columns.forEach(col => {
                        var vDataType = "STRING";
                        var oColumn = this.byId(sTableId).getColumns().filter(fItem => fItem.getProperty("name") === col.ColumnName)[0];
                        var vColLabel = oColumn.getAggregation("label").getProperty("text");

                        switch (col.ColumnName) {
                            case "SEQNO":
                            case "CONSUMP":
                            case "WASTAGE":
                                vDataType = "NUMBER"
                                break;
                            default:
                                vDataType = "STRING"
                                break;
                        }

                        this._aColumns["bomUV"].push({
                            ColumnName: col.ColumnName, ColumnLabel: vColLabel, DataType: vDataType
                        })
                    })
                }

                if (this._aColumns["bomDetailed"] === undefined) {
                    this._aColumns["bomDetailed"] = [
                        { ColumnName: "Bomitem", ColumnLabel: oDDText["BOMITEM"], DataType: "STRING" },
                        { ColumnName: "Bomitmtyp", ColumnLabel: oDDText["BOMITMTYP"], DataType: "STRING" },
                        { ColumnName: "Bomstyle", ColumnLabel: oDDText["BOMSTYLE"], DataType: "STRING" },
                        { ColumnName: "Bomstylver", ColumnLabel: oDDText["BOMSTYLVER"], DataType: "NUMBER" },
                        { ColumnName: "Partcd", ColumnLabel: oDDText["PARTCD"], DataType: "STRING" },
                        { ColumnName: "Partdesc", ColumnLabel: oDDText["PARTDESC"], DataType: "STRING" },
                        { ColumnName: "Partcnt", ColumnLabel: oDDText["PARTCNT"], DataType: "NUMBER" },
                        { ColumnName: "Usgcls", ColumnLabel: oDDText["USGCLS"], DataType: "STRING" },
                        { ColumnName: "Custstyle", ColumnLabel: oDDText["CUSTSTYLE"], DataType: "STRING" },
                        { ColumnName: "Processcd", ColumnLabel: oDDText["PROCESSCD"], DataType: "STRING" },
                        { ColumnName: "Color", ColumnLabel: oDDText["COLOR"], DataType: "STRING" },
                        { ColumnName: "Sizes", ColumnLabel: oDDText["SIZE"], DataType: "STRING" },
                        { ColumnName: "Dest", ColumnLabel: oDDText["DEST"], DataType: "STRING" },
                        { ColumnName: "Mattyp", ColumnLabel: oDDText["MATTYP"], DataType: "STRING" },
                        { ColumnName: "Gmc", ColumnLabel: oDDText["GMC"], DataType: "STRING" },
                        { ColumnName: "Matno", ColumnLabel: oDDText["MATNO"], DataType: "STRING" },
                        { ColumnName: "Matconsper", ColumnLabel: oDDText["MATCONSPER"], DataType: "NUMBER" },
                        { ColumnName: "Per", ColumnLabel: oDDText["PER"], DataType: "NUMBER" },
                        { ColumnName: "Entryuom", ColumnLabel: oDDText["UOM"], DataType: "STRING" },
                        { ColumnName: "Wastage", ColumnLabel: oDDText["WASTAGE"], DataType: "NUMBER" },
                        { ColumnName: "Comconsump", ColumnLabel: oDDText["COMCONSUMP"], DataType: "NUMBER" },
                        { ColumnName: "Consump", ColumnLabel: oDDText["CONSUMP"], DataType: "NUMBER" }
                    ];
                }

                if (this._aColumns["materialList"] === undefined) {
                    this._aColumns["materialList"] = [
                        { ColumnName: "Seqno", ColumnLabel: oDDText["SEQ"], DataType: "NUMBER" },
                        { ColumnName: "Mattyp", ColumnLabel: oDDText["MATTYP"], DataType: "STRING" },
                        { ColumnName: "Matno", ColumnLabel: oDDText["MATNO"], DataType: "STRING" },
                        { ColumnName: "Gmc", ColumnLabel: oDDText["GMC"], DataType: "STRING" },
                        { ColumnName: "Gmcdesc", ColumnLabel: oDDText["GMCDESC"], DataType: "STRING" },
                        { ColumnName: "Matdesc1", ColumnLabel: oDDText["ADDTLDESC"], DataType: "STRING" },
                        { ColumnName: "Consump", ColumnLabel: oDDText["CONSUMP"], DataType: "NUMBER" },
                        { ColumnName: "Uom", ColumnLabel: oDDText["UOM"], DataType: "STRING" },
                        { ColumnName: "Supplytyp", ColumnLabel: oDDText["SUPPLYTYP"], DataType: "STRING" },
                        { ColumnName: "Vendorcd", ColumnLabel: oDDText["VENDORCD"], DataType: "STRING" },
                        { ColumnName: "Currencycd", ColumnLabel: oDDText["CURRENCYCD"], DataType: "STRING" },
                        { ColumnName: "Unitprice", ColumnLabel: oDDText["UNITPRICE"], DataType: "NUMBER" },
                        { ColumnName: "Purgrp", ColumnLabel: oDDText["PURGRP"], DataType: "STRING" },
                        { ColumnName: "Purplant", ColumnLabel: oDDText["PURPLANT"], DataType: "STRING" }
                    ];
                }

                var sDialogFragmentName = "zui3derp.view.fragments.dialog.GenericFilterDialog";

                if (!this._GenericFilterDialog) {
                    this._GenericFilterDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
                    this._GenericFilterDialog.setModel(new JSONModel());
                    this.getView().addDependent(this._GenericFilterDialog);
                }

                var oTable = this.byId(sTableId);
                var oTableColumns = jQuery.extend(true, [], this._aColumns[sTableId.replace("Table", "")]);
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

                if (sTableId === "bomDetailedTable") {
                    aData = jQuery.extend(true, [], oTable.getModel("DataModel").getData().results.items);
                    aData.forEach(data => {
                        data.items.forEach(item => {
                            aData.push(item);
                        })

                        delete data.items;
                    })
                }
                else {
                    aData = jQuery.extend(true, [], oTable.getModel("DataModel").getData().results);
                }

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
                // Object.keys(aData[0]).forEach(key => {
                //     aData.forEach(item => {
                //         Object.assign(item, { [key.toUpperCase()]: item[key] });
                //         delete item[key];
                //     })
                // })

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

                    oColumnValues[col.ColumnName].sort((a, b) => ((col.DataType === "NUMBER" ? +a.Value : (col.DataType === "DATETIME" ? (a.Value === "(blank)" ? "" : new Date(a.Value)) : a.Value)) > (col.DataType === "NUMBER" ? +b.Value : (col.DataType === "DATETIME" ? (b.Value === "(blank)" ? "" : new Date(b.Value)) : b.Value)) ? 1 : -1));

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
                this._GenericFilterDialogModel = jQuery.extend(true, [], oDialog.getModel());

                this._colFilters[sTableId] = jQuery.extend(true, {}, oDialog.getModel().getData());
                // this.getOwnerComponent().getModel("FILTER_MODEL").setProperty("/" + sTableId, this._colFilters[sTableId]);
            },

            onColFilterClear: function (oEvent) {
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

            onColFilterCancel: function (oEvent) {
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

            onColFilterConfirm: function (oEvent) {
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
            },

            onFilterItemPress: function (oEvent) {
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

            onFilterValuesSelectionChange: function (oEvent) {
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

            onSearchFilterValue: function (oEvent) {
                var oDialog = this._GenericFilterDialog;
                var oColumnValues = oDialog.getModel().getProperty("/values");
                var oCurrColumnValues = []; //oDialog.getModel().getProperty("/currValues");
                var oSearchValues = oDialog.getModel().getProperty("/search");
                var vSelectedColumn = oDialog.getModel().getProperty("/selectedColumn");
                var oTableValues = oDialog.getContent()[0].getDetailPages()[0].getContent()[0].getItems()[1].getItems()[0];
                var sQuery = "";
                var bAddSelection = false;
                var iStartSelection = -1, iEndSelection = -1;

                if (typeof (oEvent) === "string") {
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

            onCustomColFilterChange: function (oEvent) {
                var oDialog = this._GenericFilterDialog;

                if (!(oEvent.getSource().getSelectedKey() === undefined || oEvent.getSource().getSelectedKey() === "")) {
                    if (oEvent.getSource().getSelectedKey() === "BT") {
                        oDialog.getModel().setProperty("/panelUDFToVisible", true);
                    }
                    else {
                        oDialog.getModel().setProperty("/panelUDFToVisible", false);
                        // oDialog.getModel().setProperty("/customColFilterToVal", "");
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

            onSetUseColFilter: function (oEvent) {
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

            onRemoveColFilter: function (oEvent) {
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