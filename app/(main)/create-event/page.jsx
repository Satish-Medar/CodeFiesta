/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { State, City } from "country-state-city";
import { CalendarIcon, Loader2, Sparkles, ImageIcon, MapPin, Users, Ticket } from "lucide-react";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

import UnsplashImagePicker from "@/components/unsplash-image-picker";
import AIEventCreator from "./_components/ai-event-creator";
import UpgradeModal from "@/components/upgrade-modal";
import { CATEGORIES } from "@/lib/data";
import Image from "next/image";

// HH:MM in 24h
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const eventSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  subCategory: z.string().optional(),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  startTime: z.string().regex(timeRegex, "Start time must be HH:MM"),
  endTime: z.string().regex(timeRegex, "End time must be HH:MM"),
  locationType: z.enum(["physical", "online"]).default("physical"),
  venue: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  ticketType: z.enum(["free", "paid"]).default("free"),
  ticketPrice: z.number().optional(),
  coverImage: z.string().optional(),
  themeColor: z.string().default("#1e3a8a"),
});

export default function CreateEventPage() {
  const router = useRouter();
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("limit"); // "limit" or "color"

  // Check if user has Pro plan
  const { has } = useAuth();
  const hasPro = has?.({ plan: "pro" });

  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);
  const { mutate: createEvent, isLoading } = useConvexMutation(
    api.events.createEvent
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      locationType: "physical",
      ticketType: "free",
      capacity: 50,
      themeColor: "#1e3a8a",
      category: "",
      subCategory: "",
      state: "",
      city: "",
      startTime: "",
      endTime: "",
    },
  });

  const themeColor = watch("themeColor");
  const ticketType = watch("ticketType");
  const selectedState = watch("state");
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const coverImage = watch("coverImage");
  const category = watch("category");

  const activeCategoryObj = useMemo(() => {
    return CATEGORIES.find((c) => c.id === category);
  }, [category]);
  const hasSubCategories = activeCategoryObj?.subCategories?.length > 0;

  const indianStates = useMemo(() => State.getStatesOfCountry("IN"), []);
  const cities = useMemo(() => {
    if (!selectedState) return [];
    const st = indianStates.find((s) => s.name === selectedState);
    if (!st) return [];
    return City.getCitiesOfState("IN", st.isoCode);
  }, [selectedState, indianStates]);

  // Color presets - show all for Pro, only default for Free
  const colorPresets = [
    "#1e3a8a", // Default color (always available)
    ...(hasPro ? ["#4c1d95", "#065f46", "#92400e", "#7f1d1d", "#831843"] : []),
  ];

  const handleColorClick = (color) => {
    // If not default color and user doesn't have Pro
    if (color !== "#1e3a8a" && !hasPro) {
      setUpgradeReason("color");
      setShowUpgradeModal(true);
      return;
    }
    setValue("themeColor", color);
  };

  const combineDateTime = (date, time) => {
    if (!date || !time) return null;
    const [hh, mm] = time.split(":").map(Number);
    const d = new Date(date);
    d.setHours(hh, mm, 0, 0);
    return d;
  };

  const onSubmit = async (data) => {
    try {
      const start = combineDateTime(data.startDate, data.startTime);
      const end = combineDateTime(data.endDate, data.endTime);

      if (!start || !end) {
        toast.error("Please select both date and time for start and end.");
        return;
      }
      if (end.getTime() <= start.getTime()) {
        toast.error("End date/time must be after start date/time.");
        return;
      }

      // Check event limit for Free users
      if (!hasPro && currentUser?.freeEventsCreated >= 5) {
        setUpgradeReason("limit");
        setShowUpgradeModal(true);
        return;
      }

      // Check if trying to use custom color without Pro
      if (data.themeColor !== "#1e3a8a" && !hasPro) {
        setUpgradeReason("color");
        setShowUpgradeModal(true);
        return;
      }

      await createEvent({
        title: data.title,
        description: data.description,
        category: data.category,
        subCategory: data.subCategory || undefined,
        tags: [data.category],
        startDate: start.getTime(),
        endDate: end.getTime(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locationType: data.locationType,
        venue: data.venue || undefined,
        address: data.address || undefined,
        city: data.city,
        state: data.state || undefined,
        country: "India",
        capacity: data.capacity,
        ticketType: data.ticketType,
        ticketPrice: data.ticketPrice || undefined,
        coverImage: data.coverImage || undefined,
        themeColor: data.themeColor,
        hasPro,
      });

      toast.success("Event created successfully! 🎉");
      router.push("/my-events");
    } catch (error) {
      toast.error(error.message || "Failed to create event");
    }
  };

  const handleAIGenerate = (generatedData) => {
    const options = { shouldValidate: true, shouldDirty: true };
    setValue("title", generatedData.title, options);
    setValue("description", generatedData.description, options);
    setValue("category", generatedData.category, options);
    if (generatedData.subCategory) {
      setValue("subCategory", generatedData.subCategory, options);
    }
    setValue("capacity", generatedData.suggestedCapacity, options);
    setValue("ticketType", generatedData.suggestedTicketType, options);
    toast.success("Event details filled! Customize as needed.");
  };
  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-zinc-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 md:pt-16">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row justify-between mb-8 pb-6 border-b border-border items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Create New Event</h1>
            <p className="text-muted-foreground mt-1 text-sm">Fill in the details below to publish your event.</p>
            {!hasPro && (
              <div className="mt-3">
                <Badge variant="outline" className="font-normal text-muted-foreground bg-white dark:bg-zinc-900">
                  Free Plan: {currentUser?.freeEventsCreated || 0}/5 events created
                </Badge>
              </div>
            )}
          </div>
          <AIEventCreator onEventGenerated={handleAIGenerate} />
        </div>

        {/* Main Form Container */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 bg-white dark:bg-zinc-900 p-6 sm:p-10 rounded-xl border border-border shadow-sm">
          
          {/* Title */}
          <div className="space-y-3">
            <Label htmlFor="title" className="text-base font-semibold">Event Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Give your event a clear, memorable name"
              className="h-12 text-lg"
            />
            {errors.title && (
              <p className="text-sm text-red-500 font-medium">{errors.title.message}</p>
            )}
          </div>

          <div className="h-px bg-border w-full" />

          {/* Cover Image Upload */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
              Event Cover Image
            </Label>
            <p className="text-sm text-muted-foreground">A great cover image helps your event stand out.</p>
            <div
              className={`w-full rounded-lg overflow-hidden flex items-center justify-center cursor-pointer border-2 border-dashed transition-colors ${coverImage ? 'border-border aspect-[21/9]' : 'border-muted-foreground/30 hover:border-primary/50 aspect-[21/9] bg-muted/30'}`}
              onClick={() => setShowImagePicker(true)}
            >
              {coverImage ? (
                <Image
                  src={coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                  width={800}
                  height={400}
                  priority
                />
              ) : (
                <div className="text-center p-6 flex flex-col items-center">
                  <div className="w-12 h-12 bg-background border border-border rounded-md flex items-center justify-center mb-3">
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Click to select an image</span>
                  <span className="text-xs text-muted-foreground mt-1">Unsplash integration available</span>
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-border w-full" />

          {/* Date & Time */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-muted-foreground" />
              Date & Time
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Starts At <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        {startDate ? format(startDate, "PPP") : "Select date"}
                        <CalendarIcon className="ml-auto w-4 h-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => setValue("startDate", date)}
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    {...register("startTime")}
                    className="w-[120px]"
                  />
                </div>
                {(errors.startDate || errors.startTime) && (
                  <p className="text-sm text-red-500 font-medium">
                    {errors.startDate?.message || errors.startTime?.message}
                  </p>
                )}
              </div>

              {/* End */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Ends At <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        {endDate ? format(endDate, "PPP") : "Select date"}
                        <CalendarIcon className="ml-auto w-4 h-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => setValue("endDate", date)}
                        disabled={(date) => date < (startDate || new Date())}
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    {...register("endTime")}
                    className="w-[120px]"
                  />
                </div>
                {(errors.endDate || errors.endTime) && (
                  <p className="text-sm text-red-500 font-medium">
                    {errors.endDate?.message || errors.endTime?.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="h-px bg-border w-full" />

          {/* Classification & Theme */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <h3 className="text-lg font-semibold flex items-center gap-2">
                 Categorization
               </h3>
               
               <div className="space-y-3">
                 <Label className="text-sm font-medium">Event Category <span className="text-red-500">*</span></Label>
                 <Controller
                   control={control}
                   name="category"
                   render={({ field }) => (
                     <Select value={field.value} onValueChange={field.onChange}>
                       <SelectTrigger className="w-full">
                         <SelectValue placeholder="Select a category" />
                       </SelectTrigger>
                       <SelectContent className="max-h-[300px]">
                         {CATEGORIES.map((cat) => (
                           <SelectItem key={cat.id} value={cat.id} className="cursor-pointer">
                             <span className="flex items-center gap-2 text-sm">
                               <span>{cat.icon}</span> {cat.label}
                             </span>
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   )}
                 />
                 {errors.category && (
                   <p className="text-sm text-red-500 font-medium">{errors.category.message}</p>
                 )}
               </div>

               {hasSubCategories && (
                 <div className="space-y-3">
                   <Label className="text-sm font-medium">Sub-Category (Optional)</Label>
                   <Controller
                     control={control}
                     name="subCategory"
                     render={({ field }) => (
                       <Select value={field.value} onValueChange={field.onChange}>
                         <SelectTrigger className="w-full">
                           <SelectValue placeholder="Select sub-category" />
                         </SelectTrigger>
                         <SelectContent className="max-h-[300px]">
                           {activeCategoryObj.subCategories.map((sub) => (
                             <SelectItem key={sub.id} value={sub.id} className="cursor-pointer">
                               {sub.label}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     )}
                   />
                 </div>
               )}
            </div>

             <div className="space-y-6">
               <h3 className="text-lg font-semibold flex items-center gap-2 justify-between">
                 <span>Theme Color</span>
                 {!hasPro && (
                   <Badge variant="outline" className="text-xs bg-slate-100 dark:bg-zinc-800 font-normal">
                     Pro Feature
                   </Badge>
                 )}
               </h3>
               
               <div className="space-y-3">
                 <Label className="text-sm font-medium text-muted-foreground">Select a primary color for your event page.</Label>
                 <div className="flex gap-2 flex-wrap">
                   {colorPresets.map((color) => (
                     <button
                       key={color}
                       type="button"
                       className={`w-8 h-8 rounded-full border border-border transition-all ${
                         !hasPro && color !== "#1e3a8a"
                           ? "opacity-30 cursor-not-allowed"
                           : "hover:scale-105"
                       }`}
                       style={{
                         backgroundColor: color,
                         ringWidth: themeColor === color ? '2px' : '0px',
                         ringColor: themeColor === color ? 'currentColor' : 'transparent',
                         ringOffsetWidth: '2px',
                         ringOffsetColor: 'var(--background)'
                       }}
                       onClick={() => handleColorClick(color)}
                       title={!hasPro && color !== "#1e3a8a" ? "Upgrade to Pro for custom colors" : ""}
                     />
                   ))}
                 </div>
               </div>
            </div>
          </div>

          <div className="h-px bg-border w-full" />

          {/* Location */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              Location Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">State</Label>
                <Controller
                  control={control}
                  name="state"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        setValue("city", "");
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {indianStates.map((s) => (
                          <SelectItem key={s.isoCode} value={s.name}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">City <span className="text-red-500">*</span></Label>
                <Controller
                  control={control}
                  name="city"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!selectedState}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={selectedState ? "Select city" : "Select state first"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((c) => (
                          <SelectItem key={c.name} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.city && (
                  <p className="text-sm text-red-500 font-medium">{errors.city.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Venue Link / Map URL (Optional)</Label>
                <Input
                  {...register("venue")}
                  placeholder="https://maps.google.com/..."
                  type="url"
                />
                {errors.venue && (
                  <p className="text-sm text-red-500 font-medium">{errors.venue.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Full Address (Optional)</Label>
                <Input
                  {...register("address")}
                  placeholder="Building, Street, Landmark"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-border w-full" />

          {/* Description */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">About This Event <span className="text-red-500">*</span></Label>
            <p className="text-sm text-muted-foreground">Provide details about what attendees can expect, schedule, speakers, etc.</p>
            <Textarea
              {...register("description")}
              placeholder="Detailed description..."
              rows={6}
              className="resize-y"
            />
            {errors.description && (
              <p className="text-sm text-red-500 font-medium">{errors.description.message}</p>
            )}
          </div>

          <div className="h-px bg-border w-full" />

          {/* Ticketing & Capacity */}
          <div className="space-y-6">
             <h3 className="text-lg font-semibold flex items-center gap-2">
                <Ticket className="w-5 h-5 text-muted-foreground" />
                Ticketing & Capacity
              </h3>
             <div className="grid sm:grid-cols-2 gap-8">
               <div className="space-y-4">
                 <Label className="text-sm font-medium">Admission Type</Label>
                 <div className="flex items-center gap-6 p-3 rounded-md border border-border bg-muted/20">
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input
                       type="radio"
                       value="free"
                       {...register("ticketType")}
                       className="w-4 h-4 text-primary"
                     />
                     <span className="text-sm font-medium">Free</span>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input
                       type="radio"
                       value="paid"
                       {...register("ticketType")}
                       className="w-4 h-4 text-primary"
                     />
                     <span className="text-sm font-medium">Paid</span>
                   </label>
                 </div>

                 {ticketType === "paid" && (
                   <div className="pt-2">
                     <Label className="text-sm font-medium mb-2 block">Ticket Price (₹)</Label>
                     <Input
                       type="number"
                       min="1"
                       placeholder="Price"
                       {...register("ticketPrice", { valueAsNumber: true })}
                     />
                     {errors.ticketPrice && (
                       <p className="text-sm text-red-500 font-medium mt-1">{errors.ticketPrice.message}</p>
                     )}
                   </div>
                 )}
               </div>

               <div className="space-y-4">
                 <Label className="text-sm font-medium">Maximum Capacity <span className="text-red-500">*</span></Label>
                 <Input
                   type="number"
                   min="1"
                   {...register("capacity", { valueAsNumber: true })}
                   placeholder="e.g. 100"
                 />
                 <p className="text-xs text-muted-foreground mt-1">Maximum number of people who can register</p>
                 {errors.capacity && (
                   <p className="text-sm text-red-500 font-medium">{errors.capacity.message}</p>
                 )}
               </div>
             </div>
          </div>

          {/* Submit */}
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground order-2 sm:order-1">
              By publishing, you agree to the Terms of Service.
            </p>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-8 h-12 text-base font-semibold order-1 sm:order-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Publishing...
                </>
              ) : (
                "Publish Event"
              )}
            </Button>
          </div>

        </form>
      </div>

      {/* Unsplash Picker Modal */}
      {showImagePicker && (
        <UnsplashImagePicker
          isOpen={showImagePicker}
          onClose={() => setShowImagePicker(false)}
          onSelect={(url) => {
            setValue("coverImage", url);
            setShowImagePicker(false);
          }}
        />
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger={upgradeReason}
      />
    </div>
  );
}
