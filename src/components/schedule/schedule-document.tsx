import type { ClassScheduleData } from "@/app/actions/schedules";

const DAYS = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI"] as const;

interface ScheduleDocumentProps {
  schedule: ClassScheduleData;
}

export function ScheduleDocument(props: Readonly<ScheduleDocumentProps>) {
  return (
    <div className="w-full bg-white p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <img src="/logo.png" alt="Logo" className="h-16 w-16 flex-shrink-0" />
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-extrabold uppercase text-slate-900 sm:text-3xl">
            Emploi du temps - {props.schedule.className}
          </h1>
          <p className="mt-1 text-xs font-semibold tracking-wide text-slate-500 sm:text-sm">
            Année scolaire {props.schedule.schoolYear}
          </p>
        </div>
        <div className="h-16 w-16 flex-shrink-0" />
      </div>

      <div className="overflow-hidden">
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
                <td colSpan={6} className="border-2 border-slate-900 px-3 py-6 text-center text-slate-500">
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
                        className="border-2 border-slate-900 px-3 py-3 text-center uppercase text-slate-900"
                      >
                        {cell?.subjectName ?? ""}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}