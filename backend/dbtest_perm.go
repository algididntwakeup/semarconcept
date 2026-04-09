package main

import (
"context"
"fmt"
"log"
"github.com/jmoiron/sqlx"
_ "github.com/lib/pq"
)

func main() {
dsn := "host=localhost user=postgres password=xiZjhF54vDsdAX0p dbname=reksolindo_semar port=5432 sslmode=disable TimeZone=Asia/Shanghai search_path=public"
db, err := sqlx.Connect("postgres", dsn)
if err != nil {
log.Fatalf("Err: %v\n", err)
}

// Make sure menu:view exists in permissions
query := SELECT id, name FROM permissions WHERE resource = 'menu' AND action = 'view'
var permID int
var permName string
err = db.QueryRow(query).Scan(&permID, &permName)
if err != nil {
log.Printf("No menu:view permission found: %v", err)
// insert it
err = db.QueryRow(INSERT INTO permissions (name, resource, action, scope, description) VALUES ('Read Menus', 'menu', 'view', 'tenant', 'Read menus') RETURNING id).Scan(&permID)
if err != nil {
log.Fatalf("Err inserting perm: %v", err)
}
}
fmt.Printf("Perm ID: %d\n", permID)

// Assign to all roles
_, err = db.Exec(
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id,  FROM roles r
ON CONFLICT DO NOTHING
, permID)
if err != nil {
log.Fatalf("Err assigning perm: %v", err)
}
fmt.Println("Assigned menu:view to all roles!")
}
