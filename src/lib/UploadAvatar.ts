import { supabase } from "@/lib/supabase";

export async function uploadGroupAvatar(groupId: string, file: File): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");

    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${groupId}-${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('group-avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('group-avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return null;
  }
}

export async function deleteGroupAvatar(avatarUrl: string): Promise<boolean> {
  try {
    // Extract file path from URL
    const urlParts = avatarUrl.split('/group-avatars/');
    if (urlParts.length < 2) return false;
    
    const filePath = urlParts[1];
    
    const { error } = await supabase.storage
      .from('group-avatars')
      .remove([filePath]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting avatar:", error);
    return false;
  }
}