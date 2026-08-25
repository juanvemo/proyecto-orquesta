import { supabase } from "@/integrations/supabase/client";
import type { MusicTask, TaskFormValues, TaskStatus } from "./types";

const taskSelect = "*,instrument:instruments(id,name),song:songs(id,name,status),rehearsal:rehearsals(id,name,rehearsal_date,start_time,location),event:events(id,name,event_date),music_task_assignees(*,musician:musicians(id,user_id,first_name,last_name,specialty,photo_url)),music_task_comments(*),music_task_attachments(*)";

export async function listMusicTasks(organizationId: string) {
  const { data, error } = await supabase.from("music_tasks").select(taskSelect).eq("organization_id", organizationId).order("due_at", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as unknown as MusicTask[];
}

export async function createMusicTask(organizationId: string, values: TaskFormValues) {
  const { data, error } = await supabase.rpc("create_music_task", { task_data: { ...values, organization_id: organizationId, assigned_at: values.assigned_at ? new Date(values.assigned_at).toISOString() : null, due_at: values.due_at ? new Date(values.due_at).toISOString() : null }, selected_musician_ids: values.musician_ids });
  if (error) throw error;
  return data as string;
}

export async function updateTaskStatus(assigneeId: string, status: TaskStatus, comment = "") {
  const { error } = await supabase.rpc("update_music_task_status", { target_assignee_id: assigneeId, next_status: status, completion_note: comment || null });
  if (error) throw error;
}

export async function addTaskComment(organizationId: string, taskId: string, userId: string, comment: string) {
  const { error } = await supabase.from("music_task_comments").insert({ organization_id: organizationId, task_id: taskId, author_user_id: userId, comment: comment.trim() });
  if (error) throw error;
}

export async function uploadTaskEvidence(organizationId: string, taskId: string, assigneeId: string, userId: string, file: File) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${organizationId}/${taskId}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage.from("task-evidence").upload(path, file, { contentType: file.type });
  if (uploadError) throw uploadError;
  const { error } = await supabase.from("music_task_attachments").insert({ organization_id: organizationId, task_id: taskId, assignee_id: assigneeId, uploaded_by: userId, file_name: file.name, file_path: path, mime_type: file.type, file_size: file.size });
  if (error) throw error;
}

export async function openTaskEvidence(path: string) {
  const { data, error } = await supabase.storage.from("task-evidence").createSignedUrl(path, 300);
  if (error) throw error;
  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}
