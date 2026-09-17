/* ============================================================
 * Aurelia Grand Hotel — Core JavaScript
 * Handles: auth, rooms, booking, complaints, admin,
 * slider, reviews, counters, theme, chat, music, notifs, etc.
 * ============================================================ */

/* ---------- Storage helpers ---------- */
const DB = {
  get:(k,d=[])=>JSON.parse(localStorage.getItem(k)||JSON.stringify(d)),
  set:(k,v)=>localStorage.setItem(k,JSON.stringify(v)),
};

/* ---------- Notifications ---------- */
function notify(msg, type='info'){
  let host = document.getElementById('notifs');
  if(!host){host=document.createElement('div');host.id='notifs';document.body.appendChild(host);}
  const n=document.createElement('div');
  n.className=`notif ${type}`;
  n.innerHTML=`<strong>${type==='success'?'✓':type==='error'?'⚠':'ℹ'}</strong> ${msg}`;
  host.appendChild(n);
  setTimeout(()=>{n.style.opacity='0';n.style.transform='translateX(120%)';setTimeout(()=>n.remove(),400);},3500);
}

/* ---------- Theme ---------- */
function initTheme(){
  const saved=localStorage.getItem('theme')||'light';
  document.documentElement.setAttribute('data-theme',saved);
  const btn=document.getElementById('themeBtn');
  if(btn){
    btn.textContent= saved==='dark'?'☀️':'🌙';
    btn.onclick=()=>{
      const cur=document.documentElement.getAttribute('data-theme');
      const next=cur==='dark'?'light':'dark';
      document.documentElement.setAttribute('data-theme',next);
      localStorage.setItem('theme',next);
      btn.textContent=next==='dark'?'☀️':'🌙';
    };
  }
}

/* ---------- Loader ---------- */
window.addEventListener('load',()=>{
  const l=document.getElementById('loader');
  if(l) setTimeout(()=>l.classList.add('hide'),500);
});

/* ---------- Mobile menu ---------- */
function initMenu(){
  const t=document.getElementById('menuToggle');
  const l=document.getElementById('navLinks');
  if(t&&l) t.onclick=()=>l.classList.toggle('open');
}

/* ---------- Scroll reveal ---------- */
function initReveal(){
  const els=document.querySelectorAll('.reveal');
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.12});
  els.forEach(e=>io.observe(e));
}

/* ---------- Back-to-top ---------- */
function initBackTop(){
  const b=document.getElementById('backTop');
  if(!b) return;
  window.addEventListener('scroll',()=>b.classList.toggle('show',window.scrollY>500));
  b.onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
}

/* ---------- Counters ---------- */
function initCounters(){
  const els=document.querySelectorAll('[data-count]');
  if(!els.length) return;
  const animate=el=>{
    const target=+el.dataset.count, dur=1800, start=performance.now();
    const tick=now=>{
      const p=Math.min((now-start)/dur,1);
      el.textContent=Math.floor(target*(1-Math.pow(1-p,3))).toLocaleString();
      if(p<1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){animate(e.target);io.unobserve(e.target);}}),{threshold:.5});
  els.forEach(e=>io.observe(e));
}

/* ---------- Hero slider ---------- */
function initSlider(){
  const wrap=document.querySelector('.slider'); if(!wrap) return;
  const slides=wrap.querySelector('.slides');
  const items=slides.children;
  const dotsEl=wrap.querySelector('.dots');
  let i=0;
  for(let k=0;k<items.length;k++){
    const d=document.createElement('button');
    d.className='dot'+(k===0?' active':''); d.onclick=()=>go(k);
    dotsEl.appendChild(d);
  }
  const go=n=>{
    i=(n+items.length)%items.length;
    slides.style.transform=`translateX(-${i*100}%)`;
    [...dotsEl.children].forEach((d,k)=>d.classList.toggle('active',k===i));
  };
  wrap.querySelector('.prev').onclick=()=>go(i-1);
  wrap.querySelector('.next').onclick=()=>go(i+1);
  setInterval(()=>go(i+1),5500);
}

/* ---------- Reviews carousel ---------- */
function initReviews(){
  const reviews=document.querySelectorAll('.review'); if(!reviews.length) return;
  let i=0;
  setInterval(()=>{
    reviews[i].classList.remove('active');
    i=(i+1)%reviews.length;
    reviews[i].classList.add('active');
  },4500);
}

