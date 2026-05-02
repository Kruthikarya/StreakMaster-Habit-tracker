import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code2,
  Droplets,
  Dumbbell,
  Flame,
  Home,
  Medal,
  MoreVertical,
  Plus,
  Settings,
  Sparkles,
  Trash2,
  Trophy,
  UserRound,
} from "lucide-react";
import "./styles.css";

const API_URL = "http://localhost:5000/api";
function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const today = toDateKey(new Date());
const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const dayFormatter = new Intl.DateTimeFormat("en-IN", { weekday: "long" });

const navItems = [
  { label: "Dashboard", icon: Home },
  { label: "Habits", icon: CalendarDays },
  { label: "Calendar", icon: CalendarDays },
  { label: "Analytics", icon: BarChart3 },
  { label: "Achievements", icon: Trophy },
  { label: "Accounts", icon: UserRound, adminOnly: true },
  { label: "Settings", icon: Settings },
];

const iconMap = {
  Activity,
  BookOpen,
  Code2,
  Droplets,
  Dumbbell,
  Flame,
  Sparkles,
};

const iconChoices = ["Dumbbell", "BookOpen", "Droplets", "Sparkles", "Code2"];
const palette = ["#635bff", "#18b777", "#f2a30f", "#ee4f8f", "#2f73da"];
const avatarOptions = ["🙂", "😎", "🤩", "🧘", "🏃", "💪"];

function shiftDate(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

function displayDate(dateKey) {
  return dateFormatter.format(new Date(`${dateKey}T00:00:00`));
}

function displayDay(dateKey) {
  return dayFormatter.format(new Date(`${dateKey}T00:00:00`));
}

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    username: "admin",
    password: "admin123",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submitAuth(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const endpoint = mode === "login" ? "login" : "register";
      const response = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Account request failed.");
      window.localStorage.setItem("sreakmater-user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-art">
        <div className="brand">
          <Flame size={25} />
          <div>
            <strong>StreakMater</strong>
            <small>Habit Tracker</small>
          </div>
        </div>
        <h1>Build streaks with your own account.</h1>
        <p>
          Unlock your potential by visualizing your consistency. Join a
          community of high-performers tracking their growth in real-time.
        </p>
      </section>

      <form className="auth-card" onSubmit={submitAuth}>
        <div>
          <p className="eyebrow">
            {mode === "login" ? "Welcome back" : "Create account"}
          </p>
          <h2>{mode === "login" ? "Sign in" : "Register"}</h2>
        </div>

        {mode === "register" && (
          <label>
            Name
            <input
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              placeholder="Your name"
              required
            />
          </label>
        )}

        <label>
          Username
          <input
            value={form.username}
            onChange={(event) =>
              setForm({ ...form, username: event.target.value })
            }
            placeholder="admin"
            required
          />
        </label>

        <label>
          Password
          <input
            minLength="4"
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            placeholder="admin123"
            required
          />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button className="primary-button" type="submit" disabled={busy}>
          {busy
            ? "Please wait"
            : mode === "login"
              ? "Sign in"
              : "Create account"}
        </button>

        <button
          className="link-button"
          type="button"
          onClick={() => {
            setError("");
            setMode(mode === "login" ? "register" : "login");
            setForm(
              mode === "login"
                ? { name: "", username: "", password: "" }
                : { name: "", username: "admin", password: "admin123" },
            );
          }}
        >
          {mode === "login"
            ? "Need an account? Register"
            : "Already have an account? Sign in"}
        </button>
      </form>
    </main>
  );
}

function AvatarBadge({ mood, avatar }) {
  return (
    <div
      className={`coach-avatar ${mood === "celebrate" ? "celebrate" : ""}`}
      aria-label="Animated habit coach"
    >
      <span>{avatar || "🙂"}</span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, helper, tone }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={21} />
      </div>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
        {helper && <small>{helper}</small>}
      </div>
    </article>
  );
}

function StatsGrid({ stats }) {
  return (
    <section className="stats-grid" aria-label="Habit stats">
      <StatCard
        icon={Flame}
        label="Current Streak"
        value={stats.totalStreak}
        helper="days"
        tone="purple"
      />
      <StatCard
        icon={Check}
        label="Habits Completed"
        value={stats.completedToday}
        helper="today"
        tone="green"
      />
      <StatCard
        icon={CalendarDays}
        label="Total Habits"
        value={stats.total}
        tone="gold"
      />
      <StatCard
        icon={BarChart3}
        label="Success Rate"
        value={`${stats.successRate}%`}
        helper="this week"
        tone="blue"
      />
    </section>
  );
}

