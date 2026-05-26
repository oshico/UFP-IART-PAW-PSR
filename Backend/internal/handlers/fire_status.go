package handlers

import (
	"net/http"

	"backend/internal/db"

	"github.com/gin-gonic/gin"
)

type CountByLabel struct {
	Label string `json:"label"`
	Count int64  `json:"count"`
}

func GetFiresByDistrict(c *gin.Context) {
	year := c.Query("year")
	causeGroup := c.Query("causeGroup")
	causeDesc := c.Query("causeDescription")
	alertSource := c.Query("alertSource")

	query := db.DB.Table("fires").
		Select("district as label, COUNT(*) as count").
		Group("district").
		Order("count DESC")

	if year != "" {
		query = query.Where("year = ?", year)
	}

	if causeGroup != "" {
		query = query.Where("cause_group_id = ?", causeGroup)
	}

	if causeDesc != "" {
		query = query.Where("description_cause_id = ?", causeDesc)
	}

	if alertSource != "" {
		query = query.Where("alert_source_id = ?", alertSource)
	}

	var results []CountByLabel
	if err := query.Scan(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, results)
}

func GetFiresByYear(c *gin.Context) {
	var results []CountByLabel
	err := db.DB.Model(&struct{}{}).
		Table("fires").
		Select("CAST(year AS TEXT) as label, COUNT(*) as count").
		Group("year").
		Order("year ASC").
		Scan(&results).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, results)
}

func GetFiresByCauseGroup(c *gin.Context) {
	var results []CountByLabel
	err := db.DB.Model(&struct{}{}).
		Table("fires f").
		Select("cg.description as label, COUNT(*) as count").
		Joins("LEFT JOIN cause_groups cg ON cg.id = f.cause_group_id").
		Group("cg.description").
		Order("count DESC").
		Scan(&results).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, results)
}

func GetFiresByMonth(c *gin.Context) {
	year := c.Query("year")

	query := db.DB.Model(&struct{}{}).
		Table("fires").
		Select("CAST(month AS TEXT) as label, COUNT(*) as count").
		Group("month").
		Order("month ASC")

	if year != "" {
		query = query.Where("year = ?", year)
	}

	var results []CountByLabel
	if err := query.Scan(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, results)
}
