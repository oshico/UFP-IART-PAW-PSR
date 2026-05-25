package handlers

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"

	"backend/internal/db"
	"backend/internal/models"
)

const batchSize = 500

var (
	groupCauseCache       = map[string]uint{}
	descriptionCauseCache = map[string]uint{}
	alertSourceCache      = map[string]uint{}
)

func getOrCreateCauseGroup(description string) *uint {
	if description == "" {
		return nil
	}

	if id, exists := groupCauseCache[description]; exists {
		return &id
	}

	var record models.CauseGroup
	db.DB.Where(models.CauseGroup{Description: description}).FirstOrCreate(&record)
	groupCauseCache[description] = record.ID
	return &record.ID
}

func getOrCreateCauseDescription(description string) *uint {
	if description == "" {
		return nil
	}

	if id, exists := descriptionCauseCache[description]; exists {
		return &id
	}

	var record models.CauseDescription
	db.DB.Where(models.CauseDescription{Description: description}).FirstOrCreate(&record)
	descriptionCauseCache[description] = record.ID
	return &record.ID
}

func getOrCreateAlertSource(description string) *uint {
	if description == "" {
		return nil
	}

	if id, exists := alertSourceCache[description]; exists {
		return &id
	}

	var record models.AlertSource
	db.DB.Where(models.AlertSource{Description: description}).FirstOrCreate(&record)
	alertSourceCache[description] = record.ID
	return &record.ID
}

func ImportFire(c *gin.Context) {
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

	go processFireImport(task.ID, dst)

	c.JSON(http.StatusAccepted, gin.H{"task_id": task.ID})
}

func processFireImport(taskID, filePath string) {
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

	sheets := []string{
		"SGIF_2001_2010",
		"SGIF_2011_2020",
		"SGIF_2021_2025",
	}

	var sheetName string
	for _, s := range sheets {
		if _, err := xlsx.GetRows(s); err == nil {
			sheetName = s
			break
		}
	}

	if sheetName == "" {
		GlobalTaskStore.UpdateTask(taskID, func(t *ImportTask) {
			t.Status = TaskStatusError
			t.ErrorMsg = "No valid sheet found. Expected SGIF_2001_2010, SGIF_2011_2020 or SGIF_2021_2025"
		})
		return
	}

	rows, err := xlsx.GetRows(sheetName)
	if err != nil {
		GlobalTaskStore.UpdateTask(taskID, func(t *ImportTask) {
			t.Status = TaskStatusError
			t.ErrorMsg = "Error reading sheet"
		})
		return
	}

	if len(rows) < 2 {
		GlobalTaskStore.UpdateTask(taskID, func(t *ImportTask) {
			t.Status = TaskStatusError
			t.ErrorMsg = "File contains no data"
		})
		return
	}

	groupCauseCache = map[string]uint{}
	descriptionCauseCache = map[string]uint{}
	alertSourceCache = map[string]uint{}

	var batch []models.Fire
	totalImported := 0
	totalErrors := 0

	for _, row := range rows[1:] {
		fire, ok := parseRow(row)
		if !ok {
			totalErrors++
			continue
		}

		batch = append(batch, fire)

		if len(batch) >= batchSize {
			if result := db.DB.Create(&batch); result.Error != nil {
				GlobalTaskStore.UpdateTask(taskID, func(t *ImportTask) {
					t.Status = TaskStatusError
					t.ErrorMsg = result.Error.Error()
				})
				return
			}
			totalImported += len(batch)
			batch = batch[:0]

			GlobalTaskStore.UpdateTask(taskID, func(t *ImportTask) {
				t.Imported = totalImported
				t.Errors = totalErrors
			})
		}
	}

	if len(batch) > 0 {
		if result := db.DB.Create(&batch); result.Error != nil {
			GlobalTaskStore.UpdateTask(taskID, func(t *ImportTask) {
				t.Status = TaskStatusError
				t.ErrorMsg = result.Error.Error()
			})
			return
		}
		totalImported += len(batch)
	}

	GlobalTaskStore.UpdateTask(taskID, func(t *ImportTask) {
		t.Status = TaskStatusDone
		t.Imported = totalImported
		t.Errors = totalErrors
	})
}

func parseRow(row []string) (models.Fire, bool) {
	if len(row) < 41 {
		return models.Fire{}, false
	}

	get := func(i int) string {
		if i < len(row) {
			return row[i]
		}
		return ""
	}

	toInt := func(s string) int {
		v, _ := strconv.Atoi(s)
		return v
	}

	toFloat := func(s string) float64 {
		v, _ := strconv.ParseFloat(s, 64)
		return v
	}

	toTime := func(s string) *time.Time {
		if s == "" {
			return nil
		}
		formats := []string{
			"2006-01-02 15:04:05",
			"2006-01-02T15:04:05",
			"02-01-2006 15:04",
			"02/01/2006 15:04",
			"2006-01-02",
			"02-01-2006",
			"02/01/2006",
		}

		for _, f := range formats {
			if t, err := time.Parse(f, s); err == nil {
				return &t
			}
		}
		return nil
	}

	Fire := models.Fire{
		Year:  toInt(get(2)),
		Month: toInt(get(3)),
		Day:   toInt(get(4)),
		Hour:  toInt(get(5)),

		DateHourAlert:             toTime(get(11)),
		DateHourFirstIntervention: toTime(get(12)),
		DateHourExtinguish:        toTime(get(13)),
		DurationHours:             toFloat(get(14)),

		District: get(17),
		County:   get(18),
		Parish:   get(19),
		Local:    get(20),

		Lat:  toFloat(get(25)),
		Long: toFloat(get(26)),

		CauseType:          get(36),
		CauseGroupID:       getOrCreateCauseGroup(get(37)),
		CauseDescriptionID: getOrCreateCauseDescription(get(39)),
		AlertSourceID:      getOrCreateAlertSource(get(40)),
	}

	return Fire, true
}