/* ---------- Auth ---------- */
function currentUser(){return DB.get('au_user',null);}
function setUser(u){localStorage.setItem('au_user',JSON.stringify(u));}
function logout(){localStorage.removeItem('au_user');location.href='index.html';}

function initRegister(){
  const f=document.getElementById('registerForm'); if(!f) return;
  f.onsubmit=e=>{
    e.preventDefault();
    const fields=['name','email','password','phone'];
    let ok=true;
    fields.forEach(n=>{
      const w=f.querySelector(`[data-field="${n}"]`);
      const inp=w.querySelector('input');
      const v=inp.value.trim();
      let valid=v.length>1;
      if(n==='email') valid=/^\S+@\S+\.\S+$/.test(v);
      if(n==='password') valid=v.length>=6;
      if(n==='phone') valid=/^\+?\d{7,}$/.test(v);
      w.classList.toggle('invalid',!valid);
      if(!valid) ok=false;
    });
    if(!ok){notify('Please fix the errors','error');return;}
    const users=DB.get('au_users',[]);
    const email=f.email.value.trim();
    if(users.find(u=>u.email===email)){notify('Email already registered','error');return;}
    const user={name:f.name.value.trim(),email,password:f.password.value,phone:f.phone.value};
    users.push(user); DB.set('au_users',users); setUser(user);
    notify('Welcome to Aurelia!','success');
    setTimeout(()=>location.href='rooms.html',900);
  };
}

function initLogin(){
  const f=document.getElementById('loginForm'); if(!f) return;
  f.onsubmit=e=>{
    e.preventDefault();
    const email=f.email.value.trim(), pw=f.password.value;
    const user=DB.get('au_users',[]).find(u=>u.email===email&&u.password===pw);
    if(!user){notify('Invalid credentials','error');return;}
    setUser(user); notify('Logged in!','success');
    setTimeout(()=>location.href='rooms.html',700);
  };
}

function initAdminLogin(){
  const f=document.getElementById('adminForm'); if(!f) return;
  f.onsubmit=e=>{
    e.preventDefault();
    if(f.username.value==='admin'&&f.password.value==='admin'){
      sessionStorage.setItem('au_admin','1');
      notify('Admin login OK','success');
      setTimeout(()=>location.href='admin-dashboard.html',600);
    } else notify('Wrong admin credentials','error');
  };
}

function updateAuthUI(){
  const u=currentUser();
  const slot=document.getElementById('authSlot');
  if(!slot) return;
  slot.innerHTML = u
    ? `<span style="font-size:.88rem;color:var(--muted)">Hi, ${u.name.split(' ')[0]}</span>
       <button class="btn btn-ghost" onclick="logout()">Logout</button>`
    : `<a href="login.html" class="btn btn-ghost">Login</a>
       <a href="register.html" class="btn btn-primary">Sign up</a>`;
}

/* ---------- Rooms data ---------- */
const ROOMS=[
  {id:1,name:'Royal Suite',price:520,beds:2,type:'suite',img:'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',f:['WiFi','AC','TV','Balcony','Room service']},
  {id:2,name:'Deluxe Ocean',price:340,beds:1,type:'deluxe',img:'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',f:['WiFi','AC','TV','Ocean view']},
  {id:3,name:'Family Garden',price:280,beds:3,type:'family',img:'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',f:['WiFi','AC','TV','Balcony','Garden']},
  {id:4,name:'Classic Single',price:140,beds:1,type:'single',img:'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',f:['WiFi','AC','TV']},
  {id:5,name:'Honeymoon Villa',price:780,beds:1,type:'suite',img:'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',f:['WiFi','AC','TV','Balcony','Jacuzzi','Room service']},
  {id:6,name:'Business Studio',price:220,beds:1,type:'deluxe',img:'https://images.unsplash.com/photo-1551776235-dde6d482980b?w=800',f:['WiFi','AC','TV','Desk']},
  {id:7,name:'Twin Comfort',price:190,beds:2,type:'family',img:'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',f:['WiFi','AC','TV']},
  {id:8,name:'Penthouse',price:1200,beds:2,type:'suite',img:'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',f:['WiFi','AC','TV','Balcony','Pool','Room service']},
];

