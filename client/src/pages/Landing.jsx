import React, { useState } from "react";
import { Layout, Globe, Settings, ArrowRight, BarChart2, Target, Shield, Award, Users, TrendingUp, AlertTriangle, CheckCircle, Star, Clock, TrendingDown } from 'lucide-react';

function Landing() {
  const [websiteLink, setWebsiteLink] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [mappedData, setMappedData] = useState(null);

  const fetchWithRetry = async (url, options, maxRetries = 3) => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        lastError = error;
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
      }
    }
    throw lastError;
  };

  const handleSubmit = async () => {
    if (websiteLink.trim() !== "") {
      setIsLoading(true);
      setLoadingProgress(10);

      try {
        const formData = new URLSearchParams();
        formData.append('url', websiteLink);

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setLoadingProgress(prev => {
            if (prev < 90) return prev + 1;
            return prev;
          });
        }, 1000);

        const data = await fetchWithRetry('http://127.0.0.1:5000/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData
        });

        clearInterval(progressInterval);
        setLoadingProgress(100);
        setAnalysisData(data);
        setIsSubmitted(true);
        mapApiData(data);
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to analyze website. Please try again.');
      } finally {
        setIsLoading(false);
        setLoadingProgress(0);
      }
    } else {
      alert("Please enter a valid website link.");
    }
  };

  const mapApiData = (data) => {
    const mapped = {
      benchmark: data.measurement_plan.kpis[0].current_benchmark,
      successCriteria: data.measurement_plan.kpis[0].success_criteria,
      primaryCTA: data.optimization_recommendations.conversion_funnel_optimization.entry_points.primary_cta,
      // Add more mappings as needed
    };
    setMappedData(mapped);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Enhanced Navbar */}
      <nav className="bg-white/90 backdrop-blur-sm fixed w-full z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                CRO-PRO
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-full hover:shadow-lg transition-all duration-300">
                <a href="/login">Login</a>
              </button>
              <button className="px-6 py-2 text-sm font-medium text-blue-600 border-2 border-blue-500 rounded-full hover:bg-blue-50 transition-all duration-300">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 pt-24 pb-12">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Boost Your Website's <span className="text-blue-600">Conversion Rate</span> With AI
          </h2>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Get instant, AI-powered recommendations to improve your website's performance
            and convert more visitors into customers.
          </p>
        </div>

        {/* Enhanced Input Section */}
        <div className="w-full max-w-xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-2">
            <input
              type="text"
              placeholder="Enter your website URL (e.g., www.example.com)"
              value={websiteLink}
              onChange={(e) => setWebsiteLink(e.target.value)}
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
            <button
              onClick={handleSubmit}
              className="w-full md:w-auto whitespace-nowrap px-16 py-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-full hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Analyze Now
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 mb-12">
          {analysisData ? (
            // Display API response data if available
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Performance Overview</h3>
              <p className="text-gray-600">Benchmark: {mappedData?.benchmark}</p>
              <p className="text-gray-600">Success Criteria: {mappedData?.successCriteria}</p>
              <p className="text-gray-600">Primary CTA: {mappedData?.primaryCTA}</p>
            </div>
          ) : (
            // Default feature cards if no API response
            [
              { icon: "🚀", title: "Speed Analysis", desc: "Get detailed insights about your website's loading speed" },
              { icon: "🎯", title: "CRO Score", desc: "Understand your conversion rate optimization potential" },
              { icon: "📱", title: "Mobile-First", desc: "Ensure your website performs well on all devices" }
            ].map((feature, index) => (
              <div key={index} className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Enhanced Loading Modal */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="flex flex-col items-center space-y-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
              <h3 className="text-2xl font-semibold text-gray-800">Analyzing your website...</h3>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-blue-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <p className="text-gray-600 text-center">
                Please wait while we analyze your website.
                <br />
                This typically takes 1-2 minutes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Results Section */}
      {isSubmitted && analysisData && (
        <section className="bg-gray-100 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Website Analysis Preview:
            </h3>
            <div className="bg-white p-6 rounded-lg shadow">
              {/* Show only Performance Overview as preview */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <div className="w-5 h-5 text-blue-500">📊</div>
                  Performance Overview
                </h4>
                <div className="space-y-4">
                  {mappedData && (
                    <div>
                      <p>Benchmark: {mappedData?.benchmark}</p>
                      <p>Success Criteria: {mappedData?.successCriteria}</p>
                      <p>Primary CTA: {mappedData?.primaryCTA}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Login prompt */}
              <div className="text-center mt-6">
                <p className="text-gray-700 mb-4">
                  Login to access the complete analysis including:
                </p>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li>• Detailed Performance Metrics</li>
                  <li>• SEO Recommendations</li>
                  <li>• Conversion Optimization Tips</li>
                  <li>• Industry Benchmarks</li>
                </ul>
                <button className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600">
                  <a href="/login">Login to View Full Report</a>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default Landing;
