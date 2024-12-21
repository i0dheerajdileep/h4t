import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import AppAnalytics from './pages/Vercel';
import Dashboard from './pages/Dashboard';
// import AnalyticsPage from './pages/Vercel';
// import WebVitalsReporter from './pages/Vercel';


function App() {
  return (
    <Router>
      <div>
        {/* Define the routes */}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/Login" element={<Login />} />
          <Route path='/vercel' element={<AppAnalytics/>}/>
          <Route path='/dashboard' element={<Dashboard/>}/>
          {/* <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
