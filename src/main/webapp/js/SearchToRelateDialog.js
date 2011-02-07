/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace:true, fluid*/

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("SearchToRelateDialog.js loaded");

    var handleAddClick = function (that) {
        return function () {
            var data = that.search.model.results;
            var i, newIndex = 0;
            var newRelations = [];
            var source = {
                csid: that.model.csid,
                recordtype: that.options.primary
            };
            // NOTE: using for in so that we don't loop through data that we haven't actually fetched yet. 
            for (i in data) {
                if (data[i].selected) {
                    newRelations[newIndex] = {
                        source: source,
                        target: data[i],
                        type: "affects",
                        "one-way": false
                    };
                    ++newIndex;
                }
            }
            that.events.addRelations.fire({
                items: newRelations
            });
            that.close();
        };
    };
    
    var bindEventHandlers = function (that, addDialog) {
        that.locate("addButton", addDialog).click(handleAddClick(that));
        that.locate("closeButton", addDialog).click(function () {
            that.close();
        });
        that.locate("createNewButton", addDialog).click(function () {
            that.events.onCreateNewRecord.fire();
            that.close();
        });
        that.search.events.afterSearch.addListener(function () {
            that.locate("addButton").show();
        });
    };
    
    cspace.searchToRelateDialog = function (container, options) {        
        var that = fluid.initRendererComponent("cspace.searchToRelateDialog", container, options);
        that.model = that.options.model;
        var recordName = that.messageResolver.resolve(that.options.related);
        var title = that.messageResolver.resolve("title", {recordType: recordName});
        that.container.dialog({
            autoOpen: false,
            modal: true,
            minWidth: 700,
            draggable: true,
            dialogClass: "cs-search-dialog",
            position: ["center", 100],
            title: title                
        });
        
        that.open = function () {
            that.search.hideResults();
            that.locate("addButton").hide();
            that.container.dialog("open");        
        };
        that.close = function () {
            that.container.dialog("close");
        };
        that.renderer.refreshView();
        fluid.initDependents(that);

        that.locate("addButton", that.container).hide();

        that.events.afterRender.fire(that);

        bindEventHandlers(that, that.container);
        that.events.afterSetup.fire(that);
        return that;
    };

    cspace.searchToRelateDialog.produceTree = function () {
        return {};
    };
    
    cspace.searchToRelateDialog.getDialogGetter = function (that) {
        return function () {
            return that.container;
        };
    };
    
    fluid.demands("cspace.search.searchView", "cspace.searchToRelateDialog", 
        ["{searchToRelateDialog}.container", fluid.COMPONENT_OPTIONS]);
    
    fluid.defaults("cspace.searchToRelateDialog", {
        mergePolicy: {
            model: "preserve"
        },
        selectors: {
            dialog: { // See comments for Confirmation.js - we adopt a common strategy now
            // since the problem in THIS component is that it invokes jquery.dialog on startup, thus
            // causing its container to move.
                expander: {
                    type: "fluid.deferredCall",
                    func: "cspace.searchToRelateDialog.getDialogGetter",
                    args: ["{searchToRelateDialog}"]
                }
            },
            addButton: ".csc-searchToRelate-addButton",
            closeButton: ".csc-searchToRelate-closeBtn",
            createNewButton: ".csc-searchToRelate-createButton"
        },
        selectorsToIgnore: ["addButton", "closeButton", "createNewButton", "dialog"],
        events: {
            addRelations: null,
            onCreateNewRecord: null,
            afterRender: null,
            afterSetup: null
        },
        rendererFnOptions: {
            rendererTargetSelector: "dialog"
        },
        produceTree: cspace.searchToRelateDialog.produceTree,
        parentBundle: "{globalBundle}",
        strings: {
            procedures: "Procedural",
            title: "Add Related %recordType Record"   
        },
        components: {
            search: {
                type: "cspace.search.searchView",
                options: {
                    resultsSelectable: true,
                    recordType: "{searchToRelateDialog}.options.related",
                    components: {
                        mainSearch: {
                            options: {
                                strings: {
                                    recordTypeSelectLabel: "Search existing:" 
                                },
                                related: "{searchToRelateDialog}.options.related",
                                permission: "update"
                            }
                        }
                    }
                }
            }
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "slowTemplate",
                url: "%webapp/html/components/searchToRelate.html"
            })
        }
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.searchToRelateDialog");
    
})(jQuery, fluid);
