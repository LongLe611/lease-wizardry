
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Lease } from "../types";

export function useLeaseDeletion() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async (selectedLeases: string[], onSuccess?: () => void) => {
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('leases')
        .delete()
        .in('id', selectedLeases);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      queryClient.setQueryData(['leases'], (oldData: Lease[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(lease => !selectedLeases.includes(lease.id));
      });
      
      toast({
        title: "Success",
        description: `${selectedLeases.length} lease(s) deleted successfully`
      });

      await queryClient.invalidateQueries({ queryKey: ['leases'] });
      
      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete leases",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return {
    showDeleteDialog,
    setShowDeleteDialog,
    isDeleting,
    handleDelete
  };
}
