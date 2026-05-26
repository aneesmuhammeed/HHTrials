import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const BlogNewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('subscribe')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') { // Unique violation
          throw new Error('This email is already subscribed.');
        }
        throw error;
      }

      setStatus('success');
      setEmail('');
    } catch (err: any) {
      console.error('Subscription error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to subscribe. Please try again.');
    }
  };

  return (
    <div className="w-full bg-[#281910] py-20 mt-16 -mb-16">
      <div className="max-w-4xl mx-auto px-6 text-white">
        {/* Top Icon */}
        <div className="flex justify-center mb-6">
          <BookOpen className="w-10 h-10 text-white" strokeWidth={1.5} />
        </div>

        {/* Section Title */}
        <h2 className="text-2xl font-semibold text-center mb-4">
          Join Our Heritage Community
        </h2>

        {/* Subtitle */}
        <p className="text-sm text-gray-300 text-center max-w-xl mx-auto leading-relaxed mb-8">
          Receive cultural research updates, heritage stories, and insights from our field team documenting Little Tibet's living traditions.
        </p>

        {/* Form */}
        <form onSubmit={handleSubscribe} className="flex flex-col items-center justify-center mb-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
            {/* Input Field */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full md:w-80 h-[42px] bg-transparent border border-gray-400 rounded-md px-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors disabled:opacity-50"
              required
              disabled={status === 'loading'}
            />

            {/* Subscribe Button */}
            <button 
              type="submit"
              disabled={status === 'loading'}
              className="w-full md:w-auto h-[42px] px-6 bg-transparent border border-gray-400 text-white text-sm rounded-md hover:bg-white hover:text-[#2b1408] transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-white"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>
          
          {/* Status Messages */}
          {status === 'success' && (
            <p className="text-sm text-green-400 mt-4 text-center">
              Thank you for subscribing!
            </p>
          )}
          {status === 'error' && (
            <p className="text-sm text-red-400 mt-4 text-center">
              {errorMessage}
            </p>
          )}
        </form>

        {/* Footnote Text */}
        <p className="text-xs text-gray-400 text-center mt-6">
          No spam. Only meaningful cultural narratives and research insights.
        </p>
      </div>
    </div>
  );
};

export default BlogNewsletterSection;
