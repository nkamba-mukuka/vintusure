import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PolicyForm from '../PolicyForm';
import { PolicyFormData } from '../../../types/policy';
import { AuthProvider } from '../../../contexts/AuthContext';
import { policyService } from '../../../lib/services/policyService';

// Mock the policy service
vi.mock('../../../lib/services/policyService', () => ({
    policyService: {
        create: vi.fn().mockResolvedValue({ id: 'test-policy-id' }),
        update: vi.fn().mockResolvedValue({ id: 'test-policy-id' }),
    },
}));

describe('PolicyForm', () => {
    const mockOnSuccess = vi.fn();
    const defaultProps = {
        onSuccess: mockOnSuccess,
        customerId: 'test-customer',
    };

    const mockPolicy: PolicyFormData = {
        type: 'comprehensive',
        customerId: 'test-customer',
        status: 'pending',
        vehicle: {
            registrationNumber: 'ABC123',
            make: 'Toyota',
            model: 'Camry',
            year: 2023,
            engineNumber: 'ENG123',
            chassisNumber: 'CHS123',
            value: 25000,
            usage: 'private',
        },
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        premium: {
            amount: 1000,
            currency: 'USD',
            paymentStatus: 'pending',
            nextPaymentDate: new Date(),
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders all form fields', () => {
        render(
            <AuthProvider>
                <PolicyForm {...defaultProps} />
            </AuthProvider>
        );

        // Check for presence of all form fields
        expect(screen.getByLabelText(/policy type/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/registration number/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/make/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/model/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/year/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/engine number/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/chassis number/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/value/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/usage/i)).toBeInTheDocument();
    });

    it('validates required fields', async () => {
        render(
            <AuthProvider>
                <PolicyForm {...defaultProps} />
            </AuthProvider>
        );

        // Try to submit empty form
        fireEvent.click(screen.getByRole('button', { name: /create policy/i }));

        // Check for validation messages
        await waitFor(() => {
            expect(screen.getByText(/registration number is required/i)).toBeInTheDocument();
            expect(screen.getByText(/make is required/i)).toBeInTheDocument();
            expect(screen.getByText(/model is required/i)).toBeInTheDocument();
        });
    });

    it('submits form with valid data', async () => {
        const user = userEvent.setup();

        render(
            <AuthProvider>
                <PolicyForm {...defaultProps} />
            </AuthProvider>
        );

        // Fill form fields
        await user.selectOptions(screen.getByLabelText(/policy type/i), 'comprehensive');
        await user.type(screen.getByLabelText(/registration number/i), mockPolicy.vehicle.registrationNumber);
        await user.type(screen.getByLabelText(/make/i), mockPolicy.vehicle.make);
        await user.type(screen.getByLabelText(/model/i), mockPolicy.vehicle.model);
        await user.type(screen.getByLabelText(/year/i), mockPolicy.vehicle.year.toString());
        await user.type(screen.getByLabelText(/engine number/i), mockPolicy.vehicle.engineNumber);
        await user.type(screen.getByLabelText(/chassis number/i), mockPolicy.vehicle.chassisNumber);
        await user.type(screen.getByLabelText(/value/i), mockPolicy.vehicle.value.toString());
        await user.selectOptions(screen.getByLabelText(/usage/i), mockPolicy.vehicle.usage);

        // Submit form
        await user.click(screen.getByRole('button', { name: /create policy/i }));

        // Verify form submission
        await waitFor(() => {
            expect(mockOnSuccess).toHaveBeenCalled();
        });
    });

    it('handles API errors gracefully', async () => {
        // Mock API error
        vi.mocked(policyService.create).mockRejectedValueOnce(new Error('API Error'));

        const user = userEvent.setup();

        render(
            <AuthProvider>
                <PolicyForm {...defaultProps} />
            </AuthProvider>
        );

        // Fill and submit form
        await user.selectOptions(screen.getByLabelText(/policy type/i), 'comprehensive');
        await user.type(screen.getByLabelText(/registration number/i), mockPolicy.vehicle.registrationNumber);
        // ... fill other required fields ...
        await user.click(screen.getByRole('button', { name: /create policy/i }));

        // Verify error handling
        await waitFor(() => {
            expect(screen.getByText(/error creating policy/i)).toBeInTheDocument();
        });
    });

    it('pre-fills form when editing existing policy', () => {
        render(
            <AuthProvider>
                <PolicyForm {...defaultProps} initialData={mockPolicy} />
            </AuthProvider>
        );

        // Verify form is pre-filled
        expect(screen.getByLabelText(/registration number/i)).toHaveValue(mockPolicy.vehicle.registrationNumber);
        expect(screen.getByLabelText(/make/i)).toHaveValue(mockPolicy.vehicle.make);
        expect(screen.getByLabelText(/model/i)).toHaveValue(mockPolicy.vehicle.model);
    });

    it('calculates premium correctly based on vehicle value', async () => {
        const user = userEvent.setup();

        render(
            <AuthProvider>
                <PolicyForm {...defaultProps} />
            </AuthProvider>
        );

        // Enter vehicle value
        await user.type(screen.getByLabelText(/value/i), '50000');

        // Verify premium calculation
        await waitFor(() => {
            const premiumField = screen.getByLabelText(/premium amount/i);
            expect(premiumField).toHaveValue('2500'); // Assuming 5% premium rate
        });
    });
}); 