function renderRooms(list){
  const grid=document.getElementById('roomsGrid'); if(!grid) return;
  grid.innerHTML = list.map(r=>`
    <div class="card reveal">
      <div class="card-img" style="background-image:url('${r.img}')">
        <span class="tag">${r.type.toUpperCase()}</span>
      </div>
      <div class="card-body">
        <h3>${r.name}</h3>
        <div class="price">$${r.price}<span style="color:var(--muted);font-weight:400;font-size:.85rem">/night</span></div>
        <p style="color:var(--muted);font-size:.9rem">🛏 ${r.beds} bed${r.beds>1?'s':''}</p>
        <div class="features">${r.f.map(x=>`<span>${x}</span>`).join('')}</div>
        <a class="btn btn-primary" href="booking.html?room=${r.id}">Book now</a>
      </div>
    </div>`).join('');
  initReveal();
}

function initRoomsPage(){
  if(!document.getElementById('roomsGrid')) return;
  renderRooms(ROOMS);
  const search=document.getElementById('roomSearch');
  const type=document.getElementById('roomType');
  const sort=document.getElementById('roomSort');
  const apply=()=>{
    let list=[...ROOMS];
    const q=search.value.toLowerCase();
    if(q) list=list.filter(r=>r.name.toLowerCase().includes(q)||r.f.join(' ').toLowerCase().includes(q));
    if(type.value!=='all') list=list.filter(r=>r.type===type.value);
    if(sort.value==='asc') list.sort((a,b)=>a.price-b.price);
    if(sort.value==='desc') list.sort((a,b)=>b.price-a.price);
    renderRooms(list);
  };
  [search,type,sort].forEach(el=>el&&el.addEventListener('input',apply));
}

/* ---------- Booking ---------- */
function initBooking(){
  const f=document.getElementById('bookingForm'); if(!f) return;
  const params=new URLSearchParams(location.search);
  const preset=+params.get('room');
  const sel=f.room;
  ROOMS.forEach(r=>{
    const o=document.createElement('option');
    o.value=r.id; o.textContent=`${r.name} — $${r.price}/night`;
    if(r.id===preset) o.selected=true;
    sel.appendChild(o);
  });
  const calc=()=>{
    const r=ROOMS.find(x=>x.id===+sel.value)||ROOMS[0];
    const nights=Math.max(1,+f.nights.value||1);
    const guests=+f.guests.value||1;
    const sub=r.price*nights;
    const tax=Math.round(sub*0.12);
    const total=sub+tax;
    document.getElementById('sumRoom').textContent=r.name;
    document.getElementById('sumNights').textContent=nights;
    document.getElementById('sumGuests').textContent=guests;
    document.getElementById('sumSub').textContent='$'+sub;
    document.getElementById('sumTax').textContent='$'+tax;
    document.getElementById('sumTotal').textContent='$'+total;
    return {r,nights,guests,total};
  };
  ['change','input'].forEach(ev=>f.addEventListener(ev,calc));
  calc();
  f.onsubmit=e=>{
    e.preventDefault();
    const u=currentUser();
    if(!u){notify('Please login first','error');setTimeout(()=>location.href='login.html',700);return;}
    const {r,nights,guests,total}=calc();
    const bookings=DB.get('au_bookings',[]);
    bookings.push({id:Date.now(),user:u.email,room:r.name,nights,guests,total,date:new Date().toISOString()});
    DB.set('au_bookings',bookings);
    notify('Booking confirmed! 🎉','success');
    f.reset(); setTimeout(calc,100);
  };
}

/* ---------- Complaints ---------- */
function initComplaints(){
  const f=document.getElementById('complaintForm'); if(!f) return;
  const list=document.getElementById('complaintList');
  const render=()=>{
    const u=currentUser();
    const all=DB.get('au_complaints',[]);
    const mine=u?all.filter(c=>c.user===u.email):[];
    list.innerHTML = mine.length? mine.map(c=>`
      <div class="complaint">
        <div>
          <strong>${c.subject}</strong>
          <p style="color:var(--muted);font-size:.9rem">${c.message}</p>
          <small style="color:var(--muted)">${new Date(c.date).toLocaleString()}</small>
        </div>
        <span class="status ${c.status}">${c.status}</span>
      </div>`).join('') : '<p style="color:var(--muted);text-align:center">No complaints yet.</p>';
  };
  render();
  f.onsubmit=e=>{
    e.preventDefault();
    const u=currentUser();
    if(!u){notify('Please login first','error');return;}
    const all=DB.get('au_complaints',[]);
    all.push({id:Date.now(),user:u.email,subject:f.subject.value,message:f.message.value,status:'pending',date:new Date().toISOString()});
    DB.set('au_complaints',all);
    notify('Complaint submitted','success');
    f.reset(); render();
  };
}

