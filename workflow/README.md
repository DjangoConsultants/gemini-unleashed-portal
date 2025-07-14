## 📋 Overview
This project implements two automated workflows for processing purchase orders from PDF documents, using AI embeddings for customer matching, and integrating with Supabase and Unleashed software.

## 🚀 Workflow 1: PDF Embedding & Customer Data Storage
🎯 Purpose
Extract and embed purchase order data from PDF files, then store the vectorized data along with customer information in Supabase for future similarity matching.
    A[📄 PDF Input] --> B[📝 Extract Text Data] <dr>
    B --> C[🧠 Generate Embeddings]<dr>
    C --> D[👥 Link Customer Data]<dr>
    D --> E[💾 Store in Supabase]<dr>
    E --> F[📊 Vector Database Ready]<dr>

Key Features:
✅ Automated PDF Processing: Batch processing of multiple PDF files<dr>
✅ Vector Embedding: High-quality embeddings for similarity matching<dr>
✅ Customer Association: Link orders to existing customer records<dr>
✅ Metadata Storage: Store additional order details and context<dr>
✅ Scalable Architecture: Handle large volumes of documents<dr>

## 📧 Workflow 2: Email Processing & Order Management

🎯 Purpose <dr>
Process incoming emails with purchase order PDFs, match customers using similarity search, extract order data, and automatically create orders in Unleashed software with comprehensive logging.
    A[📧 Email Received] --> B[📎 Extract PDF Attachment]
    B --> C[📝 Extract Content]
    C --> D[🧠 Generate Query Embedding]
    D --> E[🔍 Similarity Search]
    E --> F[👤 Match Customer]
    F --> G[📊 Extract Order Data]
    G --> H[🚀 Create Order in Unleashed]
    H --> I[📝 Generate Logs]
    I --> J[💾 Store in Supabase]
    J --> K[📊 Dashboard Display]
