// Simple RAG system for survey data
import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { SurveyResponse } from '../types';

export interface RAGDocument {
  id: string;
  responseId: string;
  surveyTitle: string;
  surveyType: string;
  content: string;
  embeddings: number[];
  metadata: {
    submittedAt: Date;
    respondentEmail?: string;
    surveyId: string;
  };
}

export interface RAGChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: RAGDocument[];
}

// Simple TF-IDF based text embedding
class SimpleEmbedding {
  private vocabulary: Set<string> = new Set();
  private documentFrequencies: Map<string, number> = new Map();
  private totalDocuments = 0;

  // Tokenize text into words
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1) // Reduced from 2 to 1 to capture more words
      .filter(word => !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must'].includes(word)); // Remove common stop words
  }

  // Build vocabulary and document frequencies
  buildVocabulary(documents: string[]) {
    this.vocabulary.clear();
    this.documentFrequencies.clear();
    this.totalDocuments = documents.length;

    documents.forEach(doc => {
      const tokens = this.tokenize(doc);
      const uniqueTokens = new Set(tokens);
      
      uniqueTokens.forEach(token => {
        this.vocabulary.add(token);
        this.documentFrequencies.set(token, (this.documentFrequencies.get(token) || 0) + 1);
      });
    });
  }

  // Generate TF-IDF vector for a document
  generateEmbedding(text: string): number[] {
    const tokens = this.tokenize(text);
    if (tokens.length === 0) {
      console.warn('No tokens found in text:', text);
      return new Array(this.vocabulary.size).fill(0);
    }

    const termFrequencies = new Map<string, number>();
    
    // Calculate term frequencies
    tokens.forEach(token => {
      termFrequencies.set(token, (termFrequencies.get(token) || 0) + 1);
    });

    // Generate TF-IDF vector
    const vector: number[] = [];
    const vocabularyArray = Array.from(this.vocabulary);
    
    vocabularyArray.forEach(term => {
      const tf = (termFrequencies.get(term) || 0) / tokens.length;
      const df = this.documentFrequencies.get(term) || 1;
      // Avoid division by zero and ensure minimum IDF value
      const idf = Math.max(0.1, Math.log(Math.max(1, this.totalDocuments) / Math.max(1, df)));
      vector.push(tf * idf);
    });

    // Normalize vector to prevent all zeros
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      return vector.map(val => val / magnitude);
    }
    
    return vector;
  }

  // Calculate cosine similarity between two vectors
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

class RAGSystem {
  private embedding = new SimpleEmbedding();
  private documents: RAGDocument[] = [];

  // Process survey responses and create embeddings
  async processSurveyResponses(responses: SurveyResponse[]): Promise<void> {
    console.log('Processing survey responses for RAG...', responses.length);
    
    // Convert responses to text documents
    const documents = responses.map(response => {
      const content = this.responseToText(response);
      console.log('Document content:', content);
      return {
        responseId: response.id,
        surveyTitle: response.surveyTitle,
        surveyType: response.surveyType,
        content,
        metadata: {
          submittedAt: response.submittedAt,
          respondentEmail: response.respondentEmail,
          surveyId: response.surveyId,
        }
      };
    });

    // Build vocabulary from all documents
    const texts = documents.map(doc => doc.content);
    this.embedding.buildVocabulary(texts);
    console.log('Vocabulary size:', this.embedding['vocabulary'].size);
    console.log('Vocabulary:', Array.from(this.embedding['vocabulary']));

    // Generate embeddings for each document
    this.documents = documents.map(doc => {
      const embeddings = this.embedding.generateEmbedding(doc.content);
      console.log('Generated embeddings for:', doc.surveyTitle, 'Length:', embeddings.length, 'Non-zero:', embeddings.filter(e => e !== 0).length);
      return {
        id: `${doc.responseId}_${Date.now()}`,
        ...doc,
        embeddings
      };
    });

    // Store in Firebase
    await this.storeDocuments();
    console.log(`Processed ${this.documents.length} documents for RAG`);
  }

