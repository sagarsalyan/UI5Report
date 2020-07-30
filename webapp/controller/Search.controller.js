jQuery.sap.require("Application.ProductVendor.util.Formatter");
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/Filter',
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"Application/ProductVendor/util/Formatter",
	"sap/m/MessageBox"
], function (Controller,Filter,JSONModel,Export,ExportTypeCSV,Formatter,MessageBox) {
	"use strict";

	return Controller.extend("Application.ProductVendor.controller.Search", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf Application.ProductVendor.view.Search
		 */
		formatter:Formatter,
		onInit: function () {
			
			debugger;
			var SyUname = sap.ushell.Container.getService("UserInfo").getId();
			var batchUrls = [];

			var that = this;
			batchUrls.push(this.getOwnerComponent().getModel().createBatchOperation("/ZmmvendorshSet", "GET"));
			batchUrls.push(this.getOwnerComponent().getModel().createBatchOperation("/ZmmporgshSet", "GET"));
			batchUrls.push(this.getOwnerComponent().getModel().createBatchOperation("/ZmmpoorderShSet", "GET"));
			batchUrls.push(this.getOwnerComponent().getModel().createBatchOperation("/ZmmmaterialshSet", "GET"));

			this.getOwnerComponent().getModel().addBatchReadOperations(batchUrls);
			this.getOwnerComponent().getModel().submitBatch(function (oData, oResponse) {

				debugger;
				that.vendorh = oData.__batchResponses[0].data;
				that.vendorh.results.unshift({FirstName: "None",VendorNumber:""});
				that.purorg = oData.__batchResponses[1].data;
				// that.purorg.results.unshift({PurchasingOrg: "None"});
				that.purorder = oData.__batchResponses[2].data;
				that.purorder.results.unshift({Zpurdocnum: "None"});
				that.material = oData.__batchResponses[3].data;
				that.material.results.unshift({Zmatdocnum: "None"});

			}, 
			function (error) {
				// ERROR LOGIC
				debugger;
				MessageBox.error("No Data Found!!!");
				// var errorMsg = JSON.parse(error.response.body);
				// errorMsg = errorMsg.error.message.value;
				// that.errMsg(errorMsg);
			// 		var modelValue = that.getView().getModel("reportModel1").getData().vendorinfo;
			// var oModel = new JSONModel(modelValue);
			// that.getView().byId("idReportTable").setModel(oModel,"reportModel");
			});
			
		
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf Application.ProductVendor.view.Search
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf Application.ProductVendor.view.Search
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf Application.ProductVendor.view.Search
		 */
		//	onExit: function() {
		//
		//	},
		onSearch : function() {
			
			//var dataTable=this.getView().byId("idReportTable");
			var vendorfrom=this.getView().byId("vendorfrom").getValue();
			var vendorto=this.getView().byId("vendorto").getValue();
			var purchaseorg=this.getView().byId("purchaseorg").getValue();
			var purchaseorderfrom=this.getView().byId("purchaseorderfrom").getValue();
			var purchaseorderto=this.getView().byId("purchaseorderto").getValue();
			var materialdocfrom=this.getView().byId("materialdocfrom").getValue();
			var materialdocto=this.getView().byId("materialdocto").getValue();
			
			// var oModel = new sap.ui.model.json.JSONModel("model/data.json");
			// this.getView().byId("idReportTable").setModel(oModel,"reportModel");
			debugger;
			if((vendorfrom=="" || purchaseorg=="") || (purchaseorderfrom=="" && materialdocfrom == "")) {
			// if(0){
				if(vendorfrom=="") {
					this.getView().byId("vendorfrom").setValueState("Error");
					this.getView().byId("vendorfrom").setValueStateText("Please select Vendor");
				}
				if(purchaseorg=="") {
					this.getView().byId("purchaseorg").setValueState("Error");
					this.getView().byId("purchaseorg").setValueStateText("Please select Purchase Organisation");
				}
				if(purchaseorderfrom=="" || materialdocfrom == "") {
					
					if(purchaseorderfrom=="" ){
						this.getView().byId("purchaseorderfrom").setValueState("Error");
						this.getView().byId("purchaseorderfrom").setValueStateText("Either Purchase Document Number or Material Document is necessary");
					}
					if(materialdocfrom == "" && purchaseorderfrom==""){
						this.getView().byId("materialdocfrom").setValueState("Error");
						this.getView().byId("materialdocfrom").setValueStateText("Either Purchase Document Number or Material Document is necessary");
						
					}
					
				}
			}
			else {
				//backend Binding
				var busyDialog = new sap.m.BusyDialog();
				var that = this;
				that.getOwnerComponent().getModel().read("/VendorreportSet?$filter=(ZVENDORNUM ge '"+vendorfrom+"' and ZVENDORNUM le '"+vendorto+"' and PurchagingOrg eq '"+purchaseorg+"' ) and (Zpurdocnum ge '"+purchaseorderfrom+"'  and Zpurdocnum le '"+purchaseorderto+"') and (Zmatdocnum ge '"+materialdocfrom+"' and Zmatdocnum le '"+materialdocto+"')", {
					async : false,
					success : function(oData, oResponse) {
						busyDialog.close();
						debugger;
						var oModel = new sap.ui.model.json.JSONModel(oData);
						that.getView().byId("idReportTable").setModel(oModel,"reportModel");
						that.getView().byId("panelreport").setExpanded(true);
						that.getView().byId("panelsearch").setExpanded(false);
					},
					error:function(error){
						busyDialog.close();
						debugger;
						MessageBox.error(JSON.parse(error.response.body).error.message.value,{
							title: error.response.statusText
						});
						// sap.m.MessageBox.error("No Data Found!!!");
						// var errorMsg = JSON.parse(error.response.body);
						// errorMsg = errorMsg.error.message.value;
						// that.errMsg(errorMsg);
					}
				});
				//backend binding
				
				
				
				//dataTable.setModel(jsonModel,"JSON");
				// this.getView().byId("panelreport").setExpanded(true);
				// this.getView().byId("panelsearch").setExpanded(false);
			}
		},
		
		handleVendorHelpFrom : function (oEvent) {
			this.getView().byId("vendorfrom").setValueState("None");
			var sInputValue = oEvent.getSource().getValue();

			
			// create value help dialog
			if (!this._vendorHelpFromDialog) {
				this._vendorHelpFromDialog = sap.ui.xmlfragment(
					"Application.ProductVendor.fragment.VendorFrom",
					this
				);
				this.getView().addDependent(this._vendorHelpFromDialog);
			}
			
			var vendormodel = new sap.ui.model.json.JSONModel(this.vendorh);
			sap.ui.getCore().byId("vendorFromHelp").setModel(vendormodel,"VendorFromModel");
			
			// var busyDialog = new sap.m.BusyDialog();
			// //var that = this;
			// this.getOwnerComponent().getModel().read("/ZmmvendorshSet", {
			// 	async : false,
			// 	success : function(oData, oResponse) {
			// 		busyDialog.close();
			// 		debugger;
			// 		var oModel = new sap.ui.model.json.JSONModel(oData);
			// 		sap.ui.getCore().byId("vendorFromHelp").setModel(oModel,"VendorFromModel");
			// 	},
			// 	error:function(error){
			// 		busyDialog.close();
			// 		debugger;
			// 		var errorMsg = JSON.parse(error.response.body);
			// 		errorMsg = errorMsg.error.message.value;
			// 		this.errMsg(errorMsg);
			// 	}
			// });
			// //BackendDataBinding
			
			
			this._vendorHelpFromDialog.open(sInputValue);
		},
		handleVendorHelpTo : function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();

			
			// create value help dialog
			if (!this._vendorHelpToDialog) {
				this._vendorHelpToDialog = sap.ui.xmlfragment(
					"Application.ProductVendor.fragment.VendorTo",
					this
				);
				this.getView().addDependent(this._vendorHelpToDialog);
			}
			
			
			var vendormodel = new sap.ui.model.json.JSONModel(this.vendorh);
			sap.ui.getCore().byId("vendorToHelp").setModel(vendormodel,"VendorToModel");
			
			// //BackendData Binding
			// var busyDialog = new sap.m.BusyDialog();
			// //var that = this;
			// this.getOwnerComponent().getModel().read("/ZmmvendorshSet", {
			// 	async : false,
			// 	success : function(oData, oResponse) {
			// 		busyDialog.close();
			// 		debugger;
			// 		var oModel = new sap.ui.model.json.JSONModel(oData);
			// 		sap.ui.getCore().byId("vendorToHelp").setModel(oModel,"VendorToModel");
			// 	},
			// 	error:function(error){
			// 		busyDialog.close();
			// 		debugger;
			// 		var errorMsg = JSON.parse(error.response.body);
			// 		errorMsg = errorMsg.error.message.value;
			// 		this.errMsg(errorMsg);
			// 	}
			// });
			//BackendDataBinding
		
			this._vendorHelpToDialog.open(sInputValue);
		},
		_handleVendorSearch : function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"FirstName",
				sap.ui.model.FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},

		_handleVendorHelpFromClose : function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var 
					oInput = this.getView().byId('vendorfrom'),
					sDescription = oSelectedItem.getDescription();

				
				oInput.setValue(sDescription);
			}
		},
		_handleVendorHelpToClose : function (evt) {
			
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var 
					oInput = this.getView().byId('vendorto'),
					sDescription = oSelectedItem.getDescription();

			
				oInput.setValue(sDescription);
			}
		},
		handlePurchaseHelp : function (oEvent) {
			this.getView().byId("purchaseorg").setValueState("None");
			var sInputValue = oEvent.getSource().getValue();

			// this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._purchaseHelpDialog) {
				this._purchaseHelpDialog = sap.ui.xmlfragment(
					"Application.ProductVendor.fragment.PurchaseOrg",
					this
				);
				this.getView().addDependent(this._purchaseHelpDialog);
			}
			debugger;
			var purchaseorg = new sap.ui.model.json.JSONModel(this.purorg);
			sap.ui.getCore().byId("purchaseOrgHelp").setModel(purchaseorg,"PurchaseOrgModel");
			
			// var busyDialog = new sap.m.BusyDialog();
			// //var that = this;
			// this.getOwnerComponent().getModel().read("/ZmmporgshSet", {
			// 	async : false,
			// 	success : function(oData, oResponse) {
			// 		busyDialog.close();
			// 		debugger;
			// 		var oModel = new sap.ui.model.json.JSONModel(oData);
			// 		sap.ui.getCore().byId("purchaseOrgHelp").setModel(oModel,"PurchaseOrgModel");
			// 	},
			// 	error:function(error){
			// 		busyDialog.close();
			// 		debugger;
			// 		var errorMsg = JSON.parse(error.response.body);
			// 		errorMsg = errorMsg.error.message.value;
			// 		this.errMsg(errorMsg);
			// 	}
			// });

			this._purchaseHelpDialog.open(sInputValue);
		},
		_handlePurchaseSearch : function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"PurchagingOrg",
				sap.ui.model.FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		_handlePurchaseHelpClose : function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput = this.byId(this.inputId),
					oInput = this.getView().byId('purchaseorg'),
					sDescription = oSelectedItem.getTitle();

				// productInput.setSelectedKey(sDescription);
				oInput.setValue(sDescription);
			}
			
		},
		
		_handlePurchaseOrderSearch : function (evt) {
		
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"Zpurdocnum",
				sap.ui.model.FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		
		handlePurchaseOrderFromHelp : function(oEvent) {
			this.getView().byId("purchaseorderfrom").setValueState("None");
			this.getView().byId("materialdocfrom").setValueState("None");
			var sInputValue = oEvent.getSource().getValue();

			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._purchaseorderfromHelpDialog) {
				this._purchaseorderfromHelpDialog = sap.ui.xmlfragment(
					"Application.ProductVendor.fragment.PurchaseOrderFrom",
					this
				);
				this.getView().addDependent(this._purchaseorderfromHelpDialog);
			}
			
			debugger;
			var purchaseorder = new sap.ui.model.json.JSONModel(this.purorder);
			sap.ui.getCore().byId("purchaseOrderFromHelp").setModel(purchaseorder,"PurchaseOrderFromModel");
			
			// var busyDialog = new sap.m.BusyDialog();
			// //var that = this;
			// this.getOwnerComponent().getModel().read("/ZmmpoorderShSet", {
			// 	async : false,
			// 	success : function(oData, oResponse) {
			// 		busyDialog.close();
			// 		debugger;
			// 		var oModel = new sap.ui.model.json.JSONModel(oData);
			// 		sap.ui.getCore().byId("purchaseOrderFromHelp").setModel(oModel,"PurchaseOrderFromModel");
			// 	},
			// 	error:function(error){
			// 		busyDialog.close();
			// 		debugger;
			// 		var errorMsg = JSON.parse(error.response.body);
			// 		errorMsg = errorMsg.error.message.value;
			// 		this.errMsg(errorMsg);
			// 	}
			// });
			
			this._purchaseorderfromHelpDialog.open(sInputValue);
		},
		
		_handlePurchaseOrderFromHelpClose : function(evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var 
					oInput = this.getView().byId('purchaseorderfrom'),
					sTitle = oSelectedItem.getTitle();

				if(sTitle=="None"){
					sTitle="";
				}
				oInput.setValue(sTitle);
			}
		},
		
		handlePurchaseOrderToHelp : function(oEvent) {
			var sInputValue = oEvent.getSource().getValue();

			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._purchaseordertoHelpDialog) {
				this._purchaseordertoHelpDialog = sap.ui.xmlfragment(
					"Application.ProductVendor.fragment.PurchaseOrderTo",
					this
				);
				this.getView().addDependent(this._purchaseordertoHelpDialog);
			}
			
			
			debugger;
			var purchaseorder = new sap.ui.model.json.JSONModel(this.purorder);
			sap.ui.getCore().byId("purchaseOrderToHelp").setModel(purchaseorder,"PurchaseOrderToModel");
			//BackendDataBinding
			// var busyDialog = new sap.m.BusyDialog();
			// //var that = this;
			// this.getOwnerComponent().getModel().read("/ZmmpoorderShSet", {
			// 	async : false,
			// 	success : function(oData, oResponse) {
			// 		busyDialog.close();
			// 		debugger;
			// 		var oModel = new sap.ui.model.json.JSONModel(oData);
			// 		sap.ui.getCore().byId("purchaseOrderToHelp").setModel(oModel,"PurchaseOrderToModel");
			// 	},
			// 	error:function(error){
			// 		busyDialog.close();
			// 		debugger;
			// 		var errorMsg = JSON.parse(error.response.body);
			// 		errorMsg = errorMsg.error.message.value;
			// 		this.errMsg(errorMsg);
			// 	}
			// });

			this._purchaseordertoHelpDialog.open(sInputValue);
		},
		
		_handlePurchaseOrderToHelpClose : function(evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var 
					oInput = this.getView().byId('purchaseorderto'),
					sDescription = oSelectedItem.getTitle();
					if(sDescription=="None"){
						sDescription="";
					}
			
				oInput.setValue(sDescription);
			}
		},
		
		handleMaterialDocFromHelp : function(oEvent) {
			this.getView().byId("purchaseorderfrom").setValueState("None");
			this.getView().byId("materialdocfrom").setValueState("None");
			var sInputValue = oEvent.getSource().getValue();

			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._materialdocfromHelpDialog) {
				this._materialdocfromHelpDialog = sap.ui.xmlfragment(
					"Application.ProductVendor.fragment.MaterialDocFrom",
					this
				);
				this.getView().addDependent(this._materialdocfromHelpDialog);
			}
			
			
			debugger;
			var materialdoc = new sap.ui.model.json.JSONModel(this.material);
			sap.ui.getCore().byId("materialDocFromHelp").setModel(materialdoc,"MaterialDocFromModel");
			//BackendBinding
			// var busyDialog = new sap.m.BusyDialog();
			// //var that = this;
			// this.getOwnerComponent().getModel().read("/ZmmmaterialshSet", {
			// 	async : false,
			// 	success : function(oData, oResponse) {
			// 		busyDialog.close();
			// 		debugger;
			// 		var oModel = new sap.ui.model.json.JSONModel(oData);
			// 		sap.ui.getCore().byId("materialDocFromHelp").setModel(oModel,"MaterialDocFromModel");
			// 	},
			// 	error:function(error){
			// 		busyDialog.close();
			// 		debugger;
			// 		var errorMsg = JSON.parse(error.response.body);
			// 		errorMsg = errorMsg.error.message.value;
			// 		this.errMsg(errorMsg);
			// 	}
			// });
			
			this._materialdocfromHelpDialog.open(sInputValue);
		},
		
		handleMaterialDocToHelp : function(oEvent) {
			var sInputValue = oEvent.getSource().getValue();

			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._materialdoctoHelpDialog) {
				this._materialdoctoHelpDialog = sap.ui.xmlfragment(
					"Application.ProductVendor.fragment.MaterialDocTo",
					this
				);
				this.getView().addDependent(this._materialdoctoHelpDialog);
			}
			
			
			debugger;
			var materialdoc = new sap.ui.model.json.JSONModel(this.material);
			sap.ui.getCore().byId("materialDocToHelp").setModel(materialdoc,"MaterialDocToModel");
			
			//BackendBinding
			// var busyDialog = new sap.m.BusyDialog();
			// //var that = this;
			// this.getOwnerComponent().getModel().read("/ZmmmaterialshSet", {
			// 	async : false,
			// 	success : function(oData, oResponse) {
			// 		busyDialog.close();
			// 		debugger;
			// 		var oModel = new sap.ui.model.json.JSONModel(oData);
			// 		sap.ui.getCore().byId("materialDocToHelp").setModel(oModel,"MaterialDocToModel");
			// 	},
			// 	error:function(error){
			// 		busyDialog.close();
			// 		debugger;
			// 		var errorMsg = JSON.parse(error.response.body);
			// 		errorMsg = errorMsg.error.message.value;
			// 		this.errMsg(errorMsg);
			// 	}
			// });
			
			this._materialdoctoHelpDialog.open(sInputValue);
		},
		
		_handleMaterialDocSearch : function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"Zmatdocnum",
				sap.ui.model.FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		
		_handleMaterialDocFromHelpClose : function(evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var
					oInput = this.getView().byId("materialdocfrom"),
					sTitle = oSelectedItem.getTitle();

				if(sTitle=="None"){
					sTitle="";
				}
				oInput.setValue(sTitle);
			}
		
		},
		
		_handleMaterialDocToHelpClose : function(evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var 
					oInput = this.getView().byId("materialdocto"),
					sTitle = oSelectedItem.getTitle();

				if(sTitle=="None"){
					sTitle="";
				}
				oInput.setValue(sTitle);
			}
			
		},
		
		onDownload : function(oEvent) {
			
			var dataTable=this.getView().byId("idReportTable");
		
			var oModel = dataTable.getModel("reportModel");
			var itemArr=oModel.getData().results;
			
			for(var i=0;i<itemArr.length;i++){
				itemArr[i].pdate=this.formatter.formatDate(itemArr[i].Zpurdocdate);
			}
			var itemObj={results:itemArr};
			var itemModel=new sap.ui.model.json.JSONModel(itemObj);
			var oExport = new Export({

				exportType: new ExportTypeCSV({
					fileExtension: "csv",
					separatorChar: ","
				}),

				models: itemModel,

				rows: {
					path: "/results"
				},
				columns: [
					{
						name: "Vendorumber",
						template: {
							content: "{ZVENDORNUM}"
						}
					}, 
					{
						name: "Vendor name",
						template: {
							content: "{FirstName}"
						}
					},
					{
						name: "Material Document Number",
						template: {
							content: "{Zmatdocnum}"
						}
					},
					{
						name: "Purchase Document Number",
						template: {
							content: "{Zpurdocnum}"
						}
					},
					{
						name: "Purchase Document Date",
						template: {
							content: "{pdate}"
						}
					},
					{
						name: "Material",
						template: {
							content: "{Ztext}-{Zmaterialnum}"
						}
					},
					{
						name: "Plant",
						template: {
							content: "{Zplant}"
						}
					},
					{
						name: "Storage Location",
						template: {
							content: "{Zstorageloc}"
						}
					},
					{
						name: "Quantity",
						template: {
							content: "{Zquant}"
						}
					},
					{
						name: "Quantity Key",
						template: {
							content: "{Zquantkey}"
						}
					},
					{
						name: "Net Price",
						template: {
							content: "{Zprice}"
						}
					},
					{
						name: "Currency",
						template: {
							content: "{Zcurrkey}"
						}
					},
					{
						name: "Received Quantity",
						template: {
							content: "{Zrecievquant}"
						}
					}
				]
			});
			console.log(oExport);
			oExport.saveFile().catch(function(oError) {
				console.log("error");
			}).then(function() {
				oExport.destroy();
			});
			debugger;
			//Spreadsheet
			// var aCols, oRowBinding, oSettings, oSheet, oTable;

			// if (!this._oTable) {
			// 	this._oTable = this.getView().byId("idReportTable");
			// }
				
			// // test
			// // var modelValue = this.getView().getModel("reportModel").getData().results;
			// // var oModelt = new JSONModel(modelValue);
			// // this.getView().byId("idReportTable").setModel(oModelt,"reportModel");
			// //test
			
			// oTable = this._oTable;
			// oRowBinding = oTable.getBinding("items");
			// aCols = this.createColumnConfig();
			// // var oModel = oRowBinding.getModel("reportModel").getProperty('/');
			
			
			// // var oModel = this.getView().byId("idReportTable").getModel("reportModel").getProperty('/');
			// if(oRowBinding){
			// 	var oModel = oRowBinding.getModel("reportModel").getProperty('/');
			// }
			// else{
			// 	sap.m.MessageBox.error("No Data to download!!");
			// }
			// // var vModel = new JSONModel(oModel);

			// oSettings = {
			// 	workbook: { columns: aCols },
			// 	dataSource: oModel.results
			// };
			
			// // oSettings = {
			// // 	workbook: {
			// // 		columns: aCols,
			// // 		hierarchyLevel: 'Level'
			// // 	},
			// // 	dataSource: {
			// // 		type: 'odata',
			// // 		dataUrl: oRowBinding.getDownloadUrl ? oRowBinding.getDownloadUrl() : null,
			// // 		serviceUrl: oModel.sServiceUrl,
			// // 		headers: oModel.getHeaders ? oModel.getHeaders() : null,
			// // 		count: oRowBinding.getLength ? oRowBinding.getLength() : null,
			// // 		useBatch: oModel.bUseBatch
			// // 	},
			// // 	worker: false // We need to disable worker because we are using a MockServer as OData Service
			// // };

			// oSheet = new Spreadsheet(oSettings);
			// oSheet.build()
			// 	.then( function() {
			// 		sap.m.MessageToast.show('Export Completed');
			// 	})
			// 	.finally(function() {
			// 	oSheet.destroy();
			// });
			
			
		},
		createColumnConfig: function() {
			var aCols = [];
				
			// test
			// aCols.push({
			// 	label: 'Vendorname',
			// 	property: ['vendorname','vendorno'],
			// 	type: 'string',
			// 	template: '{0}, {1}'
			// });
			// aCols.push({
			// 	label: 'VendorNumber',
			// 	property: 'vendorno',
			// 	type: 'string'
			// });
			//test
			
			aCols.push({
				label: 'Vendorumber',
				property: 'FirstName',
				type: 'string'
			});
			
			aCols.push({
				label: 'Vendor',
				property: 'ZVENDORNUM',
				type: 'number'
			});

			aCols.push({
				label: 'Material Document Number',
				property: 'Zmatdocnum',
				type: 'number'
			});

			aCols.push({
				label: 'Purchase Document Number',
				property: 'Zpurdocnum',
				type: 'number'
			});

			aCols.push({
				label: 'Purchase Document Date',
				property: 'Zpurdocdate',
				type: 'date'
			});

			aCols.push({
				label: 'Material',
				property: ['Ztext', 'Zmaterialnum'],
				type: 'string',
				template: '{0}, {1}'
			});

			aCols.push({
				label: 'Plant',
				property: 'Zplant',
				type: 'string'
			});	
			
			aCols.push({
				label: 'Storage Location',
				property: 'Zstorageloc',
				type: 'string'
			});
			
			aCols.push({
				label: 'Quantity',
				property: 'Zquant',
				type: 'string'
			});
			
			aCols.push({
				label: 'Quantity Key',
				property: 'Zquantkey',
				type: 'string'
			});
			
			aCols.push({
				label: 'Net Price',
				property: 'Zprice',
				type: 'string'
			});
			
			aCols.push({
				label: 'Currency Key',
				property: 'Zcurrkey',
				type: 'string'
			});
			
			aCols.push({
				label: 'Received Quantity',
				property: 'Zrecievquant',
				type: 'string'
			});

		

			return aCols;
		},
		
		handleLinkPurDocnum : function(){
			debugger;
			// get a handle on the global XAppNav service
			this.oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
	
		    var hash1 = (this.oCrossAppNavigator && this.oCrossAppNavigator.hrefForExternal({
							target: {
								semanticObject: "ZPURCHORDERSEM",
								action: "display"
							}
						})) || "";
            this.oCrossAppNavigator.toExternal({
			     	target: {
					shellHash: hash1
				}
			});
		},
		handleLinkMatDocnum : function(){
			debugger;
			// get a handle on the global XAppNav service
			this.oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
	
		    var hash1 = (this.oCrossAppNavigator && this.oCrossAppNavigator.hrefForExternal({
							target: {
								semanticObject: "ZGRSEMANTIC",
								action: "display"
							}
						})) || "";
            this.oCrossAppNavigator.toExternal({
			     	target: {
					shellHash: hash1
				}
			});
		},
		handleLinkVennum: function(){
			debugger;
			// get a handle on the global XAppNav service
			this.oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
	
		    var hash1 = (this.oCrossAppNavigator && this.oCrossAppNavigator.hrefForExternal({
							target: {
								semanticObject: "vensem",
								action: "display"
							}
						})) || "";
            this.oCrossAppNavigator.toExternal({
			     	target: {
					shellHash: hash1
				}
			});
		},
		handleLinkMat: function(){
			debugger;
			// get a handle on the global XAppNav service
			this.oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
	
		    var hash1 = (this.oCrossAppNavigator && this.oCrossAppNavigator.hrefForExternal({
							target: {
								semanticObject: "zlast1",
								action: "display"
							}
						})) || "";
            this.oCrossAppNavigator.toExternal({
			     	target: {
					shellHash: hash1
				}
			});
		}
		
	

	});

});