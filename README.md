# ChakmaLex - Digital Dictionary for the Chakma Language

A comprehensive digital dictionary and language learning platform dedicated to preserving and promoting the Chakma language. Built with modern web technologies to provide an intuitive and accessible experience for learners and speakers of the Chakma language.

## 🌟 Features

### Core Dictionary
- **Advanced Search**: Search across Chakma script, romanized text, and English translations
- **Comprehensive Word Information**: Each entry includes pronunciation, etymology, examples, and visual aids
- **Audio Pronunciations**: Native speaker recordings for accurate pronunciation learning
- **Synonyms & Antonyms**: Related words in both Chakma and English

### Learning Tools
- **Character Learning**: Complete Chakma script reference with audio for each character
- **Interactive Quizzes**: AI-generated questions for bidirectional translation practice
- **Progress Tracking**: Monitor your learning journey with favorites and history

### Personalization
- **Multiple Themes**: Light, Dark, OLED, Sepia, Warm, and Vibrant modes
- **Font Size Control**: Adjust text size for optimal readability
- **Audio Controls**: Global volume management and audio preferences
- **Data Management**: Export/import your favorites and settings

### Developer Tools
- **Hidden Console**: Advanced content management system (tap logo 10 times + password)
- **AI Integration**: Daily AI-generated translation suggestions
- **Content CRUD**: Add, edit, and delete dictionary entries
- **Data Export/Import**: Backup and restore application content

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Routing**: React Router 6 (SPA mode)
- **Styling**: TailwindCSS 3 + Radix UI components
- **Backend**: Express.js (integrated with Vite dev server)
- **State Management**: Local Storage + React Query
- **Audio**: Web Audio API with volume control
- **Icons**: Lucide React
- **Fonts**: Noto Sans Chakma (Google Fonts)

## 🏗️ Project Structure

```
├── client/                 # React SPA frontend
│   ├── components/         # Reusable components
│   │   ├── ui/            # Radix UI component library
│   │   ├── Layout.tsx     # Main app layout with navigation
│   │   ├── DeveloperConsole.tsx  # Hidden content management
│   │   └── ...
│   ├── pages/             # Route components
│   │   ├── Dictionary.tsx # Main dictionary search page
│   │   ├── Characters.tsx # Character learning section
│   │   ├── Quiz.tsx       # Interactive quiz system
│   │   ├── Favorites.tsx  # Saved words management
│   │   ├── Settings.tsx   # App personalization
│   │   └── About.tsx      # Information and contacts
│   ├── lib/               # Utilities and helpers
│   │   ├── storage.ts     # Local storage management
│   │   └── utils.ts       # General utilities
│   ├── App.tsx            # App entry point with routing
│   └── global.css         # Tailwind CSS and theming
├── server/                # Express API backend
│   ├── routes/            # API endpoints
│   └── index.ts           # Server configuration
├── shared/                # Shared types and data
│   ├── types.ts           # TypeScript interfaces
│   └── sampleData.ts      # Development data
└── public/                # Static assets
```

## 🎯 Key Pages & Features

### Dictionary (Homepage)
- **Search Interface**: Advanced search with autocomplete and history
- **Word Display**: Detailed word cards with all linguistic information
- **Audio Integration**: Pronunciation playback with volume control
- **Favorites System**: Save words for later study

### Characters Section
- **Script Learning**: Complete Chakma alphabet with categorization
- **Audio Support**: Pronunciation for each character
- **Interactive Grid**: Easy navigation through character types

### Quiz System
- **AI-Generated Questions**: Dynamic content from verified dictionary entries
- **Multiple Formats**: English-to-Chakma, Chakma-to-English, character recognition
- **Progress Tracking**: Score tracking and performance analytics

### Settings & Personalization
- **Theme System**: 6 different color schemes for various preferences
- **Accessibility**: Font size adjustment and audio controls
- **Data Management**: Export/import personal data and settings

