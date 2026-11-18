"""Vérifications structurelles HTML, références et ressources locales. Pas test visuel."""
import json, re, sys
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
ROOT=Path(__file__).resolve().parent
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__();self.ids=[];self.refs=[];self.resources=[];self.records=[];self.record=None;self.h1=0;self.lang=None;self.script_text='';self.in_script=False;self.forms=[];self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if tag=='html':self.lang=a.get('lang')
  if tag=='h1':self.h1+=1
  if tag=='a' and 'href' in a:self.refs.append(a['href'])
  if tag in ['script','img','iframe','link']:
   u=a.get('src',a.get('href'))
   if u:self.resources.append(u)
  if tag=='script':self.in_script=True
  if tag=='form':self.forms.append(a)
  if tag=='article' and 'record' in a.get('class','').split():
   self.record={'id':a['id'],'group':a.get('data-group',''),'text':''};self.records.append(self.record)
 def handle_endtag(self,tag):
  if tag=='article':self.record=None
  if tag=='script':self.in_script=False
 def handle_data(self,text):
  if self.record:self.record['text']+=text+' '
  if self.in_script:self.script_text+=text
pages={p.name:Page(p.read_text()) for p in (ROOT/'html').glob('*.html')}
assert len(pages)==7
links=0;anchors=0
for name,p in pages.items():
 assert p.h1==1,(name,'h1',p.h1)
 assert p.lang=='fr'
 assert len(set(p.ids))==len(p.ids),(name,'duplicate ID')
 assert not p.script_text.strip(),(name,'inline script')
 for u in p.resources:
  assert not urlsplit(u).scheme and not u.startswith('//'),(name,'remote resource',u)
 for u in p.refs+p.resources:
  parsed=urlsplit(u)
  if parsed.scheme:
   assert parsed.scheme=='https',(name,u)
   continue
  dest=(ROOT/'html'/unquote(parsed.path)).resolve() if parsed.path else ROOT/'html'/name
  assert dest.exists(),(name,u,'missing file')
  assert dest.is_relative_to(ROOT),(name,u,'outside folder')
  links+=1
  if parsed.fragment and dest.suffix=='.html':
   assert unquote(parsed.fragment) in pages[dest.name].ids,(name,u,'missing anchor');anchors+=1
 for f in p.forms: assert not f.get('action'),(name,'active form')
 for target in pages:
  assert target in p.refs,(name,'missing nav',target)
for name,n in [('niches.html',6),('entreprises.html',17),('investisseurs.html',12),('parcours.html',12),('sources.html',124)]:assert len(pages[name].records)==n,(name,len(pages[name].records))
# The two route cards are intentionally outside the actor-filter record container.
js='\n'.join(p.read_text() for p in (ROOT/'html/assets').glob('*.js'))
assert not re.search(r'\b(fetch|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage)\s*[.(]',js)
css=(ROOT/'html/assets/style.css').read_text();assert '@media print' in css and '@media(max-width:700px)' in css and ':focus-visible' in css
if '--fixtures' in sys.argv:
 print(json.dumps({n:[r for r in p.records if not r['id'].startswith('V0')] for n,p in pages.items()},ensure_ascii=False));sys.exit()
proof={'as_of':'2026-11-18','passed':True,'pages':len(pages),'local_links_and_resources_checked':links,'source_and_local_anchors_checked':anchors,'offline_resource_structure':True,'no_active_remote_form':True,'responsive_print_focus_styles_present':True,'no_javascript_content':'Toutes les fiches et textes utiles sont statiques ; contrôle de présence, pas rendu navigateur','visual_browser_check':False,'keyboard_mobile_print_browser_check':False,'external_urls':'Provenances historiques conservées ; aucune disponibilité externe reconfirmée à J8'}
(ROOT/'preuves/j8-html.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n');print(json.dumps(proof,ensure_ascii=False))