function HabitRow({ habit, selectedDate, onToggle, onDelete }) {
  const Icon = iconMap[habit.icon] || Sparkles;
  const completed = habit.completedDates.includes(selectedDate);
  const activeDots = Math.min(7, Math.max(1, habit.streak));

  return (
    <article className="habit-row">
      <div className="habit-main">
        <span className="habit-symbol" style={{ "--habit-color": habit.color }}>
          <Icon size={24} />
        </span>
        <div>
          <h3>{habit.title}</h3>
          <p>{habit.category}</p>
        </div>
      </div>

      <div className="streak-cell">
        <Flame size={15} style={{ color: habit.color }} />
        <strong>{habit.streak}</strong>
        <span>day streak</span>
      </div>

      <div
        className="week-cell"
        aria-label={`${habit.title} weekly completion`}
      >
        {weekDays.map((day, index) => (
          <span className="day-dot-wrap" key={`${habit._id}-${day}-${index}`}>
            <small>{day}</small>
            <i
              className={index < activeDots ? "filled" : ""}
              style={{ "--habit-color": habit.color }}
            />
          </span>
        ))}
      </div>

      <button
        className={`status-button ${completed ? "completed" : ""}`}
        type="button"
        onClick={() => onToggle(habit._id, selectedDate)}
      >
        {completed ? "Completed" : "Mark as Done"}
      </button>

      <button
        className="icon-button"
        type="button"
        aria-label={`Delete ${habit.title}`}
        onClick={() => onDelete(habit._id)}
      >
        <Trash2 size={17} />
      </button>
    </article>
  );
}

