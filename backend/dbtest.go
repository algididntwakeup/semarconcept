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
log.Fatal(err)
}

query := SELECT id, title, parent_id FROM menu_items
var menus []models.Menu
err = db.SelectContext(context.Background(), &menus, query)
if err != nil {
log.Fatal(err)
}

fmt.Printf("Total menus: %d\n", len(menus))
if len(menus) > 0 {
fmt.Printf("First menu: %s, parent: %v\n", menus[0].Title, menus[0].ParentID)
}
}
