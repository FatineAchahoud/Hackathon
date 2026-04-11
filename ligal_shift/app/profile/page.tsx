"use client";

import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <main style={{ padding: "20px" }}>Loading...</main>;
  }

  if (!user) {
    return <main style={{ padding: "20px" }}>No user connected</main>;
  }

  return (
    <main style={{ padding: "20px" }}>
      <h1>Profile</h1>
      <p>Email: {user.email}</p>
      <p>UID: {user.uid}</p>
    </main>
  );
}