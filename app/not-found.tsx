import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <div className="nf-code">404</div>
      <h1>You&apos;ve gone <em>off-track</em> 🚧</h1>
      <p>This page is stuck in the gravel trap.</p>
      <Link href="/" className="btn btn-red">Return to pit lane</Link>
      <div className="kerb" />
    </main>
  );
}
