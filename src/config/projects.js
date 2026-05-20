export const projects = [
  { 
    id: 'batibloc',
    name: 'BâtiBloc.txt', 
    desc: 'Text Document', 
    type: 'project', 
    group: 'Desktop',
    emoji: '📝',
    content: `==================================================
PROJECT: BâtiBloc
ACCOLADES: 
* Winner of the Yves-Roy Award (Best Departmental Object-Oriented Software Engineering Project)
* Nominated – Best Software Engineering Project of the Year (2025/2026)
TECHNOLOGY STACK: Java, Swing, JavaFX, PDFBox, FlatLaf
==================================================

[OVERVIEW]
A full-stack construction tool bridging architectural PDF blueprints and job-site reality, designed to optimize block placement simulations and project cost estimations.

[KEY FEATURES]
* Blueprint Integration: Drag & drop PDF import via PDFBox, imperial scale calibration, and multi-shape zone definition (rectangular, triangular, truncated) including openings and roofs.
* Simulation Engine: Complete block placement simulation handling sub-6in cuts, load transfers, and lintels.
* Cost Estimation: Dynamic dashboard providing cost analysis per-zone, per-view, and globally with editable unit prices and exportable PDF reports.
* Hybrid 2D/3D Visualization: Interoperable Swing + JavaFX + FlatLaf interface with multi-material OBJ rendering, full 3D manipulation, and high-performance rendering.
* User Experience: Persistent custom .batibloc file format, filterable action history with full Undo/Redo capabilities (Command pattern), and an integrated helper chatbot.

[ARCHITECTURE & DESIGN]
* Architected a clean layered architecture (Domain / Application DTO / Presentation) ensuring complete separation of concerns and robust 2D/3D state synchronization.`
  },
  { 
    id: 'medical-simulator',
    name: 'Medical Case Simulator.txt', 
    desc: 'Text Document', 
    type: 'project', 
    group: 'Web Design & Apps',
    emoji: '📝',
    content: `==================================================
PROJECT: Medical Case Simulator
TECHNOLOGY STACK: Python, Flask, MySQL, Vanilla JS (HTML5/Vanilla CSS)
==================================================

[OVERVIEW]
A secure, 3-tier web application developed for medical clinical case simulations, allowing students to diagnose patient cases in a responsive, secure environment.

[KEY FEATURES]
* Responsive Web Interface: Fully WCAG AA-compliant frontend developed with semantic HTML, Vanilla CSS, and modern Vanilla JS.
* RESTful API: High-performance Python/Flask backend delivering dynamic case routes and handling simulation state.
* Database Layer: A highly normalized (BCNF) MySQL database schema designed for efficient querying and real-time community analytics.
* Advanced Security: Enforced strict application security mechanisms including scrypt password hashing, parameterized SQL queries to prevent SQL injection, secure session management, and asynchronous AJAX client-side validations.

[TECHNICAL CHALLENGES OVERCOME]
* Designing complex SQL queries, triggers, and stored procedures paired with strategic database indexing to guarantee real-time forum analytics.
* Meeting WCAG AA accessibility standards using pure Vanilla JS and CSS for maximum visual performance and screen reader compatibility.`
  },
  { 
    id: 'web-agent',
    name: 'Secure Web Automation.txt', 
    desc: 'Text Document', 
    type: 'project', 
    group: 'Systems',
    emoji: '📝',
    content: `==================================================
PROJECT: Secure Web Automation (ConUHack26)
TECHNOLOGY STACK: Python, Selenium, Wireshark, Bash
==================================================

[OVERVIEW]
An autonomous agent built during the ConUHack26 hackathon, designed to successfully navigate web platforms by bypassing advanced anti-bot protections and behavioral tracking systems.

[KEY FEATURES]
* Anti-Bot Evasion: Implemented advanced techniques to bypass automated bot detectors and behavioral tracking mechanisms using Python and Selenium.
* Network Analysis: Reverse-engineered client-server network exchanges using Wireshark to identify secure authentication gates and payload structures.
* Security Hardening: Enforced robust application security parameters by replicating realistic user behaviors and timing profiles.

[TECHNICAL CHALLENGES OVERCOME]
* Bypassing sophisticated browser integrity checks and state tracking without triggering security alerts.
* Extracting critical connection handshake and protocol data via Wireshark under tight hackathon timelines.`
  },
  { 
    id: 'banking-system',
    name: 'Banking System.txt', 
    desc: 'Text Document', 
    type: 'project', 
    group: 'Systems',
    emoji: '📝',
    content: `==================================================
PROJECT: Banking System
TECHNOLOGY STACK: C++, Qt, QMake, Git
==================================================

[OVERVIEW]
An object-oriented banking desktop application designed to provide secure, robust transaction processing with a rich graphical user interface.

[KEY FEATURES]
* Object-Oriented Design: Developed with clean C++ OOP principles, utilizing strong encapsulation, inheritance, and polymorphism.
* Desktop GUI: Native desktop interface designed using the Qt framework.
* Secure Transaction Processing: Validated and processed banking ledger transactions with multi-level constraint checks.
* Hierarchical Exception Handling: Implemented a robust custom exception class hierarchy to handle operational and transaction faults gracefully, preventing data corruption.`
  },
  {
    id: 'portfolio-website',
    name: 'Portfolio Website.txt',
    desc: 'Text Document',
    type: 'project',
    group: 'Web Design & Apps',
    emoji: '📝',
    content: `==================================================
PROJECT: Portfolio Website (Windows 7 Experience)
TECHNOLOGY STACK: Vue.js 3, Vite, JavaScript, HTML5, CSS3
==================================================

[OVERVIEW]
An immersive, fully interactive portfolio website designed as a faithful recreation of the Windows 7 operating system experience. Built from scratch with Vue.js 3 and Vite, the site transforms a traditional portfolio into an engaging desktop environment complete with boot sequences, window management, and file exploration.

[KEY FEATURES]
* Full OS Simulation: Authentic boot screen, login screen with user avatar, and animated welcome loading sequence before reaching the interactive desktop.
* Aero Glass UI: Faithful recreation of the Windows 7 Aero Glass visual style with translucent panels, backdrop blur effects, and realistic window chrome.
* Window Manager: Fully functional window management system supporting open, close, minimize, maximize, drag, resize, focus/z-index ordering, and taskbar integration.
* File Explorer: Multi-folder file explorer with sidebar navigation, address bar, search filtering, and detail/icon views across Projects, Experience, Documents, and Favorites.
* Notepad Viewer: Custom notepad component with syntax-highlighted project/experience details, mimicking the classic Windows Notepad aesthetic.
* Start Menu & Search: Functional start menu with global search across all apps, projects, and experience entries.
* Contact Integration: Built-in contact form that generates mailto: links with pre-filled subject and body.

[ARCHITECTURE & DESIGN]
* Component-Based Architecture: Clean separation into reusable Vue.js components (RetroDesktop, FileExplorer, StartMenu, Taskbar, DialogBox, and dedicated window content components).
* Composable Pattern: Logic extracted into Vue 3 composables (useWindowManager, useDragResize, useDialog, useClock) for clean separation of concerns.
* Data-Driven Design: Project and experience content defined in dedicated configuration modules, enabling easy content updates without touching UI code.
* Scoped Styling: Each component encapsulates its own styles, preventing CSS conflicts while maintaining the cohesive Windows 7 visual language.`
  }
]
