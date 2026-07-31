import Link from "next/link";
import ProfileForm from "@/components/ProfileForm";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <header className="mb-8">
          <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-600">
            ← Back to dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900">About me</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Your body stats drive your personalized nutrition targets.
          </p>
        </header>
        <ProfileForm />
      </div>
    </div>
  );
}
