"use client";
import { DoctorFilters } from "@/lib/types";
import { useDoctorStore } from "@/store/doctorStore";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FilterIcon, MapPin, Search, Star, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { cities, healthcareCategories, specializations } from "@/lib/constant";
import { Card, CardContent } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";

const DoctorListPage = () => {
  const searchParams = useSearchParams();
  const categoryParams = searchParams.get("category");

  const { doctors, loading, fetchDoctors } = useDoctorStore();

  const [filters, setFilters] = useState<DoctorFilters>({
    search: "",
    specialization: "",
    category: categoryParams || "",
    city: "",
    sortBy: "experience",
    sortOrder: "desc",
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDoctors(filters);
  }, [fetchDoctors, filters]);

  const handleFilterChange = (key: keyof DoctorFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      specialization: "",
      category: categoryParams || "",
      city: "",
      sortBy: "experience",
      sortOrder: "desc",
    });
  };

  const activeFilterCount = Object.values(filters).filter(
    (value) => value && value !== "experience" && value !== "desc"
  ).length;
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Find Doctors
              </h1>
              <p className="text-gray-600 mt-1">
                Find the perfect healthcare provider for your needs
              </p>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#52b69a] h-5 w-5 " />
              <Input
                placeholder="Search doctors by name , specialization, or condition..."
                className="pl-10 h-12 rounded-full text-base"
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              className="h-12 px-4 rounded-full"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterIcon className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-teal-300 text-teal-800"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          <div>
            <style>{`.hide-scrollbar::-webkit-scrollbar{display:none} .hide-scrollbar{-ms-overflow-style:none; scrollbar-width:none;}`}</style>
            <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
              <Button
                variant={!filters.category ? "default" : "outline"}
                className="flex-shrink-0 rounded-full"
                onClick={() => handleFilterChange("category", "")}
              >
                All Categories
              </Button>

              {healthcareCategories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={
                    filters.category === cat.title ? "default" : "outline"
                  }
                  className="flex-shrink-0 rounded-full whitespace-nowrap"
                  onClick={() => handleFilterChange("category", cat.title)}
                >
                  <div
                    className={`w-6 h-6 ${cat.color} rounded-2xl flex items-center justify-center group-hover:shadow-xl transition-all duration-200`}
                  >
                    <svg
                      className="w-6 h-6 text-white "
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d={cat.icon} />
                    </svg>
                  </div>
                  {cat.title}
                </Button>
              ))}
            </div>
          </div>

          {showFilters && (
            <Card className="p-4 mb-4 mt-4 bg-gray-50">
              <div className="flex items-center justify-between mb-4 ">
                <h2 className="font-semibold">Advanced Filters</h2>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Specialization
                  </label>
                  <Select
                    value={filters.specialization || ""}
                    onValueChange={(value) =>
                      handleFilterChange("specialization", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All specializations"></SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specializations</SelectItem>
                      {specializations.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Location
                  </label>
                  <Select
                    value={filters.city || ""}
                    onValueChange={(value) => handleFilterChange("city", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All locations"></SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All locations</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Sort by
                  </label>
                  <Select
                    value={filters.sortBy || "experience"}
                    onValueChange={(value) =>
                      handleFilterChange("sortBy", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="experience">Experience</SelectItem>
                      <SelectItem value="fees">Consultation Fee</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="createdAt">Newest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="amimate-plus">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto"></div>
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                      <div className="h-10 bg-gray-200 rounded "></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : doctors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <Card
                key={doctor._id}
                className="rounded-3xl transition-all duration-300 bg-white border-0 h-full"
              >
                <CardContent className="px-6 py-3 flex flex-col h-full">
                  <div className="text-center mb-4">
                    <Avatar className="w-20 h-20 mx-auto mb-3">
                      <AvatarImage
                        src={doctor.profileImage}
                        alt={doctor.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-[#52b69a]/10 text-[#52b69a] text-2xl font-bold">
                        {doctor.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <h3 className="text-lg font-bold text-black mb-1">
                      {(doctor.name || "").charAt(0).toUpperCase() + (doctor.name || "").slice(1)}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {doctor.specialization} • {doctor.experience}+ yrs exp.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 justify-center mb-8">
                    {doctor.category?.slice(0, 2).map((category, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-teal-50 text-teal-700 border-teal-200 text-xs"
                      >
                        {category}
                      </Badge>
                    ))}

                    <Badge
                      variant="secondary"
                      className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-4 h-4 fill-orange-400 text-orange-400"
                          />
                        ))}
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span className="font-bold">5.0</span>
                        <span className="text-black/80 text-xs">(620)</span>
                      </div>
                    </div>

                    <div className="flex items-center text-black/80">
                      <MapPin className="w-4 h-4 mr-1 text-[#52b69a]" />
                      <span className="text-sm">{doctor.hospitalInfo?.city}</span>
                    </div>
                  </div>

           

                  <div className="mt-auto">
                    <Link href={`/patient/booking/${doctor._id}`} className="block">
                    <Button className="w-full h-12 bg-[#52b69a] hover:bg-[#1e6190] text-white rounded-full ply-2 text-sm font-medium transition-all">
                        Book Appointment for ₹{doctor.fees}
                    </Button>
                    </Link>

                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
           <Card className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto"/>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No doctors found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters or search criteria</p>
            <Button onClick={clearFilters}>Clear Filters</Button>
           </Card>
        )}
      </div>
    </div>
  );
};

export default DoctorListPage;
