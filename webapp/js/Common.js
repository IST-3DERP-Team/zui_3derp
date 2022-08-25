sap.ui.define([
	"sap/m/MessageToast",
    'sap/ui/export/Spreadsheet',
 ], function(MessageToast, Spreadsheet) {
	"use strict";

	return {

		onCancelNewStyle: function() {
			this._ConfirmNewDialog.close();
		},

        onCancelCopyStyles: function() {
			this._ConfirmCopyDialog.close();
		},

        onCancelCopyStyle: function() {
			this._CopyStyleDialog.close();
		},

        onCancelNewVersion: function() {
			this._NewVerionDialog.close();
		},

        onCancelUploadStyle: function() {
            this._UploadStylesDialog.close();
        },

        onCancelUploadFile: function() {
            this._UploadFileDialog.close();
        },

        onCancelDeleteFile: function() {
            this._ConfirmDeleteFileDialog.close();
        },   

        onCancelDeleteStyle: function() {
            this._ConfirmDeleteDialog.close();
        },        

        onCancelDeleteGeneralAttr: function() {
        	this._ConfirmDeleteGeneralAttr.close();
        },
        
        onCancelDeleteColor: function() {
        	this._ConfirmDeleteColor.close();
        },
        
        onCancelDeleteProcess: function() {
        	this._ConfirmDeleteProcess.close();
        },

        onCancelDeleteVersion: function() {
            this._ConfirmDeleteVersionDialog.close();
        },        

        onCancelDiscardChanges: function() {
            this._ConfirmDiscardChangesDialog.close();
        },

        onCancelDeleteVersionAttr: function() {
            this._ConfirmDeleteVersionAttr.close();            
        },

        onCancelDeleteBOMItems: function() {
            this._ConfirmDeleteBOMDialog.close();
        },

        openLoadingDialog: function(doc) {
			if (!doc._LoadingDialog) {
				doc._LoadingDialog = sap.ui.xmlfragment("zui3derp.view.fragments.dialog.LoadingDialog", doc);
				doc.getView().addDependent(doc._LoadingDialog);
			}
			jQuery.sap.syncStyleClass("sapUiSizeCompact", doc.getView(), doc._LoadingDialog);
			doc._LoadingDialog.open();
		},

		closeLoadingDialog: function(doc) {
			doc._LoadingDialog.close();
		},

        // onExportExcel: function (oEvent) {
        //     var oButton = oEvent.getSource();
        //     var tabName = oButton.data('TableName')
        //     var oTable = this.getView().byId(tabName);
        //     var oExport = oTable.exportData();
        //     oExport.mAggregations.columns.shift();
        //     // var sModel = oTable.data();
        //     // if (sModel) {
        //     //     var aExpCol = oExport.getColumns();
        //         // var aCol = oTable.getColumns();
        //         // aCol.forEach(function (oColumn, i) {
        //         //     var oCell = new sap.ui.core.util.ExportCell();
        //         //     console.log(oCell.getMetadata());
        //         //     if (oColumn.data("ctype") === "DatePicker") {
        //         //         oCell.bindProperty("content", { path: sModel + ">" + oColumn.getSortProperty(), formatter: formatter.getDateFormat });
        //         //         aExpCol[i].setTemplate(oCell);
        //         //     } else if (oColumn.data("ctype") === "TimePicker") {
        //         //         oCell.bindProperty("content", { path: sModel + ">" + oColumn.getSortProperty(), formatter: formatter.getTimeFormat });
        //         //         aExpCol[i].setTemplate(oCell);
        //         //     }
        //         // });
        //     // }
        //     var date = new Date();

        //     oExport.saveFile(tabName + " " + date.toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"}));
        // },

        // onExport: function(oEvent) {
        //     var oButton = oEvent.getSource();
        //     var tabName = oButton.data('TableName')
        //     var oTable = this.getView().byId(tabName);
        //     // var oExport = oTable.exportData();

		// 	var aCols = [], aRows, oSettings, oSheet;

        //     // aCols = [
		// 	// 	{
		// 	// 		label: 'User ID',
		// 	// 		property: 'STYLENO',
		// 	// 		type: 'number',
		// 	// 		scale: 0
		// 	// 	},
		// 	// 	{
		// 	// 		label: 'Firstname',
		// 	// 		property: 'Firstname',
		// 	// 		width: '25'
		// 	// 	},
		// 	// 	{
		// 	// 		label: 'Lastname',
		// 	// 		property: 'Lastname',
		// 	// 		width: '25'
		// 	// 	},
		// 	// 	{
		// 	// 		label: 'Salary',
		// 	// 		property: 'Salary',
		// 	// 		type: 'currency',
		// 	// 		unitProperty: 'Currency',
		// 	// 		width: '18'
		// 	// 	},
		// 	// 	{
		// 	// 		label: 'Active',
		// 	// 		property: 'Active',
		// 	// 		type: 'string'
		// 	// 	}];
		// 	// aCols = this.createColumnConfig();
		// 	// aProducts = this.getView().getModel().getProperty('/');
        //     var columns = oTable.getColumns();

        //     for (var i = 0; i < columns.length; i++) {
        //         aCols.push({
        //             label: columns[i].mProperties.filterProperty,
		// 			property: columns[i].mProperties.filterProperty,
		// 			type: 'string'
        //         })
        //     }

        //     var property;

        //     if(tabName === 'bomGMCTable' || tabName === 'bomDetailedTable') {
        //         property = '/results/items';
        //     } else {
        //         property = '/results';
        //     }

        //     aRows = oTable.getModel('DataModel').getProperty(property);

		// 	oSettings = {
		// 		workbook: { columns: aCols },
		// 		dataSource: aRows
		// 	};

		// 	oSheet = new Spreadsheet(oSettings);
		// 	oSheet.build()
		// 		.then( function() {
		// 			MessageToast.show('Spreadsheet export has finished');
		// 		})
		// 		.finally(function() {
		// 			oSheet.destroy();
		// 		});
		// },

        pad: function (num, size) {
            try {
                num = num.toString();
                while (num.length < size) num = "0" + num;
                return num;
            } catch(err) {}
        },

        showMessage: function(oMessage) {
			MessageToast.show(oMessage, {
				duration: 3000,
				animationDuration: 500
			});
		}
	};
});