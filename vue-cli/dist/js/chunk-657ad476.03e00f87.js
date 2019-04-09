(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-657ad476"],{"1f4c":function(t,a,e){"use strict";var i=function(){var t=this,a=t.$createElement,e=t._self._c||a;return e("transition",{attrs:{name:"dialog"}},[t.showDialog?e("div",{staticClass:"dialog-mask"},[e("div",{staticClass:"dialog-wrapper"},[e("div",{staticClass:"dialog-container",class:t.getContainerClass()},[e("div",{staticClass:"dialog-header d-flex"},[t._t("header",[t._v("default header")])],2),e("div",{staticClass:"dialog-body"},[t._t("body",[t._v("default body")])],2),e("div",{staticClass:"dialog-footer"},[t._t("footer",[e("div",{staticClass:"d-flex"},[e("button",{staticClass:"btn btn-secondary",on:{click:function(a){t.$emit("cancel")}}},[t._v("キャンセル")]),e("button",{staticClass:"btn btn-primary mr-0 ml-auto",on:{click:function(a){t.$emit("ok")}}},[t._t("ok",[t._v("OK")])],2)])])],2)])])]):t._e()])},s=[],n={name:"CommonDialog",data:function(){return{errors:[]}},props:["showDialog","classList"],methods:{getContainerClass:function(){if(null!=this.classList&&this.classList.length>0)return this.classList.join(" ")}}},o=n,l=(e("b9d8"),e("2877")),r=Object(l["a"])(o,i,s,!1,null,"5ad9875a",null);r.options.__file="CommonDialog.vue";a["a"]=r.exports},"5ba0":function(t,a,e){},"6fba":function(t,a,e){"use strict";var i=e("b416"),s=e.n(i);s.a},9340:function(t,a,e){},b416:function(t,a,e){},b9d8:function(t,a,e){"use strict";var i=e("9340"),s=e.n(i);s.a},bb51:function(t,a,e){"use strict";e.r(a);var i=function(){var t=this,a=t.$createElement,e=t._self._c||a;return e("section",{staticClass:"home"},[e("MainGrid")],1)},s=[],n=(e("7f7f"),e("cadf"),e("551c"),e("097d"),function(){var t=this,a=t.$createElement,e=t._self._c||a;return e("div",{staticClass:"container-fluid"},[e("div",{staticClass:"d-flex mb-2"},[e("router-link",{staticClass:"btn btn-primary mr-2",attrs:{to:"/register"}},[e("i",{staticClass:"fas fa-plus"})]),e("button",{staticClass:"btn btn-primary mr-2",on:{click:t.reload}},[e("i",{staticClass:"fas fa-sync-alt"})]),e("input",{staticClass:"form-control w-50",attrs:{placeholder:"検索キーワード"},on:{change:t.search}}),e("div",{staticClass:"ml-auto mr-0"},[e("button",{staticClass:"btn btn-primary",class:{disabled:!t.isEnable},on:{click:t.confirmScraping}},[e("i",{staticClass:"fas fa-swimmer"})])])],1),e("div",{attrs:{id:"table"}}),e("CrawlingDialog",{attrs:{showDialog:t.showCrawlingDialog},on:{cancel:t.closeCrawlingDialog,ok:t.doCrawling}},[e("div",{attrs:{slot:"header"},slot:"header"},[e("i",{staticClass:"fas fa-question-circle mr-2"}),t._v("即時クローリング確認")]),e("div",{attrs:{slot:"body"},domProps:{innerHTML:t._s(this.getDialogMessage())},slot:"body"}),e("span",{attrs:{slot:"ok"},slot:"ok"},[e("i",{staticClass:"fas fa-swimmer mr-2"}),t._v("OK")])]),e("TrashDialog",{attrs:{showDialog:t.showTrashDialog}},[e("div",{staticClass:"text-danger font-weight-bold",attrs:{slot:"header"},slot:"header"},[e("i",{staticClass:"fas fa-question-circle mr-2"}),t._v("シナリオ削除")]),e("div",{attrs:{slot:"body"},domProps:{innerHTML:t._s(this.getTrashDialogMessage())},slot:"body"}),e("div",{attrs:{slot:"footer"},slot:"footer"},[e("div",{staticClass:"d-flex"},[e("button",{staticClass:"btn btn-secondary",on:{click:t.closeTrashDialog}},[t._v("キャンセル")]),e("button",{staticClass:"btn btn-danger mr-0 ml-auto",staticStyle:{width:"6.5em !important"},on:{click:t.deleteScenario}},[e("i",{staticClass:"fas fa-trash mr-2"}),t._v("削除")])])])])],1)}),o=[],l=(e("a481"),e("1f4c")),r=e("bc3a"),c=e("39ab"),u={name:"ReviewGrid",components:{CrawlingDialog:l["a"],TrashDialog:l["a"]},data:function(){return{table:null,tableId:"table",tableData:null,grid:"This is grid",currentPage:1,paginationSize:20,activeClass:"active",showCrawlingDialog:!1,showTrashDialog:!1}},computed:{isEnable:function(){return this.table&&1===this.table.getSelectedData().length}},methods:{getTableData:function(){var t=this;r.get(this.$apiUrl+"/scenarios/",{params:{page:this.currentPage,size:this.paginationSize}}).then(function(a){if(200!==a.status)throw new Error("error");t.tableData=a.data,t.table.addData(a.data,!1)}).catch(function(t){console.log(t)})},search:function(t){var a={multiSearch:t.target.value};this.table.setData(this.$apiUrl+"/scenarios/",a)},reload:function(){this.table.setData()},confirmScraping:function(t){if(!this.isEnable)return console.error(t,this.table),0;var a=this.table.getSelectedData();1===a.length&&!0!==a[0].execute?(this.showCrawlingDialog=!0,console.log(this)):console.error(1),console.log(t,this.table.getSelectedData())},getDialogMessage:function(){if(!this.isEnable)return null;var t=this.table.getSelectedData().pop();return"シナリオ「".concat(t.name,"」\n").concat(t.url,"\nを現時点のサイトを取得し、差分評価をします").replace(/\n/g,"<br>")},getTrashDialogMessage:function(){if(!this.isEnable)return null;var t=this.table.getSelectedData().pop();return"シナリオ「".concat(t.name,"」\nを削除します。").replace(/\n/g,"<br>")},closeCrawlingDialog:function(){this.showCrawlingDialog=!1},closeTrashDialog:function(){this.showTrashDialog=!1},doCrawling:function(t){var a=this,e=this.table.getSelectedData();1===e.length&&(this.$lock("クロール中..."),r.post(this.$apiUrl+"/schedule/now",{id:e[0]._id}).then(function(t){if(console.log(t),200!==t.status)throw new Error("error");a.showCrawlingDialog=!1}).catch(function(t){return console.error(t)}).then(function(){return a.$unlock()}).then(function(){return a.reload()}))},deleteScenario:function(){var t=this,a=this.table.getSelectedData();if(1===a.length){this.$lock("削除中...");var e="".concat(this.$apiUrl,"/scenario/").concat(a[0]._id);r.delete(e).then(function(t){if(console.log(t),200!==t.status)throw new Error("error")}).catch(function(t){return console.error(t)}).then(function(){setTimeout(function(){t.showTrashDialog=!1},1e3),setTimeout(function(){return t.reload()},1e3),setTimeout(function(){return t.$unlock()},1500)})}}},mounted:function(){var t=this;this.table=new c("#"+this.tableId,{height:"75vh",layout:"fitColumns",placeholder:"No Data Set",columns:[{title:"ID",field:"_id",width:250,visible:!1},{formatter:function(){return'<i class="fas fa-edit"></i>'},width:40,align:"center",cellClick:function(a,e){var i=e._cell.row.data._id;t.$router.push({path:"/review/".concat(i)})}},{title:"シナリオ名",field:"name",width:400},{title:"次回予定日",field:"date",width:110,formatter:function(t){return!0===t._cell.row.data.execute?'<i class="fas fa-swimmer mr-2"></i>クロール中':t.getValue().substring(0,10)}},{title:"DIR",field:"dir",width:150},{title:"URL",field:"url"},{title:"exe",field:"execute",visible:!1},{formatter:function(){return'<i class="fas fa-trash"></i>'},width:40,align:"center",cellClick:function(a,e){t.showTrashDialog=!0}}],rowClick:function(a,e){t.table.deselectRow(),e.select()},rowDblClick:function(a,e){var i=e._row.data._id;t.$router.push({path:"/review/".concat(i)})},rowFormatter:function(t){var a=t.getData();null!=a&&null!=a.execute&&!0===a.execute&&t.getElement().classList.add("executing")},ajaxURL:"".concat(this.$apiUrl,"/scenarios"),ajaxProgressiveLoad:"scroll",ajaxProgressiveLoadDelay:200,ajaxParams:null,paginationSize:10})}},d=u,h=(e("4c27"),e("dae1"),e("6fba"),e("2877")),f=Object(h["a"])(d,n,o,!1,null,"11c7e962",null);f.options.__file="ReviewGrid.vue";var g=f.exports,b={name:"Home",components:{MainGrid:g},mounted:function(){var t=this.$router.options.routes[0];this.$emit("breadcrumbs",[{text:t.name,href:t.path}])}},m=b,v=Object(h["a"])(m,i,s,!1,null,null,null);v.options.__file="Home.vue";a["default"]=v.exports},dae1:function(t,a,e){"use strict";var i=e("5ba0"),s=e.n(i);s.a}}]);
//# sourceMappingURL=chunk-657ad476.03e00f87.js.map