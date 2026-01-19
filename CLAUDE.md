# STA Exams Display - Project Context

## Project Overview

This is an exam display board application designed to show real-time exam schedules and countdowns to students during examination periods. The application displays:
- Current time and date
- Exam schedules organized by sessions (days)
- Real-time countdowns for each exam
- Exam statuses (upcoming, reading time, writing time, finished)
- Visual warnings and progress indicators

The app has two modes:
1. **Setup Mode** - Configure exam schedules, manage sessions, add/edit exams
2. **Display Mode** - Public-facing board showing exam countdowns and information

## Tech Stack

- **Framework:** React 18.2.0
- **Build Tool:** Vite 4.4.5
- **Styling:** Tailwind CSS 3.3.3
- **Icons:** lucide-react 0.263.1
- **State Management:** React useState with localStorage persistence
- **No backend** - All data is stored locally in the browser

## Project Structure

```
src/
├── App.jsx                      # Main application component, state management
├── main.jsx                     # React entry point
├── index.css                    # Global styles and Tailwind imports
├── components/
│   ├── ExamBoard.jsx           # Public display board component
│   ├── SetupPanel.jsx          # Admin setup interface
│   └── Icons.jsx               # Lucide icon exports
├── utils/
│   └── helpers.js              # Time formatting and calculation utilities
└── assets/                      # Images (logo, branding)
```

## Key Components

### App.jsx (Root Component)
- **Responsibilities:**
  - Global state management for the entire application
  - localStorage persistence for centerName and schedule
  - Clock timer (updates every second)
  - CRUD operations for sessions (days) and exams
  - Bulk import functionality
  - Mode switching (setup vs display)
  - Fullscreen toggle

- **Key State:**
  - `currentTime` - Updates every second for countdowns
  - `centerName` - Display header text (persisted)
  - `schedule` - Array of session objects (persisted)
  - `activeDayId` - Currently selected session
  - `isSetupMode` - Toggle between setup and display views
  - `isFullscreen` - Fullscreen state

- **Data Model:**
```javascript
schedule: [
  {
    id: number,           // Unique session identifier
    name: string,         // Session name (e.g., "Day 1", "Morning Session")
    exams: [
      {
        id: number,           // Unique exam identifier (usually Date.now())
        subject: string,      // Exam subject name
        startTime: string,    // HH:MM format (e.g., "09:00")
        duration: number,     // Writing time in minutes
        readingTime: number,  // Reading time in minutes
        hasReadingTime: bool, // Whether reading time is enabled
        isHidden: bool        // Hide from display board
      }
    ]
  }
]
```

### ExamBoard.jsx (Display Mode)
- **Responsibilities:**
  - Public-facing exam display board
  - Grid layout that adapts to exam count (1x1, 2x1, 2x3, 3x3)
  - Real-time countdown displays
  - Progress bars for each exam
  - Status indicators (reading, writing, finished)
  - Warning states (30-minute, 5-minute, 2-minute alerts)

- **Layout Logic:**
  - 1 exam: 1x1 grid (full screen)
  - 2 exams: 2x1 grid (side-by-side)
  - 3-6 exams: 2x3 grid (6 slots)
  - 7+ exams: 3x3 grid (9 slots, high density)

- **Responsive Text Sizing:**
  - Subject font size scales based on text length
  - Different scaling rules for different grid layouts
  - Ensures long exam names fit properly

- **Visual States:**
  - **Final 2 minutes:** End time box flashes red with pulse animation
  - **30-minute warning:** Box highlights when 30 minutes remain
  - **5-minute warning:** Box highlights when 5 minutes remain
  - **Finished exams:** Grayed out with reduced opacity

### SetupPanel.jsx (Admin Mode)
- **Responsibilities:**
  - Exam schedule configuration interface
  - Session (day) management
  - Individual exam CRUD operations
  - Bulk import from text (tab or space separated)
  - Bulk import from Google Sheets
  - Extra time exam generation (+25%, +50%)
  - Show/hide exam visibility toggle

- **Features:**
  - Global title configuration
  - Add/remove/rename sessions
  - Per-exam controls: subject, start time, duration, reading time
  - Visibility toggle (hide exams from display board)
  - Duplicate exam with extra time (creates "ET-1", "ET-2", etc.)
  - Calculate and display end times automatically

- **Bulk Import Formats:**
  - Text: `Subject [space/tab] StartTime [space/tab] Duration`
  - Example: `Biology 08:30 90` or `Mathematics 13:15 1:30`
  - Duration can be minutes (90) or HH:MM format (1:30)

- **Google Sheets Integration:**
  - Fetches TSV data from hardcoded Google Sheets URL
  - Groups exams by session name
  - Can import single session or all sessions at once

### helpers.js (Utilities)
- **Time Formatting:**
  - `formatTime(date)` - HH:MM:SS
  - `formatShortTime(date)` - HH:MM
  - `formatDate(date)` - Full date with weekday
  - `formatDuration(mins)` - "Xh Ym"

