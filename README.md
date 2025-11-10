# Arogya - AI-Driven Medical History Tracker and Knowledge Graph Visualizer

Built in 36 hours at Hack36 by **Meteor Manipulator**

**Arogya** is a healthcare intelligence platform that transforms uploaded prescriptions into structured medical knowledge graphs, providing patients and doctors with deeper, connected insights into healthcare data.  

It bridges the gap between fragmented medical records and meaningful, AI-driven understanding — creating a unified health ecosystem powered by data, privacy, and intelligence.

---

<p align="center">
  <img src="/Screenshot (90).png" alt="Graph Demo" width="400">
  <img src="/Screenshot (91).png" alt="Graph Demo" width="400">
  <img src="/Screenshot (92).png" alt="Graph Demo" width="400">
  <img src="/Screenshot (93).png" alt="Graph Demo" width="400">
  <img src="/Screenshot (94).png" alt="Graph Demo" width="400">
  <img src="/Screenshot (95).png" alt="Graph Demo" width="400">
  <img src="/Screenshot (96).png" alt="Graph Demo" width="400">
  <img src="/Screenshot (97).png" alt="Graph Demo" width="400">
</p>

## Overview

Arogya enables users to upload prescriptions or reports (PDFs or images), which are processed by an AI model to extract key medical entities such as diseases, medicines, dosages, and doctors’ notes.  
This extracted data is then converted into a **knowledge graph**, allowing users to visualize relationships among their medical conditions, treatments, and healthcare providers.

---

## Key Features

- **AI Prescription Parser**  
  Automatically extracts entities from scanned or handwritten prescriptions using Google Generative AI.

- **Healthcare Knowledge Graph**  
  Builds an interactive medical knowledge graph linking patients, diseases, and medications.

- **Digital Health Wallet**  
  Securely stores prescriptions and medical reports in an encrypted, centralized dashboard.

- **Virtual Clinic Integration**  
  Enables video consultations through ZegoCloud with real-time communication.

- **Smart Appointment System**  
  AI-assisted scheduling based on availability, urgency, and user history.

- **Data Insights Dashboard**  
  Visualizes extracted medical data and graph relationships using modern UI components.

---

## How It Works

1. **Document Upload**  
   Users upload a medical prescription or report (image or PDF).

2. **AI-Powered Parsing**  
   The document is processed using Google Generative AI (Gemini) to extract structured healthcare data.

3. **Entity Mapping**  
   Extracted entities are categorized as nodes — such as Patient, Disease, Doctor, or Medicine.

4. **Graph Construction**  
   Relationships between entities are established (for example: *Patient → diagnosed_with → Disease*, *Disease → treated_with → Medicine*).

5. **Visualization**  
   The resulting graph is displayed interactively on the dashboard for user insights and history tracking.

---

## Tech Stack

| Category | Technologies Used |
|-----------|------------------|
| Frontend | Next.js 15, React 19, Tailwind CSS, Radix UI |
| Backend | Node.js, Express.js, MongoDB |
| AI/ML | Google Generative AI (Gemini), Tensor APIs |
| Graph Layer | MongoDB Graph Schema |
| Real-time | ZegoCloud (Video), WebSockets |
| Authentication | JWT, bcrypt |
| Security | HIPAA and DPDP Act compliant encryption |
| Payments | Stripe Integration |
| Deployment | Vercel (Frontend), MongoDB Atlas (Backend) |

---

## Challenges Solved

- **AI Document Parsing**  
  Converting unstructured, handwritten medical prescriptions into structured, machine-readable data.

- **Knowledge Graph Modeling**  
  Designing a flexible schema to represent patient data and relationships effectively within MongoDB.

- **Privacy and Security**  
  Ensuring that sensitive health data remains encrypted, anonymized, and compliant with global privacy standards.

- **Performance Optimization**  
  Implementing efficient data processing pipelines and API handling to maintain real-time responsiveness.

- **Real-Time Consultation**  
  Integrating ZegoCloud for seamless video-based telemedicine functionality.

---

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd Arogya
