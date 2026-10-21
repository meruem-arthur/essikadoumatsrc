import LoginForm from "./LoginForm";
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
  const { reset } = await searchParams;
  return <main className="grid min-h-screen place-items-center bg-forest p-4"><LoginForm notice={reset ? "Password updated. Sign in with your new password." : undefined} /></main>;
}
