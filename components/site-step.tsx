"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Pencil } from "lucide-react";
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
import type { Site } from "@/lib/types";

interface SiteStepProps {
    onSelect: (siteId: string) => void;
}

export function SiteStep({ onSelect }: SiteStepProps) {
    const [sites, setSites] = useState<Site[]>([]);
    const [newSiteName, setNewSiteName] = useState("");
    const [newSpocName, setNewSpocName] = useState("");
    const [newSpocNumber, setNewSpocNumber] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
    const [editSpocName, setEditSpocName] = useState("");
    const [editSpocNumber, setEditSpocNumber] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        fetchSites();
    }, []);

    const fetchSites = async () => {
        try {
            const response = await fetch("/api/site");
            const data = await response.json();
            setSites(data);
        } catch (error) {
            console.error("Error fetching sites:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSite = async () => {
        if (!newSiteName.trim()) return;

        try {
            const response = await fetch("/api/site", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newSiteName,
                    spocName: newSpocName,
                    spocNumber: newSpocNumber,
                }),
            });
            const newSite = await response.json();
            setSites([newSite, ...sites]);
            setNewSiteName("");
            setNewSpocName("");
            setNewSpocNumber("");
            setIsAdding(false);
            onSelect(newSite._id);
        } catch (error) {
            console.error("Error creating site:", error);
        }
    };

    const handleUpdateSpoc = async (siteId: string) => {
        try {
            const response = await fetch("/api/site", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    siteId,
                    spocName: editSpocName,
                    spocNumber: editSpocNumber,
                }),
            });
            const updatedSite = await response.json();
            setSites(
                sites.map((s) => (s._id === updatedSite._id ? updatedSite : s))
            );
            setEditingSiteId(null);
            toast({
                title: "SPOC Updated",
                description:
                    "Site SPOC details have been updated successfully.",
            });
        } catch (error) {
            console.error("Error updating SPOC:", error);
            toast({
                title: "Error",
                description: "Failed to update SPOC details.",
                variant: "destructive",
            });
        }
    };

    const handleDeleteSite = async (siteId: string, siteName: string) => {
        try {
            const response = await fetch(`/api/site?siteId=${siteId}`, {
                method: "DELETE",
            });
            if (response.ok) {
                setSites(sites.filter((s) => s._id !== siteId));
                onSelect("");
                toast({
                    title: "Success",
                    description: `Site "${siteName}" and all related data have been deleted.`,
                });
            } else {
                throw new Error("Failed to delete site");
            }
        } catch (error) {
            console.error("Error deleting site:", error);
            toast({
                title: "Error",
                description: "Failed to delete site",
                variant: "destructive",
            });
        }
    };

    const startEditSpoc = (site: Site, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingSiteId(site._id);
        setEditSpocName(site.spocName || "");
        setEditSpocNumber(site.spocNumber || "");
    };

    const cancelEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingSiteId(null);
    };

    if (loading) {
        return (
            <div className="text-center text-muted-foreground">Loading...</div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-foreground mb-1">
                        Select Site
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Choose an existing site or add a new one
                    </p>
                </div>
                {!isAdding && (
                    <Button size="sm" onClick={() => setIsAdding(true)}>
                        Add Site
                    </Button>
                )}
            </div>

            {isAdding && (
                <Card className="p-4 space-y-3 border-primary bg-primary/5">
                    <div>
                        <Label htmlFor="siteName">Site Name</Label>
                        <Input
                            id="siteName"
                            value={newSiteName}
                            onChange={(e) => setNewSiteName(e.target.value)}
                            placeholder="Enter site name"
                            autoFocus
                        />
                    </div>
                    <div>
                        <Label htmlFor="spocName">Supervisor Name</Label>
                        <Input
                            id="spocName"
                            value={newSpocName}
                            onChange={(e) => setNewSpocName(e.target.value)}
                            placeholder="Enter Supervisor name (optional)"
                        />
                    </div>
                    <div>
                        <Label htmlFor="spocNumber">Supervisor Number</Label>
                        <Input
                            id="spocNumber"
                            value={newSpocNumber}
                            onChange={(e) => setNewSpocNumber(e.target.value)}
                            placeholder="Enter Supervisor number (optional)"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleAddSite} className="flex-1">
                            Add Site
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setIsAdding(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </Card>
            )}

            {sites.length > 0 && (
                <div className="space-y-2">
                    {sites.map((site) => (
                        <Card
                            key={site._id}
                            className={`p-4 transition-colors ${
                                editingSiteId === site._id
                                    ? ""
                                    : "cursor-pointer hover:bg-accent"
                            }`}
                            onClick={() =>
                                editingSiteId !== site._id && onSelect(site._id)
                            }
                        >
                            {editingSiteId === site._id ? (
                                <div
                                    className="space-y-3"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="font-medium text-foreground">
                                        {site.name}
                                    </div>
                                    <div className="grid gap-3">
                                        <div>
                                            <Label
                                                htmlFor={`edit-spoc-name-${site._id}`}
                                                className="text-xs"
                                            >
                                                Supervisor Name
                                            </Label>
                                            <Input
                                                id={`edit-spoc-name-${site._id}`}
                                                value={editSpocName}
                                                onChange={(e) =>
                                                    setEditSpocName(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Enter Supervisor name"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label
                                                htmlFor={`edit-spoc-number-${site._id}`}
                                                className="text-xs"
                                            >
                                                Supervisor Number
                                            </Label>
                                            <Input
                                                id={`edit-spoc-number-${site._id}`}
                                                value={editSpocNumber}
                                                onChange={(e) =>
                                                    setEditSpocNumber(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Enter Supervisor number"
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleUpdateSpoc(site._id)
                                            }
                                            className="flex-1"
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={cancelEdit}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-[1fr,1fr,auto,auto] gap-3 items-center">
                                    <div className="flex justify-between">
                                        <div className="font-medium text-foreground">
                                            {site.name}
                                        </div>
                                        <div className="">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={(e) =>
                                                    startEditSpoc(site, e)
                                                }
                                                className="h-8 w-8 p-0"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogTitle>
                                                        Delete Site
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to
                                                        delete "{site.name}"?
                                                        This will also delete
                                                        all buildings, flats,
                                                        and measurements
                                                        associated with this
                                                        site.
                                                    </AlertDialogDescription>
                                                    <div className="flex gap-2">
                                                        <AlertDialogCancel>
                                                            Cancel
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() =>
                                                                handleDeleteSite(
                                                                    site._id,
                                                                    site.name
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
                                    </div>
                                   <div className="text-sm text-muted-foreground">
                                        {site.spocName || site.spocNumber ? (
                                            <div>
                                              <h2 className="font-medium text-black">Supervisor Details</h2>
                                                <div className="flex justify-between">
                                                    {site.spocName && (
                                                        <div>
                                                            
                                                            Name: {site.spocName}
                                                        </div>
                                                    )}
                                                    {site.spocNumber && (
                                                        <div>
                                                            
                                                            No.: {site.spocNumber}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="italic">
                                                No Supervisor details
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
