// "use client";

// import moment from "moment";
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import "@/app/styles/rcb-dark.css";
// import "@/app/styles/rcb-light.css";
// import { useTheme } from "@/app/themeContext";
// import { useState, useEffect } from "react";
// import { Calendar as BigCalendar, momentLocalizer, Views, Navigate } from "react-big-calendar";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import CustomDropdown from "../CustomDropdown";

// const localizer = momentLocalizer(moment);

// const viewOptions = [
//     { value: Views.MONTH, label: "Month" },
//     { value: Views.WEEK, label: "Week" },
//     { value: Views.DAY, label: "Day" },
//     { value: Views.AGENDA, label: "Agenda" },
// ];

// const TeamCalendar = () => {
//     const { theme } = useTheme();
//     const [events, setEvents] = useState<any[]>([
//         {
//             title: "Team Meeting",
//             start: new Date(2025, 4, 30, 12, 55), // 12:55 PM SAST, May 30, 2025
//             end: new Date(2025, 4, 30, 13, 55),
//             allDay: false,
//         },
//     ]);
//     const [currentView, setCurrentView] = useState<string>(Views.MONTH);
//     const [currentDate, setCurrentDate] = useState<Date>(new Date()); // Estado para rastrear a data atual do calendário

//     const handleSelectSlot = ({ start }: { start: Date }) => {
//         const title = prompt("Enter event title:");
//         if (title) {
//             setEvents([
//                 ...events,
//                 {
//                     title,
//                     start,
//                     end: moment(start).add(1, "hour").toDate(),
//                     allDay: false,
//                 },
//             ]);
//         }
//     };

//     useEffect(() => {
//         console.log("Current View Updated:", currentView);
//         console.log("Current Date Updated:", currentDate);
//     }, [currentView, currentDate]);

//     // Função para navegar
//     const onNavigate = (newDate: Date, view: string, action: string) => {
//         console.log("Navigating to:", newDate, "View:", view, "Action:", action);
//         setCurrentDate(newDate);
//     };

//     // Toolbar renderizada separadamente
    
//     const renderToolbar = () => (
//         <div className={`mb-2 flex rounded-full justify-between items-center p-2 ${theme === "light" ? "bg-neutral-100 text-neutral-800" : "bg-slate-800 text-neutral-200"} sticky top-0 z-10`}>
//             <span className="flex items-center gap-2">
//                 <button
//                     onClick={() => {
//                         const newDate = moment(currentDate)
//                             .subtract(1, currentView === Views.MONTH ? "month" : currentView === Views.WEEK ? "week" : "day")
//                             .toDate();
//                         onNavigate(newDate, currentView, Navigate.PREVIOUS);
//                     }}
//                     className={`p-1 rounded-full items-center ${theme === "light" ? "bg-neutral-200 hover:bg-neutral-300" : "hover:bg-slate-700"} ${typeof window !== "undefined" && window.innerWidth < 640 ? "hidden" : ""}`}
//                 >
//                     <ChevronLeft size={19} />
//                 </button>
//                 <button
//                     onClick={() => {
//                         const newDate = new Date(); // Volta para a data atual
//                         onNavigate(newDate, currentView, Navigate.TODAY);
//                     }}
//                     className={`px-3 py-1 rounded-md ${theme === "light" ? "bg-neutral-200 hover:bg-neutral-300" : "bg-slate-700 hover:bg-slate-600"}`}
//                 >
//                     Today
//                 </button>
//                 <button
//                     onClick={() => {
//                         const newDate = moment(currentDate)
//                             .add(1, currentView === Views.MONTH ? "month" : currentView === Views.WEEK ? "week" : "day")
//                             .toDate();
//                         onNavigate(newDate, currentView, Navigate.NEXT);
//                     }}
//                     className={`p-1 rounded-full items-center ${theme === "light" ? "bg-neutral-200 hover:bg-neutral-300" : "hover:bg-slate-700"} ${typeof window !== "undefined" && window.innerWidth < 640 ? "hidden" : ""}`}
//                 >
//                     <ChevronRight size={19} />
//                 </button>
//             </span>
//             <span className="rbc-toolbar-label text-lg font-semibold">
//                 {moment(currentDate).format(
//                     currentView === Views.MONTH ? "MMMM YYYY" : currentView === Views.WEEK ? "MMM D, YYYY" : "MMM D, YYYY"
//                 )}
//             </span>
//             <span className="rbc-btn-group">
//                 <CustomDropdown
//                     options={viewOptions}
//                     value={currentView}
//                     onChange={(newView) => {
//                         console.log("Selected View:", newView);
//                         setCurrentView(newView);
//                     }}
//                     placeholder="Select View"
//                 />
//             </span>
//         </div>
//     );

