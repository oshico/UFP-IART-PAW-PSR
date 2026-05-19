package models

import "time"

type CauseGroup struct {
	ID          uint   `gorm:"primaryKey;autoIncrement; not null"`
	Description string `gorm:"column:description;size:200; not null; uniqueIndex"`
}

type CauseDescription struct {
	ID          uint   `gorm:"primaryKey;autoIncrement; not null"`
	Description string `gorm:"column:description; size:200; not null; uniqueIndex"`
}

type AlertSource struct {
	ID          uint   `gorm:"primaryKey; autoIncrement; not null"`
	Description string `gorm:"column:decription; size:200; not null; uniqueIndex"`
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
	District string `gorm:"column:district;size:100; not null"`
	County   string `gorm:"column:county;size:100; not null"`
	Parish   string `gorm:"column:parish;size:100; not null"`
	Local    string `gorm:"column:local;size:200; not null"`

	// Coordenadas
	Lat  float64 `gorm:"column:lat; not null"`
	Long float64 `gorm:"column:long; not null"`

	// Causa
	CauseType          string `gorm:"column:id_grupo_causa; size:100"`
	CauseGroupID       *uint  `gorm:"column:cause_group_id; not null"`
	CauseDescriptionID *uint  `gorm:"column:description_cause_id; not null"`
	AlertSourceID      *uint  `gorm:"column:alert_source_id; not null"`

	// relações
	CauseGroup       *CauseGroup       `gorm:"foreignKey:CauseGroupID; not null"`
	CauseDescription *CauseDescription `gorm:"foreignKey:CauseDescriptionID; not null"`
	AlertSource      *AlertSource      `gorm:"foreignKey:AlertSourceID; not null"`
}
