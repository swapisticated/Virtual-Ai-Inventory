import { PrismaClient } from "@prisma/client";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";

// Utility for basic NLP preprocessing
function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);
}

function removeStopwords(tokens: string[]): string[] {
  const stopwords = new Set([
    "the","is","at","which","on","a","an","and","or","in","to","of","for","with","by","as","from","that","this","it","be","are","was","were","has","have","had","but","not","so","if","then","than","when","while","about","into","over","after","before","between","during","out","up","down","off","above","below","under","again","further","once"
  ]);
  return tokens.filter(t => !stopwords.has(t));
}

function lemmatize(tokens: string[]): string[] {
  // Very basic lemmatization for demo purposes
  return tokens.map(t => t.replace(/(ing|ed|s)$/g, ""));
}

const intentPatterns = {
  retrieve: ["show", "list", "get", "display", "find", "search", "query", "select", "retrieve", "fetch", "give", "details", "about"],
  count: ["count", "how many", "total", "sum", "number of"],
  filter: ["where", "with", "filter", "having", "contain", "match", "from", "to", "between"],
  sort: ["sort", "order", "arrange", "rank"],
  limit: ["limit", "top", "first", "last", "recent"]
};

const fieldMappings = {
  inventoryitem: {
    name: ["name", "title", "label", "item name", "product name"],
    quantity: ["quantity", "amount", "count", "number", "stock"],
    location: ["location", "place", "where", "position", "stored"],
    sku: ["sku", "code", "item code", "product code", "id code"],
    createdAt: ["created", "creation date", "date created", "when created"]
  },
  inventorysection: {
    name: ["name", "section name", "category", "group"],
    description: ["description", "details", "info", "about"]
  },
  auditlog: {
    action: ["action", "activity", "operation", "event"],
    userId: ["user", "user id", "person", "who"],
    timestamp: ["time", "date", "when", "timestamp", "occurred", "happened"],
    details: ["details", "information", "data", "description"]
  },
  stocktransaction: {
    type: ["type", "transaction type", "kind"],
    quantity: ["quantity", "amount", "count", "number"],
    itemId: ["item", "product", "item id"],
    timestamp: ["time", "date", "when", "timestamp"]
  }
};

