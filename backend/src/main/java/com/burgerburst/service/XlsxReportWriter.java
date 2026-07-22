package com.burgerburst.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import org.springframework.stereotype.Component;

@Component
public class XlsxReportWriter {

    private static final Instant EXCEL_EPOCH = LocalDate.of(1899, 12, 30)
            .atStartOfDay(ZoneOffset.UTC).toInstant();

    public byte[] write(String sheetName, List<String> headers, List<AdminReportService.ColumnType> types,
                        List<List<Object>> rows) {
        try {
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            try (ZipOutputStream zip = new ZipOutputStream(output, StandardCharsets.UTF_8)) {
                entry(zip, "[Content_Types].xml", contentTypes());
                entry(zip, "_rels/.rels", packageRelationships());
                entry(zip, "docProps/core.xml", coreProperties());
                entry(zip, "docProps/app.xml", appProperties());
                entry(zip, "xl/workbook.xml", workbook(sheetName));
                entry(zip, "xl/_rels/workbook.xml.rels", workbookRelationships());
                entry(zip, "xl/styles.xml", styles());
                entry(zip, "xl/worksheets/sheet1.xml", worksheet(headers, types, rows));
            }
            return output.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to create Excel report", exception);
        }
    }

    private String worksheet(
            List<String> headers, List<AdminReportService.ColumnType> types, List<List<Object>> rows) {
        StringBuilder xml = new StringBuilder(8192);
        int lastRow = rows.size() + 1;
        String lastColumn = columnName(headers.size());
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>")
                .append("<worksheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\">")
                .append("<sheetViews><sheetView workbookViewId=\"0\" showGridLines=\"0\">")
                .append("<pane ySplit=\"1\" topLeftCell=\"A2\" activePane=\"bottomLeft\" state=\"frozen\"/>")
                .append("</sheetView></sheetViews><cols>");
        for (int index = 0; index < headers.size(); index++) {
            int width = estimatedWidth(index, headers, rows);
            xml.append("<col min=\"").append(index + 1).append("\" max=\"")
                    .append(index + 1).append("\" width=\"").append(width).append("\" customWidth=\"1\"/>");
        }
        xml.append("</cols><sheetData><row r=\"1\" ht=\"24\" customHeight=\"1\">");
        for (int index = 0; index < headers.size(); index++) {
            inlineString(xml, cell(index, 1), headers.get(index), 1);
        }
        xml.append("</row>");
        for (int rowIndex = 0; rowIndex < rows.size(); rowIndex++) {
            int excelRow = rowIndex + 2;
            xml.append("<row r=\"").append(excelRow).append("\">");
            List<Object> values = rows.get(rowIndex);
            for (int columnIndex = 0; columnIndex < headers.size(); columnIndex++) {
                Object value = columnIndex < values.size() ? values.get(columnIndex) : null;
                appendCell(xml, cell(columnIndex, excelRow), value, types.get(columnIndex));
            }
            xml.append("</row>");
        }
        xml.append("</sheetData><autoFilter ref=\"A1:").append(lastColumn).append(lastRow).append("\"/>")
                .append("<pageMargins left=\"0.5\" right=\"0.5\" top=\"0.75\" bottom=\"0.75\" ")
                .append("header=\"0.3\" footer=\"0.3\"/></worksheet>");
        return xml.toString();
    }

    private void appendCell(
            StringBuilder xml, String reference, Object value, AdminReportService.ColumnType type) {
        if (value == null) {
            xml.append("<c r=\"").append(reference).append("\"/>");
            return;
        }
        switch (type) {
            case INTEGER -> numeric(xml, reference, value, 3);
            case CURRENCY -> numeric(xml, reference, value, 2);
            case DECIMAL -> numeric(xml, reference, value, 5);
            case DATE_TIME -> date(xml, reference, value);
            case BOOLEAN -> xml.append("<c r=\"").append(reference)
                    .append("\" t=\"b\"><v>").append(Boolean.TRUE.equals(value) ? 1 : 0).append("</v></c>");
            default -> inlineString(xml, reference, String.valueOf(value), 0);
        }
    }

    private void numeric(StringBuilder xml, String reference, Object value, int style) {
        BigDecimal number = value instanceof BigDecimal decimal
                ? decimal : new BigDecimal(String.valueOf(value));
        xml.append("<c r=\"").append(reference).append("\" s=\"").append(style)
                .append("\"><v>").append(number.stripTrailingZeros().toPlainString()).append("</v></c>");
    }

