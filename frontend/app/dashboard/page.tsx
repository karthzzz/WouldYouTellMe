'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Confession {
  id: string;
  message: string;
  recipient: string;
  contact: string;
  contact_type: string;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [message, setMessage] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientContact, setRecipientContact] = useState('');
  const [contactType, setContactType] = useState<'email' | 'whatsapp'>('email');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (session) {
      loadConfessions();
    }
  }, [session, status, router]);

  const loadConfessions = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/confessions`,
        {
          headers: {
            Authorization: `Bearer ${(session as any).accessToken}`,
          },
        }
      );
      setConfessions(response.data.confessions);
    } catch (error) {
      console.error('Error loading confessions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/confessions`,
        {
          message,
          recipient_name: recipientName,
          recipient_contact: recipientContact,
          contact_type: contactType,
        },
        {
          headers: {
            Authorization: `Bearer ${(session as any).accessToken}`,
          },
        }
      );

      // Reset form
      setMessage('');
      setRecipientName('');
      setRecipientContact('');
      setSubmitted(true);

      // Reload confessions
      loadConfessions();

      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Error submitting confession:', error);
      alert('Failed to submit confession');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">UnSaid</h1>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Welcome, {session?.user?.name}!</h2>
          <p className="text-gray-400">You have unlimited access. Start sending confessions.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="md:col-span-1">
            <div className="border border-gray-800 rounded-lg p-6 bg-gray-950">
              <h3 className="text-xl font-bold mb-6">Send Confession</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    minLength={10}
                    maxLength={2000}
                    placeholder="Share your honest thoughts..."
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
                    rows={4}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {message.length}/2000
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Recipient Name</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Who is this for?"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Contact Type</label>
                  <select
                    value={contactType}
                    onChange={(e) => setContactType(e.target.value as 'email' | 'whatsapp')}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
                  >
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {contactType === 'email' ? 'Email Address' : 'Phone Number'}
                  </label>
                  <input
                    type={contactType === 'email' ? 'email' : 'tel'}
                    value={recipientContact}
                    onChange={(e) => setRecipientContact(e.target.value)}
                    placeholder={contactType === 'email' ? 'example@email.com' : '+91 98765 43210'}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Confession'}
                </button>

                {submitted && (
                  <div className="p-3 bg-green-900 text-green-200 rounded-lg text-sm">
                    ✓ Confession sent successfully!
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Confessions List */}
          <div className="md:col-span-2">
            <div className="border border-gray-800 rounded-lg p-6 bg-gray-950">
              <h3 className="text-xl font-bold mb-6">Your Confessions ({confessions.length})</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {confessions.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No confessions yet. Send your first one!</p>
                ) : (
                  confessions.map((conf) => (
                    <div key={conf.id} className="border border-gray-700 rounded-lg p-4 bg-gray-900">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">To: {conf.recipient}</p>
                          <p className="text-sm text-gray-400">
                            {conf.contact_type === 'email' ? '📧' : '📱'} {conf.contact}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-gray-800 rounded">
                          {conf.status}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{conf.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(conf.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  );
}
