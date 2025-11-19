// Certificate service
// ============================================
// CERTIFICATE SERVICE
// ============================================

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const config = require('../config/config');

// ============================================
// GENERATE CERTIFICATE PDF
// ============================================
const generateCertificatePDF = async (certificateData) => {
  try {
    const {
      recipientName,
      courseName,
      instructorName,
      completionDate,
      certificateNumber,
      verificationUrl,
      performance,
    } = certificateData;

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 50,
    });

    // Generate filename
    const fileName = `certificate-${Date.now()}.pdf`;
    const filePath = path.join(
      config.upload.folders.certificates,
      fileName
    );

    // Ensure directory exists
    if (!fs.existsSync(config.upload.folders.certificates)) {
      fs.mkdirSync(config.upload.folders.certificates, { recursive: true });
    }

    // Pipe PDF to file
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Add border
    doc
      .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
      .lineWidth(3)
      .strokeColor('#667eea')
      .stroke();

    doc
      .rect(40, 40, doc.page.width - 80, doc.page.height - 80)
      .lineWidth(1)
      .strokeColor('#667eea')
      .stroke();

    // Add header
    doc
      .fontSize(40)
      .fillColor('#667eea')
      .font('Helvetica-Bold')
      .text('Certificate of Completion', 0, 100, {
        align: 'center',
      });

    // Add decorative line
    doc
      .moveTo(200, 160)
      .lineTo(doc.page.width - 200, 160)
      .strokeColor('#764ba2')
      .lineWidth(2)
      .stroke();

    // Add "This is to certify that"
    doc
      .fontSize(16)
      .fillColor('#333')
      .font('Helvetica')
      .text('This is to certify that', 0, 190, {
        align: 'center',
      });

    // Add recipient name
    doc
      .fontSize(36)
      .fillColor('#000')
      .font('Helvetica-Bold')
      .text(recipientName, 0, 220, {
        align: 'center',
      });

    // Add completion text
    doc
      .fontSize(16)
      .fillColor('#333')
      .font('Helvetica')
      .text('has successfully completed the course', 0, 280, {
        align: 'center',
      });

    // Add course name
    doc
      .fontSize(28)
      .fillColor('#667eea')
      .font('Helvetica-Bold')
      .text(courseName, 0, 310, {
        align: 'center',
      });

    // Add performance score if available
    if (performance?.score) {
      doc
        .fontSize(14)
        .fillColor('#333')
        .font('Helvetica')
        .text(`Score: ${performance.score}%`, 0, 360, {
          align: 'center',
        });
    }

    // Add date
    doc
      .fontSize(14)
      .fillColor('#666')
      .font('Helvetica')
      .text(
        `Completed on ${new Date(completionDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`,
        0,
        400,
        {
          align: 'center',
        }
      );

    // Add instructor signature section
    doc
      .fontSize(12)
      .fillColor('#000')
      .font('Helvetica-Bold')
      .text(instructorName || 'SkillVerse Team', 150, 480);

    doc
      .moveTo(150, 475)
      .lineTo(300, 475)
      .strokeColor('#000')
      .lineWidth(1)
      .stroke();

    doc
      .fontSize(10)
      .fillColor('#666')
      .font('Helvetica')
      .text('Instructor', 150, 490);

    // Add platform signature
    doc
      .fontSize(12)
      .fillColor('#000')
      .font('Helvetica-Bold')
      .text('SkillVerse Platform', doc.page.width - 300, 480);

    doc
      .moveTo(doc.page.width - 300, 475)
      .lineTo(doc.page.width - 150, 475)
      .strokeColor('#000')
      .lineWidth(1)
      .stroke();

    doc
      .fontSize(10)
      .fillColor('#666')
      .font('Helvetica')
      .text('Platform', doc.page.width - 300, 490);

    // Add certificate number
    doc
      .fontSize(10)
      .fillColor('#999')
      .font('Helvetica')
      .text(`Certificate No: ${certificateNumber}`, 50, doc.page.height - 80);

    // Generate and add QR code
    if (verificationUrl) {
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
        const qrCodeBuffer = Buffer.from(
          qrCodeDataUrl.split(',')[1],
          'base64'
        );

        doc.image(qrCodeBuffer, doc.page.width - 130, doc.page.height - 130, {
          width: 80,
          height: 80,
        });

        doc
          .fontSize(8)
          .fillColor('#999')
          .text('Scan to verify', doc.page.width - 130, doc.page.height - 45, {
            width: 80,
            align: 'center',
          });
      } catch (qrError) {
        console.error('QR code generation error:', qrError);
      }
    }

    // Finalize PDF
    doc.end();

    // Wait for stream to finish
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    return {
      url: `/uploads/certificates/${fileName}`,
      publicId: fileName,
      format: 'pdf',
      size: fs.statSync(filePath).size,
    };
  } catch (error) {
    console.error('Certificate generation error:', error);
    throw error;
  }
};

// ============================================
// GENERATE QR CODE
// ============================================
const generateQRCode = async (url) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(url);
    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR code generation error:', error);
    throw error;
  }
};

// ============================================
// VERIFY CERTIFICATE
// ============================================
const verifyCertificate = (certificateNumber, verificationCode) => {
  // Implement verification logic
  // This would typically check against database
  return {
    valid: true,
    certificateNumber,
    verifiedAt: new Date(),
  };
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
  generateCertificatePDF,
  generateQRCode,
  verifyCertificate,
};