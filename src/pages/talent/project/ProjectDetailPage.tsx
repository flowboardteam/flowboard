"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, FolderKanban, List, LayoutGrid, Loader2, MoreVertical, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const getSupabaseUser = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!session?.user) throw new Error("Not authenticated");
  return session.user;
};

interface Project {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
}

interface Board {
  id: string;
  project_id: string;
  name: string;
  department: string;
  description: string | null;
  created_at: string;
}

interface Card {
  id: string;
  board_id: string;
  project_id: string;
  title: string;
  created_at: string;
}

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [cards, setCards] = useState<Record<string, Card[]>>({});
  const [cardInputs, setCardInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [viewMode, setViewMode] = useState<"box"|"list">("box");

  const loadCards = useCallback(async (boardIds: string[]) => {
    if (boardIds.length === 0) {
      setCards({});
      return;
    }

    const { data: cardRows, error } = await supabase
      .from("project_cards")
      .select("id, board_id, project_id, title, created_at")
      .in("board_id", boardIds)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      setCards({});
      return;
    }

    const cardMap = (cardRows ?? []).reduce<Record<string, Card[]>>((acc, card: any) => {
      const normalized: Card = {
        id: card.id,
        board_id: card.board_id,
        project_id: card.project_id,
        title: card.title,
        created_at: card.created_at,
      };
      acc[normalized.board_id] = [...(acc[normalized.board_id] ?? []), normalized];
      return acc;
    }, {});

    setCards(cardMap);
  }, []);

  const fetchProjectAndBoards = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const { data: projRows, error: projError } = await supabase
        .from("projects")
        .select("id, name, description")
        .eq("id", projectId)
        .single();

      if (projError || !projRows) {
        setNotFound(true);
        return;
      }

      setProject(projRows as Project);

      const { data: boardRows, error: boardError } = await supabase
        .from("project_boards")
        .select("id, project_id, name, department, description, created_at")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (boardError) {
        console.error(boardError);
        return;
      }

      const normalizedBoards = (boardRows ?? []) as Board[];
      setBoards(normalizedBoards);
      await loadCards(normalizedBoards.map(board => board.id));
    } catch (error) {
      console.error(error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [projectId, loadCards]);

  const handleCardInputChange = (boardId: string, value: string) => {
    setCardInputs(prev => ({
      ...prev,
      [boardId]: value,
    }));
  };

  const handleCreateCard = async (boardId: string) => {
    const title = (cardInputs[boardId] ?? "").trim();
    if (!title || !projectId) return;

    setLoading(true);
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;
      if (!session?.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("project_cards")
        .insert({
          project_id: projectId,
          board_id: boardId,
          organization_id: session.user.id,
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
        .select("id, board_id, project_id, title, created_at")
        .single();

      if (error) throw error;
      if (data) {
        setCards(prev => ({
          ...prev,
          [boardId]: [...(prev[boardId] ?? []), data],
        }));
        setCardInputs(prev => ({
          ...prev,
          [boardId]: "",
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCard = async (card: Card) => {
    const title = prompt("Edit card title", card.title)?.trim();
    if (!title || title === card.title) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("project_cards")
        .update({ title })
        .eq("id", card.id);
      if (error) throw error;
      setCards(prev => prev.map(existing => (existing.id === card.id ? { ...existing, title } : existing)));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Delete this card?")) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("project_cards").delete().eq("id", cardId);
      if (error) throw error;
      setCards(prev => prev.filter(card => card.id !== cardId));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const [watchedBoards, setWatchedBoards] = useState<Record<string, boolean>>({});

  const handleAddCardToBoard = async (boardId: string) => {
    const title = prompt("Add card title")?.trim();
    if (!title || !projectId) return;

    setLoading(true);
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;
      if (!session?.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("project_cards")
        .insert({
          project_id: projectId,
          board_id: boardId,
          organization_id: session.user.id,
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
        .select("id, board_id, project_id, title, created_at")
        .single();

      if (error) throw error;
      if (data) {
        setCards(prev => ({
          ...prev,
          [boardId]: [...(prev[boardId] ?? []), data],
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateBoard = async (board: Board) => {
    const name = prompt("Duplicate board name", `${board.name} copy`)?.trim();
    if (!name) return;

    setLoading(true);
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;
      if (!session?.user) throw new Error("Not authenticated");

      const { data: newBoard, error: boardError } = await supabase
        .from("project_boards")
        .insert({
          project_id: projectId,
          organization_id: session.user.id,
          name,
          department: board.department,
          description: board.description,
        })
        .select("id, project_id, name, department, description, created_at")
        .single();

      if (boardError || !newBoard) throw boardError || new Error("Unable to duplicate board");

      const existingCards = cards[board.id] ?? [];
      if (existingCards.length > 0) {
        const { error: cardError } = await supabase
          .from("project_cards")
          .insert(existingCards.map(card => ({
            project_id: projectId,
            board_id: newBoard.id,
            organization_id: session.user.id,
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

      setBoards(prev => [newBoard, ...prev]);
      setCards(prev => ({ ...prev, [newBoard.id]: [] }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveBoard = async (board: Board) => {
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

      setBoards(prev => prev.filter(b => b.id !== board.id));
      setCards(prev => {
        const next = { ...prev };
        delete next[board.id];
        return next;
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWatchBoard = (boardId: string) => {
    setWatchedBoards(prev => ({ ...prev, [boardId]: !prev[boardId] }));
  };

  const handleEditBoard = async (board: Board) => {
    const name = prompt("Rename board", board.name)?.trim();
    if (!name || name === board.name) return;

    const department = prompt("Update board department", board.department)?.trim() ?? board.department;
    const description = prompt("Update board description", board.description ?? "")?.trim() ?? board.description;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("project_boards")
        .update({ name, department, description: description || null })
        .eq("id", board.id);

      if (error) throw error;
      setBoards(prev => prev.map(b => (b.id === board.id ? { ...b, name, department, description: description || null } : b)));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    if (!confirm("Delete this board and its cards? This cannot be undone.")) return;

    setLoading(true);
    try {
      await supabase.from("project_cards").delete().eq("board_id", boardId);
      const { error } = await supabase.from("project_boards").delete().eq("id", boardId);
      if (error) throw error;
      setBoards(prev => prev.filter(board => board.id !== boardId));
      setCards(prev => {
        const next = { ...prev };
        delete next[boardId];
        return next;
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectAndBoards();
  }, [fetchProjectAndBoards]);

  useEffect(() => {
    if (!projectId) return;

    const channel = supabase.channel(`project-detail-${projectId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "projects", filter: `id=eq.${projectId}` }, () => {
        fetchProjectAndBoards();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, fetchProjectAndBoards]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading project boards...</p>
        </div>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="w-full rounded-3xl border border-[var(--border-color)] bg-[var(--card-bg)] p-10 text-center">
        <p className="text-lg font-extrabold text-slate-900">Project not found</p>
        <p className="mt-3 text-sm text-slate-500">This project may not be assigned or accessible to your account.</p>
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
            <FolderKanban className="w-3.5 h-3.5" /> Project Boards
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold dark:text-white tracking-tight">{project.name}</h1>
            {project.description && <p className="mt-2 text-sm text-slate-500">{project.description}</p>}
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <button
                type="button"
                onClick={() => setViewMode("box")}
                className={`inline-flex items-center justify-center rounded-2xl px-3 py-2 transition ${viewMode === "box" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`inline-flex items-center justify-center rounded-2xl px-3 py-2 transition ${viewMode === "list" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to projects
        </button>
      </div>

      {boards.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <p className="text-lg font-bold text-slate-950">No lists found</p>
          <p className="mt-2 text-sm text-slate-500">This project has no lists yet.</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {boards.map(board => (
            <div
              key={board.id}
              className="rounded-3xl border border-[var(--border-color)] bg-white p-6 shadow-sm min-w-[320px] cursor-pointer transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={e => {
                const target = e.target as HTMLElement;
                if (target.closest("button")) return;
                navigate(`/talent/project/${project.id}/board/${board.id}`);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate(`/talent/project/${project.id}/board/${board.id}`);
                }
              }}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">{board.department}</p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">{board.name}</h2>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      onClick={event => event.stopPropagation()}
                      className="inline-flex items-center justify-center rounded-full p-2 text-slate-500 hover:bg-slate-100 transition"
                      aria-label="Board menu"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-2xl border-[var(--border-color)] bg-white p-1 shadow-2xl">
                    <DropdownMenuItem
                      onClick={event => {
                        event.stopPropagation();
                        handleAddCardToBoard(board.id);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700"
                    >
                      <Plus className="w-4 h-4" /> Add card
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={event => {
                        event.stopPropagation();
                        handleDuplicateBoard(board);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700"
                    >
                      <Plus className="w-4 h-4 rotate-45" /> Duplicate list
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={event => {
                        event.stopPropagation();
                        handleMoveBoard(board);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700"
                    >
                      <ArrowLeft className="w-4 h-4 rotate-180" /> Move list
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={event => {
                        event.stopPropagation();
                        toggleWatchBoard(board.id);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700"
                    >
                      {watchedBoards[board.id] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                      {watchedBoards[board.id] ? "Unwatch" : "Watch"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={event => {
                        event.stopPropagation();
                        handleEditBoard(board);
                      }}
                      className="px-3 py-2 text-sm text-slate-700"
                    >
                      Rename list
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={event => {
                        event.stopPropagation();
                        handleDeleteBoard(board.id);
                      }}
                      className="px-3 py-2 text-sm text-red-600"
                    >
                      Delete list
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {board.description && <p className="mb-4 text-sm text-slate-500">{board.description}</p>}
              <div className="flex flex-col gap-3 text-sm text-slate-500">
                <span>{(cards[board.id] ?? []).length} card{(cards[board.id] ?? []).length === 1 ? "" : "s"}</span>
                <span>{board.created_at ? `Created ${new Date(board.created_at).toLocaleDateString()}` : "Created date unknown"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
