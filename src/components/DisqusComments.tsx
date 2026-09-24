import React, { useEffect } from 'react';
import { MessageSquare } from 'lucide-react';

declare global {
  interface Window {
    disqus_config?: (this: any) => void;
    DISQUS?: {
      reset: (options: {
        reload: boolean;
        config?: ((this: any) => void) | undefined;
      }) => void;
    };
  }
}

export const DisqusComments: React.FC = () => {
  useEffect(() => {
    // 1. Configure Disqus thread parameters
    window.disqus_config = function (this: any) {
      this.page.url = 'https://mgmt6110week03problemset02.vercel.app/';
      this.page.identifier = 'home';
    };

    // 2. If DISQUS already exists, reset instead of injecting another script
    if (window.DISQUS) {
      window.DISQUS.reset({
        reload: true,
        config: window.disqus_config,
      });
    } else {
      // 3. Otherwise inject embed.js only once, guarding against duplicate loads and StrictMode double-invocations
      if (!document.querySelector('script[src="https://vvie.disqus.com/embed.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://vvie.disqus.com/embed.js';
        script.setAttribute('data-timestamp', String(+new Date()));
        (document.head || document.body).appendChild(script);
      }
    }
  }, []);

  return (
    <section
      id="feedback-section"
      aria-label="Visitor Feedback"
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-slate-300"
    >
      <div className="flex items-center gap-2 text-slate-200">
        <MessageSquare className="w-5 h-5 text-emerald-400" />
        <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white">
          Visitor Feedback
        </h2>
      </div>

      <p className="text-sm text-slate-300">
        Please let us know what worked for you and what did not.
      </p>

      {/* Empty Disqus container with explicit light grey text color for dark theme detection and dynamic height */}
      <div id="disqus_thread" className="text-slate-300" style={{ color: '#cbd5e1' }}></div>
    </section>
  );
};
