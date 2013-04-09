$(function(){
    var htmlEscapes = {
        '&': '&amp;'
        ,'<': '&lt;'
        ,'>': '&gt;'
        ,'"': '&quot;'
        ,"'": '&#x27;'
        ,'/': '&#x2F;'
    };
    var htmlEscaper = /[&<>"'\/]/g;

    function escape(string) {
        return ('' + string).replace(htmlEscaper, function(match) {
            return htmlEscapes[match];
        });
    };

    function getTabbySub(arr){
        var li = [];

        function get(arr){
            $.each(arr,function(index,item){
                if(item.url){
                    li.push(item)
                }else{
                    get(item.children)
                }
            });
        }

        get(arr);
        return li;
    }

    function renderTabby(){
        var tabID = init.TabbyID;
        chrome.bookmarks.getSubTree(tabID,function(bookmark){
            var html = '';
            var tmpl = '<li data-url="{{=url}}" data-id="{{=id}}" title="{{=title}}">\
                        <span class="img">\
                        <img src="chrome://favicon/{{=url}}" />\
                        </span>\
                        <span>{{=title}}</span>\
                        </li>';

            var liBookmarks = [];
            liBookmarks = getTabbySub(bookmark[0].children);

            if(liBookmarks.length){
                $.each(liBookmarks,function(index,item){
                    html += tmpl.replace(/{{=url}}/g,item.url)
                                .replace('{{=id}}',item.id)
                                .replace(/{{=title}}/g,escape(item.title));
                });
            }else{
                html = '暂时没有'
            }

            $('#tab-container').html(html)
        });
    }

    var init = new initID(renderTabby)
    init.init();

    $('#tab-container').delegate('li','click',function(e){
        var url = $(this).attr('data-url');
        var id = $(this).attr('data-id');

        chrome.tabs.create({ url:$(this).attr('data-url') });
        chrome.bookmarks.remove(id)
        chrome.extension.sendMessage({
            type:'updateBadge'
        });
    });

    chrome.extension.sendMessage({
        type:'updateBadge'
    });

});
