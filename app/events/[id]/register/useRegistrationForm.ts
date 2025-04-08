import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Event } from "@/app/typings/events/typings";
import { useAuth } from "@/app/context/authContext";

export function useRegistrationForm(eventId: string) {
  const { user } = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [formFields, setFormFields] = useState<any[]>([]);
  const [selectedFormType, setSelectedFormType] = useState<string>("");
  const [registrationSchema, setRegistrationSchema] = useState<any>(z.object({}));

  // Create form with dynamic validation
  const form = useForm<any>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {},
    mode: "onChange"
  });

  // Fetch event data including registration forms
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) throw new Error("Failed to fetch event");
        
        const res = await response.json();
        const eventData = res.event;
        setEvent(eventData);
        
        // Set the default registration form
        const defaultForm = eventData.registrationForms.find((f: any) => f.isDefault) || 
                           eventData.registrationForms[0];
        
        if (defaultForm) {
          setSelectedFormType(defaultForm.id);
          updateFormFields(defaultForm);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  // Update form fields when selected form type changes
  useEffect(() => {
    if (event && selectedFormType) {
      const selectedForm = event.registrationForms.find((f: any) => f.id === selectedFormType);
      if (selectedForm) {
        updateFormFields(selectedForm);
      }
    }
  }, [selectedFormType, event]);


  // Update form fields and validation schema
  const updateFormFields = (formData: any) => {
    const fields = formData.formFields || [];
    setFormFields(fields);
    
    // Create dynamic schema based on form fields
    const schemaObj: Record<string, any> = {};
    
    // Initialize default values for all fields
    const defaultValues: Record<string, any> = {};
    
    // Helper function to check if a field is related to user's name
    const isNameField = (fieldLabel: string): boolean => {
      const nameLikeTerms = ['name', 'full name', 'first name', 'last name'];
      return nameLikeTerms.some(term => 
        fieldLabel.toLowerCase().includes(term.toLowerCase()));
    };
    
    // Helper function to check if a field is related to user's email
    const isEmailField = (fieldLabel: string, fieldType: string): boolean => {
      return fieldType === 'email' || 
        fieldLabel.toLowerCase().includes('email');
    };
    
    fields.forEach((field: any) => {
      // Create schema based on field type first
      let fieldSchema: any;
      
      // Special validations for different field types
      if (field.type === "email") {
        if (field.required) {
          fieldSchema = z.string().min(1, `${field.label} is required`).email(`Please enter a valid email address`);
        } else {
          fieldSchema = z.string().email(`Please enter a valid email address`).optional();
        }
        
        // Pre-fill with user's email if field appears to be an email field
        defaultValues[field.label] = isEmailField(field.label, field.type) && user?.email 
          ? user.email 
          : "";
          
      } else if (field.type === "number") {
        if (field.required) {
          fieldSchema = z.string().min(1, `${field.label} is required`).refine(val => !isNaN(Number(val)), "Please enter a valid number");
        } else {
          fieldSchema = z.string().refine(val => val === '' || !isNaN(Number(val)), "Please enter a valid number").optional();
        }
        defaultValues[field.label] = "";
        
      } else if (field.type === "checkbox") {
        if (field.required) {
          fieldSchema = z.boolean().refine(val => val === true, `${field.label} is required`);
        } else {
          fieldSchema = z.boolean().optional();
        }
        defaultValues[field.label] = false;
        
      } else {
        // Default for text fields and others
        if (field.required) {
          fieldSchema = z.string().min(1, `${field.label} is required`);
        } else {
          fieldSchema = z.string().optional();
        }
        
        // Pre-fill with user's name if field appears to be a name field
        defaultValues[field.label] = isNameField(field.label) && user?.name 
          ? user.name 
          : "";
      }
      
      schemaObj[field.label] = fieldSchema;
    });
    
    setRegistrationSchema(z.object(schemaObj));
    
    // Reset form with new default values
    form.reset(defaultValues);
  };

  // Form submission handler
  const onSubmit = async (data: any) => {
    if (!user) {
      alert("You must be logged in to register");
      return;
    }

    try {
      // Submit registration
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          registrationFormId: selectedFormType,
          userId: user._id,
          formData: data,
          registrationDate: new Date(),
          status: "pending",
          attendanceStatus: "registered",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to register");
      }

      alert("Registration successful!");
      // router.push(`/events/${eventId}/confirmation`);
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again." + error);
    }
  };

  return {
    form,
    onSubmit,
    formFields,
    event,
    selectedFormType,
    setSelectedFormType
  };
}