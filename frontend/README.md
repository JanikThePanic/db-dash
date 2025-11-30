# DB-Dash Frontend

A modern React + TypeScript dashboard for Weaviate vector database management.

## Features

### 📊 Database Tab
- Real-time health monitoring
- Weaviate connection status
- Database metadata and version info
- Module information display

### 📁 Collections Tab
- List all collections
- View collection schemas and properties
- Inspect property types and configurations
- Delete collections with confirmation

### 🔍 Objects Tab
- **Browse Objects**: Paginated object browsing by collection
- **Text Search**: Full-text search across collections
- **Near Object Search**: Vector similarity search
- Detailed object inspection with properties and vectors
- Interactive object details dialog

### 🎨 3D View Tab
- Interactive 3D vector space visualization
- Real-time vector projection (2D/3D)
- Point cloud rendering with Three.js
- Click points to view details
- Configurable projection parameters
- Color-coded point selection

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development
- **Material-UI (MUI)** for UI components
- **@react-three/fiber** & **@react-three/drei** for 3D visualization
- **Three.js** for WebGL rendering
- **Axios** for API communication

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Make sure the backend is running on `http://localhost:8000`

The app will be available at `http://localhost:5173`

## Configuration

The frontend expects the backend API to be available at `http://localhost:8000/api`. 

You can modify this in `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8000/api';
```

## Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.


## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
