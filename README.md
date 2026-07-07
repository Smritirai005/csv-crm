# groweasy ai csv importer

an ai-powered csv importer that accepts csv files with different layouts and maps them into the groweasy crm format using an llm.

instead of relying on fixed column names, the ai understands different headers like `phone`, `mobile`, `contact number`, etc., and extracts the required crm fields automatically.

## features

- upload csv file
- preview data before importing
- ai-based field mapping
- supports different csv formats
- batch processing for large files
- retry failed ai requests
- validates ai output before returning results
- shows imported and skipped records
- responsive ui

## tech stack

### frontend

- next.js
- typescript
- tailwind css

### backend

- node.js
- express
- multer
- csv-parser

### ai

- groq

## project structure

```text
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── prompts/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── server.js

frontend/
├── app/
├── components/
├── lib/
└── public/
```

## how it works

1. upload a csv file
2. preview the uploaded data
3. click **confirm import**
4. backend parses the csv
5. ai maps the data to the groweasy crm format
6. results are validated
7. imported and skipped records are displayed

## run locally

### backend

```bash
cd backend
npm install
cp .env.example .env
```

add your api key inside `.env`

```env
AI_PROVIDER=groq
GROQ_API_KEY=your_api_key
```

start the server

```bash
npm run dev
```

### frontend

```bash
cd frontend
npm install
```

create `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

start the frontend

```bash
npm run dev
```

## api

### import csv

```
POST /api/import
```

accepts a csv file and returns

- imported records
- skipped records
- total imported
- total skipped

