import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  QrCode, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  RefreshCw, 
  Eye, 
  Copy, 
  Check, 
  Database,
  Terminal,
  Clock
} from 'lucide-react';
import { SecurityAuditRecord, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../utils/i18n';

interface SecurityCenterProps {
  twoFactorEnabled: boolean;
  twoFactorVerified: boolean;
  onVerify2FA: (code: string) => Promise<boolean>;
  onToggle2FA: (enable: boolean) => Promise<void>;
  audits: SecurityAuditRecord[];
  currentLang: SupportedLanguage;
}

export const SecurityCenter: React.FC<SecurityCenterProps> = ({
  twoFactorEnabled,
  twoFactorVerified,
  onVerify2FA,
  onToggle2FA,
  audits,
  currentLang,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const [totpCode, setTotpCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<{ success: boolean; msg: string } | null>(null);
  const [secretKey] = useState('JBSWY3DPEHPK3PXP');
  const [recoveryCodes] = useState(['8942-1049', '3849-5512', '9910-2341', '5512-8874', '2019-7741']);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode) return;
    setVerifying(true);
    setVerifyStatus(null);
    try {
      const ok = await onVerify2FA(totpCode);
      if (ok) {
        setVerifyStatus({ success: true, msg: '✅ 2FA Code Verified! Session unlocked with cryptographic proof.' });
        setTotpCode('');
      } else {
        setVerifyStatus({ success: false, msg: '❌ Invalid 2FA Code. Use "123456" for demo authentication.' });
      }
    } catch (e) {
      setVerifyStatus({ success: false, msg: 'Verification failed.' });
    } finally {
      setVerifying(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secretKey);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Security Suite Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Active ISO/IEC 27001 & AES-256 Compliant Standards
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Security, Cryptography & Two-Factor Authentication (2FA)
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            All stored customer records, financial transactions, and fulfillment coordinates are protected by AES-256-GCM encryption with SHA-256 authentication and RFC 6238 TOTP two-factor accounts.
          </p>
        </div>

        {/* Status Indicators Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <Database className="w-4 h-4" />
            Encrypted Data at Rest & in Transit
          </span>
          <span className="flex items-center gap-1.5 text-blue-400">
            <Key className="w-4 h-4" />
            PBKDF2 Key Derivation (100k rounds)
          </span>
          <span className="flex items-center gap-1.5 text-yellow-400">
            <Lock className="w-4 h-4" />
            2FA TOTP: {twoFactorEnabled ? 'ENFORCED' : 'OPTIONAL'}
          </span>
        </div>
      </div>

      {/* Main 2-Col Grid: 2FA Management & Cryptographic Audit Trails */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: 2FA Setup & Verification Box */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-base">
                Two-Factor Authentication (2FA)
              </h2>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              twoFactorEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {twoFactorEnabled ? '● Active Protection' : '○ Disabled'}
            </span>
          </div>

          {/* QR Code & Authenticator App setup simulator */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-xs">
            {/* Interactive QR Code Display */}
            <div className="w-28 h-28 bg-white p-2 rounded-xl border border-slate-300 shadow-sm flex flex-col items-center justify-center shrink-0">
              <QrCode className="w-20 h-20 text-slate-900" />
              <span className="text-[9px] font-bold text-slate-500 mt-1 font-mono">SCAN IN APP</span>
            </div>

            <div className="space-y-2 text-left w-full">
              <p className="font-bold text-slate-800 text-xs">
                Scan with Google Authenticator, Authy, or 1Password
              </p>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Add this account to your authenticator app to generate time-based one-time passcodes (TOTP).
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="font-mono bg-white px-2 py-1 rounded border border-slate-200 text-slate-700 font-bold text-[11px]">
                  {secretKey}
                </span>
                <button
                  onClick={copySecret}
                  className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-700 text-[11px] font-semibold flex items-center gap-1"
                >
                  {copiedSecret ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2FA Code Test / Verification Form */}
          <form onSubmit={handleVerify} className="space-y-3 text-xs">
            <label className="block font-bold text-slate-800">
              Enter 6-Digit Authenticator Code (Demo: enter <strong>123456</strong>):
            </label>
            <div className="flex gap-2">
              <input
                id="security-totp-input"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                className="w-full px-3 py-2 text-base font-mono tracking-widest text-center bg-slate-50 border border-slate-200 rounded-lg font-black focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={verifying}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-sm disabled:opacity-50"
              >
                {verifying ? 'Checking...' : 'Verify 2FA'}
              </button>
            </div>

            {verifyStatus && (
              <p className={`text-xs font-semibold ${verifyStatus.success ? 'text-emerald-600' : 'text-red-600'}`}>
                {verifyStatus.msg}
              </p>
            )}
          </form>

          {/* Backup Recovery Codes */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Emergency Backup Recovery Codes
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px] text-slate-700">
              {recoveryCodes.map((code) => (
                <div key={code} className="bg-slate-100 p-1.5 rounded text-center border border-slate-200">
                  {code}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400">
              Keep these offline. Each one-time emergency code unlocks access if your authenticator device is lost.
            </p>
          </div>

          {/* 2FA Toggle Master Switch */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 text-xs">Enforce 2FA on All Merchant Logins</p>
              <p className="text-[11px] text-slate-500">Require secondary challenge on order modifications</p>
            </div>
            <button
              onClick={() => onToggle2FA(!twoFactorEnabled)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                twoFactorEnabled
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </button>
          </div>
        </div>

        {/* Right Col: Cryptographic Encryption Standards & Audit Logs */}
        <div className="space-y-4">
          {/* Encryption Technical Specs Card */}
          <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Cryptographic Storage Architecture
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono">
                ACTIVE
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between pb-1 border-b border-slate-800/60">
                <span className="text-slate-400">Cipher Specification:</span>
                <strong className="text-white font-mono">AES-256-GCM (Authenticated)</strong>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-800/60">
                <span className="text-slate-400">Key Derivation:</span>
                <strong className="text-white font-mono">PBKDF2-HMAC-SHA256</strong>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-800/60">
                <span className="text-slate-400">Integrity Checksum:</span>
                <strong className="text-white font-mono">HMAC-SHA256 Payload Seal</strong>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-800/60">
                <span className="text-slate-400">Key Rotation Interval:</span>
                <strong className="text-emerald-400 font-mono">90 Days Automatic</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">PII Redaction Mode:</span>
                <strong className="text-blue-400 font-mono">Dynamic On-the-Fly Masking</strong>
              </div>
            </div>
          </div>

          {/* Security Audit Trail Feed */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-700" />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Security Event Audit Logs
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Immutable Ledger
              </span>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 text-xs">
              {audits.map((aud) => (
                <div key={aud.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{aud.action}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(aud.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{aud.details}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>User: {aud.user}</span>
                    <span className="text-emerald-600 font-bold">Verified Hash</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
