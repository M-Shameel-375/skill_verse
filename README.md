# SkillVerse - Online Learning Platform

![SkillVerse Logo](https://via.placeholder.com/150)

A comprehensive web-based platform that transforms online learning by integrating peer-to-peer skill exchange, paid content sharing, and live teaching sessions into a single ecosystem.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Database Models](#database-models)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### For Learners
- 📚 **Browse & Enroll** in courses
- 🎯 **Track Learning Progress** with gamification
- 🏆 **Earn Certificates & Badges**
- 📊 **Personalized AI Recommendations**
- 💬 **Real-time Chat & Video Sessions**
- 📝 **Take Quizzes & Assessments**
- ⭐ **Rate & Review Courses**

### For Educators
- 🎓 **Create & Publish Courses**
- 📹 **Host Live Sessions**
- 💰 **Monetize Content**
- 📈 **Track Student Analytics**
- 🎨 **Create Quizzes & Certificates**
- 💳 **Integrated Payment System**

### For Skill Exchangers
- 🤝 **Peer-to-Peer Skill Exchange**
- 🔍 **AI-Powered Matching**
- 📅 **Schedule Exchange Sessions**
- 💬 **Real-time Communication**
- ⭐ **Mutual Endorsements**

### For Admins
- 🎛️ **Dashboard Analytics**
- 👥 **User Management**
- ✅ **Content Moderation**
- 📊 **Revenue Reports**
- 🔒 **System Security**

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js (v16+)
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT
- **Payment:** Stripe
- **Real-time:** Socket.IO
- **File Upload:** Cloudinary
- **Email:** Nodemailer
- **AI:** OpenAI API

### Frontend (Recommended)
- **Framework:** React.js
- **State Management:** Redux
- **UI Library:** Material-UI / Tailwind CSS
- **HTTP Client:** Axios
- **Real-time:** Socket.IO Client

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**
- **Git**

### External Services (Required)
- **Stripe Account** (for payments)
- **Cloudinary Account** (for media uploads)
- **OpenAI API Key** (for AI features - optional)
- **SMTP Server** (for emails - Gmail recommended)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/skillverse.git
cd skillverse