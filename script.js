(function(){
  const menu=document.querySelector('.menu-button');
  const nav=document.getElementById('site-nav');
  const setMenuOpen=(open)=>{
    document.body.classList.toggle('menu-open',open);
    document.documentElement.classList.toggle('menu-open',open);
    menu?.setAttribute('aria-expanded',String(open));
  };
  menu?.addEventListener('click',()=>setMenuOpen(!document.documentElement.classList.contains('menu-open')));
  nav?.addEventListener('click',event=>{if(event.target.closest('a'))setMenuOpen(false)});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.documentElement.classList.contains('menu-open')){setMenuOpen(false);menu?.focus()}});

  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals=document.querySelectorAll('[data-reveal]');
  const process=document.querySelector('[data-process]');
  if(!('IntersectionObserver' in window)||reduced){reveals.forEach(el=>el.classList.add('visible'));process?.classList.add('visible')}else{
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.14});
    reveals.forEach((el,i)=>{el.style.transitionDelay=`${Math.min(i%3,2)*90}ms`;observer.observe(el)});if(process)observer.observe(process);
  }
  if(!reduced){
    const card=document.querySelector('[data-parallax]');
    card?.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(900px) rotateY(${x*5}deg) rotateX(${-y*5}deg) translateY(-2px)`});
    card?.addEventListener('pointerleave',()=>card.style.transform='');
  }
  const params=new URLSearchParams(location.search);const reason=params.get('reason');
  if(reason){document.querySelectorAll('[data-reason]').forEach(a=>a.classList.toggle('selected',a.dataset.reason===reason));}
})();