const datePatterns = [
  /\d{4}-\d{1,2}-\d{1,2}/g, // ISO
  /\d{1,2}\/\d{1,2}\/\d{4}/g, // US
  /\d{1,2}(st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/gi, // Text
  /\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/gi // Short text
];
const timePatterns = [
  /\d{1,2}:\d{2}(?::\d{2})?/g, // 24h
  /\d{1,2}:\d{2}(?::\d{2})?\s*(AM|PM)/gi // 12h
];

export class PrismaDBAgent {
  private prisma: PrismaClient;
  private availableTables = ["AuditLog", "InventoryItem", "InventorySection", "StockTransaction"];
  private selectedTable: string | null = null;
  private fieldMappings = fieldMappings;
  private intentPatterns = intentPatterns;
  private datePatterns = datePatterns;
  private timePatterns = timePatterns;
  private llm: OpenAI | null = null;
  private nlpChain: LLMChain | null = null;

  constructor() {
    this.prisma = new PrismaClient();
    try {
      this.llm = new OpenAI({ temperature: 0 });
      const prompt = new PromptTemplate({
        template: "Given the following user query, extract the intent, entities, and generate a SQL query for the table {tableName} with columns {columns}. Query: {query}",
        inputVariables: ["query", "tableName", "columns"]
      });
      this.nlpChain = new LLMChain({ llm: this.llm, prompt });
    } catch (e) {
      console.warn("LangChain LLM initialization failed:", e);
    }
  }

  async connect(): Promise<boolean> {
    try {
      await this.prisma.$connect();
      console.log("Connected to the database successfully.");
      return true;
    } catch (e) {
      console.error("Error connecting to the database:", e);
      return false;
    }
  }

  async getTableSchema(tableName: string): Promise<{ name: string; type: string }[]> {
    try {
      const record = await (this.prisma as any)[tableName.charAt(0).toLowerCase() + tableName.slice(1)].findFirst();
      if (!record) return [];
      return Object.keys(record).map((key) => ({ name: key, type: typeof record[key] }));
    } catch (e) {
      console.error("Error getting schema:", e);
      return [];
    }
  }

  processTag(inputText: string): string | null {
    const tagPattern = /@(\w+)/g;
    const matches = inputText.match(tagPattern);
    if (!matches) return null;
    for (const match of matches) {
      const tag = match.replace("@", "");
      if (this.availableTables.includes(tag)) {
        this.selectedTable = tag;
        return tag;
      }
    }
    return null;
  }

  extractDatetimeRanges(query: string): {
    start_date: string | null;
    end_date: string | null;
    start_time: string | null;
    end_time: string | null;
  } {
    let result = {
      start_date: null as string | null,
      end_date: null as string | null,
      start_time: null as string | null,
      end_time: null as string | null
    };
    let dates: string[] = [];
    for (const pattern of this.datePatterns) {
      const matches = query.match(pattern);
      if (matches) dates.push(...matches);
    }
    let times: string[] = [];
    for (const pattern of this.timePatterns) {
      const matches = query.match(pattern);
      if (matches) times.push(...matches);
    }
    const fromToPattern = /from\s+(.*?)\s+to\s+(.*?)(\.|$)/i;
    const betweenPattern = /between\s+(.*?)\s+and\s+(.*?)(\.|$)/i;
    const fromToMatch = query.match(fromToPattern);
    const betweenMatch = query.match(betweenPattern);
    let startText = '', endText = '';
    if (fromToMatch) {
      startText = fromToMatch[1];
      endText = fromToMatch[2];
    } else if (betweenMatch) {
      startText = betweenMatch[1];
      endText = betweenMatch[2];
    }
    if (startText && endText) {
      let startDate = null, startTime = null, endDate = null, endTime = null;
      for (const pattern of this.datePatterns) {
        const match = startText.match(pattern);
        if (match) { startDate = match[0]; break; }
      }
      for (const pattern of this.timePatterns) {
        const match = startText.match(pattern);
        if (match) { startTime = match[0]; break; }
      }
      for (const pattern of this.datePatterns) {
        const match = endText.match(pattern);
        if (match) { endDate = match[0]; break; }
      }
      for (const pattern of this.timePatterns) {
        const match = endText.match(pattern);
        if (match) { endTime = match[0]; break; }
      }
      if (endTime && !endDate && startDate) endDate = startDate;
      result = { start_date: startDate, end_date: endDate, start_time: startTime, end_time: endTime };
    }
    return result;
  }

  preprocessQuery(query: string): string[] {
    const tokens = tokenize(query);
    const filtered = removeStopwords(tokens);
    return lemmatize(filtered);
  }

  extractIntent(tokens: string[]): string | null {
    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      for (const pattern of patterns) {
        if (tokens.includes(pattern)) return intent;
      }
    }
    return null;
  }

  extractEntities(tokens: string[], table: string): { [key: string]: string } {
    const mapping = this.fieldMappings[table.toLowerCase()];
    const entities: { [key: string]: string } = {};
    for (const [field, synonyms] of Object.entries(mapping)) {
      for (const synonym of synonyms) {
        if (tokens.includes(synonym)) {
          entities[field] = synonym;
          break;
        }
      }
    }
    return entities;
  }

  async basicTranslateToSQL(query: string, tableName: string, columnNames: string[]): Promise<string> {
    const tokens = this.preprocessQuery(query);
    const intent = this.extractIntent(tokens) || "retrieve";
    let sql = "";
    if (intent === "retrieve") {
      sql = `SELECT * FROM ${tableName} LIMIT 10`;
    } else if (intent === "count") {
      sql = `SELECT COUNT(*) FROM ${tableName}`;
    } else {
      sql = `SELECT * FROM ${tableName}`;
    }
    // Add WHERE clause if filter detected
    if (intent === "filter" || /where|with|filter|having|contain|match|from|to|between/.test(query)) {
      // Very basic: look for column=value pattern
      const whereMatch = query.match(/where\s+(\w+)\s*(=|is|>|<|>=|<=|!=)\s*(["'\w\s]+)/i);
      if (whereMatch) {
        let [, col, op, val] = whereMatch;
        if (!/^[\d.]+$/.test(val)) val = `'${val.trim()}'`;
        sql += ` WHERE ${col} ${op} ${val}`;
      }
    }
    return sql;
  }

  async generateSQLWithLLM(query: string, tableName: string, columns: string[]): Promise<string> {
    if (!this.nlpChain) return "";
    const input = { query, tableName, columns: columns.join(", ") };
    const result = await this.nlpChain.call(input);
    return result.text || "";
  }

  // Add more methods as needed to mirror the Python agent's capabilities
}