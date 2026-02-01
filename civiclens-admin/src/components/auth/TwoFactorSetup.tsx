"use client";

import React, { useState } from 'react';
import { authApi } from '@/lib/api/auth';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Shield, Smartphone, Key, CheckCircle } from 'lucide-react';

interface TwoFactorSetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export function TwoFactorSetup({ onComplete, onCancel }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'intro' | 'scan' | 'verify'>('intro');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    try {
      setLoading(true);
      const data = await authApi.setup2FA();
      setQrCode(data.qr_code);
      setSecret(data.secret);
      setStep('scan');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    try {
      setLoading(true);
      await authApi.enable2FA(code);
      toast.success('Two-factor authentication enabled successfully!');
      setStep('verify');
      if (onComplete) {
        setTimeout(onComplete, 1500);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'intro') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Enable Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Why enable 2FA?</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Adds an extra layer of security to your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Protects against unauthorized access even if password is compromised</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Required for super admin accounts</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">What you'll need:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Smartphone className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Authenticator App</p>
                    <p className="text-xs text-gray-600">Google Authenticator, Authy, or similar</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Key className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Your Phone</p>
                    <p className="text-xs text-gray-600">To scan QR code and generate codes</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSetup} disabled={loading} className="flex-1">
                {loading ? 'Setting up...' : 'Continue'}
              </Button>
              {onCancel && (
                <Button onClick={onCancel} variant="outline">
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'scan') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Scan QR Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code with your authenticator app
              </p>
              {qrCode && (
                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <img src={qrCode} alt="2FA QR Code" className="w-64 h-64" />
                </div>
              )}
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Can't scan the QR code?
              </p>
              <p className="text-xs text-gray-600 mb-2">
                Enter this code manually in your authenticator app:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded font-mono text-sm">
                  {secret}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(secret);
                    toast.success('Secret copied to clipboard');
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Enter the 6-digit code from your app
              </label>
              <Input
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleVerify}
                disabled={loading || code.length !== 6}
                className="flex-1"
              >
                {loading ? 'Verifying...' : 'Verify & Enable'}
              </Button>
              <Button onClick={() => setStep('intro')} variant="outline">
                Back
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success step
  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">2FA Enabled!</h2>
          <p className="text-gray-600">
            Your account is now protected with two-factor authentication.
          </p>
          <p className="text-sm text-gray-500">
            You'll need to enter a code from your authenticator app each time you log in.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
