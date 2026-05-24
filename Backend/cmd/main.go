package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"backend/internal/db"
	"backend/internal/routes"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	db.Connect()

	// 2. Inicia o router
	router := gin.Default()

	// 3. Rota de healthcheck (mantém o teu ping)
	router.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong"})
	})

	// 4. Regista todas as rotas
	routes.SetupRoutes(router)

	// 5. Arranca o servidor
	router.Run() // por defeito :8080
}