    private void date(StringBuilder xml, String reference, Object value) {
        Instant instant = value instanceof Instant parsed ? parsed
                : value instanceof java.sql.Timestamp timestamp ? timestamp.toInstant()
                : value instanceof LocalDate date ? date.atStartOfDay(ZoneOffset.UTC).toInstant()
                : Instant.parse(String.valueOf(value));
        BigDecimal serial = BigDecimal.valueOf(Duration.between(EXCEL_EPOCH, instant).toMillis())
                .divide(BigDecimal.valueOf(86_400_000L), 10, RoundingMode.HALF_UP);
        xml.append("<c r=\"").append(reference).append("\" s=\"4\"><v>")
                .append(serial.stripTrailingZeros().toPlainString()).append("</v></c>");
    }

    private void inlineString(StringBuilder xml, String reference, String value, int style) {
        xml.append("<c r=\"").append(reference).append("\" s=\"").append(style)
                .append("\" t=\"inlineStr\"><is><t xml:space=\"preserve\">")
                .append(escape(value)).append("</t></is></c>");
    }

    private int estimatedWidth(int column, List<String> headers, List<List<Object>> rows) {
        int width = headers.get(column).length() + 2;
        for (List<Object> row : rows.stream().limit(200).toList()) {
            if (column < row.size() && row.get(column) != null) {
                width = Math.max(width, String.valueOf(row.get(column)).length() + 2);
            }
        }
        return Math.min(Math.max(width, 10), 42);
    }

    private String cell(int zeroBasedColumn, int row) {
        return columnName(zeroBasedColumn + 1) + row;
    }

    private String columnName(int oneBasedColumn) {
        StringBuilder result = new StringBuilder();
        int value = oneBasedColumn;
        while (value > 0) {
            value--;
            result.insert(0, (char) ('A' + value % 26));
            value /= 26;
        }
        return result.toString();
    }

    private void entry(ZipOutputStream zip, String name, String content) throws IOException {
        zip.putNextEntry(new ZipEntry(name));
        zip.write(content.getBytes(StandardCharsets.UTF_8));
        zip.closeEntry();
    }

    private String contentTypes() {
        return """
                <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
                  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
                  <Default Extension="xml" ContentType="application/xml"/>
                  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
                  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
                  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
                  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
                  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
                </Types>
                """;
    }

    private String packageRelationships() {
        return """
                <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
                  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
                  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
                </Relationships>
                """;
    }

    private String workbook(String sheetName) {
        return "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
                + "<workbook xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\" "
                + "xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\">"
                + "<sheets><sheet name=\"" + escape(sheetName) + "\" sheetId=\"1\" r:id=\"rId1\"/>"
                + "</sheets></workbook>";
    }

    private String workbookRelationships() {
        return """
                <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
                  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
                </Relationships>
                """;
    }

    private String styles() {
        return """
                <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
                  <numFmts count="2"><numFmt numFmtId="164" formatCode="#,##0.00"/><numFmt numFmtId="165" formatCode="yyyy-mm-dd hh:mm"/></numFmts>
                  <fonts count="2">
                    <font><sz val="10"/><name val="Aptos"/></font>
                    <font><b/><color rgb="FFFFFFFF"/><sz val="10"/><name val="Aptos Display"/></font>
                  </fonts>
                  <fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0F766E"/><bgColor indexed="64"/></patternFill></fill></fills>
                  <borders count="2"><border/><border><bottom style="medium"><color rgb="FF134E4A"/></bottom></border></borders>
                  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
                  <cellXfs count="6">
                    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
                    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
                    <xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
                    <xf numFmtId="1" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
                    <xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
                    <xf numFmtId="4" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
                  </cellXfs>
                  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
                </styleSheet>
                """;
    }

    private String coreProperties() {
        return """
                <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
                  <dc:creator>BurgerBurst</dc:creator><cp:lastModifiedBy>BurgerBurst</cp:lastModifiedBy><dc:title>Administration Report</dc:title>
                </cp:coreProperties>
                """;
    }

    private String appProperties() {
        return """
                <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
                  <Application>BurgerBurst</Application><AppVersion>1.0</AppVersion>
                </Properties>
                """;
    }

    private String escape(String value) {
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&apos;");
    }
}
