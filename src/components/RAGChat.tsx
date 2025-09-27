import React, { useState, useEffect, useRef } from 'react';
import { useResponses } from '../hooks/useFirestore';
import { ragSystem, RAGChatMessage, RAGDocument } from '../lib/rag';
import { Send, Database, RefreshCw, MessageSquare, FileText, Users, Calendar, Bug } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const RAGChat: React.FC = () => {
  const [messages, setMessages] = useState<RAGChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingData, setIsProcessingData] = useState(false);
  const [isDataProcessed, setIsDataProcessed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { responses, loading: responsesLoading } = useResponses();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Process survey data when component mounts
  useEffect(() => {
    if (responses.length > 0 && !isDataProcessed) {
      processSurveyData();
    }
  }, [responses, isDataProcessed]);

  const processSurveyData = async () => {
    setIsProcessingData(true);
    try {
      await ragSystem.processSurveyResponses(responses);
      setIsDataProcessed(true);
      toast.success('Survey data processed for RAG system!');
      
      // Add welcome message
      setMessages([{
        id: 'welcome',
        type: 'assistant',
        content: `Hello! I'm your RAG assistant. I've processed ${responses.length} survey responses and I'm ready to help you analyze the feedback data. You can ask me questions like:

• "What are the main complaints from clients?"
• "Show me feedback about event satisfaction"
• "What do people like most about our services?"
• "Find responses with low ratings"
• "What suggestions do people have for improvement?"

What would you like to know about your survey data?`,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error processing survey data:', error);
      toast.error('Failed to process survey data');
    } finally {
      setIsProcessingData(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: RAGChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Search for relevant documents
      const relevantDocs = await ragSystem.search(inputMessage, 3);
      
      // Generate response
      const response = ragSystem.generateResponse(inputMessage, relevantDocs);
      
      const assistantMessage: RAGChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
        sources: relevantDocs
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: RAGChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "What are the main complaints from clients?",
    "Show me positive feedback about events",
    "What suggestions do people have for improvement?",
    "Find responses with ratings below 3",
    "What do people like most about our services?"
  ];

  if (responsesLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg mr-4">
              <Database className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">RAG Knowledge Base</h1>
              <p className="text-green-100">Chat with your survey data using AI</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-green-100">Survey Responses</div>
            <div className="text-2xl font-bold">{responses.length}</div>
            <button
              onClick={() => {
                // Test RAG system in console
                console.log('🧪 Running RAG system test...');
                console.log('Available responses:', responses);
                console.log('RAG system:', ragSystem);
              }}
              className="mt-2 px-3 py-1 bg-white bg-opacity-20 text-white text-xs rounded hover:bg-opacity-30"
            >
              <Bug className="w-3 h-3 inline mr-1" />
              Debug
            </button>
          </div>
        </div>
      </div>

      {/* Data Processing Status */}
      {!isDataProcessed && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <RefreshCw className={`w-5 h-5 text-yellow-600 mr-3 ${isProcessingData ? 'animate-spin' : ''}`} />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                {isProcessingData ? 'Processing survey data...' : 'Ready to process survey data'}
              </h3>
              <p className="text-sm text-yellow-700">
                {isProcessingData 
                  ? 'Creating embeddings and building knowledge base...' 
                  : 'Click the button below to process your survey responses for RAG queries.'
                }
              </p>
            </div>
            {!isProcessingData && (
              <button
                onClick={processSurveyData}
                className="ml-auto px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Process Data
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Questions */}
      {isDataProcessed && messages.length <= 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(question)}
                className="flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-blue-600 mr-3" />
                <span className="text-sm text-gray-700">{question}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-start ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white ml-3' 
                      : 'bg-green-100 text-green-600 mr-3'
                  }`}>
                    {message.type === 'user' ? (
                      <Users className="w-4 h-4" />
                    ) : (
                      <Database className="w-4 h-4" />
                    )}
                  </div>
                  <div className={`px-4 py-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {format(message.timestamp, 'HH:mm')}
                    </div>
                  </div>
                </div>
                
                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 ml-11">
                    <div className="text-xs text-gray-500 mb-2">Sources:</div>
                    <div className="space-y-2">
                      {message.sources.map((source, index) => (
                        <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <FileText className="w-4 h-4 text-blue-600 mr-2" />
                              <span className="text-sm font-medium text-blue-900">
                                {source.surveyTitle}
                              </span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              source.surveyType === 'client' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {source.surveyType}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 mb-2">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {format(source.metadata.submittedAt, 'MMM dd, yyyy')}
                            {source.metadata.respondentEmail && (
                              <>
                                <span className="mx-2">•</span>
                                {source.metadata.respondentEmail}
                              </>
                            )}
                          </div>
                          <div className="text-sm text-gray-700 line-clamp-3">
                            {source.content.substring(0, 200)}...
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <Database className="w-4 h-4 text-green-600" />
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">Searching knowledge base...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="border-t border-gray-200 p-6">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your survey data..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isLoading || !isDataProcessed}
              />
            </div>
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading || !isDataProcessed}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">How RAG Works</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• <strong>Retrieval:</strong> Searches through your survey responses using semantic similarity</p>
          <p>• <strong>Augmentation:</strong> Combines relevant responses with your question</p>
          <p>• <strong>Generation:</strong> Provides contextual answers based on actual survey data</p>
        </div>
      </div>
    </div>
  );
};

export default RAGChat;
