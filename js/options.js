;(function(){
    function isMac(){
        return navigator.platform.match(/^Mac/)!==null
    }
    function i18nReplace(name) {
         return document.getElementById(name).innerText = chrome.i18n.getMessage(name);
    }
    i18nReplace('optionsSettings');
    i18nReplace('optionsShare');
    i18nReplace('optionsNum');
    i18nReplace('optionsShortcut');
    i18nReplace('optionsAbout');
    i18nReplace('optionsRight');
    i18nReplace('optionsSync');

    var input = document.getElementById('shortcut-input');
    new TabbyShortcut(input);

    var storage = chrome.storage.sync;

    $('#switch-shortcut').on('change',function(e){
        var checked = $(this).is(':checked') || '';

        $('#shortcut-input').toggleClass('hide',!checked);
        storage.set({'switch_shortcut':checked});
    });

    $('#switch-num').on('change',function(e){
        var checked = $(this).is(':checked')?'checked':'';
        storage.set({'switch_num':checked},function(item){
            chrome.extension.sendMessage({
                type:'updateBadge'
            });
        });
    });

    storage.get({'switch_shortcut':''},function(item){
        if(item.switch_shortcut){
            $('#switch-shortcut').prop('checked', true);
            $('#shortcut-input').removeClass('hide');
        }

        storage.get({'shortcut':''},function(sc){
            if(sc.shortcut){
                $('#shortcut-input').val(sc.shortcut)
            }else{
                $('#shortcut-input').val(TabbyShortcut.defaultShortcut)
            }
        })
    });
    storage.get({'switch_num':''},function(item){
        if(item.switch_num){
            $('#switch-num').prop('checked', true)
        }
    });

    $('.share img').hover(function(e){
        $(this).toggleClass('hover');
    })
})();
