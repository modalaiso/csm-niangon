import type { ClassScheduleData } from "@/app/actions/schedules";

const DAYS = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI"] as const;

interface ScheduleDocumentProps {
  schedule: ClassScheduleData;
}

export function ScheduleDocument(props: Readonly<ScheduleDocumentProps>) {
  return (
    <div className="rounded-2xl w-full bg-white p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <img
          src="/logo.png"
          alt="Logo du Collège Saint-Méthodiste de Niangon"
          className="h-16 w-16 shrink-0 object-contain"
        />
        <div className="flex-1 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Cours Secondaire Méthodiste de Niangon
          </p>
          <h1 className="mt-1 text-xl font-extrabold uppercase text-slate-900 sm:text-2xl">
            Emploi du temps - {props.schedule.className}
          </h1>
          <p className="mt-1 text-xs font-semibold tracking-wide text-slate-500 sm:text-sm">
            Année scolaire {props.schedule.schoolYear}
          </p>
        </div>
        <div className="h-16 w-16 shrink-0" />
      </div>

      <div className="schedule-grid-document hidden overflow-hidden sm:block">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr>
              <th className="border-2 border-slate-900 bg-white px-3 py-3 text-left font-semibold text-slate-900">
                Horaires
              </th>
              {DAYS.map((day) => (
                <th
                  key={day}
                  className="border-2 border-slate-900 bg-white px-3 py-3 text-center font-bold uppercase text-slate-900"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.schedule.rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="border-2 border-slate-900 px-3 py-6 text-center text-slate-500"
                >
                  Aucun créneau renseigné pour cette classe.
                </td>
              </tr>
            ) : (
              props.schedule.rows.map((row) => (
                <tr key={row.id}>
                  <td className="border-2 border-slate-900 px-3 py-3 font-medium text-slate-900">
                    {row.startTime} - {row.endTime}
                  </td>
                  {DAYS.map((day) => {
                    const cell = row.cells.find((c) => c.day === day);
                    return (
                      <td
                        key={day}
                        className="border-2 border-slate-900 px-2 py-2 text-center uppercase text-slate-900"
                      >
                        {cell?.subjectName ? (
                          <span className="inline-block w-full px-2 py-1.5 font-semibold">
                            {cell.subjectName}
                          </span>
                        ) : (
                          ""
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="schedule-mobile-document space-y-4 sm:hidden">
        {DAYS.map((day) => {
          const dayRows = props.schedule.rows.filter((row) =>
            row.cells.some(
              (cell) => cell.day === day && cell.subjectName !== null,
            ),
          );
          return (
            <section key={day} className="rounded-lg border border-slate-200">
              <h2 className="border-b border-slate-200 px-3 py-2 text-sm font-bold uppercase text-slate-900">
                {day}
              </h2>
              {dayRows.length === 0 ? (
                <p className="px-3 py-3 text-xs text-slate-500">
                  Aucune séance renseignée.
                </p>
              ) : (
                <ol className="divide-y divide-slate-200">
                  {dayRows.map((row) => {
                    const cell = row.cells.find((entry) => entry.day === day);
                    return (
                      <li
                        key={row.id}
                        className="flex items-center gap-3 px-3 py-3"
                      >
                        <span className="min-w-24 text-xs font-semibold tabular-nums text-slate-700">
                          {row.startTime}–{row.endTime}
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          {cell?.subjectName}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
