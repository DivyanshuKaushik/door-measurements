"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import type { Flat, DoorType } from "@/lib/types";
import { Trash2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FlatMeasurementStepProps {
    buildingId: string;
    setFlatName: (value: string) => void
}

export function FlatMeasurementStep({ buildingId, setFlatName }: FlatMeasurementStepProps) {
    const { toast } = useToast();
    const [flats, setFlats] = useState<Flat[]>([]);
    const [selectedFlat, setSelectedFlat] = useState<string | null>(null);
    const [newFlatNo, setNewFlatNo] = useState("");
    const [isAddingFlat, setIsAddingFlat] = useState(false);
    const [loading, setLoading] = useState(true);

    // Measurement states
    const [doorType, setDoorType] = useState<DoorType | null>(null);
    const [lengthInches, setLengthInches] = useState("");
    const [breadthInches, setBreadthInches] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchFlats();
    }, [buildingId]);

    const fetchFlats = async () => {
        try {
            const response = await fetch(`/api/flat?buildingId=${buildingId}`);
            const data = await response.json();
            setFlats(data);
        } catch (error) {
            console.error("Error fetching flats:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddFlat = async () => {
        if (!newFlatNo.trim()) return;

        try {
            const response = await fetch("/api/flat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ flatNo: newFlatNo, buildingId }),
            });
            const newFlat = await response.json();
            setFlats([newFlat, ...flats]);
            setNewFlatNo("");
            setIsAddingFlat(false);
            setSelectedFlat(newFlat._id);
            setFlatName(newFlat.flatNo)
        } catch (error) {
            console.error("Error creating flat:", error);
            toast({
                title: "Error",
                description: "Failed to add flat",
                variant: "destructive",
            });
        }
    };

    const handleSaveMeasurement = async () => {
        if (!selectedFlat || !doorType || !lengthInches || !breadthInches)
            return;

        setSaving(true);
        try {
            const response = await fetch("/api/measurement", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    flatId: selectedFlat,
                    doorType,
                    lengthInches: Number(lengthInches),
                    breadthInches: Number(breadthInches),
                }),
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Measurement saved successfully",
                });
                setDoorType(null);
                setLengthInches("");
                setBreadthInches("");
            } else {
                throw new Error("Failed to save measurement");
            }
        } catch (error) {
            console.error("Error saving measurement:", error);
            toast({
                title: "Error",
                description: "Failed to save measurement",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteFlat = async (flatId: string, flatNo: string) => {
        try {
            const response = await fetch(`/api/flat/${flatId}`, {
                method: "DELETE",
            });
            if (response.ok) {
                setFlats(flats.filter((f) => f._id !== flatId));
                setSelectedFlat(null);
                toast({
                    title: "Success",
                    description: `Flat ${flatNo} and all related measurements have been deleted.`,
                });
            } else {
                throw new Error("Failed to delete flat");
            }
        } catch (error) {
            console.error("Error deleting flat:", error);
            toast({
                title: "Error",
                description: "Failed to delete flat",
                variant: "destructive",
            });
        }
    };

    const handleSelectFlat = (flatId: string) => {
        setSelectedFlat(flatId);
        const selected = flats.find((f) => f._id === flatId);
        if (selected) {
          setFlatName(selected.flatNo)
        }
    };
    if (loading) {
        return (
            <div className="text-center text-muted-foreground">Loading...</div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">
                    Select Flat & Add Measurements
                </h2>
                <p className="text-sm text-muted-foreground">
                    Choose a flat, then select door type and enter measurements
                </p>
            </div>

            {/* Flat Selection */}
            <Card className="p-4 space-y-4">
                <Label>Select Flat</Label>
                <div className="space-y-3">
                    {/* Replaced dropdown with custom scrollable list similar to building step */}
                    <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-2">
                        {flats.length === 0 ? (
                            <div className="text-sm text-muted-foreground p-2">
                                No flats available
                            </div>
                        ) : (
                            flats.map((flat) => (
                                <div
                                    key={flat._id}
                                    className="flex items-center justify-between gap-2 p-3 hover:bg-accent rounded-md border-b last:border-b-0"
                                >
                                    <button
                                        onClick={() =>
                                            handleSelectFlat(flat._id)
                                        }
                                        className="flex-1 text-left text-sm hover:font-medium transition-all"
                                    >
                                        Flat {flat.flatNo}
                                    </button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                                className="p-1 hover:bg-red-100 hover:text-red-600 rounded transition-colors text-red-500"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogTitle>
                                                Delete Flat
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to delete
                                                "Flat {flat.flatNo}"? This will
                                                also delete all measurements
                                                associated with this flat.
                                            </AlertDialogDescription>
                                            <div className="flex gap-2">
                                                <AlertDialogCancel>
                                                    Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() =>
                                                        handleDeleteFlat(
                                                            flat._id,
                                                            flat.flatNo
                                                        )
                                                    }
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </div>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            ))
                        )}
                    </div>

                    {!isAddingFlat ? (
                        <Button
                            variant="outline"
                            className="w-full bg-transparent"
                            onClick={() => setIsAddingFlat(true)}
                        >
                            Add New Flat
                        </Button>
                    ) : (
                        <div className="space-y-3 pt-4 border-t">
                            <div>
                                <Label htmlFor="flatNo">Flat Number</Label>
                                <Input
                                    id="flatNo"
                                    value={newFlatNo}
                                    onChange={(e) =>
                                        setNewFlatNo(e.target.value)
                                    }
                                    placeholder="Enter flat number"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleAddFlat}
                                    className="flex-1"
                                >
                                    Add Flat
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsAddingFlat(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Door Type Selection - Only visible when flat is selected */}
            {selectedFlat && (
                <Card className="p-4 space-y-4">
                    <Label>Door Type</Label>
                    <RadioGroup
                        value={doorType || ""}
                        onValueChange={(value) =>
                            setDoorType(value as DoorType)
                        }
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="BEDROOM" id="bedroom" />
                            <Label htmlFor="bedroom" className="cursor-pointer">
                                Bedroom Door
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="BATHROOM" id="bathroom" />
                            <Label
                                htmlFor="bathroom"
                                className="cursor-pointer"
                            >
                                Bathroom Door
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="MAIN_ENTRY" id="main" />
                            <Label htmlFor="main" className="cursor-pointer">
                                Main Entry Door
                            </Label>
                        </div>
                    </RadioGroup>
                </Card>
            )}

            {/* Measurement Inputs - Only visible when door type is selected */}
            {selectedFlat && doorType && (
                <Card className="p-4 space-y-4">
                    <Label>Door Measurements</Label>
                    <div className="grid gap-4">
                        <div>
                            <Label htmlFor="length">Length (inches)</Label>
                            <Input
                                id="length"
                                type="number"
                                value={lengthInches}
                                onChange={(e) =>
                                    setLengthInches(e.target.value)
                                }
                                placeholder="Enter length"
                            />
                        </div>
                        <div>
                            <Label htmlFor="breadth">Breadth (inches)</Label>
                            <Input
                                id="breadth"
                                type="number"
                                value={breadthInches}
                                onChange={(e) =>
                                    setBreadthInches(e.target.value)
                                }
                                placeholder="Enter breadth"
                            />
                        </div>
                    </div>
                    <Button
                        onClick={handleSaveMeasurement}
                        disabled={!lengthInches || !breadthInches || saving}
                        className="w-full"
                    >
                        {saving ? "Saving..." : "Save Measurement"}
                    </Button>
                </Card>
            )}
        </div>
    );
}
