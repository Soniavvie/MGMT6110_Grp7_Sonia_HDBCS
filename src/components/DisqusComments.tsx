import React, { useEffect } from 'react';
import { MessageSquare } from 'lucide-react';

declare global {
  interface Window {
    disqus_config?: (this: {
      page: {
        url: string;
        identifier: string;
      };
    }) => void;
    DISQUS?: {
      reset: (options: {
        reload: boolean;
        config?: (this: {
          page: {
            url: string;
            identifier: string;
          };
        }) => void;
      }) => void;
    };
  }
}

const DISQUS_SHORTNAME = 'vvie';
const PAGE_URL = 'https://mgmt6110week03problemset02.vercel.app/';
const PAGE_IDENTIFIER = 'home';
const SCRIPT_ID = 'disqus-embed-script';

export const DisqusComments: React.FC = () => {
  useEffect(() => {
    // Configure Disqus parameters
    window.disqus_config = function () {
      this.page.url = PAGE_URL;
      this.page.identifier = PAGE_IDENTIFIER;
    };

    // If DISQUS already exists on the window, reset it instead of reloading the script
    if (window.DISQUS) {
      window.DISQUS.reset({
        reload: true,
        config: function () {
          this.page.url = PAGE_URL;
          this.page.identifier = PAGE_IDENTIFIER;
        },
      });
      return;
    }

    // Only inject the script once, even across re-renders
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = `https://${DISQUS_SHORTNAME}.disqus.com/embed.js`;
      script.setAttribute('data-timestamp', String(+new Date()));
      script.async = true;
      (document.head || document.body).appendChild(script);
    }
  }, []);

  return (
    <section
      id="feedback-section"
      aria-label="Visitor Feedback"
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4"
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

      <div id="disqus_thread" className="min-h-[200px]" />
    </section>
  );
};
