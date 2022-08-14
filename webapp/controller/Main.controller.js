sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/library",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("zui3derp.controller.Main", {
            
        onInit: function(){
            this.onStyleReader();
            // var oComponent = this.getOwnerComponent();
            // this._router = oComponent.getRouter();
            // this._router.getRoute("RouteMain").attachPatternMatched(this._routePatternMatched, this);
        },

        // _routePatternMatched: function (oEvent) {
        //     sap.ushell.Container.setDirtyFlag(false);
        // },

        goToStyles: function() {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteStyles");
            // oRouter.navTo("RouteStyleDetail", {
            //     styleno: "1"
            // } );
        },

        onStyleReader: function(){
                var oModel = this.getOwnerComponent().getModel();
                var oForecast = this.getView().byId("forecastNumber");
                var oOrder = this.getView().byId("orderNumber");
                var oShipped = this.getView().byId("shippedNumber");
                
                oModel.read("/StyleStatsSet",{
                    success:function(oData){
                        oForecast.setText(String(oData.results[0].FORECAST));
                        oOrder.setText(String(oData.results[0].ORDER));
                        oShipped.setText(String(oData.results[0].SHIPPED));
                    },
                    error: function(err){}
                });

                // var me = this;
                // var oModel = this.getOwnerComponent().getModel();
                // var entitySet = "/StyleStatsSet('')";
                // var oJSONObject = new sap.ui.model.json.JSONModel();
                // var oJSONObject2 = new sap.ui.model.json.JSONModel();
                // var oJSONObject3 = new sap.ui.model.json.JSONModel();
                // var oForecast = this.getView().byId("forecastNumber");
                // var oOrder = this.getView().byId("orderNumber");
                // var oShipped = this.getView().byId("shippedNumber");

                // oModel.read(entitySet,{
                //     success:function(oData){
                //         oJSONObject.setData(oData)
                //         oForecast.setText(String(oData.Forecast));
                //     },

                //     error: function(err){}
                // });

                // oModel.read(entitySet,{
                //     success:function(oData){
                //         oJSONObject.setData(oData)
                //         oOrder.setText(String(oData.Order));
                //     },

                //     error: function(err){}
                // });

                // oModel.read(entitySet,{
                //     success:function(oData){
                //         oJSONObject.setData(oData)
                //         oShipped.setText(String(oData.Shipped));
                //     },

                //     error: function(err){}
                // });
            }
        })
    });
