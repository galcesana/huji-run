
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = createClient();

  // Check if user is logged in
  const { data: { user } } = await (await supabase).auth.getUser();

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e63946 0%, #1d3557 100%)',
      color: 'white',
      padding: '2rem'
    }}>
      <div className="glass-panel" style={{
        padding: '3rem',
        borderRadius: '1.5rem',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          HUJI Run
        </h1>
        <p style={{ marginBottom: '2rem', opacity: 0.9 }}>
          The official team app. Track runs, join meetups, and stay connected.
        </p>

        {user ? (
          <Link href="/feed">
            <button className="primary-btn" style={{ width: '100%' }}>
              Go to Feed
            </button>
          </Link>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <Link href="/login">
              <button className="primary-btn" style={{ width: '100%', background: 'white', color: '#e63946' }}>
                Log In
              </button>
            </Link>
            <Link href="/signup">
              <span style={{ fontSize: '0.9rem', textDecoration: 'underline', cursor: 'pointer' }}>
                New here? Join the team
              </span>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
