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
      if (!hasPro && currentUser?.freeEventsCreated >= 1) {
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
    setValue("capacity", generatedData.suggestedCapacity, options);
    setValue("ticketType", generatedData.suggestedTicketType, options);
    toast.success("Event details filled! Customize as needed.");
  };

  return (
    <div className="min-h-screen pb-20 relative">
      {/* Decorative Top Banner */}
      <div 
        className="absolute top-0 left-0 right-0 h-64 md:h-[22rem] transition-colors duration-500 rounded-b-[3rem] -z-10"
        style={{ backgroundColor: themeColor, opacity: 0.95 }}
      >
        <div className="absolute inset-0 bg-linear-to-b from-black/20 to-black/5 rounded-b-[3rem]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 md:pt-16">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row justify-between mb-10 text-white">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">Create Event</h1>
            {!hasPro && (
              <p className="text-white/90 mt-2 font-medium bg-black/20 inline-block px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                Free Plan: {currentUser?.freeEventsCreated || 0}/1 events created
              </p>
            )}
          </div>
          <AIEventCreator onEventGenerated={handleAIGenerate} />
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">
          {/* LEFT: Image + Theme */}
          <Card className="border-none shadow-xl bg-background overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
            <CardContent className="p-6 md:p-8 space-y-8">
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  Event Cover
                </Label>
                <div
                  className="aspect-square w-full rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer border-2 border-dashed bg-muted/50 hover:bg-muted hover:border-primary/50 transition-all duration-300 group"
                  onClick={() => setShowImagePicker(true)}
                >
                  {coverImage ? (
                    <Image
                      src={coverImage}
                      alt="Cover"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      width={500}
                      height={500}
                      priority
                    />
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground block">
                        Click or drag to upload
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Theme Color</Label>
                  {!hasPro && (
                    <Badge variant="secondary" className="text-xs gap-1 bg-purple-500/10 text-purple-600 border-purple-200">
                      <Sparkles className="w-3 h-3" />
                      Pro
                    </Badge>
                  )}
                </div>
                <div className="flex gap-3 flex-wrap">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-10 h-10 rounded-full border-2 transition-all shadow-sm ${
                        !hasPro && color !== "#1e3a8a"
                          ? "opacity-40 cursor-not-allowed grayscale"
                          : "hover:scale-110 hover:shadow-md"
                      }`}
                      style={{
                        backgroundColor: color,
                        borderColor: themeColor === color ? "currentColor" : "transparent",
                      }}
                      onClick={() => handleColorClick(color)}
                      title={
                        !hasPro && color !== "#1e3a8a"
                          ? "Upgrade to Pro for custom colors"
                          : ""
                      }
                    />
                  ))}
                  {!hasPro && (
                    <button
                      type="button"
                      onClick={() => {
                        setUpgradeReason("color");
                        setShowUpgradeModal(true);
                      }}
                      className="w-10 h-10 rounded-full border-2 border-dashed border-purple-300 flex items-center justify-center hover:border-purple-500 hover:bg-purple-50 transition-colors"
                      title="Unlock more colors with Pro"
                    >
                      <Sparkles className="w-4 h-4 text-purple-500" />
                    </button>
                  )}
                </div>
                {!hasPro && (
                  <p className="text-xs border-t pt-3 mt-4 text-muted-foreground">
                    Upgrade to Pro to unlock custom theme colors for your event pages.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* RIGHT: Form */}
          <Card className="border-none shadow-xl bg-background ring-1 ring-black/5 dark:ring-white/10">
            <CardContent className="p-6 md:p-10">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Title */}
                <div className="space-y-2">
                  <Input
                    {...register("title")}
                    placeholder="Give your event a memorable name"
                    className="text-3xl md:text-4xl font-bold bg-transparent border-none px-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground text-foreground rounded-none shadow-none"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 font-medium">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="h-px w-full bg-border/60" />

                {/* Date + Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Start */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                      <CalendarIcon className="w-4 h-4 text-primary" />
                      Start Date & Time
                    </Label>
                    <div className="grid grid-cols-[1fr_auto] gap-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-muted/30 hover:bg-muted",
                              !startDate && "text-muted-foreground"
                            )}
                          >
                            {startDate ? format(startDate, "PPP") : "Pick start date"}
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
                        className="w-auto min-w-[120px] bg-muted/30"
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
                    <Label className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                      <CalendarIcon className="w-4 h-4 text-primary" />
                      End Date & Time
                    </Label>
                    <div className="grid grid-cols-[1fr_auto] gap-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-muted/30 hover:bg-muted",
                              !endDate && "text-muted-foreground"
                            )}
                          >
                            {endDate ? format(endDate, "PPP") : "Pick end date"}
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
                        className="w-auto min-w-[120px] bg-muted/30"
                      />
                    </div>
                    {(errors.endDate || errors.endTime) && (
                      <p className="text-sm text-red-500 font-medium">
                        {errors.endDate?.message || errors.endTime?.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-muted-foreground">Category</Label>
                  <Controller
                    control={control}
                    name="category"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full bg-muted/30 h-12">
                          <SelectValue placeholder="What kind of event is this?" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id} className="cursor-pointer">
                              <span className="flex items-center gap-2 text-base">
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

                {/* Location */}
                <div className="space-y-4 pt-4 border-t">
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Location Information
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">State</Label>
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
                            <SelectTrigger className="w-full bg-muted/30 h-11">
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
                      <Label className="text-sm text-muted-foreground">City <span className="text-red-500">*</span></Label>
                      <Controller
                        control={control}
                        name="city"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={!selectedState}
                          >
                            <SelectTrigger className="w-full bg-muted/30 h-11">
                              <SelectValue
                                placeholder={
                                  selectedState ? "Select city" : "Select state first"
                                }
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
                      <Label className="text-sm text-muted-foreground">Venue Link / Google Maps</Label>
                      <Input
                        {...register("venue")}
                        placeholder="https://maps.google.com/..."
                        type="url"
                        className="bg-muted/30 h-11"
                      />
                      {errors.venue && (
                        <p className="text-sm text-red-500 font-medium">{errors.venue.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Full Address</Label>
                      <Input
                        {...register("address")}
                        placeholder="Building, Street, Landmark (optional)"
                        className="bg-muted/30 h-11"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3 pt-4 border-t">
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    About This Event
                  </Label>
                  <Textarea
                    {...register("description")}
                    placeholder="Tell your audience what to expect at this event..."
                    rows={6}
                    className="bg-muted/30 resize-none"
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 font-medium">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="h-px w-full bg-border/60" />

                <div className="grid sm:grid-cols-2 gap-8">
                  {/* Ticketing */}
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                      <Ticket className="w-4 h-4 text-primary" />
                      Ticketing
                    </Label>
                    <div className="flex items-center gap-6 bg-muted/20 p-4 rounded-lg border">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          value="free"
                          {...register("ticketType")}
                          className="w-5 h-5 text-primary accent-primary"
                        />
                        <span className="font-medium">Free</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          value="paid"
                          {...register("ticketType")}
                          className="w-5 h-5 text-primary accent-primary"
                        />
                        <span className="font-medium">Paid</span>
                      </label>
                    </div>

                    {ticketType === "paid" && (
                      <div className="pt-2">
                        <Input
                          type="number"
                          min="1"
                          placeholder="Ticket price (₹)"
                          {...register("ticketPrice", { valueAsNumber: true })}
                          className="bg-muted/30 h-11 text-lg font-medium"
                        />
                        {errors.ticketPrice && (
                          <p className="text-sm text-red-500 font-medium mt-1">{errors.ticketPrice.message}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Capacity */}
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4 text-primary" />
                      Capacity limit
                    </Label>
                    <div className="bg-muted/20 p-2 rounded-lg border">
                      <Input
                        type="number"
                        min="1"
                        {...register("capacity", { valueAsNumber: true })}
                        placeholder="Ex: 100"
                        className="bg-transparent border-none shadow-none h-11 text-lg font-medium"
                      />
                    </div>
                    {errors.capacity && (
                      <p className="text-sm text-red-500 font-medium">{errors.capacity.message}</p>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-7 text-lg rounded-xl font-bold transition-all hover:scale-[1.01] hover:shadow-lg active:scale-100"
                    style={{ backgroundColor: themeColor, color: "white" }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-3 animate-spin" /> Publishing Event...
                      </>
                    ) : (
                      "Publish Event"
                    )}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    By publishing this event, you agree to our Terms of Service
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Unsplash Picker */}
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
