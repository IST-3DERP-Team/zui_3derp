sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../js/Common",
    "sap/ui/model/json/JSONModel",
    "sap/ui/export/Spreadsheet",
    "../control/DynamicTable",
    "../libs/jszip",
	"../libs/xlsx"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Common, JSONModel, Spreadsheet, control, jszip, xlsx, ) {
        "use strict";

        var that;

        return Controller.extend("zui3derp.controller.UploadStyle", {

            onInit: function() {
                that = this;

                this.localModel = new sap.ui.model.json.JSONModel();
                this.getView().setModel(this.localModel, "localModel");

                var oComponent = this.getOwnerComponent();
                this._router = oComponent.getRouter();
                this._router.getRoute("RouteUploadStyle").attachPatternMatched(this._routePatternMatched, this);
            },

            _routePatternMatched: function (oEvent) {
                this._sbu = oEvent.getParameter("arguments").sbu;

                this.setChangeStatus(false);

                this.getMapId();

                var oFileUploader = this.getView().byId('FileUploaderId');
                oFileUploader.setVisible(false);
                
                var oSaveButton = this.getView().byId('SaveButton');
                oSaveButton.setEnabled(false);
            },

            setChangeStatus: function(changed) {
                // sap.ushell.Container.setDirtyFlag(changed);
            },

            getMapId: function() {
                var oModel = this.getOwnerComponent().getModel('SearchHelps');
                var oMapIdCB = this.getView().byId('MapIdCB');
                oModel.setHeaders({
                    sbu: this._sbu
                });
                oModel.read("/MapidSet", {
                    success: function (oData, oResponse) {
                        var oJSONModel = new JSONModel();
                        oJSONModel.setData(oData);
                        oMapIdCB.setModel(oJSONModel, "MapIdData");
                    },
                    error: function (err) { 
                        // Common.closeLoadingDialog(that);
                    }
                });
            },

            onSelectMapId: function() {
                var oFileUploader = this.getView().byId('FileUploaderId');
                oFileUploader.setVisible(true);
            },
    
            onUpload: function(e) {
                this._import(e.getParameter("files") && e.getParameter("files")[0]);
            },
    
            _import: function(file) {
                var that = this;

                var me = this;
                var columnData = [];
                var oModel = this.getOwnerComponent().getModel();
                var oTable = this.getView().byId("UploadTable");
                var oMapIdCB = this.getView().byId('MapIdCB');
                var template = oMapIdCB.getSelectedKey();

                var rowData = {
                    items: []
                };

                var excelData = {};
                if (file && window.FileReader) {
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        var data = e.target.result;
                        var workbook = XLSX.read(data, {
                            type: 'binary'
                        });
                        var sheetName = workbook.SheetNames[0];
                        // workbook.SheetNames.forEach(function(sheetName) {
                            // Here is your object for every sheet in workbook
                            // excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName], {range:2});
                            excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName], {range:1});
                        // });
                        
                        var sheet = workbook.Sheets[sheetName];
                        
                        // var eData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { blankRows: false });
                        // var SheetNames = workbook.SheetNames;
                        
                        // var d = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {raw: true})
                        
                        // var columnHeaders = [];
                        // // for (var sheetIndex = 0; sheetIndex < SheetNames.length; sheetIndex++) {
                        //     var worksheet = workbook.Sheets[sheetName];
                        //     for (var key in worksheet) {
                        //         var regEx = new RegExp("^\(\\w\)\(1\){1}$");
                        //         if (regEx.test(key) === true) {
                        //             columnHeaders.push(worksheet[key].v);
                        //         }
                        //     }
                        // // }
                        
                        var headers = [];
                        var range = XLSX.utils.decode_range(sheet['!ref']);
                        var C, R = 1;
                        // for(C = range.s.c; C <= range.e.c; ++C) {
                        //     var hdr = "COLUMN" + ( C + 1 ); 
                        //     headers.push(hdr);
                        // }
                        
                        for(C = range.s.c; C <= range.e.c; ++C) {
                            var cell = sheet[XLSX.utils.encode_cell({c:C, r:R})];
                    
                            var hdr = "UNKNOWN " + C; // <-- replace with your desired default 
                            if(cell && cell.t) hdr = XLSX.utils.format_cell(cell);
                    
                            headers.push(hdr);
                        }

                        oModel.setHeaders({
                            sbu: that._sbu,
                            mapid: template,
                            module: 'STYLEBOM'
                        });
        
                        // Common.openLoadingDialog(that);
        
                        oModel.read("/UploadTemplateSet", {
                            success: function (oData, oResponse) {
                                oData.results.forEach((column) => {
                                    columnData.push({
                                        "Columnname": column.Columnname,
                                        "Desc1": column.Desc1,
                                        "Seqno": column.Seqno
                                    })
                                })

                                var idx;
                                
                                var items = [];
                                var rowData = [];
                                var seqno;
                                
                                for (var i = 0; i < excelData.length; i++) {
                                    var data = { };
                                    for (var j = 0; j < headers.length; j++) {
                                        idx = j + 1;
                                        seqno = me.pad(idx, 3);
                                        
                                        var item = oData.results.find((result) => result.Seqno === seqno);
                                        if(item !== undefined) {
                                            data[item.Columnname] = excelData[i][headers[j]];
                                        }
                                    }
                                    rowData.push(data);
                                }
        
                                var oJSONModel = new JSONModel();
                                oJSONModel.setData({
                                    results: rowData,
                                    columns: columnData
                                });
        
                                oTable.setModel(oJSONModel, "DataModel");
        
                                oTable.bindColumns("DataModel>/columns", function (sId, oContext) {
                                    var column = oContext.getObject();
                                    return new sap.ui.table.Column({
                                        label: column.Columnname,
                                        template: new sap.m.Text({ text: "{DataModel>" + column.Columnname + "}" }),
                                        sortProperty: column.Columnname,
                                        filterProperty: column.Columnname,
                                        width: "8rem"
                                    });
                                });
        
                                oTable.bindRows("DataModel>/results");

                                var oSaveButton = me.getView().byId('SaveButton');
                                oSaveButton.setEnabled(true);

                                me.setChangeStatus(true);
                            },
                            error: function (err) { 
                                // Common.closeLoadingDialog(that);
                            }
                        });
                        
                        // var results = [
                        //     {
                        //         "Columnname": "PARTNO",
                        //         "Seqno": 3
                        //     },
                        //     {
                        //         "Columnname": "PARTS",
                        //         "Seqno": 4
                        //     },
                        //     {
                        //         "Columnname": "PRODUCT",
                        //         "Seqno": 5
                        //     }
                        // ];
                        
                        // var idx;
                        // var data = { };
                        // var items = [];
                        
                        // for (var i = 0; i < excelData.length; i++) {
                        //     for (var j = 0; j < headers.length; j++) {
                        //         idx = j + 1;
                                
                        //         var item = results.find((result) => result.Seqno === idx);
                        //         if(item !== undefined) {
                        //             data[item.Columnname] = excelData[0][headers[j]];
                        //         }
                        //     }
                        //     items.push(data);
                        // }
                        
                        // Object.keys(excelData[0])[0]
                        // Object.values(excelData[0])[0]
                        
                        // Setting the data to the local model 
                        // that.localModel.setData({
                        //     items: excelData
                        // });
                        // that.localModel.refresh(true);
                    };
                    reader.onerror = function(ex) {
                        console.log(ex);
                    };
                    reader.readAsBinaryString(file);
                }
            },

            onSaveUploadStyle: function() {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("UploadTable").getModel("DataModel");
                var path;

                var oMsgStrip = this.getView().byId('UploadMessageStrip');
                oMsgStrip.setVisible(false);

                // if (!this._versionAttrChanged) {
                //     Common.showMessage('No changes made');
                // } else {

                    var oData = oTableModel.getData();
                    var oEntry = {
                        sbu: this._sbu
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

                    path = "/StyleUploadSet";

                    oModel.create(path, oEntry, {
                        method: "POST",
                        success: function (oData, oResponse) {
                            Common.showMessage("Saved");
                            Common.closeLoadingDialog(that);
                            me.setChangeStatus(false);
                        },
                        error: function (err) {
                            Common.showMessage("Error");
                            Common.closeLoadingDialog(that);
                            var errorMsg = JSON.parse(err.responseText).error.message.value;
                            oMsgStrip.setVisible(true);
                            oMsgStrip.setText(errorMsg);
                        }
                    });

                // }
            },

            pad: Common.pad
            
        });

    });
