# 🧠 NeuroLearn - The AI-Powered Adaptive Learning Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

NeuroLearn is a next-generation adaptive learning platform that creates personalized educational roadmaps based on your unique knowledge profile. It leverages AI for content generation, in-depth behavioral analysis to understand your learning patterns, and an event-driven analytics engine for real-time progress tracking and spaced repetition.

---

## 📜 Table of Contents

- [About The Project](#about-the-project)
- [✨ Features](#-features)
- [🏛️ System Architecture](#️-system-architecture)
- [🤖 Tech Stack](#-tech-stack)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Infrastructure Setup](#1-infrastructure-setup)
  - [2. Backend Setup (Python AI Service)](#2-backend-setup-python-ai-service)
  - [3. Frontend Setup (React Client)](#3-frontend-setup-react-client)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)

---

## About The Project

Traditional learning platforms often follow a one-size-fits-all approach. NeuroLearn breaks that mold by building a dynamic learning journey tailored to you.

It starts with a **diagnostic quiz** to assess your current proficiency and identify your specific strengths and weaknesses. Based on this, our **AI-powered backend** generates a personalized roadmap of learning modules. As you progress, the system analyzes not just your answers, but *how* you answer—tracking confidence, hesitation, and time management to build a comprehensive behavioral profile.

Behind the scenes, an **event-driven analytics pipeline** captures every interaction, feeding real-time dashboards and powering a **spaced repetition engine** based on the Ebbinghaus forgetting curve to recommend what to revise and when.

This project was built with a modern, decoupled architecture, making it scalable, resilient, and ready for future innovation.

---

## ✨ Features

### Core Learning
- **🤖 AI-Generated Roadmaps**: Personalized learning paths created after an initial diagnostic quiz.
- **📚 Adaptive Content Generation**: AI-powered learning modules tailored to your skill level and weak spots, powered by Google Gemini.
- **📝 Module Quizzes**: Assess understanding at each step of your roadmap.
- **💡 Spaced Repetition**: Intelligently schedules revision sessions based on memory decay curves to ensure long-term retention.

### Analytics & Insights
- **🧠 Behavioral Analysis**: Goes beyond right or wrong, analyzing confidence, decision patterns, and time management.
- **💸 Proficiency Scoring**: A weighted algorithm calculates your true mastery based on accuracy, confidence, and efficiency.
- **📈 Real-time Dashboards**: Live visualization of your learning progress, engagement, and memory scores via Grafana.
- **💪 Strengths & Weaknesses**: Clear identification of concepts you've mastered and those that need more attention.

### Technical
- ** Kafka Event Streaming**: Decoupled and scalable architecture for handling analytics events.
- ** Decoupled Services**: Independent frontend, AI backend, and analytics services.
- ** Dockerized Infrastructure**: Easy-to-run local development environment for all necessary backing services.

---

## 🏛️ System Architecture

NeuroLearn operates on a distributed microservices architecture, ensuring scalability and separation of concerns.

```
+-----------------+      +-------------------------+      +--------------------+
|  React Client   |----->|  FastAPI AI Backend     |----->|   Google Gemini    |
| (Vite + TS)     |      |  (Python)               |      |   (Content Gen)    |
+-----------------+      +-------------------------+      +--------------------+
        |                                                        ^
        |                                                        | (User Data)
        +------------------------------------------------------->| Supabase (Postgres) |
        | (Events: Quiz Done, etc.)                              +--------------------+
        |
        v
+-----------------+      +-------------------------+      +--------------------+
|   API Gateway   |----->|      Kafka Cluster      |----->|   TS Consumers     |
| (Node.js/TS)    |      | (Zookeeper + Broker)    |      | (Analytics, Memory)|
+-----------------+      +-------------------------+      +--------------------+
                                                                     |
                                                                     v
                                                             +----------------+
                                                             |    MongoDB     |
                                                             +----------------+
                                                                     ^
                                                                     |
                                                            +------------------+
                                                            |     Grafana      |
                                                            |  (Dashboards)    |
                                                            +------------------+

```
- **Client**: The user-facing React application.
- **Supabase (PostgreSQL)**: Acts as the primary database for user authentication, profiles, and core application data.
- **FastAPI AI Backend**: The "brain" of the platform. It handles quiz submissions, performs behavioral analysis, and communicates with Google Gemini to generate personalized roadmaps and learning content.
- **API Gateway & Kafka**: The frontend sends analytics events (e.g., `module_quiz_events`) to a Node.js gateway, which publishes them to Kafka topics.
- **TypeScript Consumers**: These services listen to Kafka topics to process events in real-time. The `analyticsConsumer` aggregates metrics, while the `memoryScoreConsumer` calculates spaced repetition intervals.
- **MongoDB**: Serves as the analytics database, storing event data and aggregations for querying by Grafana.
- **Grafana**: Provides real-time visualization dashboards for user analytics and system monitoring.

---

## 🤖 Tech Stack

**Frontend:**
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/UI](https://ui.shadcn.com/)

**Backend (AI & Content):**
- [Python](https://www.python.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Google Generative AI (Gemini)](https://ai.google.dev/)

**Backend (Analytics & Events):**
- [Node.js](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Apache Kafka](https://kafka.apache.org/)

**Databases & Infrastructure:**
- [Supabase (PostgreSQL)](https://supabase.com/)
- [MongoDB](https://www.mongodb.com/)
- [Grafana](https://grafana.com/)
- [Docker](https://www.docker.com/)

---

## 🚀 Getting Started

Follow these steps to set up and run the complete NeuroLearn platform locally.

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) (v18 or higher)
- [Python](https://www.python.org/downloads/) (v3.9 or higher)
- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose

### 1. Infrastructure Setup

The `docker-compose.yml` file starts all the necessary backing services (Kafka, MongoDB, Grafana, etc.).

```bash
# Navigate to the neurolearn project root
cd neurolearn

# Start all services in detached mode
docker-compose up -d
```

Your infrastructure is now running. You can access the management UIs here:
- **Grafana**: http://localhost:3000 (admin/admin)
- **Kafka UI**: http://localhost:8081
- **Mongo Express**: http://localhost:8085

### 2. Backend Setup (Python AI Service)

This service handles AI-powered content generation and quiz analysis.

```bash
# Navigate to the Python backend directory
cd backend-python

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env

# Edit the .env file with your keys (e.g., GEMINI_API_KEY)
# nano .env or code .env

# Start the server (with auto-reload)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
The AI backend is now running at **http://localhost:8000**.

### 3. Frontend Setup (React Client)

This is the main web application you will interact with.

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Edit the .env file with your Supabase keys
# nano .env or code .env

# Start the development server
npm run dev
```
The NeuroLearn web app is now accessible at **http://localhost:5173** (or another port if 5173 is busy).

*Note: Instructions for the Node.js analytics service are pending and will be added soon.*

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please fork the repo and create a pull request.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.