# Dosie — Database Schema

Design agreed before implementation (Faza 1). 8 tables. Enum values in English.

## Design decisions
- **Caregivers ↔ Patients = many-to-many** (via `patient_caregivers`). Reason: multiple caregivers (e.g. two siblings) can share one patient.
- **`role` column kept** (owner/viewer) but NO permission logic in Faza 1-2. Structure ready, activate later if time allows. All caregivers equal for now (default `owner`).
- **Schedules = solid/normalized**: separate `schedules` table linked to patient, plus `schedule_medications` join table. One call per schedule window; agent lists all meds tied to that schedule. Same med can belong to multiple schedules without duplication.
- **Dosage = structured**: `amount` (numeric) + `unit` (enum) + optional `form` (enum). Handles ml/mg/pills uniformly. Deliberately NOT going further (no mg-per-kg, no complex frequency) — over-engineering for a voice reminder.
- **`timezone` settable per patient** (default Europe/Bucharest) — calls fire at patient local time.
- **`language` per patient** (default `ro`) — multi-language planned.
- Two distinct phone numbers: `patients.phone_number` (agent calls patient) vs `users.phone_number` (caregiver receives SMS alerts).

## Tables

### 1. users — caregivers (log into web app)
| field | type | note |
|---|---|---|
| id | uuid PK | |
| email | text unique | login |
| password_hash | text | hashed password |
| full_name | text | |
| phone_number | text | E.164, for SMS alerts |
| notify_sms | boolean | default true |
| notify_email | boolean | default true |
| created_at | timestamp | |

### 2. patient_caregivers — M-N link (user ↔ patient)
| field | type | note |
|---|---|---|
| id | uuid PK | |
| user_id | FK users | |
| patient_id | FK patients | |
| role | enum owner/viewer | default owner |
| created_at | timestamp | |

### 3. patients — patients (receive calls, do not log in)
| field | type | note |
|---|---|---|
| id | uuid PK | |
| full_name | text | |
| phone_number | text | E.164, agent calls this |
| timezone | text | default Europe/Bucharest, settable |
| language | text | default ro, multi-language |
| created_at | timestamp | |

### 4. medications — what the patient takes
| field | type | note |
|---|---|---|
| id | uuid PK | |
| patient_id | FK patients | |
| name | text | "Cough syrup" |
| amount | numeric | 5 |
| unit | enum mg/ml/pill/drop/sachet/puff | |
| form | enum? syrup/tablet/drops/inhaler/capsule | optional |
| instructions | text? | "after meal" |
| active | boolean | default true |
| created_at | timestamp | |

### 5. schedules — call windows per patient
| field | type | note |
|---|---|---|
| id | uuid PK | |
| patient_id | FK patients | |
| time_of_day | time | 08:00 |
| days_of_week | int[] | [1,2,3,4,5] = Mon-Fri |
| active | boolean | default true |
| created_at | timestamp | |

### 6. schedule_medications — M-N link (schedule ↔ medication)
| field | type | note |
|---|---|---|
| id | uuid PK | |
| schedule_id | FK schedules | |
| medication_id | FK medications | |

### 7. calls — call history
| field | type | note |
|---|---|---|
| id | uuid PK | |
| patient_id | FK patients | |
| schedule_id | FK schedules? | which schedule triggered it |
| status | enum queued/ringing/completed/no_answer/failed | |
| started_at | timestamp? | |
| ended_at | timestamp? | |
| transcript | text? | OpenAI conversation |
| twilio_call_sid | text? | Twilio call id |
| created_at | timestamp | |

### 8. alerts — detected emergencies
| field | type | note |
|---|---|---|
| id | uuid PK | |
| patient_id | FK patients | |
| call_id | FK calls? | which call it came from |
| severity | enum info/warning/critical | |
| message | text | what was detected |
| acknowledged | boolean | default false |
| created_at | timestamp | |

## Enums
- **role:** owner, viewer
- **unit:** mg, ml, pill, drop, sachet, puff
- **form:** syrup, tablet, drops, inhaler, capsule
- **call status:** queued, ringing, completed, no_answer, failed
- **alert severity:** info, warning, critical

## Relations
```
users ─< patient_caregivers >─ patients ─┬─< schedules ─< schedule_medications >─ medications
                                         ├─< medications
                                         ├─< calls ─< alerts
```
`>─<` = many-to-many via join table. `─<` = one-to-many.