/* ---------- Admin Dashboard ---------- */
function initAdminDash(){
  if(!document.getElementById('adminTabs')) return;
  if(!sessionStorage.getItem('au_admin')){location.href='admin-login.html';return;}

  const tabs=document.querySelectorAll('.tab');
  const panels=document.querySelectorAll('.panel');
  tabs.forEach(t=>t.onclick=()=>{
    tabs.forEach(x=>x.classList.remove('active'));
    panels.forEach(x=>x.style.display='none');
    t.classList.add('active');
    document.getElementById(t.dataset.tab).style.display='block';
  });

  const stats=()=>{
    document.getElementById('aUsers').textContent=DB.get('au_users',[]).length;
    document.getElementById('aBookings').textContent=DB.get('au_bookings',[]).length;
    const c=DB.get('au_complaints',[]);
    document.getElementById('aComplaints').textContent=c.length;
    document.getElementById('aPending').textContent=c.filter(x=>x.status==='pending').length;
  };

  const renderComplaints=()=>{
    const all=DB.get('au_complaints',[]);
    document.getElementById('cBody').innerHTML = all.length? all.map(c=>`
      <tr>
        <td>${c.user}</td>
        <td>${c.subject}</td>
        <td>${c.message}</td>
        <td><span class="status ${c.status}">${c.status}</span></td>
        <td>
          <button class="btn btn-ghost" onclick="adminToggle(${c.id})">${c.status==='pending'?'Solve':'Reopen'}</button>
        </td>
      </tr>`).join('') : '<tr><td colspan="5" style="text-align:center;color:var(--muted)">No complaints</td></tr>';
  };

  const renderBookings=()=>{
    const all=DB.get('au_bookings',[]);
    document.getElementById('bBody').innerHTML = all.length? all.map(b=>`
      <tr><td>${b.user}</td><td>${b.room}</td><td>${b.nights}</td><td>${b.guests}</td><td>$${b.total}</td>
      <td><button class="btn btn-ghost" onclick="adminDelBooking(${b.id})">Delete</button></td></tr>`).join('')
      : '<tr><td colspan="6" style="text-align:center;color:var(--muted)">No bookings</td></tr>';
  };

  const renderRoomsAdmin=()=>{
    document.getElementById('rBody').innerHTML = ROOMS.map(r=>`
      <tr><td>${r.name}</td><td>${r.type}</td><td>$${r.price}</td><td>${r.beds}</td><td>${r.f.join(', ')}</td></tr>`).join('');
  };

  window.adminToggle=id=>{
    const all=DB.get('au_complaints',[]);
    const c=all.find(x=>x.id===id);
    c.status = c.status==='pending'?'solved':'pending';
    DB.set('au_complaints',all);
    notify(`Complaint ${c.status}`,'success');
    renderComplaints(); stats();
  };
  window.adminDelBooking=id=>{
    DB.set('au_bookings',DB.get('au_bookings',[]).filter(b=>b.id!==id));
    renderBookings(); stats();
  };
  window.adminLogout=()=>{sessionStorage.removeItem('au_admin');location.href='admin-login.html';};

  stats(); renderComplaints(); renderBookings(); renderRoomsAdmin();
}

/* ---------- Chat ---------- */
function initChat(){
  const btn=document.getElementById('chatBtn'); if(!btn) return;
  const panel=document.getElementById('chatPanel');
  btn.onclick=()=>panel.classList.toggle('open');
  const form=document.getElementById('chatForm');
  const body=document.getElementById('chatBody');
  const replies=['Thanks for reaching out! ✨','A concierge will be with you shortly.','You can also check our FAQ on the home page.','Would you like help booking a room?'];
  form.onsubmit=e=>{
    e.preventDefault();
    const v=form.msg.value.trim(); if(!v) return;
    body.insertAdjacentHTML('beforeend',`<div class="chat-msg user">${v}</div>`);
    form.msg.value=''; body.scrollTop=body.scrollHeight;
    setTimeout(()=>{
      body.insertAdjacentHTML('beforeend',`<div class="chat-msg bot">${replies[Math.floor(Math.random()*replies.length)]}</div>`);
      body.scrollTop=body.scrollHeight;
    },700);
  };
}