### Hidden Developer Console
Access: Tap the ChakmaLex logo 10 times, then enter password
- Passwords: `chakmalex2024`, `developer`, `admin123`, `contentmanager`
- **Content Management**: Full CRUD operations for words and characters
- **AI Tools**: Generate translation suggestions (10 per day limit)
- **Data Operations**: Export/import application content

## 🎨 Theming System

ChakmaLex supports extensive theming with CSS custom properties:

- **Light**: Clean and bright (default)
- **Dark**: Easy on the eyes in low light
- **OLED**: Pure black for OLED displays
- **Sepia**: Warm, paper-like appearance
- **Warm**: Cozy orange and yellow tones
- **Vibrant**: High contrast, vivid colors

Custom color overrides available for:
- Text color
- UI buttons
- Screen backgrounds
- Border elements

## 🔊 Audio System

- **Global Volume Control**: Adjustable from 0-100%
- **Format Support**: MP3, WAV, OGG audio files
- **Performance**: Optimized loading and playback
- **Accessibility**: Visual indicators for audio state

## 💾 Data Storage

All user data is stored locally using browser localStorage:
- **Favorites**: Word IDs for quick access
- **Search History**: Recent queries with result counts
- **Settings**: Theme, font size, volume preferences
- **Developer Console**: Authentication state

## 🌐 Accessibility Features

- **Keyboard Navigation**: Full keyboard support throughout the app
- **Screen Reader Friendly**: Semantic HTML and ARIA labels
- **High Contrast**: Multiple theme options for visual needs
- **Font Scaling**: Adjustable text sizes from XS to 3XL
- **Audio Controls**: Volume adjustment and disable options

## 📱 Responsive Design

- **Mobile-First**: Optimized for smartphones and tablets
- **Adaptive Layout**: Grid systems that adjust to screen size
- **Touch-Friendly**: Large tap targets and gesture support
- **Progressive Enhancement**: Works on all modern browsers

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start development server (both client and server)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run TypeScript type checking
npm run typecheck

# Run tests
npm test

# Format code
npm run format.fix
```

## 🚀 Deployment

### Standard Deployment
1. Build the application: `npm run build`
2. Start the server: `npm start`
3. Application runs on port 8080 by default

### Cloud Deployment
The application works well with:
- **Netlify**: Automatic deployment from Git repositories
- **Vercel**: Optimized for React applications
- **Builder.io**: Integrated deployment options

## 🤝 Contributing

We welcome contributions to ChakmaLex! Areas where help is needed:

- **Content**: Adding new words, improving translations
- **Audio**: Recording native pronunciations
- **Localization**: Additional interface languages
- **Features**: New learning tools and improvements

### Content Guidelines
- All dictionary entries must be verified by native speakers
- Audio recordings should be clear and consistent
- Etymology information should be researched and accurate
- Example sentences should demonstrate proper usage

## 📞 Contact & Support

- **General Inquiries**: personal@chakmalex.com
- **Feedback & Support**: dupsobon@gmail.com
- **Facebook**: [ChakmaLex Community](https://facebook.com/chakmalex)
- **YouTube**: [Educational Content](https://youtube.com/@chakmalex)
- **Telegram**: [Community Chat](https://t.me/chakmalex)

## 📄 License & Legal

### Terms of Use
- Educational and personal use permitted
- Commercial use requires explicit permission
- Content accuracy not guaranteed; for educational purposes

### Privacy Policy
- All data stored locally on user devices
- No personal information transmitted to external servers
- Audio files may be served from CDN for performance

### Acknowledgments
Special thanks to:
- Chakma language experts and educators
- Community members providing content and feedback
- Open source contributors and maintainers

## 🔮 Future Roadmap

- **Offline Support**: PWA capabilities for offline dictionary access
- **Community Features**: User-generated content and collaborative editing
- **Advanced AI**: Improved translation suggestions and learning paths
- **Mobile Apps**: Native iOS and Android applications
- **Voice Recognition**: Speaking practice with pronunciation feedback
- **Grammar Guide**: Comprehensive Chakma grammar reference

---

**ChakmaLex v1.0** - Preserving language, empowering learners  
Built with ❤️ for the Chakma community
