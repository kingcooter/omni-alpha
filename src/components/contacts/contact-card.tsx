"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  User,
  Mail,
  Phone,
  Building2,
  Star,
  MoreHorizontal,
  Linkedin,
  Twitter,
  Globe,
  Trash2,
  Edit,
  Archive,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toggleFavorite, archiveContact } from "@/actions/contacts";
import { toast } from "sonner";
import type { Contact } from "@/lib/db/schema";

interface ContactCardProps {
  contact: Contact;
  onEdit?: (contact: Contact) => void;
}

export function ContactCard({ contact, onEdit }: ContactCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isFavorite, setIsFavorite] = useState(contact.isFavorite);

  const handleToggleFavorite = () => {
    const newValue = !isFavorite;
    setIsFavorite(newValue);
    startTransition(async () => {
      try {
        await toggleFavorite(contact.id, newValue);
      } catch {
        setIsFavorite(!newValue);
        toast.error("Failed to update favorite");
      }
    });
  };

  const handleArchive = () => {
    startTransition(async () => {
      try {
        await archiveContact(contact.id);
        toast.success("Contact archived");
      } catch {
        toast.error("Failed to archive contact");
      }
    });
  };

  const initials = contact.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="border-0 bg-card/60 hover:bg-card/80 transition-all group">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          {contact.avatar ? (
            <img
              src={contact.avatar}
              alt={contact.name}
              className="h-12 w-12 rounded-xl object-cover ring-2 ring-border/30"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-2 ring-primary/20">
              <span className="text-sm font-bold text-primary">{initials}</span>
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">
                {contact.name}
              </h3>
              {isFavorite && (
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              )}
            </div>

            {(contact.role || contact.company) && (
              <p className="text-sm text-muted-foreground truncate">
                {contact.role}
                {contact.role && contact.company && " at "}
                {contact.company}
              </p>
            )}

            {/* Tags */}
            {contact.tags && contact.tags.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {contact.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/50 text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
                {contact.tags.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{contact.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Contact methods */}
            <div className="flex items-center gap-3 mt-3">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="text-muted-foreground/60 hover:text-primary transition-colors"
                  title={contact.email}
                >
                  <Mail className="h-4 w-4" />
                </a>
              )}
              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="text-muted-foreground/60 hover:text-primary transition-colors"
                  title={contact.phone}
                >
                  <Phone className="h-4 w-4" />
                </a>
              )}
              {contact.linkedIn && (
                <a
                  href={contact.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground/60 hover:text-[#0077b5] transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {contact.twitter && (
                <a
                  href={contact.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground/60 hover:text-[#1da1f2] transition-colors"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {contact.website && (
                <a
                  href={contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground/60 hover:text-primary transition-colors"
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleToggleFavorite}
              disabled={isPending}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                isFavorite
                  ? "text-amber-400 hover:bg-amber-400/10"
                  : "text-muted-foreground/60 hover:text-amber-400 hover:bg-secondary"
              )}
            >
              <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-secondary transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-border/50 bg-card/95 backdrop-blur-xl">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(contact)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleArchive}
                  className="text-destructive focus:text-destructive"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Notes preview */}
        {contact.notes && (
          <p className="mt-3 text-xs text-muted-foreground/70 line-clamp-2 pl-16">
            {contact.notes}
          </p>
        )}

        {/* Context from AI */}
        {contact.context && (
          <div className="mt-3 pl-16">
            <p className="text-[10px] text-primary/70 italic line-clamp-1">
              {contact.context}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
