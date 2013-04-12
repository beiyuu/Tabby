$(function(){
    function initContext(){
        var contextAll = chrome.contextMenus.create({
            title: chrome.i18n.getMessage('saveTab')
            ,onclick: saveTab
        });

        var contextLink = chrome.contextMenus.create({
            title: chrome.i18n.getMessage('saveLink')
            ,contexts: ["link"]
            ,onclick: saveLink
        });
    }

    function saveBookmark(title,url){
        var ID = init.TabbyID;
        chrome.bookmarks.create({
            title:title
            ,url:url
            ,parentId:ID
        });

        chrome.extension.sendMessage({
            type:'updateBadge'
        });
        displayMsg();
    }

    function saveTab(info,tab){
        if(tab.url){
            saveBookmark(tab.title,tab.url);
            chrome.tabs.remove(tab.id)
        }else{
            displayMsg('fail');
        }
    }

    function saveLink(info,tab){
        var url = info.linkUrl;
        var title = $.trim(info.selectionText) || url;

        //chrome.extension.sendMessage({type: "getLink",url:info.linkUrl});
        if(!url || url=='#'){
            displayMsg('fail');
        }else{
            saveBookmark(title,url);
        }
    }

    function displayMsg(text){
        var box = webkitNotifications.createHTMLNotification('notification.html')
        if(text == 'fail'){
            box = webkitNotifications.createHTMLNotification('notification_fail.html')
        }

        box.show();
        setTimeout(function(){
            box.cancel()
        },2500)
    }

    function updateBadge(){
        var tabID = init.TabbyID;
        chrome.storage.sync.get({'switch_num':''},function(item){
            if(item.switch_num){
                chrome.bookmarks.getSubTree(tabID,function(bookmark){
                    var num = bookmark[0].children.length || '';
                    chrome.browserAction.setBadgeText({text : num?num.toString():''})
                });
            }else{
                chrome.browserAction.setBadgeText({text : ''})
            }
        })
    }

    var init = new initID(initContext)
    init.init();

    chrome.extension.onMessage.addListener(function(msg,sender,sendResponse){
        if(msg.type == 'updateBadge'){
            updateBadge();
        }

        if(msg.type == 'savetab'){
            chrome.tabs.getSelected(null, function(tab) {
                saveTab('',tab)
            })
        }

        if(msg.type == "getLink"){
            //sendResponse({url:msg.url});
        }
    });

    chrome.extension.sendMessage({
        type:'updateBadge'
    });
});

if(localStorage.welcomeTabby !== "true") {
    localStorage.welcomeTabby = "true";
    chrome.storage.sync.set({'switch_num':'checked'},function(){
        chrome.tabs.create({
            url: chrome.extension.getURL('options.html')
            ,selected: true
        });
    });
}
