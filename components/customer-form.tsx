"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

export interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  billingAddressLine1: string;
  billingAddressLine2: string;
  billingCity: string;
  billingState: string;
  billingCountry: string;
  billingPostalCode: string;
}

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void;
  isSubmitting?: boolean;
}

export function CustomerForm({ onSubmit, isSubmitting = false }: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    billingAddressLine1: "123 Main Street",
    billingAddressLine2: "Apt 4B",
    billingCity: "New York",
    billingState: "NY",
    billingCountry: "USA",
    billingPostalCode: "10001",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof CustomerFormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof CustomerFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="mb-4 text-xl font-semibold text-zinc-900">Contact Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={handleChange("firstName")}
              className={errors.firstName ? "border-red-500" : ""}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={handleChange("lastName")}
              className={errors.lastName ? "border-red-500" : ""}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange("phone")}
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-zinc-900">Billing Address</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="billingAddressLine1">Address Line 1</Label>
            <Input
              id="billingAddressLine1"
              value={formData.billingAddressLine1}
              onChange={handleChange("billingAddressLine1")}
            />
          </div>
          <div>
            <Label htmlFor="billingAddressLine2">Address Line 2</Label>
            <Input
              id="billingAddressLine2"
              value={formData.billingAddressLine2}
              onChange={handleChange("billingAddressLine2")}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="billingCity">City</Label>
              <Input
                id="billingCity"
                value={formData.billingCity}
                onChange={handleChange("billingCity")}
              />
            </div>
            <div>
              <Label htmlFor="billingState">State</Label>
              <Input
                id="billingState"
                value={formData.billingState}
                onChange={handleChange("billingState")}
              />
            </div>
            <div>
              <Label htmlFor="billingPostalCode">Postal Code</Label>
              <Input
                id="billingPostalCode"
                value={formData.billingPostalCode}
                onChange={handleChange("billingPostalCode")}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="billingCountry">Country</Label>
            <Input
              id="billingCountry"
              value={formData.billingCountry}
              onChange={handleChange("billingCountry")}
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Processing..." : "Continue to Payment"}
      </Button>
    </form>
  );
}

