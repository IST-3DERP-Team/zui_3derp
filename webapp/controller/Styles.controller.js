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
                console.log("from styles")
            },
            
            onAfterRendering: function() {
//                 var oTable = this.getView().byId("idMyTable");
//                 for (i = 0; i < s; i++) {
//                     var oColumn = new sap.m.Column("col" + i, {
//                         width: "1em",
//                         header: new sap.m.Label({
//                             text: "Data No. "+i
                this.getData();
            },

            getData: function() {
                var me = this;

                var oModel = this.getOwnerComponent().getModel();

                var columnsEntitySet = "/DynamicColumnsSet";
                var oJSONColumnsModel = new sap.ui.model.json.JSONModel();
                this.oJSONModel = new sap.ui.model.json.JSONModel();

                var header = {
                  sbu: 'VER',
                  type: 'STYLHDR'
                };

                oModel.setHeaders(header);

                oModel.read(columnsEntitySet, {
                    success: function (oData, oResponse) {
                        oJSONColumnsModel.setData(oData);
                        me.oJSONModel.setData(oData);

                        me.getView().setModel(oJSONColumnsModel, "DynColumns");
                        me.setTableColumns();
                    },
                    error: function (err) { }
                });

            },

            setTableColumns: function() {
                var me = this;
    
                var oModel = this.getView().getModel("DynColumns");
                var oDynColumns = oModel.getProperty('/results');
    
                var oTable = this.getView().byId("styleDynTable");
                var i = 0;
                
                var oDeleteColumn = new sap.m.Column("Delete" + i, {
                    width: "3em"
                });
                oTable.addColumn(oDeleteColumn);
    
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

            onPersoButtonPressed: function() {
                var oPersonalizationDialog = sap.ui.xmlfragment("zui3derp.view.fragments.StylesPerso", this);
                // this.oJSONModel.setProperty("/ShowResetEnabled", this._isChangedColumnsItems());
                oPersonalizationDialog.setModel(this.oJSONModel);
    
                this.getView().addDependent(oPersonalizationDialog);
    
                this.oDataBeforeOpen = jQuery.extend(true, {}, this.oJSONModel.getData());
                oPersonalizationDialog.open();
            },
    
            onChangeColumnsItems: function(oEvent) {
                this.oJSONModel.setProperty("/ColumnsItems", oEvent.getParameter("items"));
                this.oJSONModel.setProperty("/ShowResetEnabled", this._isChangedColumnsItems());
            },
    
            _isChangedColumnsItems: function() {
                var fnGetArrayElementByKey = function(sKey, sValue, aArray) {
                    var aElements = aArray.filter(function(oElement) {
                        return oElement[sKey] !== undefined && oElement[sKey] === sValue;
                    });
                    return aElements.length ? aElements[0] : null;
                };
                var fnGetUnion = function(aDataBase, aData) {
                    if (!aData) {
                        return jQuery.extend(true, [], aDataBase);
                    }
                    var aUnion = jQuery.extend(true, [], aData);
                    aDataBase.forEach(function(oMItemBase) {
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
                var fnIsEqual = function(aDataBase, aData) {
                    if (!aData) {
                        return true;
                    }
                    if (aDataBase.length !== aData.length) {
                        return false;
                    }
                    var fnSort = function(a, b) {
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
                    var aItemsNotEqual = aDataBase.filter(function(oDataBase, iIndex) {
                        return oDataBase.columnKey !== aData[iIndex].columnKey || oDataBase.visible !== aData[iIndex].visible || oDataBase.index !== aData[iIndex].index || oDataBase.width !== aData[iIndex].width || oDataBase.total !== aData[iIndex].total;
                    });
                    return aItemsNotEqual.length === 0;
                };
    
                var aDataRuntime = fnGetUnion(this.oDataInitial.ColumnsItems, this.oJSONModel.getProperty("/ColumnsItems"));
                return !fnIsEqual(aDataRuntime, this.oDataInitial.ColumnsItems);
            }
            
        });
        
    });
