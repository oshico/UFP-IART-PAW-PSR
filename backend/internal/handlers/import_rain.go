package handlers

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"

	"backend/internal/db"
	"backend/internal/models"
)

func ImportRain(c *gin.Context) {
	fileHeader, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File not found. Use 'file' field."})
		return
	}

	task := GlobalTaskStore.CreateTask()
	dst := fmt.Sprintf("/tmp/%s.xlsx", task.ID)
	if err := c.SaveUploadedFile(fileHeader, dst); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	go processRainImport(task.ID, dst)

	c.JSON(http.StatusAccepted, gin.H{"task_id": task.ID})
}

func processRainImport(taskID, filePath string) {
	GlobalTaskStore.UpdateTask(taskID, func(t *ImportTask) {
		t.Status = TaskStatusProcessing
	})

	file, err := os.Open(filePath)
	if err != nil {
		GlobalTaskStore.UpdateTask(taskID, func(t *ImportTask) {
			t.Status = TaskStatusError
			t.ErrorMsg = "Error opening saved file"
		})
		return
	}
	defer file.Close()
	defer os.Remove(filePath)

	xlsx, err := excelize.OpenReader(file)
	if err != nil {
		GlobalTaskStore.UpdateTask(taskID, func(t *ImportTask) {
			t.Status = TaskStatusError
			t.ErrorMsg = "Invalid or corrupted file"
		})
		return
	}
	defer xlsx.Close()

	rows, err := xlsx.GetRows("Quadro")
	if err != nil {
		GlobalTaskStore.UpdateTask(taskID, func(t *ImportTask) {
			t.Status = TaskStatusError
			t.ErrorMsg = "Sheet 'Quadro' not found"
		})
		return
	}

	coordMap := map[string]models.CityCoord{}
	for _, coord := range models.CityCoords {
		coordMap[coord.Name] = coord
	}

	headers := rows[7]
	totalImported := 0
	totalErrors := 0

	for _, row := range rows[8:] {
		if len(row) == 0 || strings.TrimSpace(row[0]) == "" {
			continue
		}

		year, err := strconv.Atoi(strings.TrimSpace(row[0]))
		if err != nil {
			continue
		}

		for i := 1; i < len(headers); i++ {
			city := strings.TrimSpace(headers[i])
			if city == "" {
				continue
			}

			coord, ok := coordMap[city]
			if !ok {
				continue
			}

			var precipitation *float64 // se row null, ent fica NULL
			if i < len(row) {
				v := strings.TrimSpace(row[i])
				v = strings.ReplaceAll(v, ",", "")

				if v != "" && v != "x" && v != "X" && v != "0" {
					val, err := strconv.ParseFloat(v, 64)
					if err == nil {
						precipitation = &val
					}
				}
			}

			entry := models.Rain{
				Year:          year,
				City:          city,
				Precipitation: precipitation,
				Lat:           coord.Lat,
				Long:          coord.Long,
			}

			if result := db.DB.Create(&entry); result.Error != nil {
				GlobalTaskStore.UpdateTask(taskID, func(t *ImportTask) {
					t.Status = TaskStatusError
					t.ErrorMsg = result.Error.Error()
				})
				return
			}
			totalImported++
		}

		GlobalTaskStore.UpdateTask(taskID, func(t *ImportTask) {
			t.Imported = totalImported
			t.Errors = totalErrors
		})
	}

	GlobalTaskStore.UpdateTask(taskID, func(t *ImportTask) {
		t.Status = TaskStatusDone
		t.Imported = totalImported
		t.Errors = totalErrors
	})
}
