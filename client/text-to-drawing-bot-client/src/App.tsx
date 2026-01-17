import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

import type { DrawingData } from "./types/drawing";
import { normalizeDrawingData } from "./drawing/normalize";

import { AuthPanel } from "./components/authPanel/authPanel";
import { UserBar } from "./components/userBar/userBar";

import {
  interpretPrompt,
  me,
  loadDrawing,
  listMyDrawings,
  saveDrawing,
} from "./services/api";
import { PromptInput } from "./components/promptInput/promptInput";
import { CanvasBoard } from "./components/canvasBar/canvasBoard";

const EMPTY: DrawingData = {
  width: 500,
  height: 400,
  background: "#ffffff",
  commands: [],
};

type HistoryState = {
  past: DrawingData[];
  present: DrawingData;
  future: DrawingData[];
};

type ChatMsg = {
  role: "user" | "bot";
  text: string;
};

export default function App() {
  // -------------------------
  // Auth
  // -------------------------
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);

  // -------------------------
  // Drawing / History
  // -------------------------
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: EMPTY,
    future: [],
  });

  const current = history.present;
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  // -------------------------
  // Chat
  // -------------------------
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const chatRef = useRef<HTMLDivElement | null>(null);

  // auto-scroll chat to bottom
  useEffect(() => {
    if (!chatRef.current) return;
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chat]);

  // -------------------------
  // Save/Load (server drawings)
  // -------------------------
  const [title, setTitle] = useState("My drawing");
  const [myDrawings, setMyDrawings] = useState<
    { id: number; title: string; createdAt: string }[]
  >([]);
  const [loadingList, setLoadingList] = useState(false);

  // -------------------------
  // Helpers
  // -------------------------
  const refreshMe = async () => {
    setLoadingMe(true);
    try {
      const u = await me();
      setUserEmail(u.email);
    } catch {
      setUserEmail(null);
    } finally {
      setLoadingMe(false);
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  useEffect(() => {
    setMyDrawings([]);
    applyNewDrawing(EMPTY);
    if (userEmail) {
      refreshMyDrawings();
    }
  }, [userEmail]);

  const logout = () => {
    localStorage.removeItem("token");
    setUserEmail(null);
    setMyDrawings([]);
    setChat([]);
  };

  const applyNewDrawing = (next: DrawingData) => {
    setHistory((h) => ({
      past: [...h.past, h.present],
      present: next,
      future: [],
    }));
  };
  
  const onUndo = () => {
    setHistory((h) => {
      if (h.past.length === 0) return h;
      const previous = h.past[h.past.length - 1];
      const newPast = h.past.slice(0, -1);
      return {
        past: newPast,
        present: previous,
        future: [h.present, ...h.future],
      };
    });
  };

  const onRedo = () => {
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const next = h.future[0];
      const newFuture = h.future.slice(1);
      return {
        past: [...h.past, h.present],
        present: next,
        future: newFuture,
      };
    });
  };

  const onClear = () => {
    applyNewDrawing(EMPTY);
    setChat((c) => [...c, { role: "bot", text: "ניקיתי את הציור ✅" }]);
  };

  const onSubmitPrompt = async (prompt: string) => {
    const p = (prompt ?? "").trim();
    if (!p) return;
    setChat((c) => [...c, { role: "user", text: p }]);
    try {
      setLoading(true);
      const res = await interpretPrompt(p);
      const raw = JSON.parse(res.commandsJson);
      const normalized = normalizeDrawingData(raw);
      const merged: DrawingData = {
        width: current.width,
        height: current.height,
        background: current.background,
        commands: [...current.commands, ...normalized.commands],
      };
      applyNewDrawing(merged);
      setChat((c) => [
        ...c,
        { role: "bot", text: "ציירתי ✅ (אפשר להמשיך עם הוראה נוספת)" },
      ]);
    } catch (e: any) {
      console.error(e);
      setChat((c) => [
        ...c,
        { role: "bot", text: `שגיאה: ${e?.message ?? "Error"}` },
      ]);
      alert(e?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  };

  const refreshMyDrawings = async () => {
    setLoadingList(true);
    try {
      const list = await listMyDrawings();
      setMyDrawings(list);
    } catch (e: any) {
      alert(e?.message ?? "Failed to load drawings");
    } finally {
      setLoadingList(false);
    }
  };

  const onSaveToServer = async () => {
    if (!userEmail) {
      alert("Please login to save drawings");
      return;
    }
    try {
      const commandsJson = JSON.stringify(current);
      const res = await saveDrawing({ title, commandsJson });
      alert(`Saved! id=${res.id}`);
      setChat((c) => [
        ...c,
        { role: "bot", text: `שמירה בוצעה ✅ (id=${res.id})` },
      ]);
      await refreshMyDrawings();
      applyNewDrawing(EMPTY);
    } catch (e: any) {
      alert(e?.message ?? "Save failed");
    }
  };

  const onLoadFromServer = async (id: number) => {
    try {
      const d = await loadDrawing(id);
      const parsed = JSON.parse(d.commandsJson);
      const normalized = normalizeDrawingData(parsed);
      applyNewDrawing(normalized);
      setChat((c) => [
        ...c,
        { role: "bot", text: `טענתי ציור #${id} ✅` },
      ]);
    } catch (e: any) {
      alert(e?.message ?? "Load failed");
    }
  };

  const drawingsCountLabel = useMemo(() => {
    if (!userEmail) return "";
    if (loadingList) return "Loading...";
    return myDrawings.length ? `${myDrawings.length} drawings` : "No drawings yet";
  }, [userEmail, loadingList, myDrawings.length]);

  // -------------------------
  // Render
  // -------------------------
  if (loadingMe) {
    return <div className="app-container" style={{padding: 20}}><h2>Loading...</h2></div>;
  }

  return (
    <div className="app-container">
      {!userEmail ? (
        /* --- שלב 1: מסך כניסה בלבד --- */
        <div className="login-wrapper">
           <AuthPanel onAuthed={refreshMe} />
        </div>
      ) : (
        /* --- שלב 2: האפליקציה המלאה לאחר כניסה --- */
        <>
          <div className="top-toolbar">
            <select 
              className="drawing-select"
              onChange={(e) => onLoadFromServer(Number(e.target.value))}
              defaultValue=""
            >
              <option value="" disabled>Choose a drawing...</option>
              {myDrawings.map(d => (
                <option key={d.id} value={d.id}>Drawing #{d.id} - {d.title}</option>
              ))}
            </select>

            <button className="btn-toolbar btn-new" onClick={() => applyNewDrawing(EMPTY)}>
              + New Drawing
            </button>
            
            <button className="btn-toolbar btn-send" onClick={onSaveToServer}>
              Send
            </button>

            <button className="btn-toolbar btn-undo" onClick={onUndo} disabled={!canUndo}>
              Undo
            </button>

            <button className="btn-toolbar btn-redo" onClick={onRedo} disabled={!canRedo} style={{backgroundColor: '#6c757d'}}>
              Redo
            </button>

            <button className="btn-toolbar btn-clear" onClick={onClear}>
              Clear
            </button>

            <button className="btn-toolbar btn-save" onClick={onSaveToServer}>
              Save
            </button>
          </div>

          <div className="main-layout">
            <div className="chat-area">
              <UserBar email={userEmail} onLogout={logout} />
              
              <div className="chat-box" ref={chatRef}>
                {chat.length === 0 ? (
                  <div style={{ opacity: 0.5, textAlign: 'center' }}>
                  Write a command like <b>"Draw a sun"</b>
                  </div>
                ) : (
                  chat.map((m, idx) => (
                    <div key={idx} className={`chat-msg ${m.role}`}>
                      {m.text}
                    </div>
                  ))
                )}
              </div>

              <div style={{ padding: 10 }}>
                <PromptInput onSubmit={onSubmitPrompt} loading={loading} />
              </div>

              <div style={{ padding: 10, fontSize: 11, borderTop: '1px solid #eee', display: 'flex', gap: 5, alignItems: 'center' }}>
                <input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Title..." 
                  style={{padding: '2px 5px', borderRadius: 4, border: '1px solid #ccc'}}
                />
                <span> {drawingsCountLabel}</span>
              </div>
            </div>

            <div className="canvas-wrapper">
              <CanvasBoard data={current} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}