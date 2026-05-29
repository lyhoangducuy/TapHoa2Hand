package vn.edu.husc.taphoa2hand_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@Slf4j
public class ExcelExportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter FILE_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd_HHmmss");

    public void exportOrdersToExcel(List<?> orders, HttpServletResponse response, String filename) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Đơn hàng");

        // Create header style
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dateStyle = createDateStyle(workbook);
        CellStyle currencyStyle = createCurrencyStyle(workbook);
        CellStyle centerStyle = createCenterStyle(workbook);

        // Create headers
        String[] headers = {"ID", "Người mua", "Người bán", "Trạng thái", "Phương thức", "Tổng tiền", "Phí nền tảng", "Ngày tạo", "Cập nhật"};
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Create data rows
        int rowNum = 1;
        for (Object orderObj : orders) {
            Row row = sheet.createRow(rowNum++);
            if (orderObj instanceof vn.edu.husc.taphoa2hand_backend.dto.response.Statistics.OrderStatisticsResponse order) {
                row.createCell(0).setCellValue(order.getId() != null ? order.getId() : "");
                row.createCell(1).setCellValue(order.getBuyerName() != null ? order.getBuyerName() : "");
                row.createCell(2).setCellValue(order.getSellerName() != null ? order.getSellerName() : "");
                
                Cell statusCell = row.createCell(3);
                statusCell.setCellValue(order.getStatusDisplayName() != null ? order.getStatusDisplayName() : "");
                statusCell.setCellStyle(centerStyle);
                
                row.createCell(4).setCellValue(order.getPaymentMethod() != null ? order.getPaymentMethod() : "");
                
                Cell amountCell = row.createCell(5);
                amountCell.setCellValue(order.getTotalAmount() != null ? order.getTotalAmount().doubleValue() : 0);
                amountCell.setCellStyle(currencyStyle);
                
                Cell feeCell = row.createCell(6);
                feeCell.setCellValue(order.getPlatformFee() != null ? order.getPlatformFee().doubleValue() : 0);
                feeCell.setCellStyle(currencyStyle);
                
                Cell createdCell = row.createCell(7);
                createdCell.setCellValue(order.getCreatedAt() != null ? order.getCreatedAt().format(DATE_FORMATTER) : "");
                createdCell.setCellStyle(dateStyle);
                
                Cell updatedCell = row.createCell(8);
                updatedCell.setCellValue(order.getUpdatedAt() != null ? order.getUpdatedAt().format(DATE_FORMATTER) : "");
                updatedCell.setCellStyle(dateStyle);
            }
        }

        // Auto size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        // Write to response
        writeToResponse(workbook, response, filename);
    }

    public void exportUsersToExcel(List<?> users, HttpServletResponse response, String filename) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Người dùng");

        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dateStyle = createDateStyle(workbook);

        String[] headers = {"ID", "Họ tên", "Username", "Email", "SĐT", "Ngày sinh", "Ngày đăng ký", "Trạng thái"};
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        int rowNum = 1;
        for (Object userObj : users) {
            Row row = sheet.createRow(rowNum++);
            if (userObj instanceof vn.edu.husc.taphoa2hand_backend.dto.response.Statistics.UserStatisticsResponse user) {
                row.createCell(0).setCellValue(user.getId() != null ? user.getId() : "");
                row.createCell(1).setCellValue(user.getFullName() != null ? user.getFullName() : "");
                row.createCell(2).setCellValue(user.getUsername() != null ? user.getUsername() : "");
                row.createCell(3).setCellValue(user.getEmail() != null ? user.getEmail() : "");
                row.createCell(4).setCellValue(user.getPhone() != null ? user.getPhone() : "");
                row.createCell(5).setCellValue(user.getDob() != null ? user.getDob().toString() : "");
                
                Cell createdCell = row.createCell(6);
                createdCell.setCellValue(user.getCreatedAt() != null ? user.getCreatedAt().format(DATE_FORMATTER) : "");
                createdCell.setCellStyle(dateStyle);
                
                row.createCell(7).setCellValue(user.isActive() ? "Hoạt động" : "Khóa");
            }
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        writeToResponse(workbook, response, filename);
    }

    public void exportReportsToExcel(List<?> reports, HttpServletResponse response, String filename) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Báo cáo");

        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dateStyle = createDateStyle(workbook);

        String[] headers = {"ID", "Loại", "Lý do", "Người báo cáo", "Người bị báo cáo", "Tin đăng", "Trạng thái", "Ghi chú", "Ngày tạo"};
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        int rowNum = 1;
        for (Object reportObj : reports) {
            Row row = sheet.createRow(rowNum++);
            if (reportObj instanceof vn.edu.husc.taphoa2hand_backend.dto.response.Statistics.ReportStatisticsResponse report) {
                row.createCell(0).setCellValue(report.getId() != null ? report.getId() : "");
                row.createCell(1).setCellValue(report.getTypeDisplayName() != null ? report.getTypeDisplayName() : "");
                row.createCell(2).setCellValue(report.getReasonDisplayName() != null ? report.getReasonDisplayName() : "");
                row.createCell(3).setCellValue(report.getReporterName() != null ? report.getReporterName() : "");
                row.createCell(4).setCellValue(report.getReportedUserName() != null ? report.getReportedUserName() : "");
                row.createCell(5).setCellValue(report.getPostTitle() != null ? report.getPostTitle() : "");
                row.createCell(6).setCellValue(report.getStatusDisplayName() != null ? report.getStatusDisplayName() : "");
                row.createCell(7).setCellValue(report.getResolutionNote() != null ? report.getResolutionNote() : "");
                
                Cell createdCell = row.createCell(8);
                createdCell.setCellValue(report.getCreatedAt() != null ? report.getCreatedAt().format(DATE_FORMATTER) : "");
                createdCell.setCellStyle(dateStyle);
            }
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        writeToResponse(workbook, response, filename);
    }

    public void exportRevenueToExcel(List<?> revenueData, HttpServletResponse response, String filename) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Doanh thu");

        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle currencyStyle = createCurrencyStyle(workbook);

        String[] headers = {"Ngày", "Doanh thu (VNĐ)", "Số đơn"};
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        int rowNum = 1;
        for (Object itemObj : revenueData) {
            Row row = sheet.createRow(rowNum++);
            if (itemObj instanceof vn.edu.husc.taphoa2hand_backend.dto.response.Statistics.RevenueChartItem item) {
                row.createCell(0).setCellValue(item.getDate() != null ? item.getDate() : "");
                
                Cell revenueCell = row.createCell(1);
                revenueCell.setCellValue(item.getRevenue() != null ? item.getRevenue().doubleValue() : 0);
                revenueCell.setCellStyle(currencyStyle);
                
                row.createCell(2).setCellValue(item.getOrderCount() != null ? item.getOrderCount() : 0);
            }
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        writeToResponse(workbook, response, filename);
    }

    // Helper methods
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        CreationHelper createHelper = workbook.getCreationHelper();
        style.setDataFormat(createHelper.createDataFormat().getFormat("dd/MM/yyyy HH:mm"));
        return style;
    }

    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("#,##0 \"VNĐ\""));
        style.setAlignment(HorizontalAlignment.RIGHT);
        return style;
    }

    private CellStyle createCenterStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    private void writeToResponse(Workbook workbook, HttpServletResponse response, String filename) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
        workbook.write(response.getOutputStream());
        workbook.close();
    }

    public String generateFilename(String prefix) {
        return prefix + "_" + LocalDateTime.now().format(FILE_DATE_FORMATTER) + ".xlsx";
    }
}
