"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { authApi } from '@/lib/api/auth';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TwoFactorSetup } from '@/components/auth/TwoFactorSetup';
import { Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function SecuritySettingsPage() {
  const { user } = useAuth();
  const [twoFAStatus, setTwoFAStatus] = useState<{ enabled: boolean; required: boolean } | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTwoFAStatus();
  }, []);

  const loadTwoFAStatus = async () => {
    try {
      const status = await authApi.get2FAStatus();
      setTwoFAStatus(status);
    } catch (error) {
      toast.error('Failed to load 2FA status');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    const code = prompt('Enter your 6-digit 2FA code to disable:');
    if (!code) return;

    try {
      await authApi.disable2FA(code);
      toast.success('Two-factor authentication disabled');
      await loadTwoFAStatus();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to disable 2FA');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (showSetup) {
    return (
      <div className="p-6">
        <TwoFactorSetup
          onComplete={() => {
            setShowSetup(false);
            loadTwoFAStatus();
          }}
          onCancel={() => setShowSetup(false)}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account security and authentication methods</p>
      </div>

      <div className="space-y-6">
        {/* 2FA Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Two-Factor Authentication (2FA)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {twoFAStatus?.enabled ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium">
                      {twoFAStatus?.enabled ? 'Enabled' : 'Disabled'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {twoFAStatus?.enabled
                        ? 'Your account is protected with 2FA'
                        : 'Add an extra layer of security to your account'}
                    </p>
                  </div>
                </div>
                <div>
                  {twoFAStatus?.enabled ? (
                    <Button onClick={handleDisable2FA} variant="outline" size="sm">
                      Disable
                    </Button>
                  ) : (
                    <Button onClick={() => setShowSetup(true)} size="sm">
                      Enable 2FA
                    </Button>
                  )}
                </div>
              </div>

              {/* Required Notice */}
              {twoFAStatus?.required && !twoFAStatus?.enabled && (
                <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900">2FA Required</p>
                    <p className="text-sm text-yellow-800 mt-1">
                      Two-factor authentication is required for your role ({user?.role}). Please enable it to ensure account security.
                    </p>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="text-sm text-gray-600 space-y-2">
                <p className="font-medium">How it works:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Install an authenticator app (Google Authenticator, Authy, etc.)</li>
                  <li>Scan the QR code or enter the secret key</li>
                  <li>Enter the 6-digit code from your app when logging in</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sessions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Manage your active login sessions across different devices
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/settings/sessions'}>
              View Sessions
            </Button>
          </CardContent>
        </Card>

        {/* Password Card */}
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Change your password to keep your account secure
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/settings/password'}>
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
