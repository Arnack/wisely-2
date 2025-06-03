# Video Call System Documentation

## Overview

The ConsultPro platform now includes a comprehensive video calling system that integrates seamlessly with the appointment booking workflow. The system automatically generates meeting links for approved appointments and provides a professional video conferencing experience using LiveKit.

## Features

### 🎥 Video Conferencing
- **HD Video & Audio**: Professional quality video calls with LiveKit integration
- **Screen Sharing**: Built-in screen sharing capabilities for consultations
- **Real-time Chat**: In-call messaging system
- **Recording Support**: Session recording capabilities (when enabled)
- **Mobile Responsive**: Works on desktop and mobile devices

### 📅 Smart Meeting Management
- **Auto-Generated Meeting URLs**: Meeting links are automatically created when appointments are approved
- **Time-Based Access Control**: Calls are accessible 15 minutes before to 30 minutes after the scheduled time
- **Room Security**: Unique room names for each appointment ensure privacy
- **Authentication**: Only authorized participants can join calls

### 👥 Role-Based Interface
- **Customer View**: Easy access to join calls and manage appointments
- **Expert View**: Appointment approval/rejection with automatic meeting link generation
- **Status Management**: Real-time appointment status updates

## Database Schema

### New Columns Added to `appointments` Table
```sql
ALTER TABLE appointments ADD COLUMN meeting_url TEXT;
ALTER TABLE appointments ADD COLUMN meeting_room_name TEXT;
```

### New `call_logs` Table
```sql
CREATE TABLE call_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_name TEXT NOT NULL,
  participant_identity TEXT NOT NULL,
  participant_name TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Database Triggers
- **Auto URL Generation**: Meeting URLs are automatically generated when appointments are approved
- **Room Naming**: Unique room names based on appointment IDs
- **Call Logging**: Automatic logging of call sessions

## API Endpoints

### `POST /api/livekit/token`
Generates secure LiveKit access tokens for video calls.

**Request:**
```json
{
  "roomName": "appointment-123",
  "participantName": "John Doe",
  "participantIdentity": "john@example.com"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Security Features:**
- User authentication verification
- Appointment access validation
- Time window enforcement
- Room permission management

### `GET /call/[roomName]`
Video call page with built-in security and UI.

**Query Parameters:**
- `appointmentId`: Links the call to a specific appointment
- `token`: Optional pre-generated token

## Component Architecture

### Core Components

#### `VideoCall` (`components/video-call.tsx`)
Main video calling component with:
- LiveKit integration
- Call duration tracking
- Participant management
- Chat functionality
- Professional UI with controls

#### `AppointmentCard` (`components/appointment-card.tsx`)
Enhanced appointment display with:
- Meeting link access
- Time-based join buttons
- Copy link functionality
- Status management
- Role-specific actions

### Pages

#### `/call/[roomName]` (`app/(dashboard)/call/[roomName]/page.tsx`)
- Server-side authentication
- Appointment validation
- Time window checking
- User authorization

#### `/call-demo` (`app/(dashboard)/call-demo/page.tsx`)
- Interactive demo page
- Feature showcase
- Mock appointments
- Technical documentation

#### `/test-call` (`app/(dashboard)/test-call/page.tsx`)
- Simple test interface
- Development testing
- Demo functionality

## Usage Workflow

### For Customers
1. **Book Appointment**: Find expert and request consultation
2. **Wait for Approval**: Expert reviews and approves/rejects request
3. **Join Call**: When approved, meeting link appears 15 minutes before appointment
4. **Video Consultation**: Professional video call experience
5. **Completion**: Call automatically marked as completed

### For Experts
1. **Receive Request**: New appointment requests appear in dashboard
2. **Review & Approve**: Approve or reject with optional message
3. **Auto Meeting Link**: System generates secure meeting URL
4. **Conduct Call**: Join video call at scheduled time
5. **Complete Session**: Mark consultation as completed

## Security Features

### Access Control
- **Authentication Required**: Users must be logged in
- **Appointment Validation**: Only participants can join specific calls
- **Time Window Enforcement**: Calls only accessible during valid time periods
- **Role Verification**: Both customer and expert roles verified

### Privacy & Security
- **Unique Room Names**: Each appointment gets a unique room ID
- **Encrypted Communications**: All video/audio data encrypted in transit
- **Secure Token Generation**: JWT tokens with limited scope and expiration
- **RLS Policies**: Database-level security for call logs

## Configuration

### Environment Variables
```bash
# LiveKit Configuration
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-server.com
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
```

### LiveKit Server Setup
1. Deploy LiveKit server (cloud or self-hosted)
2. Configure API keys and secrets
3. Update environment variables
4. Test connection and token generation

## Demo & Testing

### Live Demo
Visit `/call-demo` to see:
- Interactive appointment cards
- Meeting link generation
- Role-based views
- Feature showcase
- Technical implementation details

### Test Video Call
Visit `/test-call` for:
- Direct video call testing
- UI/UX validation
- Feature testing
- Development debugging

## Technical Implementation

### Dependencies
```json
{
  "livekit-client": "^1.x.x",
  "@livekit/components-react": "^1.x.x",
  "@livekit/components-styles": "^1.x.x",
  "livekit-server-sdk": "^1.x.x"
}
```

### Key Features
- **TypeScript**: Full type safety throughout
- **Responsive Design**: Mobile and desktop optimized
- **Real-time Updates**: Live status changes and notifications
- **Error Handling**: Comprehensive error management
- **Loading States**: Professional loading indicators
- **Toast Notifications**: User feedback system

## Future Enhancements

### Planned Features
- [ ] Call recording and playback
- [ ] Multi-participant calls (group consultations)
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] SMS notifications for appointments
- [ ] Call quality analytics
- [ ] Whiteboard integration
- [ ] File sharing during calls
- [ ] Call transcription

### Performance Optimizations
- [ ] CDN integration for video streams
- [ ] Bandwidth optimization
- [ ] Adaptive video quality
- [ ] Connection quality monitoring

## Support & Troubleshooting

### Common Issues
1. **Video/Audio Not Working**: Check browser permissions
2. **Cannot Join Call**: Verify appointment time and status
3. **Poor Video Quality**: Check internet connection
4. **Authentication Errors**: Refresh token or re-login

### Browser Support
- Chrome 80+ (recommended)
- Firefox 75+
- Safari 13+
- Edge 80+

### Mobile Support
- iOS Safari 13+
- Android Chrome 80+
- Progressive Web App support

---

*For technical support or questions about the video call system, please refer to the development team or check the project documentation.* 