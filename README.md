# UFP-IART-PAW-PSR/Backend/

├── cmd/
│ └── main.go
├── internal/
│ ├── handlers/
│ ├── routes/
│ └── services/
├── go.mod
└── .air.toml # Air configuration for hot reloading


Install dependencies:
Running the Application
Development Mode (with hot reload):

Production Build:

The server will start and listen on the default Gin port (localhost:8080).

API Endpoints
Health Check
GET /ping - Server health check endpoint
Response: {"message": "pong"}
Dependencies


Key dependencies include:
gin-gonic/gin - Web framework
Various validation and encoding libraries
For a complete list, see go.mod.



Configuration
Build Output: ./tmp/main
Excluded Directories: assets, tmp, vendor, testdata
Included Extensions: Go files, templates (.tpl, .tmpl, .html)
Live Reload Delay: 300ms
Development
Project Layout conventions
cmd/ - Application entry points
internal/handlers/ - HTTP request handlers
internal/routes/ - Route definitions and middleware
internal/services/ - Business logic and data operations
Building
License



See LICENSE file for details.

Project: UFP-IART-PAW-PSR - A modern Go backend service