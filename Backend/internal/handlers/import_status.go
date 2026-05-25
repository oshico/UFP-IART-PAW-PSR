package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetImportStatus(c *gin.Context) {
	taskID := c.Param("taskID")

	task, ok := GlobalTaskStore.GetTask(taskID)
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	c.JSON(http.StatusOK, task)
}