  // Convert survey response to searchable text
  private responseToText(response: SurveyResponse): string {
    const parts: string[] = [];
    
    parts.push(`Survey: ${response.surveyTitle}`);
    parts.push(`Type: ${response.surveyType}`);
    
    if (response.respondentEmail) {
      parts.push(`Respondent: ${response.respondentEmail}`);
    }
    
    parts.push(`Submitted: ${response.submittedAt.toISOString()}`);
    
    // Add all response data
    Object.entries(response.responses).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value === 'object') {
          // Handle checkbox responses
          const selectedOptions = Object.entries(value)
            .filter(([_, selected]) => selected)
            .map(([option, _]) => option);
          if (selectedOptions.length > 0) {
            parts.push(`${key}: ${selectedOptions.join(', ')}`);
          }
        } else {
          parts.push(`${key}: ${value}`);
        }
      }
    });
    
    return parts.join(' | ');
  }

  // Store documents in Firebase
  private async storeDocuments(): Promise<void> {
    try {
      // Add new documents
      for (const doc of this.documents) {
        await addDoc(collection(db, 'rag_documents'), {
          ...doc,
          metadata: {
            ...doc.metadata,
            submittedAt: doc.metadata.submittedAt
          }
        });
      }
    } catch (error) {
      console.error('Error storing RAG documents:', error);
    }
  }

  // Search for relevant documents
  async search(searchQuery: string, limit: number = 5): Promise<RAGDocument[]> {
    if (this.documents.length === 0) {
      await this.loadDocuments();
    }

    console.log('Searching for:', searchQuery);
    const queryEmbedding = this.embedding.generateEmbedding(searchQuery);
    console.log('Query embedding length:', queryEmbedding.length, 'Non-zero:', queryEmbedding.filter(e => e !== 0).length);
    
    // Calculate similarities
    const similarities = this.documents.map(doc => ({
      document: doc,
      similarity: this.embedding.cosineSimilarity(queryEmbedding, doc.embeddings)
    }));

    // Sort by similarity and return top results
    console.log('Similarities:', similarities.map(s => ({ title: s.document.surveyTitle, similarity: s.similarity })));
    
    const filtered = similarities
      .filter(item => item.similarity > 0.01) // Lowered threshold from 0.1 to 0.01
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.document);
    
    console.log('Filtered results:', filtered.length);
    
    // Fallback: if no results from embedding search, do simple text search
    if (filtered.length === 0) {
      console.log('No embedding results, trying text search...');
      const queryWords = searchQuery.toLowerCase().split(/\s+/);
      const textResults = this.documents
        .map(doc => {
          const content = doc.content.toLowerCase();
          const matches = queryWords.filter(word => content.includes(word)).length;
          return { document: doc, score: matches / queryWords.length };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.document);
      
      console.log('Text search results:', textResults.length);
      return textResults;
    }
    
    return filtered;
  }

  // Load documents from Firebase
  private async loadDocuments(): Promise<void> {
    try {
      const snapshot = await getDocs(query(collection(db, 'rag_documents'), orderBy('metadata.submittedAt', 'desc')));
      this.documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        metadata: {
          ...doc.data().metadata,
          submittedAt: doc.data().metadata.submittedAt.toDate()
        }
      })) as RAGDocument[];
    } catch (error) {
      console.error('Error loading RAG documents:', error);
    }
  }

  // Generate response using retrieved documents
  generateResponse(_searchQuery: string, relevantDocs: RAGDocument[]): string {
    if (relevantDocs.length === 0) {
      return `I don't have enough information to answer that specific question. However, I can help you with:

**Available Survey Data:**
- Total responses: ${this.documents.length}
- Client surveys: ${this.documents.filter(doc => doc.surveyType === 'client').length}
- Event surveys: ${this.documents.filter(doc => doc.surveyType === 'event').length}

**Try asking:**
- "Show me all client feedback"
- "What are the survey titles?"
- "Tell me about the responses"
- "What feedback do we have?"

Or try rephrasing your question with simpler terms.`;
    }

    const context = relevantDocs.map(doc => {
      return `Survey: ${doc.surveyTitle} (${doc.surveyType})\nResponse: ${doc.content}`;
    }).join('\n\n');

    return `Based on the survey data, here's what I found:

${context}

**Summary:** I found ${relevantDocs.length} relevant response(s) that match your query. The responses show feedback from ${relevantDocs.filter(doc => doc.surveyType === 'client').length} client survey(s) and ${relevantDocs.filter(doc => doc.surveyType === 'event').length} event survey(s).

Would you like me to analyze any specific patterns or provide more details about these responses?`;
  }
}

export const ragSystem = new RAGSystem();
