"use client";
import { healthcareCategories, specializations } from "@/lib/constant";
import { userAuthStore } from "@/store/authStore";
import {
  Clock,
  FileText,
  MapPin,
  Phone,
  Plus,
  Stethoscope,
  User,
  X,
  Calendar,
  Heart,
  Briefcase,
  Building,
  Mail,
  PersonStanding,
  Droplet,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { DashboardSidebar } from "@/components/patient/DashboardSidebar";
import { DoctorSidebar } from "@/components/doctor/DoctorSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
// --- NEW IMPORTS ---
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfileProps {
  userType: "doctor" | "patient";
}

// --- HELPER COMPONENT for displaying data in "View" mode ---
const DisplayData = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: string | number | null;
  icon?: React.ElementType;
}) => (
  <div className="flex flex-col gap-1">
    <Label className="text-sm font-normal text-black/60 flex items-center">
      {Icon && <Icon className="w-4 h-4 mr-1" />}
      {label}
    </Label>
    <p className="text-base text-black font-medium">
      {value || <span className="text-black">N/A</span>}
    </p>
  </div>
);

const ProfilePage = ({ userType }: ProfileProps) => {
  const { user, fetchProfile, updateProfile, loading } = userAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  // --- No changes to state, useEffect, or handlers... ---
  // [ ... formData, useEffects, handleInputChnage, handleArrayChnage,
  //   handleCategorySelect, handleCategoryDelete, getAvailableCategories,
  //   addTimeRange, removeTimeRange, handleWeekdayToggle, handleSave,
  //   formatDateForInput ... ]
  // (All your existing logic from the original file goes here)
  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    bloodGroup: "",
    about: "",
    specialization: "",
    category: [],
    qualification: "",
    experience: 0,
    fees: 0,
    hospitalInfo: {
      name: "",
      address: "",
      city: "",
    },
    medicalHistory: {
      allergies: "",
      currentMedications: "",
      chronicConditions: "",
    },
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },

    availabilityRange: {
      startDate: "",
      endDate: "",
      excludedWeekdays: [],
    },
    dailyTimeRanges: [],
    slotDurationMinutes: 30,
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        dob: user.dob || "",
        gender: user.gender || "",
        bloodGroup: user.bloodGroup || "",
        about: user.about || "",
        specialization: user.specialization || "",
        category: user.category || [],
        qualification: user.qualification || "",
        experience: user.experience || 0,
        fees: user.fees || 0,
        hospitalInfo: {
          name: user.hospitalInfo?.name || "",
          address: user.hospitalInfo?.address || "",
          city: user.hospitalInfo?.city || "",
        },
        medicalHistory: {
          allergies: user.medicalHistory?.allergies || "",
          currentMedications: user.medicalHistory?.currentMedications || "",
          chronicConditions: user.medicalHistory?.chronicConditions || "",
        },
        emergencyContact: {
          name: user.emergencyContact?.name || "",
          phone: user.emergencyContact?.phone || "",
          relationship: user.emergencyContact?.relationship || "",
        },
        availabilityRange: {
          startDate: user.availabilityRange?.startDate || "",
          endDate: user.availabilityRange?.endDate || "",
          excludedWeekdays: user.availabilityRange?.excludedWeekdays || [],
        },
        dailyTimeRanges: user.dailyTimeRanges || [],
        slotDurationMinutes: user.slotDurationMinutes || 30,
      });
    }
  }, [user]);

  const handleInputChnage = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [field]: value }));
    }
  };
  const handleArrayChnage = (
    field: string,
    index: number,
    subField: string,
    value: any
  ) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].map((item: any, i: number) =>
        i === index ? { ...item, [subField]: value } : item
      ),
    }));
  };

  const handleCategorySelect = (category: any): void => {
    if (!formData.category.includes(category.title)) {
      handleInputChnage("category", [...formData.category, category.title]);
    }
  };

  const handleCategoryDelete = (indexToDelete: number) => {
    const currentCategories = [...formData.category];
    const newCategories = currentCategories.filter(
      (_: any, i: number) => i !== indexToDelete
    );
    setFormData((prev: any) => ({
      ...prev,
      category: newCategories,
    }));
  };

  const getAvailableCategories = () => {
    return healthcareCategories.filter(
      (cat) => !formData.category.includes(cat.title)
    );
  };

  const addTimeRange = () => {
    setFormData((prev: any) => ({
      ...prev,
      dailyTimeRanges: [
        ...prev.dailyTimeRanges,
        { start: "09:00", end: "17:00" },
      ],
    }));
  };

  const removeTimeRange = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      dailyTimeRanges: prev.dailyTimeRanges.filter(
        (_: any, i: number) => i !== index
      ),
    }));
  };

  const handleWeekdayToggle = (weekday: number) => {
    const excludedWeekdays = [...formData.availabilityRange.excludedWeekdays];
    const index = excludedWeekdays.indexOf(weekday);

    if (index > -1) {
      excludedWeekdays.splice(index, 1);
    } else {
      excludedWeekdays.push(weekday);
    }

    handleInputChnage("availabilityRange.excludedWeekdays", excludedWeekdays);
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const formatDateForInput = (isoDate: string): string => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  // --- RENDER FUNCTIONS (Now with View/Edit logic) ---

  const renderAboutSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {isEditing ? (
        <>
          <div className="flex flex-col gap-2">
            <Label>Legal First Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChnage("name", e.target.value)}
            />
          </div>
          {userType === "patient" && (
            <>
              <div className="flex flex-col gap-2">
                <Label>Official Date of Birth</Label>
                <Input
                  type="date"
                  value={formatDateForInput(formData.dob)}
                  onChange={(e) => handleInputChnage("dob", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Gender</Label>
                <RadioGroup
                  value={formData.gender || ""}
                  onValueChange={(value) => handleInputChnage("gender", value)}
                  className="flex pt-2 space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Blood Group</Label>
                <Select
                  value={formData.bloodGroup || ""}
                  onValueChange={(value) =>
                    handleInputChnage("bloodGroup", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                      (group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          {userType === "doctor" && (
            <div className="flex flex-col gap-2 md:col-span-2">
              <Label>About</Label>
              <Textarea
                value={formData.about || ""}
                onChange={(e) => handleInputChnage("about", e.target.value)}
                rows={4}
              />
            </div>
          )}
        </>
      ) : (
        <>
          <DisplayData label="Legal Name" value={formData.name} icon={User} />
          {userType === "patient" && (
            <>
              <DisplayData
                label="Date of Birth"
                value={formatDateForInput(formData.dob)}
                icon={Calendar}
              />
              <DisplayData label="Gender" value={formData.gender} icon={PersonStanding} />
              <DisplayData label="Blood Group" value={formData.bloodGroup} icon={Droplet} />
            </>
          )}
          {userType === "doctor" && (
            <p className="md:col-span-2 text-base text-gray-700">
              {formData.about || "No 'about' information provided."}
            </p>
          )}
        </>
      )}
    </div>
  );

  const renderProfessionalSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {isEditing ? (
        <>
          <div className="flex flex-col gap-2">
            <Label>Specialization</Label>
            <Select
              value={formData.specialization || ""}
              onValueChange={(value) =>
                handleInputChnage("specialization", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select specialization" />
              </SelectTrigger>
              <SelectContent>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Qualification</Label>
            <Input
              value={formData.qualification || ""}
              onChange={(e) =>
                handleInputChnage("qualification", e.target.value)
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Experience (years)</Label>
            <Input
              type="number"
              value={formData.experience || ""}
              onChange={(e) =>
                handleInputChnage("experience", parseInt(e.target.value) || 0)
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Consultation Fee(₹)</Label>
            <Input
              type="number"
              value={formData.fees || ""}
              onChange={(e) =>
                handleInputChnage("fees", parseInt(e.target.value) || 0)
              }
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.category?.map((cat: string, index: number) => (
                <Badge key={index} variant="secondary" className="flex items-center">
                  <span>{cat}</span>
                  <button
                    type="button"
                    className="ml-1 p-0.5 border-0 bg-transparent cursor-pointer hover:bg-gray-300 rounded-full"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCategoryDelete(index);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {getAvailableCategories().length > 0 && (
                <Select
                  onValueChange={(value) => {
                    const selectedCategory = getAvailableCategories().find(
                      (cate) => cate.id === value
                    );
                    if (selectedCategory) {
                      handleCategorySelect(selectedCategory);
                    }
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Add Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableCategories().map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-3 h-3 rounded-full ${category.color}`}
                          ></div>
                          <span>{category.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <DisplayData
            label="Specialization"
            value={formData.specialization}
            icon={Stethoscope}
          />
          <DisplayData
            label="Qualification"
            value={formData.qualification}
            icon={FileText}
          />
          <DisplayData
            label="Experience"
            value={`${formData.experience} years`}
            icon={Briefcase}
          />
          <DisplayData
            label="Consultation Fee"
            value={`₹${formData.fees}`}
          />
          <div className="md:col-span-2">
            <Label className="text-sm font-normal text-gray-500">
              Categories
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.category?.length > 0 ? (
                formData.category.map((cat: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {cat}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-400">N/A</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderHospitalSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {isEditing ? (
        <>
          <div className="flex flex-col gap-2">
            <Label>Hospital/Clinic Name</Label>
            <Input
              value={formData.hospitalInfo?.name || ""}
              onChange={(e) =>
                handleInputChnage("hospitalInfo.name", e.target.value)
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>City</Label>
            <Input
              value={formData.hospitalInfo?.city || ""}
              onChange={(e) =>
                handleInputChnage("hospitalInfo.city", e.target.value)
              }
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label>Address</Label>
            <Textarea
              value={formData.hospitalInfo?.address || ""}
              onChange={(e) =>
                handleInputChnage("hospitalInfo.address", e.target.value)
              }
              rows={3}
            />
          </div>
        </>
      ) : (
        <>
          <DisplayData
            label="Hospital/Clinic Name"
            value={formData.hospitalInfo?.name}
            icon={Building}
          />
          <DisplayData
            label="City"
            value={formData.hospitalInfo?.city}
            icon={MapPin}
          />
          <div className="md:col-span-2">
            <DisplayData
              label="Address"
              value={formData.hospitalInfo?.address}
            />
          </div>
        </>
      )}
    </div>
  );

  const renderAvailabilitySection = () => (
    <div className="space-y-6">
      {isEditing ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Available From Date</Label>
              <Input
                type="date"
                value={formatDateForInput(formData.availabilityRange?.startDate)}
                onChange={(e) =>
                  handleInputChnage(
                    "availabilityRange.startDate",
                    e.target.value
                  )
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Available Until Date</Label>
              <Input
                type="date"
                value={formatDateForInput(formData.availabilityRange?.endDate)}
                onChange={(e) =>
                  handleInputChnage("availabilityRange.endDate", e.target.value)
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Excluded Weekdays</Label>
            <div className="flex flex-wrap gap-4 p-2">
              {[
                "Sunday", "Monday", "Tuesday", "Wednesday",
                "Thursday", "Friday", "Saturday",
              ].map((day, index) => (
                <label key={index} className="flex items-center space-x-2">
                  <Checkbox
                    checked={
                      formData.availabilityRange?.excludedWeekdays?.includes(
                        index
                      ) || false
                    }
                    onCheckedChange={() => handleWeekdayToggle(index)}
                  />
                  <span className="text-sm">{day}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Daily Time Range</Label>
            <div className="space-y-3">
              {formData.dailyTimeRanges?.map((timeRange: any, index: number) => (
                <div className="flex items-center space-x-2" key={index}>
                  <Input
                    type="time"
                    value={timeRange.start || ""}
                    onChange={(e) =>
                      handleArrayChnage(
                        "dailyTimeRanges",
                        index,
                        "start",
                        e.target.value
                      )
                    }
                  />
                  <span>to</span>
                  <Input
                    type="time"
                    value={timeRange.end || ""}
                    onChange={(e) =>
                      handleArrayChnage(
                        "dailyTimeRanges",
                        index,
                        "end",
                        e.target.value
                      )
                    }
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeTimeRange(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addTimeRange}>
                <Plus className="w-4 h-4 mr-2" />
                Add Time Range
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Slot Duration (minutes)</Label>
            <Select
              value={formData.slotDurationMinutes?.toString() || "30"}
              onValueChange={(value) =>
                handleInputChnage("slotDurationMinutes", parseInt(value))
              }
            >
              <SelectTrigger className="w-full md:w-1/2">
                <SelectValue placeholder="Select slot duration" />
              </SelectTrigger>
              <SelectContent>
                {[15, 20, 30, 45, 60, 90, 120].map(duration => (
                  <SelectItem key={duration} value={String(duration)}>
                    {duration} minutes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DisplayData
              label="Available From"
              value={formatDateForInput(formData.availabilityRange?.startDate)}
            />
            <DisplayData
              label="Available Until"
              value={formatDateForInput(formData.availabilityRange?.endDate)}
            />
          </div>
          <div>
            <Label className="text-sm font-normal text-gray-500">Excluded Weekdays</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.availabilityRange?.excludedWeekdays?.length > 0 ? (
                ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                  .filter((_, index) => formData.availabilityRange.excludedWeekdays.includes(index))
                  .map((day) => (
                    <Badge key={day} variant="secondary">{day}</Badge>
                  ))
              ) : (
                <p className="text-gray-400">N/A (Available 7 days/week)</p>
              )}
            </div>
          </div>
          <div>
            <Label className="text-sm font-normal text-gray-500">Daily Time Ranges</Label>
            <div className="flex flex-col gap-2 mt-2">
              {formData.dailyTimeRanges?.length > 0 ? (
                formData.dailyTimeRanges.map((range: any, index: number) => (
                  <Badge key={index} variant="outline" className="w-fit">
                    {range.start} - {range.end}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-400">No daily times set.</p>
              )}
            </div>
          </div>
          <DisplayData
            label="Slot Duration"
            value={`${formData.slotDurationMinutes} minutes`}
          />
        </>
      )}
    </div>
  );

  const renderContactSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {isEditing ? (
        <>
          <div className="flex flex-col gap-2">
            <Label>Phone Number</Label>
            <Input
              value={formData.phone || ""}
              onChange={(e) => handleInputChnage("phone", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Email</Label>
            <Input value={formData.email || ""} disabled={true} />
          </div>
        </>
      ) : (
        <>
          <DisplayData label="Phone Number" value={formData.phone} icon={Phone} />
          <DisplayData label="Email" value={formData.email} icon={Mail} />
        </>
      )}
    </div>
  );

  const renderMedicalSection = () => (
    <div className="space-y-6">
      {isEditing ? (
        <>
          <div className="flex flex-col gap-2">
            <Label>Allergies</Label>
            <Textarea
              value={formData.medicalHistory.allergies || ""}
              onChange={(e) =>
                handleInputChnage("medicalHistory.allergies", e.target.value)
              }
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Current Medications</Label>
            <Textarea
              value={formData.medicalHistory.currentMedications || ""}
              onChange={(e) =>
                handleInputChnage(
                  "medicalHistory.currentMedications",
                  e.target.value
                )
              }
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Chronic Conditions</Label>
            <Textarea
              value={formData.medicalHistory.chronicConditions || ""}
              onChange={(e) =>
                handleInputChnage(
                  "medicalHistory.chronicConditions",
                  e.target.value
                )
              }
              rows={3}
            />
          </div>
        </>
      ) : (
        <>
          <DisplayData
            label="Allergies"
            value={formData.medicalHistory.allergies}
          />
          <DisplayData
            label="Current Medications"
            value={formData.medicalHistory.currentMedications}
          />
          <DisplayData
            label="Chronic Conditions"
            value={formData.medicalHistory.chronicConditions}
          />
        </>
      )}
    </div>
  );

  const renderEmergencySection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {isEditing ? (
        <>
          <div className="flex flex-col gap-2">
            <Label>Emergency Contact Name</Label>
            <Input
              value={formData.emergencyContact?.name || ""}
              onChange={(e) =>
                handleInputChnage("emergencyContact.name", e.target.value)
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Emergency Contact Phone</Label>
            <Input
              value={formData.emergencyContact?.phone || ""}
              onChange={(e) =>
                handleInputChnage("emergencyContact.phone", e.target.value)
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Relationship</Label>
            <Input
              value={formData.emergencyContact?.relationship || ""}
              onChange={(e) =>
                handleInputChnage("emergencyContact.relationship", e.target.value)
              }
            />
          </div>
        </>
      ) : (
        <>
          <DisplayData
            label="Name"
            value={formData.emergencyContact?.name}
          />
          <DisplayData
            label="Phone"
            value={formData.emergencyContact?.phone}
          />
          <DisplayData
            label="Relationship"
            value={formData.emergencyContact?.relationship}
          />
        </>
      )}
    </div>
  );

  if (!user) return <div>Loading...</div>; // Or a proper loading skeleton

  const Sidebar = userType === "doctor" ? DoctorSidebar : DashboardSidebar;

  const doctorTabs = (
    <TabsList className="grid w-full grid-cols-2">
      <TabsTrigger value="profile">
        <User className="w-4 h-4 mr-2" /> Profile
      </TabsTrigger>
      <TabsTrigger value="practice">
        <Briefcase className="w-4 h-4 mr-2" /> Practice
      </TabsTrigger>
    </TabsList>
  );

  const patientTabs = (
    <TabsList className="grid w-1/2 grid-cols-2">
      <TabsTrigger value="profile">
        <User className="w-4 h-4 mr-2" /> Profile
      </TabsTrigger>
      <TabsTrigger value="medical">
        <Heart className="w-4 h-4 mr-2" /> Medical
      </TabsTrigger>
    </TabsList>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 pl-0 md:pl-64 overflow-y-auto">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {/* --- NEW HEADER --- */}  
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user?.profileImage} alt={user?.name} />
                <AvatarFallback className="bg-[#52b69a]/10 text-[#52b69a] text-2xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-black">
                  {user?.name}
                </h1>
                <p className="text-black/80">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile(); // Revert changes
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </div>

          {/* --- NEW TABS --- */}
          <Tabs defaultValue="profile" className="justify-center w-full">
            <div className="flex justify-center w-full">
              {userType === "doctor" ? doctorTabs : patientTabs}
            </div>

            {/* --- DOCTOR TABS --- */}
            {userType === "doctor" && (
              <>
                <TabsContent value="profile" className="mt-6 space-y-6">
                  <Card className="rounded-3xl">
                    <CardHeader>
                      <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent>{renderAboutSection()}</CardContent>
                  </Card>
                  <Card className="rounded-3xl">
                    <CardHeader>
                      <CardTitle>Professional Information</CardTitle>
                    </CardHeader>
                    <CardContent>{renderProfessionalSection()}</CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="practice" className="mt-6 space-y-6">
                  <Card className="rounded-3xl">
                    <CardHeader>
                      <CardTitle>Hospital Information</CardTitle>
                    </CardHeader>
                    <CardContent>{renderHospitalSection()}</CardContent>
                  </Card>
                  <Card className="rounded-3xl">
                    <CardHeader>
                      <CardTitle>Availability</CardTitle>
                    </CardHeader>
                    <CardContent>{renderAvailabilitySection()}</CardContent>
                  </Card>
                </TabsContent>
              </>
            )}

            {/* --- PATIENT TABS --- */}
            {userType === "patient" && (
              <>
                <TabsContent value="profile" className="mt-6 space-y-6">
                  <Card className="rounded-3xl">
                    <CardHeader>
                      <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent>{renderAboutSection()}</CardContent>
                  </Card>
                  <Card className="rounded-3xl">
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent>{renderContactSection()}</CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="medical" className="mt-6 space-y-6">
                  <Card className="rounded-3xl">
                    <CardHeader>
                      <CardTitle>Medical History</CardTitle>
                    </CardHeader>
                    <CardContent>{renderMedicalSection()}</CardContent>
                  </Card>
                  <Card className="rounded-3xl">
                    <CardHeader>
                      <CardTitle>Emergency Contact</CardTitle>
                    </CardHeader>
                    <CardContent>{renderEmergencySection()}</CardContent>
                  </Card>
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;