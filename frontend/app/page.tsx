'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function Home() {
  const { data: session } = useSession();
  const [selectedPlan, setSelectedPlan] = useState<'lifetime' | 'premium' | null>(null);
  const [loading, setLoading] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBuyPlan = async (plan: 'lifetime' | 'premium') => {
    if (!session) {
      signIn('google');
      return;
    }

    setLoading(true);
    try {
      const orderResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders`,
        { plan },
        {
          headers: {
            Authorization: `Bearer ${(session as any).accessToken}`,
          },
        }
      );

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: orderResponse.data.amount,
        currency: 'INR',
        name: 'UnSaid',
        description: `${plan === 'lifetime' ? 'Lifetime' : 'Premium Annual'} Subscription`,
        order_id: orderResponse.data.id,
        handler: async (response: any) => {
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/confirm`,
            {
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              plan,
            },
            {
              headers: {
                Authorization: `Bearer ${(session as any).accessToken}`,
              },
            }
          );
          window.location.href = '/dashboard';
        },
        prefill: {
          email: session?.user?.email,
          name: session?.user?.name,
        },
        theme: {
          color: '#000000',
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  if (session?.hasSubscription) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome back!</h1>
          <p className="text-lg text-gray-400 mb-8">You have an active subscription</p>
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.6);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-fade-in-scale {
          animation: fadeInScale 0.6s ease-out forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out forwards;
        }

        .animate-pulse-slow {
          animation: pulse 2s ease-in-out infinite;
        }

        .glow-effect {
          animation: glow 2s ease-in-out infinite;
        }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }

        .text-shadow-glow {
          text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
        }
      `}</style>

      {/* Navigation */}
      <nav className="border-b border-gray-800 py-4 px-6 sticky top-0 z-50 bg-black/80 backdrop-blur animate-fade-in-up">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wider">UnSaid</h1>
          {session?.user ? (
            <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition cursor-pointer">
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-8 h-8 rounded-full border border-blue-500"
                />
              )}
              <span className="text-sm text-gray-300 max-w-[100px] truncate">Hi, {session.user.name?.split(' ')[0]}</span>
            </Link>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition transform hover:scale-105"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* HERO SECTION - Raw Emotional Core */}
      <section className="max-w-7xl mx-auto px-6 py-40 min-h-screen flex flex-col justify-center">
        <div className="space-y-10">
          {/* First line - question */}
          <div className="space-y-4">
            <h2 className="text-6xl md:text-8xl font-bold leading-tight animate-fade-in-up">
              What would you say
            </h2>
            <h2 className="text-6xl md:text-8xl font-bold leading-tight animate-fade-in-up delay-100">
              if nobody would know
            </h2>
            <h2 className="text-6xl md:text-8xl font-bold leading-tight animate-fade-in-up delay-200">
              it was <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">you</span>?
            </h2>
          </div>

          {/* Subtext - Raw and honest */}
          <div className="space-y-6 pt-8 opacity-0 animate-fade-in-up delay-300" style={{ animationFillMode: 'forwards' }}>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed">
              That comment you didn't have the courage to make. The opinion you're too afraid to share. The truth about how you really feel about someone.
            </p>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed italic">
              What if you could finally say it? No names. No consequences. No looking back.
            </p>
            <p className="text-sm text-gray-500">
              You're not alone. Most people have things they wish they could say.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex gap-4 pt-8 opacity-0 animate-fade-in-up delay-400" style={{ animationFillMode: 'forwards' }}>
            <button
              onClick={() => signIn('google')}
              className="px-8 py-4 bg-white text-black font-bold text-lg rounded-lg hover:bg-gray-200 transition transform hover:scale-105 active:scale-95"
            >
              Start Anonymous
            </button>
            <a
              href="#realStories"
              className="px-8 py-4 border-2 border-white text-white font-bold text-lg rounded-lg hover:bg-white hover:text-black transition transform hover:scale-105"
            >
              See Real Stories
            </a>
          </div>

          {/* Scroll indicator */}
          <div className="pt-16 opacity-0 animate-fade-in-up delay-500" style={{ animationFillMode: 'forwards' }}>
            <div className="text-gray-500 text-sm animate-bounce">Scroll to see what others are saying ↓</div>
          </div>
        </div>
      </section>

      {/* REAL STORIES SECTION - Emotional Authenticity */}
      <section id="realStories" className="bg-gray-950 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-5xl font-bold mb-4 animate-fade-in-up">Why People Come Here</h3>
          <p className="text-gray-400 text-lg mb-20 animate-fade-in-up delay-100">These are real reasons people use UnSaid</p>

          <div className="space-y-8">
            {/* Story 1 */}
            <div className="border-l-4 border-blue-500 pl-8 py-6 hover:bg-gray-900 transition rounded-r-lg px-6 animate-fade-in-up delay-200">
              <div className="text-blue-400 text-sm font-semibold mb-2">WORKPLACE</div>
              <p className="text-xl text-gray-200 mb-4">
                "My boss takes credit for my work constantly. I've wanted to tell him exactly what I think for 2 years. Here I finally could."
              </p>
              <p className="text-sm text-gray-500">He'll never know it was me. That's the point.</p>
            </div>

            {/* Story 2 */}
            <div className="border-l-4 border-purple-500 pl-8 py-6 hover:bg-gray-900 transition rounded-r-lg px-6 animate-fade-in-up delay-300">
              <div className="text-purple-400 text-sm font-semibold mb-2">FRIENDSHIP</div>
              <p className="text-xl text-gray-200 mb-4">
                "My best friend hurt me badly, but if I tell them, we can never be friends again. I needed to say it somewhere."
              </p>
              <p className="text-sm text-gray-500">Getting it out there made me realize what I actually need to do next.</p>
            </div>

            {/* Story 3 */}
            <div className="border-l-4 border-pink-500 pl-8 py-6 hover:bg-gray-900 transition rounded-r-lg px-6 animate-fade-in-up delay-400">
              <div className="text-pink-400 text-sm font-semibold mb-2">FAMILY</div>
              <p className="text-xl text-gray-200 mb-4">
                "I love my parents but they always criticize me. I've never been able to tell them how much it hurts."
              </p>
              <p className="text-sm text-gray-500">Now I can. And they'll read my truth without defensiveness clouding everything.</p>
            </div>

            {/* Story 4 */}
            <div className="border-l-4 border-green-500 pl-8 py-6 hover:bg-gray-900 transition rounded-r-lg px-6 animate-fade-in-up delay-500">
              <div className="text-green-400 text-sm font-semibold mb-2">ROMANCE</div>
              <p className="text-xl text-gray-200 mb-4">
                "I needed to tell someone how I really feel about them without it becoming a whole thing. This was perfect."
              </p>
              <p className="text-sm text-gray-500">They'll think about my words without the pressure of how to respond to my face.</p>
            </div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM - Deep Emotional Connection */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <h3 className="text-5xl font-bold mb-20 text-center animate-fade-in-up">
          Why You're Here
        </h3>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Left side - The Real Situation */}
          <div className="space-y-8">
            <div>
              <h4 className="text-3xl font-bold mb-4 flex items-center gap-3">
                <span className="text-4xl">🤐</span> You Can't Say It
              </h4>
              <p className="text-gray-300 leading-relaxed">
                That thing you want to tell them? If you do, everything changes. Relationships end. Friendships break. Peace disappears. So you swallow it instead.
              </p>
            </div>

            <div>
              <h4 className="text-3xl font-bold mb-4 flex items-center gap-3">
                <span className="text-4xl">💔</span> It's Eating You From Inside
              </h4>
              <p className="text-gray-300 leading-relaxed">
                The unspoken resentment. The unsaid anger. Year after year it builds. You can feel the relationship rotting. And you can't do anything about it.
              </p>
            </div>
          </div>

          {/* Right side - The Solution */}
          <div className="space-y-8">
            <div className="border-l-4 border-blue-500 pl-6">
              <h4 className="text-3xl font-bold mb-4">But What If You Could?</h4>
              <p className="text-gray-300 leading-relaxed mb-3">
                Anonymous. No names. No way to trace it back to you. They'll read your truth without defensiveness. Without anger. They'll actually hear you.
              </p>
              <p className="text-sm text-gray-500">
                And you'll finally feel the relief of saying it.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-6">
              <p className="text-gray-300 italic">
                "It's not about hurting them. It's about finally being honest. Even if they never know it's you."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROOF SECTION - Real Impact */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <h3 className="text-5xl font-bold text-center mb-20 animate-fade-in-up">
          What Actually Happens
        </h3>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              emoji: "👩‍💼",
              text: "My boss finally understood why I was frustrated. He apologized.",
              author: "Priya",
              color: "border-blue-500",
            },
            {
              emoji: "👨‍🎓",
              text: "I told my friend the truth. It was scary but it saved our friendship.",
              author: "Arjun",
              color: "border-purple-500",
            },
            {
              emoji: "💑",
              text: "My partner finally understood me in a way they never had before.",
              author: "Sneha",
              color: "border-pink-500",
            },
            {
              emoji: "🎨",
              text: "They responded differently because they read it without defensiveness.",
              author: "Maya",
              color: "border-green-500",
            },
          ].map((testimonial, i) => (
            <div
              key={i}
              className={`border-l-4 ${testimonial.color} pl-6 py-4 animate-fade-in-up`}
              style={{ animationDelay: `${0.1 * (i + 1)}s`, animationFillMode: 'forwards', opacity: 0 }}
            >
              <p className="text-4xl mb-3">{testimonial.emoji}</p>
              <p className="text-gray-300 mb-3 italic leading-relaxed">"{testimonial.text}"</p>
              <p className="font-bold text-sm text-gray-400">— {testimonial.author}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY THIS MATTERS */}
      <section className="bg-gray-950 py-32 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h3 className="text-5xl font-bold animate-fade-in-up">You Can't Put a Price on Truth</h3>
          <p className="text-xl text-gray-300 leading-relaxed animate-fade-in-up delay-100">
            But you can invest in yourself. In your relationships. In your mental health.
          </p>
          <p className="text-lg text-gray-400 animate-fade-in-up delay-200">
            This isn't about money. It's about saying: <span className="text-white font-bold">"My truth matters. I'm worth it."</span>
          </p>
          <p className="text-gray-500 text-sm animate-fade-in-up delay-300">
            When you invest in a tool to finally be honest, you're telling yourself that honesty is worth something. And it is.
          </p>
        </div>
      </section>

      {/* PRICING - Finally */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-20">
          <h3 className="text-5xl font-bold mb-4 animate-fade-in-up">Your Truth, Two Ways</h3>
          <p className="text-gray-400 text-lg animate-fade-in-up delay-100">Choose what feels right for you</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Lifetime */}
          <div className="border border-gray-700 rounded-lg p-8 hover:border-gray-600 transition bg-black animate-fade-in-up delay-200 transform hover:scale-105">
            <h4 className="text-2xl font-bold mb-2">Lifetime</h4>
            <p className="text-gray-400 mb-8">Say everything, forever</p>
            <div className="mb-8">
              <span className="text-5xl font-bold">₹499</span>
              <span className="text-gray-400 ml-3 text-sm">one time</span>
            </div>
            <ul className="space-y-3 mb-8 text-gray-300">
              <li className="flex items-center">
                <span className="mr-3 text-green-400 text-xl">✓</span> Unlimited confessions
              </li>
              <li className="flex items-center">
                <span className="mr-3 text-green-400 text-xl">✓</span> Forever access
              </li>
              <li className="flex items-center">
                <span className="mr-3 text-green-400 text-xl">✓</span> Complete anonymity
              </li>
            </ul>
            <button
              onClick={() => handleBuyPlan('lifetime')}
              disabled={loading}
              className="w-full px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition disabled:opacity-50 transform hover:scale-105 active:scale-95"
            >
              {loading ? 'Processing...' : 'Choose Lifetime'}
            </button>
          </div>

          {/* Premium */}
          <div className="border-2 border-blue-500 rounded-lg p-8 bg-blue-950/20 hover:border-blue-400 transition relative animate-fade-in-up delay-300 transform hover:scale-105">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-1 rounded-full text-sm font-bold animate-fade-in-scale">
                Most Choose This
              </span>
            </div>
            <h4 className="text-2xl font-bold mb-2 pt-4">Premium</h4>
            <p className="text-gray-400 mb-8">Support the future of truth</p>
            <div className="mb-8">
              <span className="text-5xl font-bold">₹999</span>
              <span className="text-gray-400 ml-3 text-sm">per year</span>
            </div>
            <ul className="space-y-3 mb-8 text-gray-300">
              <li className="flex items-center">
                <span className="mr-3 text-blue-400 text-xl">✓</span> Unlimited confessions
              </li>
              <li className="flex items-center">
                <span className="mr-3 text-blue-400 text-xl">✓</span> Complete anonymity
              </li>
              <li className="flex items-center">
                <span className="mr-3 text-blue-400 text-xl">✓</span> Early access to features
              </li>
              <li className="flex items-center">
                <span className="mr-3 text-blue-400 text-xl">✓</span> Help build the future
              </li>
            </ul>
            <button
              onClick={() => handleBuyPlan('premium')}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-lg hover:opacity-90 transition disabled:opacity-50 transform hover:scale-105 active:scale-95"
            >
              {loading ? 'Processing...' : 'Choose Premium'}
            </button>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-12">
          💳 Secure payment. No hidden costs. Cancel anytime (annual only).
        </p>
      </section>

      {/* FINAL TRUTH */}
      <section className="bg-gray-950 py-32 px-6 text-center space-y-8">
        <h3 className="text-5xl font-bold animate-fade-in-up">How long are you going to wait?</h3>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-100">
          That thing you've been wanting to say. That person you've been wanting to be honest with. That truth you've been carrying alone.
        </p>
        <p className="text-lg text-gray-400 animate-fade-in-up delay-200">
          Tomorrow's a good day to finally say it.
        </p>
        <button
          onClick={() => signIn('google')}
          className="px-10 py-4 bg-white text-black font-bold text-lg rounded-lg hover:bg-gray-200 transition inline-block transform hover:scale-105 active:scale-95 animate-fade-in-up delay-300"
        >
          Start Now, Pay Later
        </button>
        <p className="text-gray-500 text-sm animate-fade-in-up delay-400">
          Try your first confession free. No credit card. No commitment.
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6 bg-black text-center text-gray-500 text-sm">
        <p>© 2025 UnSaid. Where honesty lives.</p>
      </footer>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  );
}
