package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	// "github.com/joho/godotenv" // ir buscar info ao .env

	"backend/internal/db"
	"backend/internal/routes"
)

func main() {
    // 1. Liga à base de dados e cria a tabela
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