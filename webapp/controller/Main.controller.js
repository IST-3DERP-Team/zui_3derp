sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("zui3derp.controller.Main", {
            model: new sap.ui.model.json.JSONModel(),
            data: {
                selectedKey: 'root1',
                navigation: [{
                    title: 'Home',
                    icon: 'sap-icon://building',
                    key: 'root1'
                }, {
                    title: 'Manage Styles',
                    icon: 'sap-icon://building',
                    key: 'root2'
                }
                ],
                fixedNavigation: [{
                    title: 'Fixed Item 1',
                    icon: 'sap-icon://employee'
                }]
            },
            onInit: function () {
                this.model.setData(this.data);
                this.getView().setModel(this.model);
            },

            onItemSelect: function (oEvent) {
                var item = oEvent.getParameter('item');
                var viewId = this.getView().getId();
                sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--" + item.getKey());
            },


            onSideNavButtonPress: function () {
                // var viewId = this.getView().getId();
                var toolPage = this.byId("toolPage");
                var sideExpanded = toolPage.getSideExpanded();
                toolPage.setSideExpanded(!toolPage.getSideExpanded());
            }
        });
    });
