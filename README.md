# LabHub / Kehat Lab

LabHub / Kehat Lab is an internal Full Stack laboratory management system for an academic cardiovascular genetics research laboratory. It is intended for authorized lab members and supports day-to-day operational management across research projects, tasks, responsibilities, inventory, equipment, bookings, protocol files, users, and dashboard summaries.

## Project Overview

LabHub centralizes common laboratory workflows in one protected portal. The application supports:

- Research projects
- Lab and project tasks
- Lab responsibilities
- Inventory and stock monitoring
- Equipment records
- Equipment bookings
- Protocol file upload and download
- User profiles and role-based access
- Dashboard statistics and recent activity

The system is built as an internal academic lab tool. Public access is limited to authentication pages; operational pages require login.

## Main Features

### Authentication and Users

- Login with email and password
- Internal registration using a lab access code
- JWT authentication
- Password hashing with bcrypt
- Session restoration after browser refresh
- Logout
- Profile update
- Change password
- Admin user management
- Admin and researcher roles

### Projects

- Project list
- Project details
- Create, update, and delete according to backend authorization
- Project ownership and project members
- Project-related tasks

### Tasks

- Lab tasks and project tasks
- Create, update, and delete tasks
- Status updates
- Completed tasks view
- Overdue tasks view
- Assignment and due dates

### Responsibilities

- Lab responsibility management
- My responsibilities view
- Admin-only create, update, and delete permissions
- Assigned and backup users

### Inventory

- Inventory list
- Admin-only create, update, and delete
- Quantity and minimum quantity tracking
- Low-stock view
- Expired inventory view
- Category and stock filtering

### Equipment

- Equipment management
- Equipment details page
- Admin-only create, update, and delete
- Equipment status management
- Supported statuses: `available`, `maintenance`, `out_of_service`

### Equipment Bookings

- Create bookings
- Edit bookings
- Cancel bookings
- My bookings view
- Backend conflict validation for overlapping active bookings
- Supported statuses: `active`, `cancelled`, `completed`

### Protocol Library

- Upload protocol files
- Supported formats: PDF, DOC, DOCX
- Maximum upload size: 10 MB
- Metadata editing
- Protected file download
- Admin-only deletion
- Uploader/admin update authorization

### Dashboard

- Real backend statistics
- Recent projects
- Recent tasks
- Recent bookings
- Recent protocols
- Loading, error, and zero-value handling

## Technology Stack

### Frontend

- React 19
- Vite
- React Router
- Redux Toolkit
- React Redux
- Axios
- React Hook Form
- Tailwind CSS
- Lucide React

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcrypt
- Joi dependency installed
- Multer
- Helmet
- CORS
- express-rate-limit dependency installed
- dotenv

### Development

- ESLint
- Nodemon
- Git and GitHub

## Architecture

### Backend

The backend follows a lightweight MVC structure:

- Models define MongoDB schemas with Mongoose.
- Controllers contain request handling and business logic.
- Routes define API endpoints and attach middleware.
- Middleware handles authentication, role authorization, and protocol upload handling.
- Utilities and configuration handle JWT generation and MongoDB connection setup.

There is no separate service layer in the backend.

### Frontend

The frontend is organized by responsibility:

- Pages render route-level screens.
- Components provide reusable UI, dashboard, auth, and layout elements.
- Services wrap Axios API calls.
- Redux slices manage module state and async thunks.
- AuthContext manages authentication state, token storage, logout, login, and session restoration.
- Routes define public, protected, admin-only, and error views.
- Layouts separate authentication pages from the internal dashboard shell.

## Folder Structure

```text
LabHub/
|-- client/
|   |-- src/
|   |   |-- api/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- context/
|   |   |-- features/
|   |   |-- hooks/
|   |   |-- layouts/
|   |   |-- pages/
|   |   |-- redux/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- styles/
|   |   `-- utils/
|   `-- package.json
|-- server/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- uploads/
|   |-- utils/
|   |-- validation/
|   |-- app.js
|   |-- server.js
|   `-- package.json
|-- .gitignore
`-- README.md
```

