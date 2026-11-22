import React, { useMemo, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Home, Swords, Trophy, Gift, Shield, Flame, Star, Check, Clock, Plus, Settings, Sparkles, ChevronRight, Coins, X, Crown } from 'lucide-react';
import './styles.css';
import { supabase } from './supabase.js';


const initialKids = [
  { id:'daniela', name:'Daniela', emoji:'🦊', color:'#ff9f43', points:120, xp:65, level:1, streak:3 },
  { id:'alan', name:'Alan', emoji:'🐉', color:'#5b8cff', points:85, xp:40, level:1, streak:2 }
];
const initialTasks = [
  {id:1,title:'Hacer la cama',detail:'Dejar la cama hecha al levantarse',points:10,icon:'🛏️',frequency:'Diaria'},
  {id:2,title:'Lavarse los dientes',detail:'Cepillado completo',points:5,icon:'🪥',frequency:'Diaria'},
  {id:3,title:'Recoger la habitación',detail:'Todo en su sitio y suelo despejado',points:15,icon:'🧹',frequency:'Diaria'},
  {id:4,title:'Hacer los deberes',detail:'Tareas del cole terminadas',points:20,icon:'📚',frequency:'Diaria'},
  {id:5,title:'Leer 20 minutos',detail:'Un rato de lectura tranquila',points:15,icon:'📖',frequency:'Diaria'},
  {id:6,title:'Ayudar en casa',detail:'Ayuda sin que te lo tengan que repetir',points:20,icon:'🧤',frequency:'Diaria'},
  {id:7,title:'Preparar la mochila',detail:'Dejarla lista para mañana',points:10,icon:'🎒',frequency:'Diaria'},
  {id:8,title:'Hablar con respeto',detail:'Buenas palabras y buen trato',points:10,icon:'💬',frequency:'Diaria'},
  {id:9,title:'Misión semanal: ayudar en una tarea grande',detail:'Participar en una tarea especial en familia',points:50,icon:'🧩',frequency:'Semanal'}
];
const initialRewards = [
  {id:1,title:'Noche de película',detail:'Elegir peli y preparar palomitas',cost:100,icon:'🍿'},
  {id:2,title:'30 min extra de consola',detail:'Tiempo extra de juego',cost:150,icon:'🎮'},
  {id:3,title:'Elegir la cena',detail:'Una cena que te apetezca',cost:250,icon:'🍕'},
  {id:4,title:'Premio sorpresa',detail:'¡Los papás preparan algo especial!',cost:500,icon:'🎁'}
];
const STORAGE='bohorquez_levelup_realstarter_v1';
function loadState(){try{const saved=JSON.parse(localStorage.getItem(STORAGE));if(saved)return saved;}catch{} return {kids:initialKids,tasks:initialTasks,rewards:initialRewards,submissions:[],history:[],activeKid:'daniela',parentPin:'1234'};}
function App(){
 const [session,setSession]=useState(null);
 const [account,setAccount]=useState(null);
 const [authLoading,setAuthLoading]=useState(true);
 const [authError,setAuthError]=useState('');
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 useEffect(()=>{let alive=true;const loadAccount=async(session)=>{if(!session){setAccount(null);return;}const {data:acct,error}=await supabase.from('levelup_accounts').select('profile_id,display_name,role,active').eq('auth_user_id',session.user.id).maybeSingle();if(!alive)return;if(error)setAuthError('No se pudo consultar el perfil: '+error.message);else if(!acct||!acct.active){setAccount(null);setAuthError('Esta cuenta aún no está vinculada a un perfil familiar.');}else{setAuthError('');setAccount(acct);}};supabase.auth.getSession().then(async({data,error})=>{if(!alive)return;if(error)setAuthError('No se pudo comprobar la sesión.');const s=data.session||null;setSession(s);await loadAccount(s);if(alive)setAuthLoading(false);});const {data:listener}=supabase.auth.onAuthStateChange((_event,s)=>{setSession(s);if(!s){setAccount(null);setAuthError('');}else{setAuthLoading(true);loadAccount(s).finally(()=>{if(alive)setAuthLoading(false);});}});return()=>{alive=false;listener.subscription.unsubscribe();};},[]);
 const doLogin=async(e)=>{e.preventDefault();setAuthError('');const {data,error}=await supabase.auth.signInWithPassword({email:email.trim(),password});if(error){setAuthError('Correo o contraseña incorrectos.');return;}const {data:acct,error:lookupError}=await supabase.from('levelup_accounts').select('profile_id,display_name,role,active').eq('auth_user_id',data.user.id).maybeSingle();if(lookupError||!acct||!acct.active){setAuthError('Cuenta creada, pero falta vincularla al perfil familiar.');await supabase.auth.signOut();return;}setAccount(acct);};
 const doLogout=async()=>{await supabase.auth.signOut();setSession(null);setAccount(null);};
 if(authLoading)return <div className='auth-screen'><div className='auth-card'><div className='auth-logo'>⚡</div><h1>LEVEL <span>UP</span></h1><p>Comprobando sesión…</p></div></div>;
 if(!session||!account)return <div className='auth-screen'><form className='auth-card' onSubmit={doLogin}><div className='auth-logo'>⚡</div><h1>LEVEL <span>UP</span></h1><p>Familia Bohorquez · Acceso personal</p><label>Correo electrónico<input type='email' autoComplete='username' value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Contraseña<input type='password' autoComplete='current-password' value={password} onChange={e=>setPassword(e.target.value)} required/></label><button className='primary-btn' type='submit'>Entrar</button>{authError&&<div className='auth-error'>{authError}</div>}<small>Si tu cuenta aún no está vinculada, avisa a los padres.</small></form></div>;
 return <FamilyApp account={account} onLogout={doLogout}/>;
}
function FamilyApp({account,onLogout}){
 const [state,setState]=useState(loadState);
 const [tab,setTab]=useState('home'); const [parentOpen,setParentOpen]=useState(false); const [pin,setPin]=useState(''); const [pinError,setPinError]=useState(false); const [selectedKid,setSelectedKid]=useState('daniela'); const [toast,setToast]=useState('');
 const save=(next)=>{setState(next);localStorage.setItem(STORAGE,JSON.stringify(next));};
const isParent = account.role === 'parent';

const accountKidId =
  account.profile_id === 'dani' || account.profile_id === 'daniela'
    ? 'daniela'
    : account.profile_id === 'alan'
      ? 'alan'
      : null;

const effectiveKidId = isParent ? state.activeKid : accountKidId;

const kid = state.kids.find(k => k.id === effectiveKidId);
const accountKidId =
  account.profile_id === 'dani' || account.profile_id === 'daniela'
    ? 'daniela'
    : account.profile_id === 'alan'
    ? 'alan'
    : null;

const effectiveKidId = isParent ? state.activeKid : accountKidId;

const kid = state.kids.find(k => k.id === effectiveKidId);
 const pending=state.submissions.filter(s=>s.status==='pending');
 const mySubmissions=state.submissions.filter(s=>s.kidId===kid.id);
 const doneToday=mySubmissions.filter(s=>s.status==='approved').length;
 const flash=(msg)=>{setToast(msg);window.setTimeout(()=>setToast(''),2200)};
 const submitTask=(task)=>{if(mySubmissions.some(s=>s.taskId===task.id&&s.status==='pending'))return flash('Esta misión ya está pendiente ✨'); const next={...state,submissions:[{id:Date.now(),kidId:kid.id,kidName:kid.name,taskId:task.id,taskTitle:task.title,points:task.points,status:'pending',createdAt:new Date().toISOString()},...state.submissions]};save(next);flash('¡Misión enviada para revisión! 🚀');};
 const approve=(sub)=>{const next={...state,kids:state.kids.map(k=>k.id===sub.kidId?{...k,points:k.points+sub.points,xp:k.xp+sub.points}:k),submissions:state.submissions.map(s=>s.id===sub.id?{...s,status:'approved'}:s),history:[{id:Date.now(),text:`${sub.kidName} ganó ${sub.points} puntos · ${sub.taskTitle}`,date:new Date().toISOString()},...state.history]};save(next);flash('¡Misión aprobada!');};
 const reject=(sub)=>{save({...state,submissions:state.submissions.map(s=>s.id===sub.id?{...s,status:'rejected'}:s),history:[{id:Date.now(),text:`Misión rechazada · ${sub.kidName} · ${sub.taskTitle}`,date:new Date().toISOString()},...state.history]});flash('Misión rechazada');};
 const redeem=(reward)=>{if(kid.points<reward.cost)return flash('Aún te faltan puntos 💪');const next={...state,kids:state.kids.map(k=>k.id===kid.id?{...k,points:k.points-reward.cost}:k),history:[{id:Date.now(),text:`${kid.name} canjeó ${reward.title} (${reward.cost} puntos)`,date:new Date().toISOString()},...state.history]};save(next);flash('¡Recompensa solicitada! 🎉');};
 const openParents=()=>{if(isParent)setTab('parents');else flash('Solo los padres pueden acceder a esta sección.');};
 const level=Math.floor(kid.xp/100)+1; const levelProgress=kid.xp%100;
 const rank=[...state.kids].sort((a,b)=>b.points-a.points);
 return <div className="app-shell"><header className="topbar"><div className="brand"><div className="brand-mark">⚡</div><div><div className="brand-name">LEVEL <span>UP</span></div><small>FAMILIA BOHORQUEZ</small></div><button className="parent-btn" onClick={isParent?openParents:onLogout}><Shield size={16}/> {isParent?'Padres':'Salir'}</button></header>
 <main>
 {tab==='home'&&<>
 <section className="hero"><div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/> TU AVENTURA EMPIEZA</div><h1>¡Hola, {kid.name}!<br/><span>¿Subimos de nivel?</span></h1><p>Completa misiones, gana puntos y desbloquea recompensas.</p><div className="hero-cta" onClick={()=>setTab('missions')}>Ver misiones <ChevronRight size={16}/></div></div><div className="hero-orb"><div className="orb-inner"><span>{kid.emoji}</span><div className="orb-star">✦</div></div><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div></div></section>
 {isParent&&<section className="kid-switch"><div className="switch-label">JUGADOR</div>{state.kids.map(k=><button key={k.id} className={`kid-chip ${kid.id===k.id?'active':''}`} onClick={()=>save({...state,activeKid:k.id})}><span>{k.emoji}</span>{k.name}</button>)}</section>}
 <section className="stats-grid"><div className="stat-card points"><div className="stat-icon"><Coins size={18}/></div><div className="stat-value">{kid.points}</div><div className="stat-label">PUNTOS</div><div className="stat-foot">Listos para canjear</div></div><div className="stat-card xp"><div className="stat-icon"><Star size={18}/></div><div className="stat-value">Nivel {level}</div><div className="stat-label">EXPERIENCIA</div><div className="xp-track"><div style={{width:`${levelProgress}%`}}/></div><div className="stat-foot">{levelProgress}/100 XP para el siguiente nivel</div></div><div className="stat-card streak"><div className="stat-icon"><Flame size={18}/></div><div className="stat-value">{kid.streak} días</div><div className="stat-label">RACHA</div><div className="stat-foot">¡Mantén el ritmo!</div></div></section>
 <section className="section-head"><div><div className="eyebrow">TU PROGRESO</div><h2>Misiones de hoy <span className="count-pill">{doneToday} hechas</span></h2></div><button className="text-action" onClick={()=>setTab('missions')}>Ver todas <ChevronRight size={16}/></button></section>
 <div className="mission-preview">{state.tasks.slice(0,4).map(t=><TaskCard key={t.id} task={t} submissions={mySubmissions} onSubmit={()=>submitTask(t)}/>)}</div>
 <section className="section-head"><div><div className="eyebrow">COMPETICIÓN FAMILIAR</div><h2>Ranking familiar 🏆</h2></div></section><div className="ranking-card">{rank.map((k,i)=><div className="rank-row" key={k.id}><div className={`rank-place place-${i+1}`}>{i===0?'👑':i+1}</div><div className="rank-avatar" style={{background:k.color}}>{k.emoji}</div><div className="rank-name">{k.name}<small>{i===0?'¡Va en cabeza!':'¡A por el primer puesto!'}</small></div><div className="rank-score">{k.points}<small>PTS</small></div></div>)}</div>
 </>}
 {tab==='missions'&&<><section className="page-heading"><div className="eyebrow">MODO AVENTURA</div><h1>Misiones <span>⚔️</span></h1><p>Elige una misión, complétala y envíala a tus padres para ganar puntos.</p></section>{isParent&&<section className="kid-switch"><div className="switch-label">JUGADOR</div>{state.kids.map(k=><button key={k.id} className={`kid-chip ${kid.id===k.id?'active':''}`} onClick={()=>save({...state,activeKid:k.id})}><span>{k.emoji}</span>{k.name}</button>)}</section>}<div className="missions-list">{state.tasks.map(t=><TaskCard key={t.id} task={t} submissions={mySubmissions} onSubmit={()=>submitTask(t)}/>)}</div></>}
 {tab==='rewards'&&<><section className="page-heading"><div className="eyebrow">TIENDA DE PREMIOS</div><h1>Recompensas <span>🎁</span></h1><p>¡Gasta tus puntos en premios que te hacen ilusión!</p><div className="wallet"><Coins size={20}/><strong>{kid.points}</strong><span>puntos disponibles</span></div></section>{isParent&&<section className="kid-switch"><div className="switch-label">JUGADOR</div>{state.kids.map(k=><button key={k.id} className={`kid-chip ${kid.id===k.id?'active':''}`} onClick={()=>save({...state,activeKid:k.id})}><span>{k.emoji}</span>{k.name}</button>)}</section>}<div className="reward-grid">{state.rewards.map(r=><div className="reward-card" key={r.id}><div className="reward-art">{r.icon}</div><h3>{r.title}</h3><p>{r.detail}</p><div className="reward-bottom"><span className="cost"><Coins size={16}/>{r.cost}</span><button disabled={kid.points<r.cost} onClick={()=>redeem(r)}>{kid.points>=r.cost?'Canjear':'Te faltan puntos'}</button></div></div>)}</div></>}
 {tab==='parents'&&isParent&&<ParentsPanel state={state} save={save} flash={flash} approve={approve} reject={reject} pending={pending} onExit={()=>setTab('home')}/>}
 </main><nav className="bottom-nav"><button className={tab==='home'?'active':''} onClick={()=>setTab('home')}><Home/><span>Inicio</span></button><button className={tab==='missions'?'active':''} onClick={()=>setTab('missions')}><Swords/><span>Misiones</span></button><button className={tab==='rewards'?'active':''} onClick={()=>setTab('rewards')}><Gift/><span>Premios</span></button>{isParent?<button onClick={openParents}><Shield/><span>Padres</span></button>:<button onClick={onLogout}><Shield/><span>Salir</span></button>}</nav>

 {toast&&<div className="toast"><Sparkles size={16}/>{toast}</div>}
 </div>;
}
function TaskCard({task,submissions,onSubmit}){const status=submissions.filter(s=>s.taskId===task.id).at(0);const label=status?.status==='pending'?'Pendiente de aprobación':status?.status==='approved'?'Completada':status?.status==='rejected'?'Reintentar misión':'Completar';return <div className="task-card"><div className="task-icon">{task.icon}</div><div className="task-content"><h3>{task.title}</h3><p>{task.detail}</p><div className="task-meta"><span className="frequency">{task.frequency}</span><span className="task-points"><Coins size={14}/>+{task.points}</span></div></div><button className={`task-action ${status?.status||''}`} disabled={status?.status==='pending'||status?.status==='approved'} onClick={onSubmit}>{status?.status==='approved'?<Check size={16}/>:status?.status==='pending'?<Clock size={16}/>:<ChevronRight size={16}/>}<span>{label}</span></button></div>}
function ParentsPanel({state,save,flash,approve,reject,pending,onExit}){const [view,setView]=useState('pending');const [pin,setPin]=useState(state.parentPin);const [newTask,setNewTask]=useState({title:'',points:10,detail:'',icon:'✨',frequency:'Diaria'});const [newReward,setNewReward]=useState({title:'',cost:100,detail:'',icon:'🎁'});const addTask=()=>{if(!newTask.title.trim())return;save({...state,tasks:[...state.tasks,{...newTask,id:Date.now(),points:Number(newTask.points)}]});setNewTask({...newTask,title:'',detail:''});flash('Misión añadida');};const addReward=()=>{if(!newReward.title.trim())return;save({...state,rewards:[...state.rewards,{...newReward,id:Date.now(),cost:Number(newReward.cost)}]});setNewReward({...newReward,title:'',detail:''});flash('Recompensa añadida');};const adjust=(kidId,amount)=>{save({...state,kids:state.kids.map(k=>k.id===kidId?{...k,points:Math.max(0,k.points+amount)}:k),history:[{id:Date.now(),text:`Ajuste manual ${amount>0?'+':''}${amount} puntos · ${state.kids.find(k=>k.id===kidId)?.name}`,date:new Date().toISOString()},...state.history]});flash('Puntos actualizados');};const removeTask=(id)=>save({...state,tasks:state.tasks.filter(t=>t.id!==id)});const removeReward=(id)=>save({...state,rewards:state.rewards.filter(r=>r.id!==id)});return <><div className="parent-header"><div><div className="eyebrow">PANEL DE CONTROL</div><h1>Zona de padres <span>🛡️</span></h1></div><button className="outline-btn" onClick={onExit}>Salir</button></div><div className="admin-tabs">{[['pending','Pendientes'],['kids','Puntos'],['tasks','Misiones'],['rewards','Premios'],['history','Historial'],['settings','Ajustes']].map(([key,label])=><button className={view===key?'active':''} onClick={()=>setView(key)} key={key}>{label}{key==='pending'&&pending.length>0&&<b>{pending.length}</b>}</button>)}</div>
 {view==='pending'&&<div className="admin-list"><h2>Solicitudes de aprobación</h2>{pending.length===0?<div className="empty-state">✨ No hay misiones pendientes. ¡Todo al día!</div>:pending.map(s=><div className="approval-card" key={s.id}><div className="approval-avatar">{state.kids.find(k=>k.id===s.kidId)?.emoji}</div><div className="approval-info"><strong>{s.kidName}</strong><span>{s.taskTitle}</span><small>Recompensa: +{s.points} puntos</small></div><div className="approval-buttons"><button className="approve" onClick={()=>approve(s)}><Check size={16}/></button><button className="reject" onClick={()=>reject(s)}><X size={16}/></button></div></div>)}</div>}
 {view==='kids'&&<div className="admin-list"><h2>Gestionar puntos</h2>{state.kids.map(k=><div className="points-admin" key={k.id}><div className="rank-avatar" style={{background:k.color}}>{k.emoji}</div><div className="rank-name">{k.name}<strong>{k.points} puntos</strong></div><button onClick={()=>adjust(k.id,-10)}>-10</button><button onClick={()=>adjust(k.id,10)}>+10</button><button onClick={()=>adjust(k.id,50)}>+50</button></div>)}</div>}
 {view==='tasks'&&<div className="admin-list"><h2>Editar misiones</h2><div className="admin-form"><input placeholder="Nombre de la misión" value={newTask.title} onChange={e=>setNewTask({...newTask,title:e.target.value})}/><input placeholder="Detalle" value={newTask.detail} onChange={e=>setNewTask({...newTask,detail:e.target.value})}/><div className="form-row"><input type="number" placeholder="Puntos" value={newTask.points} onChange={e=>setNewTask({...newTask,points:e.target.value})}/><select value={newTask.frequency} onChange={e=>setNewTask({...newTask,frequency:e.target.value})}><option>Diaria</option><option>Semanal</option></select><input placeholder="Emoji" value={newTask.icon} onChange={e=>setNewTask({...newTask,icon:e.target.value})}/></div><button className="primary-btn" onClick={addTask}><Plus size={16}/>Añadir misión</button></div>{state.tasks.map(t=><div className="manage-row" key={t.id}><span>{t.icon} {t.title}</span><b>{t.points} pts</b><button onClick={()=>removeTask(t.id)}><X size={16/></button></div>)}</div>}
 {view==='rewards'&&<div className="admin-list"><h2>Editar premios</h2><div className="admin-form"><input placeholder="Nombre de recompensa" value={newReward.title} onChange={e=>setNewReward({...newReward,title:e.target.value})}/><input placeholder="Descripción" value={newReward.detail} onChange={e=>setNewReward({...newReward,detail:e.target.value})}/><div className="form-row"><input type="number" placeholder="Coste en puntos" value={newReward.cost} onChange={e=>setNewReward({...newReward,cost:e.target.value})}/><input placeholder="Emoji" value={newReward.icon} onChange={e=>setNewReward({...newReward,icon:e.target.value})}/></div><button className="primary-btn" onClick={addReward}><Plus size={16}/>Añadir premio</button></div>{state.rewards.map(r=><div className="manage-row" key={r.id}><span>{r.icon} {r.title}</span><b>{r.cost} pts</b><button onClick={()=>removeReward(r.id)}><X size={16/></button></div>)}</div>}
 {view==='history'&&<div className="admin-list"><h2>Actividad reciente</h2>{state.history.length===0?<div className="empty-state">Aún no hay actividad registrada.</div>:state.history.slice(0,30).map(h=><div className="history-row" key={h.id}><span>{h.text}</span><small>{new Date(h.date).toLocaleString('es-ES')}</small></div>)}</div>}
 {view==='settings'&&<div className="admin-list"><h2>Ajustes familiares</h2><div className="admin-form"><label>PIN parental</label><input type="password" inputMode="numeric" value={pin} onChange={e=>setPin(e.target.value)}/><button className="primary-btn" onClick={()=>{save({...state,parentPin:pin});flash('PIN actualizado')}}>Guardar PIN</button><p className="warning-note">Esta versión guarda los datos en el dispositivo. La sincronización entre móviles y el PIN seguro en servidor se implementarán en la siguiente fase.</p><button className="danger-btn" onClick={()=>{if(confirm('¿Borrar todo y volver a los datos iniciales?')){localStorage.removeItem(STORAGE);location.reload()}}}>Reiniciar demo</button></div></div>}
 </>}
createRoot(document.getElementById('root')).render(<App/>);
