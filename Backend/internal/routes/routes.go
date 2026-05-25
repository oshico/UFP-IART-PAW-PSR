package routes

import (
	"backend/internal/handlers"
	"backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api/v1")
	{

		Import := api.Group("/import")
		{
			Import.POST("/fires", handlers.ImportFire)
			Import.GET("/status/:taskID", handlers.GetImportStatus)
		}

		fires := api.Group("/locations")
		{
			fires.GET("/fires", handlers.GetFireLocations)
		}

		auth := api.Group("/auth")
		{
			auth.POST("/register", handlers.Register)
			auth.POST("/login", handlers.Login)
			auth.POST("/refresh", handlers.Refresh)
			auth.POST("/logout", handlers.Logout)
			auth.GET("/me", middleware.AuthRequired(), handlers.Me)
		}
	}
}
