package com.burgerburst.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import javax.xml.parsers.DocumentBuilderFactory;
import org.junit.jupiter.api.Test;

class XlsxReportWriterTest {

    private final XlsxReportWriter writer = new XlsxReportWriter();

    @Test
    void createsAValidOpenXmlPackageWithRequiredParts() throws Exception {
        Map<String, byte[]> entries = unzip(sampleWorkbook());

        assertThat(entries).containsKeys(
                "[Content_Types].xml", "_rels/.rels", "xl/workbook.xml",
                "xl/styles.xml", "xl/worksheets/sheet1.xml");
        for (Map.Entry<String, byte[]> entry : entries.entrySet()) {
            if (entry.getKey().endsWith(".xml") || entry.getKey().endsWith(".rels")) {
                DocumentBuilderFactory.newInstance().newDocumentBuilder()
                        .parse(new ByteArrayInputStream(entry.getValue()));
            }
        }
    }

    @Test
    void writesTypedCellsInsteadOfFormattingEveryValueAsText() throws Exception {
        String sheet = new String(unzip(sampleWorkbook()).get("xl/worksheets/sheet1.xml"), StandardCharsets.UTF_8);

        assertThat(sheet).contains("<c r=\"A2\" s=\"0\" t=\"inlineStr\"");
        assertThat(sheet).contains("<c r=\"B2\" s=\"2\"><v>1234.5</v></c>");
        assertThat(sheet).contains("<c r=\"C2\" s=\"4\"><v>");
        assertThat(sheet).contains("<c r=\"D2\" t=\"b\"><v>1</v></c>");
    }

    @Test
    void freezesTheHeaderAndAddsFilteringAndUsefulColumnWidths() throws Exception {
        String sheet = new String(unzip(sampleWorkbook()).get("xl/worksheets/sheet1.xml"), StandardCharsets.UTF_8);

        assertThat(sheet).contains("state=\"frozen\"");
        assertThat(sheet).contains("<autoFilter ref=\"A1:D2\"");
        assertThat(sheet).contains("customWidth=\"1\"");
    }

    @Test
    void escapesTextThatWouldOtherwiseBreakWorksheetXml() throws Exception {
        byte[] bytes = writer.write("Sales & Orders", List.of("Customer"),
                List.of(AdminReportService.ColumnType.TEXT), List.of(List.of("A&B <Chef> \"One\"")));
        String sheet = new String(unzip(bytes).get("xl/worksheets/sheet1.xml"), StandardCharsets.UTF_8);

        assertThat(sheet).contains("A&amp;B &lt;Chef&gt; &quot;One&quot;");
        assertThat(new String(unzip(bytes).get("xl/workbook.xml"), StandardCharsets.UTF_8))
                .contains("Sales &amp; Orders");
    }

    private byte[] sampleWorkbook() {
        return writer.write("Sales", List.of("Order", "Revenue", "Created", "Paid"),
                List.of(AdminReportService.ColumnType.TEXT, AdminReportService.ColumnType.CURRENCY,
                        AdminReportService.ColumnType.DATE_TIME, AdminReportService.ColumnType.BOOLEAN),
                List.of(List.of("BB-100", new BigDecimal("1234.50"),
                        Instant.parse("2026-07-21T08:30:00Z"), true)));
    }

    private Map<String, byte[]> unzip(byte[] bytes) throws Exception {
        Map<String, byte[]> entries = new LinkedHashMap<>();
        try (ZipInputStream input = new ZipInputStream(new ByteArrayInputStream(bytes))) {
            ZipEntry entry;
            while ((entry = input.getNextEntry()) != null) entries.put(entry.getName(), input.readAllBytes());
        }
        return entries;
    }
}