## Prerequisites

- Node.js
- npm
- MongoDB local installation or MongoDB Atlas
- Git

No specific Node.js version is defined in `package.json`.

## Environment Variables

Create local `.env` files from the provided examples. Do not commit real secret values.

### Backend

File: `server/.env`

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/labhub
JWT_SECRET=replace_with_a_secure_secret
JWT_EXPIRE=7d
LAB_ACCESS_CODE=replace_with_the_lab_access_code
CLIENT_URL=http://localhost:5173
SEED_USER_PASSWORD=LabHubDemo123!
ALLOW_REMOTE_SEED=false
```

These variables are used by `server/server.js`, `server/config/db.js`, `server/controllers/authController.js`, `server/middleware/authMiddleware.js`, `server/utils/generateToken.js`, and `server/app.js`.

### Frontend

File: `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

The frontend reads this value in `client/src/api/axiosInstance.js`. For deployment, set it to the Render backend API base URL, for example `https://<render-backend-domain>/api`.

## Installation

Clone the repository:

```bash
git clone https://github.com/maayaneshco/FullStack_Final_Project.git
cd FullStack_Final_Project
```

Install and run the backend:

```bash
cd server
npm install
# copy .env.example to .env and fill in local values
npm run dev
```

Install and run the frontend in a second terminal:

```bash
cd client
npm install
# copy .env.example to .env and fill in local values
npm run dev
```

