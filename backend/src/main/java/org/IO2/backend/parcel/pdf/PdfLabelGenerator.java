package org.IO2.backend.parcel.pdf;

import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.IO2.backend.parcel.model.Parcel;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class PdfLabelGenerator {

    public byte[] generateLabel(Parcel parcel) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Font textFont = FontFactory.getFont(FontFactory.HELVETICA, 12);

            document.add(new Paragraph("ETYKIETA PRZEWOZOWA - POCZTA", titleFont));
            document.add(new Paragraph("--------------------------------------------------"));
            document.add(new Paragraph("Numer Nadania (Tracking): " + parcel.getTrackingNumber(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14)));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("DANE ODBIORCY:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
            document.add(new Paragraph(parcel.getReceiverName(), textFont));
            document.add(new Paragraph(parcel.getReceiverAddress(), textFont));
            document.add(new Paragraph(parcel.getReceiverEmail(), textFont));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("SZCZEGOLY PRZESYLKI:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
            document.add(new Paragraph("Gabaryt: " + parcel.getSize() + " | Waga: " + parcel.getWeight() + " kg", textFont));
            document.add(new Paragraph("Priorytet: " + (parcel.getIsPriority() ? "TAK" : "NIE"), textFont));
            document.add(new Paragraph("Opłacono: " + parcel.getPrice() + " PLN", textFont));

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Błąd generowania PDF", e);
        }

        return out.toByteArray();
    }
}
