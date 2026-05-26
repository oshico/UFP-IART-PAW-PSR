package handlers

import (
	"backend/internal/db"
	"backend/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetCauseGroups(c *gin.Context) {
	var results []models.CauseGroup
	db.DB.Find(&results)
	c.JSON(http.StatusOK, results)
}

func GetCauseDescriptions(c *gin.Context) {
	var results []models.CauseDescription
	db.DB.Find(&results)
	c.JSON(http.StatusOK, results)
}

func GetAlertSources(c *gin.Context) {
	var results []models.AlertSource
	db.DB.Find(&results)
	c.JSON(http.StatusOK, results)
}
