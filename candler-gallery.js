(function(){
  /* ── Topic display labels ──────────────────────────────
     Maps data-topic slug → human-readable label for modal.
     Update here whenever filter categories change.
  ─────────────────────────────────────────────────────── */
  const TOPIC_LABELS={
    'scholar-unscripted':'Scholar Unscripted',
    'book-discussions':  'Book Discussions',
    'thematic':          'Thematic',
    'theology':          'Theology',
    'vocation':          'Vocation',
  };

  /* ── Filtering & Search ── */
  const cards=Array.from(document.querySelectorAll('.video-card'));
  const filterBtns=document.querySelectorAll('.filter-btn');
  const searchInput=document.getElementById('searchInput');
  const sortSelect=document.getElementById('sortSelect');
  const resultCount=document.getElementById('resultCount');
  const emptyState=document.getElementById('emptyState');
  let activeFilter='all',searchTerm='',sortOrder='newest';

  function applyFilters(){
    let visible=[];
    cards.forEach(card=>{
      const topic=card.dataset.topic||'';
      const title=(card.dataset.title||'').toLowerCase();
      const speaker=(card.dataset.speaker||'').toLowerCase();
      const matchTopic=activeFilter==='all'||topic===activeFilter;
      const matchSearch=!searchTerm||title.includes(searchTerm)||speaker.includes(searchTerm);
      if(matchTopic&&matchSearch){card.classList.remove('hidden');visible.push(card);}
      else card.classList.add('hidden');
    });
    const grid=document.getElementById('videoGrid');
    visible.sort((a,b)=>{
      if(sortOrder==='newest')return new Date(b.dataset.date)-new Date(a.dataset.date);
      if(sortOrder==='oldest')return new Date(a.dataset.date)-new Date(b.dataset.date);
      if(sortOrder==='az')return(a.dataset.title||'').localeCompare(b.dataset.title||'');
    });
    visible.forEach(c=>grid.appendChild(c));
    resultCount.textContent=visible.length;
    emptyState.classList.toggle('visible',visible.length===0);
  }

  filterBtns.forEach(btn=>{
    btn.addEventListener('click',()=>{
      filterBtns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter=btn.dataset.filter;
      applyFilters();
    });
  });
  searchInput.addEventListener('input',()=>{searchTerm=searchInput.value.toLowerCase().trim();applyFilters();});
  sortSelect.addEventListener('change',()=>{sortOrder=sortSelect.value;applyFilters();});
  applyFilters();

  /* ── Modal ── */
  const overlay=document.getElementById('modalOverlay');
  const backdrop=document.getElementById('modalBackdrop');
  const closeBtn=document.getElementById('modalClose');
  const thumb=document.getElementById('modalThumb');
  const playBtn=document.getElementById('modalPlayBtn');
  const iframeWrap=document.getElementById('modalIframeWrap');
  const iframe=document.getElementById('modalIframe');
  const topicTag=document.getElementById('modalTopicTag');
  const videoTitle=document.getElementById('modalVideoTitle');
  const initials=document.getElementById('modalInitials');
  const speakerName=document.getElementById('modalSpeakerName');
  const speakerRole=document.getElementById('modalSpeakerRole');
  const seriesEl=document.getElementById('modalSeries');
  const durationEl=document.getElementById('modalDuration');
  const dateEl=document.getElementById('modalDate');
  const bioText=document.getElementById('modalBioText');
  const themesEl=document.getElementById('modalThemes');
  const watchBtn=document.getElementById('modalWatchBtn');
  const guideBtn=document.getElementById('modalGuideBtn');
  let currentVideoUrl='';

  function getInitials(name){
    return name.split(' ').filter(p=>p.length>1&&!['Dr.','Rev.','Prof.'].includes(p)).slice(0,2).map(p=>p[0]).join('');
  }

  function openModal(card){
    const d=card.dataset;
    iframeWrap.classList.remove('active');
    iframe.src='';
    thumb.style.opacity='0.55';
    playBtn.style.display='flex';
    currentVideoUrl=d.videoUrl||'';
    thumb.src=d.thumb||'';
    thumb.alt=d.title||'';
    topicTag.textContent=TOPIC_LABELS[d.topic]||d.topic||'';
    videoTitle.textContent=d.title||'';
    initials.textContent=getInitials(d.speaker||'');
    speakerName.textContent=d.speaker||'';
    speakerRole.textContent=d.role||'';
    seriesEl.textContent=d.series||'';
    durationEl.textContent=d.duration||'';
    dateEl.textContent=d.dateDisplay||'';
    bioText.textContent=d.bio||'';
    themesEl.innerHTML='';
    (d.themes||'').split(',').filter(Boolean).forEach(theme=>{
      const tag=document.createElement('span');
      tag.className='modal-highlight-tag';
      tag.textContent=theme.trim();
      themesEl.appendChild(tag);
    });
    guideBtn.style.display=d.hasGuide==='true'?'inline-flex':'none';
    overlay.classList.add('open');
    document.body.style.overflow='hidden';
    setTimeout(()=>closeBtn.focus(),100);
  }

  function closeModal(){
    overlay.classList.remove('open');
    document.body.style.overflow='';
    setTimeout(()=>{iframe.src='';iframeWrap.classList.remove('active');playBtn.style.display='flex';thumb.style.opacity='0.55';},350);
  }

  playBtn.addEventListener('click',()=>{
    if(!currentVideoUrl)return;
    iframe.src=currentVideoUrl;
    iframeWrap.classList.add('active');
    thumb.style.opacity='0';
    playBtn.style.display='none';
  });
  watchBtn.addEventListener('click',()=>playBtn.click());
  closeBtn.addEventListener('click',closeModal);
  backdrop.addEventListener('click',closeModal);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('open'))closeModal();});

  cards.forEach(card=>{
    card.addEventListener('click',e=>{
      if(e.target.closest('.card-guide-btn')||e.target.closest('.card-watch'))return;
      openModal(card);
    });
    card.setAttribute('tabindex','0');
    card.setAttribute('role','button');
    card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openModal(card);}});
  });
})();
