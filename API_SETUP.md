# ChakmaLex API Setup Guide

This guide explains how to set up and configure the ChakmaLex API for backend synchronization and GitHub integration.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- GitHub account with a personal access token
- Git repository for storing dictionary data

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy the environment template:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# GitHub Integration
VITE_GITHUB_TOKEN=your_github_personal_access_token_here
VITE_GITHUB_REPO=your_username/your_repo_name

# Server Configuration
PING_MESSAGE=pong
PORT=3000

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

## GitHub Setup

### 1. Create a Personal Access Token

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Click "Generate new token (classic)"
3. Give it a name like "ChakmaLex API"
4. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
5. Copy the generated token

### 2. Create a Repository for Dictionary Data

1. Create a new repository on GitHub (e.g., `chakmalex/dictionary-data`)
2. Add the following files to your repository:

```
dictionary-data/
├── data/
│   ├── words.json
│   └── characters.json
├── README.md
└── .gitignore
```

3. Initialize with sample data:

**data/words.json:**
```json
[]
```

**data/characters.json:**
```json
[]
```

### 3. Configure Repository Variables

Update your `.env` file with your repository details:
```env
VITE_GITHUB_REPO=your_username/dictionary-data
VITE_GITHUB_TOKEN=ghp_your_token_here
```

## Running the Application

### Development Mode

1. Start the development server:
```bash
npm run dev
```

2. The API will be available at `http://localhost:3000/api`

### Production Mode

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## API Endpoints

### Words Management

- `GET /api/words` - Get all words with pagination
- `GET /api/words/:id` - Get word by ID
- `POST /api/words` - Create new word
- `PUT /api/words/:id` - Update word
- `DELETE /api/words/:id` - Delete word
- `GET /api/words/search?query=...` - Search words
- `POST /api/words/batch` - Batch create words

### Characters Management

- `GET /api/characters` - Get all characters
- `GET /api/characters/:id` - Get character by ID
- `POST /api/characters` - Create new character
- `PUT /api/characters/:id` - Update character
- `DELETE /api/characters/:id` - Delete character

### File Upload

- `POST /api/upload/audio` - Upload audio file
- `POST /api/upload/image` - Upload image file

### GitHub Integration

- `POST /api/github/sync` - Sync data to GitHub
- `GET /api/github/status` - Get GitHub sync status

### Data Management

- `GET /api/export` - Export all data
- `POST /api/import` - Import data
- `POST /api/sync` - Sync all data
- `POST /api/cache/clear` - Clear cache

### Health Check

- `GET /api/health` - Health check endpoint

## Data Storage

The API stores data in JSON files in the `data/` directory:

- `data/words.json` - Dictionary words
- `data/characters.json` - Chakma characters
- `uploads/audio/` - Uploaded audio files
- `uploads/image/` - Uploaded image files

## Security Considerations

1. **GitHub Token Security**: Never commit your GitHub token to version control
2. **File Upload Limits**: Configure appropriate file size limits
3. **CORS Configuration**: Configure CORS for your domain
4. **Input Validation**: All inputs are validated before processing

## Troubleshooting

### Common Issues

1. **GitHub API Errors**
   - Check your token permissions
   - Verify repository exists and is accessible
   - Ensure token hasn't expired

2. **File Upload Issues**
   - Check file size limits
   - Verify upload directory permissions
   - Check file type restrictions

3. **CORS Errors**
   - Configure CORS origins in server configuration
   - Check browser console for specific errors

4. **Data Sync Issues**
   - Verify network connectivity
   - Check API endpoint availability
   - Review server logs for errors

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=chakmalex:*
```

## Deployment

### Netlify Functions

For Netlify deployment, the API routes are automatically converted to serverless functions.

### Vercel

For Vercel deployment, create a `vercel.json` configuration:

```json
{
  "functions": {
    "server/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/$1"
    }
  ]
}
```

### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review server logs for error details
3. Verify environment configuration
4. Test API endpoints individually

## Contributing

When contributing to the API:

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Update documentation
5. Test all endpoints