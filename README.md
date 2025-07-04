# Loki - Tools & Utilities Collection

A modern web application providing a collection of useful tools including SQL formatting, document management, and information system. Built with FastAPI, MongoDB, and a clean modular architecture.

## 🚀 Features

### Core Tools

- **SQL Formatter**: Beautiful SQL query formatting with syntax highlighting
- **Document Management**: Admin panel for managing information documents
- **Info System**: Public information page with search and filtering
- **History Tracking**: Automatic SQL formatting history (last 5 items)

### Admin Features

- **Authentication**: Secure admin login with session management
- **Document CRUD**: Create, read, update, delete information documents
- **Category Management**: Organize documents by categories
- **Publishing Control**: Draft/published document states
- **Markdown Support**: Rich content editing with markdown

### User Interface

- **Modern Design**: Clean, responsive interface with gradients
- **Landing Page**: Central hub with tool navigation
- **Modal Dialogs**: Interactive forms and document viewers
- **Search & Filter**: Find documents by category and content
- **Real-time Updates**: Live data without page refreshes

## 🏗️ Architecture

### Organized Structure

```
loki/
├── app/                          # Main application package
│   ├── config.py                # Configuration and database setup
│   ├── models.py                # Pydantic models for type safety
│   ├── middleware/              # Authentication middleware
│   ├── routes/                  # API and page routes
│   ├── services/                # Business logic services
│   └── utils/                   # Database initialization
├── static/                      # CSS, JS files
├── templates/                   # HTML templates
├── main.py                      # FastAPI application
└── [Docker files]              # Deployment configuration
```

### Key Components

- **Modular Design**: Separated concerns with clear boundaries
- **Type Safety**: Pydantic models for request/response validation
- **Service Layer**: Business logic isolated from routes
- **Authentication**: Session-based admin authentication
- **Database**: MongoDB with automatic initialization

## 🛠️ Quick Start

### Using Docker (Recommended)

```bash
# Clone and start
git clone <repository-url>
cd loki
docker-compose up -d

# Access the application
# Main App: http://localhost:8000
# MongoDB Express: http://localhost:8081 (admin/password123)
```

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Set up environment
cp env.example .env
# Edit .env with your MongoDB URI

# Run the application
python main.py
```

## 📱 Pages & Features

### Landing Page (`/`)

- **SQL Formatter**: Navigate to SQL formatting tool
- **INFO**: Access the information documents page
- **Admin Panel**: Manage documents (requires authentication)

### SQL Formatter (`/sql-formatter`)

- **Input/Output**: Split-pane editor for SQL formatting
- **Indentation**: Configurable indentation (2, 4, 8 spaces)
- **History**: View and load previous formatting sessions
- **Export**: Copy to clipboard or download formatted SQL
- **Error Handling**: Clear validation messages

### INFO Page (`/info`)

- **Document Display**: Grid layout of information documents
- **Search**: Real-time search across document content
- **Filtering**: Filter by document categories
- **Modal Viewer**: Click to view full document content
- **Markdown Rendering**: Rich text display with syntax highlighting

### Admin Panel (`/admin`)

- **Authentication**: Login with username/password
- **Document Management**: Full CRUD operations
- **Category Management**: Organize documents by type
- **Publishing**: Control document visibility
- **Rich Editor**: Markdown content editing

## 🔐 Authentication

### Admin Access

- **Username**: `admin`
- **Password**: `changeme123` (configurable via environment variables)
- **Session**: 8-hour session cookies
- **Protected Routes**: All `/api/documents*` endpoints

### Environment Variables

```bash
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
MONGO_URI=mongodb://localhost:27017
```

## 📊 API Endpoints

### SQL Formatter

- `POST /api/format` - Format SQL content
- `GET /api/history` - Get formatting history
- `DELETE /api/history/{id}` - Delete history item
- `DELETE /api/history` - Clear all history

### Information Documents

- `GET /api/info/documents` - Get published documents
- `GET /api/info/documents/{id}` - Get specific document
- `GET /api/info/categories` - Get available categories

### Admin (Protected)

- `POST /api/admin/login` - Admin authentication
- `POST /api/admin/logout` - Admin logout
- `GET /api/documents` - Get all documents (admin)
- `POST /api/documents` - Create document
- `PUT /api/documents/{id}` - Update document
- `DELETE /api/documents/{id}` - Delete document

## 🎨 User Interface

### Design Features

- **Gradient Backgrounds**: Modern purple-blue gradients
- **Glass Morphism**: Translucent cards with backdrop blur
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: CSS transitions and hover effects
- **Icon Integration**: Font Awesome icons throughout

### Navigation

- **Back Buttons**: Consistent navigation between pages
- **Breadcrumbs**: Clear page hierarchy
- **Modal Dialogs**: Non-intrusive forms and viewers
- **Loading States**: Visual feedback during operations

## 🗄️ Database

### Collections

- **formatting_history**: SQL formatting history (last 5 items)
- **information_documents**: Content documents with metadata

### Sample Data

The application automatically initializes with sample documents:

- Getting Started with SQL
- SQL Formatting Guidelines
- Database Performance Tips
- Common SQL Mistakes

## 🚀 Deployment

### Docker Compose

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Configuration

```bash
# Copy example
cp env.example .env

# Configure variables
MONGO_URI=mongodb://localhost:27017
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

## 🛠️ Development

### Project Structure Benefits

- **Modularity**: Each component has a single responsibility
- **Testability**: Services can be tested independently
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to add new features and modules

### Code Organization

- **Models**: Pydantic schemas for type safety
- **Services**: Business logic separated from routes
- **Routes**: Clean API endpoints and page handlers
- **Middleware**: Authentication and other middleware
- **Config**: Centralized configuration management

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection**: Ensure MongoDB is running
2. **Authentication**: Check admin credentials in environment
3. **Port Conflicts**: Verify ports 8000 and 27017 are available
4. **Dependencies**: Run `pip install -r requirements.txt`

### Logs and Debugging

```bash
# View application logs
docker-compose logs app

# Check MongoDB status
docker-compose logs mongodb

# Access container shell
docker-compose exec app bash
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues or questions:

1. Check the API documentation at `/docs`
2. Review browser console for errors
3. Check Docker logs: `docker-compose logs`
4. Verify environment configuration
5. Ensure all services are running

---

**Loki** - A modern collection of tools and utilities for developers and teams.
