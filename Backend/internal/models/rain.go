package models

type CityCoord struct {
	Name string
	Lat  float64
	Long float64
}

var CityCoords = []CityCoord{
	{Name: "Viana do Castelo", Lat: 41.6918, Long: -8.8341},
	{Name: "Bragança", Lat: 41.8061, Long: -6.7588},
	{Name: "Porto", Lat: 41.1579, Long: -8.6291},
	{Name: "Castelo Branco", Lat: 39.8228, Long: -7.4914},
	{Name: "Lisboa", Lat: 38.7169, Long: -9.1399},
	{Name: "Beja", Lat: 38.0150, Long: -7.8653},
	{Name: "Faro", Lat: 37.0194, Long: -7.9322},
	{Name: "Funchal", Lat: 32.6669, Long: -16.9241},
	{Name: "Angra do Heroísmo", Lat: 38.6553, Long: -27.2144},
}

type Rain struct {
	ID            uint     `gorm:"primaryKey;autoIncrement;"`
	Year          int      `gorm:"column:year;"`
	City          string   `gorm:"column:city;size:100;"`
	Precipitation *float64 `gorm:"column:precipitation_mm"`
	Lat           float64  `gorm:"column:lat;"`
	Long          float64  `gorm:"column:long;"`
}
