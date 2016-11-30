chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.create({url : 'index.html'}, function(tab) {
    });
});

// Check whether new version is installed
chrome.runtime.onInstalled.addListener(function(details){

    if(details.reason == "install"){

        chrome.storage.sync.get(function(config){

            if(Object.keys(config).length === 0 && config.constructor === Object){

                chrome.storage.sync.set({
                    hosts : [],
                    noIndexing : [
                        'information_schema',
                        'performance_schema',
                        'mysql'
                    ],
                    autoLoadConnectionWindow: true
                });
            }
        });

    }else if(details.reason == "update"){

        var thisVersion = chrome.runtime.getManifest().version;
        // console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    }
});
