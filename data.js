// Sample drug data for barcode scanning
const DRUG_DATABASE = {
    '1234567890': {
        drug_name: 'Paracetamol',
        brand: 'Biogesic',
        category: 'tablet',
        strength: '500mg',
        expiry_date: '2025-12-30'
    },
    '9876543210': {
        drug_name: 'Amoxicillin',
        brand: 'Amoxil',
        category: 'capsule',
        strength: '250mg',
        expiry_date: '2026-06-15'
    },
    '1111222233': {
        drug_name: 'Ibuprofen',
        brand: 'Advil',
        category: 'tablet',
        strength: '200mg',
        expiry_date: '2025-08-20'
    },
    '4444555566': {
        drug_name: 'Cetirizine',
        brand: 'Zyrtec',
        category: 'tablet',
        strength: '10mg',
        expiry_date: '2026-03-10'
    },
    '7777888899': {
        drug_name: 'Lagundi Syrup',
        brand: 'Ascof',
        category: 'syrup',
        strength: '120ml',
        expiry_date: '2025-11-25'
    },
    '2222333344': {
        drug_name: 'Mefenamic Acid',
        brand: 'Ponstan',
        category: 'capsule',
        strength: '250mg',
        expiry_date: '2025-09-18'
    },
    '5555666677': {
        drug_name: 'Loperamide',
        brand: 'Imodium',
        category: 'capsule',
        strength: '2mg',
        expiry_date: '2026-01-30'
    },
    '8888999900': {
        drug_name: 'Omeprazole',
        brand: 'Losec',
        category: 'capsule',
        strength: '20mg',
        expiry_date: '2025-10-12'
    }
};

// Sample student data
const STUDENTS_DATABASE = [
    { id: 'DSSC-2021-001', name: 'Juan Carlos Santos', course: 'BSIT', year: 3 },
    { id: 'DSSC-2021-002', name: 'Maria Elena Rodriguez', course: 'BSBA', year: 2 },
    { id: 'DSSC-2021-003', name: 'Jose Miguel Reyes', course: 'BSCS', year: 4 },
    { id: 'DSSC-2021-004', name: 'Ana Sofia Cruz', course: 'BSN', year: 1 },
    { id: 'DSSC-2021-005', name: 'Carlos Eduardo Flores', course: 'BSIT', year: 2 },
    { id: 'DSSC-2021-006', name: 'Isabella Marie Torres', course: 'BSBA', year: 3 },
    { id: 'DSSC-2021-007', name: 'Diego Antonio Luna', course: 'BSCS', year: 1 },
    { id: 'DSSC-2021-008', name: 'Sofia Carmen Mendoza', course: 'BSN', year: 4 },
    { id: 'DSSC-2021-009', name: 'Rafael Miguel Garcia', course: 'BSIT', year: 2 },
    { id: 'DSSC-2021-010', name: 'Valentina Isabel Castro', course: 'BSBA', year: 3 }
];

// Sample initial inventory data
const INITIAL_INVENTORY = [
    {
        id: 'drug_1',
        drug_name: 'Paracetamol',
        brand: 'Biogesic',
        category: 'tablet',
        strength: '500mg',
        quantity: 50,
        expiry_date: '2025-06-15',
        date_added: '2024-01-15'
    },
    {
        id: 'drug_2',
        drug_name: 'Amoxicillin',
        brand: 'Amoxil',
        category: 'capsule',
        strength: '250mg',
        quantity: 3,
        expiry_date: '2025-01-20',
        date_added: '2024-01-10'
    },
    {
        id: 'drug_3',
        drug_name: 'Ibuprofen',
        brand: 'Advil',
        category: 'tablet',
        strength: '200mg',
        quantity: 25,
        expiry_date: '2026-03-10',
        date_added: '2024-01-12'
    },
    {
        id: 'drug_4',
        drug_name: 'Cetirizine',
        brand: 'Zyrtec',
        category: 'tablet',
        strength: '10mg',
        quantity: 2,
        expiry_date: '2025-08-20',
        date_added: '2024-01-08'
    }
];

// Activity log types
const ACTIVITY_TYPES = {
    DRUG_ADDED: 'Drug Added',
    DRUG_UPDATED: 'Drug Updated',
    DRUG_DISPOSED: 'Drug Disposed',
    TRANSACTION_RECORDED: 'Transaction Recorded',
    PROFILE_UPDATED: 'Profile Updated'
};