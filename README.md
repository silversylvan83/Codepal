# 🧠 Code Review Assistant- CodePlus

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-61dafb?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-green?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-mongoose%208.x-47A248?style=flat-square&logo=mongodb)
![AI](https://img.shields.io/badge/AI-Gemini%20%2F%20OpenAI-purple?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![Last Commit](https://img.shields.io/github/last-commit/<your-username>/<your-repo>?style=flat-square)

A modern **Next.js** app that reviews code with AI (Google **Gemini** by default; **OpenAI** optional), stores review history in **MongoDB**, and ships with a slick UI using **Monaco Editor**, **Tailwind**, and **Zod** validation.

---

## 📌 Table of Contents
- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Installation](#-installation)
- [Usage](#-usage)
- [Environment Variables](#-environment-variables)
- [API Routes](#-api-routes)
- [Folder Structure](#-folder-structure)
- [Deployment (Vercel)](#-deployment-vercel)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 🧩 Overview
Paste or upload code, pick a language, and receive AI-generated review notes: bug risks, edge cases, performance hints, and refactors. Reviews are saved to MongoDB so you can revisit, filter, or delete them later.

---

## 🛠️ Tech Stack
- **Frontend:** Next.js 15, React 19, Tailwind CSS, Monaco Editor
- **AI Providers:** Google Gemini (`@google/generative-ai`), OpenAI (`openai`)
- **Backend:** Next.js Route Handlers, Mongoose 8
- **Utilities:** Zod (validation), rate limiting, dotenv
- **Optional:** Express + `serverless-http` adapter

---

## ✅ Features
- 🤖 **AI code reviews** (Gemini by default; switchable to OpenAI)
- 🗃️ **History** in MongoDB: list, paginate, view, delete, clear
- ✍️ **Monaco Editor** with language selection
- 🧱 **Zod** request validation & basic rate limiting
- 🧭 **Typed env loader** and safe DB connection re-use

---

## 📦 Installation

```bash
# 1) Clone
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# 2) Install deps
npm install

# 3) Configure environment (see below)
cp .env.example .env.local  # then edit values

# 4) Run dev
npm run dev
# http://localhost:3000
