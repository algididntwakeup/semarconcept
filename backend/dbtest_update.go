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

_, err = db.Exec("UPDATE users SET is_superuser = true WHERE username = 'admin'")
if err != nil {
log.Fatalf("UPDATE err: %v\n", err)
}

fmt.Println("UPDATED admin user to superuser!")

var u models.User
err = db.GetContext(context.Background(), &u, "SELECT id, is_superuser, username FROM users WHERE username = 'admin'")
if err != nil {
log.Fatalf("Err GetUser: %v\n", err)
} else {
fmt.Printf("Admin Check: IsSuperuser=%v, ID=%d\n", u.IsSuperuser, u.ID)
}
}
