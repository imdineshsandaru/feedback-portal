import React, { useState } from 'react';
import { Brain, Send, Lightbulb, BarChart3, FileText, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const AIAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState<Array<{ query: string; response: string; type: string; }>>([]);
  const [loading, setLoading] = useState(false);

  // Simulated AI responses - in a real app, this would call an actual AI service
  const generateAIResponse = (query: string): { response: string; type: string } => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('form') || lowerQuery.includes('question') || lowerQuery.includes('field')) {
      return {
        type: 'form-suggestion',
        response: `Based on your query about forms, here are some AI-powered suggestions:

**Recommended Form Fields:**
• Overall Satisfaction Rating (1-5 scale)
• Net Promoter Score (0-10 scale) 
• Multiple choice: "What brought you to us?" with options like Referral, Search Engine, Social Media, Advertisement
• Open-ended: "What's one thing we could improve?"
• Yes/No: "Would you use our services again?"

**Form Optimization Tips:**
• Keep forms under 7 fields for better completion rates
• Use conditional logic to show/hide relevant questions
• Place rating questions early to engage users
• End with an optional comment field for detailed feedback

**AI-Generated Questions for ${lowerQuery.includes('client') ? 'Client' : 'Event'} Feedback:**
• How likely are you to recommend us to a colleague? (NPS)
• Which aspect exceeded your expectations?
• What's the primary reason for your satisfaction level?
• How can we make your next experience even better?`
      };
    }
    
    if (lowerQuery.includes('analysis') || lowerQuery.includes('insight') || lowerQuery.includes('report')) {
      return {
        type: 'analytics',
        response: `**AI-Powered Analytics Insights:**

**Key Performance Indicators to Track:**
• Response Rate: Aim for >60% for client surveys, >40% for event surveys
• Net Promoter Score (NPS): Industry benchmark is 30-70
• Completion Rate: Target >80% form completion
• Response Time: Track average time to complete

**Predictive Analytics:**
• Responses submitted on Tuesdays-Thursdays have 23% higher completion rates
• Surveys with 3-5 questions get 40% more responses than longer forms
• Rating scales perform 15% better than yes/no questions for satisfaction metrics

**AI-Suggested Report Structure:**
1. Executive Summary with key metrics
2. Response trends over time
3. Sentiment analysis of open-ended responses  
4. Comparative analysis by demographics
5. Actionable recommendations for improvement

**Smart Alerts to Set Up:**
• Notify when NPS drops below threshold
• Alert for negative sentiment spikes
• Weekly response volume summaries`
      };
    }
    
    if (lowerQuery.includes('improve') || lowerQuery.includes('optimize') || lowerQuery.includes('better')) {
      return {
        type: 'optimization',
        response: `**AI-Driven Optimization Recommendations:**

**Survey Design Improvements:**
• Use progressive disclosure - show 3 questions initially, reveal more based on engagement
• Implement smart defaults based on user behavior patterns
• Add micro-animations to reduce perceived completion time
• Use conditional branching to personalize question flow

**Response Rate Boosters:**
• Send surveys within 24 hours of interaction (67% higher response rate)
• Personalize survey invitations with specific project/event details
• Use mobile-first design - 73% of responses come from mobile devices
• Implement survey fatigue detection to avoid over-surveying

**Content Optimization:**
• Replace "How was your experience?" with specific questions like "How well did we understand your needs?"
• Use emoji reactions for quick sentiment capture
• Add progress indicators for longer surveys
• Include estimated completion time (2-3 minutes max)

**AI-Powered Features to Consider:**
• Auto-translation for multilingual audiences
• Smart question ordering based on response patterns
• Predictive text suggestions for open-ended fields
• Automated sentiment analysis for instant insights`
      };
    }
    
    return {
      type: 'general',
      response: `I can help you with various aspects of your feedback system:

**Form Building & Design:**
• Generate optimized questions for any survey type
• Suggest field types and validation rules
• Recommend form structure and flow
• Provide mobile-first design tips

**Analytics & Insights:**
• Identify key metrics to track
• Suggest visualization approaches
• Provide benchmark data
• Generate automated report templates

**Response Optimization:**
• Increase completion rates
• Improve response quality
• Reduce survey fatigue
• Enhance user experience

**Try asking me specific questions like:**
• "How can I improve my client feedback form?"
• "What analytics should I track for event surveys?"
• "Generate questions for a product satisfaction survey"
• "How do I increase response rates?"

What would you like help with today?`
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(query);
      setResponses(prev => [...prev, { query, ...aiResponse }]);
      setQuery('');
      setLoading(false);
      toast.success('AI analysis complete!');
    }, 1500);
  };

  const quickPrompts = [
    { text: "Optimize my client feedback form", icon: FileText },
    { text: "Analyze survey response patterns", icon: BarChart3 },
    { text: "Generate event feedback questions", icon: Lightbulb },
    { text: "Improve response rates", icon: Zap },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center mb-4">
          <div className="p-3 bg-white bg-opacity-20 rounded-lg mr-4">
            <Brain className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Assistant</h1>
            <p className="text-purple-100">Get intelligent insights for your feedback system</p>
          </div>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => setQuery(prompt.text)}
              className="flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <prompt.icon className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-sm text-gray-700">{prompt.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Chat History */}
        <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
          {responses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Ask me anything about optimizing your feedback system!</p>
            </div>
          ) : (
            responses.map((item, index) => (
              <div key={index} className="space-y-4">
                {/* User Query */}
                <div className="flex justify-end">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 bg-blue-600 text-white rounded-lg rounded-br-none">
                    {item.query}
                  </div>
                </div>
                
                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="max-w-full">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <Brain className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="bg-gray-100 px-4 py-3 rounded-lg rounded-bl-none">
                        <div className="text-sm text-gray-900 whitespace-pre-wrap">
                          {item.response}
                        </div>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.type === 'form-suggestion' ? 'bg-blue-100 text-blue-800' :
                            item.type === 'analytics' ? 'bg-green-100 text-green-800' :
                            item.type === 'optimization' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.type.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <Brain className="w-4 h-4 text-purple-600" />
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="border-t border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about survey optimization, analytics, or form design..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Smart Form Builder</h3>
          <p className="text-sm text-gray-600">AI-generated questions and optimal form structures</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Intelligent Analytics</h3>
          <p className="text-sm text-gray-600">Automated insights and pattern recognition</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Zap className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Response Optimization</h3>
          <p className="text-sm text-gray-600">Increase engagement and completion rates</p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;