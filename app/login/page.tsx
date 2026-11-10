'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { SignInPage } from '@/components/SignInPage';

function LoginContent() {
  const router = useRouter();

  return (
    <SignInPage
      onSignedIn={() => {
        router.push('/');
      }}
    />
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginContent />
    </AuthProvider>
  );
}
