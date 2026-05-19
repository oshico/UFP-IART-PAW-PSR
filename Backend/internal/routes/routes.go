package routes

import (
	"backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api/v1")
	{
		api.POST("/import/Fires", handlers.ImportFire)
	}
}