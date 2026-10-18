import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const schoolClassFindMany = vi.fn();
const schoolClassFindFirst = vi.fn();
const getUserMock = vi.fn();
const userFindUnique = vi.fn();
const scheduleRowFindUnique = vi.fn();
const scheduleRowFindMany = vi.fn();
const subjectFindUnique = vi.fn();
const scheduleCellUpsert = vi.fn();
const scheduleCellDeleteMany = vi.fn();
const transactionMock = vi.fn();
const scheduleTransaction = {
  scheduleRow: {
    findUnique: scheduleRowFindUnique,
    findMany: scheduleRowFindMany,
  },
  subject: { findUnique: subjectFindUnique },
  scheduleCell: {
    upsert: scheduleCellUpsert,
    deleteMany: scheduleCellDeleteMany,
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: {
    schoolClass: {
      findMany: schoolClassFindMany,
      findFirst: schoolClassFindFirst,
      findUnique: vi.fn(),
    },
    user: { findUnique: userFindUnique },
    $transaction: transactionMock,
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => getUserMock() },
  }),
}));

const { createClass, getClassSchedule, getSchoolClasses, setScheduleCell } =
  await import("@/app/actions/schedules");

function authenticateAsAdmin() {
  getUserMock.mockResolvedValue({ data: { user: { id: "admin-1" } } });
  userFindUnique.mockResolvedValue({
    id: "admin-1",
    email: "admin@example.test",
    role: "ADMIN",
    username: "admin",
    prenom: "Admin",
    nom: "CSM",
    avatar: null,
  });
}

describe("getSchoolClasses", () => {
  beforeEach(() => {
    schoolClassFindMany.mockReset();
    userFindUnique.mockReset();
    getUserMock.mockReset();
    scheduleRowFindUnique.mockReset();
    scheduleRowFindMany.mockReset();
    subjectFindUnique.mockReset();
    scheduleCellUpsert.mockReset();
    scheduleCellDeleteMany.mockReset();
    transactionMock.mockReset();
    transactionMock.mockImplementation(
      (callback: (transaction: typeof scheduleTransaction) => unknown) =>
        callback(scheduleTransaction),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it("returns classes ordered by level then name", async () => {
    authenticateAsAdmin();
    schoolClassFindMany.mockResolvedValue([
      {
        id: "1",
        name: "6e A",
        level: "Sixième",
        schoolYear: "2026-2027",
        publishedAt: null,
      },
    ]);
    const classes = await getSchoolClasses();
    expect(classes).toHaveLength(1);
    expect(classes[0].name).toBe("6e A");
    expect(schoolClassFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ level: "asc" }, { name: "asc" }],
      }),
    );
  });

  it("surfaces database errors instead of returning a success-shaped empty list", async () => {
    authenticateAsAdmin();
    schoolClassFindMany.mockRejectedValue(new Error("db error"));
    await expect(getSchoolClasses()).rejects.toThrow("db error");
  });
});

describe("createClass authorization", () => {
  beforeEach(() => getUserMock.mockReset());

  it("rejects unauthenticated visitors", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const result = await createClass("6e B", "Sixième", "2026-2027");
    expect(result).toEqual({ error: "auth_required" });
  });
});

describe("schedule cell conflict checks", () => {
  beforeEach(authenticateAsAdmin);

  it("rejects an overlapping class session and reports the conflicting lesson", async () => {
    scheduleRowFindUnique.mockResolvedValue({
      classId: "class-1",
      startTime: "08:30",
      endTime: "09:30",
    });
    subjectFindUnique.mockResolvedValue({ id: "subject-1" });
    scheduleRowFindMany.mockResolvedValue([
      {
        startTime: "08:00",
        endTime: "09:00",
        cells: [{ subject: { name: "Mathématiques" } }],
      },
    ]);

    const result = await setScheduleCell("row-2", "LUNDI", "subject-1");

    expect(result).toMatchObject({
      error: "conflict",
      message: expect.stringContaining("Mathématiques"),
    });
    expect(scheduleCellUpsert).not.toHaveBeenCalled();
  });
});

describe("published schedule access", () => {
  beforeEach(() => {
    getUserMock.mockReset();
    userFindUnique.mockReset();
    schoolClassFindFirst.mockReset();
  });

  it("does not return another class timetable to a user account", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "student-1" } } });
    userFindUnique
      .mockResolvedValueOnce({
        id: "student-1",
        email: "student@example.test",
        role: "USER",
        username: "student",
        prenom: "Élève",
        nom: "CSM",
        avatar: null,
      })
      .mockResolvedValueOnce({ schoolClassId: "class-1" });

    await expect(getClassSchedule("class-2")).resolves.toBeNull();
    expect(schoolClassFindFirst).not.toHaveBeenCalled();
  });
});