//     return (
//         <div className="h-[84vh] w-full">
//            <style jsx global>{`
//             .rbc-event.rbc-selected,
//         .rbc-slot-selection {
//           background-color: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
//           transition: background-color 0.1s ease;
//         }
//         .rbc-event:hover,
//         .rbc-day-slot .rbc-time-slot:hover {
//           background-color: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
//         }
//         .rbc-month-view .rbc-row:first-child {
//           min-width: 800px; /* Sincroniza com .rbc-month-row */
//         }
//         .rbc-month-view .rbc-header {
//           min-width: 120px; /* Mesma largura que .rbc-day-bg */
//           padding: 4px;
//           box-sizing: border-box;
//         }
//         .rbc-month-view .rbc-month-row {
//           min-width: 1100px; /* Largura total mínima para 10 dias a 120px cada */
//         }
//         .rbc-month-view .rbc-day-bg {
//           min-width: 120px; /* Largura fixa para cada dia no modo MONTH */
//           padding: 4px; /* Padding interno para "folga" visual */
//           box-sizing: border-box;
//         }
//         .rbc-time-view .rbc-time-header {
//           min-width: 1500px; /* Sincroniza com .rbc-time-content */
//         }
//         .rbc-time-view .rbc-time-header-cell {
//           min-width: 150px; /* Mesma largura que .rbc-day-slot */
//           padding: 4px;
//           box-sizing: border-box;
//         }
//         .rbc-time-view .rbc-time-content {
//           min-width: 1500px; /* Largura total mínima para 10 slots a 150px cada */
//         }
//         .rbc-time-view .rbc-day-slot {
//           min-width: 150px; /* Largura fixa para cada slot no modo WEEK/DAY */
//           padding: 4px; /* Padding interno para "folga" visual */
//           box-sizing: border-box;
//         }
//         .rbc-agenda-view .rbc-agenda-content {
//           min-width: 1200px; /* Largura total mínima para consistência */
//         }
//         @media (max-width: 320px) {
//           .rbc-month-view .rbc-header {
//             min-width: 100px; 
//           }
//           .rbc-month-view .rbc-day-bg {
//             min-width: 100px; /* Reduz ligeiramente em telas muito pequenas */
//           }
//           .rbc-time-view .rbc-time-header-cell {
//             min-width: 120px; /* Sincroniza com .rbc-day-slot */
//           }
//           .rbc-time-view .rbc-day-slot {
//             min-width: 120px; /* Reduz ligeiramente em telas muito pequenas */
//           }
//         }
//             .rbc-light .rbc-today {
//                 background-color: #ad83ad32;
//             }
//             `}
//             </style>
//             <div className="flex flex-col h-full">
//                 {/* Toolbar fixa e independente */}
//                 {renderToolbar()}
//                 {/* Contêiner rolável para o corpo do calendário */}
//                 <div className="overflow-x-scroll h-[calc(100%-3rem)]">
//                     <BigCalendar
//                         localizer={localizer}
//                         events={events}
//                         startAccessor="start"
//                         endAccessor="end"
//                         style={{ height: "100%", width: "fit-content" }}
//                         views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
//                         view={currentView}
//                         defaultView={Views.MONTH}
//                         date={currentDate} // Sincroniza a data do calendário
//                         onNavigate={onNavigate}
//                         onView={(newView: string) => setCurrentView(newView)}
//                         onSelectSlot={handleSelectSlot}
//                         selectable
//                         components={{toolbar: () => null}}
//                         className={`${theme === "light" ? "rbc-light text-neutral-700" : "rbc-dark text-neutral-200"}`}
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default TeamCalendar;



"use client";

import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/app/styles/rcb-dark.css";
import "@/app/styles/rcb-light.css";
import { useTheme } from "@/app/themeContext";
import { useState, useEffect } from "react"; // Adicionado useEffect para debug
import { Calendar as BigCalendar, momentLocalizer, Views, Navigate, Components } from "react-big-calendar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CustomDropdown from "../CustomDropdown";

const localizer = momentLocalizer(moment);

const viewOptions = [
    { value: Views.MONTH, label: "Month" },
    { value: Views.WEEK, label: "Week" },
    { value: Views.DAY, label: "Day" },
    { value: Views.AGENDA, label: "Agenda" }
];

