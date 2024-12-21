import React, { useState } from "react";

function Landing() {
  const [websiteLink, setWebsiteLink] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  // Mock recommendations data
  const recommendations = [
    "Add a clear call-to-action above the fold for better engagement.",
    "Optimize images for faster page loading speed.",
    "Add testimonials to build trust with visitors.",
    "Improve mobile responsiveness for better UX.",
    "Use heatmaps to analyze visitor behavior.",
  ];

  const handleSubmit = () => {
    if (websiteLink.trim() !== "") {
      setIsSubmitted(true);
    } else {
      alert("Please enter a valid website link.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <h1 className="text-xl font-bold text-gray-800">
                Website CRO Evaluation
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600">
              <a href="/login">Login</a>
              </button>
              <button className="px-4 py-2 text-sm font-medium text-blue-500 border border-blue-500 rounded hover:bg-blue-50">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
            Improve Your Website's Conversion Rate Optimization (CRO)
          </h2>
          <p className="text-gray-600 mb-8">
            Upload your website link to get AI-powered recommendations for
            better performance.
          </p>
        </div>
        <div className="w-full max-w-md">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Enter website link"
              value={websiteLink}
              onChange={(e) => setWebsiteLink(e.target.value)}
              className="flex-grow px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
            >
              Submit
            </button>
          </div>
        </div>
      </main>

      {/* Output Section */}
      {isSubmitted && (
        <section className="bg-gray-100 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              AI-Powered Recommendations:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg shadow ${
                    index < 3 || isPremiumUser
                      ? "bg-white"
                      : "bg-gray-200 opacity-50"
                  }`}
                >
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Improvement #{index + 1}
                  </h4>
                  <p
                    className={`${
                      index < 3 || isPremiumUser
                        ? "text-gray-600"
                        : "text-gray-400"
                    }`}
                  >
                    {rec}
                  </p>
                </div>
              ))}
            </div>
            {!isPremiumUser && recommendations.length > 3 && (
              <div className="text-center mt-6">
                <p className="text-gray-700">
                  Unlock all recommendations by upgrading to a premium account.
                </p>
                <button
                  onClick={() => setIsPremiumUser(true)}
                  className="px-4 py-2 mt-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
                >
                   <a href="/login">Login to view more</a>
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default Landing;
