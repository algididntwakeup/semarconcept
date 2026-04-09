package modules

import "github.com/gin-gonic/gin"

// Module defines the interface for an application module.
// Each module (e.g., auth, users, content) can register its routes
// and perform other setup tasks.
type Module interface {
	// Name returns the name of the module.
	Name() string

	// RegisterRoutes registers the module's API routes with the Gin router group.
	// It takes a *gin.RouterGroup to allow modules to be mounted under a common prefix (e.g., /api/v1).
	// Dependencies like database connections, services, etc., would typically be passed
	// to the module's constructor or an Init method.
	RegisterRoutes(routerGroup *gin.RouterGroup)

	// Init performs any initialization tasks for the module.
	// This could include setting up services, connecting to message queues, etc.
	// It's called once during application startup.
	// Dependencies can be passed here as well.
	// Init() error // Uncomment if initialization logic is needed per module
}

// ModuleManager holds a list of registered modules.
type ModuleManager struct {
	modules []Module
}

// NewModuleManager creates a new ModuleManager.
func NewModuleManager() *ModuleManager {
	return &ModuleManager{
		modules: []Module{},
	}
}

// RegisterModule adds a module to the manager.
func (mm *ModuleManager) RegisterModule(module Module) {
	mm.modules = append(mm.modules, module)
}

// RegisterAllRoutes iterates through all registered modules and calls their RegisterRoutes method.
func (mm *ModuleManager) RegisterAllRoutes(routerGroup *gin.RouterGroup) {
	for _, module := range mm.modules {
		// Create a new group for each module under the main routerGroup
		// This helps in organizing routes, e.g., /api/v1/users/*, /api/v1/content/*
		// moduleRouter := routerGroup.Group("/" + strings.ToLower(module.Name()))
		// module.RegisterRoutes(moduleRouter)
		// For now, let modules register directly on the passed routerGroup
		module.RegisterRoutes(routerGroup)
	}
}

/*
// InitAllModules iterates through all registered modules and calls their Init method.
func (mm *ModuleManager) InitAllModules() error {
	for _, module := range mm.modules {
		if mWithInit, ok := module.(interface{ Init() error }); ok {
			if err := mWithInit.Init(); err != nil {
				return fmt.Errorf("failed to initialize module %s: %w", module.Name(), err)
			}
		}
	}
	return nil
}
*/
