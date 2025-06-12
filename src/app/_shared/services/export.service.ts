import {Injectable, Inject, LOCALE_ID} from '@angular/core';
import * as XLSX from 'xlsx';
import {jsPDF} from 'jspdf';
import autoTable from 'jspdf-autotable';
import {PreparationModel} from '../../features/preparation/model/preparationModel';
import {DatePipe} from '@angular/common';
import {TranslateService} from '@ngx-translate/core';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: any; // This property is added by jspdf-autotable
    lastAutoTable: {
      finalY: number;
      startY: number;
      table: any;
      head: any;
      body: any;
      columnStyles: any;
      styles: any;
      margin: { left: number; right: number; top: number; bottom: number };
      pageNumber: number;
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  private readonly PAGE_MARGIN_TOP = 10;
  private readonly PAGE_MARGIN_BOTTOM = 20; // For footer
  private readonly VERTICAL_SPACING_BETWEEN_RECEIPTS = 10; // Space between receipts on same page

  // Estimated static heights for receipt sections (in mm)
  private readonly RECEIPT_HEADER_BLOCK_HEIGHT = 75; // Logo (30) + Header texts (35) + Line (10)
  private readonly RECEIPT_ORDER_INFO_BLOCK_HEIGHT = 25; // Space after line (10) + Title (5) + Details (5+5+10=20)
  private readonly RECEIPT_CLIENT_INFO_BLOCK_HEIGHT = 40; // Space after prev (10) + Title (5) + Details (5+5+5+5+5+10=35)
  private readonly RECEIPT_ORDER_DETAILS_BLOCK_HEIGHT = 5; // Space after prev (10) + Title (5)
  private readonly RECEIPT_TABLE_HEADER_HEIGHT = 5; // Height for autoTable head
  private readonly RECEIPT_PRODUCT_ROW_ESTIMATED_HEIGHT = 3.5; // Estimated height per product row
  private readonly RECEIPT_TABLE_POST_SPACING = 5; // Spacing after autoTable (currentY = finalY + 5)
  private readonly RECEIPT_TOTAL_BLOCK_HEIGHT = 10; // Total line increment
  private readonly RECEIPT_TECHNICAL_INFO_BLOCK_HEIGHT = 25; // Space after prev (10) + Title (5) + Details (5+5+10=20)

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private datePipe: DatePipe,
    private translateService: TranslateService
  ) {}

  private _estimateSingleReceiptHeight(item: PreparationModel): number {
    let estimatedHeight = 0;
    estimatedHeight += this.RECEIPT_HEADER_BLOCK_HEIGHT;
    estimatedHeight += this.RECEIPT_ORDER_INFO_BLOCK_HEIGHT;
    estimatedHeight += this.RECEIPT_CLIENT_INFO_BLOCK_HEIGHT;
    estimatedHeight += this.RECEIPT_ORDER_DETAILS_BLOCK_HEIGHT;

    if (item.contenu) {
      const numProducts = item.contenu.split('\n').filter(line => line.trim() !== '').length;
      estimatedHeight += this.RECEIPT_TABLE_HEADER_HEIGHT + (numProducts * this.RECEIPT_PRODUCT_ROW_ESTIMATED_HEIGHT);
      estimatedHeight += this.RECEIPT_TABLE_POST_SPACING;
    }

    estimatedHeight += this.RECEIPT_TOTAL_BLOCK_HEIGHT;
    estimatedHeight += this.RECEIPT_TECHNICAL_INFO_BLOCK_HEIGHT;

    return estimatedHeight;
  }

  private _drawPreparationReceipt(doc: jsPDF, item: PreparationModel, startY: number): number {
    const logoPath = 'assets/img/logo_livrex.png';
    const logoWidth = 40; // mm
    const logoHeight = 20; // mm

    const logoX = (doc.internal.pageSize.width / 2) - (logoWidth / 2); // Center the logo in portrait
    let currentY = startY;

    // Adjust logoY based on currentY for new receipts on the same page
    doc.addImage(logoPath, 'PNG', logoX, currentY, logoWidth, logoHeight);
    currentY += logoHeight + 10; // Starting Y position after logo

    // En-tête
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('LIVRAISON EXPRESS', doc.internal.pageSize.width / 2, currentY, {align: 'center'});
    currentY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Makepe, Douala, Cameroun', doc.internal.pageSize.width / 2, currentY, {align: 'center'});
    currentY += 5;

    doc.text('Téléphone: 237 694 779 253', doc.internal.pageSize.width / 2, currentY, {align: 'center'});
    currentY += 10;

    doc.setFontSize(12);
    doc.text('Détails de Préparation Colis', doc.internal.pageSize.width / 2, currentY, {align: 'center'});
    currentY += 5;

    doc.setFontSize(8);
    doc.text(`Date de génération: ${this.datePipe.transform(new Date(), 'dd/MM/yyyy HH:mm')}`, doc.internal.pageSize.width / 2, currentY, {align: 'center'});
    currentY += 10;

    // Ligne horizontale
    doc.setLineWidth(0.5);
    doc.setDrawColor(0);
    doc.line(15, currentY, doc.internal.pageSize.width - 15, currentY);
    currentY += 10; // Space after line


    
    const labelX = 20;
    const valueX = 70; // Adjusted for better alignment

    // --- Informations de Commande ---
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations de Commande', labelX, currentY);
    currentY += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Date de commande :', labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${this.datePipe.transform(item.date_livraison, 'dd/MM/yyyy HH:mm')}`, valueX, currentY);
    currentY += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('Numéro de commande :', labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${item.course_code}`, valueX, currentY);
    currentY += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('Magasin :', labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${item.magasin}`, valueX, currentY);
    currentY += 10;

    // --- Informations Client ---
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations Client', labelX, currentY);
    currentY += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Nom du client :', labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${item.client}`, valueX, currentY);
    currentY += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('Téléphone client :', labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${item.telephone}`, valueX, currentY);
    currentY += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('Quartier :', labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${item.quartier}`, valueX, currentY);
    currentY += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('Ville :', labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${item.ville}`, valueX, currentY);
    currentY += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('Adresse complète :', labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${item.quartier}, ${item.ville}`, valueX, currentY); // Combined
    currentY += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('Zone de livraison :', labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${item.ville}`, valueX, currentY); // Using ville as zone for now
    currentY += 10;

    // --- Détails de la Commande ---
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Détails de la Commande', labelX, currentY);
    currentY += 5;

    if (item.contenu) {
      const products = item.contenu.split('\n').map(line => {
        const parts = line.split(' x ');
        return [parts[0] || '', parts[1] || ''];
      });

      autoTable(doc, {
        startY: currentY,
        head: [['Description', 'Quantité']],
        body: products,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: {
          fillColor: [0, 0, 0],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { halign: 'left' },
          1: { halign: 'right' }
        },
        margin: { left: labelX, right: doc.internal.pageSize.width - (labelX + 100) }
      });
      currentY = doc.lastAutoTable.finalY + 5;
    }

    // Total
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Total :', doc.internal.pageSize.width - 50, currentY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(`${item.total || '0.00'} FCFA`, doc.internal.pageSize.width - 20, currentY, { align: 'right' });
    currentY += 10;

    // --- Informations Techniques ---
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations Techniques', labelX, currentY);
    currentY += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('URL source :', labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text('Non disponible', valueX, currentY);
    currentY += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('Pagination :', labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text('Non disponible', valueX, currentY);
    currentY += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('Horodatage :', labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${this.datePipe.transform(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, valueX, currentY);
    currentY += 10;

    return currentY;
  }

  exportToPdf(data: PreparationModel[], fileName: string): void {
    const doc = new jsPDF('p', 'mm', 'a4');
    let currentY = this.PAGE_MARGIN_TOP; // Start at top margin

    if (data.length === 0) {
      console.warn('No data provided for PDF export.');
      doc.text('Aucune donnée disponible pour l\'exportation.', doc.internal.pageSize.width / 2, 100, {align: 'center'});
      doc.autoPrint();
      doc.output('dataurlnewwindow');
      return;
    }

    data.forEach((item, index) => {
      const estimatedHeight = this._estimateSingleReceiptHeight(item);

      // Check if adding this receipt will exceed page height
      if (currentY + estimatedHeight + this.VERTICAL_SPACING_BETWEEN_RECEIPTS > doc.internal.pageSize.height - this.PAGE_MARGIN_BOTTOM && index > 0) {
        doc.addPage();
        currentY = this.PAGE_MARGIN_TOP; // Reset Y for new page
      }

      // Draw the current receipt
      currentY = this._drawPreparationReceipt(doc, item, currentY);

      // Add a separator line if it's not the last receipt AND there's space for a separator + next receipt on the same page
      if (index < data.length - 1 && currentY < doc.internal.pageSize.height - this.PAGE_MARGIN_BOTTOM) {
        doc.setLineWidth(0.2);
        doc.setDrawColor(150); // Gray color for separator
        doc.line(15, currentY + (this.VERTICAL_SPACING_BETWEEN_RECEIPTS / 2), doc.internal.pageSize.width - 15, currentY + (this.VERTICAL_SPACING_BETWEEN_RECEIPTS / 2));
      }
    });

    // Add page numbers at the very end for all pages
    const totalPages = doc.internal.pages.length;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${i} sur ${totalPages}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - this.PAGE_MARGIN_BOTTOM + 5, {align: 'center'});
    }

    // Ouvrir le PDF dans une nouvelle fenêtre et imprimer
    doc.autoPrint();
    doc.output('dataurlnewwindow');
  }

  exportToExcel(data: PreparationModel[], fileName: string): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data.map(item => ({
      'Code de commande': item.course_code,
      'Magasin': item.magasin,
      'Préparation Colis': this.translateService.instant('preparation.status.' + item.statut_preparation_colis?.toLowerCase()),
      'Coursier': item.coursier,
      'Contenu': item.contenu,
      'Statut Course': this.translateService.instant('orderStatus.' + item.statut?.toLowerCase()),
      'Client': item.client,
      'Téléphone': item.telephone,
      'Quartier': item.quartier,
      'Ville': item.ville,
      'Date de livraison': this.datePipe.transform(item.date_livraison, 'yyyy-MM-dd HH:mm')
    })));

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Préparation Colis');

    const date = this.datePipe.transform(new Date(), 'yyyyMMdd_HHmm');
    XLSX.writeFile(wb, `${fileName}_${date}.xlsx`);
  }

  printData(data: PreparationModel[], fileName: string): void {
    this.exportToPdf(data, fileName);
  }

  printDetailed(data: PreparationModel[], fileName: string): void {
    this.printData(data, fileName);
  }
}