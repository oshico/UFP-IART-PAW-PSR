package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"

	"backend/internal/db"
	"backend/internal/models"
)

func GetFireLocations(c *gin.Context) {

	year := c.Query("year")
	month := c.Query("month")
	day := c.Query("day")
	local := c.Query("local")
	startDate := c.Query("startDate")
	endDate := c.Query("endDate")

	query := db.DB.Select("local, lat, long, year, month, day, hour")

	if year != "" {
		query = query.Where("year = ?", year)
	}

	if local != "" {
		query = query.Where("local ILIKE ?", local)
	}

	if month != "" {
		query = query.Where("month = ?", month)
	}

	if day != "" {
		query = query.Where("day = ?", day)
	}

	if startDate != "" && endDate != "" {
		query = query.Where("make_date(year::int, month::int, day::int) BETWEEN ? AND ?", startDate, endDate)
	} else if startDate != "" {
		query = query.Where("make_date(year::int, month::int, day::int) >= ?", startDate)
	} else if endDate != "" {
		query = query.Where("make_date(year::int, month::int, day::int) <= ?", endDate)
	}

	var fireLocations []models.Fire

	if result := query.Find(&fireLocations); result.Error != nil {
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
