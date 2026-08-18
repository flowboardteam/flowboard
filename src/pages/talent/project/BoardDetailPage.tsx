"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit3, Eye, EyeOff, FolderKanban, Loader2, MoreVertical, Plus, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";

const getSupabaseUser = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!session?.user) throw new Error("Not authenticated");
  return session.user;
};

interface Board {
  id: string;
  project_id: string;
  name: string;
  department: string;
  description: string | null;
}

interface Card {
  id: string;
  board_id: string;
  project_id: string;
  title: string;
  labels: string[];
  start_date: string | null;
  due_date: string | null;
  reminder: string | null;
  checklist: unknown[];
  members: string[];
  attachments: number;
  custom_fields: unknown[];
  created_at: string;
}

export default function BoardDetailPage() {
  const { projectId, boardId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState<Board | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [watchedBoards, setWatchedBoards] = useState<Record<string, boolean>>({});

  const fetchBoardAndCards = useCallback(async () => {
    if (!projectId || !boardId) return;
    setLoading(true);
    try {
      const { data: boardRows, error: boardError } = await supabase
        .from("project_boards")
        .select("id, project_id, name, department, description")
        .eq("id", boardId)
        .eq("project_id", projectId)
        .single();

      if (boardError || !boardRows) {
        setNotFound(true);
        return;
      }

      setBoard(boardRows as Board);

      const { data: cardRows, error: cardError } = await supabase
        .from("project_cards")
        .select("id, board_id, project_id, title, labels, start_date, due_date, reminder, checklist, members, attachments, custom_fields, created_at")
        .eq("board_id", boardId)
        .order("created_at", { ascending: true });

      if (cardError) {
        console.error(cardError);
        setCards([]);
      } else {
        setCards((cardRows ?? []) as Card[]);
      }
    } catch (error) {
      console.error(error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [projectId, boardId]);

  const handleCreateCard = async () => {
    const title = newCardTitle.trim();
    if (!title || !projectId || !boardId) return;
    setSaving(true);

    try {
      const user = await getSupabaseUser();
      const { data, error } = await supabase
        .from("project_cards")
        .insert({
          project_id: projectId,
          board_id: boardId,
          organization_id: user.id,
          group_id: null,
          title,
          labels: [],
          start_date: null,
          due_date: null,
          reminder: null,
          checklist: [],
          members: [],
          attachments: 0,
          custom_fields: [],
        })
        .select("id, board_id, project_id, title, labels, start_date, due_date, reminder, checklist, members, attachments, custom_fields, created_at")
        .single();

      if (error) throw error;
      if (data) {
        setCards(prev => [...prev, data]);
        setNewCardTitle("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleEditBoard = async () => {
    if (!board) return;
    const name = prompt("Rename board", board.name)?.trim();
    if (!name || name === board.name) return;
    const description = prompt("Update board description", board.description ?? "")?.trim() ?? board.description;
    const department = prompt("Update board department", board.department)?.trim() ?? board.department;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("project_boards")
        .update({ name, description: description || null, department })
        .eq("id", board.id);
      if (error) throw error;
      setBoard({ ...board, name, department, description: description || null });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBoard = async () => {
    if (!board || !projectId) return;
    if (!confirm("Delete this list?")) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("project_boards").delete().eq("id", board.id);
      if (error) throw error;
      await supabase.from("project_cards").delete().eq("board_id", board.id);
      navigate(`/talent/project/${projectId}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Delete this card?")) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("project_cards").delete().eq("id", cardId);
      if (error) throw error;
      setCards(prev => prev.filter(card => card.id !== cardId));
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleEditCard = async (card: Card) => {
    const title = prompt("Edit card title", card.title)?.trim();
    if (!title || title === card.title) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("project_cards")
        .update({ title })
        .eq("id", card.id);
      if (error) throw error;
      setCards(prev => prev.map(item => (item.id === card.id ? { ...item, title } : item)));
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddCardToBoard = async () => {
    if (!board || !projectId) return;
    const title = prompt("Add card title")?.trim();
    if (!title) return;
    setSaving(true);

    try {
      const user = await getSupabaseUser();
      const { data, error } = await supabase
        .from("project_cards")
        .insert({
          project_id: projectId,
          board_id: board.id,
          organization_id: user.id,
          title,
          labels: [],
          start_date: null,
          due_date: null,
          reminder: null,
          checklist: [],
          members: [],
          attachments: 0,
          custom_fields: [],
        })
        .select("id, board_id, project_id, title, labels, start_date, due_date, reminder, checklist, members, attachments, custom_fields, created_at")
        .single();

      if (error) throw error;
      if (data) {
        setCards(prev => [...prev, data]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicateBoard = async () => {
    if (!board) return;
    const name = prompt("Duplicate board name", `${board.name} copy`)?.trim();
    if (!name) return;

    setLoading(true);
    try {
      const user = await getSupabaseUser();
      const { data: newBoard, error: boardError } = await supabase
        .from("project_boards")
        .insert({
          project_id: projectId,
          organization_id: user.id,
          name,
          department: board.department,
          description: board.description,
        })
        .select("id")
        .single();

      if (boardError || !newBoard) throw boardError || new Error("Unable to duplicate board");

      if (cards.length > 0) {
        const { error: cardError } = await supabase
          .from("project_cards")
          .insert(cards.map(card => ({
            project_id: projectId,
            board_id: newBoard.id,
            organization_id: user.id,
            title: card.title,
            labels: card.labels ?? [],
            start_date: card.start_date ?? null,
            due_date: card.due_date ?? null,
            reminder: card.reminder ?? null,
            checklist: card.checklist ?? [],
            members: card.members ?? [],
            attachments: card.attachments ?? 0,
            custom_fields: card.custom_fields ?? [],
          })));
        if (cardError) throw cardError;
      }

      alert("Board duplicated successfully.");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveBoard = async () => {
    if (!board) return;
    const destinationProjectId = prompt("Enter the destination project ID", projectId)?.trim();
    if (!destinationProjectId || destinationProjectId === projectId) return;

    setLoading(true);
    try {
      const { error: boardError } = await supabase
        .from("project_boards")
        .update({ project_id: destinationProjectId })
        .eq("id", board.id);
      if (boardError) throw boardError;

      const { error: cardError } = await supabase
        .from("project_cards")
        .update({ project_id: destinationProjectId })
        .eq("board_id", board.id);
      if (cardError) throw cardError;

      navigate(`/talent/project/${destinationProjectId}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWatchBoard = (boardId: string) => {
    setWatchedBoards(prev => ({ ...prev, [boardId]: !prev[boardId] }));
  };

  useEffect(() => {
    fetchBoardAndCards();
  }, [fetchBoardAndCards]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading board list...</p>
        </div>
      </div>
    );
  }

  if (notFound || !board) {
    return (
      <div className="w-full rounded-3xl border border-[var(--border-color)] bg-[var(--card-bg)] p-10 text-center">
        <p className="text-lg font-extrabold text-slate-900">Board not found</p>
        <p className="mt-3 text-sm text-slate-500">This board may not be assigned or accessible to your account.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-600 text-[11px] font-bold uppercase tracking-widest">
            <FolderKanban className="w-3.5 h-3.5" /> Board list
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">{board.name}</h1>
            {board.description && <p className="mt-2 text-sm text-slate-500">{board.description}</p>}
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">{board.department}</p>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <label className="block text-sm font-black uppercase tracking-[0.2em] text-slate-400">Add card</label>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={newCardTitle}
              onChange={e => setNewCardTitle(e.target.value)}
              placeholder="Card title"
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleCreateCard}
              disabled={saving || !newCardTitle.trim()}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 transition"
            >
              {saving ? "Saving..." : "Add card"}
            </button>
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <p className="text-lg font-bold text-slate-950">No list items yet</p>
            <p className="mt-2 text-sm text-slate-500">This board does not have any list items yet.</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {cards.map(card => (
              <div key={card.id} className="min-w-[320px] flex-shrink-0 rounded-3xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-950">{card.title}</h2>
                    <p className="mt-3 text-sm text-slate-500">Created {new Date(card.created_at).toLocaleDateString()}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        onClick={event => event.stopPropagation()}
                        className="inline-flex items-center justify-center rounded-full p-2 text-slate-500 hover:bg-slate-100 transition"
                        aria-label="Card actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 rounded-2xl border-[var(--border-color)] bg-white p-1 shadow-2xl">
                      <DropdownMenuItem
                        onClick={event => {
                          event.stopPropagation();
                          handleEditCard(card);
                        }}
                        className="px-3 py-2 text-sm text-slate-700"
                      >
                        Edit card
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={event => {
                          event.stopPropagation();
                          handleDeleteCard(card.id);
                        }}
                        className="px-3 py-2 text-sm text-red-600"
                      >
                        Delete card
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
