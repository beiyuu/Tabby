$(function(){
    var TABBY_NAME = 'Tabby';
    var TABBY_ID_NAME = 'TabbyID'

    function initID(callback){
        this.TabbyID = '';
        this.callback = callback || function(){}
    }

    initID.prototype.init = function(){
        this.TabbyID = localStorage.getItem(TABBY_ID_NAME);

        if(!this.TabbyID){
            this.findTabby();
            return;
        }

        this.IDSearched();
    }

    initID.prototype.findTabby = function(){
        var that = this;
        var id = ''
        function walkTree(treeNode){
            if(!id){
                for (var c in treeNode.children){
                    child = treeNode.children[c];
                    if(child.title === TABBY_NAME){
                        id = child.id
                        that.TabbyID = id;
                        localStorage.setItem(TABBY_ID_NAME,id);

                        return;
                    }

                    if(child.children){
                        walkTree(child)
                    }
                }
            }
        }

        chrome.bookmarks.getTree(function(all){
            walkTree(all[0]);
            that.IDSearched();
        })
    }

    initID.prototype.IDSearched = function(){
        if(!this.TabbyID){
            this.createTree();
        }else{
            this.callback();
        }
    }

    initID.prototype.createTree = function(){
        var that = this;
        chrome.bookmarks.create({title:TABBY_NAME},function(res){
            localStorage.setItem(TABBY_ID_NAME,res.id);
            that.TabbyID = res.id;
            that.callback();
        });
    }

    window.initID = initID;
});
