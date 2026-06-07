import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center px-4 py-12 sm:px-6">
      <Suspense fallback={<div className="mx-auto text-muted">Loading...</div>}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
