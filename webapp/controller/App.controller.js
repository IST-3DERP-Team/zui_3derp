sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel"
    ],
    function(BaseController, JSONModel) {
      "use strict";
  
      return BaseController.extend("zui3derp.controller.controller.App", {
        onInit: function () {
            var oModel = new JSONModel({
                "selectedKey": "RouteMain",
                "navigation": [
                    {
                        "title": "Home",
                        "icon": "sap-icon://home",
                        "key": "RouteMain"
                    },
                    {
                        "title": "Manage Styles",
                        "icon": "sap-icon://puzzle",
                        "key": "RouteStyles"
                    }
                ],
                "fixedNavigation": [
                    {
                        "title": "Settings",
                        "icon": "sap-icon://employee"
                    }
                ]
            }, false);

            var oView = this.getView();
            oView.setModel(oModel); 
        },

        onAfterRendering: function() {
            this.onSideNavButtonPress();
            this.navigatePage('RouteMain');
        },

        navigatePage: function(oRouteName) {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo(oRouteName);

            // oRouter.navTo("RouteStyleDetail", {
            //     styleno: "1000000031",
            //     sbu: "VER"
            // } );
        
            // oRouter.navTo("RouteVersion", {
            //     styleno: "1000000031",
            //     sbu: "VER",
            //     version: 1
            // } );
        },

        onItemSelect: function (oEvent) {
            var item = oEvent.getParameter('item');
            this.navigatePage(item.getKey());
        },

        onSideNavButtonPress: function () {
            // var viewId = this.getView().getId();
            var toolPage = this.byId("toolPage");
            toolPage.setSideExpanded(!toolPage.getSideExpanded());
        }
      });
    }
  );
  