/* ---------- Music ---------- */
function initMusic(){
  const btn=document.getElementById('musicBtn'); if(!btn) return;
  const audio=new Audio('https://www.soundjay.com/ambient/sounds/boarding-accouncement-1.mp3');
  audio.loop=true; audio.volume=.4;
  let on=false;
  btn.onclick=()=>{
    on=!on;
    if(on){audio.play().catch(()=>{});btn.textContent='🔊';notify('Music on','info');}
    else{audio.pause();btn.textContent='🎵';}
  };
}

/* ---------- FAQ ---------- */
function initFAQ(){
  document.querySelectorAll('.faq-item').forEach(it=>{
    it.querySelector('.faq-q').onclick=()=>it.classList.toggle('open');
  });
}

/* ---------- Gallery / Lightbox ---------- */
function initGallery(){
  const lb=document.getElementById('lightbox'); if(!lb) return;
  const img=lb.querySelector('img');
  document.querySelectorAll('.gallery img').forEach(g=>{
    g.onclick=()=>{img.src=g.src;lb.classList.add('open');};
  });
  lb.onclick=()=>lb.classList.remove('open');
}

/* ---------- Weather (mock) ---------- */
function initWeather(){
  const w=document.getElementById('weather'); if(!w) return;
  const conds=[['☀️',28],['🌤',24],['⛅',22],['🌦',19]];
  const c=conds[Math.floor(Math.random()*conds.length)];
  w.innerHTML=`${c[0]} ${c[1]}°C · Aurelia`;
}

/* ---------- Events page ---------- */
const EVENTS=[
  {id:1,name:'Sunset Jazz Concert',type:'ticket',price:45,date:'Jun 14',img:'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800'},
  {id:2,name:'Family Movie Night',type:'free',price:0,date:'Jun 16',img:'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800'},
  {id:3,name:'Pool Party Splash',type:'ticket',price:30,date:'Jun 22',img:'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800'},
  {id:4,name:'Wedding Showcase',type:'free',price:0,date:'Jul 02',img:'https://images.unsplash.com/photo-1519741497674-611481863552?w=800'},
  {id:5,name:'Kids Magic Show',type:'ticket',price:15,date:'Jul 09',img:'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800'},
  {id:6,name:'Rooftop Gala',type:'ticket',price:120,date:'Jul 20',img:'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'},
];
function initEvents(){
  const grid=document.getElementById('eventsGrid'); if(!grid) return;
  grid.innerHTML=EVENTS.map(e=>`
    <div class="card reveal">
      <div class="card-img" style="background-image:url('${e.img}')">
        <span class="tag">${e.type==='free'?'FREE':'$'+e.price}</span>
      </div>
      <div class="card-body">
        <h3>${e.name}</h3>
        <p style="color:var(--muted)">📅 ${e.date}</p>
        <button class="btn btn-primary" onclick="bookEvent(${e.id})">${e.type==='free'?'Reserve seat':'Buy ticket'}</button>
      </div>
    </div>`).join('');
  initReveal();
}
window.bookEvent=id=>{
  const e=EVENTS.find(x=>x.id===id);
  const u=currentUser();
  if(!u){notify('Please login first','error');return;}
  const t=DB.get('au_tickets',[]); t.push({id:Date.now(),user:u.email,event:e.name,price:e.price});
  DB.set('au_tickets',t);
  notify(`Ticket booked: ${e.name}`,'success');
};

/* ---------- Init all ---------- */
document.addEventListener('DOMContentLoaded',()=>{
  initTheme(); initMenu(); initReveal(); initBackTop();
  initCounters(); initSlider(); initReviews();
  initRegister(); initLogin(); initAdminLogin();
  updateAuthUI(); initRoomsPage(); initBooking();
  initComplaints(); initAdminDash();
  initChat(); initMusic(); initFAQ(); initGallery(); initWeather();
  initEvents();
});

