sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
    "../js/Common",
    "../js/Utils",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, Common, Utils, JSONModel, History) {
        "use strict";

        var that;

        return Controller.extend("zui3derp.controller.Version", {

            onInit: function () {
                that = this;

                var oComponent = this.getOwnerComponent();
                this._router = oComponent.getRouter();
                this._router.getRoute("RouteVersion").attachPatternMatched(this._routePatternMatched, this);

                this._colors;
                this._sizes;

                this._i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },

            _routePatternMatched: function (oEvent) {
                this._sbu = oEvent.getParameter("arguments").sbu;
                this._styleNo = oEvent.getParameter("arguments").styleno;
                this._version = oEvent.getParameter("arguments").version;

                this._versionAttrChanged = false;
                this._BOMbyGMCChanged = false;
                this._BOMbyUVChanged = false;
                this._materialListChanged = false;

                this.setChangeStatus(false);

                //Load Search Helps
                Utils.getVersionSearchHelps(this);

                //Get Data
                this.getHeaderData();
                this.getVersionsData();

                //Close Edit Modes
                this.cancelVersionAttrEdit();
                this.cancelMaterialListEdit();
                this.cancelBOMbyGMCEdit();
                this.cancelBOMbyUVEdit();                
            },

            setChangeStatus: function(changed) {
                try {
                    sap.ushell.Container.setDirtyFlag(changed);
                } catch(err) {}
                
            },

            onRefresh: function() { 
                this.getVersionsData();
                // this.getbomUVTable();
                // this.getDetailedBOM();
                // this.getMaterialList();
            },

            getHeaderData: function () {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var oView = this.getView();
                var entitySet = "/StyleDetailSet('" + this._styleNo + "')"

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
                this.getColors();
                // this.getSizes();
                this.getVersionAttrTable();
                // this.getbomGMCTable();
                
                this.getDetailedBOM();
                this.getMaterialList();
            },

            getVersionAttrTable: function () {
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
                        oTable.setVisibleRowCount(oData.results.length);
                        oTable.attachPaste();
                    },
                    error: function () { }
                })
            },

            attach: function() {
                var oTable = this.getView().byId("versionAttrTable");
                oTable.attachPaste();                
            },

            setVersionAttrEditMode: function() {
                var oJSONModel = new JSONModel();
                var data = {};
                this._versionAttrChanged = false;
                data.editMode = true;
                oJSONModel.setData(data);
                this.getView().setModel(oJSONModel, "VersionAttrEditModeModel");
            },

            // cancelVersionAttrEdit: function () {
            //     this.cancelEdit(this._versionAttrChanged, this.confirmCancelVersionAttrEdit);
            // },

            cancelVersionAttrEdit: function () {
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

            onCancelDiscardVersionAttrChanges: function() {
                this._DiscardVersionAttrChangesDialog.close();
            },

            closeVersionAttrEdit: function() {
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
            },

            onVersionAttrChange: function () {
                this._versionAttrChanged = true;
                this.setChangeStatus(true);
            },

            onSaveVersionAttrTable: function () {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("versionAttrTable").getModel("DataModel");
                var path;

                var oMsgStrip = this.getView().byId('VersionAttrMessageStrip');
                oMsgStrip.setVisible(false);

                if (!this._versionAttrChanged) {
                    Common.showMessage(this._i18n.getText('t7'));
                } else {

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
                            "Attribgrp": "1",
                            "Attribseq": "1",
                            "Attribtyp": oData.results[i].Attribtyp,
                            "Attribcd": oData.results[i].Attribcd,
                            "Baseind": " ",
                            "Desc1": oData.results[i].Desc1,
                            "Desc2": " ",
                            "Valuetyp": " ",
                            "Attribval": oData.results[i].Attribval,
                            "Deleted": " ",
                            "Valunit": oData.results[i].Valunit,
                            "Createdby": " ",
                            "Createddt": " ",
                            "Updatedby": " ",
                            "Updateddt": " "
                        }

                        oEntry.VersionToItems.push(item);
                    };

                    Common.openLoadingDialog(that);

                    path = "/VersionAttributesSet";

                    oModel.setHeaders({
                        sbu: this._sbu
                    });

                    oModel.create(path, oEntry, {
                        method: "POST",
                        success: function (oData, oResponse) {
                            me._versionAttrChanged = false;
                            me.setChangeStatus(false);
                            Common.closeLoadingDialog(me);
                            Common.showMessage(me._i18n.getText('t4'));
                        },
                        error: function (err) {
                            var errorMsg = JSON.parse(err.responseText).error.message.value;
                            oMsgStrip.setVisible(true);
                            oMsgStrip.setText(errorMsg);
                            Common.closeLoadingDialog(me);
                            Common.showMessage(me._i18n.getText('t5'));
                        }
                    });

                }
            },

            onDeleteVersionAttr: function () {
                var oTable = this.getView().byId('versionAttrTable');
                var selected = oTable.getSelectedIndices();
                if(selected.length > 0) {
                    if (!this._ConfirmDeleteVersionAttr) {
                        this._ConfirmDeleteVersionAttr = sap.ui.xmlfragment("zui3derp.view.fragments.dialog.ConfirmDeleteVersionAttr", this);
                        this.getView().addDependent(this._ConfirmDeleteVersionAttr);
                    }
                    jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                    this._ConfirmDeleteVersionAttr.addStyleClass("sapUiSizeCompact");
                    this._ConfirmDeleteVersionAttr.open();
                } else {
                    Common.showMessage(this._i18n.getText('t8'));
                }
            },
            
            onConfirmDeleteVersionAttr: function() {
            	var me = this;
                var oModel = this.getOwnerComponent().getModel();

                var oTable = this.getView().byId("versionAttrTable");
                var oTableModel = oTable.getModel("DataModel");
                var oData = oTableModel.getData();
                var selected = oTable.getSelectedIndices();
                
                oModel.setUseBatch(true);
                oModel.setDeferredGroups(["group1"]);
                
				this._ConfirmDeleteVersionAttr.close();
                
                if(selected.length > 0) {
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

            getColors: function () {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                oModel.setHeaders({
                    styleno: this._styleNo
                });
                oModel.read("/StyleAttributesColorSet", {
                    success: function (oData, oResponse) {
                        me._colors = oData.results;
                        me.getSizes();
                    },
                    error: function (err) { }
                });
            },

            getSizes: function () {
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

            getbomGMCTable: function (oGetComponentInd) {
                var me = this;
                var columnData = [];

                // this._getComponent = oGetComponentInd;

                var oModel = this.getOwnerComponent().getModel();

                oModel.setHeaders({
                    sbu: this._sbu,
                    type: 'BOMGMC'
                });

                Common.openLoadingDialog(that);

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
                                "ColumnType": "COLOR",
                                "Editable": column.Editable,
                                "Mandatory": false,
                                "Visible": true
                            })
                        })
                        me.getbomGMCTableData(columnData, oGetComponentInd);
                    },
                    error: function (err) { 
                        Common.closeLoadingDialog(that);
                    }
                });
            },

            getbomGMCTableData: function (columnData, oGetComponentInd) {
                var me = this;

                var oTable = this.getView().byId("bomGMCTable");
                var oModel = this.getOwnerComponent().getModel();
                var rowData = {
                    items: []
                };

                var getComponent = "";
                if(oGetComponentInd) {
                    getComponent = "Y";
                } 

                oModel.setHeaders({
                    styleno: this._styleNo,
                    verno: this._version,
                    getcomponent: getComponent
                });
                oModel.read("/StyleBOMGMCSet", {
                    success: function (oData, oResponse) {

                        var style;
                        var item = {};
                        var items = [];

                        // for (var i = 0; i < oData.results.length; i++) {
                        //     items = [];
                        //     if (oData.results[i].BOMITMTYP === 'STY') {

                        //         style = oData.results[i].BOMSTYLE;
                        //         for (var j = 0; j < oData.results.length; j++) {
                        //             if (oData.results[j].BOMITMTYP === 'GMC' && oData.results[j].BOMSTYLE === style) {
                        //                 items.push(oData.results[j]);
                        //             }
                        //         }

                        //         item = oData.results[i];
                        //         item.items = items;
                        //         rowData.items.push(item);
                        //     } else if (oData.results[i].BOMITMTYP === 'GMC' && oData.results[i].BOMSTYLE === '') {
                        //         rowData.items.push(oData.results[i]);
                        //     }
                        // }

                        rowData = oData.results;

                        var oJSONModel = new JSONModel();
                        oJSONModel.setData({
                            results: rowData,
                            columns: columnData
                        });

                        oTable.setModel(oJSONModel, "DataModel");
                        oTable.setVisibleRowCount(oData.results.length);
                        oTable.attachPaste();

                        me.getBOMGMCColorsData();
                        me.getbomUVTable();
                    },
                    error: function (err) { 
                        Common.closeLoadingDialog(that);
                    }
                });
            },

            setBOMbyGMCEditMode: function() {
                if(this._colors.length <= 0) {
                    Common.showMessage(this._i18n.getText('t11'));
                } else if(this._sizes <= 0)
                    Common.showMessage(this._i18n.getText('t12'));
                else {
                    var oJSONModel = new JSONModel();
                    var data = {};
                    this._BOMbyGMCChanged = false;
                    data.editMode = true;
                    oJSONModel.setData(data);
                    this.getView().setModel(oJSONModel, "BOMbyGMCEditModeModel");
                }
            },

            // cancelBOMbyGMCEdit: function () {
            //     this.cancelEdit(this._BOMbyGMCChanged, this.confirmCancelBOMbyGMCEdit);
            // },

            cancelBOMbyGMCEdit: function () {
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

            onCancelDiscardBOMbyGMCChanges: function() {
                this._DiscardBOMbyGMCDialog.close();
            },

            closeBOMbyGMCEdit: function() {
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
            },

            onBOMbyGMCChange: function (oEvent) {
                that._BOMbyGMCChanged = true;
                that.setChangeStatus(true);

                try {
                        var oTable = that.getView().byId("bomGMCTable");
                        var oTableModel = oTable.getModel('DataModel');
                        var oData = oTableModel.getData();
                        var gmc =  that.getView().getModel('GMCModel').getData().results;

                        for(var i = 0; i < oData.results.length; i++) {
                            var gmcUom = gmc.find((item) => item.Gmc === oData.results[i].GMC)
                            if(gmcUom !== undefined) {
                                if(oData.results[i].ENTRYUOM === undefined) {
                                    oData.results[i].ENTRYUOM = gmcUom.Baseuom;
                                }
                            }
                        }
                        // var oColumns = oTable.getColumns();

                        // for(var i = 0; i < oColumns.length; i++) {
                        //     var name = oColumns[i].getName();
                        //     if(name === 'ENTRYUOM') {
                        //         var uomValue = oEvent.getSource().getParent().mAggregations.cells[i].getValue()
                        //         var oBaseUomInput = oEvent.getSource().getParent().mAggregations.cells[i].getId();
                        //     }
                        //     if(name === 'GMC') {
                        //         var sInputValue = oEvent.getSource().getParent().mAggregations.cells[i].getValue()
                        //     }
                        // }

                        // if(uomValue === '') {
                        //     var gmc =  that.getView().getModel('GMCModel').getData().results;
                        //     var gmcUom = gmc.find((item) => item.Gmc === sInputValue)

                        //     var oBaseUomInput2 = sap.ui.getCore().byId(oBaseUomInput);

                        //     if(gmcUom !== undefined) {
                        //         var baseUom = gmcUom.Baseuom;
                        //         if(baseUom !== undefined) {    
                        //             oBaseUomInput2.setValue(baseUom);
                        //         } 
                        //     } else {
                        //         oBaseUomInput2.setValue('');
                        //     }
                        // }

                } catch(err) {}
            },

            onBOMbyGMCLiveChange: function () {
                that._BOMbyGMCChanged = true;
                that.setChangeStatus(true);
            },

            onSaveBOMbyGMC: function (oGetComponentInd) {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("bomGMCTable").getModel("DataModel");
                var path;
                var item = {};

                var oMsgStrip = this.getView().byId('BOMbyGMCMessageStrip');
                oMsgStrip.setVisible(false);

                if (!this._BOMbyGMCChanged) {
                    Common.showMessage(this._i18n.getText('t7'));
                } else {

                    var oData = oTableModel.getData();
                    var oEntry = {
                        Styleno: this._styleNo,
                        GMCToItems: []
                    }

                    for (var i = 0; i < oData.results.length; i++) {
                        item = that.addBOMItem(oData.results[i]);
                        oEntry.GMCToItems.push(item);

                        // if (oData.results[i].BOMITMTYP === 'STY') {
                        //     if (oData.results.items[i].items !== undefined) {
                        //         for (var j = 0; j < oData.results.items[i].items.length; j++) {
                        //             item = that.addBOMItem(oData.results.items[i].items[j]);
                        //             oEntry.GMCToItems.push(item);
                        //         }
                        //     }
                        // }
                    };

                    Common.openLoadingDialog(that);

                    path = "/BOMGMCSet";

                    oModel.setHeaders({
                        sbu: this._sbu
                    });

                    oModel.create(path, oEntry, {
                        method: "POST",
                        success: function (oDataRes, oResponse) {
                            me._BOMbyGMCChanged = false;

                            if(oGetComponentInd === true) {
                                me.getbomGMCTable(true);
                                me._BOMbyGMCChanged = true;
                            } else {
                                me.getbomGMCTable();
                            }

                            Common.showMessage(me._i18n.getText('t4'));

                            var oEntry = {
                                Styleno: me._styleNo,
                                Verno: me._version,
                                Usgcls: "AUV",
                                UVToItems: []
                            }

                            for (var i = 0; i < oData.results.length; i++) {

                                if (oData.results[i].USGCLS === "AUV" || oData.results[i].USGCLS === "ASUV") {
                                    for (var j = 0; j < me._colors.length; j++) {

                                        var color = me._colors[j];
                                        item = {
                                            "Styleno": me._styleNo,
                                            "Verno": me._version,
                                            "Gmc": oData.results[i].GMC,
                                            "Partcd": oData.results[i].PARTCD,
                                            "Usgcls": oData.results[i].USGCLS,
                                            "Seqno": " ",
                                            "Bomitem": " ",
                                            "Color": color.Attribcd,
                                            "Sze": " ",
                                            "Dest": " ",
                                            "Mattyp": oData.results[i].MATTYP,
                                            "Mattypcls": "ZCOLR",
                                            "Attribcd": " ",
                                            "Desc1": oData.results[i][color.Attribcd],
                                            "Consump": oData.results[i].CONSUMP,
                                            "Wastage": oData.results[i].WASTAGE,
                                            "Createdby": " ",
                                            "Createddt": " ",
                                            "Updatedby": " ",
                                            "Updateddt": " "
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

                                oModel.create(path, oEntry, {
                                    method: "POST",
                                    success: function (oData, oResponse) {
                                        me.getbomGMCTable();
                                        me._BOMbyGMCChanged = false;
                                        me.setChangeStatus(false);
                                        Common.showMessage(me._i18n.getText('t4'));
                                    },
                                    error: function (err) {
                                        var errorMsg = JSON.parse(err.responseText).error.message.value;
                                        oMsgStrip.setVisible(true);
                                        oMsgStrip.setText(errorMsg);
                                        Common.showMessage(me._i18n.getText('t5'));
                                    }
                                });
                            }
                            Common.closeLoadingDialog(that);
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

            onGetComponent: function () {
                //save first
                this._BOMbyGMCChanged = true;
                this.onSaveBOMbyGMC(true);
            },

            getbomUVTable: function () {
                var me = this;
                var columnData = [];
                var oModelUV = this.getOwnerComponent().getModel();
                var usageClass = this.getView().byId("UsageClassCB").getSelectedKey();

                oModelUV.setHeaders({
                    sbu: this._sbu,
                    type: 'BOMUV',
                    usgcls: usageClass
                });

                var pivotArray;
                if(usageClass === "AUV") {
                    pivotArray = me._colors;
                } else {
                    pivotArray = me._sizes;
                }

                oModelUV.read("/DynamicColumnsSet", {
                    success: function (oData, oResponse) {
                        var columns = oData.results;
                        var pivotRow;

                        for (var i = 0; i < columns.length; i++) {
                            if(columns[i].Pivot !== '') {
                                pivotRow = columns[i].Pivot;
                            }
                        }

                        for (var i = 0; i < columns.length; i++) {
                            if (columns[i].Pivot === pivotRow) {
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
                                if(columns[i].ColumnName !== pivotRow) {
                                    if(columns[i].Visible === true) {
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
            },

            getbomUVTableData: function (columnData, pivot) {
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
                        var unique = rowData.filter((rowData, index, self) =>
                            index === self.findIndex((t) => (t.GMC === rowData.GMC && t.PARTCD === rowData.PARTCD && t.MATTYPCLS === rowData.MATTYPCLS)));

                        for (var i = 0; i < unique.length; i++) {

                            //Get the pivot values
                            for (var j = 0; j < rowData.length; j++) {
                                if(rowData[j].DESC1 !== "") {                                
                                    if (unique[i].GMC === rowData[j].GMC && unique[i].PARTCD === rowData[j].PARTCD && unique[i].MATTYPCLS === rowData[j].MATTYPCLS) {
                                        for (var k = 0; k < pivot.length; k++) {
                                            var colname = pivot[k].Attribcd;
                                            if (rowData[j].COLOR === colname) {
                                                unique[i][colname] = rowData[j].DESC1;
                                            } else if (rowData[j].SZE === colname) {
                                                unique[i][colname] = rowData[j].DESC1;
                                            }
                                        }
                                    }
                                }
                            }

                        }

                        rowData = oData.results;
                        var oJSONModel = new JSONModel();
                        oJSONModel.setData({
                            results: unique,
                            columns: columnData
                        });

                        oTable.setModel(oJSONModel, "DataModel");
                        oTable.setVisibleRowCount(unique.length);
                        oTable.attachPaste();

                        oTable.bindColumns("DataModel>/columns", function (sId, oContext) {
                            var column = oContext.getObject();
                            return new sap.ui.table.Column({
                                label: that.getColumnDesc(column),
                                template: that.columnTemplate('UV',column),
                                sortProperty: column.ColumnName,
                                filterProperty: column.ColumnName,
                                width: "8rem"
                            });
                        });

                        oTable.bindRows("DataModel>/results");

                        // //GMC Colors Pivot
                        // pivot = me._colors;

                        // var oTableGMC = that.getView().byId("bomGMCTable");
                        // var oGMCTableData = oTableGMC.getModel('DataModel').getData();

                        // for (var i = 0; i < oGMCTableData.results.items.length; i++) {
                        //     for (var k = 0; k < pivot.length; k++) {
                        //         var colorName = pivot[k].Attribcd;
                        //         for (var j = 0; j < rowData.length; j++) {
                        //             if (rowData[j].MATTYPCLS === 'ZCOLR' && rowData[j].COLOR === colorName) {
                        //                 if (oGMCTableData.results.items[i].GMC === rowData[j].GMC && oGMCTableData.results.items[i].PARTCD === rowData[j].PARTCD && oGMCTableData.results.items[i].MATTYP === rowData[j].MATTYP) {
                        //                     oGMCTableData.results.items[i][colorName] = rowData[j].DESC1;
                        //                 }
                        //             }
                        //         }
                        //     }
                        // }

                        // oTableGMC.bindColumns("DataModel>/columns", function (sId, oContext) {
                        //     var column = oContext.getObject();
                        //     return new sap.ui.table.Column({
                        //         label: that.getColumnDesc(column),
                        //         template: that.columnTemplate('GMC', column),
                        //         sortProperty: column.ColumnName,
                        //         filterProperty: column.ColumnName,
                        //         width: "9rem"
                        //     });
                        // });

                        Common.closeLoadingDialog(that);
                    },
                    error: function (err) { 
                        Common.closeLoadingDialog(that);
                    }
                });
            },

            getBOMGMCColorsData: function () {
                var me = this;
                var oTable = this.getView().byId("bomUVTable");
                var oModel = this.getOwnerComponent().getModel();
                var usageClass = this.getView().byId("UsageClassCB").getSelectedKey();

                var pivot = me._colors;

                oModel.setHeaders({
                    styleno: this._styleNo,
                    verno: this._version
                });
                oModel.read("/StyleBOMGMCColorsSet", {
                    success: function (oData, oResponse) {
                        var rowData = oData.results;
                        var unique = rowData.filter((rowData, index, self) =>
                            index === self.findIndex((t) => (t.GMC === rowData.GMC && t.PARTCD === rowData.PARTCD && t.MATTYPCLS === rowData.MATTYPCLS)));

                        // for (var i = 0; i < unique.length; i++) {

                        //     //Merge BOM by UV
                        //     for (var j = 0; j < rowData.length; j++) {
                        //         if (unique[i].GMC === rowData[j].GMC && unique[i].PARTCD === rowData[j].PARTCD && unique[i].MATTYPCLS === rowData[j].MATTYPCLS) {
                        //             for (var k = 0; k < pivot.length; k++) {
                        //                 var colname = pivot[k].Attribcd;
                        //                 if (rowData[j].COLOR === colname) {
                        //                     unique[i][colname] = rowData[j].DESC1;
                        //                 } else if (rowData[j].SZE === colname) {
                        //                     unique[i][colname] = rowData[j].DESC1;
                        //                 }
                        //             }
                        //         }
                        //     }

                        // }

                        // rowData = oData.results;
                        // var oJSONModel = new JSONModel();
                        // oJSONModel.setData({
                        //     results: unique,
                        //     columns: columnData
                        // });

                        // oTable.setModel(oJSONModel, "DataModel");

                        // oTable.bindColumns("DataModel>/columns", function (sId, oContext) {
                        //     var column = oContext.getObject();
                        //     return new sap.ui.table.Column({
                        //         label: that.getColumnDesc(column),
                        //         template: that.columnTemplate('UV',column),
                        //         sortProperty: column.ColumnName,
                        //         filterProperty: column.ColumnName,
                        //         width: "8rem"
                        //     });
                        // });

                        // oTable.bindRows("DataModel>/results");

                        //GMC Colors Pivot
                        pivot = me._colors;

                        var oTableGMC = that.getView().byId("bomGMCTable");
                        var oGMCTableData = oTableGMC.getModel('DataModel').getData();

                        for (var i = 0; i < oGMCTableData.results.length; i++) {
                            for (var k = 0; k < pivot.length; k++) {
                                var colorName = pivot[k].Attribcd;
                                for (var j = 0; j < rowData.length; j++) {
                                    if (rowData[j].MATTYPCLS === 'ZCOLR' && rowData[j].COLOR === colorName) {
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
                                width: "9rem"
                            });
                        });

                        Common.closeLoadingDialog(that);
                    },
                    error: function (err) { 
                        Common.closeLoadingDialog(that);
                    }
                });
            },

            getColumnDesc: function (column) {
                var desc;
                if (column.ColumnType === "COLOR" || column.ColumnType === "SIZE") {
                    desc = column.ColumnDesc;
                } else {
                    desc = "{i18n>" + column.ColumnName + "}";
                }
                return desc;
            },

            setBOMbyUVEditMode: function() {
                var oJSONModel = new JSONModel();
                var data = {};
                this._BOMbyUVChanged = false;
                data.editMode = true;
                oJSONModel.setData(data);
                this.getView().setModel(oJSONModel, "BOMbyUVEditModeModel");
            },

            // cancelBOMbyUVEdit: function () {
            //     this.cancelEdit(this._BOMbyUVChanged, this.confirmCancelBOMbyUVEdit);
            // },

            cancelBOMbyUVEdit: function () {
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

            onCancelDiscardBOMbyUVChanges: function() {
                this._DiscardBOMbyUVDialog.close();
            },

            closeBOMbyUVEdit: function() {
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
            },

            onBOMbyUVChange: function () {
                that._BOMbyUVChanged = true;
                that.setChangeStatus(true);
            },

            onSaveBOMbyUV: function () {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("bomUVTable").getModel("DataModel");
                var usageClass = this.getView().byId("UsageClassCB").getSelectedKey();
                var path;
                var item = {};

                var oMsgStrip = this.getView().byId('BOMbyUVMessageStrip');
                oMsgStrip.setVisible(false);

                if (!this._BOMbyUVChanged) {
                    Common.showMessage(this._i18n.getText('t7'));
                } else {

                    var oData = oTableModel.getData();
                    var oEntry = {
                        Styleno: this._styleNo,
                        Verno: this._version,
                        Usgcls: usageClass,
                        UVToItems: []
                    }

                    var pivotArray;
                    if (usageClass === "AUV") {
                        pivotArray = this._colors;
                    } else {
                        pivotArray = this._sizes;
                    }

                    var color, size;

                    for (var i = 0; i < oData.results.length; i++) {

                        for (var j = 0; j < pivotArray.length; j++) {

                            // if (usageClass === "AUV") {
                            //     color = attrib.Attribcd;
                            // } else {
                            //     size = attrib.Attribcd;
                            // } 

                            var attrib = pivotArray[j];
                            item = {
                                "Styleno": this._styleNo,
                                "Verno": this._version,
                                "Gmc": oData.results[i].GMC,
                                "Partcd": oData.results[i].PARTCD,
                                "Usgcls": oData.results[i].USGCLS,
                                "Seqno": " ",
                                "Bomitem": " ",
                                "Color": ((oData.results[i].USGCLS === 'AUV') ? attrib.Attribcd : ''), // attrib.Attribcd,
                                "Sze": ((oData.results[i].USGCLS !== 'AUV') ? attrib.Attribcd : ''),
                                "Dest": " ",
                                "Mattyp": oData.results[i].MATTYP,
                                "Mattypcls": oData.results[i].MATTYPCLS,
                                "Attribcd": oData.results[i].ATTRIBCD,
                                "Desc1": oData.results[i][attrib.Attribcd],
                                "Consump": oData.results[i].CONSUMP,
                                "Wastage": oData.results[i].WASTAGE,
                                "Createdby": " ",
                                "Createddt": " ",
                                "Updatedby": " ",
                                "Updateddt": " "
                            };
                            oEntry.UVToItems.push(item);
                        }

                        // if (usageClass === "AUV") {
                        //     for (var j = 0; j < this._colors.length; j++) {

                        //         var color = this._colors[j];
                        //         item = {
                        //             "Styleno": this._styleNo,
                        //             "Verno": this._version,
                        //             "Gmc": oData.results[i].GMC,
                        //             "Partcd": oData.results[i].PARTCD,
                        //             "Usgcls": oData.results[i].USGCLS,
                        //             "Seqno": " ",
                        //             "Bomitem": " ",
                        //             "Color": color.Attribcd,
                        //             "Sze": " ",
                        //             "Dest": " ",
                        //             "Mattyp": oData.results[i].MATTYP,
                        //             "Mattypcls": oData.results[i].MATTYPCLS,
                        //             "Attribcd": oData.results[i].ATTRIBCD,
                        //             "Desc1": oData.results[i][color.Attribcd],
                        //             "Consump": oData.results[i].CONSUMP,
                        //             "Wastage": oData.results[i].WASTAGE,
                        //             "Createdby": " ",
                        //             "Createddt": " ",
                        //             "Updatedby": " ",
                        //             "Updateddt": " "
                        //         };
                        //         oEntry.UVToItems.push(item);
                        //     }
                        // } else if (usageClass === "SUV" || usageClass === "ASUV") {
                        //     for (var k = 0; k < this._sizes.length; k++) {

                        //         var size = this._sizes[k];
                        //         item = {
                        //             "Styleno": this._styleNo,
                        //             "Verno": this._version,
                        //             "Gmc": oData.results[i].GMC,
                        //             "Partcd": oData.results[i].PARTCD,
                        //             "Usgcls": oData.results[i].USGCLS,
                        //             "Seqno": " ",
                        //             "Bomitem": " ",
                        //             "Color": " ",
                        //             "Sze": size.Attribcd,
                        //             "Dest": " ",
                        //             "Mattyp": oData.results[i].MATTYP,
                        //             "Mattypcls": oData.results[i].MATTYPCLS,
                        //             "Attribcd": oData.results[i].ATTRIBCD,
                        //             "Desc1": oData.results[i][size.Attribcd],
                        //             "Consump": oData.results[i].CONSUMP,
                        //             "Wastage": oData.results[i].WASTAGE,
                        //             "Createdby": " ",
                        //             "Createddt": " ",
                        //             "Updatedby": " ",
                        //             "Updateddt": " "
                        //         };
                        //         oEntry.UVToItems.push(item);
                        //     }
                        // }
                    };

                    Common.openLoadingDialog(that);

                    path = "/BOMUVSet";

                    oModel.setHeaders({
                        sbu: this._sbu
                    });

                    oModel.create(path, oEntry, {
                        method: "POST",
                        success: function (oData, oResponse) {
                            me.getbomGMCTable();
                            me._BOMbyUVChanged = false;
                            me.setChangeStatus(false);
                            Common.closeLoadingDialog(that);
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

            onRMC: function() {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();

                var entitySet = "/StyleBOMGMCSet(STYLENO='" + this._styleNo +  "',VERNO='" + this._version + "',BOMSEQ='')";

                Common.openLoadingDialog(this);

                oModel.setHeaders({sbu: this._sbu});

                var oEntry = {
                    STYLENO: this._styleNo,
                    VERNO: this._version
                };

                oModel.setHeaders({
                    sbu: this._sbu
                });

                oModel.update(entitySet, oEntry, {
                    method: "PUT",
                    success: function(data, oResponse) {
                        me.onRefresh();
                        Common.closeLoadingDialog(me);
                        Common.showMessage(me._i18n.getText('t4'));
                    },
                    error: function() {
                        Common.closeLoadingDialog(me);
                        Common.showMessage(me._i18n.getText('t5'));
                    }
                });
            },

            getDetailedBOM: function () {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var oTable = this.getView().byId("bomDetailedTable");
                var rowData = {
                    items: []
                };
                var data = {results: rowData};

                oModel.setHeaders({
                    styleno: this._styleNo,
                    verno: this._version
                });
                var entitySet = "/StyleDetailedBOMSet"
                oModel.read(entitySet, {
                    success: function (oData, oResponse) {

                        var style;
                        var gmc;
                        var partcd;
                        var item = {};
                        var item2 = {};
                        var items = [];
                        var items2 = [];

                        for (var i = 0; i < oData.results.length; i++) {

                            if (oData.results[i].Bomitmtyp === 'STY') {

                                item = oData.results[i];
                                items = [];

                                style = oData.results[i].Bomstyle;
                                for (var j = 0; j < oData.results.length; j++) {
                                    if (oData.results[j].Bomitmtyp === 'GMC' && oData.results[j].Bomstyle === style) {
                                        
                                        items2 = [];

                                        item2 = oData.results[j];

                                        gmc = oData.results[j].Gmc;
                                        partcd = oData.results[j].Partcd;
                                        for (var k = 0; k < oData.results.length; k++) {
                                            if (oData.results[k].Bomitmtyp === 'MAT' && oData.results[k].Gmc === gmc && oData.results[k].Partcd === partcd) {
                                                items2.push(oData.results[k]);
                                            }
                                        }

                                        item2.items = items2;
                                        items.push(item2);
                                    }
                                }

                                item.items = items;
                                rowData.items.push(item);
                            } else if (oData.results[i].Bomitmtyp === 'GMC' && oData.results[i].Bomstyle === '') {

                                items = [];

                                item = oData.results[i];

                                gmc = oData.results[i].Gmc;
                                partcd = oData.results[i].Partcd;
                                for (var k = 0; k < oData.results.length; k++) {
                                    if (oData.results[k].Bomitmtyp === 'MAT' && oData.results[k].Gmc === gmc && oData.results[k].Partcd === partcd) {
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

            getMaterialList: function () {
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
                        oTable.setVisibleRowCount(oData.results.length);
                        oTable.attachPaste();
                    },
                    error: function () { 
                    }
                })
            },

            setMaterialListEditMode: function() {
                var oJSONModel = new JSONModel();
                var data = {};
                this._materialListChanged = false;
                data.editMode = true;
                oJSONModel.setData(data);
                this.getView().setModel(oJSONModel, "MaterialListEditModeModel");
            },

            // cancelMaterialListEdit: function () {
            //     this.cancelEdit(this._materialListChanged, this.confirmCancelMaterialListEdit);
            // },

            cancelMaterialListEdit: function () {
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

            onCancelDiscardMaterialListChanges: function() {
                this._DiscardMaterialListChangesDialog.close();
            },

            closeMaterialListEdit: function() {
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
            },

            onMaterialListChange: function () {
                this._materialListChanged = true;
                this.setChangeStatus(true);
            },

            onSaveMaterialList: function() {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("materialListTable").getModel("DataModel");
                var path;

                var oMsgStrip = this.getView().byId('MaterialListMessageStrip');
                oMsgStrip.setVisible(false);

                if (!this._materialListChanged) {
                    Common.showMessage(this._i18n.getText('t7'));
                } else {

                    var oData = oTableModel.getData();
                    var oEntry = {
                        Styleno: this._styleNo,
                        Sbu: this._sbu,                    
                        MatListToItems: [ ]
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
                            "Matdesc2": oData.results[i].Matdesc2,
                            "Deleted": " ",
                            "Createdby": " ",
                            "Createddt": " ",
                            "Updatedby": " ",
                            "Updateddt": " "
                        }
        
                        oEntry.MatListToItems.push(item);
                    };

                    Common.openLoadingDialog(that);

                    path = "/MaterialListSet";

                    oModel.setHeaders({
                        sbu: this._sbu
                    });

                    oModel.create(path, oEntry, {
                        method: "POST",
                        success: function(oData, oResponse) {
                            me.getMaterialList();
                            me._materialListChanged = false;
                            me.setChangeStatus(false);
                            Common.closeLoadingDialog(me);
                            Common.showMessage(me._i18n.getText('t4'));
                        },
                        error: function(err) {
                            Common.closeLoadingDialog(me);
                            Common.showMessage(me._i18n.getText('t5'));
                            var errorMsg = JSON.parse(err.responseText).error.message.value;
                            oMsgStrip.setVisible(true);
                            oMsgStrip.setText(errorMsg);
                        }
                    });

                }
            },

            onAssignMaterial: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteAssignMaterial", {
                    styleno: this._styleNo,
                    sbu: this._sbu,
                    version: this._version
                });
            },

            columnTemplate: function (type, column) {
                var columnName = column.ColumnName;
                var columnType = column.ColumnType;
                var editModeCond;
                var changeFunction;
                var liveChangeFunction;

                if(type === "GMC") {
                    changeFunction = that.onBOMbyGMCChange;
                    liveChangeFunction = that.onBOMbyGMCLiveChange;
                    editModeCond = '${BOMbyGMCEditModeModel>/editMode} ? true : false';
                } else {
                    changeFunction = that.onBOMbyUVChange;
                    liveChangeFunction = that.onBOMbyUVChange;
                    editModeCond = '${BOMbyUVEditModeModel>/editMode} ? true : false';
                }

                var oColumnTemplate;
                if (columnType === "COLOR") {
                    oColumnTemplate = new sap.m.Input({
                        value: "{DataModel>" + columnName + "}",
                        change: changeFunction,
                        liveChange: changeFunction,
                        editable: "{= ${DataModel>USGCLS} === 'AUV' ? " + editModeCond + " : ${DataModel>USGCLS} === 'ASUV' ? " + editModeCond + " : false }",
                        visible: true
                    });
                } else {
                    if (columnName === "BOMSEQ" || columnName === "BOMITEM" || columnName === "DESC1") {
                        oColumnTemplate = new sap.m.Text({ text: "{DataModel>" + columnName + "}" });
                    } else if (columnName === "BOMITMTYP") {
                        oColumnTemplate = new sap.m.ComboBox({
                            value: "{DataModel>" + columnName + "}",
                            items: [{
                                key: "GMC",
                                text: "GMC"
                            }, {
                                key: "STY",
                                text: "STY"
                            }],
                            change: changeFunction,
                            editable: ((column.Editable) ? "{= " + editModeCond + " }" : false ),
                            visible: column.Visible
                        });
                    } else if (columnName === "PROCESSCD") {
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
                                templateShareable:true
                            },
                            change: changeFunction,
                            liveChange: changeFunction,
                            editable: ((column.Editable) ? "{= ${DataModel>BOMITMTYP} === 'STY' ? false : " + editModeCond + " }" : false ),
                            visible: column.Visible
                        });
                    } else if (columnName === "MATTYP") {
                        oColumnTemplate = new sap.m.Input({
                            value: "{DataModel>" + columnName + "}",
                            showValueHelp: true,
                            valueHelpRequest: that.onMatTypeValueHelp,
                            editable: ((column.Editable) ? "{= ${DataModel>BOMITMTYP} === 'STY' ? false : " + editModeCond + " }" : false ),
                            visible: column.Visible,
                            showSuggestion: true,
                            suggestionItems: {
                                path: "MatTypeModel>/results",
                                template: new sap.ui.core.ListItem({
                                    text: "{MatTypeModel>Mattype}",
                                    additionalText: "{MatTypeModel>Desc1}"
                                })
                            },
                            change: changeFunction,
                            liveChange: changeFunction
                        });
                    } else if (columnName === "USGCLS") {
                        oColumnTemplate = new sap.m.ComboBox({
                            value: "{DataModel>" + columnName + "}",
                            showSecondaryValues: true,
                            items: {
                                path: "UsageClassModel>/results",
                                template: new sap.ui.core.ListItem({
                                    text: "{UsageClassModel>Usgcls}",
                                    additionalText: "{UsageClassModel>Ucdesc1}"
                                })
                            },
                            change: changeFunction,
                            editable: ((column.Editable) ? "{= ${DataModel>BOMITMTYP} === 'STY' ? false : " + editModeCond + " }" : false ),
                            visible: column.Visible
                        });
                    } else if (columnName === "ENTRYUOM") {
                        oColumnTemplate = new sap.m.Input({
                            value: "{DataModel>" + columnName + "}",
                            showValueHelp: true,
                            valueHelpRequest: that.onUomGMCValueHelp,
                            editable: ((column.Editable) ? "{= ${DataModel>BOMITMTYP} === 'STY' ? false : " + editModeCond + " }" : false ),
                            visible: column.Visible,
                            showSuggestion: true,
                            suggestionItems: {
                                path: "UOMGMCModel>/results",
                                template: new sap.ui.core.ListItem({
                                    text: "{UOMGMCModel>Valunit}",
                                    additionalText: "{UOMGMCModel>Desc1}"
                                })
                            },
                            change: changeFunction,
                            liveChange: changeFunction
                        });
                    } else if (columnName === "GMC") {
                        oColumnTemplate = new sap.m.Input({
                            value: "{DataModel>" + columnName + "}",
                            showValueHelp: true,
                            valueHelpRequest: that.onGMCValueHelp,
                            change: changeFunction,
                            liveChange: liveChangeFunction,
                            editable: ((column.Editable) ? "{= ${DataModel>BOMITMTYP} === 'STY' ? false : " + editModeCond + " }" : false ),
                            visible: column.Visible
                        });
                    } else if (columnName === "BOMSTYLE") {
                        oColumnTemplate = new sap.m.Input({
                            value: "{DataModel>" + columnName + "}",
                            showValueHelp: true,
                            valueHelpRequest: that.onStyleValueHelp,
                            change: changeFunction,
                            liveChange: changeFunction,
                            editable: ((column.Editable) ? "{= ${DataModel>BOMITMTYP} === 'GMC' ? false : " + editModeCond + " }" : false ),
                            visible: column.Visible
                        });
                    } else if (columnName === "BOMSTYLVER") {
                        oColumnTemplate = new sap.m.Input({
                            value: "{DataModel>" + columnName + "}",
                            type: "Number",
                            change: changeFunction,
                            liveChange: changeFunction,
                            editable: ((column.Editable) ? "{= ${DataModel>BOMITMTYP} === 'GMC' ? false : " + editModeCond + " }" : false ),
                            visible: column.Visible
                        });
                    } else {
                        oColumnTemplate = new sap.m.Input({
                            value: "{DataModel>" + columnName + "}",
                            change: changeFunction,
                            liveChange: changeFunction,
                            editable: ((column.Editable) ? "{= ${DataModel>BOMITMTYP} === 'STY' ? false : " + editModeCond + " }" : false ),
                            visible: column.Visible
                        })
                    }
                }
                return oColumnTemplate;
            },

            addBOMItem: function (item) {
                return {
                    "Styleno": this._styleNo,
                    "Verno": this._version,
                    "Bomseq": item.BOMSEQ,
                    "Bomitem": " ",
                    "Compseq": " ",
                    "Sortseq": " ",
                    "Partseq": " ",
                    "Uvseq": " ",
                    "Altseq": " ",
                    "Bomitmtyp": item.BOMITMTYP,
                    "Bomstyle": item.BOMSTYLE,
                    "Bomstylver": item.BOMSTYLVER,
                    "Partcd": item.PARTCD,
                    "Partdesc": item.PARTDESC,
                    "Partcnt": item.PARTCNT,
                    "Usgcls": item.USGCLS,
                    "Custstyle": item.CUSTSTYLE,
                    "Color": " ",
                    "Sizes": " ",
                    "Dest": " ",
                    "Mattyp": item.MATTYP,
                    "Gmc": item.GMC,
                    "Matno": item.REFMATNO,
                    "Entryuom": item.ENTRYUOM,
                    "Matconsper": item.MATCONSPER,
                    "Per": item.PER,
                    "Issueuom": " ",
                    "Matconsump": " ",
                    "Wastage": item.WASTAGE,
                    "Comconsump": item.COMCONSUMP,
                    "Override": " ",
                    "Altconsump": " ",
                    "Consump": item.CONSUMP,
                    "Diml": " ",
                    "Dimw": " ",
                    "Dimuom":  " ",
                    "Processcd": item.PROCESSCD,
                    "Remarks": " ",
                    "Refmatno": item.REFMATNO,
                    "Refmatdesc": item.REFMATDESC,
                    "Refcolor": " ",
                    "Refmattyp": " ",
                    "Vendmatcd": " ",
                    "Vendmatdesc": " ",
                    "Deleted": " ",
                    "Createdby": " ",
                    "Createddt": " ",
                    "Updatedby": " ",
                    "Updateddt": " "
                }
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

            addLine: function (oEvent) {
                var oButton = oEvent.getSource();
                var tabName = oButton.data('TableName')
                var oTable = this.getView().byId(tabName);
                var oModel = this.getView().byId(tabName).getModel("DataModel");
                var oData = oModel.getProperty('/results');
                oData.push({});
                oTable.getBinding("rows").refresh();
                oTable.setVisibleRowCount(oData.length);
                // oTable.attachPaste();
            },

            addLineBOM: function (oEvent) {
                var oButton = oEvent.getSource();
                var tabName = oButton.data('TableName')
                var oTable = this.getView().byId(tabName);
                var oModel = this.getView().byId(tabName).getModel("DataModel");
                var oData = oModel.getProperty('/results');
                oData.push({});
                oTable.getBinding("rows").refresh();
                oTable.setVisibleRowCount(oData.length);
            },

            removeLine: function (oEvent) {
                var oButton = oEvent.getSource();
                var tabName = oButton.data('TableName')
                var oTable = this.getView().byId(tabName);
                var oModel = this.getView().byId(tabName).getModel("DataModel");
                var oData = oModel.getData(); // oModel.getProperty('/results');
                var selected = oTable.getSelectedIndices();
                oData.results = oData.results.filter(function (value, index) {
                    return selected.indexOf(index) == -1;
                })

                oModel.setData(oData);
                oTable.clearSelection();
            },

            onDeleteBOMItems: function () {
                var oTable = this.getView().byId('bomGMCTable');
                var selected = oTable.getSelectedIndices();
                if(selected.length > 0) {
                    if (!this._ConfirmDeleteBOMDialog) {
                        this._ConfirmDeleteBOMDialog = sap.ui.xmlfragment("zui3derp.view.fragments.dialog.ConfirmDeleteBOMItems", this);
                        this.getView().addDependent(this._ConfirmDeleteBOMDialog);
                    }
                    jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                    this._ConfirmDeleteBOMDialog.addStyleClass("sapUiSizeCompact");
                    this._ConfirmDeleteBOMDialog.open();
                } else {
                    Common.showMessage(this._i18n.getText('t8'))
                }
            },
           
            onConfirmDeleteBOMItems: function() {
            	var me = this;
                var oModel = this.getOwnerComponent().getModel();

                var oTable = this.getView().byId("bomGMCTable");
                var oTableModel = oTable.getModel("DataModel");
                var oData = oTableModel.getData();
                var selected = oTable.getSelectedIndices();
                
                oModel.setUseBatch(true);
                oModel.setDeferredGroups(["group1"]);
                
                this._ConfirmDeleteBOMDialog.close();
                
                if(selected.length > 0) {
	                for (var i = 0; i < selected.length; i++) {

                        // var sPath = oTable.getContextByIndex(selected[i]).sPath;
                        // var rowData = oTableModel.getProperty(sPath);
	                	
	                	var verno = this._version;
	                	var bomseq = oData.results[selected[i]].BOMSEQ;
                        // var bomseq = rowData.BOMSEQ;

                        if(bomseq !== "0") {	                	
                            verno = this.pad(verno, 3);
                            bomseq = this.pad(bomseq, 3);
        
                            var entitySet = "/StyleBOMGMCSet(STYLENO='" + this._styleNo + "',VERNO='" + verno + "',BOMSEQ='" + bomseq + "')";
            
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
	                }
	                
	                oData.results = oData.results.filter(function (value, index) {
                    	return selected.indexOf(index) == -1;
	                })
	
	                oTableModel.setData(oData);
	                oTable.clearSelection();
                }
            },

            onNavBack: function () {
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();
    
                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("RouteStyles");
                }
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
                    this.onVersionAttrChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onAttrCodesValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                var attrTyp = oData.getProperty('Attribtyp');
                this.inputId = oEvent.getSource().getId();
                this.descId = oEvent.getSource().getParent().mAggregations.cells[2].getId();
                if (!this._attrCodesValueHelpDialog) {
                    this._attrCodesValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.AttributeCodes", this);
                    this.getView().addDependent(this._attrCodesValueHelpDialog);
                }
                this._attrCodesValueHelpDialog.getBinding("items").filter([new Filter("Attribtyp", sap.ui.model.FilterOperator.EQ, attrTyp)]);
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
                    this.onVersionAttrChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onUomValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                this.inputId = oEvent.getSource().getId();
                if (!this._uomValueHelpDialog) {
                    this._uomValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.UoM", this);
                    that.getView().addDependent(this._uomValueHelpDialog);
                }
                this._uomValueHelpDialog.open(sInputValue);
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
                    var productInput = this.byId(this.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    this.onVersionAttrChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onUomGMCValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                that.inputId = oEvent.getSource().getId();
                if (!that._uomGMCValueHelpDialog) {
                    that._uomGMCValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.UoMGMC", that);
                    that.getView().addDependent(that._uomGMCValueHelpDialog);
                }
                that._uomGMCValueHelpDialog.open(sInputValue);
            },

            _uomGMCValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Valunit", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _uomGMCValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = sap.ui.getCore().byId(that.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    that.onBOMbyGMCChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onProcessesValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                that.inputId = oEvent.getSource().getId();
                if (!that._processesValueHelpDialog) {
                    that._processesValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.Processes", that);
                    that.getView().addDependent(that._processesValueHelpDialog);
                }
                that._processesValueHelpDialog.open(sInputValue);
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
                    var productInput = sap.ui.getCore().byId(that.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    that.onBOMbyGMCChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onMatTypeValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                that.inputId = oEvent.getSource().getId();
                if (!that._matTypeValueHelpDialog) {
                    that._matTypeValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.MaterialTypes", that);
                    that.getView().addDependent(that._matTypeValueHelpDialog);
                }
                that._matTypeValueHelpDialog.open(sInputValue);
            },

            _matTypeValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Mattype", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _matTypeValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = sap.ui.getCore().byId(that.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    that.onBOMbyGMCChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onGMCValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                var matType = oData.getProperty('MATTYP');
                that.inputId = oEvent.getSource().getId();
                var oTable = that.getView().byId("bomGMCTable");
                var oColumns = oTable.getColumns();

                for(var i = 0; i < oColumns.length; i++) {
                    var name = oColumns[i].getName();
                    if(name === 'MATTYP') {
                        that.matType = oEvent.getSource().getParent().mAggregations.cells[i].getId();
                    }
                    if(name === 'ENTRYUOM') {
                        that.baseUom = oEvent.getSource().getParent().mAggregations.cells[i].getId();
                    }
                }
                
                if (!that._GMCValueHelpDialog) {
                    that._GMCValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.GMC", that);
                    that.getView().addDependent(that._GMCValueHelpDialog);
                }
                if (matType !== undefined && matType !== '') {
                    that._GMCValueHelpDialog.getBinding("items").filter([new Filter(
                        "Mattyp",
                        sap.ui.model.FilterOperator.EQ, matType
                    )]);
                }

                that._GMCValueHelpDialog.open(sInputValue);
            },

            _GMCValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Gmc", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _GMCValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = sap.ui.getCore().byId(that.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    that.onBOMbyGMCChange();
                    var matTypeInput = sap.ui.getCore().byId(that.matType);
                    matTypeInput.setValue(oSelectedItem.getInfo());
                    var oBaseuom = oSelectedItem.data('Baseuom');
                    var uomInput = sap.ui.getCore().byId(that.baseUom);
                    uomInput.setValue(oBaseuom);
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onStyleValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                that.inputId = oEvent.getSource().getId();
                if (!that._styleValueHelpDialog) {
                    that._styleValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.Styles", that);
                    that.getView().addDependent(that._styleValueHelpDialog);
                }

                that._styleValueHelpDialog.open(sInputValue);
            },

            _styleValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Styleno", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _styleValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = sap.ui.getCore().byId(that.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    that.onBOMbyGMCChange();
                    var matTypeInput = sap.ui.getCore().byId(that.matType);
                    matTypeInput.setValue(oSelectedItem.getInfo());
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onSupplyTypeValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                that.inputId = oEvent.getSource().getId();
                if (!that._supplyTypeValueHelpDialog) {
                    that._supplyTypeValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.SupplyTypes", that);
                    that.getView().addDependent(that._supplyTypeValueHelpDialog);
                }

                that._supplyTypeValueHelpDialog.open(sInputValue);
            },

            _supplyTypeValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Supplytype", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _supplyTypeValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = sap.ui.getCore().byId(that.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    that.onMaterialListChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onVendorValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                that.inputId = oEvent.getSource().getId();
                if (!that._vendorValueHelpDialog) {
                    that._vendorValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.Vendors", that);
                    that.getView().addDependent(that._vendorValueHelpDialog);
                }

                that._vendorValueHelpDialog.open(sInputValue);
            },

            _vendorValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _vendorValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = sap.ui.getCore().byId(that.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    that.onMaterialListChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onCurrencyValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                that.inputId = oEvent.getSource().getId();
                if (!that._currencyValueHelpDialog) {
                    that._currencyValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.Currencies", that);
                    that.getView().addDependent(that._currencyValueHelpDialog);
                }

                that._currencyValueHelpDialog.open(sInputValue);
            },

            _currencyValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Waers", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _currencyValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = sap.ui.getCore().byId(that.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    that.onMaterialListChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onPurGroupValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                that.inputId = oEvent.getSource().getId();
                if (!that._purGroupValueHelpDialog) {
                    that._purGroupValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.PurchasingGroups", that);
                    that.getView().addDependent(that._purGroupValueHelpDialog);
                }

                that._purGroupValueHelpDialog.open(sInputValue);
            },

            _purGroupValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Purgrp", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _purGroupValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = sap.ui.getCore().byId(that.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    that.onMaterialListChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            onPurPlantValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                that.inputId = oEvent.getSource().getId();
                if (!that._purPlantValueHelpDialog) {
                    that._purPlantValueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.PurchasingPlants", that);
                    that.getView().addDependent(that._purPlantValueHelpDialog);
                }
                that._purPlantValueHelpDialog.open(sInputValue);
            },

            _purPlantValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("Desc1", sap.ui.model.FilterOperator.Contains, sValue));
                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                evt.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
            },

            _purPlantValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = sap.ui.getCore().byId(that.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                    that.onMaterialListChange();
                }
                evt.getSource().getBinding("items").filter([]);
            },

            pad: Common.pad,

            onExportExcel: Utils.onExportExcel,

            onExport: Utils.onExport,

            onCancelDeleteVersionAttr: Common.onCancelDeleteVersionAttr,

            onCancelDeleteBOMItems: Common.onCancelDeleteBOMItems,

            onCancelDiscardChanges: Common.onCancelDiscardChanges
        });
    });