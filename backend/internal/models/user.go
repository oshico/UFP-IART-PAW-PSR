package models

import "time"

type User struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Email     string    `gorm:"column:email;size:255;uniqueIndex;not null" json:"email"`
	Password  string    `gorm:"column:password;size:255;not null" json:"-"`
	Name      string    `gorm:"column:name;size:200;not null" json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
