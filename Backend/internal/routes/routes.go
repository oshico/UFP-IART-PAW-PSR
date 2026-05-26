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
			Import.POST("/rains", handlers.ImportRain)
			Import.GET("/status/:taskID", handlers.GetImportStatus)
		}

		locations := api.Group("/locations")
		{
			locations.GET("/fires", handlers.GetFireLocations)
			locations.GET("/rains", handlers.GetRainLocations)
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
