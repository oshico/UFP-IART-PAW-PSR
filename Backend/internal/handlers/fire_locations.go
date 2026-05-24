package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"

	"backend/internal/db"
	"backend/internal/models"
)

func GetFireLocations(c *gin.Context) {
	var fireLocations []models.Fire

	if result := db.DB.Select("local, lat, long, year, month, day, hour").Find(&fireLocations); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	type FireLocation struct {
		Local string  `json:"local"`
		Lat   float64 `json:"lat"`
		Long  float64 `json:"long"`
		Date  string  `json:"date"`
		Hour  int     `json:"hour"`
	}

	var response []FireLocation

	for _, f := range fireLocations {
		date := ""
		if f.Year != 0 && f.Month != 0 && f.Day != 0 {
			date = fmt.Sprintf("%04d-%02d-%02d", f.Year, f.Month, f.Day)
		}
		response = append(response, FireLocation{
			Local: f.Local,
			Lat:   f.Lat,
			Long:  f.Long,
			Date:  date,
			Hour:  f.Hour,
		})
	}
	c.JSON(http.StatusOK, response)
}
