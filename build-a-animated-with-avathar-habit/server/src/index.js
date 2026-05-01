import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://127.0.0.1:5173" }));
app.use(express.json());
app.use(morgan("dev"));

const habitSchema = new mongoose.Schema(
  {
    ownerId: { type: String, default: "admin" },
    title: { type: String, required: true, trim: true },
    category: { type: String, default: "Wellness" },
    color: { type: String, default: "#2f7f79" },
    icon: { type: String, default: "Sparkles" },
    streak: { type: Number, default: 0 },
    target: { type: Number, default: 21 },
    bestStreak: { type: Number, default: 0 },
    completedDates: { type: [String], default: [] },
    avatarMood: { type: String, default: "ready" }
  },
  { timestamps: true }
);

const Habit = mongoose.model("Habit", habitSchema);

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `user-${Date.now()}-${crypto.randomBytes(4).toString("hex")}` },
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

const todayKey = () => new Date().toISOString().slice(0, 10);

const seedHabits = [
  {
    _id: "demo-1",
    ownerId: "admin",
    title: "Go to Gym",
    category: "Stay healthy",
    color: "#635bff",
    icon: "Dumbbell",
    streak: 5,
    target: 21,
    bestStreak: 18,
    completedDates: [],
    avatarMood: "celebrate"
  },
  {
    _id: "demo-2",
    ownerId: "admin",
    title: "Study",
    category: "Be consistent",
    color: "#18b777",
    icon: "BookOpen",
    streak: 3,
    target: 30,
    bestStreak: 9,
    completedDates: [],
    avatarMood: "ready"
  },
  {
    _id: "demo-3",
    ownerId: "admin",
    title: "Drink Water",
    category: "Stay hydrated",
    color: "#f2a30f",
    icon: "Droplets",
    streak: 7,
    target: 21,
    bestStreak: 15,
    completedDates: [],
    avatarMood: "celebrate"
  },
  {
    _id: "demo-4",
    ownerId: "admin",
    title: "Meditate",
    category: "Clear your mind",
    color: "#ee4f8f",
    icon: "Sparkles",
    streak: 2,
    target: 14,
    bestStreak: 6,
    completedDates: [],
    avatarMood: "ready"
  },
  {
    _id: "demo-5",
    ownerId: "admin",
    title: "Code",
    category: "Improve skills",
    color: "#2f73da",
    icon: "Code2",
    streak: 4,
    target: 30,
    bestStreak: 11,
    completedDates: [],
    avatarMood: "celebrate"
  }
];

let memoryHabits = [...seedHabits];
let memoryUsers = [];
let useMemoryStore = false;

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(":");
  return hashPassword(password, salt) === `${salt}:${hash}`;
}

function publicUser(user) {
  const object = user.toObject ? user.toObject() : user;
  return {
    _id: String(object._id),
    name: object.name,
    username: object.username,
    role: object.role,
    createdAt: object.createdAt
  };
}

function requestUserId(request) {
  return request.header("x-user-id") || "admin";
}

function isAdmin(request) {
  return request.header("x-user-role") === "admin";
}

async function ensureAdminUser() {
  const adminHash = hashPassword("admin123");

  if (useMemoryStore) {
    const exists = memoryUsers.some((user) => user.username === "admin");
    if (!exists) {
      memoryUsers = [
        {
          _id: "admin",
          name: "Kruthik",
          username: "admin",
          passwordHash: adminHash,
          role: "admin",
          createdAt: new Date().toISOString()
        }
      ];
    }
    return;
  }

  const exists = await User.findOne({ username: "admin" });
  if (!exists) {
    await User.create({
      _id: "admin",
      name: "Kruthik",
      username: "admin",
      passwordHash: adminHash,
      role: "admin"
    });
  }
}

async function connectDatabase() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sreakmater";

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 1400 });
    await ensureAdminUser();
    const count = await Habit.countDocuments();
    if (count === 0) {
      await Habit.insertMany(seedHabits.map(({ _id, ...habit }) => habit));
    }
    console.log("MongoDB connected");
  } catch (error) {
    useMemoryStore = true;
    await ensureAdminUser();
    console.log("MongoDB unavailable, using in-memory demo store");
  }
}

function normalizeHabit(habit) {
  const object = habit.toObject ? habit.toObject() : habit;
  return { ...object, _id: String(object._id) };
}

async function listHabits(ownerId) {
  if (useMemoryStore) return memoryHabits.filter((habit) => habit.ownerId === ownerId);
  return Habit.find({ ownerId }).sort({ createdAt: 1 });
}

async function createHabit(payload, ownerId) {
  const habit = {
    ownerId,
    title: payload.title,
    category: payload.category || "Wellness",
    color: payload.color || "#2f7f79",
    icon: payload.icon || "Sparkles",
    streak: 0,
    target: Number(payload.target) || 21,
    bestStreak: 0,
    completedDates: [],
    avatarMood: "ready"
  };

  if (useMemoryStore) {
    const memoryHabit = { ...habit, _id: `demo-${Date.now()}` };
    memoryHabits = [...memoryHabits, memoryHabit];
    return memoryHabit;
  }

  return Habit.create(habit);
}