Expected local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000` unless `PORT` is changed

## Demo Data

The backend includes an explicit seed script for preparing a realistic academic demonstration dataset. It is not connected to `app.js`, `server.js`, `npm start`, or `npm run dev`; it runs only when called intentionally.

From the backend folder:

```bash
cd server
npm run seed:demo
```

Optional cleanup for this seed's known demo records:

```bash
npm run seed:demo:clean
```

The seed uses `SEED_USER_PASSWORD` for all seeded user accounts. If the variable is not set, the script uses the documented development-only fallback:

```text
LabHubDemo123!
```

The seed is idempotent. It uses stable user emails, project titles, task titles, inventory names, equipment names, booking purposes, and protocol titles to update existing demo records instead of creating duplicates. It does not wipe the database and does not call generic collection resets such as `deleteMany({})`.

The seed always searches for and removes only the clearly identified test user whose visible name is `TEST MEMBER`.

Seeded accounts include:

| Name | Role | Lab position | Notes |
| --- | --- | --- | --- |
| Izhak Kehat | admin | `principal_investigator` | Project-owner-directed principal investigator account. |
| Shelly Marienberg | researcher | `md_phd_student` | Existing user is updated if present instead of duplicated. |
| Noa Ben-David | researcher | `researcher` | Fictional demonstration user. |
| Amir Cohen | researcher | `md_student` | Fictional demonstration user. |
| Yael Levi | researcher | `lab_manager` | Fictional demonstration user. |
| Daniel Rosen | researcher | `lab_technician` | Fictional demonstration user. |
| Maya Stein | researcher | `undergraduate_research_assistant` | Fictional demonstration user. |
| Eitan Barak | researcher | `other` | Fictional demonstration user. |

Seeded demo content includes:

- 4 projects
- 16 tasks
- 6 responsibilities
- 12 inventory items
- 7 equipment records
- 7 bookings
- 4 protocol records with local demonstration PDF files

For safety, the seed refuses to run against a non-local MongoDB host unless `ALLOW_REMOTE_SEED=true` is set intentionally. Deployment databases should be seeded manually and deliberately, not automatically during server startup.

## Available Scripts

### Client

- `npm run dev` - start the Vite development server
- `npm run build` - create a production build
- `npm run lint` - run ESLint
- `npm run preview` - preview the production build locally

### Server

- `npm run dev` - start the backend with Nodemon
- `npm start` - start the backend with Node
- `npm run seed:demo` - seed realistic demo data intentionally
- `npm run seed:demo:clean` - remove only this seed's known demo records

## User Roles and Authorization

| Role | Permissions |
| --- | --- |
| Admin | User management, inventory management, equipment management, responsibility management, protocol deletion, and administrative actions allowed by backend ownership and role checks. |
| Researcher | Use research modules, create projects, manage owned projects, create allowed tasks, create bookings, upload protocols, update own uploaded protocols, and read protected lab resources where permitted. |

The backend is the final authority for authorization. The frontend hides restricted controls where appropriate, but protected API routes and controller checks enforce access.

## Frontend Routes

### Public

- `/`
- `/login`
- `/register`

### Protected

- `/dashboard`
- `/projects`
- `/projects/:id`
- `/tasks`
- `/tasks/completed`
- `/tasks/overdue`
- `/responsibilities`
- `/responsibilities/my`
- `/inventory`
- `/inventory/low-stock`
- `/inventory/expired`
- `/equipment`
- `/equipment/:id`
- `/bookings`
- `/bookings/my`
- `/protocols`
- `/profile`
- `/change-password`

### Admin-only

- `/users`

### Error Routes

- `/401`
- `*` wildcard route for Not Found

## API Overview

All protected routes expect an `Authorization: Bearer <token>` header.

### Auth: `/api/auth`

- `POST /register`
- `POST /login`
- `GET /me`

### Users: `/api/users`

- `GET /` - admin-only users list
- `GET /profile`
- `PUT /profile`
- `PUT /change-password`
- `PUT /:id/role` - admin-only role update

### Dashboard: `/api/dashboard`

- `GET /` - protected dashboard summary and recent activity

### Health: `/api/health`

- `GET /` - public health check returning `{ "status": "ok" }`

### Projects: `/api/projects`

- `GET /`
- `POST /`
- `GET /:id/tasks`
- `GET /:id`
- `PUT /:id`
- `DELETE /:id`
- `POST /:id/members`
- `DELETE /:id/members/:userId`

Project update, delete, and member-management actions are restricted by owner/admin checks in the controller.

### Tasks: `/api/tasks`

- `POST /`
- `GET /lab`
- `GET /my-project-tasks`
- `GET /my-lab-tasks`
- `GET /overdue`
- `GET /completed`
- `GET /:id`
- `PUT /:id`
- `PUT /:id/status`
- `DELETE /:id`

Task permissions depend on role, project ownership, project membership, assignment, and task type.

### Responsibilities: `/api/responsibilities`

- `GET /`
- `GET /my`
- `GET /:id`
- `POST /` - admin-only
- `PUT /:id` - admin-only
- `DELETE /:id` - admin-only soft delete

### Inventory: `/api/inventory`

- `GET /`
- `GET /low-stock`
- `GET /expired`
- `GET /:id`
- `POST /` - admin-only
- `PUT /:id` - admin-only
- `DELETE /:id` - admin-only soft delete

### Equipment: `/api/equipment`

- `GET /`
- `GET /:id`
- `POST /` - admin-only
- `PUT /:id` - admin-only
- `DELETE /:id` - admin-only soft delete

### Bookings: `/api/bookings`

- `GET /`
- `GET /my-bookings`
- `GET /equipment/:equipmentId`
- `POST /`
- `PUT /:id`
- `PUT /:id/cancel`

Booking update and cancellation are allowed for admins or the user who created the booking.

### Protocols: `/api/protocols`

- `GET /`
- `POST /`
- `GET /:id`
- `PUT /:id`
- `GET /:id/download`
- `DELETE /:id` - admin-only soft delete

Protocol metadata updates are allowed for admins or the user who uploaded the protocol.

## File Uploads

Protocol uploads use Multer in `server/middleware/protocolUpload.js`.

- Upload endpoint: `POST /api/protocols`
- Multipart field name: `file`
- Allowed MIME types:
  - `application/pdf`
  - `application/msword`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Maximum size: 10 MB
- Storage directory: `server/uploads/protocols`
- Download endpoint: `GET /api/protocols/:id/download`

Protocol downloads are protected and use the stored server file path.

On Render, local filesystem storage may be ephemeral. Uploads continue to work with the current local storage implementation, but uploaded protocol files may not persist across service restarts or redeployments unless persistent/cloud storage is added later.

## Security

Implemented security measures include:

- Password hashing with bcrypt
- JWT authentication
- Protected API routes with authentication middleware
- Role-based authorization middleware
- Backend ownership checks for projects, tasks, bookings, and protocols
- Helmet security headers
- CORS configured with `CLIENT_URL`
- Environment variables for secrets and environment-specific configuration
- Multer file type and size validation for protocol uploads
- User list and profile endpoints exclude password fields

## Validation and Error Handling

- Frontend forms include practical validation for required fields, email format, passwords, file type, file size, and simple date/time rules.
- Backend validation is handled through Mongoose schemas and controller-level checks.
- API errors are returned as JSON messages and displayed in the frontend pages.
- Data pages include loading, error, and empty states.

## Quality Checks

The frontend supports:

```bash
npm run lint
npm run build
```

The backend has no automated test script in `server/package.json`. Backend endpoints were manually verified during development using Postman.

## Deployment

The project is deployed and available for academic review.

- Live Application: https://full-stack-final-project-alpha.vercel.app
- Backend API: https://labhub-backend-q124.onrender.com/api
- Health Check: https://labhub-backend-q124.onrender.com/api/health

- Frontend hosting: Vercel
- Backend hosting: Render
- Database hosting: MongoDB Atlas

Render Free instances may require a short cold-start delay before the first backend request responds. Protocol files currently use Render local filesystem storage, so uploaded protocol files may not persist after a Render service restart or redeployment unless persistent or cloud file storage is added later.

### Deployment Configuration

### MongoDB Atlas

MongoDB Atlas stores the production/demo database. Atlas connection strings, database passwords, and generated credentials must be set only in the deployment environment and must not be committed to the repository.

For local demo data, run:

```bash
cd server
npm run seed:demo
```

For an intentional remote demo seed against Atlas, temporarily set `ALLOW_REMOTE_SEED=true` in the backend environment and run the seed manually. The seed never runs automatically during server startup. Seeded demonstration account passwords come from `SEED_USER_PASSWORD`, and the fictional demo researchers are demonstration data for submission/testing only.

### Render Backend

The backend is hosted as a Render Web Service.

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`

