"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Shield, AlertCircle } from 'lucide-react';

interface TwoFactorVerifyProps {
  onVerify: (code: string) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export function TwoFactorVerify({ onVerify, onCancel, loading = false }: TwoFactorVerifyProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setError('');
    try {
      await onVerify(code);
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length === 6) {
      handleSubmit();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          Two-Factor Authentication
        </CardTitle>
        <p className="text-sm text-gray-500 mt-2">
          Enter the 6-digit code from your authenticator app
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                setError('');
              }}
              onKeyPress={handleKeyPress}
              maxLength={6}
              className="text-center text-2xl tracking-widest font-mono"
              autoFocus
              disabled={loading}
            />
            {error && (
              <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={loading || code.length !== 6}
              className="flex-1"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
            {onCancel && (
              <Button onClick={onCancel} variant="outline" disabled={loading}>
                Cancel
              </Button>
            )}
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
            <p className="font-semibold mb-1">💡 Tip</p>
            <p>Open your authenticator app (Google Authenticator, Authy, etc.) and enter the 6-digit code shown for CivicLens.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