async function toggleHabit(id, ownerId, date = todayKey()) {
  const key = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayKey();

  if (useMemoryStore) {
    memoryHabits = memoryHabits.map((habit) => {
      if (habit._id !== id || habit.ownerId !== ownerId) return habit;
      const completed = habit.completedDates.includes(key);
      const streak = completed ? Math.max(0, habit.streak - 1) : habit.streak + 1;
      return {
        ...habit,
        completedDates: completed
          ? habit.completedDates.filter((date) => date !== key)
          : [...habit.completedDates, key],
        streak,
        bestStreak: Math.max(habit.bestStreak, streak),
        avatarMood: completed ? "ready" : "celebrate"
      };
    });
    return memoryHabits.find((habit) => habit._id === id && habit.ownerId === ownerId);
  }

  const habit = await Habit.findOne({ _id: id, ownerId });
  if (!habit) return null;

  const completed = habit.completedDates.includes(key);
  habit.completedDates = completed
    ? habit.completedDates.filter((date) => date !== key)
    : [...habit.completedDates, key];
  habit.streak = completed ? Math.max(0, habit.streak - 1) : habit.streak + 1;
  habit.bestStreak = Math.max(habit.bestStreak, habit.streak);
  habit.avatarMood = completed ? "ready" : "celebrate";
  await habit.save();
  return habit;
}

async function deleteHabit(id, ownerId) {
  if (useMemoryStore) {
    memoryHabits = memoryHabits.filter((habit) => habit._id !== id || habit.ownerId !== ownerId);
    return true;
  }
  await Habit.findOneAndDelete({ _id: id, ownerId });
  return true;
}

async function findUserByUsername(username) {
  const normalized = username.trim().toLowerCase();
  if (useMemoryStore) return memoryUsers.find((user) => user.username === normalized);
  return User.findOne({ username: normalized });
}

async function createUser(payload) {
  const user = {
    name: payload.name.trim(),
    username: payload.username.trim().toLowerCase(),
    passwordHash: hashPassword(payload.password),
    role: "member",
    createdAt: new Date().toISOString()
  };

  if (useMemoryStore) {
    const memoryUser = { ...user, _id: `user-${Date.now()}` };
    memoryUsers = [...memoryUsers, memoryUser];
    return memoryUser;
  }

  return User.create(user);
}

async function createStarterHabitsForUser(ownerId) {
  const starters = seedHabits.map(({ _id, ...habit }, index) => ({
    ...habit,
    ownerId,
    streak: index < 2 ? habit.streak : 0,
    bestStreak: index < 2 ? habit.bestStreak : 0,
    completedDates: []
  }));

  if (useMemoryStore) {
    memoryHabits = [
      ...memoryHabits,
      ...starters.map((habit, index) => ({
        ...habit,
        _id: `${ownerId}-habit-${Date.now()}-${index}`
      }))
    ];
    return;
  }

  await Habit.insertMany(starters);
}

async function listUsers() {
  if (useMemoryStore) return memoryUsers;
  return User.find().sort({ createdAt: 1 });
}

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, store: useMemoryStore ? "memory" : "mongo" });
});

app.post("/api/auth/register", async (request, response, next) => {
  try {
    const { name, username, password } = request.body;
    if (!name?.trim() || !username?.trim() || !password || password.length < 4) {
      response.status(400).json({ message: "Name, username, and a 4+ character password are required." });
      return;
    }

    const existing = await findUserByUsername(username);
    if (existing) {
      response.status(409).json({ message: "That username is already taken." });
      return;
    }

    const user = await createUser(request.body);
    await createStarterHabitsForUser(String(user._id));
    response.status(201).json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/login", async (request, response, next) => {
  try {
    const { username, password } = request.body;
    const user = username ? await findUserByUsername(username) : null;
    if (!user || !verifyPassword(password || "", user.passwordHash)) {
      response.status(401).json({ message: "Invalid username or password." });
      return;
    }

    response.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/users", async (request, response, next) => {
  try {
    if (!isAdmin(request)) {
      response.status(403).json({ message: "Admin access required." });
      return;
    }

    const users = await listUsers();
    response.json(users.map(publicUser));
  } catch (error) {
    next(error);
  }
});

app.get("/api/habits", async (request, response, next) => {
  try {
    const habits = await listHabits(requestUserId(request));
    response.json(habits.map(normalizeHabit));
  } catch (error) {
    next(error);
  }
});

app.post("/api/habits", async (request, response, next) => {
  try {
    if (!request.body.title?.trim()) {
      response.status(400).json({ message: "Habit title is required." });
      return;
    }

    const habit = await createHabit(request.body, requestUserId(request));
    response.status(201).json(normalizeHabit(habit));
  } catch (error) {
    next(error);
  }
});

app.patch("/api/habits/:id/toggle", async (request, response, next) => {
  try {
    const habit = await toggleHabit(request.params.id, requestUserId(request), request.body.date);
    if (!habit) {
      response.status(404).json({ message: "Habit not found." });
      return;
    }
    response.json(normalizeHabit(habit));
  } catch (error) {
    next(error);
  }
});

app.delete("/api/habits/:id", async (request, response, next) => {
  try {
    await deleteHabit(request.params.id, requestUserId(request));
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ message: "SreakMater hit a server snag." });
});

connectDatabase().then(() => {
  app.listen(port, () => {
    console.log(`SreakMater API running on http://127.0.0.1:${port}`);
  });
});
