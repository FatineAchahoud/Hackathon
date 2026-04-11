import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: "20px" }}>
      <h1>Ligal Shift</h1>
      <p>Page d’accueil de test</p>

      <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
        <Link href="/profile">Profile</Link>
      </div>
    </main>
  );
}