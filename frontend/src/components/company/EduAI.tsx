import React from "react";
import useReveal from "../../hooks/useReveal";

const EDUAI_LINK = "https://yasindigitalsolutions.online/"; // Placeholder link, replace with actual Render URL

export default function EduAI() {
  const reveal = useReveal("animate-fade-in");

  return (
    <section ref={reveal as any} id="eduai" className="py-16 bg-blue-600 text-white text-center">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-extrabold mb-4">YDS EduAI</h2>
        <p className="text-lg max-w-2xl mx-auto mb-8">
          Our cutting-edge AI-driven learning platform, YDS EduAI, is designed to revolutionize
          education for colleges. It offers personalized learning experiences with teacher-managed content.
        </p>

        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 mb-8">
          Live
        </span>

        <div className="mt-8">
          <a
            href={EDUAI_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-yellow-400 text-yellow-900 hover:bg-yellow-300 h-10 px-6 py-2 shadow-lg transform hover:scale-105 transition-transform duration-200"
          >
            Explore YDS EduAI
          </a>
        </div>
      </div>
    </section>
  );
}
