package main

import (
"context"
"fmt"
"log"
"github.com/jmoiron/sqlx"
_ "github.com/lib/pq"
"backend/app/models"
)

func main() {
dsn := "host=localhost user=postgres password=xiZjhF54vDsdAX0p dbname=reksolindo_semar port=5432 sslmode=disable TimeZone=Asia/Shanghai search_path=public"
db, err := sqlx.Connect("postgres", dsn)
if err != nil {
log.Fatalf("Err: %v\n", err)
}

var users []models.User
err = db.SelectContext(context.Background(), &users, "SELECT id, username, email, is_superuser FROM users WHERE username = 'admin' OR email = 'admin'")
if err != nil {
log.Fatalf("Err: %v\n", err)
}

fmt.Printf("Found %d users\n", len(users))
for _, u := range users {
fmt.Printf("User: ID=%d, Username=%s, IsSuper=%v\n", u.ID, u.Username, u.IsSuperuser)
}
}
