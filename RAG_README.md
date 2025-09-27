# RAG System for Survey Data

## Overview
This RAG (Retrieval-Augmented Generation) system allows admins to chat with their survey data using AI. It processes survey responses to create a searchable knowledge base and provides intelligent answers based on actual feedback data.

## Features

### 🔍 **Semantic Search**
- Uses TF-IDF (Term Frequency-Inverse Document Frequency) for text embeddings
- Cosine similarity for finding relevant responses
- Processes all survey responses into searchable documents

### 💬 **Chat Interface**
- Real-time chat with survey data
- Shows source documents for each answer
- Quick question suggestions
- Mobile-responsive design

### 📊 **Data Processing**
- Automatically processes survey responses when accessed
- Converts structured responses to searchable text
- Stores embeddings in Firebase for persistence

## How to Use

1. **Access RAG Chat**: Navigate to `/admin/rag` in the admin panel
2. **Process Data**: Click "Process Data" to create embeddings from survey responses
3. **Start Chatting**: Ask questions about your survey data

## Example Questions

- "What are the main complaints from clients?"
- "Show me positive feedback about events"
- "What suggestions do people have for improvement?"
- "Find responses with ratings below 3"
- "What do people like most about our services?"

## Technical Implementation

### Components
- **`RAGChat.tsx`**: Main chat interface component
- **`rag.ts`**: Core RAG system with embedding and search logic

### Data Flow
1. Survey responses → Text conversion → TF-IDF embeddings
2. User query → Embedding generation → Similarity search
3. Relevant documents → Context generation → AI response

### Storage
- Embeddings stored in Firebase `rag_documents` collection
- Real-time updates when new survey responses are added

## Customization

### Adding New Question Types
Modify the `quickQuestions` array in `RAGChat.tsx`:

```typescript
const quickQuestions = [
  "Your custom question here",
  // ... existing questions
];
```

### Adjusting Search Parameters
In `rag.ts`, modify the search function:

```typescript
// Change similarity threshold
.filter(item => item.similarity > 0.1) // Adjust threshold

// Change number of results
.slice(0, limit) // Adjust limit
```

### Improving Response Generation
Modify the `generateResponse` function in `rag.ts` to customize how responses are formatted and presented.

## Performance Notes

- **Processing Time**: Initial data processing may take a few seconds for large datasets
- **Search Speed**: TF-IDF is fast but less sophisticated than modern embeddings
- **Memory Usage**: All embeddings are loaded into memory for fast searching

## Future Enhancements

1. **Better Embeddings**: Replace TF-IDF with transformer-based embeddings
2. **Vector Database**: Use dedicated vector database for better performance
3. **Advanced AI**: Integrate with OpenAI/Anthropic for better response generation
4. **Analytics**: Add query analytics and usage tracking
5. **Multi-language**: Support for multiple languages in responses

## Demo Usage

For a quick demo:
1. Create some sample surveys and responses
2. Navigate to RAG Chat
3. Process the data
4. Try the quick questions or ask custom queries
5. Explore the source documents shown with each response

The system is designed to be simple but effective for demo purposes, providing a solid foundation that can be enhanced with more sophisticated AI capabilities as needed.
