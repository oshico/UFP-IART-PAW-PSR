package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"

	"backend/internal/db"
	"backend/internal/models"
)

const batchSize = 500 // insere 500 registos de cada vez

func ImportIncendios(c *gin.Context) {
	// 1. Recebe o ficheiro sem guardar em disco
	fileHeader, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ficheiro não encontrado no request. Usa o campo 'file'."})
		return
	}

	// 2. Abre o ficheiro em memória (sem guardar)
	file, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao abrir ficheiro"})
		return
	}
	defer file.Close()

	// 3. Parse do XLSX diretamente do reader
	xlsx, err := excelize.OpenReader(file)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ficheiro inválido ou corrompido"})
		return
	}
	defer xlsx.Close()

	rows, err := xlsx.GetRows("SGIF_2021_2025")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Sheet 'SGIF_2021_2025' não encontrada"})
		return
	}

	if len(rows) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ficheiro sem dados"})
		return
	}

	// 4. Processa linha a linha (ignora header — linha 0)
	var batch []models.Incendio
	totalImportados := 0
	totalErros := 0

	for i, row := range rows[1:] {
		if len(row) < 41 {
			totalErros++
			continue // linha incompleta
		}

		incendio, err := parseRow(row)
		if err != nil {
			fmt.Printf("Erro na linha %d: %v\n", i+2, err)
			totalErros++
			continue
		}

		batch = append(batch, incendio)

		// Insere em batch para melhor performance
		if len(batch) >= batchSize {
			if result := db.DB.Create(&batch); result.Error != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
				return
			}
			totalImportados += len(batch)
			batch = batch[:0] // reset sem reallocate
		}
	}

	// Insere o restante
	if len(batch) > 0 {
		if result := db.DB.Create(&batch); result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}
		totalImportados += len(batch)
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   "Import concluído",
		"importados": totalImportados,
		"erros":     totalErros,
	})
}

// parseRow converte uma linha do XLSX numa struct Incendio
func parseRow(row []string) (models.Incendio, error) {
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

	toInt64 := func(s string) int64 {
		v, _ := strconv.ParseInt(s, 10, 64)
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
		// Tenta vários formatos comuns
		formats := []string{
			"2006-01-02 15:04:05",
			"2006-01-02T15:04:05",
			"02-01-2006 15:04",
			"02/01/2006 15:04",
		}
		for _, f := range formats {
			if t, err := time.Parse(f, s); err == nil {
				return &t
			}
		}
		return nil
	}

	toNullableString := func(s string) *string {
		if s == "" {
			return nil
		}
		return &s
	}

	incendio := models.Incendio{
		CodigoSGIF:                  get(0),
		CodigoANEPC:                 toInt64(get(1)),
		Ano:                         toInt(get(2)),
		Mes:                         toInt(get(3)),
		Dia:                         toInt(get(4)),
		Hora:                        toInt(get(5)),
		AreaPovHa:                   toFloat(get(6)),
		AreaMatoHa:                  toFloat(get(7)),
		AreaAgricHa:                 toFloat(get(8)),
		AreaTotalHa:                 toFloat(get(9)),
		ClasseArea:                  get(10),
		DataHoraAlerta:              toTime(get(11)),
		DataHoraPrimeiraIntervencao: toTime(get(12)),
		DataHoraExtincao:            toTime(get(13)),
		DuracaoHoras:                toFloat(get(14)),
		IncSup24Horas:               toInt(get(15)),
		DTCCFR:                      toInt(get(16)),
		Distrito:                    get(17),
		Concelho:                    get(18),
		Freguesia:                   get(19),
		Local:                       get(20),
		RNAP:                        toNullableString(get(21)),
		RNMPF:                       toNullableString(get(22)),
		XMilitar:                    toInt(get(23)),
		YMilitar:                    toInt(get(24)),
		Latitude:                    toFloat(get(25)),
		Longitude:                   toFloat(get(26)),
		XETRS89:                     toFloat(get(27)),
		YETRS89:                     toFloat(get(28)),
		DSR:                         toFloat(get(29)),
		FWI:                         toFloat(get(30)),
		ISI:                         toFloat(get(31)),
		DC:                          toFloat(get(32)),
		DMC:                         toFloat(get(33)),
		FFMC:                        toFloat(get(34)),
		BUI:                         toFloat(get(35)),
		CodCausa:                    toInt(get(36)),
		TipoCausa:                   get(37),
		GrupoCausa:                  get(38),
		DescricaoCausa:              get(39),
		FonteAlerta:                 get(40),
	}

	return incendio, nil
}