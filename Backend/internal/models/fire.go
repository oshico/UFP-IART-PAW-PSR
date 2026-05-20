package models

import "time"

type CauseGroup struct {
	ID          uint   `gorm:"primaryKey;autoIncrement"`
	Description string `gorm:"column:description;size:200; uniqueIndex"`
}

type CauseDescription struct {
	ID          uint   `gorm:"primaryKey;autoIncrement"`
	Description string `gorm:"column:description; size:200; uniqueIndex"`
}

type AlertSource struct {
	ID          uint   `gorm:"primaryKey; autoIncrement"`
	Description string `gorm:"column:description; size:200; uniqueIndex"`
}

// type CauseType struct {
// 	ID          uint   `gorm:"primaryKey;autoIncrement; not null"`
// 	Description string `gorm:"column:description; size:200; not null; uniqueIndex"`
// }

// Fire é os registos dos XLSX: SGIF 2021-2025
type Fire struct {
	ID uint `gorm:"primaryKey;autoIncrement; not null"`

	Year  int `gorm:"column:year"`
	Month int `gorm:"column:month"`
	Day   int `gorm:"column:day"`
	Hour  int `gorm:"column:hour"`

	// Data e hora das ocorrências
	DateHourAlert             *time.Time `gorm:"column:date_hour_alert"`
	DateHourFirstIntervention *time.Time `gorm:"column:date_hour_first_intervention"`
	DateHourExtinguish        *time.Time `gorm:"column:date_hour_extinguish"`
	DurationHours             float64    `gorm:"column:duration_hours"`

	// Local
	District string `gorm:"column:district;size:100;"`
	County   string `gorm:"column:county;size:100;"`
	Parish   string `gorm:"column:parish;size:100;"`
	Local    string `gorm:"column:local;size:200;"`

	// Coordenadas
	Lat  float64 `gorm:"column:lat;"`
	Long float64 `gorm:"column:long;"`

	// Causa
	CauseType          string `gorm:"column:id_grupo_causa; size:100"`
	CauseGroupID       *uint  `gorm:"column:cause_group_id;"`
	CauseDescriptionID *uint  `gorm:"column:description_cause_id;"`
	AlertSourceID      *uint  `gorm:"column:alert_source_id;"`

	// relações
	CauseGroup       *CauseGroup       `gorm:"foreignKey:CauseGroupID;"`
	CauseDescription *CauseDescription `gorm:"foreignKey:CauseDescriptionID;"`
	AlertSource      *AlertSource      `gorm:"foreignKey:AlertSourceID;"`
}
