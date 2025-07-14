# 📦 Purchase Order Automation System

## 📋 Overview
This project provides two automated workflows for processing purchase orders from PDF documents. It leverages AI embeddings for customer matching and integrates with **Supabase** for data storage and **Unleashed** software for order management.

---

## 🚀 Workflow 1: PDF Embedding & Customer Data Storage

### Description
**Purpose**: Extract and embed purchase order data from PDF files, then store the vectorized data along with customer information in Supabase for efficient similarity matching.

### Workflow Diagram
```mermaid
graph TD
    A[📄 PDF Input] --> B[📝 Extract Text Data]
    B --> C[🧠 Generate Embeddings]
    C --> D[👥 Link Customer Data]
    D --> E[💾 Store in Supabase]
    E --> F[📊 Vector Database Ready]


Key Features:
✅ Automated PDF Processing: Batch processing of multiple PDF files
✅ Vector Embedding: High-quality embeddings for similarity matching
✅ Customer Association: Link orders to existing customer records
✅ Metadata Storage: Store additional order details and context
✅ Scalable Architecture: Handle large volumes of documents

## 📧 Workflow 2: Email Processing & Order Management

🎯 Purpose 
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
```
