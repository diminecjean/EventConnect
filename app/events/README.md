## Events

Shows individual event pages based on the selected event card.

### Testing

The `app/events/page.tsx` is used for testing. This page contains a list of dummy events with associated IDs, to test if the event routes with dynamic ids can be accessed or not.

For static testing on the frontend, modify the constants for event details in both `events/page.tsx` and `events/[id]/page.tsx`.
