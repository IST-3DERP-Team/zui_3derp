sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
    "../js/Common",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../js/Constants",
    "sap/m/MessageBox",
    "../js/TableValueHelp",
    'sap/m/SearchField',
    'sap/ui/model/type/String',
    "sap/ui/model/FilterOperator",
    "sap/m/Token",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, Common, JSONModel, History, Constants, MessageBox,TableValueHelp, SearchField, typeString, FilterOperator, Token) {
        "use strict";

        var that;
        var _startUpInfo = {};
        var _promiseResult;
        var _oCaption = {};

        return Controller.extend("zui3derp.controller.AssignMaterial", {
            onInit: function () {
                that = this;

                //Initialize Router
                var oComponent = this.getOwnerComponent();
                this._router = oComponent.getRouter();
                this._router.getRoute("RouteAssignMaterial").attachPatternMatched(this._routePatternMatched, this);

                //Initialize Translations
                this._i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },

            _routePatternMatched: async function (oEvent) {
                this._sbu = oEvent.getParameter("arguments").sbu; //get SBU route parameter
                this._styleNo = oEvent.getParameter("arguments").styleno; //get Style No route parameter
                this._version = oEvent.getParameter("arguments").version; //get version route parameter
                this._aColumns = {};
                this._colFilters = {};

                _promiseResult = new Promise((resolve, reject) => {
                    resolve(that.getCaptionMsgs());
                });
                await _promiseResult;
                
                //set change false as initial
                //this._materialListChanged = false;
                this.setChangeStatus(false);

                if (sap.ushell.Container) {
                    var oModelStartUp= new sap.ui.model.json.JSONModel();
                    oModelStartUp.loadData("/sap/bc/ui2/start_up").then(() => {
                        _startUpInfo = oModelStartUp.oData;
                    });
                }
                else {
                    _startUpInfo.id = "BAS_CONN";
                }

                //get data
                this.getMaterialList();
                this.getMaterials();
                //this.getRoleAuth();

                this.getOwnerComponent().getModel("UI_MODEL").setProperty("/fromScreen", "ASSIGNMAT");
            },

            setChangeStatus: function (changed) {
                //set change flag
                try {
                    sap.ushell.Container.setDirtyFlag(changed);
                } catch (err) { }
            },

            //******************************************* */
            // Material List
            //******************************************* */

            getMaterialList: function () {
                //select Material List
                var me = this;

                var oTable = this.getView().byId("generalTable");
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new JSONModel();
                var oTable = this.getView().byId("materialListTable");

                Common.openLoadingDialog(that);

                var entitySet = "/StyleMaterialListSet"

                oModel.setHeaders({
                    styleno: this._styleNo,
                    verno: this._version
                });
                oModel.read(entitySet, {
                    // urlParameters: {
                    //     "$filter": "Matno eq ''"
                    // },
                    success: function (oData, oResponse) {
                        // console.log('StyleMaterialListSet',oData);
                        //selected records in Material List
                        var selectedMat =  that.getOwnerComponent().getModel("MATLIST_MODEL").getData().items;
                        // Extract SEQNO from selectedMat
                        const seqNoToFilter = selectedMat.map(item => item.SEQNO);
                         
                        var result = oData.results;
                        that.getView().setModel(new JSONModel({ results: result.filter(a => a.MATNO !== "") }), "AssignMaterialListsModel");
                        
                        if(selectedMat.length > 0){
                            //filtered records based on selected records in Material List
                            result = result.filter(a => seqNoToFilter.includes(a.SEQNO));
                        }
                        else
                            result = result.filter(a => a.MATNO === "" && a.MATDESC1 !== "");

                        oData.results = result;
                        oJSONModel.setData(oData);
                        oTable.setModel(oJSONModel, "DataModel");
                        //oTable.setVisibleRowCount(oData.results.length);
                        //oTable.attachPaste();
                        me.getRoleAuth();
                        Common.closeLoadingDialog(that);
                        me.setChangeStatus(false);
                    },
                    error: function () {
                        Common.closeLoadingDialog(that);
                    }
                })
            },

            getMaterials: function () {
                //get Materials for value help
                var oView = this.getView();
                var oSHModel = this.getOwnerComponent().getModel("SearchHelps");
                var oJSONModel = new JSONModel();

                Common.openLoadingDialog(that);

                var entitySet = "/MaterialNoSet"

                oSHModel.read(entitySet, {
                    success: function (oData, oResponse) {
                        oJSONModel.setData(oData);
                        oView.setModel(oJSONModel, "MaterialsModel");
                        Common.closeLoadingDialog(that);
                    },
                    error: function () {
                        Common.closeLoadingDialog(that);
                    }
                })
            },

            //******************************************* */
            // Assign Automatic
            //******************************************* */

            onAssignAutomatic: function () {
                //Assign automatic clicked
                var me = this;

                //get selected items for automatic assignment
                var oModel = this.getOwnerComponent().getModel();
                var oTable = this.getView().byId("materialListTable");
                var oTableModel = oTable.getModel("DataModel");
                var oData = oTableModel.getData();
                var oSelected = this.getView().byId("materialListTable").getSelectedIndices();
                var oJSONModel = new JSONModel();

                if (oSelected.length > 0) {
                    var oEntry = {
                        Styleno: this._styleNo,
                        Sbu: this._sbu,
                        Mode: "ASSIGN",
                        MatListToItems: []
                    }

                    //build header and payload for selected items
                    for (var i = 0; i < oSelected.length; i++) {
                        var index = oSelected[i];
                        var item = {
                            "STYLENO": this._styleNo,
                            "VERNO": oData.results[index].VERNO,
                            "SEQNO": oData.results[index].SEQNO,
                            "MATNO": oData.results[index].MATNO,
                            "MATTYP": oData.results[index].MATTYP,
                            "GMC": oData.results[index].GMC,
                            "BOMMATID": oData.results[index].BOMMATID,
                            "MATCONSUMP": oData.results[index].MATCONSUMP,
                            "WASTAGE": oData.results[index].WASTAGE,
                            "COMCONSUMP": oData.results[index].COMCONSUMP,
                            "CONSUMP": oData.results[index].CONSUMP,
                            "UOM": oData.results[index].UOM,
                            "SUPPLYTYP": oData.results[index].SUPPLYTYP,
                            "VENDORCD": oData.results[index].VENDORCD,
                            "CURRENCYCD": oData.results[index].CURRENCYCD,
                            "UNITPRICE": oData.results[index].UNITPRICE,
                            "PURGRP": oData.results[index].PURGRP,
                            "PURPLANT": oData.results[index].PURPLANT,
                            "MATDESC1": oData.results[index].MATDESC1,
                            "MATDESC2": oData.results[index].MATDESC2,
                            "CREATEDBY": oData.results[index].CREATEDBY,
                            "CREATEDDT": oData.results[index].CREATEDDT,
                            "CREATEDTM": oData.results[index].CREATEDTM,
                        }
                        oEntry.MatListToItems.push(item);
                    };
                    Common.openLoadingDialog(that);

                    var path = "/MaterialListSet";

                    oModel.setHeaders({
                        sbu: this._sbu
                    });
                    //call create deep method to assign materials for selected items
                    oModel.create(path, oEntry, {
                        method: "POST",
                        success: function (oDataReturn, oResponse) {
                            console.log(oDataReturn)
                            //assign the materials based on the return
                            var oReturnItems = oDataReturn.MatListToItems.results;
                            var bAssigned = false;

                            for (var i = 0; i < oData.results.length; i++) {
                                var seqno = oData.results[i].SEQNO;
                                var item = oReturnItems.find((result) => result.SEQNO === seqno);
                                if (item !== undefined) {
                                    try {
                                        if (item.MATNO !== "") {
                                            oData.results[i].MATNO = item.MATNO;
                                            bAssigned = true;
                                        }
                                    } catch (err) { }
                                }
                            }

                            if (bAssigned) {
                                oJSONModel.setData(oData);
                                oTable.setModel(oJSONModel, "DataModel");
                                me.onMaterialListChange();
                                me.onSaveMaterialList();
                                // MessageBox.information(me._i18n.getText('t4'));
                                // Common.showMessage(me._i18n.getText('t4'));
                            }
                            else {
                                MessageBox.information(_oCaption.INFO_NO_MATCHING_MATNO);//No matching material no. found.
                            }

                            Common.closeLoadingDialog(me);
                        },
                        error: function (err) {
                            Common.closeLoadingDialog(that);
                            // Common.showMessage(me._i18n.getText('t5'));
                            MessageBox.information(_oCaption.INFO_ERROR);
                        }
                    });
                } else {
                    // Common.showMessage(this._i18n.getText('t10'));
                    MessageBox.information(_oCaption.INFO_NO_RECORD_SELECT);
                }
            },

            //******************************************* */
            // Create Material
            //******************************************* */

            onCreateMaterial: function () {
                //create material clicked
                var me = this;

                //get selected items for material creation
                var oModel = this.getOwnerComponent().getModel();
                var oTable = this.getView().byId("materialListTable");
                var oTableModel = oTable.getModel("DataModel");
                var oData = oTableModel.getData();
                var oSelected = this.getView().byId("materialListTable").getSelectedIndices();
                var oJSONModel = new JSONModel();

                var oMsgStrip = this.getView().byId('AssignMaterialMessageStrip');
                oMsgStrip.setVisible(false);

                if (oSelected.length > 0) {

                    //build headers and payload
                    var oEntry = {
                        Styleno: this._styleNo,
                        Sbu: this._sbu,
                        Mode: "CREATE",
                        MatListToItems: []
                    }
                    var role =  this.getView().getModel("RoleAuthModel").getData();
                    const roleObjcd = role.map(item => item.Objcd);
                   
                    //return;
                    for (var i = 0; i < oSelected.length; i++) {
                        var index = oSelected[i];
                        //filter items with authorization based on mattypgrp
                        const exists = roleObjcd.includes(this._sbu + oData.results[index].MATTYPGRP);
                        if(exists){
                            var item = {
                                "STYLENO": this._styleNo,
                                "VERNO": oData.results[index].VERNO,
                                "SEQNO": oData.results[index].SEQNO,
                                "MATNO": oData.results[index].MATNO,
                                "MATTYP": oData.results[index].MATTYP,
                                "GMC": oData.results[index].GMC,
                                "BOMMATID": oData.results[index].BOMMATID,
                                "MATCONSUMP": oData.results[index].MATCONSUMP,
                                "WASTAGE": oData.results[index].WASTAGE,
                                "COMCONSUMP": oData.results[index].COMCONSUMP,
                                "CONSUMP": oData.results[index].CONSUMP,
                                "UOM": oData.results[index].UOM,
                                "SUPPLYTYP": oData.results[index].SUPPLYTYP,
                                "VENDORCD": oData.results[index].VENDORCD,
                                "CURRENCYCD": oData.results[index].CURRENCYCD,
                                "UNITPRICE": oData.results[index].UNITPRICE,
                                "PURGRP": oData.results[index].PURGRP,
                                "PURPLANT": oData.results[index].PURPLANT,
                                "MATDESC1": oData.results[index].MATDESC1,
                                "MATDESC2": oData.results[index].MATDESC2,
                                "DELETED": " ",
                                "CREATEDBY": oData.results[index].CREATEDBY,
                                "CREATEDDT": oData.results[index].CREATEDDT,
                                "CREATEDTM": oData.results[index].CREATEDTM,
                                "UPDATEDBY": " ",
                                "UPDATEDDT": " "
                            }
                            oEntry.MatListToItems.push(item);
                        }
                    };
                    Common.openLoadingDialog(that);

                    var path = "/MaterialListSet";

                    oModel.setHeaders({
                        sbu: this._sbu
                    });
                    console.log(JSON.stringify(oEntry));
                    //call create deep method for Create Material  
                    oModel.create(path, oEntry, {
                        method: "POST",
                        success: function (oDataReturn, oResponse) {
                            //assign the created materials
                            var oReturnItems = oDataReturn.MatListToItems.results;
                            for (var i = 0; i < oData.results.length; i++) {
                                var seqno = oData.results[i].SEQNO;
                                var item = oReturnItems.find((result) => result.SEQNO === seqno);
                                if (item !== undefined) {
                                    try {
                                        if (item.MATNO !== "") {
                                            oData.results[i].MATNO = item.MATNO;
                                        }
                                    } catch (err) { }
                                }
                            }
                            oJSONModel.setData(oData);
                            oTable.setModel(oJSONModel, "DataModel");
                            Common.closeLoadingDialog(that);
                            me.onMaterialListChange();
                            me.onSaveMaterialList();
                        },
                        error: function (err) {
                            Common.closeLoadingDialog(that);
                            var errorMsg = JSON.parse(err.responseText).error.message.value;
                            // oMsgStrip.setVisible(true);
                            // oMsgStrip.setText(errorMsg);
                            // Common.showMessage(me._i18n.getText('t5'));
                            MessageBox.information(_oCaption.INFO_ERROR+ ": " + errorMsg);
                        }
                    });

                } else {
                    // Common.showMessage(this._i18n.getText('t10'));
                    MessageBox.information(_oCaption.INFO_NO_RECORD_SELECT);
                }
            },

            onMaterialListChange: function (oEvent) {
                //material list change flag
                this._materialListChanged = true;
                this.setChangeStatus(true);

                if (oEvent !== undefined){
                    var oSource;
                    if(this.inputSource !== undefined)
                        oSource = this.inputSource; 
                    else
                        oSource = oEvent.getSource();

                    if (oSource.getBindingInfo("value") !== undefined) {
                        var sRowPath = oSource.oParent.getBindingContext("DataModel").sPath;
                        var vColPath = oSource.getBindingInfo("value").parts[0].path;
                        var oSelectedItem = oEvent.getParameter("selectedItem");
                        var matDesc1 = "";
                        if(oSelectedItem !== undefined){
                            matDesc1 =  oSelectedItem.getInfo();
                        }
                        else
                        {
                            var matListModel =  this.getView().getModel("MaterialsModel").getData();
                            var matFiltered = matListModel.results.filter(item=> item.MatNo === oEvent.getParameter("value"));
                            if(matFiltered.length >0)
                                matDesc1 = matFiltered[0].DescEn;
                            console.log(matDesc1);
                        }

                        if(vColPath ==="MATNO"){
                            if(matDesc1.length > 0)
                                this.byId("materialListTable").getModel("DataModel").setProperty(sRowPath + "/MATDESC1", matDesc1);
                        }
                    }
                }
            },

            onSaveMaterialList: function () {
                //save clicked
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oTableModel = this.getView().byId("materialListTable").getModel("DataModel");
                var path;

                if (!this._materialListChanged) {
                    // Common.showMessage(this._i18n.getText('t7'));
                    MessageBox.information(_oCaption.WARN_NO_DATA_MODIFIED);
                } else {
                    //build header and payload
                    var oData = oTableModel.getData();
                    var oEntry = {
                        Styleno: this._styleNo,
                        Sbu: this._sbu,
                        Mode: "",
                        MatListToItems: []
                    }
                    for (var i = 0; i < oData.results.length; i++) {
                        var item = {
                            "STYLENO": this._styleNo,
                            "VERNO": oData.results[i].VERNO,
                            "SEQNO": oData.results[i].SEQNO,
                            "MATNO": oData.results[i].MATNO,
                            "MATTYP": oData.results[i].MATTYP,
                            "GMC": oData.results[i].GMC,
                            "BOMMATID": oData.results[i].BOMMATID,
                            "MATCONSUMP": oData.results[i].MATCONSUMP,
                            "WASTAGE": oData.results[i].WASTAGE,
                            "COMCONSUMP": oData.results[i].COMCONSUMP,
                            "CONSUMP": oData.results[i].CONSUMP,
                            "UOM": oData.results[i].UOM,
                            "SUPPLYTYP": oData.results[i].SUPPLYTYP,
                            "VENDORCD": oData.results[i].VENDORCD,
                            "CURRENCYCD": oData.results[i].CURRENCYCD,
                            "UNITPRICE": oData.results[i].UNITPRICE,
                            "PURGRP": oData.results[i].PURGRP,
                            "PURPLANT": oData.results[i].PURPLANT,
                            "MATDESC1": oData.results[i].MATDESC1,
                            "MATDESC2": oData.results[i].MATDESC2,
                            "CREATEDBY": oData.results[i].CREATEDBY,
                            "CREATEDDT": oData.results[i].CREATEDDT,
                            "CREATEDTM": oData.results[i].CREATEDTM,
                        }
                        oEntry.MatListToItems.push(item);
                    };
                    var materialsAssgndMatno = that.getView().getModel("AssignMaterialListsModel").getData();
                    var joinMaterialList = materialsAssgndMatno.results.concat(oEntry.MatListToItems)
                    console.log(joinMaterialList);
                    const uniqueArray = Array.from(new Set(joinMaterialList.map(item => item.SEQNO))).map(SEQNO => joinMaterialList.find(item => item.SEQNO === SEQNO));


                    const matnoSet = {}; // Use an object to keep track of encountered MATNOs
                    const duplicateMatnos = [];

                    uniqueArray.forEach((item) => {
                        const matno = item.MATNO;

                        if (matno === "") {
                            return; // Skip empty MATNO values
                        }

                        if (matnoSet[matno]) {
                            duplicateMatnos.push(matno); // Found a duplicate, add it to the array
                        } else {
                            matnoSet[matno] = true; // Mark this MATNO as encountered
                        }
                    });
                    console.log("Duplicate MATNO values:", duplicateMatnos);
                    if(duplicateMatnos.length > 0){
                        MessageBox.information("Duplicate material number found: " + duplicateMatnos)
                        return;
                    }
                   

                    MessageBox.confirm(this._i18n.getText('ConfirmSave'), {
                        actions: ["Yes", "No"],
                        onClose: function (sAction) {
                            if (sAction === "Yes") {
                                Common.openLoadingDialog(that);

                                path = "/MaterialListSet";

                                oModel.setHeaders({
                                    sbu: me._sbu //this._sbu
                                });
                                // console.log(JSON.stringify(oEntry));
                                //call create deep method to save assigned or created materials
                                oModel.create(path, oEntry, {
                                    method: "POST",
                                    success: function (oData, oResponse) {
                                        // me.getMaterialList();
                                        Common.closeLoadingDialog(that);
                                        // Common.showMessage(me._i18n.getText('t4'));
                                        MessageBox.information(_oCaption.INFO_SAVE_SUCCESS);
                                        me._materialListChanged = false;
                                        me.setChangeStatus(false);
                                    },
                                    error: function (err) {
                                        Common.closeLoadingDialog(that);
                                        // Common.showMessage(me._i18n.getText('t5'));
                                        var errorMsg = JSON.parse(err.responseText).error.message.value;
                                        MessageBox.information(errorMsg);
                                    }
                                });
                            }
                        }
                    });
                }
            },

            //******************************************* */
            // Search Helps
            //******************************************* */

            onMaterialValueHelp: function (oEvent) {
                //open Materials value help
                //TableValueHelp.handleTableValueHelp(oEvent, this);
                //return;
                var sInputValue = oEvent.getSource().getValue();
                var oData = oEvent.getSource().getParent().getBindingContext('DataModel');
                this.gmc = oData.getProperty('GMC');
                this.inputId = oEvent.getSource().getId(); //get input field id
                this.inputSource = oEvent.getSource();
                if (!this._valueHelpDialog) {
                    this._valueHelpDialog = sap.ui.xmlfragment("zui3derp.view.fragments.searchhelps.Materials", this);
                    this.getView().addDependent(this._valueHelpDialog);
                }
                this._valueHelpDialog.getBinding("items").filter([new Filter("Gmc", sap.ui.model.FilterOperator.EQ, this.gmc)]);
                this._valueHelpDialog.open(sInputValue);
            },

            _handleValueHelpSearch: function (oEvent) {
                //search materials
                var sValue = oEvent.getParameter("value");
                //var oFilter = new Filter("DescEn", sap.ui.model.FilterOperator.Contains, sValue);
                //oEvent.getSource().getBinding("items").filter([oFilter]);
                
                //include filtering of Matno
                var andFilter = [], orFilter = [];
                orFilter.push(new sap.ui.model.Filter("MatNo", sap.ui.model.FilterOperator.Contains, sValue));
                orFilter.push(new sap.ui.model.Filter("DescEn", sap.ui.model.FilterOperator.Contains, sValue));

                andFilter.push(new sap.ui.model.Filter(orFilter, false));
                 //include also GMC
                andFilter.push(new sap.ui.model.Filter("Gmc", sap.ui.model.FilterOperator.EQ, this.gmc));
                oEvent.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));

               
                // var oData = evt.getSource().getParent().getBindingContext('MaterialsModel');
                // var gmc = oData.getProperty('Gmc');

                // console.log(gmc);
                // this._valueHelpDialog.getBinding("items").filter([new Filter(
                //     "Gmc",
                //     sap.ui.model.FilterOperator.EQ, this.gmc
                // )]);

               
            },

            _handleValueHelpClose: function (oEvent) {
                //on select Material
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if (oSelectedItem) {
                    var input = this.byId(this.inputId);
                    input.setValue(oSelectedItem.getTitle()); //set input field selected Material
                    //input.setSelectedKey(oSelectedItem.getTitle())
                    this.onMaterialListChange(oEvent);
                }
                oEvent.getSource().getBinding("items").filter([]);
            },

            //get the authorization, this will hide the create material button if user is not authorized
            getRoleAuth: function (){
                
                var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_RFC_SRV");
                var oJSONModel = new JSONModel();
                // var id =_startUpInfo === undefined  ? "BAS_CONN" : _startUpInfo.id; //"NCJOAQUIN" 
                var id = sap.ushell.Container.getService('UserInfo').getId();//  _startUpInfo.id ; //"NCJOAQUIN" 
                
                oModel.read("/CreateMatRoleSet", {
                    urlParameters: {
                        "$filter": "Bname eq '" + id + "' and Roleid eq '" + this._sbu + "CRTMAT'"
                    },
                    success: function (oData, oResponse) {
                        var result = oData.results;
                        result = result.filter(a => a.Zresult === "0");

                        oJSONModel.setData(result);
                        that.getView().setModel(oJSONModel, "RoleAuthModel");
                        if(result.length == 0)
                        {
                            that.byId("btnCreateMat").setVisible(false);
                            that.byId("btnReqMatMap").setVisible(true);
                        }
                        else
                        {
                            const materialList = that.byId("materialListTable").getModel("DataModel").getData().results;
                            const distinctValues = [...new Set(materialList.map(item => that._sbu + item.MATTYPGRP))];
                            const filteredItems = distinctValues.filter((item) => {
                                return result.some((obj) => {
                                    return obj.Objcd === item;
                                });
                            });
                            if(filteredItems.length == 0 )
                            {
                                that.byId("btnCreateMat").setVisible(false);
                                that.byId("btnReqMatMap").setVisible(true);
                            }
                            else
                            {
                                that.byId("btnCreateMat").setVisible(true);
                                that.byId("btnReqMatMap").setVisible(false);
                            }
                        }
                    },
                    error: function () {
                        Common.closeLoadingDialog(that);
                    }
                })
            },

            onReqMaterialMap : function(){
                var oModel = this.getOwnerComponent().getModel();
                var oTable = this.byId("materialListTable");
                var oData = oTable.getModel("DataModel").getData();;
                var me = this;
                var oSelectedIndices = this.getView().byId("materialListTable").getSelectedIndices();
                var oTmpSelectedIndices = [];
                oSelectedIndices.forEach(item => {
                    oTmpSelectedIndices.push(oTable.getBinding("rows").aIndices[item])
                })
                oSelectedIndices = oTmpSelectedIndices;

                oModel.setUseBatch(true);
                oModel.setDeferredGroups(["update"]);
                var mParameters = {
                    "groupId": "update"
                }

                for (var i = 0; i < oSelectedIndices.length; i++) {
                    var index = oSelectedIndices[i];
                        var entitySet = "/ReqMatMapSet(Styleno='" + that._styleNo + "',Verno='" + oData.results[index].VERNO + "')";
                        const param = {
                            "Styleno": that._styleNo,
                            "Verno": oData.results[index].VERNO,
                            "Seqno": oData.results[index].SEQNO,
                            "Reqmatno": "X"
                        }
                        oModel.update(entitySet, param, mParameters);
                }
   
                oModel.submitChanges({
                    mParameters,
                    success: function (oData, oResponse) {
                        MessageBox.information(_oCaption.INFO_SAVE_SUCCESS);
                    },
                    error: function (oData, oResponse) {
                        MessageBox.information(_oCaption.INFO_ERROR);
                    }
                });

                oTable.clearSelection();
            },

            closePage: function(){
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                // oRouter.navTo("RouteStyles", {}, true);
                oRouter.navTo("RouteVersion", {
                    styleno: that._styleNo,
                    sbu: that._sbu,
                    version: that._version,
                    iono : ' '
                });
            },

            getCaptionMsgs: async function () {
                var me = this;
                var oDDTextParam = [], oDDTextResult = {};
                var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_COMMON_SRV");

  
                oDDTextParam.push({ CODE: "INFO_NO_RECORD_SELECT" });
                oDDTextParam.push({ CODE: "INFO_NO_SEL_RECORD_TO_PROC" });
                oDDTextParam.push({ CODE: "INFO_SAVE_SUCCESS" });
                oDDTextParam.push({ CODE: "WARN_NO_DATA_MODIFIED" });
                oDDTextParam.push({ CODE: "INFO_NO_MATCHING_MATNO" });
                oDDTextParam.push({ CODE: "INFO_ERROR" });

                return new Promise((resolve, reject)=>{
                    oModel.create("/CaptionMsgSet", { CaptionMsgItems: oDDTextParam }, {
                        method: "POST",
                        success: function (oData, oResponse) {
                            oData.CaptionMsgItems.results.forEach(item => {
                                oDDTextResult[item.CODE] = item.TEXT;
                            })

                            me.getView().setModel(new JSONModel(oDDTextResult), "ddtext");
                            me.getOwnerComponent().getModel("CAPTION_MSGS_MODEL").setData({ text: oDDTextResult });
                            _oCaption = me.getView().getModel("ddtext").getData();
                            resolve();
                        },
                        error: function (err) { resolve(); }
                    });
                });
            },

        })
    })