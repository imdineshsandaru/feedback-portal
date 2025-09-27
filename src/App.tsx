import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SurveyList from './components/SurveyList';
import SurveyBuilder from './components/SurveyBuilder';
import SurveyForm from './components/SurveyForm';
import ResponseList from './components/ResponseList';
import AIAssistant from './components/AIAssistant';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        
        <Routes>
          {/* Public survey form */}
          <Route path="/survey/:surveyId" element={<SurveyForm />} />
          
          {/* Admin routes */}
          <Route path="/admin/*" element={
            <Layout>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="surveys" element={<SurveyList />} />
                <Route path="surveys/new" element={<SurveyBuilder />} />
                <Route path="responses" element={<ResponseList />} />
                <Route path="ai" element={<AIAssistant />} />
                <Route path="settings" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Settings coming soon...</h2></div>} />
              </Routes>
            </Layout>
          } />
          
          {/* Redirect root to admin dashboard */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;