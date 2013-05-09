/**
 *
 * <input type="text" id="galdic-box" />
 * <script type="text/javascript" src="galdic.js"></script>
 * <script type="text/javascript">
 * $('#galdic-box').galdic();
 * </script>
 *
 */

(function($){
  $.extend($.fn, {
    galdic: function(options) {
        var opts = $.extend({}, $.fn.galdic.defaults, options);
        $this = $(this);
        opts.elem = $this;
        
        // Singleton
        if($.fn.galdic.__instance__ == null) {
            $.fn.galdic.__instance__ = new GalDicKlass(opts);
        }                
        
        return $.fn.galdic.__instance__;
    },
    
    proxy: function(fun, context) {
        if ($.isFunction(fun)) {
          return function() { fun.apply(context, arguments); };
        } else {
          var name = context;
          context = fun;
          fun = context[name];
          if ($.isFunction(fun)) {
            return $.proxy(fun, context);
          }
        }
    }
    
  });
  
  $.extend($.fn.galdic, {
    defaults: {
        url:  'http://galdic.vifito.eu/index/xsearch/q/',
        elem: null
    },
    
    __instance__: null,
    
    getInstance: function() {
        return $.fn.galdic.__instance__;
    }
  });
    
})(Zepto);

// Class GalDicKlass 
GalDicKlass = function(options) {
    this.options = options;
    this.elem    = options.elem;
    this.rsDiv   = null;
    
    this.init();
};

GalDicKlass.prototype = {
    
    init: function() {
        // Default properties
        /*this.elem.val('Buscar en GalDic...');*/
        this.elem.attr('title', 'Escriba o termo e prema enter ↵');
        this.elem.attr('maxlength', '40');
        
        // Event to search
        this.elem.keypress($.proxy(this, "onKeypress"));
        
        // Event focus
        this.elem.focus($.proxy(this, "onFocus"));
        
        // Enhance CSS
        this.enhanceCSS();
        
        // Div results container
        this.elem.parent().append('<div class="galdic-results"> </div>');
        this.rsDiv = this.elem.parent().find('div.galdic-results').css({
            'display': '',
            'padding': '0.8em'
        });
        
        //this.elem.parent().append('<div class="galdic-powered"><a href="http://galdic.vifito.eu/" title="Dicionario de galego - GalDic">&raquo; powered by GalDic</a></div>');
        //this.elem.parent().find('div.galdic-powered').css({
        //    'text-align': 'right',
        //    'padding-right': '0.8em'
        //});

        $('#galdic-button').click($.proxy(this, "search"));
    },
    
    enhanceCSS: function() {
        this.elem.css({
            'padding': '0.2em',
            'border': '1px solid #ccc',
            'color': '#666',
            'border-radius': '6px',
        });
    },
    
    submit: function(value) {
        var url = this.options.url + encodeURIComponent(value);
        this.searchMsg(value);
        
        $.ajax({
            'url': url,
            'success': $.proxy(this, "onSuccess"),
            'dataType': "jsonp"
        });
    },
    
    searchMsg: function(value) {
        this.rsDiv.html("Procurando <strong>" + value + "</strong>...");
    },
    
    onSuccess: function(data) {
        this.renderResult(data);
    },
    
    onKeypress: function(event) {
        if (event.keyCode == '13') {
            event.preventDefault();
            
            this.search();
        }
    },

    search: function() {
        var term = this.elem.val();
        if( term.length > 2 ) {
          this.submit(term);
        } else {
          this.rsDiv.html("");
        }
    },
    
    onFocus: function() {
        this.elem.val('');
    },
    
    renderResult: function(data) {
        /* this.rsDiv.css({'display': 'none'}); */
        
        if(data['name'] != undefined) {
            var output = '';
            
            for(var i=0; i<data.definitions.length; i++) {
                if(data.definitions.length > 1) {
                    output += '<strong>' + (i+1) + '.</strong> ' + data.definitions[i].content + ' ';
                } else {
                    output += data.definitions[i].content + ' ';
                }                
            }
            
            this.rsDiv.html(output);
        } else {
            this.rsDiv.html('<strong>Non se atoparon entradas relacionadas.</strong>');
        }
        
        /* this.rsDiv.slideDown('slow', $.proxy(this, "onRenderComplete")); */
    },    
    
    onRenderComplete: function() {
        // Nada
    }
    
};