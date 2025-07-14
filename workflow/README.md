## 📋 Overview\n
This project implements two automated workflows for processing purchase orders from PDF documents, using AI embeddings for customer matching, and integrating with Supabase and Unleashed software.\n

## 🚀 Workflow 1: PDF Embedding & Customer Data Storage\n
🎯 Purpose\n
Extract and embed purchase order data from PDF files, then store the vectorized data along with customer information in Supabase for future similarity matching.\n
    A[📄 PDF Input] --> B[📝 Extract Text Data] \n
    B --> C[🧠 Generate Embeddings]\n
    C --> D[👥 Link Customer Data]\n
    D --> E[💾 Store in Supabase]\n
    E --> F[📊 Vector Database Ready]\n

Key Features:\n
✅ Automated PDF Processing: Batch processing of multiple PDF files\n
✅ Vector Embedding: High-quality embeddings for similarity matching\n
✅ Customer Association: Link orders to existing customer records\n
✅ Metadata Storage: Store additional order details and context\n
✅ Scalable Architecture: Handle large volumes of documents\n

## 📧 Workflow 2: Email Processing & Order Management

🎯 Purpose \n
Process incoming emails with purchase order PDFs, match customers using similarity search, extract order data, and automatically create orders in Unleashed software with comprehensive logging.\n
    A[📧 Email Received] --> B[📎 Extract PDF Attachment]\n
    B --> C[📝 Extract Content]\n
    C --> D[🧠 Generate Query Embedding]\n
    D --> E[🔍 Similarity Search]\n
    E --> F[👤 Match Customer]\n
    F --> G[📊 Extract Order Data]\n
    G --> H[🚀 Create Order in Unleashed]\n
    H --> I[📝 Generate Logs]\n
    I --> J[💾 Store in Supabase]\n
    J --> K[📊 Dashboard Display]\n