- **Exam Calculations:**
  - `getExamTimings(exam)` - Calculates all time boundaries
    - Start time, reading end, writing end, 30-min warning, 5-min warning
  - `getExamStatus(exam)` - Determines current exam state
    - Returns: status text, countdown message, color, code
    - Handles: upcoming, reading, writing, finished states
  - `getWarningStyles(warningTime, currentTime)` - CSS classes for warnings

- **Countdown Display Logic:**
  - Over 60 minutes: "Xh XXm" format
  - 30-60 minutes: "XX" (minutes only, shows "minutes" label)
  - Under 30 minutes: "MM:SS" format
  - Shows seconds countdown in final 30 minutes

## Important Patterns

### State Persistence
All persisted state uses localStorage with JSON serialization:
```javascript
const loadState = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};
```

State is saved automatically via useEffect whenever it changes.

### Time Calculations
All time calculations use JavaScript Date objects. Exam times are parsed from HH:MM strings and converted to Date objects with today's date. This means:
- The app assumes exams are "today"
- Cross-midnight exams are not supported
- All calculations are done in local timezone

### ID Generation
IDs are generated using `Date.now()` or `Date.now() + index` for uniqueness. For bulk operations, add random values or index offsets to prevent collisions.

### Exam Sorting
In ExamBoard, visible exams are sorted by end time (ascending), then by ID for stable ordering. This ensures exams display in the order they finish.

### Extra Time Exams
When duplicating an exam with extra time:
- Original duration is multiplied by (1 + percentage/100)
- New exam is named "ET-X" where X is the next available number
- Searches for existing "ET-" exams to determine next number

## Styling Conventions

### Colors
- **Primary:** Blue (#003057 for headers, blue-600 for buttons)
- **Accent:** Yellow/Gold (#fcc314 for header text)
- **Status Colors:**
  - Upcoming: blue-600
  - Reading: amber-600
  - Writing: green-600
  - Finished: gray-600
  - Final 5 minutes: red-600

### Tailwind Usage
- Heavy use of utility classes
- Responsive breakpoints with `md:` prefix
- Dynamic classes for state-based styling
- Grid layouts for responsive exam boards

### Font Sizing
- Display board uses very large fonts (7xl-9xl for countdowns)
- Scales down for high-density layouts (3x3 grid)
- Subject text uses inline styles for length-based sizing

## Development Notes

### Time Updates
The main clock updates every second via setInterval in App.jsx. This triggers re-renders for all countdown displays. This is intentional and necessary for accurate countdown displays.

### LocalStorage Keys
- `examCenterName` - String
- `examSchedule` - JSON array of sessions

### Google Sheets Integration
The TSV_URL in SetupPanel.jsx is hardcoded. To use a different sheet:
1. Publish Google Sheet to web as TSV
2. Update TSV_URL in SetupPanel.jsx
3. Expected format: Session Name | Subject | Duration | Start Time

### No Backend
This is a fully client-side application with no server component. All data is stored in the browser's localStorage. This means:
- Data is not shared between browsers/devices
- No user authentication
- No network sync
- Data persists across page refreshes but not across browsers

### Performance Considerations
- Clock updates trigger re-renders every second
- ExamBoard sorts and filters on every render (acceptable for <20 exams)
- No memoization or optimization needed for current scale
- Consider React.memo for components if exam count exceeds 50+

## Common Tasks

### Adding a New Field to Exams
1. Add field to exam object in `addExam()` and bulk import functions
2. Update exam editor in SetupPanel.jsx
3. Update any calculations that might use it in helpers.js
4. Update ExamBoard if it needs to display the field

### Changing Layout Grid
Modify the grid logic in ExamBoard.jsx (lines 22-30). The `gridClass` variable controls the Tailwind grid classes applied.

### Adjusting Countdown Format
Modify the `formatRemaining()` function inside `getExamStatus()` in helpers.js. The three branches handle different time ranges.

### Adding New Import Sources
Follow the pattern in SetupPanel.jsx for Google Sheets import. The key is parsing data into the exam object structure.

### Modifying Warning Timings
Current warnings are at 30 minutes and 5 minutes before exam end. To change:
1. Update calculations in `getExamTimings()` (helpers.js)
2. Update display logic in ExamBoard.jsx
3. Update grid display in ExamBoard.jsx footer section

## Browser Compatibility

The app uses modern JavaScript features:
- async/await
- Spread operators
- Array methods (map, filter, reduce, find)
- localStorage
- Fullscreen API
- Date API

Target browsers: Modern Chrome, Firefox, Safari, Edge (last 2 versions).

## Known Limitations

1. No cross-midnight support (exams assumed to be "today")
2. No timezone handling (uses local time)
3. No data export/backup functionality
4. Single-user (no multi-device sync)
5. No undo/redo for edits
6. Maximum 9 visible exams on display board (3x3 grid)
7. No print stylesheet
8. No offline service worker
9. Google Sheets URL is hardcoded

## Coding Style

- Use functional components with hooks
- Prefer arrow functions
- Use template literals for strings
- Keep components focused on single responsibility
- Extract complex logic to helper functions
- Use descriptive variable names
- Avoid magic numbers (use named constants)
- Comment complex calculations and business logic
