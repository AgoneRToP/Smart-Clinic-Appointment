export enum UserStatuses {
  Inactive = 'inactive',
  Active = 'active',
}

export enum UserRoles {
  Patient = 'patient',
  Doctor = 'doctor',
  Admin = 'admin',
}

export enum DoctorSpecializations {
  cardiologist = 'cardiologist',
  pediatrician = 'pediatrician',
  neurologist = 'neurologist',
  dermatologist = 'dermatologist',
  therapist = 'therapist',
  surgeon = 'surgeon',
  ophthalmologist = 'ophthalmologist',
  dentist = 'dentist',
}

export enum DoctorExperience {
  EntryLevel = 'Entry-level',
  MidLevel = 'Mid-level',
  Senior = 'Senior',
  Consultant = 'Consultant',
}

export enum AppointmentStatuses {
    Scheduled = 'Scheduled',
    Arrived = 'Arrived',
    InProgress = 'In Progress',
    Paused = 'Paused',
    Completed = 'Completed',
    Canceled = 'Canceled',
    Pending = 'Pending'
}

export enum WeekDays {
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
  Sunday = 'Sunday',
}
