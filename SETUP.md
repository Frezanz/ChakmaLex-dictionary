# ChakmaLex Setup Guide

This guide will help you set up the ChakmaLex application with all the new features including the touch-friendly developer console, API integration, and GitHub synchronization.

## Prerequisites

- Node.js 18+ and npm
- Git
- A GitHub account with a personal access token
- A GitHub repository for storing dictionary data

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd chakmalex
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit the `.env` file with your specific values:

   ```env
   # API Configuration
   VITE_API_URL=http://localhost:3000/api
   PING_MESSAGE=ping

   # GitHub Configuration
   GITHUB_TOKEN=your_github_personal_access_token_here
   GITHUB_REPO_OWNER=your_github_username
   GITHUB_REPO_NAME=chakmalex-dictionary
   GITHUB_BRANCH=main
   GITHUB_DICTIONARY_PATH=data/dictionary.json
   GITHUB_CHARACTERS_PATH=data/characters.json

   # Frontend GitHub Configuration
   VITE_GITHUB_TOKEN=your_github_personal_access_token_here

   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # File Upload Configuration
   MAX_FILE_SIZE=5242880
   UPLOAD_DIR=uploads
   ```

## GitHub Setup

### 1. Create a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name like "ChakmaLex API"
4. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
5. Click "Generate token"
6. Copy the token and add it to your `.env` file

### 2. Create a GitHub Repository

1. Create a new repository on GitHub (e.g., `chakmalex-dictionary`)
2. The repository should contain:
   - `data/dictionary.json` - for word data
   - `data/characters.json` - for character data

### 3. Initialize Repository Structure

Create the following files in your GitHub repository:

**`data/dictionary.json`**
```json
[]
```

**`data/characters.json`**
```json
[]
```

## Development

### Start Development Server

```bash
npm run dev
```

This will start both the frontend (Vite) and backend (Express) servers.

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## Features

### 1. Touch-Friendly Developer Console

The developer console is now optimized for mobile devices with:
- Large input fields and buttons
- Collapsible sections for audio/media
- Improved touch targets
- Responsive design

**Access the Developer Console:**
1. Tap the ChakmaLex logo 10 times quickly
2. Enter one of the valid passwords:
   - `frezanz120913`
   - `frezanz1212312123`
   - `frezanz448538`
   - `ujc448538`
   - `ujc120913`
   - `ujc04485380`

### 2. API Integration

The application now includes a comprehensive API client that handles:
- CRUD operations for words and characters
- File uploads (audio and images)
- Data validation
- Error handling with retry logic
- GitHub integration

### 3. GitHub Synchronization

Changes made in the developer console can be automatically synced to your GitHub repository:
- Automatic commits with descriptive messages
- File versioning and history
- Conflict resolution
- Real-time status updates

### 4. Audio Upload and Management

- Support for MP3, WAV, and OGG formats
- File size validation (max 5MB)
- Audio playback testing
- URL-based audio linking
- Collapsible audio management section

### 5. Data Validation

- Required field validation
- Duplicate word detection
- Character type validation
- File format validation

## API Endpoints

### Words Management
- `GET /api/words` - Get all words with pagination and search
- `GET /api/words/:id` - Get a specific word
- `POST /api/words` - Create a new word
- `PUT /api/words/:id` - Update a word
- `DELETE /api/words/:id` - Delete a word

### Characters Management
- `GET /api/characters` - Get all characters
- `GET /api/characters/:id` - Get a specific character
- `POST /api/characters` - Create a new character
- `PUT /api/characters/:id` - Update a character
- `DELETE /api/characters/:id` - Delete a character

### File Upload
- `POST /api/upload/audio` - Upload audio file
- `POST /api/upload/image` - Upload image file

### GitHub Integration
- `GET /api/github/validate` - Validate GitHub configuration
- `GET /api/github/repo-info` - Get repository information
- `GET /api/github/file/:path` - Get file content from GitHub
- `POST /api/github/sync` - Sync data to GitHub
- `GET /api/github/commits/:path` - Get file commits
- `POST /api/github/branch` - Create a new branch
- `POST /api/github/pull-request` - Create a pull request

### Health Check
- `GET /api/health` - Health check endpoint

## Troubleshooting

### Common Issues

1. **"apiclient is not defined" error**
   - Make sure the API client is properly imported
   - Check that the server is running
   - Verify the API URL configuration

2. **GitHub sync fails**
   - Verify your GitHub token has the correct permissions
   - Check that the repository exists and is accessible
   - Ensure the file paths are correct

3. **File upload fails**
   - Check file size limits
   - Verify file format is supported
   - Ensure upload directory has write permissions

4. **Audio playback issues**
   - Check browser autoplay policies
   - Verify audio file format is supported
   - Test with different audio files

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=chakmalex:*
```

### Logs

Check the console for detailed error messages and API request logs.

## Security Considerations

1. **GitHub Token Security**
   - Use a personal access token with minimal required permissions
   - Never commit tokens to version control
   - Rotate tokens regularly

2. **File Upload Security**
   - Validate file types and sizes
   - Scan uploaded files for malware
   - Use secure file storage in production

3. **API Security**
   - Implement rate limiting
   - Add authentication for sensitive operations
   - Use HTTPS in production

## Production Deployment

### Netlify Deployment

1. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist/spa`
   - Functions directory: `netlify/functions`

2. **Set environment variables:**
   - Add all required environment variables in Netlify dashboard
   - Ensure GitHub token is properly configured

3. **Configure redirects:**
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/api/:splat"
     status = 200
   ```

### Environment Variables for Production

```env
NODE_ENV=production
VITE_API_URL=https://your-domain.com/api
GITHUB_TOKEN=your_production_github_token
GITHUB_REPO_OWNER=your_github_username
GITHUB_REPO_NAME=chakmalex-dictionary
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
- Check the troubleshooting section
- Review the API documentation
- Create an issue on GitHub

## License

This project is licensed under the MIT License.