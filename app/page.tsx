'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Heart,
  Search,
  ShieldCheck,
  UserRound,
  MessageCircle,
  LogIn,
  X,
  SlidersHorizontal
} from 'lucide-react';

import { supabase } from '../lib/supabase';

const demoProfiles = [
  {
    id: '1',
    name: 'Ananya',
    age: 28,
    city: 'Bengaluru',
    profession: 'Product Manager',
    education: 'MBA',
    community: 'Open to all',
    bio: 'Warm, ambitious and family-oriented. Loves travel, books and good food.',
    initials: 'A'
  },
  {
    id: '2',
    name: 'Karthik',
    age: 30,
    city: 'Mysuru',
    profession: 'Software Engineer',
    education: 'B.Tech',
    community: 'Open to all',
    bio: 'Easy-going, career-focused and looking for a meaningful partnership.',
    initials: 'K'
  },
  {
    id: '3',
    name: 'Nandini',
    age: 27,
    city: 'Bengaluru',
    profession: 'Doctor',
    education: 'MBBS',
    community: 'Open to all',
    bio: 'Grounded, curious and passionate about people, health and family.',
    initials: 'N'
  },
  {
    id: '4',
    name: 'Rahul',
    age: 31,
    city: 'Hyderabad',
    profession: 'Entrepreneur',
    education: 'B.Com',
    community: 'Open to all',
    bio: 'Building a business and looking for a partner who values honesty and growth.',
    initials: 'R'
  }
];

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  const [query, setQuery] = useState('');
  const [liked, setLiked] = useState<string[]>([]);
  const [tab, setTab] = useState<'discover' | 'interests' | 'profile'>('discover');

  const [profile, setProfile] = useState({
    full_name: '',
    gender: '',
    date_of_birth: '',
    city: '',
    state: '',
    country: 'India',
    height_cm: '',
    religion: '',
    community: '',
    mother_tongue: '',
    education: '',
    profession: '',
    company: '',
    income: '',
    about_me: ''
  });

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const {
      data: listener
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const filtered = useMemo(
    () =>
      demoProfiles.filter((p) =>
        `${p.name} ${p.city} ${p.profession} ${p.education}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [query]
  );

  async function googleLogin() {
    if (!supabase) {
      alert('Supabase has not been connected yet.');
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  }

  async function logout() {
    await supabase?.auth.signOut();
    setUser(null);
  }

  function openProfile() {
    if (!user) {
      setShowLogin(true);
      return;
    }

    setShowProfile(true);
    setProfileMessage('');
  }

  function updateProfile(field: string, value: string) {
    setProfile((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function saveProfile() {
    if (!supabase || !user) {
      setProfileMessage('Please sign in first.');
      return;
    }

    setSaving(true);
    setProfileMessage('');

    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          full_name: profile.full_name || null,
          gender: profile.gender || null,
          date_of_birth: profile.date_of_birth || null,
          city: profile.city || null,
          state: profile.state || null,
          country: profile.country || 'India',
          height_cm: profile.height_cm
            ? Number(profile.height_cm)
            : null,
          religion: profile.religion || null,
          community: profile.community || null,
          mother_tongue: profile.mother_tongue || null,
          education: profile.education || null,
          profession: profile.profession || null,
          company: profile.company || null,
          income: profile.income || null,
          about_me: profile.about_me || null
        },
        {
          onConflict: 'id'
        }
      );

    setSaving(false);

    if (error) {
      console.error(error);
      setProfileMessage(
        `Could not save profile: ${error.message}`
      );
      return;
    }

    setProfileMessage('Profile saved successfully.');
    
    setTimeout(() => {
      setShowProfile(false);
    }, 800);
  }

  return (
    <main>
      <header className="nav">
        <div className="brand">
          <span className="brandMark">M</span>
          <span>Milan</span>
        </div>

        <div className="navActions">
          <button
            className="ghost"
            onClick={() => setTab('discover')}
          >
            Discover
          </button>

          <button
            className="ghost"
            onClick={() => setTab('interests')}
          >
            Interests{' '}
            {liked.length > 0 && (
              <span className="badge">{liked.length}</span>
            )}
          </button>

          {user ? (
            <button className="avatar" onClick={() => setTab('profile')}>
              {(
                user.user_metadata?.full_name ||
                user.email ||
                'U'
              )[0].toUpperCase()}
            </button>
          ) : (
            <button
              className="primary small"
              onClick={() => setShowLogin(true)}
            >
              <LogIn size={16} /> Login
            </button>
          )}
        </div>
      </header>

      <section className="hero">
        <div>
          <div className="eyebrow">
            <ShieldCheck size={16} />
            Built around genuine connections
          </div>

          <h1>
            Find someone who
            <br />
            <em>feels like home.</em>
          </h1>

          <p>
            Milan is a simple, modern matrimony platform for
            people looking for a serious relationship — without
            the noise.
          </p>

          <div className="heroActions">
            <button
  className="primary"
  onClick={() => user ? setTab('profile') : setShowLogin(true)}
>
  Create your profile
</button>

            <button
              className="secondary"
              onClick={() =>
                document
                  .getElementById('discover')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Explore matches
            </button>
          </div>
        </div>

        <div className="heroCard">
          <div className="heroCircle">♥</div>

          <div>
            <strong>Meaningful matches</strong>
            <span>
              Profiles • Interests • Mutual matches
            </span>
          </div>
        </div>
      </section>
{tab === 'profile' && (
  <section className="content">
    <div className="section-head">
      <div>
        <span className="eyebrow">YOUR MILAN PROFILE</span>
        <h2>Your profile</h2>
        <p>Manage the details people see when they discover you.</p>
      </div>
    </div>

    <div className="profile-panel">
      <h3>{user?.user_metadata?.full_name || user?.email || 'Your profile'}</h3>
      <p>{user?.email}</p>

      <button
        className="primary"
        onClick={() => setTab('discover')}
      >
        Back to Discover
      </button>

      <button
        className="secondary"
        onClick={logout}
      >
        Log out
      </button>
    </div>
  </section>
)}

<section id="discover" className="content">
      <section id="discover" className="content">
        <div className="sectionHead">
          <div>
            <span className="eyebrow">
              {tab === 'discover'
                ? 'Discover'
                : 'Your interests'}
            </span>

            <h2>
              {tab === 'discover'
                ? 'People worth knowing'
                : 'Profiles you liked'}
            </h2>
          </div>

          <div className="search">
            <Search size={18} />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city, profession..."
            />

            <SlidersHorizontal size={18} />
          </div>
        </div>

        {tab === 'interests' && liked.length === 0 ? (
          <div className="empty">
            <Heart size={30} />
            <h3>No interests yet</h3>
            <p>
              When a profile feels right, tap the heart to save
              your interest.
            </p>
          </div>
        ) : (
          <div className="grid">
            {filtered
              .filter(
                (p) =>
                  tab === 'discover' ||
                  liked.includes(p.id)
              )
              .map((p) => (
                <article
                  className="profileCard"
                  key={p.id}
                >
                  <div className="photo">
                    <span>{p.initials}</span>

                    <button
                      className={`heart ${
                        liked.includes(p.id)
                          ? 'liked'
                          : ''
                      }`}
                      onClick={() =>
                        setLiked((v) =>
                          v.includes(p.id)
                            ? v.filter(
                                (x) => x !== p.id
                              )
                            : [...v, p.id]
                        )
                      }
                    >
                      {liked.includes(p.id)
                        ? '♥'
                        : '♡'}
                    </button>
                  </div>

                  <div className="cardBody">
                    <div className="nameRow">
                      <h3>
                        {p.name}, {p.age}
                      </h3>

                      <span className="verified">
                        <ShieldCheck size={14} />
                        Verified-ready
                      </span>
                    </div>

                    <p className="muted">
                      {p.profession} · {p.education}
                    </p>

                    <p className="muted">{p.city}</p>

                    <p>{p.bio}</p>

                    <button
                      className="outline"
                      onClick={() =>
                        alert(
                          `Profile details for ${p.name} will be connected to the database in the next build step.`
                        )
                      }
                    >
                      View profile
                    </button>
                  </div>
                </article>
              ))}
          </div>
        )}
      </section>

      <section className="how">
        <div className="sectionHead">
          <div>
            <span className="eyebrow">
              Simple by design
            </span>

            <h2>Three steps to a connection</h2>
          </div>
        </div>

        <div className="steps">
          <div>
            <b>01</b>
            <UserRound />
            <h3>Create your profile</h3>
            <p>
              Tell people what matters to you and what you're
              looking for.
            </p>
          </div>

          <div>
            <b>02</b>
            <Search />
            <h3>Discover</h3>
            <p>
              Use practical filters to find people who fit your
              preferences.
            </p>
          </div>

          <div>
            <b>03</b>
            <MessageCircle />
            <h3>Connect</h3>
            <p>
              Express interest. If it's mutual, start a private
              conversation.
            </p>
          </div>
        </div>
      </section>

      <footer>
        <span>© 2026 Milan</span>
        <span>
          Private · Respectful · Relationship-focused
        </span>
      </footer>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div
          className="modalBackdrop"
          onClick={() => setShowLogin(false)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              onClick={() => setShowLogin(false)}
            >
              <X />
            </button>

            <span className="brandMark large">M</span>

            <h2>Welcome to Milan</h2>

            <p>
              Create your profile or sign in with Google.
            </p>

            <button
              className="google"
              onClick={googleLogin}
            >
              Continue with Google
            </button>

            <small>
              No password to remember. You control what you
              share.
            </small>
          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      {showProfile && user && (
        <div
          className="modalBackdrop"
          onClick={() => setShowProfile(false)}
        >
          <div
            className="modal"
            style={{
              maxWidth: '720px',
              width: '92%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              onClick={() => setShowProfile(false)}
            >
              <X />
            </button>

            <span className="brandMark large">M</span>

            <h2>Create your profile</h2>

            <p>
              Tell us a little about yourself. You can update
              this later.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(2, minmax(0, 1fr))',
                gap: '14px',
                marginTop: '20px'
              }}
            >
              <input
                placeholder="Full name"
                value={profile.full_name}
                onChange={(e) =>
                  updateProfile(
                    'full_name',
                    e.target.value
                  )
                }
              />

              <select
                value={profile.gender}
                onChange={(e) =>
                  updateProfile(
                    'gender',
                    e.target.value
                  )
                }
              >
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <input
                type="date"
                value={profile.date_of_birth}
                onChange={(e) =>
                  updateProfile(
                    'date_of_birth',
                    e.target.value
                  )
                }
              />

              <input
                placeholder="City"
                value={profile.city}
                onChange={(e) =>
                  updateProfile(
                    'city',
                    e.target.value
                  )
                }
              />

              <input
                placeholder="State"
                value={profile.state}
                onChange={(e) =>
                  updateProfile(
                    'state',
                    e.target.value
                  )
                }
              />

              <input
                placeholder="Country"
                value={profile.country}
                onChange={(e) =>
                  updateProfile(
                    'country',
                    e.target.value
                  )
                }
              />

              <input
                type="number"
                placeholder="Height (cm)"
                value={profile.height_cm}
                onChange={(e) =>
                  updateProfile(
                    'height_cm',
                    e.target.value
                  )
                }
              />

              <input
                placeholder="Religion"
                value={profile.religion}
                onChange={(e) =>
                  updateProfile(
                    'religion',
                    e.target.value
                  )
                }
              />

              <input
                placeholder="Community"
                value={profile.community}
                onChange={(e) =>
                  updateProfile(
                    'community',
                    e.target.value
                  )
                }
              />

              <input
                placeholder="Mother tongue"
                value={profile.mother_tongue}
                onChange={(e) =>
                  updateProfile(
                    'mother_tongue',
                    e.target.value
                  )
                }
              />

              <input
                placeholder="Education"
                value={profile.education}
                onChange={(e) =>
                  updateProfile(
                    'education',
                    e.target.value
                  )
                }
              />

              <input
                placeholder="Profession"
                value={profile.profession}
                onChange={(e) =>
                  updateProfile(
                    'profession',
                    e.target.value
                  )
                }
              />

              <input
                placeholder="Company"
                value={profile.company}
                onChange={(e) =>
                  updateProfile(
                    'company',
                    e.target.value
                  )
                }
              />

              <input
                placeholder="Income"
                value={profile.income}
                onChange={(e) =>
                  updateProfile(
                    'income',
                    e.target.value
                  )
                }
              />
            </div>

            <textarea
              placeholder="Tell us about yourself..."
              value={profile.about_me}
              onChange={(e) =>
                updateProfile(
                  'about_me',
                  e.target.value
                )
              }
              style={{
                width: '100%',
                minHeight: '120px',
                marginTop: '14px',
                padding: '14px',
                borderRadius: '10px',
                border: '1px solid #ddd',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />

            {profileMessage && (
              <p
                style={{
                  marginTop: '12px',
                  fontWeight: 500
                }}
              >
                {profileMessage}
              </p>
            )}

            <button
              className="primary"
              style={{
                width: '100%',
                marginTop: '16px'
              }}
              onClick={saveProfile}
              disabled={saving}
            >
              {saving
                ? 'Saving profile...'
                : 'Save my profile'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
