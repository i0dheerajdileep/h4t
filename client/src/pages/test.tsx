// ... existing imports ...
import { Layout, Globe, Settings, ArrowRight, BarChart2, Target, Shield, Award, Users, TrendingUp, AlertTriangle, CheckCircle, Star } from 'lucide-react';

// ... LoadingModal component ...

export default function Dashboard() {
  // ... existing state variables ...
  const [competitorUrls, setCompetitorUrls] = useState({
    target_url: '',
    competitor_url1: '',
    competitor_url2: ''
  });
  const [competitorData, setCompetitorData] = useState(null);

  // ... existing functions ...

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

  const renderContent = () => {
    switch (selectedOption) {
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
      
      // ... other cases remain unchanged ...
    }
  };

  // ... rest of the component remains unchanged ...
}



// ... existing imports ...
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from "react-simple-maps";

// Add this inside your renderContent() switch statement under the 'integrate' case:
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