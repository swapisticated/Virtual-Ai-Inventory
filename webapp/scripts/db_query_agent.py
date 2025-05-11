import requests
import re
import argparse
import subprocess
import json
import os
from typing import List, Dict, Any, Optional
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import datetime
import dateutil.parser
from dateutil.relativedelta import relativedelta

class PrismaDBAgent:
    def __init__(self, server_url: str):
        """Initialize the agent with server connection parameters."""
        self.server_url = server_url
        self.available_tables = ["AuditLog", "InventoryItem", "InventorySection", "StockTransaction"]
        self.selected_table = None
        self.project_root = "/Users/damndeepesh/Documents/TestDrive/webapp"
        # Generate Prisma client on initialization
        self._generate_prisma_client()
        # Initialize NLP components
        self._initialize_nlp()
        
    def _initialize_nlp(self):
        """Initialize NLP components."""
        try:
            # Download necessary NLTK data
            nltk.download('punkt', quiet=True)
            nltk.download('stopwords', quiet=True)
            nltk.download('wordnet', quiet=True)
            
            self.lemmatizer = WordNetLemmatizer()
            self.stop_words = set(stopwords.words('english'))
            
            # Define query intent patterns
            self.intent_patterns = {
                'retrieve': ['show', 'list', 'get', 'display', 'find', 'search', 'query', 'select', 'retrieve', 'fetch', 'give', 'details', 'about'],
                'count': ['count', 'how many', 'total', 'sum', 'number of'],
                'filter': ['where', 'with', 'filter', 'having', 'contain', 'match', 'from', 'to', 'between'],
                'sort': ['sort', 'order', 'arrange', 'rank'],
                'limit': ['limit', 'top', 'first', 'last', 'recent']
            }
            
            # Define common field mappings (natural language to database fields)
            self.field_mappings = {
                'inventoryitem': {
                    'name': ['name', 'title', 'label', 'item name', 'product name'],
                    'quantity': ['quantity', 'amount', 'count', 'number', 'stock'],
                    'location': ['location', 'place', 'where', 'position', 'stored'],
                    'sku': ['sku', 'code', 'item code', 'product code', 'id code'],
                    'createdAt': ['created', 'creation date', 'date created', 'when created']
                },
                'inventorysection': {
                    'name': ['name', 'section name', 'category', 'group'],
                    'description': ['description', 'details', 'info', 'about']
                },
                'auditlog': {
                    'action': ['action', 'activity', 'operation', 'event'],
                    'userId': ['user', 'user id', 'person', 'who'],
                    'timestamp': ['time', 'date', 'when', 'timestamp', 'occurred', 'happened'],
                    'details': ['details', 'information', 'data', 'description']
                },
                'stocktransaction': {
                    'type': ['type', 'transaction type', 'kind'],
                    'quantity': ['quantity', 'amount', 'count', 'number'],
                    'itemId': ['item', 'product', 'item id'],
                    'timestamp': ['time', 'date', 'when', 'timestamp']
                }
            }
            
            # Date-time related patterns
            self.date_patterns = [
                # ISO format: 2023-04-13
                r'(\d{4}-\d{1,2}-\d{1,2})',
                # US format: 04/13/2023
                r'(\d{1,2}/\d{1,2}/\d{4})',
                # Text format: 13th April 2023
                r'(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})',
                # Short text format: 13 Apr 2023
                r'(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})'
            ]
            
            self.time_patterns = [
                # 24-hour format: 14:30
                r'(\d{1,2}:\d{2}(?::\d{2})?)',
                # 12-hour format: 2:30PM
                r'(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM))'
            ]
            
            print("NLP components initialized successfully.")
        except Exception as e:
            print(f"Warning: Error initializing NLP components: {e}")
            print("Falling back to basic pattern matching.")
    
    def _generate_prisma_client(self):
        """Generate Prisma client."""
        try:
            print("Generating Prisma client...")
            result = subprocess.run(["npx", "prisma", "generate"], 
                                   capture_output=True, 
                                   text=True, 
                                   cwd=self.project_root)
            if result.returncode == 0:
                print("Prisma client generated successfully.")
            else:
                print(f"Error generating Prisma client: {result.stderr}")
        except Exception as e:
            print(f"Error generating Prisma client: {e}")
    
    def connect(self):
        """Test connection to the Next.js server."""
        try:
            # Just check if the server is running
            response = requests.get(self.server_url)
            if response.status_code == 200:
                print("Connected to the server successfully.")
            else:
                print(f"Server returned status code: {response.status_code}")
                print("Server is running but may not be configured correctly.")
        except Exception as e:
            print(f"Error connecting to the server: {e}")
            print("Make sure your Next.js server is running on port 3000")
            exit(1)
    
    def get_table_schema(self, table_name: str) -> List[Dict[str, str]]:
        """Get the schema of a table from Prisma database."""
        try:
            # Create a temporary script to query Prisma
            temp_script = os.path.join(self.project_root, "scripts", "temp_prisma_query.js")
            with open(temp_script, "w") as f:
                f.write(f"""
                const {{ PrismaClient }} = require('@prisma/client');
                const prisma = new PrismaClient();

                async function getSchema() {{
                    try {{
                        // Get a sample record to determine schema
                        const record = await prisma.{table_name.lower()}.findFirst();
                        console.log(JSON.stringify(record ? Object.keys(record).map(key => ({{name: key, type: typeof record[key]}})) : []));
                    }} catch (error) {{
                        console.error(error);
                        console.log('[]');
                    }} finally {{
                        await prisma.$disconnect();
                    }}
                }}

                getSchema();
                """)
            
            # Execute the script
            result = subprocess.run(["node", temp_script], capture_output=True, text=True, cwd=self.project_root)
            os.remove(temp_script)
            
            if result.returncode == 0:
                return json.loads(result.stdout.strip())
            else:
                print(f"Error getting schema: {result.stderr}")
                return []
        except Exception as e:
            print(f"Error getting schema: {e}")
            return []
    
    def process_tag(self, input_text: str) -> Optional[str]:
        """Process tag-based table selection."""
        tag_pattern = r'@(\w+)'
        matches = re.findall(tag_pattern, input_text)
        
        for match in matches:
            if match in self.available_tables:
                self.selected_table = match
                return match
        return None
    
    def _extract_datetime_ranges(self, query: str) -> Dict[str, Any]:
        """Extract date and time ranges from the query."""
        result = {
            'start_date': None,
            'end_date': None,
            'start_time': None,
            'end_time': None
        }
        
        # Extract dates
        dates = []
        for pattern in self.date_patterns:
            matches = re.findall(pattern, query)
            dates.extend(matches)
        
        # Extract times
        times = []
        for pattern in self.time_patterns:
            matches = re.findall(pattern, query)
            times.extend(matches)
        
        # Look for range indicators
        from_to_pattern = r'from\s+(.*?)\s+to\s+(.*?)(?:\.|$)'
        between_pattern = r'between\s+(.*?)\s+and\s+(.*?)(?:\.|$)'
        
        from_to_match = re.search(from_to_pattern, query)
        between_match = re.search(between_pattern, query)
        
        if from_to_match or between_match:
            range_match = from_to_match if from_to_match else between_match
            start_text = range_match.group(1)
            end_text = range_match.group(2)
            
            # Try to parse start and end datetime
            try:
                # For start datetime
                start_date = None
                start_time = None
                for date_pattern in self.date_patterns:
                    date_match = re.search(date_pattern, start_text)
                    if date_match:
                        start_date = date_match.group(1)
                        break
                
                for time_pattern in self.time_patterns:
                    time_match = re.search(time_pattern, start_text)
                    if time_match:
                        start_time = time_match.group(1)
                        break
                
                # For end datetime
                end_date = None
                end_time = None
                for date_pattern in self.date_patterns:
                    date_match = re.search(date_pattern, end_text)
                    if date_match:
                        end_date = date_match.group(1)
                        break
                
                for time_pattern in self.time_patterns:
                    time_match = re.search(time_pattern, end_text)
                    if time_match:
                        end_time = time_match.group(1)
                        break
                
                # If only time is specified in end_text, use the start_date
                if end_time and not end_date and start_date:
                    end_date = start_date
                
                result['start_date'] = start_date
                result['start_time'] = start_time
                result['end_date'] = end_date
                result['end_time'] = end_time
                
            except Exception as e:
                print(f"Error parsing datetime range: {e}")
        
        # If no range indicators but we have dates and times
        elif dates and times:
            if len(dates) >= 1:
                result['start_date'] = dates[0]
            if len(dates) >= 2:
                result['end_date'] = dates[1]
            if len(times) >= 1:
                result['start_time'] = times[0]
            if len(times) >= 2:
                result['end_time'] = times[1]
        
        return result
    
    def _parse_datetime(self, date_str: Optional[str], time_str: Optional[str]) -> Optional[str]:
        """Parse date and time strings into ISO format for Prisma."""
        if not date_str:
            return None
        
        try:
            # Parse date
            date_obj = None
            
            # Handle ordinal indicators (1st, 2nd, 3rd, etc.)
            if re.search(r'\d{1,2}(?:st|nd|rd|th)', date_str):
                date_str = re.sub(r'(\d{1,2})(?:st|nd|rd|th)', r'\1', date_str)
            
            date_obj = dateutil.parser.parse(date_str, fuzzy=True).date()
            
            # Parse time if provided
            if time_str:
                # Handle 12-hour format
                if re.search(r'(?:AM|PM)', time_str, re.IGNORECASE):
                    time_parts = re.match(r'(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)', time_str, re.IGNORECASE)
                    if time_parts:
                        hour = int(time_parts.group(1))
                        minute = int(time_parts.group(2))
                        second = int(time_parts.group(3)) if time_parts.group(3) else 0
                        am_pm = time_parts.group(4).upper()
                        
                        if am_pm == 'PM' and hour < 12:
                            hour += 12
                        elif am_pm == 'AM' and hour == 12:
                            hour = 0
                        
                        time_obj = datetime.time(hour, minute, second)
                    else:
                        time_obj = dateutil.parser.parse(time_str).time()
                else:
                    time_obj = dateutil.parser.parse(time_str).time()
                
                # Combine date and time
                dt = datetime.datetime.combine(date_obj, time_obj)
            else:
                # Use start of day if no time specified
                dt = datetime.datetime.combine(date_obj, datetime.time.min)
            
            # Format for Prisma
            return dt.isoformat()
            
        except Exception as e:
            print(f"Error parsing datetime: {e}")
            return None
    
    def _preprocess_query(self, query: str) -> Dict[str, Any]:
        """Preprocess the natural language query to extract intent and entities."""
        query = query.lower()
        tokens = word_tokenize(query)
        
        # Remove stop words and lemmatize
        filtered_tokens = [self.lemmatizer.lemmatize(token) for token in tokens if token not in self.stop_words]
        
        # Detect intent
        intent = 'retrieve'  # Default intent
        for intent_type, patterns in self.intent_patterns.items():
            if any(pattern in query for pattern in patterns):
                intent = intent_type
                break
        
        # Extract entities (fields, values, conditions)
        entities = {
            'fields': [],
            'conditions': [],
            'sort': None,
            'limit': 20,  # Default limit
            'datetime_range': None
        }
        
        # Extract fields of interest
        if self.selected_table and self.selected_table.lower() in self.field_mappings:
            field_map = self.field_mappings[self.selected_table.lower()]
            for db_field, nl_terms in field_map.items():
                if any(term in query for term in nl_terms):
                    entities['fields'].append(db_field)
        
        # Extract datetime ranges
        datetime_range = self._extract_datetime_ranges(query)
        if datetime_range['start_date'] or datetime_range['end_date']:
            # Parse start datetime
            start_datetime = self._parse_datetime(
                datetime_range['start_date'], 
                datetime_range['start_time']
            )
            
            # Parse end datetime
            end_datetime = self._parse_datetime(
                datetime_range['end_date'], 
                datetime_range['end_time']
            )
            
            # If we have valid datetime values, add them to conditions
            if start_datetime or end_datetime:
                entities['datetime_range'] = {
                    'start': start_datetime,
                    'end': end_datetime
                }
        
        # Extract conditions
        condition_pattern = r'(where|with|having)\s+(\w+)\s+(is|=|>|<|>=|<=|!=|contains|starts with|ends with)\s+(["\w\s]+)'
        condition_matches = re.findall(condition_pattern, query)
        
        for match in condition_matches:
            _, field, op, value = match
            entities['conditions'].append({
                'field': field,
                'operator': op,
                'value': value.strip('"\'')
            })
        
        # Extract sort order
        sort_pattern = r'(sort|order)\s+by\s+(\w+)\s+(asc|desc)'
        sort_matches = re.findall(sort_pattern, query)
        if sort_matches:
            entities['sort'] = {
                'field': sort_matches[0][1],
                'order': sort_matches[0][2]
            }
        
        # Extract limit
        limit_pattern = r'(limit|top|first)\s+(\d+)'
        limit_matches = re.findall(limit_pattern, query)
        if limit_matches:
            entities['limit'] = int(limit_matches[0][1])
        
        return {
            'intent': intent,
            'entities': entities,
            'tokens': filtered_tokens
        }
    
    def translate_to_sql(self, query: str) -> str:
        """Translate natural language query to SQL using NLP techniques."""
        if not self.selected_table:
            return "No table selected. Please use @TableName to select a table."
        
        table_name = self.selected_table.lower()
        schema = self.get_table_schema(table_name)
        column_names = [col["name"] for col in schema] if schema else []
        
        # Use NLP to understand the query
        try:
            processed = self._preprocess_query(query)
            intent = processed['intent']
            entities = processed['entities']
            
            # Build SQL based on intent and entities
            if intent == 'count':
                return f"SELECT COUNT(*) FROM {table_name} LIMIT 20"
            
            # Determine fields to select
            if entities['fields']:
                # Validate that fields exist in the schema
                valid_fields = [field for field in entities['fields'] if field in column_names]
                select_clause = ", ".join(valid_fields) if valid_fields else "*"
            else:
                select_clause = "*"
            
            # Build conditions
            conditions = []
            
            # Add datetime range conditions if present
            if entities['datetime_range']:
                # Find timestamp field in schema
                timestamp_field = None
                for field in column_names:
                    if field.lower() in ['timestamp', 'createdat', 'updatedat', 'date', 'datetime']:
                        timestamp_field = field
                        break
                
                if timestamp_field:
                    if entities['datetime_range']['start']:
                        conditions.append(f"{timestamp_field} >= '{entities['datetime_range']['start']}'")
                    if entities['datetime_range']['end']:
                        conditions.append(f"{timestamp_field} <= '{entities['datetime_range']['end']}'")
            
            # Add other conditions
            for condition in entities['conditions']:
                field = condition['field']
                if field in column_names:
                    op = condition['operator']
                    value = condition['value']
                    
                    # Map natural language operators to SQL
                    op_map = {
                        "is": "=", "=": "=", ">": ">", "<": "<", 
                        ">=": ">=", "<=": "<=", "!=": "!=",
                        "contains": "LIKE", "starts with": "LIKE", "ends with": "LIKE"
                    }
                    
                    sql_op = op_map.get(op, "=")
                    
                    # Format value based on operator
                    if sql_op == "LIKE":
                        if op == "contains":
                            value = f"'%{value}%'"
                        elif op == "starts with":
                            value = f"'{value}%'"
                        elif op == "ends with":
                            value = f"'%{value}'"
                    elif not value.isdigit():
                        value = f"'{value}'"
                    
                    conditions.append(f"{field} {sql_op} {value}")
            
            # Build the SQL query
            sql = f"SELECT {select_clause} FROM {table_name}"
            
            if conditions:
                sql += " WHERE " + " AND ".join(conditions)
            
            # Add sort if specified
            if entities['sort'] and entities['sort']['field'] in column_names:
                sql += f" ORDER BY {entities['sort']['field']} {entities['sort']['order'].upper()}"
            
            # Add limit
            sql += f" LIMIT {entities['limit']}"
            
            return sql
            
        except Exception as e:
            print(f"Error in NLP processing: {e}")
            # Fall back to basic pattern matching if NLP fails
            return self._basic_translate_to_sql(query, table_name, column_names)
    
    def _basic_translate_to_sql(self, query: str, table_name: str, column_names: List[str]) -> str:
        """Basic pattern matching fallback for query translation."""
        # Basic query patterns
        if re.search(r'\b(show|list|get|display|all)\b', query, re.IGNORECASE):
            return f"SELECT * FROM {table_name} LIMIT 10"
        
        if re.search(r'\b(count|how many)\b', query, re.IGNORECASE):
            return f"SELECT COUNT(*) FROM {table_name}"
        
        # Look for specific column mentions
        mentioned_columns = []
        for col in column_names:
            if col.lower() in query.lower():
                mentioned_columns.append(col)
        
        # Look for conditions
        conditions = []
        
        # Check for specific value conditions
        value_pattern = r'where\s+(\w+)\s+(is|=|>|<|>=|<=|!=)\s+(["\w\s]+)'
        value_matches = re.findall(value_pattern, query, re.IGNORECASE)
        
        for match in value_matches:
            col, op, val = match
            if col in column_names:
                # Handle string values
                if val.startswith('"') and val.endswith('"'):
                    val = val
                elif not val.isdigit():
                    val = f"'{val}'"
                
                op_map = {"is": "=", "=": "=", ">": ">", "<": "<", ">=": ">=", "<=": "<=", "!=": "!="}
                conditions.append(f"{col} {op_map.get(op, '=')} {val}")
        
        # Build the final query
        if mentioned_columns:
            select_clause = ", ".join(mentioned_columns)
        else:
            select_clause = "*"
        
        sql = f"SELECT {select_clause} FROM {table_name}"
        
        if conditions:
            sql += " WHERE " + " AND ".join(conditions)
        
        sql += " LIMIT 20"  # Safety limit
        return sql
    
    def execute_query(self, sql: str) -> List[Dict[str, Any]]:
        """Execute query against Prisma database."""
        try:
            # Extract the table name and conditions from SQL
            table_name = self.selected_table.lower()
            
            # Create a temporary script to query Prisma
            temp_script = os.path.join(self.project_root, "scripts", "temp_prisma_query.js")
            
            # Parse SQL to create Prisma query
            where_clause = ""
            limit_clause = "20"
            order_clause = ""
            
            if "WHERE" in sql:
                where_part = sql.split("WHERE")[1].split("LIMIT")[0].strip()
                if "ORDER BY" in where_part:
                    where_part = where_part.split("ORDER BY")[0].strip()
                
                conditions = []
                
                # Convert SQL conditions to Prisma format
                for condition in where_part.split("AND"):
                    condition = condition.strip()
                    if "=" in condition:
                        field, value = condition.split("=")
                        field = field.strip()
                        value = value.strip()
                        if value.startswith("'") and value.endswith("'"):
                            value = value[1:-1]  # Remove quotes
                            # Check if this is a date/time value
                            if re.match(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}', value):
                                conditions.append(f'{field}: new Date("{value}")')
                            else:
                                conditions.append(f'{field}: "{value}"')
                        else:
                            conditions.append(f'{field}: {value}')
                    elif ">" in condition:
                        if ">=" in condition:
                            field, value = condition.split(">=")
                            field = field.strip()
                            value = value.strip()
                            if value.startswith("'") and value.endswith("'"):
                                value = value[1:-1]  # Remove quotes
                                if re.match(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}', value):
                                    conditions.append(f'{field}: {{ gte: new Date("{value}") }}')
                                else:
                                    conditions.append(f'{field}: {{ gte: "{value}" }}')
                            else:
                                conditions.append(f'{field}: {{ gte: {value} }}')
                        else:
                            field, value = condition.split(">")
                            field = field.strip()
                            value = value.strip()
                            if value.startswith("'") and value.endswith("'"):
                                value = value[1:-1]  # Remove quotes
                                if re.match(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}', value):
                                    conditions.append(f'{field}: {{ gt: new Date("{value}") }}')
                                else:
                                    conditions.append(f'{field}: {{ gt: "{value}" }}')
                            else:
                                conditions.append(f'{field}: {{ gt: {value} }}')
                    elif "<" in condition:
                        if "<=" in condition:
                            field, value = condition.split("<=")
                            field = field.strip()
                            value = value.strip()
                            if value.startswith("'") and value.endswith("'"):
                                value = value[1:-1]  # Remove quotes
                                if re.match(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}', value):
                                    conditions.append(f'{field}: {{ lte: new Date("{value}") }}')
                                else:
                                    conditions.append(f'{field}: {{ lte: "{value}" }}')
                            else:
                                conditions.append(f'{field}: {{ lte: {value} }}')
                        else:
                            field, value = condition.split("<")
                            field = field.strip()
                            value = value.strip()
                            if value.startswith("'") and value.endswith("'"):
                                value = value[1:-1]  # Remove quotes
                                if re.match(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}', value):
                                    conditions.append(f'{field}: {{ lt: new Date("{value}") }}')
                                else:
                                    conditions.append(f'{field}: {{ lt: "{value}" }}')
                            else:
                                conditions.append(f'{field}: {{ lt: {value} }}')
                    elif "LIKE" in condition:
                        field, value = condition.split("LIKE")
                        field = field.strip()
                        value = value.strip()
                        if value.startswith("'%") and value.endswith("%'"):
                            # contains
                            value = value[2:-2]  # Remove '%' and quotes
                            conditions.append(f'{field}: {{ contains: "{value}" }}')
                        elif value.startswith("'") and value.endswith("%'"):
                            # starts with
                            value = value[1:-2]  # Remove '%' and quotes
                            conditions.append(f'{field}: {{ startsWith: "{value}" }}')
                        elif value.startswith("'%") and value.endswith("'"):
                            # ends with
                            value = value[2:-1]  # Remove '%' and quotes
                            conditions.append(f'{field}: {{ endsWith: "{value}" }}')
                
                if conditions:
                    where_clause = ", ".join(conditions)
            
            # Extract ORDER BY
            if "ORDER BY" in sql:
                order_part = sql.split("ORDER BY")[1].split("LIMIT")[0].strip()
                field, direction = order_part.split()
                order_clause = f'orderBy: {{ {field}: "{direction.lower()}" }},'
            
            # Extract LIMIT
            if "LIMIT" in sql:
                limit_clause = sql.split("LIMIT")[1].strip()
            
            with open(temp_script, "w") as f:
                f.write(f"""
                const {{ PrismaClient }} = require('@prisma/client');
                const prisma = new PrismaClient();

                async function executeQuery() {{
                    try {{
                        const results = await prisma.{table_name}.findMany({{
                            {f'where: {{ {where_clause} }},' if where_clause else ''}
                            {order_clause}
                            take: {limit_clause}
                        }});
                        
                        if (results.length === 0) {{
                            console.log(JSON.stringify({{ noData: true, tableName: "{table_name}" }}));
                        }} else {{
                            console.log(JSON.stringify(results));
                        }}
                    }} catch (error) {{
                        console.error(error);
                        console.log('[]');
                    }} finally {{
                        await prisma.$disconnect();
                    }}
                }}

                executeQuery();
                """)
            
            # Execute the script
            result = subprocess.run(["node", temp_script], capture_output=True, text=True, cwd=self.project_root)
            os.remove(temp_script)
            
            if result.returncode == 0:
                data = json.loads(result.stdout.strip())
                # Check if the response indicates no data
                if isinstance(data, dict) and data.get('noData'):
                    print(f"No data found in table '{data.get('tableName')}'")
                    return []
                return data
            else:
                print(f"Error executing query: {result.stderr}")
                return []
        except Exception as e:
            print(f"Error executing query: {e}")
            return []
    
    def process_input(self, user_input: str):
        """Process user input and return results."""
        # Check for tag-based selection
        tag = self.process_tag(user_input)
        if tag:
            print(f"Selected table: {tag}")
            # Instead of showing schema, show sample data
            print(f"Fetching data from {tag}...")
            results = self.execute_query(f"SELECT * FROM {tag.lower()} LIMIT 5")
            if results:
                print("\nSample data:")
                for i, row in enumerate(results):
                    print(f"\nRow {i+1}:")
                    for key, value in row.items():
                        print(f"  {key}: {value}")
            else:
                print(f"No data found in {tag}")
            return
        
        # If no table is selected, prompt user
        if not self.selected_table:
            print("Please select a table using @TableName first.")
            print(f"Available tables: {', '.join(self.available_tables)}")
            return
        
        # Translate and execute query
        sql = self.translate_to_sql(user_input)
        print(f"Translated SQL: {sql}")
        
        results = self.execute_query(sql)
        if results:
            print("\nResults:")
            for i, row in enumerate(results):
                print(f"\nRow {i+1}:")
                for key, value in row.items():
                    print(f"  {key}: {value}")
        else:
            print("No results found or error in query.")

def main():
    parser = argparse.ArgumentParser(description='Natural Language Query Agent for Prisma DB')
    parser.add_argument('--server_url', type=str, help='Next.js Server URL', 
                        default="http://localhost:3000")
    args = parser.parse_args()
    
    agent = PrismaDBAgent(args.server_url)
    agent.connect()
    
    print("Welcome to the Prisma DB Query Agent!")
    print("Available tables: " + ", ".join(agent.available_tables))
    print("Use @TableName to select a table, then enter your query.")
    print("Examples:")
    print("  - 'Show all items'")
    print("  - 'How many sections are there?'")
    print("  - 'Find items where quantity is greater than 10'")
    print("  - 'Get items with name containing laptop'")
    print("  - 'List items sorted by quantity desc'")
    print("  - 'Give me details about AuditLog from 13th April 2023 10:00AM to 1:00PM'")
    print("  - 'Show transactions between January 1st 2023 and February 15th 2023'")
    print("Type 'exit' to quit.")
    
    while True:
        user_input = input("\nEnter your query: ")
        if user_input.lower() == 'exit':
            break
        
        agent.process_input(user_input)

if __name__ == "__main__":
    main()