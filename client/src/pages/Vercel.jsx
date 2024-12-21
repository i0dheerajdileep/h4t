import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function AppAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d'); // Default to 7 days

  useEffect(() => {
    const fetchAnalytics = async () => {
      const projectId = import.meta.env.VITE_VERCEL_PROJECT_ID;
      const apiToken = import.meta.env.VITE_VERCEL_API_TOKEN;

      if (!projectId || !apiToken) {
        setError('Missing Project ID or API Token in environment variables.');
        setLoading(false);
        return;
      }

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch(dateRange) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      try {
        // Fetch analytics data
        const response = await fetch(
          `https://vercel.com/api/web-analytics/timeseries?` +
          new URLSearchParams({
            environment: 'production',
            from: startDate.toISOString(),
            to: endDate.toISOString(),
            projectId: projectId,
          }), {
            headers: {
              Authorization: `Bearer ${apiToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const data = await response.json();

        // Assuming the API returns an array of timeseries data
        setAnalyticsData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    setLoading(true);
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center text-gray-600">Loading analytics data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">App Analytics</h1>
        <div className="space-x-2">
          <button
            onClick={() => handleDateRangeChange('24h')}
            className={`px-3 py-1 rounded ${
              dateRange === '24h' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            24h
          </button>
          <button
            onClick={() => handleDateRangeChange('7d')}
            className={`px-3 py-1 rounded ${
              dateRange === '7d' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            7d
          </button>
          <button
            onClick={() => handleDateRangeChange('30d')}
            className={`px-3 py-1 rounded ${
              dateRange === '30d' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            30d
          </button>
        </div>
      </div>

      {analyticsData && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Traffic Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={analyticsData.timeseries} // Adjust according to actual API response
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="pageViews" 
                  stroke="#8884d8" 
                  name="Page Views" 
                />
                <Line 
                  type="monotone" 
                  dataKey="visitors" 
                  stroke="#82ca9d" 
                  name="Visitors" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppAnalytics;
