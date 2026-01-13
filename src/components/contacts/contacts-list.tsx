"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContactCard } from "./contact-card";
import { ContactForm } from "./contact-form";
import {
  Users,
  Search,
  Plus,
  Star,
  Filter,
  X,
  UserPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Contact } from "@/lib/db/schema";

interface ContactsListProps {
  contacts: Contact[];
  tags: string[];
}

export function ContactsList({ contacts, tags }: ContactsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          contact.name.toLowerCase().includes(query) ||
          contact.email?.toLowerCase().includes(query) ||
          contact.company?.toLowerCase().includes(query) ||
          contact.notes?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Tag filter
      if (selectedTag && !contact.tags?.includes(selectedTag)) {
        return false;
      }

      // Favorites filter
      if (showFavoritesOnly && !contact.isFavorite) {
        return false;
      }

      return true;
    });
  }, [contacts, searchQuery, selectedTag, showFavoritesOnly]);

  const hasFilters = selectedTag !== null || showFavoritesOnly;

  const clearFilters = () => {
    setSelectedTag(null);
    setShowFavoritesOnly(false);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingContact(null);
  };

  // Group contacts by first letter
  const groupedContacts = useMemo(() => {
    const groups: Record<string, Contact[]> = {};
    filteredContacts.forEach((contact) => {
      const letter = contact.name[0].toUpperCase();
      if (!groups[letter]) {
        groups[letter] = [];
      }
      groups[letter].push(contact);
    });
    return groups;
  }, [filteredContacts]);

  const letters = Object.keys(groupedContacts).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Rolodex</h1>
            <p className="text-sm text-muted-foreground">
              {filteredContacts.length} of {contacts.length} contacts
            </p>
          </div>
        </div>

        <Button onClick={() => setShowForm(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-border/50 bg-secondary/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Favorites */}
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-2 border-border/50",
              showFavoritesOnly && "border-amber-500/50 bg-amber-500/10 text-amber-500"
            )}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Star className={cn("h-4 w-4", showFavoritesOnly && "fill-current")} />
            Favorites
          </Button>

          {/* Tag filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "gap-2 border-border/50",
                  selectedTag && "border-primary/50 bg-primary/10"
                )}
              >
                <Filter className="h-4 w-4" />
                {selectedTag ?? "All Tags"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-border/50 bg-card/95 backdrop-blur-xl">
              <DropdownMenuItem
                onClick={() => setSelectedTag(null)}
                className={cn(!selectedTag && "bg-primary/10")}
              >
                All Tags
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {tags.map((tag) => (
                <DropdownMenuItem
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={cn(selectedTag === tag && "bg-primary/10")}
                >
                  {tag}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear filters */}
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Contacts List */}
      {filteredContacts.length === 0 ? (
        <Card className="border-0 bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground">
              {contacts.length === 0 ? "No contacts yet" : "No contacts found"}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {contacts.length === 0
                ? "Start building your network by adding your first contact."
                : "Try adjusting your search or filters."}
            </p>
            {contacts.length === 0 && (
              <Button onClick={() => setShowForm(true)} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Add First Contact
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {letters.map((letter) => (
            <div key={letter}>
              {/* Letter header */}
              <div className="sticky top-0 z-10 flex items-center gap-2 py-2 bg-background/80 backdrop-blur-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <span className="text-sm font-bold text-primary">{letter}</span>
                </div>
                <div className="flex-1 h-px bg-border/30" />
                <span className="text-xs text-muted-foreground">
                  {groupedContacts[letter].length}
                </span>
              </div>

              {/* Contacts in this letter group */}
              <div className="space-y-2 mt-2">
                {groupedContacts[letter].map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseForm}
          />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-auto">
            <ContactForm
              contact={editingContact}
              onClose={handleCloseForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}