function HabitsPanel({
  habits,
  status,
  selectedDate,
  title = "Today's Habits",
  onDateChange,
  onToggle,
  onDelete,
}) {
  return (
    <section className="habits-panel">
      <div className="panel-title-row">
        <h2>{title}</h2>
        <div className="date-control">
          <button
            type="button"
            aria-label="Previous day"
            onClick={() => onDateChange(shiftDate(selectedDate, -1))}
          >
            <ChevronLeft size={16} />
          </button>
          <span>
            <CalendarDays size={15} />
            {displayDay(selectedDate)}, {displayDate(selectedDate)}
          </span>
          <button
            type="button"
            className="today-jump"
            onClick={() => onDateChange(today)}
          >
            Today
          </button>
          <button
            type="button"
            aria-label="Next day"
            onClick={() => onDateChange(shiftDate(selectedDate, 1))}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {status === "loading" && <p className="state-text">Loading habits...</p>}
      {status === "error" && (
        <p className="state-text">Start the API server to load habits.</p>
      )}
      {status === "ready" && (
        <div className="habit-table">
          {habits.map((habit) => (
            <HabitRow
              habit={habit}
              key={habit._id}
              selectedDate={selectedDate}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ProgressCards({ stats }) {
  return (
    <section className="progress-grid">
      <article className="progress-card streak-graph">
        <p>Current Streak</p>
        <strong>{stats.totalStreak} Days</strong>
        <span>Best Streak: {stats.best} Days</span>
        <svg viewBox="0 0 260 98" role="img" aria-label="Current streak trend">
          <path d="M8 76 C34 35, 56 35, 78 64 S124 80, 148 42 S190 55, 210 23 S238 18, 252 8" />
          <circle cx="252" cy="8" r="5" />
        </svg>
      </article>

      <article className="progress-card weekly-progress">
        <p>Weekly Progress</p>
        <strong>{stats.successRate}%</strong>
        <div className="weekly-bar">
          <span style={{ width: `${stats.successRate}%` }} />
        </div>
        <small>Great job! Keep it up.</small>
      </article>
    </section>
  );
}

function DashboardView({
  habits,
  stats,
  status,
  selectedDate,
  onDateChange,
  onToggle,
  onDelete,
}) {
  return (
    <>
      <StatsGrid stats={stats} />
      <HabitsPanel
        habits={habits}
        status={status}
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        onToggle={onToggle}
        onDelete={onDelete}
      />
      <ProgressCards stats={stats} />
    </>
  );
}

function HabitsView({
  habits,
  status,
  stats,
  selectedDate,
  onDateChange,
  onToggle,
  onDelete,
}) {
  return (
    <>
      <div className="view-grid">
        <article className="view-card">
          <div className="mini-heading">
            <Dumbbell size={20} />
            <h2>Habit Library</h2>
          </div>
          <p>
            {stats.total} habits are active. Complete one today to grow your
            streak.
          </p>
        </article>
        <article className="view-card">
          <div className="mini-heading">
            <Check size={20} />
            <h2>Done Today</h2>
          </div>
          <p>
            {stats.completedToday} of {stats.total} habits completed.
          </p>
        </article>
      </div>
      <HabitsPanel
        habits={habits}
        status={status}
        selectedDate={selectedDate}
        title="All Habits"
        onDateChange={onDateChange}
        onToggle={onToggle}
        onDelete={onDelete}
      />
    </>
  );
}

function CalendarView({ habits, events, onAddEvent }) {
  const [eventForm, setEventForm] = useState({
    title: "",
    day: 23,
    color: "#635bff",
  });
  const calendarDays = Array.from({ length: 35 }, (_, index) => index + 1);
  const completionMap = habits.reduce((map, habit, index) => {
    map[(index * 5 + habit.streak) % 35 || 1] = habit.color;
    map[(index * 7 + habit.bestStreak) % 35 || 1] = habit.color;
    return map;
  }, {});
  const eventsByDay = events.reduce((map, event) => {
    map[event.day] = [...(map[event.day] || []), event];
    return map;
  }, {});

  function submitEvent(event) {
    event.preventDefault();
    onAddEvent({
      ...eventForm,
      id: `event-${Date.now()}`,
      day: Number(eventForm.day),
    });
    setEventForm({ title: "", day: 23, color: "#635bff" });
  }

  return (
    <div className="calendar-layout">
      <section className="calendar-panel">
        <div className="panel-title-row">
          <h2>Calendar</h2>
          <div className="date-control">
            <button type="button" aria-label="Previous month">
              <ChevronLeft size={16} />
            </button>
            <span>
              <CalendarDays size={15} />
              May 2025
            </span>
            <button type="button" aria-label="Next month">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className="calendar-weekdays">
          {weekDays.map((day, index) => (
            <span key={`${day}-${index}`}>{day}</span>
          ))}
        </div>
        <div className="calendar-grid">
          {calendarDays.map((day) => (
            <button
              className={
                completionMap[day] || eventsByDay[day] ? "has-completion" : ""
              }
              key={day}
              type="button"
            >
              <span>{day}</span>
              <div className="calendar-markers">
                {completionMap[day] && (
                  <i style={{ "--habit-color": completionMap[day] }} />
                )}
                {eventsByDay[day]?.map((item) => (
                  <i
                    key={item.id}
                    style={{ "--habit-color": item.color }}
                    title={item.title}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="event-panel">
        <div className="panel-title-row">
          <h2>Add Event</h2>
        </div>
        <form className="event-form" onSubmit={submitEvent}>
          <label>
            Event name
            <input
              value={eventForm.title}
              onChange={(event) =>
                setEventForm({ ...eventForm, title: event.target.value })
              }
              placeholder="Workout meetup"
              required
            />
          </label>
          <label>
            Day
            <input
              min="1"
              max="35"
              type="number"
              value={eventForm.day}
              onChange={(event) =>
                setEventForm({ ...eventForm, day: event.target.value })
              }
            />
          </label>
          <div className="swatches" aria-label="Choose event color">
            {palette.map((item) => (
              <button
                className={item === eventForm.color ? "active" : ""}
                key={item}
                style={{ "--swatch": item }}
                type="button"
                aria-label={`Use ${item}`}
                onClick={() => setEventForm({ ...eventForm, color: item })}
              />
            ))}
          </div>
          <button className="primary-button" type="submit">
            <Plus size={18} />
            Add Event
          </button>
        </form>

        <div className="event-list">
          {events.map((item) => (
            <article key={item.id}>
              <i style={{ "--habit-color": item.color }} />
              <span>{item.title}</span>
              <strong>May {item.day}</strong>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function AnalyticsView({ habits, stats }) {
  const topHabits = [...habits].sort((a, b) => b.streak - a.streak).slice(0, 5);

  return (
    <>
      <StatsGrid stats={stats} />
      <section className="analytics-panel">
        <div className="panel-title-row">
          <h2>Analytics</h2>
          <span className="soft-pill">Live habit data</span>
        </div>
        <div className="chart-list">
          {topHabits.map((habit) => (
            <div className="chart-row" key={habit._id}>
              <span>{habit.title}</span>
              <div>
                <i
                  style={{
                    width: `${Math.min(100, (habit.streak / Math.max(1, stats.best)) * 100)}%`,
                    background: habit.color,
                  }}
                />
              </div>
              <strong>{habit.streak}</strong>
            </div>
          ))}
        </div>
      </section>
      <ProgressCards stats={stats} />
    </>
  );
}

function AchievementsView({ stats }) {
  const achievements = [
    {
      title: "First Win",
      detail: "Complete any habit today.",
      done: stats.completedToday > 0,
      icon: Medal,
    },
    {
      title: "Streak Builder",
      detail: "Reach 10 total streak days.",
      done: stats.totalStreak >= 10,
      icon: Flame,
    },
    {
      title: "Collector",
      detail: "Track at least 5 habits.",
      done: stats.total >= 5,
      icon: Trophy,
    },
    {
      title: "High Focus",
      detail: "Reach 80% success rate.",
      done: stats.successRate >= 80,
      icon: BarChart3,
    },
  ];

  return (
    <section className="achievement-grid">
      {achievements.map(({ title, detail, done, icon: Icon }) => (
        <article
          className={`achievement-card ${done ? "unlocked" : ""}`}
          key={title}
        >
          <div className="achievement-icon">
            <Icon size={24} />
          </div>
          <h2>{title}</h2>
          <p>{detail}</p>
          <span>{done ? "Unlocked" : "Locked"}</span>
        </article>
      ))}
    </section>
  );
}

function SettingsView({ settings, onSettingsChange }) {
  return (
    <section className="settings-panel">
      <div className="panel-title-row">
        <h2>Settings</h2>
        <span className="soft-pill">Local preferences</span>
      </div>
      <label className="setting-row">
        <span>
          <Bell size={19} />
          Daily reminder
        </span>
        <input
          checked={settings.reminders}
          onChange={(event) =>
            onSettingsChange({ ...settings, reminders: event.target.checked })
          }
          type="checkbox"
        />
      </label>
      <label className="setting-row">
        <span>
          <Sparkles size={19} />
          Avatar animation
        </span>
        <input
          checked={settings.animations}
          onChange={(event) =>
            onSettingsChange({ ...settings, animations: event.target.checked })
          }
          type="checkbox"
        />
      </label>
      <label className="setting-row">
        <span>
          <UserRound size={19} />
          Display name
        </span>
        <input
          className="name-input"
          value={settings.displayName}
          onChange={(event) =>
            onSettingsChange({ ...settings, displayName: event.target.value })
          }
          type="text"
        />
      </label>
      <div className="setting-row avatar-setting">
        <span>
          <UserRound size={19} />
          Profile avatar
        </span>
        <div className="avatar-picker">
          {avatarOptions.map((avatar) => (
            <button
              className={settings.avatar === avatar ? "active" : ""}
              key={avatar}
              type="button"
              onClick={() => onSettingsChange({ ...settings, avatar })}
              aria-label={`Use avatar ${avatar}`}
            >
              {avatar}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function AccountsView({ users }) {
  return (
    <section className="accounts-panel">
      <div className="panel-title-row">
        <h2>Accounts</h2>
        <span className="soft-pill">Admin only</span>
      </div>
      <div className="account-list">
        {users.map((user) => (
          <article className="account-row" key={user._id}>
            <span className="account-avatar">
              <UserRound size={19} />
            </span>
            <div>
              <h3>{user.name}</h3>
              <p>@{user.username}</p>
            </div>
            <strong>{user.role}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function BlastEffect({ show, name, kind }) {
  if (!show) return null;

  return (
    <div className="blast-overlay" aria-live="polite">
      {Array.from({ length: 18 }, (_, index) => (
        <span key={index} style={{ "--i": index }} />
      ))}
      <div className="blast-message">
        <Flame size={34} />
        <h2>{kind === "all" ? "All habits completed!" : "Habit completed!"}</h2>
        <p>
          {kind === "all"
            ? `${name}, today is fully cleared.`
            : `${name}, keep the streak alive.`}
        </p>
      </div>
    </div>
  );
}

function AddHabitModal({ open, onClose, onCreate, saving }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Stay consistent");
  const [target, setTarget] = useState(21);
  const [color, setColor] = useState(palette[0]);
  const [icon, setIcon] = useState("Dumbbell");

  if (!open) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    await onCreate({ title, category, target, color, icon });
    setTitle("");
    setCategory("Stay consistent");
    setTarget(21);
    setColor(palette[0]);
    setIcon("Dumbbell");
    onClose();
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="habit-modal" onSubmit={handleSubmit}>
        <div className="modal-heading">
          <div>
            <p className="eyebrow">New habit</p>
            <h2>Add Habit</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close form"
          >
            <MoreVertical size={18} />
          </button>
        </div>

        <label>
          Habit name
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Go to Gym"
            required
          />
        </label>

        <label>
          Subtitle
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Stay healthy"
          />
        </label>

        <div className="modal-grid">
          <label>
            Goal days
            <input
              min="1"
              max="365"
              type="number"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </label>
          <label>
            Icon
            <select
              value={icon}
              onChange={(event) => setIcon(event.target.value)}
            >
              {iconChoices.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="swatches" aria-label="Choose color">
          {palette.map((item) => (
            <button
              className={item === color ? "active" : ""}
              key={item}
              style={{ "--swatch": item }}
              type="button"
              aria-label={`Use ${item}`}
              onClick={() => setColor(item)}
            />
          ))}
        </div>

        <button className="primary-button" type="submit" disabled={saving}>
          <Plus size={18} />
          {saving ? "Adding" : "Add Habit"}
        </button>
      </form>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(() => {
    const stored = window.localStorage.getItem("sreakmater-user");
    return stored ? JSON.parse(stored) : null;
  });
  const [habits, setHabits] = useState([]);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([
    { id: "event-1", title: "Progress review", day: 23, color: "#635bff" },
  ]);
  const [status, setStatus] = useState("loading");
  const [selectedDate, setSelectedDate] = useState(today);
  const [saving, setSaving] = useState(false);
  const [avatarMood, setAvatarMood] = useState("ready");
  const [showBlast, setShowBlast] = useState(false);
  const [blastKind, setBlastKind] = useState("single");
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [settings, setSettings] = useState({
    animations: true,
    avatar: "🙂",
    displayName: "Kruthik",
    reminders: true,
  });
  const blastTimer = useRef(null);

  const stats = useMemo(() => {
    const totalStreak = habits.reduce((sum, habit) => sum + habit.streak, 0);
    const completedToday = habits.filter((habit) =>
      habit.completedDates.includes(today),
    ).length;
    const best = habits.reduce(
      (max, habit) => Math.max(max, habit.bestStreak),
      0,
    );
    const successRate = habits.length
      ? Math.round((completedToday / habits.length) * 100)
      : 0;
    return {
      totalStreak,
      completedToday,
      best,
      successRate,
      total: habits.length,
    };
  }, [habits]);

  async function loadHabits() {
    if (!session) return;
    try {
      const response = await fetch(`${API_URL}/habits`, {
        headers: apiHeaders(),
      });
      const data = await response.json();
      setHabits(data);
      setStatus("ready");
    } catch (error) {
      setStatus("error");
    }
  }

  useEffect(() => {
    loadHabits();
    if (session?.role === "admin") loadUsers();
  }, [session]);

  function apiHeaders(extra = {}) {
    return {
      ...extra,
      "x-user-id": session?._id || "admin",
      "x-user-role": session?.role || "member",
    };
  }

  async function loadUsers() {
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: apiHeaders(),
    });
    if (response.ok) {
      setUsers(await response.json());
    }
  }

  function triggerBlast(kind = "single") {
    setBlastKind(kind);
    setShowBlast(true);
    window.clearTimeout(blastTimer.current);
    blastTimer.current = window.setTimeout(() => setShowBlast(false), 1900);
  }

  async function createHabit(payload) {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/habits`, {
        method: "POST",
        headers: apiHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });
      const habit = await response.json();
      setHabits((items) => [...items, habit]);
      setAvatarMood("celebrate");
      window.setTimeout(() => setAvatarMood("ready"), 1600);
    } finally {
      setSaving(false);
    }
  }

  async function toggleHabit(id, date = selectedDate) {
    const response = await fetch(`${API_URL}/habits/${id}/toggle`, {
      method: "PATCH",
      headers: apiHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ date }),
    });
    const habit = await response.json();
    setHabits((items) => {
      const updated = items.map((item) => (item._id === id ? habit : item));
      const allDone =
        updated.length > 0 &&
        updated.every((item) => item.completedDates.includes(date));
      const wasAllDone =
        items.length > 0 &&
        items.every((item) => item.completedDates.includes(date));
      const justCompleted = habit.completedDates.includes(date);
      if (justCompleted)
        triggerBlast(allDone && !wasAllDone ? "all" : "single");
      return updated;
    });
    setAvatarMood(habit.avatarMood);
    window.setTimeout(() => setAvatarMood("ready"), 1600);
  }

  async function deleteHabit(id) {
    await fetch(`${API_URL}/habits/${id}`, {
      method: "DELETE",
      headers: apiHeaders(),
    });
    setHabits((items) => items.filter((habit) => habit._id !== id));
  }

  function logout() {
    window.localStorage.removeItem("sreakmater-user");
    setSession(null);
    setHabits([]);
    setUsers([]);
    setActiveNav("Dashboard");
  }

  const pageCopy = {
    Dashboard: ["Good morning", "Let's build some amazing habits today."],
    Habits: ["Habits", "Create, complete, and clean up your daily routines."],
    Calendar: ["Calendar", "See your streak activity across the month."],
    Analytics: ["Analytics", "Track which habits are carrying the week."],
    Achievements: ["Achievements", "Unlock milestones as your streaks grow."],
    Accounts: ["Accounts", "Review members who created SreakMater accounts."],
    Settings: ["Settings", "Tune the habit tracker to your style."],
  };

  const [heading, subheading] = pageCopy[activeNav];

  function renderActiveView() {
    const shared = {
      habits,
      status,
      stats,
      selectedDate,
      onDateChange: setSelectedDate,
      onToggle: toggleHabit,
      onDelete: deleteHabit,
    };
    if (activeNav === "Habits") return <HabitsView {...shared} />;
    if (activeNav === "Calendar") {
      return (
        <CalendarView
          habits={habits}
          events={events}
          onAddEvent={(event) => setEvents((items) => [...items, event])}
        />
      );
    }
    if (activeNav === "Analytics")
      return <AnalyticsView habits={habits} stats={stats} />;
    if (activeNav === "Achievements") return <AchievementsView stats={stats} />;
    if (activeNav === "Accounts") return <AccountsView users={users} />;
    if (activeNav === "Settings") {
      return (
        <SettingsView settings={settings} onSettingsChange={setSettings} />
      );
    }
    return <DashboardView {...shared} />;
  }

  if (!session) return <AuthScreen onLogin={setSession} />;

  return (
    <main
      className={`dashboard-shell ${settings.animations ? "" : "reduce-motion"}`}
    >
      <aside className="sidebar">
        <div className="brand">
          <Flame size={23} />
          <div>
            <strong>StreakMater</strong>
            <small>Habit Tracker</small>
          </div>
        </div>

        <nav className="nav-list" aria-label="Main navigation">
          {navItems
            .filter((item) => !item.adminOnly || session.role === "admin")
            .map(({ label, icon: Icon }) => (
              <button
                className={activeNav === label ? "active" : ""}
                key={label}
                type="button"
                onClick={() => setActiveNav(label)}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
        </nav>

        <div className="motivation-card">
          <strong>Small Steps Big Changes</strong>
          <p>Keep going, you're doing great!</p>
          <div className="mountains" />
        </div>

        <div className="profile">
          <AvatarBadge mood={avatarMood} avatar={settings.avatar} />
          <div>
            <strong>{session.name || settings.displayName || "Kruthik"}</strong>
            <span>Stay Consistent!</span>
          </div>
          <ChevronDown size={16} />
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="topbar">
          <div>
            <p className="eyebrow">{activeNav}</p>
            <h1>
              {heading}
              {activeNav === "Dashboard"
                ? `, ${session.name || settings.displayName || "Kruthik"}!`
                : ""}
            </h1>
            <p>{subheading}</p>
          </div>
          <button
            className="primary-button"
            type="button"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} />
            Add Habit
          </button>
          <button className="ghost-button" type="button" onClick={logout}>
            Sign out
          </button>
        </header>

        {renderActiveView()}
      </section>

      <AddHabitModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={createHabit}
        saving={saving}
      />
      <BlastEffect
        show={showBlast}
        name={session.name || "Champion"}
        kind={blastKind}
      />
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
