# Drawing Bot — AI-Powered Text-to-Drawing Application

A comprehensive full-stack web application that transforms natural language instructions into visual drawings on an HTML5 Canvas. Users can describe what they want to draw (e.g., "Draw a blue house with a yellow sun"), and the system leverages **Google Gemini AI** to interpret the prompt and render it instantly.


## **Project Overview**

**Drawing Bot** is designed for users who want to create visual art through natural language, without needing graphic design skills or manual drawing tools. The application:

- **Accepts natural language prompts** (e.g., "Draw a red circle", "Add a green triangle")
- **Uses Google Gemini AI** to interpret prompts and generate structured drawing commands (JSON)
- **Renders drawings** on an interactive HTML5 Canvas
- **Supports user accounts** with JWT-based authentication
- **Persists drawings** in a database for later retrieval
- **Provides undo/redo** functionality for iterative drawing

**Target Audience:** Developers, educators, students, or anyone interested in AI-powered creative tools.

---

## **Architecture**

### **High-Level System Diagram (ASCII)**

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  React Client (Vite + TypeScript)                         │  │
│  │  - Auth UI (Login/Register)                               │  │
│  │  - Prompt Input                                           │  │
│  │  - Chat History                                           │  │
│  │  - HTML5 Canvas Renderer                                  │  │
│  │  - Undo/Redo/Save/Load Controls                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           ↕ HTTP/JSON (proxy: /api)             │
└─────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│              ASP.NET Core 7 Web API (C#)                        │
│  ┌─────────────────┐   ┌──────────────────┐   ┌─────────────┐   │
│  │ Auth Controller │   │  AI Controller   │   │ Drawings    │   │
│  │ - Register      │   │ - Interpret      │   │ Controller  │   │
│  │ - Login         │   │   Prompt (via    │   │ - Save/Load │   │
│  │ - JWT Tokens    │   │   Gemini API)    │   │ - List      │   │
│  └─────────────────┘   └──────────────────┘   └─────────────┘   │
│                                  ↕                              │
│                      ┌────────────────────┐                     │
│                      │  Entity Framework  │                     │
│                      │  Core (SQLite DB)  │                     │
│                      │  - Users           │                     │
│                      │  - Drawings        │                     │
│                      └────────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
                                  ↓
                   ┌──────────────────────────────┐
                   │  Google Gemini API           │
                   │  (gemini-2.0-flash model)    │
                   └──────────────────────────────┘
```

### **Architecture Explanation**

1. **Client (React SPA):**
   - Runs on `http://localhost:5173` (Vite dev server)
   - Communicates with API via `/api/*` (proxied to backend)
   - Sends JWT in `Authorization: Bearer <token>` header for protected endpoints
   - Renders drawings on HTML5 Canvas using custom drawing logic

2. **Server (ASP.NET Core API):**
   - Runs on `http://localhost:5035` (HTTP) or `https://localhost:7196` (HTTPS)
   - Handles authentication (JWT-based)
   - Stores users and drawings in SQLite database
   - Calls Google Gemini API to interpret natural language prompts
   - Returns structured JSON drawing commands to client

3. **Database (SQLite):**
   - File: `texttodrawingbot.db` (local)
   - Schema: `Users` (id, email, passwordHash), `Drawings` (id, title, commandsJson, ownerId, createdAt)

4. **External API (Gemini):**
   - Google Generative AI API
   - Model: `gemini-2.0-flash` (configurable)
   - Converts natural language → JSON drawing commands

---
## **Features**

 **Natural Language Drawing:** Type prompts like "Draw a red circle" and see instant results  
**AI-Powered:** Google Gemini 2.0 Flash interprets prompts and generates drawing commands  
 **User Authentication:** Register/login with email + password (JWT-based)  
 **Save & Load Drawings:** Store drawings on the server with custom titles  
 **Undo/Redo:** Step backward/forward through drawing history  
 **Chat History:** See all previous prompts and bot responses  
 **Multi-Shape Support:** Circle, line, rectangle, triangle, text  
 **Incremental Drawing:** Add to existing drawings with new prompts  
 **Clear Canvas:** Reset to blank canvas  
 **Responsive UI:** Clean, modern interface with Hebrew + English text  
 **Swagger UI:** Interactive API documentation at `/swagger`

---

### **Key Folders Explained**

#### **Client (`/client`)**
- **`src/components/`**: Reusable UI components (AuthPanel, CanvasBoard, PromptInput, UserBar)
- **`src/drawing/`**: Core drawing logic (rendering + normalization)
- **`src/services/`**: API client for communicating with backend
- **`src/types/`**: TypeScript interfaces for type safety

#### **Server (`/server`)**
- **`Controllers/`**: REST API endpoints (Auth, Drawings, AI, Me)
- **`Models/`**: Database entities (User, Drawing)
- **`Data/`**: Entity Framework Core DbContext
- **`Migrations/`**: Database schema migrations (auto-generated by EF Core)
- **`Services/`**: Utility classes (JWT, password hashing)

---

## **Getting Started**

### **Prerequisites**

Ensure you have the following installed:

| Tool            | Version  | Purpose                          | Download Link                                  |
|-----------------|----------|----------------------------------|------------------------------------------------|
| Node.js + npm   | 18+      | Run client dev server + build    | [nodejs.org](https://nodejs.org/)              |
| .NET SDK        | 7.0+     | Run/build server                 | [dotnet.microsoft.com](https://dotnet.microsoft.com/) |
| Git             | Latest   | Clone repository                 | [git-scm.com](https://git-scm.com/)            |
| Google Gemini API Key | N/A | Required for AI interpretation   | [aistudio.google.com](https://aistudio.google.com/app/apikey) |

---

### **Installation**

#### **1. Clone the Repository**

```bash
git clone https://github.com/rachelhildesimer/Drawing-Bot.git
cd Drawing-Bot
```

#### **2. Install Client Dependencies**

```bash
cd client/text-to-drawing-bot-client
npm install
```

#### **3. Install Server Dependencies**

```bash
cd ../../server/TextToDrawingBot.Api
dotnet restore
```

#### **4. Apply Database Migrations**

```bash
# From server/TextToDrawingBot.Api directory
dotnet ef database update
```

This creates `texttodrawingbot.db` in the server directory.

---

### **Environment Variables**

#### **Server Configuration**

The server requires a **Gemini API Key** to function. This is stored using **.NET User Secrets** (not in `appsettings.json` for security).

##### **Set Gemini API Key (User Secrets)**

1. Navigate to the server directory:
   ```bash
   cd server/TextToDrawingBot.Api
   ```

2. Initialize user secrets (if not already done):
   ```bash
   dotnet user-secrets init
   ```

3. Set the Gemini API key:
   ```bash
   dotnet user-secrets set "Gemini:ApiKey" "YOUR_GEMINI_API_KEY_HERE"
   ```

4. (Optional) Change the Gemini model:
   ```bash
   dotnet user-secrets set "Gemini:Model" "gemini-2.0-flash"
   ```

### **Running the Application**

#### **1. Start the Server (Backend)**

```bash
cd server/TextToDrawingBot.Api
dotnet run
```

**Expected Output:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5035
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:7196
```

**Swagger UI:** [http://localhost:5035/swagger](http://localhost:5035/swagger)

#### **2. Start the Client (Frontend)**

Open a new terminal:

```bash
cd client/text-to-drawing-bot-client
npm run dev
```

**Expected Output:**
```
VITE v7.2.4  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  press h + enter to show help
```

#### **3. Open in Browser**

Navigate to: **[http://localhost:5173](http://localhost:5173)**

---

## **Usage**

### **Main User Flows**

#### **Flow 1: Register & Login**
1. Open [http://localhost:5173](http://localhost:5173)
2. Enter email + password (password must have 6+ characters, letters + numbers)
3. Click **Register** (creates account) or **Login** (existing account)
4. On success, JWT is stored in `localStorage` and user is redirected to main app

#### **Flow 2: Create a Drawing**
1. After login, type a prompt in the input field (e.g., "Draw a blue circle")
2. Click **Send** or press **Enter**
3. AI interprets the prompt and adds drawing commands to the canvas
4. Continue adding prompts to build up the drawing (e.g., "Add a red square")

#### **Flow 3: Undo/Redo**
- Click **Undo** to step back through drawing history
- Click **Redo** to step forward

#### **Flow 4: Save Drawing**
1. Enter a title in the input field (bottom-left)
2. Click **Save**
3. Drawing is saved to the server with your user ID

#### **Flow 5: Load Saved Drawing**
1. Click the dropdown at the top (shows list of saved drawings)
2. Select a drawing by ID
3. Canvas updates with loaded drawing

#### **Flow 6: Clear Canvas**
- Click **Clear** to reset to blank canvas

---
## **API Documentation**

### **Endpoints Summary**

| Method | Endpoint                | Auth Required? | Description                          | Request Body                          | Response                          |
|--------|-------------------------|----------------|--------------------------------------|---------------------------------------|-----------------------------------|
| POST   | `/api/auth/register`    |  No           | Create new user                      | `{ email, password }`                 | `{ token }`                       |
| POST   | `/api/auth/login`       |  No           | Login existing user                  | `{ email, password }`                 | `{ token }`                       |
| GET    | `/api/me`               |  Yes          | Get current user info                | *(none)*                              | `{ id, email }`                   |
| POST   | `/api/ai/interpret`     |  No           | Interpret prompt with Gemini AI      | `{ prompt }`                          | `{ commandsJson }`                |
| POST   | `/api/drawings`         |  Yes          | Save a drawing                       | `{ title, commandsJson }`             | `{ id }`                          |
| GET    | `/api/drawings`         | Yes          | List user's drawings                 | *(none)*                              | `[{ id, title, createdAt }]`      |
| GET    | `/api/drawings/{id}`    |  Yes          | Load a drawing by ID                 | *(none)*                              | `{ id, title, commandsJson, createdAt }` |

```

