package models

import "time"

type RefreshToken struct {
	ID        uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    uint       `gorm:"column:user_id;not null;index" json:"user_id"`
	TokenHash string     `gorm:"column:token_hash;size:64;not null;uniqueIndex" json:"-"`
	ExpiresAt time.Time  `gorm:"column:expires_at;not null" json:"expires_at"`
	RevokedAt *time.Time `gorm:"column:revoked_at;default:null" json:"revoked_at,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
	User      User       `gorm:"foreignKey:UserID" json:"-"`
}
