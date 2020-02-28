jQuery.sap.declare("Application.ProductVendor.util.Formatter");
jQuery.sap.require("sap.ca.ui.model.format.DateFormat");
jQuery.sap.require("sap.ca.ui.model.format.NumberFormat");


sap.ui.define(function() {
	"use strict";
 
	var Formatter = {
 
		minAgreementDate:function()
		{
			debugger;
			return "Sagar";
		},
		Vendor:function()
		{
			debugger;
			return "Sagar";
		},
		formatDate:function(oDate){
			debugger;
			var oDateFormat=sap.ca.ui.model.format.DateFormat.getTimeInstance({
				pattern:"dd.MM.yyyy"
			});
			return oDateFormat.format(oDate);
		}
	};
	return Formatter;

});