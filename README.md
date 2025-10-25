# CSV to JSON Converter API - Kelp Global Challenge

A production-ready Node.js Express API that converts CSV files to JSON format and stores data in PostgreSQL. Built for the Kelp Global coding challenge with custom CSV parsing, efficient database operations, and age distribution analysis.

## 🎯 Challenge Requirements Met

✅ **Custom CSV Parser** - No external libraries (csv-to-json, papaparse, etc.)  
✅ **Nested JSON Properties** - Handles dot notation (name.firstName, address.line1)  
✅ **PostgreSQL Integration** - Proper table structure with JSONB fields  
✅ **Age Distribution Analysis** - Console output with percentage breakdown  
✅ **Large File Support** - Optimized for files >50,000 rows  
✅ **Production Quality** - Error handling, logging, batch processing  

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
🚀 Server running on port 3000
📊 Visit http://localhost:3000 for API documentation
📁 CSV file path: ./data/users.csv
Starting CSV processing for ./data/users.csv
Starting CSV parsing...
Parsed 15 rows from CSV
Inserted 15 / 15 records
Total records inserted: 15

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

## 🚀 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API documentation and available endpoints |
| `/upload` | GET | Process CSV file and store in database |
| `/stats` | GET | Get database statistics |
| `/clear` | GET | Clear all users from database |

## 📝 CSV Format Requirements

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

## 🔧 Technical Implementation

### Custom CSV Parser Features
- **Streaming Parser**: Uses Node.js `readline` for memory efficiency
- **Quoted Field Support**: Handles commas and line breaks inside quotes
- **Escaped Quotes**: Properly processes `""` as escaped quotes
- **Nested Objects**: Creates `{name: {firstName: "John"}}` from `name.firstName`
- **Type Conversion**: Automatically converts numeric strings to numbers

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

### Performance Optimizations
- **Batch Processing**: Inserts 500 records per batch
- **Connection Pooling**: Efficient database connections
- **Memory Management**: Streaming parser for large files
- **Indexed Queries**: Fast age distribution calculations

## 🧪 Testing

### Manual Testing
```bash
# Start server
npm start

# Test CSV processing
curl http://localhost:3000/upload

# Verify database
curl http://localhost:3000/stats

# Clear data
curl http://localhost:3000/clear
```

## 🏆 Challenge Completion

This implementation successfully addresses all Kelp Global requirements:

✅ **Custom CSV Parser** - No external libraries used  
✅ **Nested JSON Properties** - Dot notation support  
✅ **PostgreSQL Integration** - Proper schema and JSONB storage  
✅ **Age Distribution** - Console output with percentages  
✅ **Large File Support** - Optimized for 50,000+ records  
✅ **Production Quality** - Error handling, logging, documentation  

## 📝 License

Created for Kelp Global coding challenge submission.
