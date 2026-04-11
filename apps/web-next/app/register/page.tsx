"use client";

import { useState } from "react";
import { register } from "@/lib/auth";
import { useRouter } from "next/navigation";
import type { FirebaseError } from "firebase/app";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await register(email, password);
      router.push("/profile");
    } catch (error: unknown) {
      const firebaseError = error as FirebaseError;
      const code = firebaseError?.code ?? "unknown_error";
      const message = firebaseError?.message ?? "Something went wrong";
      console.error("Register error code:", code);
      console.error("Register error message:", message);
      alert(`${code} - ${message}`);
    }
  };

  return (
    <main style={{ padding: "20px" }}>
      <h1>Register</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "300px",
        }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Créer un compte</button>
      </form>
    </main>
  );
}
