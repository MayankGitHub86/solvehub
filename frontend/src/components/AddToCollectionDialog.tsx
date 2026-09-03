import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Folder } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/auth";
import { CreateCollectionDialog } from "./CreateCollectionDialog";

interface AddToCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionId: string;
}

export function AddToCollectionDialog({
  open,
  onOpenChange,
  questionId,
}: AddToCollectionDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  // Fetch user's collections
  const { data: collectionsData, isLoading } = useQuery({
    queryKey: ["collections", user?.id],
    queryFn: async () => {
      const res: any = await api.getUserCollections();
      return res.data;
    },
    enabled: !!user && open,
  });

  const collections = collectionsData || [];

  // Add to collection mutation
  const addToCollectionMutation = useMutation({
    mutationFn: (collectionId: string) =>
      api.addQuestionToCollection(collectionId, questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success("Added to collection!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || "Failed to add to collection");
    },
  });

  // Create collection mutation
  const createCollectionMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      api.createCollection(data),
    onSuccess: () => {
      toast.success("Collection created!");
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || "Failed to create collection");
    },
  });

  const handleToggleCollection = (collectionId: string) => {
    if (selectedCollections.includes(collectionId)) {
      setSelectedCollections(prev => prev.filter(id => id !== collectionId));
    } else {
      setSelectedCollections(prev => [...prev, collectionId]);
      addToCollectionMutation.mutate(collectionId);
    }
  };

  const handleCreateCollection = (data: { name: string; description?: string }) => {
    createCollectionMutation.mutate(data);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add to Collection</DialogTitle>
            <DialogDescription>
              Choose which collections to add this question to
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Create New Collection Button */}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Collection
            </Button>

            {/* Collections List */}
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading collections...
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-8">
                <Folder className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">
                  No collections yet. Create one to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {collections.map((collection: any) => (
                  <div
                    key={collection.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleToggleCollection(collection.id)}
                  >
                    <Checkbox
                      checked={selectedCollections.includes(collection.id)}
                      onCheckedChange={() => handleToggleCollection(collection.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{collection.name}</p>
                      {collection.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {collection.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {collection._count?.questions || 0} questions
                      </p>
                    </div>
                    <Folder className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Collection Dialog */}
      <CreateCollectionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateCollection}
      />
    </>
  );
}