Required Render environment variables are configured in Render, not committed:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=<mongodb-atlas-connection-string>
JWT_SECRET=<secure-production-secret>
JWT_EXPIRE=7d
LAB_ACCESS_CODE=<secure-lab-access-code>
CLIENT_URL=https://full-stack-final-project-alpha.vercel.app
SEED_USER_PASSWORD=<demo-password-if-seeding>
ALLOW_REMOTE_SEED=false
```

Render provides `PORT` at runtime. The backend already uses `process.env.PORT || 5000` and listens on `0.0.0.0`.

`CLIENT_URL` may contain one URL or a comma-separated list, for example local Vite plus the final Vercel URL during testing. The backend exposes `GET /api/health` for Render health checks and deployment verification.

### Vercel Frontend

The frontend is hosted on Vercel.

- Root Directory: `client`
- Framework Preset: Vite
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

Required Vercel environment variable:

```env
VITE_API_URL=https://labhub-backend-q124.onrender.com/api
```

The frontend includes `client/vercel.json` with a rewrite to `/index.html` so React Router routes such as `/dashboard`, `/projects`, `/tasks`, and `/users` work on direct navigation and browser refresh.

## Known Limitations

- No automated backend test suite is currently configured.
- No refresh-token implementation is currently included.
- Protocol uploads depend on server file storage.
- Deployment may require persistent file storage adjustments for uploaded protocols.
- Vite may show a large frontend bundle warning during production builds.
- `express-rate-limit` is installed but no active rate limiter is currently wired in `server/app.js`.

## Future Improvements

- Automated frontend and backend tests
- Cloud file storage for protocols
- Notifications
- Advanced search and pagination
- Analytics and reporting

These improvements are not part of the current submission scope.

## Academic Context

This project was developed as an Advanced Full Stack final project.

## License

This project was developed for academic purposes.
