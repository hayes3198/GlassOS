# GlassOS

A sleek, glassmorphism-inspired simulated desktop environment built with React, Vite, and Tailwind CSS.

## Features

- **Glassmorphism UI**: Beautiful transparent windows with blur effects and rounded corners.
- **Window Management**: Draggable, resizable, and snappable windows (full-screen, split-screen).
- **Code Studio**: A professional IDE layout for "Brainscript" development with a file explorer and build system.
- **Terminal Toolchain**: A low-level terminal with:
  - `pkg install`: Package manager with real-time progress bars.
  - `ls -l`: Detailed file listing with permissions.
  - **Execution Engine**: Run binaries (`.bbin`) directly from the terminal, including launching GUI apps.
  - **Hardware Feedback**: Simulated memory mapping and CPU state feedback.
- **Electron Support**: Ready to be wrapped as a standalone desktop application with frameless window support and Node.js integration.
- **Built-in Apps**: File Explorer, Web Browser, Settings, Terminal, Music Player, Photos, Code Studio, and Calculator.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd glass-os
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

#### Web Development
```bash
npm run dev
```

#### Electron Development
```bash
npm run electron:dev
```

#### Build for Production
```bash
npm run build
```

## Technologies Used

- **React 19**: Frontend framework.
- **Vite**: Build tool and dev server.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.
- **Motion**: Animation library.
- **Electron**: Desktop application framework.

## License

This project is licensed under the Apache-2.0 License.
