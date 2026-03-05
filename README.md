# StudyPro OS

StudyPro OS is a comprehensive, all-in-one productivity operating system designed to streamline your academic and professional workflow. Built with a modern, glassmorphic UI, it provides a unified workspace for managing tasks, time, ideas, and more.

## 🚀 Features

- **Unified Dashboard**: A central hub to visualize your tasks, projects, time tracking, and upcoming events at a glance.
- **Advanced Task Management**: Organize tasks with priorities, tags, subtasks, and project categorization.
- **Focus Timer (Pomodoro)**: Integrated Pomodoro timer with automatic time tracking and project association.
- **Markdown Notes**: A powerful note-taking app with full Markdown support and categorization.
- **AI Assistant (Gemini)**: An integrated AI chatbot that can help you manage your workspace, create tasks, summarize notes, and more.
- **Calendar & Class Schedule**: Keep track of your academic sessions and personal events with a beautiful calendar view.
- **Flashcards (Leitner System)**: Study efficiently using a built-in flashcard system with spaced repetition.
- **Customizable Themes**: Personalize your workspace with various wallpapers (including live backgrounds), accent colors, and dark/light modes.
- **Cloud Sync & Backup**: Securely backup your data to Supabase and sync across devices.
- **Local Data Management**: Export and import your data as JSON files for local backups.
- **Engineering Excellence**: Built-in bundle analysis, type checking, and build statistics for optimal performance.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4, Framer Motion (for animations)
- **Icons**: Lucide React
- **Backend/Auth**: Supabase
- **AI**: Google Gemini API (@google/genai)
- **Charts**: Recharts
- **Drag & Drop**: @dnd-kit

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd studypro-os
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Supabase configuration is pre-configured in this version.**
4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

## 🔐 Privacy & Security

- **Local Storage**: Most of your data is stored locally in your browser's indexedDB/localStorage for instant access.
- **Optional Cloud Sync**: You can choose to sync your data to a secure Supabase database for multi-device access.
- **API Keys**: Your Gemini API key is stored locally and never sent to our servers.

## 📄 License

This project is licensed under the MIT License.

---

*Crafted with 💜 for students and professionals.*
