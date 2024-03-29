sap.ui.define([
	"sap/m/MessageToast",
    'sap/ui/export/Spreadsheet',
 ], function(MessageToast, Spreadsheet) {
	"use strict";

	return {
        
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
		},

		openProcessingDialog(doc, msg) {
            if (!doc._ProcessingDialog) {
                doc._ProcessingDialog = sap.ui.xmlfragment("zui3derp.view.fragments.dialog.ProcessingDialog", doc);
                doc.getView().addDependent(doc._ProcessingDialog);
            }
            jQuery.sap.syncStyleClass("sapUiSizeCompact", doc.getView(), doc._ProcessingDialog);
            
            doc._ProcessingDialog.setTitle(msg === undefined ? "Processing..." : msg);
            doc._ProcessingDialog.open();
        },

        closeProcessingDialog(doc) {
            doc._ProcessingDialog.close();
        },
	};
});