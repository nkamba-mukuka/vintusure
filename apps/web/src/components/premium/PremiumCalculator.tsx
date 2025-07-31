
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PremiumCalculationInput, PremiumBreakdown, premiumService } from '@/lib/services/premiumService';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2Icon } from 'lucide-react';

const premiumCalculatorSchema = z.object({
    vehicleValue: z.number().min(1, 'Vehicle value must be greater than 0'),
    vehicleType: z.enum(['car', 'truck', 'motorcycle'] as const),
    usage: z.enum(['private', 'commercial'] as const),
    coverageType: z.enum(['comprehensive', 'third_party'] as const),
    driverAge: z.number().min(18, 'Driver must be at least 18 years old').optional(),
    claimHistory: z.number().min(0, 'Claims history must be 0 or more').optional(),
    vehicleAge: z.number().min(0, 'Vehicle age must be 0 or more'),
});

interface PremiumCalculatorProps {
    onCalculate?: (breakdown: PremiumBreakdown) => void;
    defaultValues?: Partial<PremiumCalculationInput>;
}

export default function PremiumCalculator({
    onCalculate,
    defaultValues,
}: PremiumCalculatorProps) {
    const [isCalculating, setIsCalculating] = useState(false);
    const [breakdown, setBreakdown] = useState<PremiumBreakdown | null>(null);

    const form = useForm<PremiumCalculationInput>({
        resolver: zodResolver(premiumCalculatorSchema),
        defaultValues: {
            vehicleValue: defaultValues?.vehicleValue || 0,
            vehicleType: defaultValues?.vehicleType || 'car',
            usage: defaultValues?.usage || 'private',
            coverageType: defaultValues?.coverageType || 'comprehensive',
            driverAge: defaultValues?.driverAge,
            claimHistory: defaultValues?.claimHistory || 0,
            vehicleAge: defaultValues?.vehicleAge || 0,
        },
    });

    const onSubmit = async (data: PremiumCalculationInput) => {
        try {
            setIsCalculating(true);
            const result = await premiumService.calculatePremium(data);
            setBreakdown(result);
            onCalculate?.(result);
        } catch (error) {
            console.error('Error calculating premium:', error);
        } finally {
            setIsCalculating(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Premium Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="vehicleValue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vehicle Value</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="vehicleType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vehicle Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select vehicle type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="car">Car</SelectItem>
                                                <SelectItem value="truck">Truck</SelectItem>
                                                <SelectItem value="motorcycle">Motorcycle</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="usage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vehicle Usage</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select usage type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="private">Private</SelectItem>
                                                <SelectItem value="commercial">Commercial</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="coverageType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Coverage Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select coverage type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="comprehensive">Comprehensive</SelectItem>
                                                <SelectItem value="third_party">Third Party</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="driverAge"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Driver Age (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="claimHistory"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Previous Claims (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="vehicleAge"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vehicle Age (Years)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" disabled={isCalculating}>
                                {isCalculating && (
                                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Calculate Premium
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {breakdown && (
                <Card>
                    <CardHeader>
                        <CardTitle>Premium Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="text-sm font-medium text-gray-500">Base Premium</h4>
                            <p className="text-2xl font-semibold">
                                {premiumService.formatCurrency(breakdown.basePremium)}
                            </p>
                            <p className="text-sm text-gray-500">
                                {premiumService.calculatePercentage(breakdown.basePremium, breakdown.total)} of total
                            </p>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-gray-500">Taxes</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm">VAT</p>
                                    <p>{premiumService.formatCurrency(breakdown.taxes.vat)}</p>
                                </div>
                                <div>
                                    <p className="text-sm">Levy</p>
                                    <p>{premiumService.formatCurrency(breakdown.taxes.levy)}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-gray-500">Fees</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm">Admin Fee</p>
                                    <p>{premiumService.formatCurrency(breakdown.fees.adminFee)}</p>
                                </div>
                                <div>
                                    <p className="text-sm">Stamp Duty</p>
                                    <p>{premiumService.formatCurrency(breakdown.fees.stampDuty)}</p>
                                </div>
                            </div>
                        </div>

                        {Object.entries(breakdown.adjustments).length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Adjustments</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {breakdown.adjustments.ageDiscount && (
                                        <div>
                                            <p className="text-sm">Age Discount</p>
                                            <p className="text-green-600">
                                                -{premiumService.formatCurrency(breakdown.adjustments.ageDiscount)}
                                            </p>
                                        </div>
                                    )}
                                    {breakdown.adjustments.noClaimsBonus && (
                                        <div>
                                            <p className="text-sm">No Claims Bonus</p>
                                            <p className="text-green-600">
                                                -{premiumService.formatCurrency(breakdown.adjustments.noClaimsBonus)}
                                            </p>
                                        </div>
                                    )}
                                    {breakdown.adjustments.vehicleAgeLoading && (
                                        <div>
                                            <p className="text-sm">Vehicle Age Loading</p>
                                            <p className="text-red-600">
                                                +{premiumService.formatCurrency(breakdown.adjustments.vehicleAgeLoading)}
                                            </p>
                                        </div>
                                    )}
                                    {breakdown.adjustments.usageLoading && (
                                        <div>
                                            <p className="text-sm">Usage Loading</p>
                                            <p className="text-red-600">
                                                +{premiumService.formatCurrency(breakdown.adjustments.usageLoading)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="pt-4 border-t">
                            <h4 className="text-sm font-medium text-gray-500">Total Premium</h4>
                            <p className="text-3xl font-bold">
                                {premiumService.formatCurrency(breakdown.total)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 