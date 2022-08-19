sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
    "../js/Common",
    "../js/Utils",
    "sap/ui/model/json/JSONModel",
    'jquery.sap.global',
    'sap/ui/core/routing/HashChanger',
    'sap/m/MessageStrip'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, Common, Utils, JSONModel, jQuery, HashChanger, MessageStrip) {
        "use strict";

        var that;
        
        var Core = sap.ui.getCore();

        return Controller.extend("zui3derp.controller.StyleDetail", {

            onInit: function () {
                that = this;
                var oComponent = this.getOwnerComponent();
                this._router = oComponent.getRouter();
                this._router.getRoute("RouteStyleDetail").attachPatternMatched(this._routePatternMatched, this);

                this.appendUploadCollection();

                var oModel = this.getOwnerComponent().getModel("FileModel");
                this.getView().setModel(oModel, "FileModel");

                this._headerChanged = false;

                this._i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },

            _routePatternMatched: function (oEvent) {
                this._styleNo = oEvent.getParameter("arguments").styleno;
                this._sbu = oEvent.getParameter("arguments").sbu;
                
                this._headerChanged = false;
                this._generalAttrChanged = false;
                this._colorChanged = false;
                this._sizeChanged = false;
                this._processChanged = false;
                this._versionChanged = false;
                
                this.setChangeStatus(false);

                // window.onbeforeunload = function() { return "You work will be lost."; };
                
                if (this._styleNo === "NEW") {
                    this.setHeaderEditMode();
                    this.setDetailVisible(false);
                } else {
                    this.cancelHeaderEdit();
                    this.setDetailVisible(true);
                    this.getGeneralTable();
                    this.getSizesTable();
                    this.getProcessesTable();
                    this.getVersionsTable();
                }
                this.getColorsTable();

                //close edit modes
                this.cancelGeneralAttrEdit();
                this.cancelColorsEdit();
                this.cancelSizeEdit();
                this.cancelProcessEdit();
                this.cancelVersionEdit();
                this.cancelFilesEdit();

                //Load header
                this.getHeaderConfig();
                this.getHeaderData();

                //Load value helps
                Utils.getStyleSearchHelps(this);
                Utils.getAttributesSearchHelps(this);
                Utils.getProcessAttributes(this);

                //Attachments
                this.bindUploadCollection();
                this.getView().getModel("FileModel").refresh();
            },

            setChangeStatus: function(changed) {
                sap.ushell.Container.setDirtyFlag(changed);
            },

            setDetailVisible: function(bool) {
                var detailPanel = this.getView().byId('detailPanel');
                detailPanel.setVisible(bool);
            },

            getHeaderData: function () {
                var me = this;
                var styleNo = this._styleNo;
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var oView = this.getView();

                Common.openLoadingDialog(that);

                var entitySet = "/StyleDetailSet('" + styleNo + "')"

                oModel.read(entitySet, {
                    success: function (oData, oResponse) {
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

            getHeaderConfig: function () {
                var me = this;
                var oView = this.getView();

                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new sap.ui.model.json.JSONModel();

                oModel.setHeaders({
                    sbu: this._sbu,
                    type: 'STYLHDR'
                });
                oModel.read("/DynamicColumnsSet", {
                    success: function (oData, oResponse) {
                        var visibleFields = new JSONModel();
                        var visibleFields = {};

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
                var oJSONModel = new JSONModel();
                var data = {};
                this._headerChanged = false;
                data.editMode = true;
                oJSONModel.setData(data);
                this.getView().setModel(oJSONModel, "HeaderEditModeModel");
            },

            cancelHeaderEdit: function () {
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

            onCancelDiscardHeaderChanges: function() {
                this._DiscardHeaderChangesDialog.close();
            },

            closeHeaderEdit: function () {
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
            },

            onHeaderChange: function () {
                this._headerChanged = true;
                this.setChangeStatus(true);
            },

            onSaveHeader: function () {
                var oModel = this.getOwnerComponent().getModel();
                var me = this;
                var path;
                var oHeaderModel = this.getView().getModel("headerData");
                var oEntry = oHeaderModel.getData();
                var oMsgStrip = this.getView().byId('HeaderMessageStrip');
                oMsgStrip.setVisible(false);

                if (!this._headerChanged) {
                    Common.showMessage(this._i18n.getText('t7'));
                } else {

                    oEntry.Styleno = this._styleNo;
                    oEntry.Sbu = this._sbu;

                    if (this._styleNo === "NEW") {

                        oEntry.Statuscd = 'CRT';
                        oEntry.Createdby = "$";
                        oEntry.Createddt = "$";
                        oEntry.Verno = "1";

                        path = "/StyleDetailSet";

                        oModel.setHeaders({
                            sbu: this._sbu
                        });

                        oModel.create(path, oEntry, {
                            method: "POST",
                            success: function (oData, oResponse) {
                                
                                var oJSONModel = new JSONModel();
                                me._styleNo = oData.Styleno;
                                oJSONModel.setData(oData);
                                // me.getView().setModel(oJSONModel, "headerData");
                                me.getHeaderData();
                                me.getGeneralTable();
                                me.getSizesTable();
                                me.getVersionsTable();
                                me.getProcessesTable();
                                me._headerChanged = false;
                                me.setChangeStatus(false);
                                me.setDetailVisible(true);
                                Common.showMessage(me._i18n.getText('t4'));

                                var oHashChanger = HashChanger.getInstance();
                                var currHash = oHashChanger.getHash();
                                var newHash = currHash.replace("NEW", me._styleNo);
                                oHashChanger.replaceHash(newHash);
                            },
                            error: function (err) {
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
                        path = "/StyleDetailSet('" + this._styleNo + "')";

                        oModel.setHeaders({
                            sbu: this._sbu
                        });

                        oModel.update(path, oEntry, {
                            method: "PUT",
                            success: function (data, oResponse) {
                                me.getHeaderData();
                                me.getSizesTable();
                                me._headerChanged = false;
                                me.setChangeStatus(false);
                                Common.showMessage(me._i18n.getText('t4'));
                            },
                            error: function (err, oMessage) {
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

                if (this._styleNo === "NEW") {
                    this.setChangeStatus(false);
                    that._router.navTo("RouteStyles");
                } else {
                    var entitySet = "/StyleSet(STYLENO='" + that._styleNo + "')";

                    Common.openLoadingDialog(that);
                    this._ConfirmDeleteDialog.close();

                    oModel.remove(entitySet, {
                        method: "DELETE",
                        success: function (data, oResponse) {
                            me.setChangeStatus(false);
                            me._router.navTo("RouteStyles");
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

            getGeneralTable: function () {
                var oTable = this.getView().byId("generalTable");
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var oTable = this.getView().byId("generalTable");

                Common.openLoadingDialog(that);

                var entitySet = "/StyleAttributesGeneralSet";

                oModel.setHeaders({
                    styleno: this._styleNo,
                    sbu: this._sbu
                });
                oModel.read(entitySet, {
                    success: function (oData, oResponse) {
                        oJSONModel.setData(oData);
                        oTable.setModel(oJSONModel, "DataModel");
                        Common.closeLoadingDialog(that);
                    },
                    error: function () {
                        Common.closeLoadingDialog(that);
                    }
                })
            },

            setGeneralAttrEditMode: function () {
                var oJSONModel = new JSONModel();
                var data = {};
                this._generalAttrChanged = false;
                data.editMode = true;
                oJSONModel.setData(data);
                this.getView().setModel(oJSONModel, "GenAttrEditModeModel");
            },

            cancelGeneralAttrEdit: function () {
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

            onCancelDiscardGeneralAttrChanges: function() {
                this._DiscardGeneralAttrChangesDialog.close();
            },

            closeGeneralAttrEdit: function () {
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
            },

            onGeneralAttrChange: function () {
                this._generalAttrChanged = true;
                this.setChangeStatus(true);
            },

            onSaveGeneralTable: function () {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("generalTable").getModel("DataModel");
                var path;

                var oMsgStrip = this.getView().byId('GeneralAttrMessageStrip');
                oMsgStrip.setVisible(false);

                if (!this._generalAttrChanged) {
                    Common.showMessage(this._i18n.getText('t7'));
                } else {

                    var oData = oTableModel.getData();

                    var oEntry = {
                        Styleno: this._styleNo,
                        Type: "GENERAL",
                        AttributesToItems: []
                    }

                    for (var i = 0; i < oData.results.length; i++) {

                        var item = {
                            "Styleno": this._styleNo,
                            "Attribtyp": oData.results[i].Attribtyp,
                            "Attribcd": oData.results[i].Attribcd,
                            "Attribgrp": "",
                            "Attribseq": " ",
                            "Baseind": false,
                            "Deleted": " ",
                            "Desc1": oData.results[i].Desc1,
                            "Desc2": " ",
                            "Valuetyp": "STRVAL",
                            "Attribval": oData.results[i].Attribval,
                            "Valunit": " ",
                            "Createdby": " ",
                            "Createddt": " ",
                            "Updatedby": " ",
                            "Updateddt": " "
                        };

                        oEntry.AttributesToItems.push(item);
                    };

                    Common.openLoadingDialog(that);

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
                            Utils.getProcessAttributes(me);
                        },
                        error: function (err) {
                            Common.closeLoadingDialog(that);
                            var errorMsg = JSON.parse(err.responseText).error.message.value;
                            oMsgStrip.setVisible(true);
                            oMsgStrip.setText(errorMsg);
                            Common.showMessage(me._i18n.getText('t5'));
                        }
                    });

                }
            },

            onDeleteGeneralAttr: function () {
                var oTable = this.getView().byId('generalTable');
                var selected = oTable.getSelectedIndices();
                if(selected.length > 0) {
                    if (!this._ConfirmDeleteGeneralAttr) {
                        this._ConfirmDeleteGeneralAttr = sap.ui.xmlfragment("zui3derp.view.fragments.dialog.ConfirmDeleteGeneralAttr", this);
                        this.getView().addDependent(this._ConfirmDeleteGeneralAttr);
                    }
                    jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                    this._ConfirmDeleteGeneralAttr.addStyleClass("sapUiSizeCompact");
                    this._ConfirmDeleteGeneralAttr.open();
                } else {
                    Common.showMessage(this._i18n.getText('t8'))
                }
            },
            
            onConfirmDeleteGeneralAttr: function() {
            	var me = this;
                var oModel = this.getOwnerComponent().getModel();

                var oTable = this.getView().byId("generalTable");
                var oTableModel = oTable.getModel("DataModel");
                var oData = oTableModel.getData();
                var selected = oTable.getSelectedIndices();
                
                oModel.setUseBatch(true);
                oModel.setDeferredGroups(["group1"]);
                
                this._ConfirmDeleteGeneralAttr.close();
                
                if(selected.length > 0) {
	                for (var i = 0; i < selected.length; i++) {
	                	
	                	var attrtype = oData.results[selected[i]].Attribtyp;
	                	var attrcd = oData.results[selected[i]].Attribcd;
	
		                var entitySet = "/StyleAttributesGeneralSet(Styleno='" + that._styleNo + "',Attribtyp='" + attrtype + "',Attribcd='" + attrcd + "')";
		
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

            getColorsTable: function () {
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
                        oJSONModel.setData(oData);
                        oTable.setModel(oJSONModel, "DataModel");
                        Common.closeLoadingDialog(that);
                    },
                    error: function () {
                        Common.closeLoadingDialog(that);
                    }
                })
            },

            setColorEditMode: function () {
                var oJSONModel = new JSONModel();
                var data = {};
                this._colorChanged = false;
                data.editMode = true;
                oJSONModel.setData(data);
                this.getView().setModel(oJSONModel, "ColorEditModeModel");
            },

            // cancelColorEdit: function () {
            //     this.cancelEdit(this._colorChanged, this.confirmCancelColorEdit);
            // },

            cancelColorsEdit: function () {
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

            onCancelDiscardColorsChanges: function() {
                this._DiscardColorsChangesDialog.close();
            },

            closeColorsEdit: function () {
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
            },

            onColorChange: function () {
                this._colorChanged = true;
                this.setChangeStatus(true);
            },

            onSaveColorTable: function () {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("colorsTable").getModel("DataModel");
                var path;
                var oData = oTableModel.getData();

                var oMsgStrip = this.getView().byId('ColorsMessageStrip');
                oMsgStrip.setVisible(false);

                if (!this._colorChanged) {
                    Common.showMessage(this._i18n.getText('t7'));
                } else {
                    var oInput = this.getView().byId('ColorIdInput');

                    var oEntry = {
                        Styleno: this._styleNo,
                        Type: "COLOR",
                        AttributesToItems: []
                    }

                    for (var i = 0; i < oData.results.length; i++) {

                        var item = {
                            "Styleno": this._styleNo,
                            "Attribtyp": "COLOR",
                            "Attribcd": oData.results[i].Attribcd,
                            "Attribgrp": "",
                            "Attribseq": " ",
                            "Baseind": false,
                            "Deleted": " ",
                            "Desc1": oData.results[i].Desc1,
                            "Desc2": " ",
                            "Valuetyp": "STRVAL",
                            "Attribval": " ",
                            "Valunit": " ",
                            "Createdby": " ",
                            "Createddt": " ",
                            "Updatedby": " ",
                            "Updateddt": " "
                        };
                        oEntry.AttributesToItems.push(item);
                    };
                    Common.openLoadingDialog(that);

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
                var oTable = this.getView().byId('colorsTable');
                var selected = oTable.getSelectedIndices();
                if(selected.length > 0) {
                    if (!this._ConfirmDeleteColor) {
                        this._ConfirmDeleteColor = sap.ui.xmlfragment("zui3derp.view.fragments.dialog.ConfirmDeleteColor", this);
                        this.getView().addDependent(this._ConfirmDeleteColor);
                    }
                    jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                    this._ConfirmDeleteColor.addStyleClass("sapUiSizeCompact");
                    this._ConfirmDeleteColor.open();
                } else {
                    Common.showMessage(this._i18n.getText('t8'))
                }
            },
            
            onConfirmDeleteColor: function() {
            	var me = this;
                var oModel = this.getOwnerComponent().getModel();

                var oTable = this.getView().byId("colorsTable");
                var oTableModel = oTable.getModel("DataModel");
                var oData = oTableModel.getData();
                var selected = oTable.getSelectedIndices();
                
                oModel.setUseBatch(true);
                oModel.setDeferredGroups(["group1"]);
                
                this._ConfirmDeleteColor.close();
                
                if(selected.length > 0) {
	                for (var i = 0; i < selected.length; i++) {
	                	
	                	var attrtype = "COLOR";
	                	var attrcd = oData.results[selected[i]].Attribcd;
	
		                var entitySet = "/StyleAttributesColorSet(Styleno='" + that._styleNo + "',Attribtype='" + attrtype + "',Attribcd='" + attrcd + "')";
		
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

            getSizesTable: function () {
                var oTable = this.getView().byId("sizesTable");
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var oTable = this.getView().byId("sizesTable");
                var oSizeGrp = "G235";

                Common.openLoadingDialog(that);

                var entitySet = "/StyleAttributesSizeSet"

                oModel.setHeaders({
                    styleno: this._styleNo,
                    attribgrp: oSizeGrp
                });
                oModel.read(entitySet, {
                    success: function (oData, oResponse) {
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
                var oJSONModel = new JSONModel();
                var data = {};
                this._sizeChanged = false;
                data.editMode = true;
                oJSONModel.setData(data);
                this.getView().setModel(oJSONModel, "SizeEditModeModel");
            },

            // cancelSizeEdit: function () {
            //     this.cancelEdit(this._sizeChanged, this.confirmCancelSizeEdit);
            // },

            cancelSizeEdit: function () {
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
            },

            onCancelDiscardSizeChanges: function() {
                this._DiscardSizesChangesDialog.close();
            },

            closeSizeEdit: function () {
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
                this._sizeChanged = true;
                this.setChangeStatus(true);
            },

            onSaveSizeTable: function () {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("sizesTable").getModel("DataModel");
                var path;
                var lv_baseindctr = 0;

                var oMsgStrip = this.getView().byId('SizesMessageStrip');
                oMsgStrip.setVisible(false);

                if (!this._sizeChanged) {
                    Common.showMessage(this._i18n.getText('t7'));
                } else {

                    var oData = oTableModel.getData();
                    var oEntry = {
                        Styleno: this._styleNo,
                        Type: "SIZE",
                        AttributesToItems: []
                    }

                    for (var i = 0; i < oData.results.length; i++) {

                        if (oData.results[i].Baseind === true) {
                            lv_baseindctr++;
                        }

                        var item = {
                            "Styleno": this._styleNo,
                            "Attribtyp": "SIZE",
                            "Attribcd": oData.results[i].Attribcd,
                            "Attribgrp": oData.results[i].Attribgrp,
                            "Attribseq": " ",
                            "Baseind": oData.results[i].Baseind,
                            "Deleted": " ",
                            "Desc1": oData.results[i].Desc1,
                            "Desc2": " ",
                            "Valuetyp": "STRVAL",
                            "Attribval": " ",
                            "Valunit": " ",
                            "Createdby": " ",
                            "Createddt": " ",
                            "Updatedby": " ",
                            "Updateddt": " "
                        };

                        oEntry.AttributesToItems.push(item);
                    };

                    if (lv_baseindctr > 1) {
                        Common.showMessage(this._i18n.getText('t9'));
                    } else {
                        Common.openLoadingDialog(that);

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

            getProcessesTable: function () {
                var me = this;
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
                        Common.closeLoadingDialog(that);
                    },
                    error: function () {
                        Common.closeLoadingDialog(that);
                    }
                })
            },

            setProcessEditMode: function () {
                var oJSONModel = new JSONModel();
                var data = {};
                this._processChanged = false;
                data.editMode = true;
                oJSONModel.setData(data);
                this.getView().setModel(oJSONModel, "ProcessEditModeModel");
            },

            // cancelProcessEdit: function () {
            //     this.cancelEdit(this._processChanged, this.confirmCancelProcessEdit);
            // },

            cancelProcessEdit: function () {
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
            },

            onCancelDiscardProcessChanges: function() {
                this._DiscardProcessChangesDialog.close();
            },

            closeProcessEdit: function () {
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
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("processesTable").getModel("DataModel");
                var path;

                var oMsgStrip = this.getView().byId('ProcessesMessageStrip');
                oMsgStrip.setVisible(false);

                if (!this._processChanged) {
                    Common.showMessage(this._i18n.getText('t7'));
                } else {

                    var oData = oTableModel.getData();
                    var oEntry = {
                        Styleno: this._styleNo,
                        ProcessToItems: []
                    }

                    for (var i = 0; i < oData.results.length; i++) {

                        var item = {
                            "Styleno": this._styleNo,
                            "Seqno": oData.results[i].Seqno,
                            "Parentproc": " ",
                            "Hasoutput": " ",
                            "Processcd": oData.results[i].Processcd,
                            "Reqind": " ",
                            "Deleted": " ",
                            "Leadtime": oData.results[i].Leadtime,
                            "Attribtyp": oData.results[i].Attribtyp,
                            "Attribcd": oData.results[i].Attribcd,
                            "Vastyp": oData.results[i].Vastyp,
                            "Createdby": " ",
                            "Createddt": " ",
                            "Updatedby": " ",
                            "Updateddt": " "
                        }

                        oEntry.ProcessToItems.push(item);
                    };
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
                var oTable = this.getView().byId('processesTable');
                var selected = oTable.getSelectedIndices();
                if(selected.length > 0) {
                    if (!this._ConfirmDeleteProcess) {
                        this._ConfirmDeleteProcess = sap.ui.xmlfragment("zui3derp.view.fragments.dialog.ConfirmDeleteProcess", this);
                        this.getView().addDependent(this._ConfirmDeleteProcess);
                    }
                    jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                    this._ConfirmDeleteProcess.addStyleClass("sapUiSizeCompact");
                    this._ConfirmDeleteProcess.open();
                } else {
                    Common.showMessage(this._i18n.getText('t8'))
                }
            },
            
            onConfirmDeleteProcess: function() {
            	var me = this;
                var oModel = this.getOwnerComponent().getModel();

                var oTable = this.getView().byId("processesTable");
                var oTableModel = oTable.getModel("DataModel");
                var oData = oTableModel.getData();
                var selected = oTable.getSelectedIndices();
                
                oModel.setUseBatch(true);
                oModel.setDeferredGroups(["group1"]);
                
                this._ConfirmDeleteProcess.close();
                
                if(selected.length > 0) {
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

            getVersionsTable: function () {
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
                        Common.closeLoadingDialog(that);
                    },
                    error: function () {
                        Common.closeLoadingDialog(that);
                    }
                })
            },

            onSaveNewVersion: function () {
                var oModel = this.getOwnerComponent().getModel();
                var me = this;
                var path;
                var oDesc1 = Core.byId("newVersionDesc1").getValue();
                var oDesc2 = Core.byId("newVersionDesc2").getValue();
                var oCurrent = Core.byId("newVersionCurrent").getSelected();

                var oEntry = {
                    "Styleno": this._styleNo,
                    "Verno": "",
                    "Desc1": oDesc1,
                    "Desc2": oDesc2,
                    "Currentver": oCurrent
                };
                Common.openLoadingDialog(that);

                path = "/StyleVersionSet";

                oModel.setHeaders({
                    sbu: this._sbu
                });

                oModel.create(path, oEntry, {
                    method: "POST",
                    success: function (oData, oResponse) {
                        me.getVersionsTable();
                        me._NewVerionDialog.close();
                        Common.closeLoadingDialog(that);
                        Common.showMessage(me._i18n.getText('t4'));
                    },
                    error: function (err) {
                        Common.closeLoadingDialog(that);
                        Common.showMessage(me._i18n.getText('t5'));
                    }
                });
            },

            onSelectVersion: function (oEvent) {
                var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                var version = oData.getProperty('Verno');
                // if(that.dataChanged()) {
                //     that.setChangeStatus(true);
                // } else {
                //     that.setChangeStatus(false);
                // }
                that._router.navTo("RouteVersion", {
                    styleno: that._styleNo,
                    sbu: that._sbu,
                    version: version
                });
            },

            setVersionCurrent: function (oEvent) {
                var me = this;
                var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                var version = oData.getProperty('Verno');
                version = this.pad(version, 3);
                var oModel = this.getOwnerComponent().getModel();

                Common.openLoadingDialog(that);

                var entitySet = "/StyleVersionSet(Styleno='" + this._styleNo + "',Verno='" + version + "')";

                var oEntry = {
                    Styleno: this._styleNo,
                    Verno: version
                };

                oModel.setHeaders({
                    sbu: this._sbu
                });

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

            setVersionEditMode: function () {
                var oJSONModel = new JSONModel();
                var data = {};
                this._versionChanged = false;
                data.editMode = true;
                oJSONModel.setData(data);
                this.getView().setModel(oJSONModel, "VersionEditModeModel");
            },

            // cancelVersionEdit: function () {
            //     this.cancelEdit(this._versionChanged, this.confirmCancelVersionEdit);
            // },

            cancelVersionEdit: function () {
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

            onCancelDiscardVersionChanges: function() {
                this._DiscardVersionChangesDialog.close();
            },

            closeVersionEdit: function () {
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
                this._versionChanged = true;
                this.setChangeStatus(true);
            },

            onSaveVersions: function () {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("versionsTable").getModel("DataModel");
                var path;

                var oMsgStrip = this.getView().byId('VersionsMessageStrip');
                oMsgStrip.setVisible(false);

                if (!this._versionChanged) {
                    Common.showMessage(this._i18n.getText('t7'));
                } else {

                    var oData = oTableModel.getData();
                    var oEntry = {
                        Styleno: this._styleNo,
                        VerToItems: []
                    }

                    for (var i = 0; i < oData.results.length; i++) {

                        var item = {
                            "Styleno": this._styleNo,
                            "Verno": oData.results[i].Verno,
                            "Remarks": " ",
                            "Completed": " ",
                            "Desc1": oData.results[i].Desc1,
                            "Matno": " ",
                            "Desc2": oData.results[i].Desc2,
                            "Seasoncd": " ",
                            "Salesgrp": " ",
                            "Srcstyl": " ",
                            "Srcstylver": " ",
                            "Rmcdttm": " ",
                            "Deleted": " ",
                            "Createdby": " ",
                            "Createddt": " ",
                            "Updatedby": " ",
                            "Updateddt": " "
                        }

                        oEntry.VerToItems.push(item);
                    };
                    Common.openLoadingDialog(that);
                    
                    path = "/VersionSet";

                    oModel.setHeaders({
                        sbu: this._sbu
                    });

                    oModel.create(path, oEntry, {
                        method: "POST",
                        success: function (oData, oResponse) {
                            me.getVersionsTable();
                            Common.closeLoadingDialog(that);
                            me._versionChanged = false;
                            me.setChangeStatus(false);
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

            onCreateNewVersion: function () {
                if (!that._NewVerionDialog) {
                    that._NewVerionDialog = sap.ui.xmlfragment("zui3derp.view.fragments.CreateNewVersion", that);
                    that.getView().addDependent(that._NewVerionDialog);
                }
                jQuery.sap.syncStyleClass("sapUiSizeCompact", that.getView(), that._LoadingDialog);
                that._NewVerionDialog.addStyleClass("sapUiSizeCompact");
                that._NewVerionDialog.open();
            },

            onDeleteVersion: function () {
                var oTable = this.getView().byId('versionsTable');
                var selected = oTable.getSelectedIndices();
                if(selected.length > 0) {
                    if (!this._ConfirmDeleteVersionDialog) {
                        this._ConfirmDeleteVersionDialog = sap.ui.xmlfragment("zui3derp.view.fragments.dialog.ConfirmDeleteVersion", this);
                        this.getView().addDependent(this._ConfirmDeleteVersionDialog);
                    }
                    jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                    this._ConfirmDeleteVersionDialog.addStyleClass("sapUiSizeCompact");
                    this._ConfirmDeleteVersionDialog.open();
                } else {
                    Common.showMessage(this._i18n.getText('t8'))
                }
            },
            
            onConfirmDeleteVersion: function() {
            	var me = this;
                var oModel = this.getOwnerComponent().getModel();

                var oTable = this.getView().byId("versionsTable");
                var oTableModel = oTable.getModel("DataModel");
                var oData = oTableModel.getData();
                var selected = oTable.getSelectedIndices();
                
                oModel.setUseBatch(true);
                oModel.setDeferredGroups(["group1"]);
                
				this._ConfirmDeleteVersionDialog.close();
                
                if(selected.length > 0) {
	                for (var i = 0; i < selected.length; i++) {
	                	
	                	var verno = oData.results[selected[i]].Verno;
	                	verno = this.pad(verno, 3);
	
		                var entitySet = "/StyleVersionSet(Styleno='" + that._styleNo + "',Verno='" + verno + "')";
		
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

            addLine: function (oEvent) {
                var oButton = oEvent.getSource();
                var tabName = oButton.data('TableName')
                var oTable = this.getView().byId(tabName);
                var oModel = this.getView().byId(tabName).getModel("DataModel");
                var oData = oModel.getProperty('/results');
                oData.push({});
                oTable.getBinding("rows").refresh();
            },

            addProcessLine: function (oEvent) {
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
            },

            removeLine: function (oEvent) {
                var oButton = oEvent.getSource();
                var tabName = oButton.data('TableName')
                var oTable = this.getView().byId(tabName);
                var oModel = this.getView().byId(tabName).getModel("DataModel");
                var oData = oModel.getData();
                var selected = oTable.getSelectedIndices();

                oData.results = oData.results.filter(function (value, index) {
                    return selected.indexOf(index) == -1;
                })

                oModel.setData(oData);
                oTable.clearSelection();
            },

            addGeneralAttr: function () {
                var oModel = this.getView().byId("generalTable").getModel("DataModel");
                var oData = oModel.getProperty('/results');
                oData.push({});

                var oTable = this.getView().byId("generalTable");
                oTable.getBinding("rows").refresh();
            },

            appendUploadCollection: function () {
                var oUploadCollection = this.getView().byId('UploadCollection');
                oUploadCollection.attachChange(that.onFileSelected);
                oUploadCollection.setMode(sap.m.ListMode.SingleSelectLeft);
                oUploadCollection.attachBeforeUploadStarts(that.onBeforeUploadStarts);
                oUploadCollection.setMultiple(true);
                oUploadCollection.setUploadUrl("/sap/opu/odata/sap/ZGW_3DERP_FILES_SRV/FileSet");
                oUploadCollection.attachUploadComplete(that.onUploadComplete);
            },

            bindUploadCollection: function () {
                var oUploadCollection = this.getView().byId('UploadCollection');

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

            setFilesEditMode: function() {
                var oJSONModel = new JSONModel();
                var data = {};
                data.editMode = true;
                oJSONModel.setData(data);
                this.getView().setModel(oJSONModel, "FilesEditModeModel");

                var oUploadCollection = this.getView().byId('UploadCollection');
                oUploadCollection.setUploadButtonInvisible(false);
                oUploadCollection.setMode(sap.m.ListMode.SingleSelectLeft);
            },

            cancelFilesEdit: function() {
                var oJSONModel = new JSONModel();
                var data = {};
                // this._headerChanged = false;
                data.editMode = false;
                oJSONModel.setData(data);
                this.getView().setModel(oJSONModel, "FilesEditModeModel");

                var oUploadCollection = this.getView().byId('UploadCollection');
                oUploadCollection.setUploadButtonInvisible(true);
                oUploadCollection.setMode(sap.m.ListMode.None);
            },

            onAddFile: function() {
                var oUploadCollection = this.getView().byId('UploadCollection');
                oUploadCollection.openFileDialog();
            },

            onFileSelected: function() {
                that.uploadFile();
            },

            uploadFile: function () {
                if (!this._UploadFileDialog) {
                    this._UploadFileDialog = sap.ui.xmlfragment("zui3derp.view.fragments.UploadFile", this);
                    this.getView().addDependent(this._UploadFileDialog);
                } else {
                    
                }
                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                this._UploadFileDialog.addStyleClass("sapUiSizeCompact");
                this._UploadFileDialog.open();
            },

            onStartUploadFile: function () {
                this._UploadFileDialog.close();

                var oUploadCollection = this.getView().byId('UploadCollection');
                var cFiles = oUploadCollection.getItems().length;

                if (cFiles > 0) {
                    oUploadCollection.upload();
                }
            },

            onBeforeUploadStarts: function (oEvent) {

                var oStylenoParam = new sap.m.UploadCollectionParameter({
                    name: "styleno",
                    value: that._styleNo
                });
                oEvent.getParameters().addHeaderParameter(oStylenoParam);

                var fileDesc1 = sap.ui.getCore().byId("FileDesc1");
                var oFileDesc1Param = new sap.m.UploadCollectionParameter({
                    name: "desc1",
                    value: fileDesc1.getValue()
                });
                oEvent.getParameters().addHeaderParameter(oFileDesc1Param);
                fileDesc1.setValue('');

                var fileDesc2 = sap.ui.getCore().byId("FileDesc2");
                var oFileDesc2Param = new sap.m.UploadCollectionParameter({
                    name: "desc2",
                    value: fileDesc2.getValue()
                });
                oEvent.getParameters().addHeaderParameter(oFileDesc2Param);
                fileDesc2.setValue('');

                var fileRemarks = sap.ui.getCore().byId("FileRemarks");
                var oFileRemarksParam = new sap.m.UploadCollectionParameter({
                    name: "remarks",
                    value: fileRemarks.getValue()
                });
                oEvent.getParameters().addHeaderParameter(oFileRemarksParam);
                fileRemarks.setValue('');

                var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                    name: "slug",
                    value: oEvent.getParameter("fileName")
                });
                oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);

                var oModel = that.getView().getModel("FileModel");
                oModel.refreshSecurityToken();

                var oHeaders = oModel.oHeaders;
                var sToken = oHeaders['x-csrf-token'];

                var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                    name: "x-csrf-token",
                    value: sToken
                });
                oEvent.getParameters().addHeaderParameter(oCustomerHeaderToken);
            },

            onUploadComplete: function () {
                that.getView().getModel("FileModel").refresh();
                var oUploadCollection = that.getView().byId('UploadCollection');
                oUploadCollection.removeAllItems();
            },

            onDeleteFile: function () {
                var oUploadCollection = this.getView().byId('UploadCollection');
                var selected = oUploadCollection.getSelectedItems();

                if(selected.length > 0) {
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

            onConfirmDeleteFile: function() {
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

            onCancelUploadFile: function() {
                that._UploadFileDialog.close();
                var oUploadCollection = this.getView().byId('UploadCollection');
                that.getView().getModel("FileModel").refresh();
                oUploadCollection.removeAllItems();
            },

            cancelEdit(ochangeIndicator, oFunction) {
                if (ochangeIndicator === true) {
                    if (!this._ConfirmDiscardChangesDialog) {
                        this._ConfirmDiscardChangesDialog = sap.ui.xmlfragment("zui3derp.view.fragments.ConfirmDiscardChanges", this);
                        this.getView().addDependent(this._ConfirmDiscardChangesDialog);
                    }
                    jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                    this._ConfirmDiscardChangesDialog.addStyleClass("sapUiSizeCompact");
                    this._ConfirmDiscardChangesDialog.open();
                    var oConfirmButton = sap.ui.getCore().byId('ConfirmDiscardButton');
                    oConfirmButton.attachPress(oFunction);
                } else {
                    oFunction();
                }
            },

            onNavBack: function() {
                if(this._headerChanged === false && this._generalAttrChanged === false &&
                    this._colorChanged === false && this._sizeChanged === false &&
                    this._processChanged === false && this._versionChanged === false) {
                    this.confirmNavBack();
                } else {
                    if (!this._ConfirmDiscardChangesNavDialog) {
                        this._ConfirmDiscardChangesNavDialog = sap.ui.xmlfragment("zui3derp.view.fragments.ConfirmDiscardChangesNav", this);
                        this.getView().addDependent(this._ConfirmDiscardChangesNavDialog);
                    }
                    jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                    this._ConfirmDiscardChangesNavDialog.addStyleClass("sapUiSizeCompact");
                    this._ConfirmDiscardChangesNavDialog.open();
                }
            },

            dataChanged: function() {
                var changed = false;
                if(this._headerChanged === false && this._generalAttrChanged === false &&
                    this._colorChanged === false && this._sizeChanged === false &&
                    this._processChanged === false && this._versionChanged === false) {
                    changed = false;
                } else {
                    changed = true;
                }
                return changed;
            },

            /****************************************************/
            // Start of Value Helps logic
            /****************************************************/

            onAttrTypesValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                this.inputId = oEvent.getSource().getId();
                if (!this._attrTypesValueHelpDialog) {
                    this._attrTypesValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.AttributeTypes", this);
                    this.getView().addDependent(this._attrTypesValueHelpDialog);
                }
                this._attrTypesValueHelpDialog.open(sInputValue);
            },

            _attrTypesValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Attribtyp", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _attrTypesValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = this.byId(this.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    this.onGeneralAttrChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onAttrCodesValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                var attrTyp = oData.getProperty('Attribtyp');
                this.inputId = oEvent.getSource().getId();

                var oTable = that.getView().byId("generalTable");
                var oColumns = oTable.getColumns();
                for(var i = 0; i < oColumns.length; i++) {
                    var name = oColumns[i].getName();
                    if(name === 'DESC1') {
                        this.descId = oEvent.getSource().getParent().mAggregations.cells[i].getId();
                    }
                    if(name === 'UOM') {
                        this.attribUom = oEvent.getSource().getParent().mAggregations.cells[i].getId();
                    }
                }

                if (!this._attrCodesValueHelpDialog) {
                    this._attrCodesValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.AttributeCodes", this);
                    this.getView().addDependent(this._attrCodesValueHelpDialog);
                }
                this._attrCodesValueHelpDialog.getBinding("items").filter([new Filter(
                    "Attribtyp",
                    sap.ui.model.FilterOperator.EQ, attrTyp
                )]);
                this._attrCodesValueHelpDialog.open(sInputValue);
            },

            _attrCodesValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Attribcd", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _attrCodesValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = this.byId(this.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    this.onGeneralAttrChange();
                    var descText = this.byId(this.descId);
                    descText.setText(oSelectedItem.getDescription());
                    var uom = oSelectedItem.data('Uom');
                    var attribUom = this.byId(this.attribUom);
                    attribUom.setText(uom);
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onProcessesValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                this.inputId = oEvent.getSource().getId();
                if (!this._processesValueHelpDialog) {
                    this._processesValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.Processes", this);
                    this.getView().addDependent(this._processesValueHelpDialog);
                }
                this._processesValueHelpDialog.open(sInputValue);
            },

            _processesValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("ProcessCd", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _processesValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = this.byId(this.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    this.onProcessChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onVASTypeValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                this.inputId = oEvent.getSource().getId();
                var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                var ProcessCd = oData.getProperty('Processcd');

                if (!this._VASTypeValueHelpDialog) {
                    this._VASTypeValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.VASTypes", this);
                    this.getView().addDependent(this._VASTypeValueHelpDialog);
                }

                this._VASTypeValueHelpDialog.getBinding("items").filter([new Filter(
                    "Vasproc",
                    sap.ui.model.FilterOperator.EQ, ProcessCd
                )]);

                this._VASTypeValueHelpDialog.open(sInputValue);
            },

            _VASTypesValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Processcd", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _VASTypesValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = this.byId(this.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    this.onProcessChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onProcessAttrTypesValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                this.inputId = oEvent.getSource().getId();
                if (!this._processAttrTypesValueHelpDialog) {
                    this._processAttrTypesValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.ProcessAttributeTypes", this);
                    this.getView().addDependent(this._processAttrTypesValueHelpDialog);
                }
                this._processAttrTypesValueHelpDialog.open(sInputValue);
            },

            _processAttrTypesValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Attribtyp", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _processAttrTypesValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = this.byId(this.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    this.onProcessChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onProcessAttrCodesValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                var attrTyp = oData.getProperty('Attribtyp');
                this.inputId = oEvent.getSource().getId();
                if (!this._processAttrCodesValueHelpDialog) {
                    this._processAttrCodesValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.ProcessAttributeCodes", this);
                    this.getView().addDependent(this._processAttrCodesValueHelpDialog);
                }
                this._processAttrCodesValueHelpDialog.getBinding("items").filter([new Filter(
                    "Attribtype",
                    sap.ui.model.FilterOperator.EQ, attrTyp
                )]);
                this._processAttrCodesValueHelpDialog.open(sInputValue);
            },

            _processAttrCodesValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Attribcd", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _processAttrCodesValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = this.byId(this.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    this.onProcessChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onProdTypeValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                this.inputId = oEvent.getSource().getId();
                if (!this._prodTypeHelpDialog) {
                    this._prodTypeHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.ProdTypes", this);
                    this.getView().addDependent(this._prodTypeHelpDialog);
                }
                this._prodTypeHelpDialog.open(sInputValue);
            },

            _prodTypeValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("ProdTyp", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _prodTypeValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = this.byId(this.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    this.onHeaderChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onStyleCatValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                this.inputId = oEvent.getSource().getId();
                if (!this._styleCatHelpDialog) {
                    this._styleCatHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.StyleCat", this);
                    this.getView().addDependent(this._styleCatHelpDialog);
                }
                this._styleCatHelpDialog.open(sInputValue);
            },

            _styleCatValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Stylcat", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _styleCatValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = this.byId(this.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    this.onHeaderChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onSeasonsValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                this.inputId = oEvent.getSource().getId();
                if (!this._seasonsHelpDialog) {
                    this._seasonsHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.Seasons", this);
                    this.getView().addDependent(this._seasonsHelpDialog);
                }
                this._seasonsHelpDialog.open(sInputValue);
            },

            _seasonsGroupValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Seasoncd", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _seasonsGroupValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = this.byId(this.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    this.onHeaderChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onSalesGroupValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                this.inputId = oEvent.getSource().getId();
                if (!this._salesGroupHelpDialog) {
                    this._salesGroupHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.SalesGroups", this);
                    this.getView().addDependent(this._salesGroupHelpDialog);
                }
                this._salesGroupHelpDialog.open(sInputValue);
            },

            _salesGroupValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("SalesGrp", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _salesGroupValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = this.byId(this.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    this.onHeaderChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onCustGroupValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                this.inputId = oEvent.getSource().getId();
                if (!this._custGroupHelpDialog) {
                    this._custGroupHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.CustGroups", this);
                    this.getView().addDependent(this._custGroupHelpDialog);
                }
                this._custGroupHelpDialog.open(sInputValue);
            },

            _custGroupValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("CustGrp", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _custGroupValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = this.byId(this.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    this.onHeaderChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onCustomersValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                var custGrp = this.getView().byId("CUSTGRP").getValue();
                this.inputId = oEvent.getSource().getId();
                if (!this._customersHelpDialog) {
                    this._customersHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.Customers", this);
                    this.getView().addDependent(this._customersHelpDialog);
                }

                this._customersHelpDialog.getBinding("items").filter([new Filter(
                    "Custgrp",
                    sap.ui.model.FilterOperator.EQ, custGrp
                )]);
                this._customersHelpDialog.open(sInputValue);
            },

            _customersValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Custno", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _customersValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = this.byId(this.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    this.onHeaderChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onSizeGroupValueHelp: function (oEvent) {
                var me = this;
                var sInputValue = oEvent.getSource().getValue();
                this.inputId = oEvent.getSource().getId();
                var oSHModel = this.getOwnerComponent().getModel("SearchHelps");
                var oView = this.getView();

                var oJSONModel = new JSONModel();
                oSHModel.read("/SizeGrpSet", {
                    success: function (oData, oResponse) {
                        oJSONModel.setData(oData);
                        // oJSONModel6.setSizeLimit(9999);
                        // oJSONModel6.oJSONModelt(9999);
                        oView.setModel(oJSONModel6, "SizeGroupModel");

                        if (!me._sizeGroupHelpDialog) {
                            me._sizeGroupHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.SizeGroups", me);
                            me.getView().addDependent(me._sizeGroupHelpDialog);
                        }
                        me._sizeGroupHelpDialog.open(sInputValue);
                    },
                    error: function (err) { }
                });
            },

            _sizeGroupValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("AttribGrp", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _sizeGroupValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = this.byId(this.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    this.onHeaderChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onUomValueHelp: function () {
                if (!this._uomValueHelpDialog) {
                    this._uomValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.UoM", this);
                    this.getView().addDependent(this._uomValueHelpDialog);
                }
                this._uomValueHelpDialog.open();
            },

            _uomValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Valunit", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _uomValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = this.byId("UOM");
                    productInput.setValue(oSelectedItem.getTitle());
                    this.onHeaderChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onExportExcel: Utils.onExportExcel,

            pad: Common.pad,

            onCancelNewVersion: Common.onCancelNewVersion,

            // onCancelUploadFile: Common.onCancelUploadFile,

            onCancelDeleteStyle: Common.onCancelDeleteStyle,

            onCancelDeleteGeneralAttr: Common.onCancelDeleteGeneralAttr,
            
            onCancelDeleteColor: Common.onCancelDeleteColor,
            
            onCancelDeleteProcess: Common.onCancelDeleteProcess,

            onCancelDeleteVersion: Common.onCancelDeleteVersion,

            onCancelDeleteFile: Common.onCancelDeleteFile,

            onCancelDiscardChanges: Common.onCancelDiscardChanges
        });
    });
