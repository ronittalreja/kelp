

A Node.js Express API that converts CSV files to JSON format and stores data in PostgreSQL.


## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v12+)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd csv-to-json-api

# Install dependencies
npm install

# Set up environment
cp env.template .env
# Edit .env with your database credentials

# Create database and table
psql -U postgres -d your_database -f schema.sql

# Start the server
npm start
```

### Test the API
```bash
# Process CSV and see age distribution
curl http://localhost:3000/upload

# Check database stats
curl http://localhost:3000/stats
```

## 📊 Expected Output

```
 Server running on port 3000
 Visit http://localhost:3000 for API documentation
Starting CSV parsing...
Parsed 15 rows from CSV
Inserted 57 / 57 records
Total records inserted: 57

=== Age-Group % Distribution ===
< 20: 13.33%
20 to 40: 46.67%
40 to 60: 26.67%
> 60: 13.33%
================================
```

## 🏗️ Project Structure

```
csv-to-json-api/
├── src/
│   ├── csvParser.js      # Custom CSV parser (no external libs)
│   └── processCsv.js     # CSV processing & batch insertion
├── db/
│   └── db.js            # PostgreSQL connection & queries
├── data/
│   └── users.csv        # Sample CSV with test data
├── schema.sql           # Database schema
├── index.js             # Express server
├── package.json         # Dependencies
├── env.template         # Environment template
└── README.md           # This file
```

##  API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API documentation and available endpoints |
| `/upload` | GET | Process CSV file and store in database |
| `/stats` | GET | Get database statistics |
| `/clear` | GET | Clear all users from database |

## 📝 CSV Format 

### Mandatory Fields
- `name.firstName` - User's first name
- `name.lastName` - User's last name  
- `age` - User's age (integer)

### Example CSV
```csv
name.firstName,name.lastName,age,address.line1,address.city,address.state,gender,occupation
"Rohit","Prasad",35,"A-563 Rakshak Society","Pune","Maharashtra","male","Engineer"
"Jane","Doe",28,"123 Main St","New York","NY","female","Designer"
```

### Database Schema
```sql
CREATE TABLE public.users (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,          -- firstName + lastName
  age INT NOT NULL,
  address JSONB,                   -- nested address object
  additional_info JSONB,          -- remaining fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
