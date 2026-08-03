import ProfileForm from "@/components/ProfileForm";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">About me</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Your body stats drive your personalized nutrition targets.
        </p>
      </header>
      <ProfileForm />
    </div>
  );
}
