package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"backend/internal/db"
	"backend/internal/models"
)

func GetRainLocations(c *gin.Context) {
	year := c.Query("year")
	city := c.Query("city")

	query := db.DB.Select("year, city, lat, long, precipitation_mm")

	if year != "" {
		query = query.Where("year = ?", year)
	}

	if city != "" {
		query = query.Where("city ILIKE ?", city)
	}

	var rainLocations []models.Rain

	if result := query.Find(&rainLocations); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	type RainLocation struct {
		City          string   `json:"city"`
		Lat           float64  `json:"lat"`
		Long          float64  `json:"long"`
		Precipitation *float64 `json:"precipitation_mm"`
		Year          int      `json:"year"`
	}

	var response []RainLocation
	for _, f := range rainLocations {
		response = append(response, RainLocation{
			City:          f.City,
			Lat:           f.Lat,
			Long:          f.Long,
			Precipitation: f.Precipitation,
			Year:          f.Year,
		})
	}
	c.JSON(http.StatusOK, response)
}
