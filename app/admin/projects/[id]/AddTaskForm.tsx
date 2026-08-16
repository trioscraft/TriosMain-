"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";

export default function AddTaskForm({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function recalculateProjectProgress() {
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("progress")
      .eq("project_id", projectId);

    if (error) {
      console.error("Task Fetch Error:", error);
      return;
    }

    if (!tasks || tasks.length === 0) {
      return;
    }

    const total = tasks.reduce(
      (sum, task) => sum + Number(task.progress || 0),
      0
    );

    const average = Math.round(
      total / tasks.length
    );

    console.log("Tasks:", tasks);
    console.log("Total:", total);
    console.log("Average:", average);

    const { error: updateError } =
      await supabase
        .from("projects")
        .update({
          progress: average,
          status:
            average === 100
              ? "completed"
              : "active",
        })
        .eq("id", projectId);

    if (updateError) {
      console.error(
        "Project Update Error:",
        updateError
      );
    }
  }

  async function addTask() {
    if (!title.trim()) return;

    setLoading(true);

    const { error } = await supabase
      .from("tasks")
      .insert([
        {
          project_id: projectId,
          title,
          progress: 0,
          status: "todo",
        },
      ]);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    await recalculateProjectProgress();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id ?? "";
    let userName = "Unknown";

    if (user?.email) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("email", user.email)
        .single();
      if (profile?.name) {
        userName = profile.name;
      }
    }

    await logActivity({
      userId,
      userName,
      action: `created task ${title}`,
      projectId,
      projectName,
    });

    setTitle("");
    setOpen(false);
    setLoading(false);

    window.location.reload();
  }

  return (
    <>
      <style>{`
        .add-task-form {
          transition: all 0.25s ease;
        }
      `}</style>

      {!open ? (
        <button
          className="btn"
          onClick={() => setOpen(true)}
          style={{
            width: "100%",
            justifyContent: "center",
            padding: "14px",
            borderStyle: "dashed",
            color: "var(--text-tertiary)",
            fontSize: "14px",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: "18px",
              lineHeight: 1,
            }}
          >
            +
          </span>
          Add a task
        </button>
      ) : (
        <div
          className="card add-task-form"
          style={{
            padding: "20px",
            animation:
              "scaleIn 0.2s ease both",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <input
              className="input"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  addTask();

                if (e.key === "Escape")
                  setOpen(false);
              }}
              autoFocus
              style={{ flex: 1 }}
            />

            <button
              className="btn btn-primary"
              onClick={addTask}
              disabled={
                loading || !title.trim()
              }
              style={{
                opacity: !title.trim()
                  ? 0.5
                  : 1,
                flexShrink: 0,
              }}
            >
              {loading
                ? "Adding..."
                : "Add"}
            </button>

            <button
              className="btn"
              onClick={() =>
                setOpen(false)
              }
              style={{
                flexShrink: 0,
                color:
                  "var(--text-tertiary)",
              }}
            >
              ✕
            </button>
          </div>

          <p
            style={{
              fontSize: "11px",
              color:
                "var(--text-tertiary)",
              marginTop: "8px",
            }}
          >
            Press Enter to add · Esc to
            cancel
          </p>
        </div>
      )}
    </>
  );
}