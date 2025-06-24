import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // for selectable, draggable
import listPlugin from '@fullcalendar/list'; // for list view

export default function StudyCalendar({ tasks }) {
  // Transform tasks into FullCalendar event objects
  const events = tasks.map(task => ({
    id: task.id.toString(), // FullCalendar event IDs are typically strings
    title: task.task_name,
    start: task.start_time, // Assumes ISO string format
    end: task.end_time,     // Assumes ISO string format
    backgroundColor: task.status === 'completed' ? 'green' : '#3788d8', // Blue for pending, green for completed
    borderColor: task.status === 'completed' ? 'darkgreen' : '#3788d8',
    extendedProps: {
      subjectName: task.subjectName,
      resourceName: task.resourceName,
      status: task.status,
    }
  }));

  const handleEventClick = (clickInfo) => {
    // Basic alert, can be expanded to a modal later
    const subject = clickInfo.event.extendedProps.subjectName;
    const resource = clickInfo.event.extendedProps.resourceName;
    const status = clickInfo.event.extendedProps.status;
    alert(
      `Task: ${clickInfo.event.title}\n` +
      `Status: ${status}\n` +
      (subject && subject !== 'N/A' ? `Subject: ${subject}\n` : '') +
      (resource && resource !== 'N/A' ? `Resource: ${resource}\n` : '') +
      `Start: ${clickInfo.event.start ? clickInfo.event.start.toLocaleString() : 'N/A'}\n` +
      `End: ${clickInfo.event.end ? clickInfo.event.end.toLocaleString() : 'N/A'}`
    );
  };

  return (
    <div style={{ marginTop: '30px', border: '1px solid #ccc', padding: '10px' }}>
      <h2>Study Calendar</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth" // Initial view
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' // View options
        }}
        events={events}
        editable={false} // For now, view only. True for drag-and-drop rescheduling later.
        selectable={false} // True for selecting date ranges to add events later.
        eventClick={handleEventClick} // Handle event click
        height="auto" // Adjust height dynamically or set a fixed one like "650px"
        // Force event text color to be contrasty enough (FullCalendar might do this by default)
        // eventTextColor="white" // Example, if needed
      />
    </div>
  );
}
