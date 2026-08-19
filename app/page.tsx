'use client';

import { useEffect, useMemo, useState } from 'react';
import { Heart, Search, ShieldCheck, UserRound, MessageCircle, LogIn, X, SlidersHorizontal } from 'lucide-react';
import { supabase } from '../lib/supabase';

const demoProfiles = [
  { id:'1', name:'Ananya', age:28, city:'Bengaluru', profession:'Product Manager', education:'MBA', community:'Open to all', bio:'Warm, ambitious and family-oriented. Loves travel, books and good food.', initials:'A' },
  { id:'2', name:'Karthik', age:30, city:'Mysuru', profession:'Software Engineer', education:'B.Tech', community:'Open to all', bio:'Easy-going, career-focused and looking for a meaningful partnership.', initials:'K' },
  { id:'3', name:'Nandini', age:27, city:'Bengaluru', profession:'Doctor', education:'MBBS', community:'Open to all', bio:'Grounded, curious and passionate about people, health and family.', initials:'N' },
  { id:'4', name:'Rahul', age:31, city:'Hyderabad', profession:'Entrepreneur', education:'B.Com', community:'Open to all', bio:'Building a business and looking for a partner who values honesty and growth.', initials:'R' },
];

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [query, setQuery] = useState('');
  const [liked, setLiked] = useState<string[]>([]);
  const [tab, setTab] = useState<'discover'|'interests'>('discover');

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  const filtered = useMemo(() => demoProfiles.filter(p =>
    `${p.name} ${p.city} ${p.profession} ${p.education}`.toLowerCase().includes(query.toLowerCase())
  ), [query]);

  async function googleLogin() {
    if (!supabase) {
      alert('Google login is ready, but Supabase has not been connected yet. Follow SETUP.md to connect it.');
      return;
    }
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
  }

  async function logout() { await supabase?.auth.signOut(); setUser(null); }

  return <main>
    <header className="nav">
      <div className="brand"><span className="brandMark">M</span><span>Milan</span></div>
      <div className="navActions">
        <button className="ghost" onClick={() => setTab('discover')}>Discover</button>
        <button className="ghost" onClick={() => setTab('interests')}>Interests {liked.length > 0 && <span className="badge">{liked.length}</span>}</button>
        {user ? <button className="avatar" onClick={logout}>{(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}</button> : <button className="primary small" onClick={() => setShowLogin(true)}><LogIn size={16}/> Login</button>}
      </div>
    </header>

    <section className="hero">
      <div>
        <div className="eyebrow"><ShieldCheck size={16}/> Built around genuine connections</div>
        <h1>Find someone who<br/><em>feels like home.</em></h1>
        <p>Milan is a simple, modern matrimony platform for people looking for a serious relationship — without the noise.</p>
        <div className="heroActions"><button className="primary" onClick={() => setShowLogin(true)}>Create your profile</button><button className="secondary" onClick={() => document.getElementById('discover')?.scrollIntoView({behavior:'smooth'})}>Explore matches</button></div>
      </div>
      <div className="heroCard"><div className="heroCircle">♥</div><div><strong>Meaningful matches</strong><span>Profiles • Interests • Mutual matches</span></div></div>
    </section>

    <section id="discover" className="content">
      <div className="sectionHead"><div><span className="eyebrow">{tab === 'discover' ? 'Discover' : 'Your interests'}</span><h2>{tab === 'discover' ? 'People worth knowing' : 'Profiles you liked'}</h2></div><div className="search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search city, profession..."/><SlidersHorizontal size={18}/></div></div>
      {tab === 'interests' && liked.length === 0 ? <div className="empty"><Heart size={30}/><h3>No interests yet</h3><p>When a profile feels right, tap the heart to save your interest.</p></div> : <div className="grid">{filtered.filter(p => tab==='discover' || liked.includes(p.id)).map(p => <article className="profileCard" key={p.id}><div className="photo"><span>{p.initials}</span><button className={`heart ${liked.includes(p.id)?'liked':''}`} onClick={()=>setLiked(v=>v.includes(p.id)?v.filter(x=>x!==p.id):[...v,p.id])}>{liked.includes(p.id)?'♥':'♡'}</button></div><div className="cardBody"><div className="nameRow"><h3>{p.name}, {p.age}</h3><span className="verified"><ShieldCheck size={14}/> Verified-ready</span></div><p className="muted">{p.profession} · {p.education}</p><p className="muted">{p.city}</p><p>{p.bio}</p><button className="outline" onClick={()=>alert(`Profile details for ${p.name} will be connected to the database in the next build step.`)}>View profile</button></div></article>)}</div>}
    </section>

    <section className="how"><div className="sectionHead"><div><span className="eyebrow">Simple by design</span><h2>Three steps to a connection</h2></div></div><div className="steps"><div><b>01</b><UserRound/><h3>Create your profile</h3><p>Tell people what matters to you and what you're looking for.</p></div><div><b>02</b><Search/><h3>Discover</h3><p>Use practical filters to find people who fit your preferences.</p></div><div><b>03</b><MessageCircle/><h3>Connect</h3><p>Express interest. If it's mutual, start a private conversation.</p></div></div></section>

    <footer><span>© 2026 Milan</span><span>Private · Respectful · Relationship-focused</span></footer>

    {showLogin && <div className="modalBackdrop" onClick={()=>setShowLogin(false)}><div className="modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setShowLogin(false)}><X/></button><span className="brandMark large">M</span><h2>Welcome to Milan</h2><p>Create your profile or sign in with Google.</p><button className="google" onClick={googleLogin}>Continue with Google</button><small>No password to remember. You control what you share.</small></div></div>}
  </main>
}
