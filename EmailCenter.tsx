import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  Clock, 
  Sliders, 
  Eye, 
  FileText, 
  Sparkles, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { EmailNotification, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../utils/i18n';

interface EmailCenterProps {
  emails: EmailNotification[];
  currentLang: SupportedLanguage;
  onSendTestEmail: (payload: any) => Promise<void>;
}

export const EmailCenter: React.FC<EmailCenterProps> = ({
  emails,
  currentLang,
  onSendTestEmail,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(emails[0] || null);
  const [testRecipient, setTestRecipient] = useState('customer.demo@omniorder.internal');
  const [testSubject, setTestSubject] = useState('📦 Your Order #ORD-892401 is in Transit!');
  const [testType, setTestType] = useState('dispatched');
  const [testBody, setTestBody] = useState('<p>Hello Marcus,</p><p>Your package has been dispatched with courier Carlos Mendez. Real-time GPS tracking is active with delivery PIN: <strong>4829</strong>.</p><p>Thank you for choosing OmniOrder Hub!</p>');
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Automation triggers state
  const [rules, setRules] = useState({
    orderConfirmation: true,
    dispatchNotice: true,
    outForDelivery: true,
    deliveredReceipt: true,
    lowStockWarning: true,
    weeklySalesDigest: true,
  });

  const handleTestSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setStatusMsg(null);
    try {
      await onSendTestEmail({
        recipientEmail: testRecipient,
        subject: testSubject,
        type: testType,
        message: testBody,
      });
      setStatusMsg('✅ Email dispatched and recorded in transaction ledger!');
      setTimeout(() => setStatusMsg(null), 3500);
    } catch (e) {
      setStatusMsg('❌ Failed to dispatch email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Automated Transactional Dispatcher
              </span>
              <span className="text-xs text-slate-400 font-mono">
                SMTP / REST Webhook Relay
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Automated Email Notifications & Templates
            </h2>
            <p className="text-xs text-slate-500">
              Trigger instant customer order updates, dynamic shipping receipts, and executive weekly briefings.
            </p>
          </div>
        </div>

        {/* Automation Triggers Checklist */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {Object.entries(rules).map(([key, val]) => (
            <label
              key={key}
              className={`p-2.5 rounded-xl border flex flex-col justify-between cursor-pointer select-none transition-all ${
                val
                  ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-bold'
                  : 'border-slate-200 bg-slate-50 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <input
                  type="checkbox"
                  checked={val}
                  onChange={() => setRules((prev) => ({ ...prev, [key]: !val }))}
                  className="rounded text-blue-600 focus:ring-0"
                />
              </div>
              <span className="text-[9px] text-slate-500 mt-1">
                {val ? '● Automated' : '○ Paused'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Main 2-Col Grid: Dispatch History & Live HTML Preview / Sender */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Sent Email Feed */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Dispatched History ({emails.length})
            </h3>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
              Live Deliveries
            </span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {emails.map((em) => (
              <div
                key={em.id}
                onClick={() => setSelectedEmail(em)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedEmail?.id === em.id
                    ? 'border-blue-600 bg-blue-50/60 shadow-sm'
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-blue-600 font-bold truncate">
                    {em.orderNumber ? `#${em.orderNumber}` : 'SYSTEM'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(em.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="font-bold text-slate-800 line-clamp-1">{em.subject}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{em.recipientEmail}</p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Delivered & Verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: Live Email Template Preview & Test Dispatcher */}
        <div className="lg:col-span-2 space-y-4">
          {/* Rendered HTML Email Viewer */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Live Rendered Email Preview
                </h3>
                <p className="text-xs text-slate-500">
                  Recipient: <strong className="text-slate-800">{selectedEmail?.recipientEmail || 'None selected'}</strong>
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2.5 py-1 rounded">
                HTML5 Container
              </span>
            </div>

            {selectedEmail ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner bg-slate-50">
                {/* Simulated Email Client Top Header */}
                <div className="bg-slate-200/80 px-4 py-2 text-[11px] text-slate-600 border-b border-slate-300 flex items-center justify-between">
                  <span className="font-medium">
                    From: <strong>OmniOrder Logistics &lt;notifications@omniorder.io&gt;</strong>
                  </span>
                  <span>{new Date(selectedEmail.sentAt).toLocaleString()}</span>
                </div>
                <div className="p-6 bg-white min-h-[180px] text-slate-800 text-xs leading-relaxed space-y-3">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                      O
                    </div>
                    <span className="font-black text-slate-900 text-sm">OmniOrder Hub</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedEmail.subject}</h4>
                  <div
                    className="prose prose-sm text-slate-700"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.htmlContent }}
                  />
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Select an email from the history list to preview rendered contents.
              </div>
            )}
          </div>

          {/* Manual / Test Email Dispatch Box */}
          <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  Test Email Dispatch & Notification Simulation
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Instant Relay
              </span>
            </div>

            <form onSubmit={handleTestSend} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Recipient Address</label>
                  <input
                    type="email"
                    required
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Subject Line</label>
                  <input
                    type="text"
                    required
                    value={testSubject}
                    onChange={(e) => setTestSubject(e.target.value)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-1 focus:ring-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Email Body HTML / Plain Text</label>
                <textarea
                  rows={3}
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  className="w-full p-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-1 focus:ring-blue-400 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="submit"
                  disabled={sending}
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sending ? 'Dispatching...' : 'Send Test Notification'}</span>
                </button>

                {statusMsg && (
                  <span className="text-xs font-semibold text-emerald-400 animate-fade-in">
                    {statusMsg}
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
