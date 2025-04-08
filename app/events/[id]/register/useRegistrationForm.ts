import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Event } from "@/app/typings/events/typings";

export function useRegistrationForm(eventId: string) {
  const { data: session } = useSession();
  const router = useRouter();
  const [event, setEvent] = useState<Event>(null);
  const [formFields, setFormFields] = useState<any[]>([]);
  const [selectedFormType, setSelectedFormType] = useState<string>("");
  const [registrationSchema, setRegistrationSchema] = useState<any>(z.object({}));

  // Fetch event data including registration forms
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) throw new Error("Failed to fetch event");
        
        const res = await response.json();
        const eventData = res.event;
        setEvent(eventData);
        console.log("Event data:", eventData);
        
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
    setFormFields(formData.formFields || []);
    
    // Create dynamic schema based on form fields
    const schemaObj: Record<string, any> = {};
    
    formData.formFields?.forEach((field: any) => {
      let fieldSchema = z.string();
      
      if (field.required) {
        fieldSchema = fieldSchema.min(1, `${field.label} is required`);
      } else {
        fieldSchema = fieldSchema.optional();
      }
      
      // Special validations for different field types
      if (field.type === "email") {
        fieldSchema = field.required 
          ? z.string().min(1, `${field.label} is required`).email(`Please enter a valid email address`)
          : z.string().email(`Please enter a valid email address`).optional();
      } else if (field.type === "number") {
        fieldSchema = field.required
          ? z.string().min(1, `${field.label} is required`).refine(val => !isNaN(Number(val)), "Please enter a valid number")
          : z.string().refine(val => val === '' || !isNaN(Number(val)), "Please enter a valid number").optional();
      } else if (field.type === "checkbox") {
        fieldSchema = field.required
          ? z.boolean().refine(val => val === true, `${field.label} is required`)
          : z.boolean().optional();
      }
      
      schemaObj[field.label] = fieldSchema;
    });
    
    setRegistrationSchema(z.object(schemaObj));
  };

  // Create form with dynamic validation
  const form = useForm<any>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {},
    mode: "onChange"
  });

  // Form submission handler
  const onSubmit = async (data: any) => {
    if (!session?.user?.id) {
      alert("You must be logged in to register");
      return;
    }

    try {
      // Check if user has already registered
      const checkResponse = await fetch(`/api/events/${eventId}/registrations/check?userId=${session.user.id}`);
      const checkData = await checkResponse.json();
      
      if (checkData.isRegistered) {
        alert("You have already registered for this event");
        router.push(`/events/${eventId}`);
        return;
      }

      // Submit registration
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          registrationFormId: selectedFormType,
          userId: session.user.id,
          formData: data,
          registrationDate: new Date(),
          status: "pending", // Or "confirmed" depending on your workflow
          attendanceStatus: "registered",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to register");
      }

      alert("Registration successful!");
      router.push(`/events/${eventId}/confirmation`);
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
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