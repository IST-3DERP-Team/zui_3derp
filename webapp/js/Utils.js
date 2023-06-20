    sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/export/Spreadsheet",
], function (MessageToast, JSONModel, Spreadsheet) {
    "use strict";

    // var that = this;

   

    return {

        getStyleSearchHelps: function (that) {
            var oView = that.getView();
            var oSHModel = that.getOwnerComponent().getModel("SearchHelps");
            oSHModel.setUseBatch(false);
            var oModel = that.getOwnerComponent().getModel();

            oModel.setHeaders({
                sbu: that._sbu
            });

            oSHModel.setHeaders({
                sbu: that._sbu
            });

            //get Seasons
            var oJSONModel0 = new JSONModel();
            oSHModel.read("/SeasonSet", {
                success: function (oData, oResponse) {
                    //console.log(JSON.stringify(oData.results));
                    oJSONModel0.setData(oData);
                    oJSONModel0.setSizeLimit(9999);
                    oView.setModel(oJSONModel0, "SeasonsModel");
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/SeasonsModel", oData);
                },
                error: function (err) { }
            });

            //get Product Types
            var oJSONModel1 = new JSONModel();
            oSHModel.read("/ProductTypeSet", {
                success: function (oData, oResponse) {
                    oJSONModel1.setData(oData);
                    oJSONModel1.setSizeLimit(9999);
                    oView.setModel(oJSONModel1, "ProdTypeModel");
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/ProdTypeModel", oData);
                },
                error: function (err) { }
            });

            //get Style Cat
            var oJSONModel2 = new JSONModel();
            oSHModel.read("/StyleCatSet", {
                success: function (oData, oResponse) {
                    oJSONModel2.setData(oData);
                    oJSONModel2.setSizeLimit(9999);
                    oView.setModel(oJSONModel2, "StyleCatModel");
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/StyleCatModel", oData);
                },
                error: function (err) { }
            });

            //get Sales Groups
            var oJSONModel3 = new JSONModel();
            oSHModel.read("/SalesGroupSet", {
                success: function (oData, oResponse) {
                    oJSONModel3.setData(oData);
                    oJSONModel3.setSizeLimit(9999);
                    oView.setModel(oJSONModel3, "SalesGroupModel");
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/SalesGroupModel", oData);
                },
                error: function (err) { }
            });

            //get Customer Groups
            var oJSONModel4 = new JSONModel();
            oSHModel.read("/CustomerGroupSet", {
                success: function (oData, oResponse) {
                    oJSONModel4.setData(oData);
                    oJSONModel4.setSizeLimit(9999);
                    oView.setModel(oJSONModel4, "CustGroupModel")
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/CustGroupModel", oData);
                },
                error: function (err) { }
            });

            //get Customers
            var oJSONModel5 = new JSONModel();
            oSHModel.read("/SoldToCustSet", {
                success: function (oData, oResponse) {
                    oJSONModel5.setData(oData);
                    oJSONModel5.setSizeLimit(9999);
                    oView.setModel(oJSONModel5, "CustomersModel");
                    oView.setModel(new JSONModel(oData), "CustomerModel");
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/CustomerModel", oData);

                    if (that.getView().getModel("headerData") !== undefined) {
                        var vCustgrp = that.getView().getModel("headerData").getProperty("/Custgrp");
                        var aModelData = oData.results.filter(fItem => fItem.Custgrp === vCustgrp);
                        var oModelData = {};
                        oModelData["results"] = aModelData;
                        that.getView().setModel(new JSONModel(oModelData), "CustomerModel");
                        that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/CustomerModel", oData);
                    }
                },
                error: function (err) { }
            });

            //get Size Groups
            var oJSONModel6 = new JSONModel();
            oSHModel.read("/SizeGrpSet", {
                success: function (oData, oResponse) {
                    oJSONModel6.setData(oData);
                    oJSONModel6.setSizeLimit(9999);
                    oView.setModel(oJSONModel6, "SizeGroupModel");
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/SizeGroupModel", oData);
                },
                error: function (err) { }
            });

            //get UoM
            var oJSONModel7 = new JSONModel();
            oSHModel.read("/UOMSet", {
                success: function (oData, oResponse) {
                    oJSONModel7.setData(oData);
                    oJSONModel7.setSizeLimit(9999);
                    oView.setModel(oJSONModel7, "UOMModel");
                    oView.setModel(oJSONModel7, "UOMGMCModel");
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/UOMModel",oData);
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/UOMGMCModel",oData);
                },
                error: function (err) { }
            });
            
        },

        getAttributesSearchHelps: function (that) {
            var oView = that.getView();

            var oModel = that.getOwnerComponent().getModel();
            var oSHModel = that.getOwnerComponent().getModel("SearchHelps");
            oSHModel.setUseBatch(false);
            oModel.setHeaders({
                sbu: that._sbu
            });

            oSHModel.setHeaders({
                sbu: that._sbu
            });

            //get Attributes
            var oJSONModel1 = new JSONModel();
            oSHModel.setHeaders({
                dispgrp: "STYINFO"
            });
            oSHModel.read("/AttribTypeSet", {
                success: function (oData, oResponse) {
                    oJSONModel1.setData(oData);
                    oJSONModel1.setSizeLimit(9999);
                    oView.setModel(oJSONModel1, "AttribTypeModel");
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/AttribTypeModel",oData);
                },
                error: function (err) { }
            });

           
            //get Attribute Codes
            var oJSONModel2 = new JSONModel();
            oSHModel.read("/AttribCode2Set", {
                success: function (oData, oResponse) {
                    oJSONModel2.setData(oData);
                    oJSONModel2.setSizeLimit(9999);
                    oView.setModel(oJSONModel2, "AttribCdModel");
                    oView.setModel(new JSONModel(oData), "AttribCodeModel");
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/AttribCdModel",oData);
                },
                error: function (err) { }
            });
            
            /*transfer to getProcessAttributes
            //Process Codes
            var oJSONModel3 = new JSONModel();
            oSHModel.read("/ProcessCodeSet", {
                success: function (oData, oResponse) {
                    oJSONModel3.setData(oData);
                    oJSONModel3.setSizeLimit(9999);
                    oView.setModel(oJSONModel3, "ProcessCodeModel");
                },
                error: function (err) { }
            });

            //VAS Types
            var oJSONModel6 = new JSONModel();
            oSHModel.read("/VASTypeSet", {
                success: function (oData, oResponse) {
                    oJSONModel6.setData(oData);
                    oJSONModel6.setSizeLimit(9999);
                    oView.setModel(oJSONModel6, "VASTypeModel");
                },
                error: function (err) { }
            });
            */

        },

        getProcessAttributes: function(that) {
            var oView = that.getView();
            var oSHModel = that.getOwnerComponent().getModel("SearchHelps");

            //get Process Attribute Types
            var oJSONModel1 = new JSONModel();
            oSHModel.setHeaders({
                styleno: that._styleNo
            });
            oSHModel.read("/ProcessAttribTypeSet", {
                success: function (oData, oResponse) {
                    oJSONModel1.setData(oData);
                    oJSONModel1.setSizeLimit(9999);
                    oView.setModel(oJSONModel1, "ProcessAttribTypeModel");
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/ProcessAttribTypeModel", oData);
                },
                error: function (err) { }
            });

            //get Process Attribute Codes
            var oJSONModel2 = new JSONModel();
            oSHModel.read("/ProcessAttribCodeSet", {
                success: function (oData, oResponse) {
                    oJSONModel2.setData(oData);
                    oJSONModel2.setSizeLimit(9999);
                    oView.setModel(oJSONModel2, "ProcessAttribCodeModel");
                    oView.setModel(new JSONModel(oData), "ProcessAttribCdModel");
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/ProcessAttribCodeModel", oData);
                },
                error: function (err) { }
            });


            //Process Codes
            var oJSONModel3 = new JSONModel();
            oSHModel.read("/ProcessCodeSet", {
                success: function (oData, oResponse) {
                    oJSONModel3.setData(oData);
                    oJSONModel3.setSizeLimit(9999);
                    oView.setModel(oJSONModel3, "ProcessCodeModel");
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/ProcessCodeModel",oData);
                },
                error: function (err) { }
            });

            //VAS Types
            var oJSONModel6 = new JSONModel();
            oSHModel.read("/VASTypeSet", {
                success: function (oData, oResponse) {
                    oJSONModel6.setData(oData);
                    oJSONModel6.setSizeLimit(9999);
                    oView.setModel(oJSONModel6, "VASTypeModel");
                    oView.setModel(new JSONModel(oData), "VASTypModel");
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/VASTypModel", oData);
                },
                error: function (err) { }
            });
        },

        getVersionSearchHelps: function (that) {
            var me = that;

            var oView = that.getView();

            var oModel = that.getOwnerComponent().getModel();
            oModel.setHeaders({
                sbu: that._sbu
            });

            var oSHModel = that.getOwnerComponent().getModel("SearchHelps");
            oSHModel.setUseBatch(false);
            oSHModel.setHeaders({
                sbu: that._sbu,
                dispgrp: "STYINFO"
            });

            //get Attribute Types
            // var oJSONModel1 = new JSONModel();
            // oSHModel.read("/AttribTypeSet", {
            //     success: function (oData, oResponse) {
            //         oJSONModel1.setData(oData);
            //         oJSONModel1.setSizeLimit(9999);
            //         oView.setModel(oJSONModel1, "AttribTypeModel");
            //     },
            //     error: function (err) { }
            // });

            // //get Attribute Codes
            // var oJSONModel2 = new JSONModel();
            // oSHModel.read("/AttribCodeSet", {
            //     success: function (oData, oResponse) {
            //         oJSONModel2.setData(oData);
            //         oJSONModel2.setSizeLimit(9999);
            //         oView.setModel(oJSONModel2, "AttribCdModel");
            //     },
            //     error: function (err) { }
            // });

            //Usage Classes
            var oJSONModel3 = new JSONModel();
            oSHModel.read("/UsageClassSet", {
                success: function (oData, oResponse) {
                    oJSONModel3.setData(oData);
                    oView.setModel(oJSONModel3, "UsageClassModel");
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/UsageClassModel",oData);
                },
                error: function (err) { }
            });

            //get UoM
            // var oJSONModel4 = new JSONModel();
            // oSHModel.read("/UOMSet", {
            //     success: function (oData, oResponse) {
            //         oJSONModel4.setData(oData);
            //         oJSONModel4.setSizeLimit(9999);
            //         oView.setModel(oJSONModel4, "UOMModel");
            //         oView.setModel(oJSONModel4, "UOMGMCModel");
                   
            //     },
            //     error: function (err) { }
            // });

            //Process Codes
            // var oJSONModel5 = new JSONModel();
            // oSHModel.read("/ProcessCodeSet", {
            //     success: function (oData, oResponse) {
            //         oJSONModel5.setData(oData);
            //         oJSONModel5.setSizeLimit(9999);
            //         oView.setModel(oJSONModel5, "ProcessCodeModel");
            //     },
            //     error: function (err) { }
            // });

            //get Material Types
            var oJSONModel6 = new JSONModel();
            oSHModel.read("/MatTypeSet", {
                success: function (oData, oResponse) {
                    oJSONModel6.setData(oData);
                    oJSONModel6.setSizeLimit(9999);
                    oView.setModel(oJSONModel6, "MatTypeModel");
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/MatTypeModel",oData);
                },
                error: function (err) { }
            });

            //get GMC
            var oJSONModel7 = new JSONModel();
            oSHModel.read("/GMCSet", {
                success: function (oData, oResponse) {
                    oJSONModel7.setData(oData);
                    oJSONModel7.setSizeLimit(9999);
                    oView.setModel(oJSONModel7, "GMCModel");
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/GMCModel",oData);
                },
                error: function (err) { }
            });

            //get Styles
            var oJSONModel8 = new JSONModel();
            oSHModel.read("/StylesSet", {
                success: function (oData, oResponse) {
                    oJSONModel8.setData(oData);
                    oJSONModel8.setSizeLimit(9999);
                    oView.setModel(oJSONModel8, "StylesModel");
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/StylesModel",oData);
                },
                error: function (err) { }
            });

            //get Supply Types
            var oJSONModel9 = new JSONModel();
            oSHModel.read("/SupplyTypeSet", {
                success: function (oData, oResponse) {
                    oJSONModel9.setData(oData);
                    oJSONModel9.setSizeLimit(9999);
                    oView.setModel(oJSONModel9, "SupplyTypeModel");
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/SupplyTypeModel",oData);
                },
                error: function (err) { }
            });

            //get Vendors
            var oJSONModel10 = new JSONModel();
            oSHModel.read("/VendorSet", {
                success: function (oData, oResponse) {
                    oJSONModel10.setData(oData);
                    oJSONModel10.setSizeLimit(9999);
                    oView.setModel(oJSONModel10, "VendorModel");
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/VendorModel",oData);
                },
                error: function (err) { }
            });

            //get Currencies
            var oJSONModel11 = new JSONModel();
            oSHModel.read("/CurrencySet", {
                success: function (oData, oResponse) {
                    oJSONModel11.setData(oData);
                    oJSONModel11.setSizeLimit(9999);
                    oView.setModel(oJSONModel11, "CurrencyModel");
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/CurrencyModel",oData);
                },
                error: function (err) { }
            });

            //get Purchasing Groups
            var oJSONModel12 = new JSONModel();
            oSHModel.read("/PurGrpSet", {
                success: function (oData, oResponse) {
                    oJSONModel12.setData(oData);
                    oJSONModel12.setSizeLimit(9999);
                    oView.setModel(oJSONModel12, "PurchGroupModel");
                    // console.log(me.getView().getModel("PurchGroupModel"))
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/PurchGroupModel",oData);
                },
                error: function (err) { }
            });

            //get Purchasing Plants
            var oJSONModel13 = new JSONModel();
            oSHModel.read("/PurPlantSet", {
                success: function (oData, oResponse) {
                    oJSONModel13.setData(oData);
                    oJSONModel13.setSizeLimit(9999);
                    oView.setModel(oJSONModel13, "PurPlantModel");
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/PurPlantModel",oData);
                },
                error: function (err) { }
            });
        },

        //use this method in Version.controller.js if user decide to refresh the browser
        getReUseSearchHelps: function (that) {
            var oView = that.getView();

            var oModel = that.getOwnerComponent().getModel();
            var oSHModel = that.getOwnerComponent().getModel("SearchHelps");
            oSHModel.setUseBatch(false);
            oModel.setHeaders({
                sbu: that._sbu
            });

            oSHModel.setHeaders({
                sbu: that._sbu
            });

            //get Attributes
            var oJSONModel1 = new JSONModel();
            oSHModel.setHeaders({
                dispgrp: "STYINFO"
            });
            oSHModel.read("/AttribTypeSet", {
                success: function (oData, oResponse) {
                    oJSONModel1.setData(oData);
                    oJSONModel1.setSizeLimit(9999);
                    oView.setModel(oJSONModel1, "AttribTypeModel");
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/AttribTypeModel",oData);
                },
                error: function (err) { }
            });

           
            //get Attribute Codes
            var oJSONModel2 = new JSONModel();
            oSHModel.read("/AttribCode2Set", {
                success: function (oData, oResponse) {
                    oJSONModel2.setData(oData);
                    oJSONModel2.setSizeLimit(9999);
                    oView.setModel(oJSONModel2, "AttribCdModel");
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/AttribCdModel",oData);
                    
                },
                error: function (err) { }
            });

            //get UoM
            var oJSONModel7 = new JSONModel();
            oSHModel.read("/UOMSet", {
                success: function (oData, oResponse) {
                    oJSONModel7.setData(oData);
                    oJSONModel7.setSizeLimit(9999);
                    oView.setModel(oJSONModel7, "UOMModel");
                    oView.setModel(oJSONModel7, "UOMGMCModel");
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/UOMModel",oData);
                    that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/UOMGMCModel",oData);
                },
                error: function (err) { }
            });

             //Process Codes
             var oJSONModel3 = new JSONModel();
             oSHModel.read("/ProcessCodeSet", {
                 success: function (oData, oResponse) {
                     oJSONModel3.setData(oData);
                     oJSONModel3.setSizeLimit(9999);
                     oView.setModel(oJSONModel3, "ProcessCodeModel");
                     that.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/ProcessCodeModel",oData);
                 },
                 error: function (err) { }
             });
        },

        onExport: function (oEvent) {
            var oButton = oEvent.getSource();
            var tabName = oButton.data('TableName')
            var oTable = this.getView().byId(tabName);
            // var oExport = oTable.exportData();

            var aCols = [], aRows, oSettings, oSheet;
            var aParent, aChild;
            var fileName;

            var columns = oTable.getColumns();

            for (var i = 0; i < columns.length; i++) {
                aCols.push({
                    label: columns[i].mProperties.sortProperty, //change filterProperty to sortProperty
                    property: columns[i].mProperties.sortProperty, //change filterProperty to sortProperty
                    type: 'string'
                })
            }

            var property;

            if (tabName === 'bomDetailedTable') {
                property = '/results/items';
                aParent = oTable.getModel('DataModel').getProperty(property);

                aRows = [];

                for (var i = 0; i < aParent.length; i++) {
                    aRows.push(aParent[i]);
                    try {
                        for (var j = 0; j < aParent[i].items.length; j++) {
                            aChild = aParent[i].items[j];
                            aRows.push(aChild);

                            try {
                                for (var k = 0; k < aChild.items.length; k++) {
                                    aChild = aParent[i].items[j].items[k];
                                    aRows.push(aChild);
                                }
                            } catch(err) {}
                        }
                    } catch(err) {}
                }
                
            } else {
                property = '/results';
                aRows = oTable.getModel('DataModel').getProperty(property);
            }

            var date = new Date();
            fileName = tabName + " " + date.toLocaleDateString('en-us', { year: "numeric", month: "short", day: "numeric" });

            oSettings = {
                fileName: fileName,
                workbook: { columns: aCols },
                dataSource: aRows
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build()
                .then(function () {
                    MessageToast.show('Spreadsheet export has finished');
                })
                .finally(function () {
                    oSheet.destroy();
                });
        }

    };
});