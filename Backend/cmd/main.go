package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"backend/internal/db"
	"backend/internal/routes"
)

func getAllowedOrigins() []string {
	if origins := os.Getenv("CORS_ALLOWED_ORIGINS"); origins != "" {
		return strings.Split(origins, ",")
	}
	return []string{
		"http://localhost:5173",
		"http://localhost:4173",
	}
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	db.Connect()

	// 2. Inicia o router
	router := gin.Default()

	// 3. CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     getAllowedOrigins(),
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// 4. Rota de healthcheck (mantém o teu ping)
	router.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong"})
	})

	// 5. Regista todas as rotas
	routes.SetupRoutes(router)

	// 6. Arranca o servidor
	router.Run() // por defeito :8080
}
