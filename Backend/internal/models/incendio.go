package models

import "time"

// Incendio representa um registo de incêndio do dataset SGIF 2021-2025
type Incendio struct {
	ID uint `gorm:"primaryKey;autoIncrement"`

	// Identificação
	CodigoSGIF  string `gorm:"column:codigo_sgif;size:20"`
	CodigoANEPC int64  `gorm:"column:codigo_anepc"`

	// Temporal
	Ano  int `gorm:"column:ano"`
	Mes  int `gorm:"column:mes"`
	Dia  int `gorm:"column:dia"`
	Hora int `gorm:"column:hora"`

	// Áreas (em hectares)
	AreaPovHa   float64 `gorm:"column:area_pov_ha"`
	AreaMatoHa  float64 `gorm:"column:area_mato_ha"`
	AreaAgricHa float64 `gorm:"column:area_agric_ha"`
	AreaTotalHa float64 `gorm:"column:area_total_ha"`
	ClasseArea  string  `gorm:"column:classe_area;size:50"`

	// Datas e horas de ocorrência
	DataHoraAlerta              *time.Time `gorm:"column:data_hora_alerta"`
	DataHoraPrimeiraIntervencao *time.Time `gorm:"column:data_hora_primeira_intervencao"`
	DataHoraExtincao            *time.Time `gorm:"column:data_hora_extincao"`
	DuracaoHoras                float64    `gorm:"column:duracao_horas"`
	IncSup24Horas               int        `gorm:"column:inc_sup_24horas"`

	// Localização administrativa
	DTCCFR   int    `gorm:"column:dtccfr"`
	Distrito  string `gorm:"column:distrito;size:100"`
	Concelho  string `gorm:"column:concelho;size:100"`
	Freguesia string `gorm:"column:freguesia;size:100"`
	Local     string `gorm:"column:local;size:255"`

	// Áreas protegidas
	RNAP  *string `gorm:"column:rnap;size:100"`
	RNMPF *string `gorm:"column:rnmpf;size:100"`

	// Coordenadas militares
	XMilitar int `gorm:"column:x_militar"`
	YMilitar int `gorm:"column:y_militar"`

	// Coordenadas geográficas
	Latitude  float64 `gorm:"column:latitude"`
	Longitude float64 `gorm:"column:longitude"`
	XETRS89   float64 `gorm:"column:x_etrs89"`
	YETRS89   float64 `gorm:"column:y_etrs89"`

	// Índices meteorológicos (FWI - Fire Weather Index)
	DSR  float64 `gorm:"column:dsr"`
	FWI  float64 `gorm:"column:fwi"`
	ISI  float64 `gorm:"column:isi"`
	DC   float64 `gorm:"column:dc"`
	DMC  float64 `gorm:"column:dmc"`
	FFMC float64 `gorm:"column:ffmc"`
	BUI  float64 `gorm:"column:bui"`

	// Causa
	CodCausa      int    `gorm:"column:cod_causa"`
	TipoCausa     string `gorm:"column:tipo_causa;size:100"`
	GrupoCausa    string `gorm:"column:grupo_causa;size:150"`
	DescricaoCausa string `gorm:"column:descricao_causa;size:255"`
	FonteAlerta   string `gorm:"column:fonte_alerta;size:100"`
}