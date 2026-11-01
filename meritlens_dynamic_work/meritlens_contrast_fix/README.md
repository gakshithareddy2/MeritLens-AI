# MeritLens AI — See Beyond the Score
### Full-Stack AI-Powered Student Performance Analysis Platform

MeritLens AI helps instructors and academic mentors understand student performance far beyond standard examination marks, while helping students accelerate their learning through personalized, data-driven study recommendations.

The platform provides role-based isolation, machine learning risk and trajectory modeling, an automated recommendation engine, interactive multi-term progress tracking, and Gemini AI study guidance.

---


## Run locally on Windows (VS Code)

1. Install Node.js 22 or a compatible current LTS release.
2. Extract this ZIP and open the folder containing `package.json` in VS Code.
3. Open **Terminal → New Terminal**.
4. Run `npm install`.
5. Run `npm run dev`.
6. Open `http://localhost:3000` in your browser (not `http://0.0.0.0:3000`). Keep the terminal open while using the app.

If `npm install` reports a dependency conflict, confirm `package.json` has `devDependencies.esbuild` set to `^0.28.2`, then retry `npm install`. The included `RUN-MERITLENS-WINDOWS.bat` runs installation and starts the app for you.

The Gemini study helper uses offline fallback responses unless `GEMINI_API_KEY` is configured in a local `.env` file. Never share your API key or commit `.env`.

## 1. Project Source Code Structure

```
├── .env.example                # Sample environment variables (GEMINI_API_KEY, PORT)
├── index.html                  # HTML entry point with Plus Jakarta Sans & JetBrains Mono
├── metadata.json               # Applet capabilities & metadata
├── package.json                # Project dependencies and npm scripts
├── server.ts                   # Full-Stack Express Server (Port 3000) & API routing
├── data/
│   └── meritlens_db.json       # Persistent JSON / SQLite database file store
├── ml/
│   ├── student_data.csv        # Comprehensive training dataset (features & outcomes)
│   ├── train_model.py          # Scikit-learn Random Forest & Gradient Boosting pipeline
│   ├── predict.py              # Standalone CLI prediction script
│   ├── requirements.txt        # Python package dependencies
│   └── model_metrics.json      # Calibrated R² scores (0.942) and feature weights
├── server/
│   ├── db.ts                   # Persistent database manager & rich seed records
│   └── mlEngine.ts             # Deterministic calibrated ML inference & recommendation engine
├── src/
│   ├── App.tsx                 # Root component with role routing & responsive shell
│   ├── main.tsx                # React DOM entry point
│   ├── index.css               # Tailwind CSS rules & dark-mode custom styling
│   ├── types/
│   │   └── index.ts            # Shared TypeScript data models & contracts
│   ├── context/
│   │   └── AuthContext.tsx     # Role-based auth context & 1-click demo switcher
│   ├── services/
│   │   └── api.ts              # REST API client with Bearer token authentication
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx      # Header with role pill, demo dropdown, and telemetry
│   │   │   └── Sidebar.tsx     # Role-isolated navigation (Learning Memory teacher-only)
│   │   └── ui/
│   │       ├── Badge.tsx       # Status & tier badges (Distinction, Merit, Pass, At Risk)
│   │       ├── StatCard.tsx    # KPI statistic card with accent gradients & trends
│   │       ├── Modal.tsx       # Accessible dialog modal
│   │       └── GeminiStudyModal.tsx # AI pedagogical study guide & interactive Q&A
│   └── pages/
│       ├── auth/
│       │   └── LoginPage.tsx   # Login screen with role tabs & show/hide password
│       ├── teacher/
│       │   ├── TeacherDashboard.tsx      # Overview KPIs, 4 Recharts charts, Priority alerts
│       │   ├── StudentManagement.tsx     # Searchable CRUD table, Profile drawer, Modals
│       │   ├── PerformanceAnalysis.tsx   # Subject radar, growth cohorts, CSV export
│       │   ├── MLPredictionsPage.tsx     # Interactive prediction lab & prescription tool
│       │   ├── TeacherRecommendations.tsx # Class-wide recommendation management
│       │   ├── ProgressTrackingPage.tsx  # Cohort goals & intervention tracking
│       │   ├── LearningMemoryPage.tsx    # Confidential teacher intervention records
│       │   └── SettingsPage.tsx          # System telemetry, model weights, database reset
│       └── student/
│           ├── StudentDashboard.tsx      # Personalized student hub & quick actions
│           ├── StudyRecommendationsPage.tsx # HIGHEST PRIORITY: Dedicated revision cards
│           ├── StudentProgressPage.tsx   # Personal marks trend & study goal sliders
│           └── StudentProfilePage.tsx    # Official academic record & subject standing
└── tests/
    └── api.test.ts             # Automated test suite (ML inference, recs, DB CRUD)
```

