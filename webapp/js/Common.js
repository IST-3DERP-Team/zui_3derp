sap.ui.define([
	"sap/m/MessageToast" ], function(MessageToast) {
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

        showMessage: function(oMessage) {
			MessageToast.show(oMessage, {
				duration: 2000,
				animationDuration: 500
			});
		}
	};
});