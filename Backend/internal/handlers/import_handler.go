package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"

	"backend/internal/db"
	"backend/internal/models"
)

const batchSize = 500 // insere 500 registos de cada vez

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
	// limpar a cache
	groupCauseCache = map[string]uint{}
	descriptionCauseCache = map[string]uint{}
	alertSourceCache = map[string]uint{}

	fileHeader, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File not found. Use 'file' field."})
		return
	}

	// Abre o ficheiro em memória (sempre sem o guardar)
	file, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error opening file"})
		return
	}
	defer file.Close()

	// Parse do XLSX direto do 'reader'
	xlsx, err := excelize.OpenReader(file)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or corrupted file"})
	}
	defer xlsx.Close()

	rows, err := xlsx.GetRows("SGIF_2021_2025")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Sheet 'SGIF_2021_2025' not found"})
		return
	}

	if len(rows) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File contains no data"})
		return
	}

	// Processa linha a linha, ignora 'header' q é a linha 0
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

		// Insere em batch para melhor performance
		if len(batch) >= batchSize {
			if result := db.DB.Create(&batch); result.Error != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
				return
			}
			totalImported += len(batch)
			batch = batch[:0]
		}
	}

	// Insere o restante
	if len(batch) > 0 {
		if result := db.DB.Create(&batch); result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}
		totalImported += len(batch)
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Import completed",
		"imported": totalImported,
		"errors":   totalErrors,
	})
}

// parseRow converte uma linha do XLSX numa struct Fire
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

	// toInt64 := func(s string) int64 {
	// 	v, _ := strconv.ParseInt(s, 10, 64)
	// 	return v
	// }

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

	// toUintOrZero := func(s string) uint {
	// 	v, err := strconv.Atoi(s)
	// 	if err != nil {
	// 		return 0
	// 	}
	// 	return uint(v)
	// }

	// toNullableString := func(s string) *string {
	// 	if s == "" {
	// 		return nil
	// 	}
	// 	return &s
	// }

	Fire := models.Fire{
		Year:  toInt(get(1)),
		Month: toInt(get(2)),
		Day:   toInt(get(3)),
		Hour:  toInt(get(4)),

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
