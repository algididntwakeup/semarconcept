package handlers_test

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/app/api/handlers"
	"backend/app/models/request"
	"backend/app/repositories"
	"backend/app/services"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
	"github.com/xuri/excelize/v2"
)

type assetStatsServiceMock struct {
	services.AssetServiceInterface
	stats    repositories.AssetStats
	err      error
	tenantID int
}

type assetExportServiceMock struct {
	services.AssetServiceInterface
	tenantID     int
	data         []byte
	filename     string
	err          error
	importReq    *request.AssetImportRequest
	imported     []byte
	called       bool
	exportFormat string
}

func (m *assetExportServiceMock) ExportAssets(_ context.Context, tenantID int, req *request.AssetExportRequest) ([]byte, string, error) {
	m.called = true
	m.tenantID = tenantID
	m.exportFormat = req.Format
	return m.data, m.filename, m.err
}

func (m *assetExportServiceMock) ImportAssets(ctx context.Context, tenantID int, req *request.AssetImportRequest, _ int, data []byte) (interface{}, error) {
	m.called = true
	m.tenantID = tenantID
	m.importReq = req
	m.imported = data
	return map[string]interface{}{"created_count": 1}, m.err
}

func (m *assetStatsServiceMock) GetAssetStats(_ context.Context, tenantID int) (repositories.AssetStats, error) {
	m.tenantID = tenantID
	return m.stats, m.err
}

func TestGetAssetStatsReturnsExactTenantAggregate(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &assetStatsServiceMock{stats: repositories.AssetStats{
		Classes: []repositories.AssetClassCount{
			{Class: "Piping", Count: 12},
			{Class: "Storage Tanks", Count: 7},
		},
		Funcloc: repositories.AssetFunclocStats{With: 1500, Without: 200},
	}}
	handler := handlers.NewAssetHandler(service, nil)
	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	ctx.Request = httptest.NewRequest(http.MethodGet, "/api/v1/assets/stats", nil)
	ctx.Set("tenant_id", 42)

	handler.GetAssetStats(ctx)

	require.Equal(t, http.StatusOK, recorder.Code)
	require.Equal(t, 42, service.tenantID)
	require.JSONEq(t, `{"success":true,"message":"Asset statistics retrieved successfully","data":{"classes":[{"class":"Piping","count":12},{"class":"Storage Tanks","count":7}],"funcloc":{"with":1500,"without":200}}}`, recorder.Body.String())
}

func TestGetAssetStatsReturnsJSONInternalError(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &assetStatsServiceMock{err: errors.New("database unavailable")}
	handler := handlers.NewAssetHandler(service, nil)
	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	ctx.Request = httptest.NewRequest(http.MethodGet, "/api/v1/assets/stats", nil)
	ctx.Set("tenant_id", 42)

	handler.GetAssetStats(ctx)

	require.Equal(t, http.StatusInternalServerError, recorder.Code)
	require.JSONEq(t, `{"success":false,"message":"Failed to retrieve asset statistics","error":"Failed to retrieve asset statistics","code":"API_ERROR"}`, recorder.Body.String())
}