const TeamCalendar = () => {
    const { theme } = useTheme();
    const [events, setEvents] = useState<any[]>([
        {
            title: "Team Meeting",
            start: new Date(2025, 4, 30, 12, 55), // 12:55 PM SAST, May 30, 2025
            end: new Date(2025, 4, 30, 13, 55),
            allDay: false,
        },
    ]);
    const [currentView, setCurrentView] = useState<string>(Views.MONTH);

    const handleSelectSlot = ({ start }: { start: Date }) => {
        const title = prompt("Enter event title:");
        if (title) {
            setEvents([
                ...events,
                {
                    title,
                    start,
                    end: moment(start).add(1, "hour").toDate(),
                    allDay: false,
                },
            ]);
        }
    };

    // Efeito para debug da view atual
    useEffect(() => {
        console.log("Current View Updated:", currentView);
    }, [currentView]);

    const customComponents = {
        toolbar: (props: any) => (
             <div className={` mb-2 flex rounded-full justify-between items-center p-2 ${theme === "light" ? "bg-neutral-100 text-neutral-800" : "bg-slate-800 text-neutral-200"} sticky top-0 z-10`}>
                <style jsx global>{``}

                </style>
                <span className="flex items-center gap-2">
                    <button
                        onClick={() => props.onNavigate(Navigate.PREVIOUS)}
                        className={`p-1 rounded-full items-center ${theme === "light" ? "bg-neutral-200 hover:bg-neutral-300" : "hover:bg-slate-700"}`}
                    >
                        <ChevronLeft size={19} />
                    </button>
                    <button
                        onClick={() => props.onNavigate(Navigate.TODAY)}
                        className={`px-3 py-1 rounded-md ${theme === "light" ? "bg-neutral-200 hover:bg-neutral-300" : "bg-slate-700 hover:bg-slate-600"}`}
                    >
                        Today
                    </button>
                    <button
                        onClick={() => props.onNavigate(Navigate.NEXT)}
                        className={`p-1 rounded-full items-center ${theme === "light" ? "bg-neutral-200 hover:bg-neutral-300" : "hover:bg-slate-700"}`}
                    >
                        <ChevronRight size={19} />
                    </button>
                </span>
                <span className="rbc-toolbar-label text-lg font-semibold">{props.label}</span>
                <span className="rbc-btn-group ">
                    <CustomDropdown
                        options={viewOptions}
                        value={currentView}
                        onChange={(newView) => {
                            console.log("Selected View:", newView);
                            setCurrentView(newView);
                            props.onView(newView); // Notifica o BigCalendar da mudança
                        }}
                        placeholder="Select View"
                    />
                </span>
            </div>
        ),
    };

    return (
        <div className="h-[84vh] w-full">
            <style jsx global>{`
            .rbc-event.rbc-selected,
        .rbc-slot-selection {
          background-color: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
          transition: background-color 0.1s ease;
        }
        .rbc-event:hover,
        .rbc-day-slot .rbc-time-slot:hover {
          background-color: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
        }
        .rbc-month-view .rbc-row:first-child {
          min-width: 900px; /* Sincroniza com .rbc-month-row */
        }
        .rbc-month-view .rbc-header {
          min-width: 120px; /* Mesma largura que .rbc-day-bg */
          padding: 4px;
          box-sizing: border-box;
        }
        .rbc-month-view .rbc-month-row {
          min-width: 900px; /* Largura total mínima para 10 dias a 120px cada */
        }
        .rbc-month-view .rbc-day-bg {
          min-width: 120px; /* Largura fixa para cada dia no modo MONTH */
          padding: 4px; /* Padding interno para "folga" visual */
          box-sizing: border-box;
        }
        .rbc-time-view .rbc-time-header {
          min-width: 1500px; /* Sincroniza com .rbc-time-content */
        }
        .rbc-time-view .rbc-time-header-cell {
          min-width: 150px; /* Mesma largura que .rbc-day-slot */
          padding: 4px;
          box-sizing: border-box;
        }
        .rbc-time-view .rbc-time-content {
          min-width: 1500px; /* Largura total mínima para 10 slots a 150px cada */
        }
        .rbc-time-view .rbc-day-slot {
          min-width: 150px; /* Largura fixa para cada slot no modo WEEK/DAY */
          padding: 4px; /* Padding interno para "folga" visual */
          box-sizing: border-box;
        }
        .rbc-agenda-view .rbc-agenda-content {
          min-width: 1200px; /* Largura total mínima para consistência */
        }
        @media (max-width: 320px) {
          .rbc-month-view .rbc-header {
            min-width: 100px; 
          }
          .rbc-month-view .rbc-day-bg {
            min-width: 100px; /* Reduz ligeiramente em telas muito pequenas */
          }
          .rbc-time-view .rbc-time-header-cell {
            min-width: 120px; /* Sincroniza com .rbc-day-slot */
          }
          .rbc-time-view .rbc-day-slot {
            min-width: 120px; /* Reduz ligeiramente em telas muito pequenas */
          }
        }
            .rbc-light .rbc-today {
                background-color: #ad83ad32;
            }
            `}
            </style>
            <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%", width: "100%" }}
                views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                view={currentView}
                defaultView={Views.MONTH}
                components={customComponents}
                onSelectSlot={handleSelectSlot}
                selectable
                className={`${theme === "light" ? "rbc-light text-neutral-700" : "rbc-dark text-neutral-200"}`}
            />
        </div>
    );
};

export default TeamCalendar;