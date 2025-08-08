'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);

  if (!ready) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>dulif — Marketplace</h1>
        <nav style={{ display: 'flex', gap: 12 }}>
          <Link href="/create">Create Listing</Link>
          <Link href="/profile">Profile</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </header>

      <section>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Latest listings</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 16 }}>
          <article style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
            <div style={{ height: 120, background: '#f3f4f6', borderRadius: 8, marginBottom: 8 }} />
            <div style={{ fontWeight: 600 }}>Sample Item</div>
            <div>$100</div>
          </article>
          <article style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
            <div style={{ height: 120, background: '#f3f4f6', borderRadius: 8, marginBottom: 8 }} />
            <div style={{ fontWeight: 600 }}>Another Item</div>
            <div>$75</div>
          </article>
        </div>
      </section>
    </main>
  );
}