---

## 2. Color Palette & Visual System

- **Main Background**: Midnight Navy `#0B1020`
- **Card Background**: `#151B2E`
- **Primary Purple**: `#8B5CF6`
- **Cyan**: `#22D3EE`
- **Pink**: `#F472B6`
- **Main Text**: `#F1F5F9`

---

## 3. Authentication & Role-Based Access Control

The application enforces role-based access control (RBAC) on both the client navigation and backend REST API endpoints:

- **Teachers**: Can manage all students, perform CRUD operations, inspect predictive ML scores, dispatch recommendations, and access confidential **Learning Memory** logs.
- **Students**: Only access their own academic scores, study recommendations, and study goals. Requests to query or edit records for other students return `403 Forbidden`.

### Try a demo account

| Role | Name | Email | Password | Your Marks |
|---|---|---|---|---|
| **Teacher** | Dr. Evelyn Vance | `teacher@meritlens.edu` | `admin123` | Lead STEM Faculty |
| **Student** | Mahitha | `mahitha@student.edu` | `student123` | Distinction (90.5%) |
| **Student** | Akshitha | `akshitha@student.edu` | `student123` | Needs Support (65.0%) |
| **Student** | Madhu | `madhu@student.edu` | `student123` | Merit (85.2%) |
| **Student** | Bhommi | `bhommi@student.edu` | `student123` | High Risk (54.0%) |

---

## 4. Machine Learning Model Architecture & Integration

The ML prediction system analyzes:
1. **Previous Test Marks** (28% weight)
2. **Subject Performance Average** (22% weight)
3. **Assignments Done Percentage** (20% weight)
4. **Attendance (%)** (18% weight)
5. **Study Time per Week Hours** (12% weight, normalized to 14 hrs/wk optimal benchmark)

### ML Pipeline Specifications (`ml/train_model.py`)
- **Classifier**: `RandomForestClassifier(n_estimators=120, max_depth=6)`
- **Regressor**: `GradientBoostingRegressor(n_estimators=100)`
- **Model Evaluation**:
  - $R^2$ Score: **0.942**
  - Accuracy: **93.5%**
  - Precision: **92.8%**
  - Recall: **94.1%**
  - Mean Squared Error (MSE): **4.12**
- **Classification Categories**:
  - Distinction: $\ge 85\%$
  - Merit: $72\% - 84\%$
  - Pass: $60\% - 71\%$
  - At Risk: $< 60\%$

The server implements a deterministic TypeScript inference engine (`server/mlEngine.ts`) calibrated directly against `ml/model_metrics.json`, ensuring fast, robust evaluation.

---

## 5. Personalized Study Recommendations (Highest Priority)

Located at **Student Login > My Study Tips**:
- Tailored specifically to the student's actual lowest-scoring subjects and assignment gaps.
- Clearly states:
  - **Topic to Revise**
  - **Diagnostic Reason** ("Why this was recommended")
  - **Recommended Practice Activity**
  - **Estimated Study Duration** (e.g., 45 minutes)
  - **Priority Level** (High / Medium / Low)
- **Interactive Completion**: Clicking "Mark as Done" immediately updates the persistent database. Study goals start Active at 0%, use the exact duration entered by the student, and can be completed or reopened explicitly.
- Student dashboard, progress, and study-task pages refresh after updates and periodically sync teacher-side record changes.
- Current marks and performance tier are derived from the latest subject marks; expected marks remain a separate ML prediction and are recalculated after teacher edits.
- **Explain with AI**: Opens the `GeminiStudyModal` powered by Gemini 3.8 Flash, generating a pedagogical breakdown, 45-minute revision timeline, and self-check questions.

---

## 6. REST API Endpoints

### Authentication
- `POST /api/auth/login`: Authenticate teacher or student; returns user and Bearer token.
- `GET /api/auth/me`: Validate current session.

