(function(){
  const menu=document.querySelector('.menu-button');
  const nav=document.getElementById('site-nav');
  menu?.addEventListener('click',()=>{const open=document.body.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(open))});
  nav?.addEventListener('click',()=>{document.body.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false')});

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
