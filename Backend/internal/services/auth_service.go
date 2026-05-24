package services

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"os"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"backend/internal/db"
	"backend/internal/models"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrEmailAlreadyExists = errors.New("email already exists")
	ErrInvalidToken       = errors.New("invalid or expired token")
	ErrUserNotFound       = errors.New("user not found")
)

type Claims struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

func getJWTSecret() string {
	if s := os.Getenv("JWT_SECRET"); s != "" {
		return s
	}
	return "default-secret-change-me-in-production"
}

func getAccessExpiry() time.Duration {
	if s := os.Getenv("JWT_ACCESS_EXPIRY"); s != "" {
		d, err := time.ParseDuration(s)
		if err == nil {
			return d
		}
	}
	return 15 * time.Minute
}

func getRefreshExpiry() time.Duration {
	if s := os.Getenv("JWT_REFRESH_EXPIRY"); s != "" {
		d, err := time.ParseDuration(s)
		if err == nil {
			return d
		}
	}
	return 720 * time.Hour
}

func hashToken(token string) string {
	h := sha256.Sum256([]byte(token))
	return hex.EncodeToString(h[:])
}

func RegisterUser(email, password, name string) (*models.User, error) {
	var existing models.User
	if err := db.DB.Where("email = ?", email).First(&existing).Error; err == nil {
		return nil, ErrEmailAlreadyExists
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Email:    email,
		Password: string(hashedPassword),
		Name:     name,
	}
	if err := db.DB.Create(user).Error; err != nil {
		return nil, err
	}
	return user, nil
}

func AuthenticateUser(email, password string) (*models.User, error) {
	var user models.User
	if err := db.DB.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, ErrInvalidCredentials
	}
	return &user, nil
}

func GetUserByID(id uint) (*models.User, error) {
	var user models.User
	if err := db.DB.First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &user, nil
}

func GenerateAccessToken(user *models.User) (string, error) {
	claims := &Claims{
		UserID: user.ID,
		Email:  user.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(getAccessExpiry())),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   strconv.FormatUint(uint64(user.ID), 10),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(getJWTSecret()))
}

func GenerateRefreshToken(user *models.User) (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	tokenStr := hex.EncodeToString(bytes)

	rt := &models.RefreshToken{
		UserID:    user.ID,
		TokenHash: hashToken(tokenStr),
		ExpiresAt: time.Now().Add(getRefreshExpiry()),
	}
	if err := db.DB.Create(rt).Error; err != nil {
		return "", err
	}
	return tokenStr, nil
}

func ValidateAccessToken(tokenStr string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
		return []byte(getJWTSecret()), nil
	})
	if err != nil || !token.Valid {
		return nil, ErrInvalidToken
	}
	return claims, nil
}

func ValidateRefreshToken(tokenStr string) (*models.User, error) {
	hash := hashToken(tokenStr)
	var rt models.RefreshToken
	if err := db.DB.Where("token_hash = ? AND expires_at > ? AND revoked_at IS NULL", hash, time.Now()).First(&rt).Error; err != nil {
		return nil, ErrInvalidToken
	}

	db.DB.Delete(&rt)

	var user models.User
	if err := db.DB.First(&user, rt.UserID).Error; err != nil {
		return nil, ErrInvalidToken
	}
	return &user, nil
}

func RevokeRefreshToken(tokenStr string) error {
	hash := hashToken(tokenStr)
	result := db.DB.Model(&models.RefreshToken{}).
		Where("token_hash = ? AND expires_at > ? AND revoked_at IS NULL", hash, time.Now()).
		Update("revoked_at", time.Now())
	if result.RowsAffected == 0 {
		return ErrInvalidToken
	}
	return result.Error
}
