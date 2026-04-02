import PDFDocument from 'pdfkit';
import { Patient, Doctor, Medicine } from '../types';

interface PrescriptionPDFData {
  patient: Patient;
  doctor: Doctor;
  medicines: Medicine[];
  instructions?: string;
  issuedAt: Date;
}

interface CertificatePDFData {
  patient: Patient;
  doctor: Doctor;
  reason: string;
  fromDate: Date;
  toDate: Date;
  notes?: string;
  issuedAt: Date;
}

export async function generatePrescriptionPDF(data: PrescriptionPDFData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('Sri Narayani Health Centre', { align: 'center' })
      .fontSize(12)
      .font('Helvetica')
      .text('VIT University Campus', { align: 'center' })
      .moveDown(0.5);

    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke()
      .moveDown();

    // Title
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('PRESCRIPTION', { align: 'center' })
      .moveDown();

    // Patient Info
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('Patient Information', { underline: true })
      .moveDown(0.3);

    doc
      .font('Helvetica')
      .text(`Name: ${data.patient.full_name}`)
      .text(`Student ID: ${data.patient.student_id}`)
      .text(`Date of Birth: ${data.patient.date_of_birth || 'N/A'}`)
      .text(`Gender: ${data.patient.gender || 'N/A'}`)
      .text(`Blood Group: ${data.patient.blood_group || 'N/A'}`)
      .moveDown();

    // Date
    doc
      .text(`Date: ${data.issuedAt.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })}`)
      .moveDown();

    // Medicines Table
    doc
      .font('Helvetica-Bold')
      .text('Medicines', { underline: true })
      .moveDown(0.5);

    // Table header
    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 200;
    const col3 = 280;
    const col4 = 360;
    const col5 = 440;

    doc
      .fontSize(10)
      .text('Medicine', col1, tableTop)
      .text('Dosage', col2, tableTop)
      .text('Frequency', col3, tableTop)
      .text('Duration', col4, tableTop)
      .text('Instructions', col5, tableTop);

    doc
      .moveTo(col1, doc.y + 3)
      .lineTo(545, doc.y + 3)
      .stroke();

    // Table rows
    let y = doc.y + 10;
    doc.font('Helvetica');

    data.medicines.forEach(med => {
      doc
        .text(med.name, col1, y, { width: 145 })
        .text(med.dosage, col2, y, { width: 75 })
        .text(med.frequency, col3, y, { width: 75 })
        .text(med.duration, col4, y, { width: 75 })
        .text(med.instructions || '-', col5, y, { width: 100 });
      y = doc.y + 10;
    });

    doc.moveDown(2);

    // Additional Instructions
    if (data.instructions) {
      doc
        .font('Helvetica-Bold')
        .text('Additional Instructions:', { underline: true })
        .moveDown(0.3)
        .font('Helvetica')
        .text(data.instructions)
        .moveDown(2);
    }

    // Doctor Signature
    doc
      .moveDown(2)
      .font('Helvetica-Bold')
      .text(`Dr. ${data.doctor.full_name}`, { align: 'right' })
      .font('Helvetica')
      .text(data.doctor.specialization || '', { align: 'right' })
      .text(data.doctor.qualification || '', { align: 'right' })
      .text(`Reg. No: ${data.doctor.registration_number || 'N/A'}`, { align: 'right' });

    // Footer
    doc
      .fontSize(8)
      .text(
        'This is a computer-generated prescription. Valid only with doctor\'s digital signature.',
        50,
        doc.page.height - 50,
        { align: 'center' }
      );

    doc.end();
  });
}

export async function generateCertificatePDF(data: CertificatePDFData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('Sri Narayani Health Centre', { align: 'center' })
      .fontSize(12)
      .font('Helvetica')
      .text('VIT University Campus', { align: 'center' })
      .moveDown(0.5);

    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke()
      .moveDown();

    // Title
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('MEDICAL CERTIFICATE', { align: 'center' })
      .moveDown(2);

    // Certificate number and date
    const certNumber = `MC-${Date.now().toString(36).toUpperCase()}`;
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Certificate No: ${certNumber}`, { align: 'right' })
      .text(`Date: ${data.issuedAt.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })}`, { align: 'right' })
      .moveDown(2);

    // Body
    doc
      .fontSize(12)
      .font('Helvetica')
      .text('TO WHOM IT MAY CONCERN', { align: 'center' })
      .moveDown(2);

    const fromDateStr = data.fromDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    const toDateStr = data.toDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    doc
      .text(
        `This is to certify that ${data.patient.full_name}, ` +
        `Student ID: ${data.patient.student_id}, ` +
        `was under my medical care and treatment.`,
        { align: 'justify', lineGap: 5 }
      )
      .moveDown();

    doc
      .font('Helvetica-Bold')
      .text('Reason: ', { continued: true })
      .font('Helvetica')
      .text(data.reason)
      .moveDown();

    doc
      .font('Helvetica-Bold')
      .text('Period: ', { continued: true })
      .font('Helvetica')
      .text(`From ${fromDateStr} to ${toDateStr}`)
      .moveDown();

    if (data.notes) {
      doc
        .font('Helvetica-Bold')
        .text('Remarks: ', { continued: true })
        .font('Helvetica')
        .text(data.notes)
        .moveDown();
    }

    doc
      .moveDown()
      .text(
        'The patient is advised to take rest and follow the prescribed treatment ' +
        'during the mentioned period.',
        { align: 'justify' }
      )
      .moveDown(3);

    // Doctor Signature
    doc
      .font('Helvetica-Bold')
      .text(`Dr. ${data.doctor.full_name}`, { align: 'right' })
      .font('Helvetica')
      .text(data.doctor.specialization || '', { align: 'right' })
      .text(data.doctor.qualification || '', { align: 'right' })
      .text(`Reg. No: ${data.doctor.registration_number || 'N/A'}`, { align: 'right' });

    // Official stamp placeholder
    doc
      .moveDown(2)
      .rect(400, doc.y, 100, 50)
      .stroke()
      .fontSize(8)
      .text('Official Stamp', 420, doc.y + 20);

    // Footer
    doc
      .fontSize(8)
      .text(
        'This certificate is issued upon the request of the patient and is valid for official purposes.',
        50,
        doc.page.height - 60,
        { align: 'center' }
      )
      .text(
        'This is a computer-generated certificate. No signature required.',
        50,
        doc.page.height - 45,
        { align: 'center' }
      );

    doc.end();
  });
}
