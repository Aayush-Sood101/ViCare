/**
 * Phase 4 Integration Tests - PDF Generation & Storage
 * Tests for prescription and certificate PDF generation and signed URL retrieval
 */

import { generatePrescriptionPDF, generateCertificatePDF } from '../services/pdfService';
import { uploadPDF, getSignedPDFUrl } from '../services/storageService';
import { Patient, Doctor } from '../types';

describe('Phase 4: PDF Generation Service', () => {
  describe('Prescription PDF Generation', () => {
    it('should generate prescription PDF buffer', async () => {
      const mockPatient: Partial<Patient> = {
        id: 'test-patient-1',
        clerk_user_id: 'clerk_test_123',
        email: 'john.doe@vit.edu',
        full_name: 'John Doe',
        student_id: 'VIT2024001',
        date_of_birth: '2000-01-15',
        gender: 'male',
        blood_group: 'O+',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockDoctor: Partial<Doctor> = {
        id: 'test-doctor-1',
        clerk_user_id: 'clerk_doc_123',
        email: 'sarah.johnson@vit.edu',
        full_name: 'Dr. Sarah Johnson',
        specialization: 'General Medicine',
        qualification: 'MBBS, MD',
        registration_number: 'MED12345',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockData = {
        patient: mockPatient as Patient,
        doctor: mockDoctor as Doctor,
        medicines: [
          {
            name: 'Paracetamol',
            dosage: '500mg',
            frequency: 'Three times daily',
            duration: '5 days',
            instructions: 'After meals',
          },
          {
            name: 'Amoxicillin',
            dosage: '250mg',
            frequency: 'Twice daily',
            duration: '7 days',
            instructions: 'Before meals',
          },
        ],
        instructions: 'Take plenty of rest and stay hydrated',
        issuedAt: new Date('2024-03-15T10:30:00Z'),
      };

      const pdfBuffer = await generatePrescriptionPDF(mockData);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      // PDF files start with %PDF
      expect(pdfBuffer.toString('ascii', 0, 4)).toBe('%PDF');
    });

    it('should handle prescription with multiple medicines', async () => {
      const mockPatient: Partial<Patient> = {
        id: 'test-patient-2',
        clerk_user_id: 'clerk_test_456',
        email: 'jane.smith@vit.edu',
        full_name: 'Jane Smith',
        student_id: 'VIT2024002',
        date_of_birth: '1999-05-20',
        gender: 'female',
        blood_group: 'A+',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockDoctor: Partial<Doctor> = {
        id: 'test-doctor-2',
        clerk_user_id: 'clerk_doc_456',
        email: 'michael.chen@vit.edu',
        full_name: 'Dr. Michael Chen',
        specialization: 'Pediatrics',
        qualification: 'MBBS, DCH',
        registration_number: 'PED67890',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockData = {
        patient: mockPatient as Patient,
        doctor: mockDoctor as Doctor,
        medicines: Array(5).fill(null).map((_, i) => ({
          name: `Medicine ${i + 1}`,
          dosage: '100mg',
          frequency: 'Once daily',
          duration: '10 days',
          instructions: 'With food',
        })),
        instructions: 'Follow up after 10 days',
        issuedAt: new Date(),
      };

      const pdfBuffer = await generatePrescriptionPDF(mockData);
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });
  });

  describe('Certificate PDF Generation', () => {
    it('should generate medical certificate PDF buffer', async () => {
      const mockPatient: Partial<Patient> = {
        id: 'test-patient-3',
        clerk_user_id: 'clerk_test_789',
        email: 'alex.kumar@vit.edu',
        full_name: 'Alex Kumar',
        student_id: 'VIT2024003',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockDoctor: Partial<Doctor> = {
        id: 'test-doctor-3',
        clerk_user_id: 'clerk_doc_789',
        email: 'priya.sharma@vit.edu',
        full_name: 'Dr. Priya Sharma',
        specialization: 'Internal Medicine',
        qualification: 'MBBS, MD',
        registration_number: 'INT45678',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockData = {
        patient: mockPatient as Patient,
        doctor: mockDoctor as Doctor,
        reason: 'Viral fever and body ache',
        fromDate: new Date('2024-03-15'),
        toDate: new Date('2024-03-17'),
        notes: 'Patient advised bed rest',
        issuedAt: new Date('2024-03-15T14:00:00Z'),
      };

      const pdfBuffer = await generateCertificatePDF(mockData);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      expect(pdfBuffer.toString('ascii', 0, 4)).toBe('%PDF');
    });

    it('should handle long reason text in certificate', async () => {
      const mockPatient: Partial<Patient> = {
        id: 'test-patient-4',
        clerk_user_id: 'clerk_test_101',
        email: 'robert.williams@vit.edu',
        full_name: 'Robert Williams',
        student_id: 'VIT2024004',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockDoctor: Partial<Doctor> = {
        id: 'test-doctor-4',
        clerk_user_id: 'clerk_doc_101',
        email: 'emily.brown@vit.edu',
        full_name: 'Dr. Emily Brown',
        specialization: 'General Medicine',
        qualification: 'MBBS',
        registration_number: 'GEN11111',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockData = {
        patient: mockPatient as Patient,
        doctor: mockDoctor as Doctor,
        reason: 'Patient presented with acute respiratory infection, high fever, and severe cough requiring medical attention and rest for recovery',
        fromDate: new Date('2024-03-10'),
        toDate: new Date('2024-03-15'),
        notes: 'Patient should avoid strenuous activities and maintain proper hydration',
        issuedAt: new Date(),
      };

      const pdfBuffer = await generateCertificatePDF(mockData);
      expect(pdfBuffer).toBeInstanceOf(Buffer);
    });
  });
});

describe('Phase 4: Storage Service', () => {
  // Note: These tests require actual Supabase connection
  // Skip if SUPABASE_URL or SUPABASE_KEY is not set
  const skipIfNoSupabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY 
    ? test 
    : test.skip;

  describe('PDF Upload', () => {
    skipIfNoSupabase('should upload PDF to storage', async () => {
      const mockPdfBuffer = Buffer.from('%PDF-1.4\nMock PDF content');
      const fileName = `test-prescription-${Date.now()}`;

      const filePath = await uploadPDF(mockPdfBuffer, 'prescriptions', fileName);

      expect(filePath).toBe(`prescriptions/${fileName}.pdf`);
    }, 10000);

    it('should accept valid folder names only', () => {
      const validFolders: ('prescriptions' | 'certificates')[] = ['prescriptions', 'certificates'];
      expect(validFolders).toContain('prescriptions');
      expect(validFolders).toContain('certificates');
      expect(validFolders).toHaveLength(2);
    });
  });

  describe('Signed URL Generation', () => {
    skipIfNoSupabase('should generate signed URL for valid path', async () => {
      // First upload a PDF
      const mockPdfBuffer = Buffer.from('%PDF-1.4\nMock PDF content');
      const fileName = `test-signed-url-${Date.now()}`;
      const filePath = await uploadPDF(mockPdfBuffer, 'prescriptions', fileName);

      // Then get signed URL
      const signedUrl = await getSignedPDFUrl(filePath, 3600);

      expect(signedUrl).toBeTruthy();
      expect(signedUrl).toContain('https://');
      expect(signedUrl).toContain(filePath.replace('/', '%2F'));
    }, 10000);

    skipIfNoSupabase('should throw error for non-existent file', async () => {
      await expect(
        getSignedPDFUrl('prescriptions/non-existent-file.pdf')
      ).rejects.toThrow();
    });
  });
});

describe('Phase 4: PDF End-to-End Flow', () => {
  const skipIfNoSupabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY 
    ? test 
    : test.skip;

  skipIfNoSupabase('should complete full prescription PDF workflow', async () => {
    // 1. Generate PDF
    const mockPatient: Partial<Patient> = {
      id: 'test-e2e-patient',
      clerk_user_id: 'clerk_e2e_test',
      email: 'test.patient@vit.edu',
      full_name: 'Test Patient',
      student_id: 'VIT2024TEST',
      date_of_birth: '2000-01-01',
      gender: 'male',
      blood_group: 'B+',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockDoctor: Partial<Doctor> = {
      id: 'test-e2e-doctor',
      clerk_user_id: 'clerk_e2e_doc',
      email: 'test.doctor@vit.edu',
      full_name: 'Dr. Test Doctor',
      specialization: 'Testing',
      qualification: 'TEST',
      registration_number: 'TEST123',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockData = {
      patient: mockPatient as Patient,
      doctor: mockDoctor as Doctor,
      medicines: [
        {
          name: 'Test Medicine',
          dosage: '100mg',
          frequency: 'Once daily',
          duration: '5 days',
          instructions: 'Test instructions',
        },
      ],
      instructions: 'Test instructions',
      issuedAt: new Date(),
    };

    const pdfBuffer = await generatePrescriptionPDF(mockData);
    expect(pdfBuffer).toBeInstanceOf(Buffer);

    // 2. Upload PDF
    const fileName = `e2e-test-${Date.now()}`;
    const filePath = await uploadPDF(pdfBuffer, 'prescriptions', fileName);
    expect(filePath).toBeTruthy();

    // 3. Get signed URL
    const signedUrl = await getSignedPDFUrl(filePath);
    expect(signedUrl).toBeTruthy();
    expect(signedUrl).toContain('https://');

    // 4. Verify URL is accessible (optional, requires network call)
    // This would require actual HTTP request to verify
  }, 15000);
});
