import React, { useState, useCallback } from 'react';
import { Layout, Globe, Settings, ArrowRight, BarChart2, Target, Shield, Award, Users, TrendingUp, AlertTriangle, CheckCircle, Star } from 'lucide-react';

const LoadingModal = ({ message, progress }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <h3 className="text-xl font-semibold text-gray-800">{message}</h3>
        {progress && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
        <p className="text-gray-600 text-center text-sm">
          This analysis typically takes 1-2 minutes to complete.
          <br />
          Please don't close this window.
        </p>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [selectedOption, setSelectedOption] = useState('website');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [websiteContent, setWebsiteContent] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchWithRetry = useCallback(async (url, options) => {
    let lastError;
    
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        lastError = error;
        setRetryCount(i + 1);
        setLoadingMessage(`Attempt ${i + 2}/${MAX_RETRIES}: Retrying analysis...`);
        await sleep(2000); // Wait 2 seconds before retrying
      }
    }
    throw lastError;
  }, []);

  const fetchWebsiteAnalysis = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage('Starting website analysis...');
      setLoadingProgress(10);
      setRetryCount(0);

      const formData = new URLSearchParams();
      formData.append('url', websiteUrl);
      
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
      setLoadingMessage('Analysis complete!');
      await sleep(500); // Show completion message briefly
      
      setAnalysisData(data);
      setWebsiteContent(data.code);
    } catch (error) {
      console.error('Error analyzing website:', error);
      alert(`Analysis failed after ${MAX_RETRIES} attempts. Please try again later.`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      setLoadingProgress(0);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setWebsiteUrl(url);
    if (url) {
      fetch(`http://127.0.0.1:5000/proxy?url=${url}`)
        .then(response => response.text())
        .then(data => setWebsiteContent(data))
        .catch(error => console.error('Error fetching proxy content:', error));
    }
  };

  const options = [
    {
      id: 'website',
      title: 'Analyze My Website',
      description: 'Get detailed CRO insights and suggestions for your website',
      icon: <Layout className="w-6 h-6 text-blue-500" />,
      color: 'bg-blue-50',
      metrics: ['Conversion Rate', 'Bounce Rate', 'User Flow Analysis']
    },
    {
      id: 'competitor',
      title: 'Analyze Competitor Website',
      description: 'Compare your performance with competitors',
      icon: <Globe className="w-6 h-6 text-purple-500" />,
      color: 'bg-purple-50',
      metrics: ['Market Position', 'Feature Comparison', 'Performance Gaps']
    },
    {
      id: 'integrate',
      title: 'Integrate Analytics Tool',
      description: 'Set up advanced tracking and analytics',
      icon: <Settings className="w-6 h-6 text-green-500" />,
      color: 'bg-green-50',
      metrics: ['Setup Guide', 'Data Integration', 'Custom Events']
    }
  ];

  const renderContent = () => {
    switch (selectedOption) {
      case 'website':
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-blue-600">Website Analysis Dashboard</h2>
            <div className="mb-6">
              <input
                type="text"
                value={websiteUrl}
                placeholder="Enter website URL"
                className="w-full p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 transition duration-200"
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />
              <button
                className="mt-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white p-3 rounded-lg shadow-lg hover:shadow-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={fetchWebsiteAnalysis}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  'Analyze Website'
                )}
              </button>
            </div>

            {analysisData && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-blue-500" />
                    Performance Overview
                  </h3>
                  <div className="space-y-6">
                    {Object.entries(analysisData.performance_score).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="font-semibold">{value}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              value > 70 ? 'bg-green-500' : 
                              value > 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                    Industry Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">Benchmark Conversion Rate</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {analysisData.industry_specific_metrics.benchmark_conversion_rate}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Key Metrics to Track</h4>
                      <ul className="space-y-2">
                        {analysisData.industry_specific_metrics.key_metrics_to_track.map((metric, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-gray-600">{metric}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-500" />
                    Conversion Elements
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(analysisData.conversion_elements).map(([key, values]) => (
                      <div key={key} className="border-b pb-4">
                        <h4 className="font-medium text-gray-700 mb-2 capitalize">
                          {key.replace(/_/g, ' ')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {values.map((item, idx) => (
                            <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-full bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Optimization Recommendations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {analysisData.niche_optimizations.map((opt, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <h4 className="font-semibold text-gray-800">{opt.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs ${
                            opt.impact === 'high' ? 'bg-red-100 text-red-700' :
                            opt.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {opt.impact.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{opt.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-600">Expected: {opt.expected_improvement}</span>
                          <span className="text-purple-600">Priority: {opt.implementation_priority}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Website Preview */}
            <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold mb-4">Website Preview</h3>
              <div className="mt-2 overflow-auto max-h-[500px] border rounded p-4">
                {websiteContent ? (
                  <div dangerouslySetInnerHTML={{ __html: websiteContent }} />
                ) : (
                  <p className="text-gray-500">Enter a URL and click Analyze to see the preview.</p>
                )}
              </div>
            </div>
          </div>
        );

      // Other options remain unchanged
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-6">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <ul>
          {options.map((option) => (
            <li key={option.id} className="mb-4">
              <button
                className={`w-full text-left p-2 rounded ${
                  selectedOption === option.id ? 'bg-gray-700' : 'hover:bg-gray-700'
                }`}
                onClick={() => setSelectedOption(option.id)}
              >
                {option.title}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">CRO Suggestion Dashboard</h1>
          {selectedOption && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              {renderContent()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
