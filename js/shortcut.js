(function(){
    var KEY = {
        8    : "backspace" , 9   : "tab"    , 12  : "clear"
        ,13  : "enter"     , 27  : "esc"    , 32  : "space"
        ,37  : "left"      , 38  : "up"     , 39  : "right"
        ,40  : "down"      , 46  : "del"    , 36  : "home"
        ,35  : "end"       , 33  : "pageup" , 34  : "pagedown"
        ,188 : ","         , 190 : "."      , 191 : "/"
        ,192 : "`"         , 189 : "-"      , 187 : "="
        ,186 : ";"         , 222 : "'"      , 219 : "["
        ,221 : "]"         , 220 : "\\"
        ,16  : isMac() ? "⇧" : "shift"
        ,18  : isMac() ? "⌥" : "alt"
        ,17  : isMac() ? "⌃" : "ctrl"
        ,91  : isMac() ? "⌘" : "command"
        ,93  : isMac() ? "⌘" : "command"
    };
    var keyQueue = [];
    var storage = chrome.storage.sync;

    function isMac(){
        return navigator.platform.match(/^Mac/)!==null
    }

    Shortcut.defaultShortcut = ''
    isMac() ? Shortcut.defaultShortcut = '⌘+⇧+S' : Shortcut.defaultShortcut = 'ctrl+shift+S'

    function trimShortcut(val){
        return val.trim().replace(/[\s\,\&]/gi, "+").replace(/[^A-Z0-9⇧⌥⌃⌘\+]/gi, "")
    }

    function validShortcut(val){
        var validReg = /^(((alt|shift|ctrl|command|⌘|⌥|⌃|⇧)\+)+([a-z0-9]{1}\+)*([a-z0-9]{1}))$/gi

        if(val.length && val.match(validReg)) return true;

        return false;
    }

    function recurseQueue(queue, nowstr) {
        var n = queue.length;
        while (n--) {
            if (queue[n] === nowstr) return n;
        }
        return -1;
    }

    Shortcut.contentKeydown = function(e){
        storage.get({'switch_shortcut':''},function(item){
            if(item.switch_shortcut){
                var keycode = e.keyCode;
                var str = '';

                str = KEY[keycode] || String.fromCharCode(keycode).toUpperCase();

                if(recurseQueue(keyQueue, str) == -1){
                    keyQueue.push(str)
                    var key = keyQueue.join('+');
                    key = trimShortcut(key);

                    storage.get({'shortcut':''},function(item){
                        if(item.shortcut){
                            if(key === item.shortcut){
                                chrome.extension.sendMessage({
                                    type:'savetab'
                                });
                            }
                        }else{
                            if(key === TabbyShortcut.defaultShortcut){
                                chrome.extension.sendMessage({
                                    type:'savetab'
                                });
                            }
                        }
                    });
                }
            }
        });
    }

    Shortcut.evKeyDown = function(e){
        e.preventDefault();

        var keycode = e.keyCode;
        var input = this;
        var str = '';

        if(keycode == 8) input.value='';
        else if(keycode === 13 || keycode === 27) input.blur();
        else str = KEY[keycode] || String.fromCharCode(keycode).toUpperCase();

        if(recurseQueue(keyQueue, str) == -1){
            keyQueue.push(str)
            input.value = keyQueue.join("+");
        }
    }

    Shortcut.evKeyUp = function(e){
        keyQueue = [];
    }

    Shortcut.evFocusout = function(e){
        var input = this
        var shortcut = this.value;

        shortcut = trimShortcut(shortcut);

        if(validShortcut(shortcut)){
            storage.set({'shortcut':shortcut});
        }else{
            storage.set({'shortcut':Shortcut.defaultShortcut});
            input.value = Shortcut.defaultShortcut;
        }
    }

    Shortcut.evClick = function(e){
        this.select();
    }

    function Shortcut(el){
        this.el = el;
        this.init();
    }

    Shortcut.prototype.init = function(){
        this.el.addEventListener('keydown',Shortcut.evKeyDown);
        this.el.addEventListener('keyup',Shortcut.evKeyUp);
        this.el.addEventListener('click',Shortcut.evClick);
        this.el.addEventListener('blur',Shortcut.evFocusout);
    }

    window.TabbyShortcut = Shortcut;
})();
