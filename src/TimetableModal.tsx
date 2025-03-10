import React from 'react';
import { X } from 'lucide-react';

interface TimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TimetableModal: React.FC<TimetableModalProps> = ({ isOpen, onClose }) => {
  const getDayLabel = (day: number) => {
    const date = new Date(2025, 2, day); // March 2025
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Timetable data with session types
  const timetableEvents = {
    3: [
      { time: "1:30PM - 2:30PM", description: "Tutorial", units: "VU23213, ICTPRG435, ICTPRG434, VU23217, VU23223", room: "SB,G Block.Lvl 1,Rm 010/014", type: "monday" }
    ],
    4: [
      { time: "8:00AM - 11:00AM", description: "Class", units: "VU23213", room: "SB,G Block.Lvl 2,Rm 011", type: "mandatory" },
      { time: "11:30AM - 2:30PM", description: "Class", units: "VU23213, VU23215", room: "SB,G Block.Lvl 2,Rm 011", type: "mandatory" },
      { time: "3:00PM - 5:00PM", description: "Teacher Directed Learning", units: "VU23213, ICTPRG435, ICTPRG434, VU23217, VU23223", room: "", type: "independent" }
    ],
    5: [
      { time: "8:30AM - 11:30AM", description: "Class", units: "VU23217", room: "SB,G Block.Lvl 2,Rm 009", type: "mandatory" },
      { time: "1:30PM - 5:00PM", description: "Class", units: "ICTPRG435, ICTPRG434", room: "SB,G Block.Lvl 1,Rm 018", type: "mandatory" }
    ],
    6: [
      { time: "12:00PM - 4:00PM", description: "Independent Study", units: "VU23213, ICTPRG435, ICTPRG434, VU23217, VU23223", room: "", type: "independent" }
    ],
    7: [
      { time: "9:00AM - 11:00AM", description: "Online Delivery", units: "VU23223", room: "SB,Lvl 1.Rm 007 - Zoom/MS Teams", type: "friday" }
    ],
    10: [
      { time: "1:30PM - 2:30PM", description: "Tutorial", units: "VU23213, ICTPRG435, ICTPRG434, VU23217, VU23223", room: "SB,G Block.Lvl 1,Rm 010/014", type: "monday" }
    ],
    11: [
      { time: "8:00AM - 11:00AM", description: "Class", units: "VU23213", room: "SB,G Block.Lvl 2,Rm 011", type: "mandatory" },
      { time: "11:30AM - 2:30PM", description: "Class", units: "VU23213, VU23215", room: "SB,G Block.Lvl 2,Rm 011", type: "mandatory" },
      { time: "3:00PM - 5:00PM", description: "Teacher Directed Learning", units: "VU23213, ICTPRG435, ICTPRG434, VU23217, VU23223", room: "", type: "independent" }
    ],
    12: [
      { time: "8:30AM - 11:30AM", description: "Class", units: "VU23217", room: "SB,G Block.Lvl 2,Rm 009", type: "mandatory" },
      { time: "1:30PM - 5:00PM", description: "Class", units: "ICTPRG435, ICTPRG434", room: "SB,G Block.Lvl 1,Rm 018", type: "mandatory" }
    ],
    13: [
      { time: "12:00PM - 4:00PM", description: "Independent Study", units: "VU23213, ICTPRG435, ICTPRG434, VU23217, VU23223", room: "", type: "independent" }
    ],
    14: [
      { time: "9:00AM - 11:00AM", description: "Online Delivery", units: "VU23223", room: "SB,Lvl 1.Rm 007 - Zoom/MS Teams", type: "friday" }
    ],
    17: [
      { time: "1:30PM - 2:30PM", description: "Tutorial", units: "Multiple units including all assessed units", room: "SB,G Block.Lvl 1,Rm 010/014", type: "monday" }
    ],
    18: [
      { time: "8:00AM - 11:00AM", description: "Class", units: "VU23213, VU23215", room: "SB,G Block.Lvl 2,Rm 011", type: "mandatory" },
      { time: "11:30AM - 2:30PM", description: "Class", units: "VU23213, VU23215", room: "SB,G Block.Lvl 2,Rm 011", type: "mandatory" },
      { time: "3:00PM - 5:00PM", description: "Independent Study", units: "Multiple units", room: "", type: "independent" }
    ],
    19: [
      { time: "8:30AM - 11:30AM", description: "Class", units: "VU23217, VU23216", room: "SB,G Block.Lvl 2,Rm 009", type: "mandatory" },
      { time: "1:30PM - 5:00PM", description: "Class", units: "ICTPRG435, ICTPRG434", room: "SB,G Block.Lvl 1,Rm 018", type: "mandatory" }
    ],
    20: [
      { time: "12:00PM - 4:00PM", description: "Independent Study", units: "Multiple units", room: "", type: "independent" }
    ],
    21: [
      { time: "9:00AM - 11:00AM", description: "Online Delivery", units: "VU23223, BSBINS401, ICTICT443", room: "SB,Lvl 1.Rm 007 - Zoom/MS Teams", type: "friday" },
      { time: "", description: "ASSIGNMENT DUE", units: "VU23223, VU23213", room: "", isDeadline: true }
    ],
    23: [
      { time: "", description: "ASSIGNMENT DUE", units: "VU23217", room: "", isDeadline: true }
    ],
    24: [
      { time: "1:30PM - 2:30PM", description: "Tutorial", units: "Multiple units", room: "SB,G Block.Lvl 1,Rm 010/014", type: "monday" }
    ],
    25: [
      { time: "8:00AM - 11:00AM", description: "Class", units: "VU23213, VU23215", room: "SB,G Block.Lvl 2,Rm 011", type: "mandatory" },
      { time: "11:30AM - 2:30PM", description: "Class", units: "VU23213, VU23215", room: "SB,G Block.Lvl 2,Rm 011", type: "mandatory" },
      { time: "3:00PM - 5:00PM", description: "Independent Study", units: "Multiple units", room: "", type: "independent" }
    ],
    26: [
      { time: "8:30AM - 11:30AM", description: "Class", units: "VU23217, VU23216", room: "SB,G Block.Lvl 2,Rm 009", type: "mandatory" },
      { time: "1:30PM - 5:00PM", description: "Class", units: "ICTPRG435, ICTPRG434", room: "SB,G Block.Lvl 1,Rm 018", type: "mandatory" }
    ],
    27: [
      { time: "12:00PM - 4:00PM", description: "Independent Study", units: "Multiple units", room: "", type: "independent" }
    ],
    28: [
      { time: "9:00AM - 11:00AM", description: "Online Delivery", units: "VU23223, BSBINS401, ICTICT443", room: "SB,Lvl 1.Rm 007 - Zoom/MS Teams", type: "friday" }
    ]
  };

  // Calendar days
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  if (!isOpen) return null;

  // Get event background color based on type
  const getEventBgColor = (event: any) => {
    if (event.isDeadline) return 'bg-red-100 text-red-800 font-bold';
    if (event.type === 'mandatory') return 'bg-indigo-100 text-indigo-800';
    if (event.type === 'independent') return 'bg-emerald-100 text-emerald-800';
    if (event.type === 'monday') return 'bg-amber-100 text-amber-800';
    if (event.type === 'friday') return 'bg-purple-100 text-purple-800';
    return 'bg-white shadow-sm';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="cyber-card w-full max-w-4xl max-h-[90vh] overflow-auto animate-fade-in">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-100 matrix-text">March 2025 Timetable</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-medium text-gray-700 p-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before March 1 (Saturday) */}
            {Array.from({ length: 6 }, (_, i) => (
              <div key={`empty-${i}`} className="p-1">
                <div className="bg-gray-100 rounded-md h-24 opacity-50"></div>
              </div>
            ))}
            
            {days.map(day => {
              const events = timetableEvents[day as keyof typeof timetableEvents] || [];
              const hasDeadline = events.some(e => e.isDeadline);
              const hasMandatory = events.some(e => e.type === 'mandatory');
              const hasIndependent = events.some(e => e.type === 'independent');
              const hasMonday = events.some(e => e.type === 'monday');
              const hasFriday = events.some(e => e.type === 'friday');
              
              let dayBgColor = 'bg-gray-50 border border-gray-200';
              if (hasDeadline) dayBgColor = 'bg-red-50 border border-red-300';
              else if (hasMonday) dayBgColor = 'bg-amber-50 border border-amber-200';
              else if (hasFriday) dayBgColor = 'bg-purple-50 border border-purple-200';
              else if (hasMandatory) dayBgColor = 'bg-indigo-50 border border-indigo-200';
              else if (hasIndependent) dayBgColor = 'bg-emerald-50 border border-emerald-200';
              
              return (
                <div key={day} className="p-1">
                  <div className={`rounded-md h-24 overflow-y-auto p-1 text-xs ${dayBgColor}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold">{day}</span>
                      <span className="text-gray-500 text-xs">{getDayLabel(day)}</span>
                    </div>
                    
                    {events.map((event, idx) => (
                      <div key={idx} className={`mb-1 p-1 rounded ${getEventBgColor(event)}`}>
                        {event.time && <div className="font-medium">{event.time}</div>}
                        <div className={`${event.isDeadline ? 'text-red-800' : ''}`}>{event.description}</div>
                        {!event.isDeadline && event.units && (
                          <div className="text-gray-600 truncate">{event.units}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-amber-100 border border-amber-200 rounded"></div>
              <span className="text-sm">Monday Tutorials</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-indigo-100 border border-indigo-200 rounded"></div>
              <span className="text-sm">Regular Classes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded"></div>
              <span className="text-sm">Friday Zoom Sessions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-emerald-100 border border-emerald-200 rounded"></div>
              <span className="text-sm">Independent Learning</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-50 border border-red-300 rounded"></div>
              <span className="text-sm">Assignment Due Dates</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetableModal;