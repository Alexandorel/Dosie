# Dosie

**Intelligent Voice AI Agent System for Medication Monitoring**

Bachelor's thesis project — Alexandru Vint.

Dosie helps elderly people take their medication on time through a simple phone call:
an AI voice agent calls them at the scheduled time, reminds them to take their pills,
and asks how they are feeling. Caregivers set everything up through a web application
and receive alerts in case of an emergency. The patient needs no smartphone or
installed app.

## Tech Stack

| Component           | Technology            |
| ------------------- | --------------------- |
| Frontend            | React.js              |
| Backend             | Node.js               |
| Database            | PostgreSQL            |
| Scheduler & Queues  | Redis + BullMQ        |
| Voice Gateway       | Twilio                |
| AI Engine           | OpenAI (GPT-4o-mini)  |