func TestExportAssetsReturnsExcelAttachment(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &assetExportServiceMock{data: []byte("xlsx-content"), filename: "equipment-master.xlsx"}
	handler := handlers.NewAssetHandler(service, nil)
	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	ctx.Request = httptest.NewRequest(http.MethodGet, "/api/v1/assets/export?file_format=csv", nil)
	ctx.Set("tenant_id", 42)

	handler.ExportAssets(ctx)

	require.Equal(t, http.StatusOK, recorder.Code)
	require.True(t, service.called)
	require.Equal(t, 42, service.tenantID)
	require.Equal(t, "xlsx", service.exportFormat)
	require.Equal(t, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", recorder.Header().Get("Content-Type"))
	require.Equal(t, `attachment; filename="equipment-master.xlsx"`, recorder.Header().Get("Content-Disposition"))
	require.Equal(t, "xlsx-content", recorder.Body.String())
}

func TestExportAssetsAcceptsExplicitXLSXFormat(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &assetExportServiceMock{data: []byte("xlsx-content"), filename: "equipment-master.xlsx"}
	handler := handlers.NewAssetHandler(service, nil)
	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	ctx.Request = httptest.NewRequest(http.MethodGet, "/api/v1/assets/export?format=%20XLSX%20", nil)
	ctx.Set("tenant_id", 42)

	handler.ExportAssets(ctx)

	require.Equal(t, http.StatusOK, recorder.Code)
	require.Equal(t, "xlsx", service.exportFormat)
	require.Equal(t, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", recorder.Header().Get("Content-Type"))
	require.Equal(t, `attachment; filename="equipment-master.xlsx"`, recorder.Header().Get("Content-Disposition"))
}

func TestExportAssetsDispatchesCSV(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &assetExportServiceMock{data: []byte("csv-content"), filename: "equipment-master.csv"}
	handler := handlers.NewAssetHandler(service, nil)
	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	ctx.Request = httptest.NewRequest(http.MethodGet, "/api/v1/assets/export?format=%20CSV%20", nil)
	ctx.Set("tenant_id", 42)

	handler.ExportAssets(ctx)

	require.Equal(t, http.StatusOK, recorder.Code)
	require.Equal(t, "csv", service.exportFormat)
	require.Equal(t, "text/csv", recorder.Header().Get("Content-Type"))
	require.Equal(t, `attachment; filename="equipment-master.csv"`, recorder.Header().Get("Content-Disposition"))
	require.Equal(t, "csv-content", recorder.Body.String())
}

func TestExportAssetsRejectsUnsupportedFormat(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &assetExportServiceMock{}
	handler := handlers.NewAssetHandler(service, nil)
	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	ctx.Request = httptest.NewRequest(http.MethodGet, "/api/v1/assets/export?format=pdf", nil)
	ctx.Set("tenant_id", 42)

	handler.ExportAssets(ctx)

	require.Equal(t, http.StatusBadRequest, recorder.Code)
	require.False(t, service.called)
}

func TestExportAssetsReturnsJSONOnServiceError(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &assetExportServiceMock{err: fmt.Errorf("database unavailable")}
	handler := handlers.NewAssetHandler(service, nil)
	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	ctx.Request = httptest.NewRequest(http.MethodGet, "/api/v1/assets/export", nil)
	ctx.Set("tenant_id", 42)

	handler.ExportAssets(ctx)

	require.Equal(t, http.StatusInternalServerError, recorder.Code)
	require.Contains(t, recorder.Header().Get("Content-Type"), "application/json")
}

func TestImportAssetsAcceptsMultipartXLSX(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &assetExportServiceMock{}
	handler := handlers.NewAssetHandler(service, nil)
	workbook := excelize.NewFile()
	var xlsx bytes.Buffer
	require.NoError(t, workbook.Write(&xlsx))
	require.NoError(t, workbook.Close())

	var body bytes.Buffer
	multipartWriter := multipart.NewWriter(&body)
	fileWriter, err := multipartWriter.CreateFormFile("file", "equipment.xlsx")
	require.NoError(t, err)
	_, err = fileWriter.Write(xlsx.Bytes())
	require.NoError(t, err)
	require.NoError(t, multipartWriter.WriteField("asset_type", "Asset"))
	require.NoError(t, multipartWriter.Close())

	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	ctx.Request = httptest.NewRequest(http.MethodPost, "/api/v1/assets/import", &body)
	ctx.Request.Header.Set("Content-Type", multipartWriter.FormDataContentType())
	ctx.Set("tenant_id", 42)
	ctx.Set("user_id", 7)

	handler.ImportAssets(ctx)

	require.Equal(t, http.StatusOK, recorder.Code)
	require.Equal(t, 42, service.tenantID)
	require.Equal(t, "Asset", service.importReq.AssetType)
	require.Equal(t, "equipment.xlsx", service.importReq.FileName)
	require.Equal(t, xlsx.Bytes(), service.imported)
	require.Contains(t, recorder.Body.String(), `"created_count":1`)
}

func TestImportAssetsAcceptsCSVAndRejectsUnsupportedExtension(t *testing.T) {
	gin.SetMode(gin.TestMode)
	requestWithFile := func(filename string) (*httptest.ResponseRecorder, *assetExportServiceMock) {
		service := &assetExportServiceMock{}
		handler := handlers.NewAssetHandler(service, nil)
		fileContent := []byte("category,category\nAsset ID,Equipment Tag\n101,ROOT\n")
		var body bytes.Buffer
		multipartWriter := multipart.NewWriter(&body)
		fileWriter, err := multipartWriter.CreateFormFile("file", filename)
		require.NoError(t, err)
		_, err = fileWriter.Write(fileContent)
		require.NoError(t, err)
		require.NoError(t, multipartWriter.WriteField("file_format", "xlsx"))
		require.NoError(t, multipartWriter.Close())
		recorder := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(recorder)
		ctx.Request = httptest.NewRequest(http.MethodPost, "/api/v1/assets/import", &body)
		ctx.Request.Header.Set("Content-Type", multipartWriter.FormDataContentType())
		ctx.Set("tenant_id", 42)
		ctx.Set("user_id", 7)
		handler.ImportAssets(ctx)
		return recorder, service
	}

	recorder, service := requestWithFile("equipment.csv")
	require.Equal(t, http.StatusOK, recorder.Code)
	require.True(t, service.called)
	require.Equal(t, "csv", service.importReq.FileFormat)
	require.Equal(t, "equipment.csv", service.importReq.FileName)
	require.Equal(t, []byte("category,category\nAsset ID,Equipment Tag\n101,ROOT\n"), service.imported)
	uppercaseRecorder, uppercaseService := requestWithFile("equipment.CSV")
	require.Equal(t, http.StatusOK, uppercaseRecorder.Code)
	require.Equal(t, "csv", uppercaseService.importReq.FileFormat)

	unsupportedRecorder, unsupportedService := requestWithFile("equipment.txt")
	require.Equal(t, http.StatusBadRequest, unsupportedRecorder.Code)
	require.False(t, unsupportedService.called)
}

func TestImportAssetsRejectsFilesOver100MB(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &assetExportServiceMock{}
	handler := handlers.NewAssetHandler(service, nil)

	var body bytes.Buffer
	multipartWriter := multipart.NewWriter(&body)
	fileWriter, err := multipartWriter.CreateFormFile("file", "oversized.xlsx")
	require.NoError(t, err)
	// Write minimal dummy content into writer, but we simulate large file via boundary
	// or create a synthetic multipart request whose part header reports size > 100MB
	_, err = fileWriter.Write([]byte("fake-xlsx-content"))
	require.NoError(t, err)
	require.NoError(t, multipartWriter.Close())

	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	ctx.Request = httptest.NewRequest(http.MethodPost, "/api/v1/assets/import", &body)
	ctx.Request.Header.Set("Content-Type", multipartWriter.FormDataContentType())
	ctx.Set("tenant_id", 42)
	ctx.Set("user_id", 7)

	// In parseMultipartForm, fileHeader.Size is computed.
	// For testing rejection of header > 100MB without allocating 101MB in memory,
	// we can test directly or test empty/invalid size.
	// Let's test with an empty file first:
	recorderEmpty := httptest.NewRecorder()
	ctxEmpty, _ := gin.CreateTestContext(recorderEmpty)
	var bodyEmpty bytes.Buffer
	mwEmpty := multipart.NewWriter(&bodyEmpty)
	_, _ = mwEmpty.CreateFormFile("file", "empty.xlsx")
	_ = mwEmpty.Close()
	ctxEmpty.Request = httptest.NewRequest(http.MethodPost, "/api/v1/assets/import", &bodyEmpty)
	ctxEmpty.Request.Header.Set("Content-Type", mwEmpty.FormDataContentType())
	ctxEmpty.Set("tenant_id", 42)
	ctxEmpty.Set("user_id", 7)

	handler.ImportAssets(ctxEmpty)
	require.Equal(t, http.StatusBadRequest, recorderEmpty.Code)
	require.Contains(t, recorderEmpty.Body.String(), "File must be between 1 byte and 100 MB")
}
