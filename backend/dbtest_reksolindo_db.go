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
dsn := "host=localhost user=postgres password=postgres dbname=reksolindo_db port=5432 sslmode=disable TimeZone=Asia/Shanghai search_path=public"
db, err := sqlx.Connect("postgres", dsn)
if err != nil {
log.Fatalf("Err: %v\n", err)
}

var u models.User
err = db.GetContext(context.Background(), &u, "SELECT id, username, is_superuser FROM users WHERE username = 'admin'")
if err != nil {
log.Fatalf("Err GetUser: %v\n", err)
} else {
fmt.Printf("Admin in reksolindo_db: IsSuperuser=%v\n", u.IsSuperuser)
}
}