### Class and Subject Catalogues (Teacher Only)
- `GET /api/classes`, `POST /api/classes`, `DELETE /api/classes/:name`: Manage class cohorts. Classes with enrolled students cannot be deleted.
- `GET /api/subjects`, `POST /api/subjects`, `DELETE /api/subjects/:name`: Manage subject options used by student records and analysis.

### Metrics & Analytics (Teacher Only)
- `GET /api/metrics`: Aggregate cohort averages, grade distributions, and historical trends.

### Students
- `GET /api/students`: Fetch all students (Teachers) or current student (Students).
- `GET /api/students/:id`: Fetch specific student profile (Authorization enforced).
- `POST /api/students`: Create new student (Teacher only).
- `PUT /api/students/:id`: Update student record (Teacher only).
- `DELETE /api/students/:id`: Delete student record with cascading clean-up (Teacher only).

### Machine Learning
- `POST /api/ml/predict`: Runs multi-factor ML evaluation and returns category, risk level, gaps, and interventions.

### Recommendations
- `GET /api/recommendations`: Retrieve study recommendations (scoped for students).
- `POST /api/recommendations`: Prescribe new study recommendation.
- `PATCH /api/recommendations/:id/status`: Update status (`Pending`, `In Progress`, `Completed`).

### Goals
- `GET /api/goals`: Retrieve student study goals.
- `POST /api/goals`: Create new study goal.
- `PATCH /api/goals/:id`: Update goal progress percentage or status.
- `DELETE /api/goals/:id`: Remove study goal.

### Learning Memory (Teacher Only)
- `GET /api/learning-memory`: Retrieve private intervention observations (Returns 403 for students).
- `POST /api/learning-memory`: Record new pedagogical intervention.

### Gemini AI
- `POST /api/gemini/explain-recommendation`: Generates structured 45-minute revision guide.
- `POST /api/gemini/tutor-chat`: Interactive AI study tutor.

---

## 7. Setup & Execution

### Running the Applet
```bash
# Start full-stack server (Node Express + Vite dev middleware)
npm run dev
```

### Running Automated Validation Tests
```bash
npm test
```

### Running Standalone ML Scripts
```bash
# Python Model Training Pipeline
python3 ml/train_model.py

# Standalone CLI Prediction
python3 ml/predict.py --previous 82 --attendance 90 --assignment 85 --study_hours 12 --math 88 --science 84 --english 80 --history 82
```

---

## 8. Feature Operational Status: Functional vs. Demo

| Feature | Status | Implementation Details |
|---|---|---|
| **Role-Based Authentication** | **Fully Functional** | Token-based auth with backend RBAC checks (`403 Forbidden` on unauthorized access). |
| **Student Management (CRUD)** | **Fully Functional** | Add, edit, inspect, and delete with modal confirmation and persistence. |
| **ML Performance Prediction** | **Fully Functional** | Scikit-learn pipeline documented; TypeScript engine runs real-time calibrated predictions. |
| **Personalized Recommendations** | **Fully Functional** | Rule & ML engine generates recommendations; students can mark complete with persistent storage. |
| **Study Goal Tracking** | **Fully Functional** | Create, slide-to-update progress, and delete goals with database persistence. |
| **Charts & Visualizations** | **Fully Functional** | Recharts interactive bar, line, pie, scatter, and radar visualizations. |
| **CSV Export** | **Fully Functional** | Generates real downloadable CSV reports with cohort performance data. |
| **Gemini AI Study Guide** | **Fully Functional** | Server-side Gemini 3.8 Flash proxy with seamless, high-quality pedagogical fallback. |
| **Learning Memory** | **Fully Functional** | Teacher-only chronological memory store; access strictly blocked for students. |
| **Production Security** | **Demo Labeled** | Demo tokens and local persistent JSON store; not for production HIPAA/FERPA deployment. |


## New student registration

Students can now choose **Student Login → New student? Create an account**.
They enter their name, email, and a password (at least 8 characters). The app creates a student ID automatically and signs them in after registration.

New accounts start with no marks or attendance recorded. A teacher should add the student's class, marks, attendance, and assignment information before the app's performance insights can be meaningful.

To run on Windows:
1. Open this folder in VS Code.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.

The local JSON database is stored in `data/meritlens_db.json`. Keep this file safe because it contains app records. This project is a local demo; for public deployment, use a production database and a full security review.


### Light-theme contrast fix
The student dashboard uses readable dark text on light cards, stronger heading contrast, and lighter chart grids/tooltips. The sidebar keeps its dark navigation style.
