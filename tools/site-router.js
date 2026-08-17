/* Vizit single-file site router.
   Lives inline inside vizit-site.html. Each route's full HTML document is stored in
   the #__site JSON payload; the router expands @@CSS:file@@ / @@JS:file@@ tokens with
   the shared stylesheet/script text (stored once) and renders it into the iframe.
   Route URLs look like #/vizit-api, #/solutions/hero-images, #/blog-article?slug=x#anchor */
(function(){
  var SITE=JSON.parse(document.getElementById('__site').textContent);
  var view=document.getElementById('view'), splash=document.getElementById('splash');
  var pendingHash='', current='', currentSearch='';
  function clean(p){ p=String(p||'').replace(/^\/+/,'').replace(/[?#].*$/,'').replace(/\.html$/,'').replace(/\/+$/,''); return p||'index'; }
  function resolve(p){ var seen=0; while(SITE.routes[p]&&SITE.routes[p].alias&&seen++<5){ p=SITE.routes[p].alias; } return p; }
  function parse(){
    var h=location.hash;
    if(h.indexOf('#/')===0){
      var parts=h.slice(2).split('#');
      var q=parts[0].indexOf('?');
      return {path:clean(parts[0]), search:q>-1?parts[0].slice(q):'', hash:parts[1]||''};
    }
    var c=clean(location.pathname);
    var q=location.search||'';
    return {path:SITE.routes[c]?c:SITE.home, search:/(^|[?&])(slug|filter)=/.test(q)?q:'', hash:h.slice(1)};
  }
  function expand(doc,search){
    var seen={};
    doc=doc.replace(/@@(CSS|JS):([^@]+)@@/g,function(m,kind,key){
      if(kind==='JS'){ if(seen['j'+key]) return ''; seen['j'+key]=1; return '<scr'+'ipt>'+(SITE.js[key]||'')+'<\/scr'+'ipt>'; }
      if(seen['c'+key]) return ''; seen['c'+key]=1;
      return '<sty'+'le>'+(SITE.css[key]||'')+'</sty'+'le>';
    });
    var boot='<scr'+'ipt>window.__vzSearch='+JSON.stringify(search||'')+';try{window.__resources=window.parent.__vzRes||{};}catch(e){}<\/scr'+'ipt>';
    var baseHref=/\.html$/i.test(location.pathname)?location.href.replace(/[?#].*$/,'').replace(/[^\/]*$/,''):location.origin+'/';
    var base='<base href="'+baseHref+'">';
    return doc.replace(/<head([^>]*)>/i,function(m){ return m+base+boot; });
  }
  function scrollToId(d,id){
    if(!d||!id) return;
    var el=d.getElementById(id)||d.querySelector('[name="'+id+'"]');
    if(!el) return;
    var w=d.defaultView, y=el.getBoundingClientRect().top+(w.scrollY||w.pageYOffset||0)-80;
    w.scrollTo(0,y<0?0:y);
  }
  function routeFor(rawHref){
    var u; try{ u=new URL(rawHref,location.href); }catch(err){ return null; }
    if(u.origin!==location.origin) return null;
    var dir=location.pathname.replace(/[^\/]*$/,'');
    var last=u.pathname.split('/').pop();
    var here=current.indexOf('/')>-1?current.replace(/[^\/]*$/,''):'';
    var cands=[u.pathname.indexOf(dir)===0?u.pathname.slice(dir.length):u.pathname, u.pathname.split('/').slice(-2).join('/'), last, here+last];
    for(var i=0;i<cands.length;i++){ var p=resolve(clean(cands[i])); if(SITE.routes[p]) return {path:p,search:u.search,hash:u.hash.slice(1)}; }
    return null;
  }
  function wire(){
    var d=view.contentDocument; if(!d) return;
    // Any page that navigates itself out of the shell (legacy redirect stubs, scripted
    // location changes) lands back on a route instead of loading a nested copy.
    var frameUrl=''; try{ frameUrl=view.contentWindow.location.href; }catch(e){}
    if(frameUrl && frameUrl!=='about:srcdoc'){
      var esc=routeFor(frameUrl);
      if(esc){ go(esc.path,esc.hash,esc.search); return; }
      render(current||SITE.home,currentSearch); return;
    }
    d.addEventListener('click',function(e){
      var t=e.target;
      var a=t.closest && t.closest('a[href]');
      var card=!a && t.closest ? t.closest('[data-href]') : null;
      var href=a?a.getAttribute('href'):(card?card.getAttribute('data-href'):null);
      if(!href||/^(mailto:|tel:|javascript:)/i.test(href)) return;
      if(href.charAt(0)==='#'){
        var id=href.slice(1);
        if(!id) return;
        e.preventDefault(); scrollToId(d,id);
        history.replaceState(null,'','#/'+current+currentSearch+'#'+id);
        return;
      }
      var r=routeFor(href);
      if(r){ e.preventDefault(); e.stopPropagation(); go(r.path,r.hash,r.search); return; }
      if(a && a.getAttribute('target')!=='_blank'){
        var u; try{ u=new URL(href,location.href); }catch(err){ return; }
        if(u.origin!==location.origin){ a.setAttribute('target','_blank'); a.setAttribute('rel','noopener'); }
      }
    },true);
    scrollToId(d,pendingHash); pendingHash='';
    if(splash) splash.classList.add('gone');
  }
  function render(path,search){
    current=path; currentSearch=search||'';
    var r=SITE.routes[path]||SITE.routes[SITE.home];
    document.title=r.title;
    view.srcdoc=expand(r.doc,currentSearch);
  }
  function go(path,hash,search){
    path=resolve(path); search=search||'';
    pendingHash=hash||'';
    var target='#/'+path+search+(hash?'#'+hash:'');
    if(location.hash!==target){
      var same=(path===current && search===currentSearch);
      location.hash=target;
      if(same){ scrollToId(view.contentDocument,pendingHash); pendingHash=''; }
    } else if(path!==current || search!==currentSearch){ render(path,search); }
    else { scrollToId(view.contentDocument,pendingHash); pendingHash=''; }
  }
  view.addEventListener('load',wire);
  window.addEventListener('hashchange',function(){
    var s=parse(); s.path=resolve(s.path);
    if(s.path!==current || s.search!==currentSearch){ pendingHash=s.hash; render(s.path,s.search); }
    else { scrollToId(view.contentDocument,s.hash); }
  });
  var start=parse(); start.path=resolve(SITE.routes[start.path]?start.path:SITE.home);
  pendingHash=start.hash;
  if(!location.hash) history.replaceState(null,'','#/'+start.path+(start.search||''));
  render(start.path,start.search);
})();
