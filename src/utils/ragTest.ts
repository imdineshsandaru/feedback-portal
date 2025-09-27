// Simple test utility for RAG system debugging
import { ragSystem } from '../lib/rag';
import { SurveyResponse } from '../types';

export const testRAGSystem = async () => {
  console.log('🧪 Testing RAG System...');
  
  // Create a test response similar to your Firebase data
  const testResponse: SurveyResponse = {
    id: 'test-response-1',
    surveyId: 'test-survey-1',
    surveyTitle: 'Intrepid Travel',
    surveyType: 'client',
    responses: {
      '1': 'Intrepid Travel',
      '2': 5,
      '5': 'Definitely',
      'email': 'imdineshsandaru@gmail.com'
    },
    submittedAt: new Date('2025-09-27T05:13:01.928Z'),
    respondentEmail: 'imdineshsandaru@gmail.com'
  };

  try {
    // Test processing
    console.log('📝 Processing test response...');
    await ragSystem.processSurveyResponses([testResponse]);
    
    // Test search queries
    const testQueries = [
      'Intrepid Travel',
      'client feedback',
      'rating 5',
      'definitely recommend',
      'travel',
      'satisfaction'
    ];

    console.log('🔍 Testing search queries...');
    for (const query of testQueries) {
      console.log(`\nQuery: "${query}"`);
      const results = await ragSystem.search(query, 3);
      console.log(`Results: ${results.length}`);
      results.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.surveyTitle} (similarity: ${result.embeddings.filter(e => e !== 0).length} non-zero embeddings)`);
      });
    }

    console.log('\n✅ RAG System test completed!');
    
  } catch (error) {
    console.error('❌ RAG System test failed:', error);
  }
};

// Export for use in browser console
(window as any).testRAGSystem = testRAGSystem;
