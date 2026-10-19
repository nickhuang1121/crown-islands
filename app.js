const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let type = '', limit = 12, selectedCard = null;
const featured = ['010','040','070','090','098','100'];
const sorted = [...CARDS].sort((a,b) => (featured.indexOf(a.id) < 0 ? 999 : featured.indexOf(a.id)) - (featured.indexOf(b.id) < 0 ? 999 : featured.indexOf(b.id)));
function artPath(c) { return c.id === '221' ? 'branding/launch-art.webp' : `art/${c.id}.webp`; }
function render() {
  if (!messages) return;
  const q = $('#search').value.trim().toLocaleLowerCase();
  const list = sorted.map(localizedCard).filter(c => (!type || c.type_id === type) && (!q || (c.name+' '+c.effect).toLocaleLowerCase().includes(q)));
  $('#count').textContent = t('cardCount',{total:list.length,shown:Math.min(limit,list.length)});
  $('#card-grid').innerHTML = list.slice(0,limit).map(c => `<button class="card" data-id="${c.id}" aria-label="${esc(t('viewCard',{name:c.name}))}"><span class="card-art"><img src="${artPath(c)}" alt="${esc(c.name)}" loading="lazy"><span class="cost">${c.cost}</span></span><h3>${esc(c.name)}</h3><small>${esc(messages.rarity[c.rarity_id])} / ${esc(messages.types[c.type_id])}${c.id==='221'?' · '+esc(t('pendingArt')):''}</small><p>${esc(c.effect)}</p></button>`).join('') || `<p>${esc(t('empty'))}</p>`;
  $('#more').hidden = list.length <= limit;
}
$('.tabs').addEventListener('click', e => {
  const b=e.target.closest('button'); if(!b) return;
  type=b.dataset.type; limit=12;
  document.querySelectorAll('.tabs button').forEach(x=>x.classList.toggle('active',x===b)); render();
});
$('#search').addEventListener('input',()=>{limit=12;render()});
$('#more').onclick=()=>{limit+=24;render()};
function showCard(id) {
  if (!messages) return;
  const c=localizedCard(CARDS.find(c=>c.id===id)); selectedCard=id;
  $('#detail-content').innerHTML=`<div><img src="${artPath(c)}" alt="${esc(t('webArt',{name:c.name}))}"><a class="button" target="_blank" rel="noopener" href="${artPath(c)}">${esc(t('openArt'))}</a></div><div><p class="eyebrow">${esc(t('archive'))} / ${c.id}${c.id==='221'?' · '+esc(t('pendingArt')):''}</p><h2>${esc(c.name)}</h2><p>${esc(messages.rarity[c.rarity_id])} · ${esc(messages.types[c.type_id])}</p><div class="stats"><span>${esc(t('cost',{value:c.cost}))}</span><span>${esc(t('sacrifice',{value:c.sacrifice_points}))}</span><span>${esc(c.type_id==='monster'?t('stats',c):t('nonUnit'))}</span><span>${esc(t('limit',{value:c.deck_limit}))}</span></div><p class="effect">${esc(c.effect)}</p><p class="flavor">${esc(c.flavor)}</p></div>`;
  if(!$('#detail').open) $('#detail').showModal();
}
$('#card-grid').onclick=e=>{const b=e.target.closest('[data-id]');if(b)showCard(b.dataset.id)};
$('.close').onclick=()=>$('#detail').close();
$('#detail').onclick=e=>{if(e.target===$('#detail'))$('#detail').close()};
$('#tracks').innerHTML=TRACKS.map((name,i)=>`<button class="track" data-src="music/${esc(name)}"><span>${String(i+1).padStart(2,'0')}</span><span>${esc(name.replace('.mp3',''))}</span><span>▷</span></button>`).join('');
const player=$('#player');let current;
function playbackLabel(){if(!messages)return;$('#now-playing').textContent=!current?t('ready'):player.paused?t('paused'):t('playing',{name:decodeURIComponent(player.src.split('/').pop()).replace('.mp3','')})}
document.querySelectorAll('.track').forEach(b=>b.onclick=async()=>{
  if(current===b&&!player.paused){player.pause();return}
  if(current!==b){player.src=b.dataset.src;current=b}
  try{await player.play()}catch{if(messages)$('#now-playing').textContent=t('playError')}
});
player.onplay=()=>{document.querySelectorAll('.track').forEach(b=>b.classList.toggle('playing',b===current));playbackLabel()};
player.onpause=()=>{document.querySelectorAll('.track').forEach(b=>b.classList.remove('playing'));playbackLabel()};
player.onended=playbackLabel;
document.addEventListener('localechange',()=>{render();playbackLabel();if($('#detail').open&&selectedCard)showCard(selectedCard)});
