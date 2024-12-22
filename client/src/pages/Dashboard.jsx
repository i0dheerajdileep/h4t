import React, { useState, useCallback } from 'react';
import { Layout, Globe, Settings, ArrowRight, BarChart2, Target,Clock,TrendingDown, Shield, Award, Users, TrendingUp, AlertTriangle, CheckCircle, Star } from 'lucide-react';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from "react-simple-maps";


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
  const [selectedOption, setSelectedOption] = useState(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [websiteContent, setWebsiteContent] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const [competitorUrls, setCompetitorUrls] = useState({
    target_url: '',
    competitor_url1: '',
    competitor_url2: ''
  });
  const [competitorData, setCompetitorData] = useState(null);


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

  const fetchCompetitorAnalysis = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage('Analyzing competitors...');
      setLoadingProgress(10);

      const formData = new URLSearchParams();
      Object.entries(competitorUrls).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev < 90) return prev + 1;
          return prev;
        });
      }, 1000);

      const data = await fetchWithRetry('http://127.0.0.1:5000/comp-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      clearInterval(progressInterval);
      setLoadingProgress(100);
      setLoadingMessage('Analysis complete!');
      await sleep(500);
      
      setCompetitorData(data);
    } catch (error) {
      console.error('Error analyzing competitors:', error);
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
        Performance Analysis
      </h3>
      <div className="space-y-6">
        {Object.entries(analysisData.performance_analysis.scores).map(([key, value]) => (
          <div key={key}>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
              <span className="font-semibold">{value}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  parseInt(value) > 70 ? 'bg-green-500' : 
                  parseInt(value) > 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${parseInt(value)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-purple-500" />
        Site Analysis
      </h3>
      <div className="space-y-4">
        <div className="p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">Business Model</p>
          <p className="text-xl font-bold text-purple-700">
            {analysisData.site_analysis.business_model}
          </p>
        </div>
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Target Audience</h4>
          <ul className="space-y-2">
            {analysisData.site_analysis.target_audience.psychographic_traits.map((trait, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-600">{trait}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <Target className="w-5 h-5 text-green-500" />
        Critical Gaps
      </h3>
      <div className="space-y-4">
        {Object.entries(analysisData.site_analysis.critical_gaps).map(([key, values]) => (
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
        {analysisData.optimization_recommendations.immediate_actions.map((opt, idx) => (
          <div key={idx} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="font-semibold text-gray-800">{opt.title}</h4>
              <span className={`px-2 py-1 rounded text-xs ${
                opt.expected_impact.confidence_level.toLowerCase() === 'high' ? 'bg-red-100 text-red-700' :
                opt.expected_impact.confidence_level.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {opt.expected_impact.confidence_level}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-3">{opt.current_issue}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-600">Expected: {opt.expected_impact.conversion_lift}</span>
              <span className="text-purple-600">Complexity: {opt.expected_impact.implementation_complexity}</span>
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
        case 'competitor':
          return (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-purple-600">Competitor Analysis Dashboard</h2>
              <div className="grid gap-4">
                <input
                  type="text"
                  value={competitorUrls.target_url}
                  placeholder="Enter your website URL"
                  className="w-full p-3 border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500"
                  onChange={(e) => setCompetitorUrls(prev => ({ ...prev, target_url: e.target.value }))}
                />
                <input
                  type="text"
                  value={competitorUrls.competitor_url1}
                  placeholder="Enter first competitor URL"
                  className="w-full p-3 border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500"
                  onChange={(e) => setCompetitorUrls(prev => ({ ...prev, competitor_url1: e.target.value }))}
                />
                <input
                  type="text"
                  value={competitorUrls.competitor_url2}
                  placeholder="Enter second competitor URL"
                  className="w-full p-3 border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500"
                  onChange={(e) => setCompetitorUrls(prev => ({ ...prev, competitor_url2: e.target.value }))}
                />
                <button
                  className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-3 rounded-lg shadow-lg hover:shadow-xl transition duration-200 disabled:opacity-50"
                  onClick={fetchCompetitorAnalysis}
                  disabled={isLoading}
                >
                  {isLoading ? 'Analyzing...' : 'Analyze Competitors'}
                </button>
              </div>
  
              {competitorData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Target Website Card */}
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 text-blue-600">
                      {competitorData.target_website.name}
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(competitorData.target_website.scores).map(([key, data]) => (
                        <div key={key}>
                          <div className="flex justify-between mb-2">
                            <span className="capitalize">{key}</span>
                            <span>{data.score}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${data.score}%` }}
                            />
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{data.notes}</p>
                        </div>
                      ))}
                    </div>
                  </div>
  
                  {/* Competitor Cards */}
                  {['competitor_1', 'competitor_2'].map((comp, idx) => (
                    <div key={comp} className="bg-white p-6 rounded-xl shadow-lg">
                      <h3 className="text-lg font-semibold mb-4 text-purple-600">
                        {competitorData[comp].name}
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(competitorData[comp].scores).map(([key, data]) => (
                          <div key={key}>
                            <div className="flex justify-between mb-2">
                              <span className="capitalize">{key}</span>
                              <span>{data.score}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full">
                              <div
                                className="h-full bg-purple-500 rounded-full"
                                style={{ width: `${data.score}%` }}
                              />
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{data.notes}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
  
                  {/* Market Analysis */}
                  <div className="col-span-full bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold mb-4">Market Analysis</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-medium text-green-600 mb-2">Opportunities</h4>
                        <ul className="space-y-2">
                          {competitorData.market_analysis.opportunities.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-red-600 mb-2">Threats</h4>
                        <ul className="space-y-2">
                          {competitorData.market_analysis.threats.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-600 mb-2">Trends</h4>
                        <ul className="space-y-2">
                          {competitorData.market_analysis.trends.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-blue-500" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ); 
          case 'integrate':
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-green-600">Analytics Dashboard</h2>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Visitors', value: '124,892', change: '+12.3%', icon: <Users /> },
          { title: 'Avg. Session Duration', value: '4m 23s', change: '+5.7%', icon: <Clock /> },
          { title: 'Bounce Rate', value: '32.4%', change: '-2.1%', icon: <TrendingDown /> },
          { title: 'Conversion Rate', value: '3.8%', change: '+0.8%', icon: <TrendingUp /> },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              <div className={`p-2 rounded-lg ${
                stat.change.startsWith('+') ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {stat.icon}
              </div>
            </div>
            <p className={`text-sm mt-2 ${
              stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.change} from last month
            </p>
          </div>
        ))}
      </div>

      {/* Visitor Map */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Global Visitor Distribution</h3>
        <div className="h-[400px]">
          <ComposableMap>
            <Geographies geography="/path-to-your-topojson">
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#D6D6DA"
                    stroke="#FFFFFF"
                    style={{
                      default: { outline: 'none' },
                      hover: { fill: '#F53', outline: 'none' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>
          </ComposableMap>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>
          <div className="h-[300px]">
            <ResponsivePie
              data={[
                { id: 'Direct', value: 35 },
                { id: 'Organic', value: 25 },
                { id: 'Social', value: 20 },
                { id: 'Referral', value: 15 },
                { id: 'Email', value: 5 },
              ]}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              colors={{ scheme: 'nivo' }}
              enableArcLinkLabels={true}
            />
          </div>
        </div>

        {/* Page Views Over Time */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Page Views</h3>
          <div className="h-[300px]">
            <ResponsiveLine
              data={[
                {
                  id: 'pageviews',
                  data: [
                    { x: 'Mon', y: 1200 },
                    { x: 'Tue', y: 1400 },
                    { x: 'Wed', y: 1600 },
                    { x: 'Thu', y: 1800 },
                    { x: 'Fri', y: 2000 },
                    { x: 'Sat', y: 1700 },
                    { x: 'Sun', y: 1500 },
                  ],
                },
              ]}
              margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
              xScale={{ type: 'point' }}
              yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
              curve="cardinal"
              enablePoints={true}
              pointSize={8}
              pointColor={{ theme: 'background' }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              enableGridX={false}
              enableArea={true}
            />
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Top Pages</h3>
          <div className="space-y-4">
            {[
              { path: '/', views: 45231, change: '+12%' },
              { path: '/products', views: 32891, change: '+8%' },
              { path: '/about', views: 21983, change: '+5%' },
              { path: '/contact', views: 18273, change: '-2%' },
            ].map((page, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{page.path}</p>
                  <p className="text-sm text-gray-500">{page.views.toLocaleString()} views</p>
                </div>
                <span className={`text-sm ${
                  page.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {page.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* User Behavior */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">User Behavior</h3>
          <div className="h-[300px]">
            <ResponsiveBar
              data={[
                { behavior: 'Clicked CTA', value: 65 },
                { behavior: 'Reached Bottom', value: 45 },
                { behavior: 'Added to Cart', value: 35 },
                { behavior: 'Completed Purchase', value: 25 },
              ]}
              keys={['value']}
              indexBy="behavior"
              margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
              padding={0.3}
              colors={{ scheme: 'nivo' }}
              borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
              }}
            />
          </div>
        </div>
      </div>

      {/* Real-time Visitors */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Real-time Visitors</h3>
        <div className="space-y-4">
          {[
            { country: '🇺🇸 United States', visitors: 234, pages: ['/home', '/products'] },
            { country: '🇬🇧 United Kingdom', visitors: 186, pages: ['/about', '/contact'] },
            { country: '🇩🇪 Germany', visitors: 143, pages: ['/products', '/cart'] },
            { country: '🇯🇵 Japan', visitors: 98, pages: ['/home', '/shop'] },
          ].map((visitor, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{visitor.country}</p>
                <p className="text-sm text-gray-500">
                  Viewing: {visitor.pages.join(', ')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">{visitor.visitors}</p>
                <p className="text-sm text-gray-500">active users</p>
              </div>
            </div>
          ))}
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
