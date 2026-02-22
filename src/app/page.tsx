"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const { data: session, status } = useSession();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });
      signIn("credentials", { email, password, callbackUrl: '/' });
    } else {
      signIn("credentials", { email, password, callbackUrl: '/' });
    }
  };

  if (status === "loading") {
    return <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>Loading...</div>;
  }

  if (!session) {
    return (
      <div className="container">
        <div className="glass-card auth-form" style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Image
              src="/HomeschoolHubLogo.svg"
              alt="Homeschool Hub Logo"
              width={240}
              height={120}
              style={{ borderRadius: '12px', objectFit: 'contain' }}
              priority
            />
          </div>
          <h2 className="card-title" style={{ textAlign: 'center' }}>{isRegistering ? "Create Account" : "Welcome Back"}</h2>
          <form onSubmit={handleAuth}>
            {isRegistering && (
              <input type="text" placeholder="Name" className="input" value={name} onChange={e => setName(e.target.value)} required />
            )}
            <input type="email" placeholder="Email" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" className="input" value={password} onChange={e => setPassword(e.target.value)} required />
            <button className="btn" style={{ width: '100%', marginBottom: '1rem' }} type="submit">
              {isRegistering ? "Sign Up" : "Sign In"}
            </button>
          </form>
          <p style={{ textAlign: 'center', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? "Already have an account? Sign in" : "Need an account? Sign up"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: 0 }}>Dashboard</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Welcome back, {session.user?.name || session.user?.email}</p>
          </div>
        </div>
        <button className="btn btn-outline" onClick={() => signOut()}>Sign Out</button>
      </header>

      <main className="grid">
        <div className="glass-card">
          <h2 className="card-title">🤣 Joke of the Day</h2>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
            Why did the student eat his homework? <br /><br />
            <strong>Because the teacher told him it was a piece of cake!</strong>
          </p>
        </div>

        <div className="glass-card">
          <h2 className="card-title">✍️ Writing Prompt</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.5' }}>
            Imagine you discovered a hidden door in your classroom that leads to another dimension. Write a short story about what you found on the other side and how you managed to get back before the recess bell rang.
          </p>
        </div>

        <div className="glass-card">
          <h2 className="card-title">🔬 Research Topic</h2>
          <h3 style={{ marginTop: 0 }}>The Deep Sea</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Explore the mysteries of the Mariana Trench. What kind of adaptations do creatures need to survive in total darkness and extreme pressure? Find three unique animals that live in the abyssal zone.
          </p>
        </div>
      </main>
    </div>
  );
}
