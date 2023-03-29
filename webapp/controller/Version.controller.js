sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
    "../js/Common",
    "../js/Constants",
    "../js/Utils",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    'sap/ui/core/routing/HashChanger'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, Common, Constants, Utils, JSONModel, History, MessageBox, HashChanger) {
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

                //Initialize translations
                this._i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
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

                this.setChangeStatus(false);

                //Load Search Helps
                Utils.getVersionSearchHelps(this);
                var lookUpData = this.getOwnerComponent().getModel("LOOKUP_MODEL").getData();
                console.log(lookUpData.AttribTypeModel);

                if (lookUpData.AttribTypeModel == undefined) {
                    Utils.getReUseSearchHelps(this);
                    lookUpData = this.getOwnerComponent().getModel("LOOKUP_MODEL").getData();
                }
                this.getView().setModel(new JSONModel(lookUpData.AttribTypeModel), "AttribTypeModel");
                this.getView().setModel(new JSONModel(lookUpData.AttribCdModel), "AttribCdModel");
                this.getView().setModel(new JSONModel(lookUpData.UOMModel), "UOMModel");
                this.getView().setModel(new JSONModel(lookUpData.UOMGMCModel), "UOMGMCModel");
                this.getView().setModel(new JSONModel(lookUpData.ProcessCodeModel), "ProcessCodeModel");

                //Get Data
                this.getHeaderData(); //get style version header data
                this.getVersionsData(); //get versions data

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
                this.getView().setModel(new JSONModel(this.getOwnerComponent().getModel("CAPTION_MSGS_MODEL").getData().text), "ddtext");
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

                var oTable = this.getView().byId("versionAttrTable");
                oTable.getRows().forEach(row => {
                    row.getCells().forEach(cell => {
                        if (cell.getBindingInfo("value") !== undefined || cell.getBindingInfo("selected") !== undefined) {
                            cell.setProperty("enabled", true);
                        }
                    });
                })
            },

            onVersionAttrChange: function () {
                //set version attributes change flag
                this._versionAttrChanged = true;
                this.setChangeStatus(true);
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
                            "Valunit": oData.results[i].Valunit
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

            setVersionAttrEditModeControls: function() {
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
                        oData.results.sort((a,b) => (a.Sortseq > b.Sortseq ? 1 : -1));
                        console.log(oData.results)
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
                                "Visible": true
                            })
                        })
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
                oModel.read("/StyleBOMGMCSet", {
                    success: function (oData, oResponse) {
                        oData.results.forEach(item => {
                            item.BOMSTYLVER = item.BOMSTYLVER === "0" ? "" : item.BOMSTYLVER;
                        })
                        rowData = oData.results;
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

                        oTableGMC.bindColumns("DataModel>/columns", function (sId, oContext) {
                            var column = oContext.getObject();
                            return new sap.ui.table.Column({
                                name: column.ColumnName,
                                label: that.getColumnDesc(column),
                                template: that.columnTemplate('GMC', column),
                                sortProperty: column.ColumnName,
                                filterProperty: column.ColumnName,
                                width: that.getColumnSize(column)
                            });
                        });

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

                var oTable = this.getView().byId("bomGMCTable");
                oTable.getRows().forEach(row => {
                    row.getCells().forEach(cell => {
                        if (cell.getBindingInfo("value") !== undefined || cell.getBindingInfo("selected") !== undefined) {
                            cell.setProperty("enabled", true);
                        }
                    });
                })
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

            setBOMbyGMCEditModeControls: function() {
                //update to base on binding indices
                var oTable = this.getView().byId("bomGMCTable");

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
            // RMC
            //******************************************* */

            onRMC: function () {
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
                //console.log(oEntry);
                console.log(JSON.stringify(oEntry2));


                Common.openLoadingDialog(this);

                //build header and payload
                var entitySet = "/StyleBOMGMCSet(STYLENO='" + this._styleNo + "',VERNO='" + this._version + "',BOMSEQ='')";
                oModel.setHeaders({ sbu: this._sbu });
                var oEntry = {
                    STYLENO: this._styleNo,
                    VERNO: this._version
                };
                oModel.setHeaders({
                    sbu: this._sbu
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
                                if (rowData[j].DESC1 !== "") {
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
                                }

                                // console.log(rowData[j])
                            }
                        }
                        // Object.keys(unique[0]).forEach(key => {
                        //     unique.map(val => val[key.replace("/","-")] = val[key])
                        // })
                        // console.log(unique)
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
                                label: that.getColumnDesc(column),
                                template: that.columnTemplate('UV', column),
                                sortProperty: column.ColumnName,
                                filterProperty: column.ColumnName,
                                width: that.getColumnSize(column)
                            });
                        });
                        oTable.bindRows("DataModel>/results");

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
                    oTable.getRows().forEach(row => {
                        var oConsump, oWastage;
                        var vUsgcls = "", vMattypcls = "";

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
                        console.log(oData)
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
            },

            onMaterialListChange: function () {
                //material list change flag
                this._materialListChanged = true;
                this.setChangeStatus(true);
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
                    Common.openLoadingDialog(that);

                    path = "/MaterialListSet";
                    oModel.setHeaders({
                        sbu: this._sbu
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
            },

            onAssignMaterial: function () {
                //addisng material button clicked, navigate to assign material page
                var oData = this.byId("materialListTable").getModel("DataModel").getData().results;

                if (oData.length > 0) {
                    if (oData.filter(fItem => fItem.Matno === "").length > 0) {
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

            //******************************************* */
            // BOM GMC / BOM UV Columns
            //******************************************* */

            columnTemplate: function (type, column) {
                //set the column template based on gynamic fields
                var me = this;
                var columnName = column.ColumnName;
                var columnType = column.ColumnType;
                var editModeCond, changeFunction, liveChangeFunction;

                //setting the change function
                if (type === Constants.GMC) {
                    changeFunction = that.onBOMbyGMCChange;
                    liveChangeFunction = that.onBOMbyGMCLiveChange;
                    editModeCond = '${BOMbyGMCEditModeModel>/editMode} ? true : false';
                } else {
                    changeFunction = that.onBOMbyUVChange;
                    liveChangeFunction = that.onBOMbyUVChange;
                    editModeCond = '${BOMbyUVEditModeModel>/editMode} ? true : false';
                }

                var oColumnTemplate;
                if (columnType === Constants.COLOR) {
                    //input for pivot color field
                    oColumnTemplate = new sap.m.Input({
                        value: "{DataModel>" + columnName + "}",
                        change: changeFunction,
                        liveChange: changeFunction,
                        editable: "{= ${DataModel>USGCLS} === 'AUV' ? " + editModeCond + " : ${DataModel>USGCLS} === 'ASUV' ? " + editModeCond + " : false }",
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
                            valueHelpRequest: that.onProcessesValueHelp,
                            showSuggestion: true,
                            suggestionItems: {
                                path: "ProcessCodeModel>/results",
                                template: new sap.ui.core.ListItem({
                                    text: "{ProcessCodeModel>ProcessCd}",
                                    additionalText: "{ProcessCodeModel>Desc1}"
                                }),
                                templateShareable: false
                            },
                            change: changeFunction,
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
                            valueHelpRequest: that.onMatTypeValueHelp,
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
                            change: changeFunction,
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
                            valueHelpRequest: that.onGMCValueHelp,
                            change: changeFunction,
                            liveChange: liveChangeFunction,
                            editable: ((column.Editable) ? "{= ${DataModel>BOMITMTYP} === 'STY' ? false : " + editModeCond + " }" : false),
                            visible: column.Visible,
                            tooltip: "{DataModel>" + columnName + "}"
                        });
                    } else if (columnName === "BOMSTYLE") {
                        //setting Style input with value help
                        oColumnTemplate = new sap.m.Input({
                            value: "{DataModel>" + columnName + "}",
                            showValueHelp: true,
                            valueHelpRequest: that.onStyleValueHelp,
                            change: changeFunction,
                            liveChange: changeFunction,
                            editable: ((column.Editable) ? "{= ${DataModel>BOMITMTYP} === 'STY' ? " + editModeCond + " : false  }" : false),
                            visible: column.Visible,
                            tooltip: "{DataModel>" + columnName + "}"
                        });
                    } else if (columnName === "ENTRYUOM") {
                        //setting UOM input with value help
                        oColumnTemplate = new sap.m.Input({
                            value: "{DataModel>" + columnName + "}",
                            showValueHelp: true,
                            valueHelpRequest: that.onUomGMCValueHelp,
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
                            change: changeFunction,
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
                    var oButton = oEvent.getSource();
                    var tabName = oButton.data('TableName')
                    var oTable = this.getView().byId(tabName);
                    var oModel = oTable.getModel("DataModel");
                    var oData = oModel.getProperty('/results');
                    oData.forEach(item => item.ACTIVE = "");

                    var aNewRow = [{NEW: true, ACTIVE: "X"}];
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
                
                var aNewRow = [{NEW: true, ACTIVE: "X"}];
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
                if (this.getOwnerComponent().getModel("COLOR_MODEL").getData().items.length === 0) {
                    MessageBox.information("No colors found.")
                }
                else {
                    if (this._dataMode === "NEW") {
                        this.addAnotherLine(oEvent);
                    }
                    else {
                        //add lines to BOM by GMC table
                        this._dataMode = "NEW";
                        var oButton = oEvent.getSource();
                        var tabName = oButton.data('TableName')
                        var oTable = this.getView().byId(tabName);
                        var oModel = oTable.getModel("DataModel");
                        var oData = oModel.getProperty('/results');
                        oData.forEach(item => item.ACTIVE = "");

                        var aNewRow = [{NEW: true, ACTIVE: "X"}];
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
                    }
                }
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
                console.log(oData)
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

            onSorted: function(oEvent) {
                var oTable = oEvent.getSource();
                var sTabId = oTable.sId.split("--")[oTable.sId.split("--").length - 1];
                this._sActiveTableId = sTabId;

                if (this._dataMode !== "READ") {
                    if (sTabId === "versionAttrTable") { this.setVersionAttrEditModeControls(); }
                    else if (sTabId === "bomGMCTable") { this.setBOMbyGMCEditModeControls(); }
                }
            },

            //******************************************* */
            // Search Helps
            //******************************************* */

            onAttrTypesValueHelp: function (oEvent) {
                //open Attribute Types value help
                var sInputValue = oEvent.getSource().getValue();
                this.inputId = oEvent.getSource().getId(); //get input field id
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
                var sInputValue = oEvent.getSource().getValue();
                var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                var attrTyp = oData.getProperty('Attribtyp'); //get Attribute Type value
                this.inputId = oEvent.getSource().getId(); //get input field id
                this.descId = oEvent.getSource().getParent().mAggregations.cells[2].getId();
                if (!this._attrCodesValueHelpDialog) {
                    this._attrCodesValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.AttributeCodes", this);
                    this.getView().addDependent(this._attrCodesValueHelpDialog);
                }
                //filter Attribute Codes by Attribute Type
                this._attrCodesValueHelpDialog.getBinding("items").filter([new Filter("Attribtyp", sap.ui.model.FilterOperator.EQ, attrTyp)]);
                this._attrCodesValueHelpDialog.open(sInputValue);
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
                var sInputValue = oEvent.getSource().getValue();
                this.inputId = oEvent.getSource().getId(); //get input field id
                if (!this._uomValueHelpDialog) {
                    this._uomValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.UoM", this);
                    that.getView().addDependent(this._uomValueHelpDialog);
                }
                this._uomValueHelpDialog.open(sInputValue);
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
                var sInputValue = oEvent.getSource().getValue();
                that.inputId = oEvent.getSource().getId(); //get input field id
                if (!that._uomGMCValueHelpDialog) {
                    that._uomGMCValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.UoMGMC", that);
                    that.getView().addDependent(that._uomGMCValueHelpDialog);
                }
                that._uomGMCValueHelpDialog.open(sInputValue);
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
                var sInputValue = oEvent.getSource().getValue();
                that.inputId = oEvent.getSource().getId(); //get input field id
                if (!that._processesValueHelpDialog) {
                    that._processesValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.Processes", that);
                    that.getView().addDependent(that._processesValueHelpDialog);
                }
                that._processesValueHelpDialog.open(sInputValue);
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
                var sInputValue = oEvent.getSource().getValue();
                that.inputId = oEvent.getSource().getId(); //get input field id
                if (!that._matTypeValueHelpDialog) {
                    that._matTypeValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.MaterialTypes", that);
                    that.getView().addDependent(that._matTypeValueHelpDialog);
                }
                that._matTypeValueHelpDialog.open(sInputValue);
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
                var sInputValue = oEvent.getSource().getValue();
                var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                that.materialType = oData.getProperty('MATTYP'); //get Material Type
                that.inputId = oEvent.getSource().getId(); //get input field id

                var oTable = that.getView().byId("bomGMCTable");
                var oColumns = oTable.getColumns();

                //Get input field ids of Material Type and GMC
                for (var i = 0; i < oColumns.length; i++) {
                    var name = oColumns[i].getName();
                    if (name === Constants.MATTYP) {
                        that.matType = oEvent.getSource().getParent().mAggregations.cells[i].getId();
                    }
                    if (name === Constants.ENTRYUOM) {
                        that.baseUom = oEvent.getSource().getParent().mAggregations.cells[i].getId();
                    }
                }

                if (!that._GMCValueHelpDialog) {
                    that._GMCValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.GMC", that);
                    that.getView().addDependent(that._GMCValueHelpDialog);
                }
                //filter GMC by Material Type
                if (that.materialType !== undefined && that.materialType !== '') {
                    that._GMCValueHelpDialog.getBinding("items").filter([new Filter(
                        "Mattyp",
                        sap.ui.model.FilterOperator.EQ, that.materialType
                    )]);
                }
                that._GMCValueHelpDialog.open(sInputValue);
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
                var sInputValue = oEvent.getSource().getValue();
                that.inputId = oEvent.getSource().getId(); //get input field id
                var oTable = that.getView().byId("bomGMCTable");
                var oColumns = oTable.getColumns();

                //get input field ids of Version and Description
                for (var i = 0; i < oColumns.length; i++) {
                    var name = oColumns[i].getName();
                    if (name === Constants.BOMSTYLVER) {
                        that.vernoInput = oEvent.getSource().getParent().mAggregations.cells[i].getId();
                    }
                    if (name === Constants.DESC1) {
                        that.desc1Input = oEvent.getSource().getParent().mAggregations.cells[i].getId();
                    }
                }

                if (!that._styleValueHelpDialog) {
                    that._styleValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.Styles", that);
                    that.getView().addDependent(that._styleValueHelpDialog);
                }

                that._styleValueHelpDialog.open(sInputValue);
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
                var sInputValue = oEvent.getSource().getValue();
                that.inputId = oEvent.getSource().getId(); //get input field id
                if (!that._supplyTypeValueHelpDialog) {
                    that._supplyTypeValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.SupplyTypes", that);
                    that.getView().addDependent(that._supplyTypeValueHelpDialog);
                }

                that._supplyTypeValueHelpDialog.open(sInputValue);
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
                var sInputValue = oEvent.getSource().getValue();
                that.inputId = oEvent.getSource().getId(); //get input field id

                var oTable = that.getView().byId("materialListTable");
                var oColumns = oTable.getColumns();

                //Get input field id of Currency
                for (var i = 0; i < oColumns.length; i++) {
                    var name = oColumns[i].getFilterProperty();
                    console.log(name)
                    if (name === "Currencycd") {
                        that.currency = oEvent.getSource().getParent().mAggregations.cells[i].getId();
                    }
                }

                if (!that._vendorValueHelpDialog) {
                    that._vendorValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.Vendors", that);
                    that.getView().addDependent(that._vendorValueHelpDialog);
                }

                that._vendorValueHelpDialog.open(sInputValue);
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
                var sInputValue = oEvent.getSource().getValue();
                that.inputId = oEvent.getSource().getId(); //get input field id
                if (!that._currencyValueHelpDialog) {
                    that._currencyValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.Currencies", that);
                    that.getView().addDependent(that._currencyValueHelpDialog);
                }

                that._currencyValueHelpDialog.open(sInputValue);
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
                var sInputValue = oEvent.getSource().getValue();
                that.inputId = oEvent.getSource().getId(); //get input field id
                if (!that._purGroupValueHelpDialog) {
                    that._purGroupValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.PurchasingGroups", that);
                    that.getView().addDependent(that._purGroupValueHelpDialog);
                }

                that._purGroupValueHelpDialog.open(sInputValue);
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
                var sInputValue = oEvent.getSource().getValue();
                that.inputId = oEvent.getSource().getId(); //get input field id
                if (!that._purPlantValueHelpDialog) {
                    that._purPlantValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.PurchasingPlants", that);
                    that.getView().addDependent(that._purPlantValueHelpDialog);
                }
                that._purPlantValueHelpDialog.open(sInputValue);
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

                if (!dataMode) { this._dataMode = "READ"; }
                
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
            },

            lockStyleVer: async function (isLock) {
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

            onExport: Utils.onExport
        });
    });