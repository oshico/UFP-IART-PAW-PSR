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
		Import.Use(middleware.AuthRequired())
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

		stats := api.Group("/stats")
		{
			stats.GET("/fires/by-district", handlers.GetFiresByDistrict)
			stats.GET("/fires/by-year", handlers.GetFiresByYear)
			stats.GET("/fires/by-cause-group", handlers.GetFiresByCauseGroup)
			stats.GET("/fires/by-month", handlers.GetFiresByMonth)
		}

		meta := api.Group("/meta")
		{
			meta.GET("/cause-groups", handlers.GetCauseGroups)
			meta.GET("/cause-descriptions", handlers.GetCauseDescriptions)
			meta.GET("/alert-sources", handlers.GetAlertSources)
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
